/**
 * Standalone tests for ComponentCache (Task 10025).
 * Run from repo root: node code/test/phase1/frontend/test_component_cache.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ComponentCache = require('../../../src/phase1/frontend/component_cache');

const CACHE_FILE_NAME = 'components-chacke.json';

let passed = 0;
let failed = 0;

function check(condition, name) {
  if (condition) {
    passed++;
    console.log('[PASS]', name);
    return true;
  }
  failed++;
  console.log('[FAIL]', name);
  return false;
}

function make_component(id, modified_at, text) {
  return {
    object_id: id,
    size: { height: 100, width: 50 },
    page_position: { x: 1, y: 2 },
    page_index: 0,
    layers: [{
      layer_id: 'bg',
      layer_type: 'text',
      position: { x: 0, y: 0 },
      index: 0,
      colour: '#222222',
      opacity: 1,
      text: text || 'hello-' + id
    }],
    modified_at
  };
}

function cache_path_for(cc) {
  return path.join(cc.cache_dir, cc.cache_file);
}

function read_cache(cc) {
  return JSON.parse(fs.readFileSync(cache_path_for(cc), 'utf-8'));
}

function main() {
  const root = path.join(os.tmpdir(), 'crescent_cc_' + Date.now() + '_' + Math.random().toString(36).slice(2));
  fs.mkdirSync(root, { recursive: true });

  // ------------------------------------------------------------------
  // 1. Disabled fallback: no tracker folder -> normal send, no caching.
  // ------------------------------------------------------------------
  {
    const cc = new ComponentCache({ cache_dir: path.join(root, 't1') });
    check(cc.is_enabled() === false, '1. tracker missing -> optimisation is OFF');
    const obj = { object_id: 'plain', size: { height: 1, width: 2 }, layers: [], modified_at: 1000 };
    const result = cc.resolve_component(obj);
    check(result.type === 'normal', '1. disabled fallback returns type normal');
    check(result.component && result.component.object_id === 'plain',
      '1. normal path carries the serialized component');
    check(!fs.existsSync(cache_path_for(cc)), '1. no cache file is written while disabled');
  }

  // ------------------------------------------------------------------
  // 2. After enable(): first resolve is an update and stores to cache JSON.
  // ------------------------------------------------------------------
  {
    const cc = new ComponentCache({ cache_dir: path.join(root, 't2') });
    cc.enable();
    check(cc.is_enabled() === true, '2. enable() turns the optimisation on');
    const first = cc.resolve_component(make_component('btn', 1000, 'press'));
    check(first.type === 'update', '2. first resolve of a fresh component returns update');
    check(first.id === 'btn', '2. update payload carries the object id');
    check(first.index === 0, '2. update payload carries the object index');
    check(fs.existsSync(path.join(cc.cache_dir, CACHE_FILE_NAME)),
      '2. cache file components-chacke.json is created');
    const data = read_cache(cc);
    check(Array.isArray(data) && data.length === 1 && data[0].id === 'btn',
      '2. cache stores exactly one entry under id btn');
    check(typeof data[0].stored_at === 'number' && data[0].component.object_id === 'btn',
      '2. entry has stored_at and the serialized component');
  }

  // ------------------------------------------------------------------
  // 3. Same object, same (older) modified_at -> reuse (id only).
  // ------------------------------------------------------------------
  {
    const cc = new ComponentCache({ cache_dir: path.join(root, 't3') });
    cc.enable();
    cc.resolve_component(make_component('card', 500)); // stored_at = now
    const second = cc.resolve_component(make_component('card', 500));
    check(second.type === 'reuse', '3. unchanged component resolves to reuse');
    check(second.id === 'card' && second.component === undefined,
      '3. reuse payload only sends the id (no component)');
    check(cc.get_cached('card') !== null, '3. component remains in the cache');
  }

  // ------------------------------------------------------------------
  // 4. Edit scenario: same id, newer modified_at -> update + refresh cache.
  // ------------------------------------------------------------------
  {
    const cc = new ComponentCache({ cache_dir: path.join(root, 't4') });
    cc.enable();
    cc.resolve_component(make_component('hero', 500, 'v1'));
    const fresh = cc.resolve_component(make_component('hero', Date.now() + 86400000, 'v2'));
    check(fresh.type === 'update', '4. edited component resolves to update');
    check(fresh.id === 'hero', '4. update carries the same id');
    const after = read_cache(cc);
    check(after.length === 1 && after[0].id === 'hero',
      '4. cache still holds a single entry for the id');
    check(JSON.stringify(after[0].component).indexOf('v2') !== -1,
      '4. cache was refreshed with the new component data');
  }

  // ------------------------------------------------------------------
  // 5. build_page_payload with 2 components -> reuse/update appropriately.
  // ------------------------------------------------------------------
  {
    const cc = new ComponentCache({ cache_dir: path.join(root, 't5') });
    cc.enable();
    cc.resolve_component(make_component('a', 1000, 'aa'));
    cc.resolve_component(make_component('b', 1000, 'bb'));
    const page = {
      objects: [make_component('a', 1000, 'aa'), make_component('c', 1000, 'cc')],
      position: { a: { x: -5, y: 4 }, c: { x: 2, y: -2 } },
      index: { a: 0, c: 1 }
    };
    const payload = cc.build_page_payload(page);
    check(Array.isArray(payload.components) && payload.components.length === 2,
      '5. page payload resolves each component');
    check(payload.components[0].type === 'reuse', '5. cached+unchanged component is reused');
    check(payload.components[1].type === 'update', '5. uncached component gets an update');
    check(payload.components[0].position.x === -5 && payload.components[0].position.y === 4,
      '5. reuse respects the page position');
    check(payload.components[1].position.x === 2,
      '5. update respects the page position');
  }

  // ------------------------------------------------------------------
  // 6. clear() clears the cache.
  // ------------------------------------------------------------------
  {
    const cc = new ComponentCache({ cache_dir: path.join(root, 't6') });
    cc.enable();
    cc.resolve_component(make_component('gone', 1000, 'x'));
    const filePath = cache_path_for(cc);
    check(fs.existsSync(filePath), '6. cache exists before clear');
    cc.clear();
    check(!fs.existsSync(filePath), '6. clear() removes the cache file');
    check(cc.get_cached('gone') === null, '6. get_cached returns null after clear');
  }

  // ------------------------------------------------------------------
  // cleanup
  // ------------------------------------------------------------------
  try {
    fs.rmSync(root, { recursive: true, force: true });
  } catch (err) {
    // best-effort clean-up
  }

  console.log('');
  console.log(failed === 0
    ? `[ALL PASS] ${passed} passed, ${failed} failed`
    : `[FAILED] ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main();