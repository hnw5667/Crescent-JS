#!/usr/bin/env node
/**
 * Real-browser test: compiles the TypeScript snippet, serves it with the real
 * Crescent.js frontend modules, and renders it in headless Microsoft Edge /
 * Chrome to verify the TS workflow actually draws the page.
 *
 * Usage: node test/browser/test_browser.js
 */

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..', '..');
const BROWSER_DIR = __dirname;
const PORT = 8124;
const BASE = 'http://127.0.0.1:' + PORT;

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('[PASS]', name); }
  catch (err) { failed++; console.log('[FAIL]', name, '->', err.message); }
}

function findBrowser() {
  const candidates = [
    process.env.EDGE_PATH, process.env.CHROME_PATH,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

function waitForServer(url, ms) {
  const start = Date.now();
  return new Promise((res, rej) => {
    (function tick() {
      http.get(url, (r) => { r.resume(); res(); })
        .on('error', () => (Date.now() - start > ms ? rej(new Error('server timeout')) : setTimeout(tick, 150)));
    })();
  });
}

function domResult(dom) {
  const m = /<script type="text\/plain" id="crescent-result">([\s\S]*?)<\/script>/.exec(dom);
  if (!m || !m[1].trim()) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

async function main() {
  const browser = findBrowser();
  test('found a real browser (Edge/Chrome)', () => { if (!browser) throw new Error('none found; set EDGE_PATH/CHROME_PATH'); });
  if (!browser) { process.exit(1); }
  test('dist/test files present (index.html, app.ts)', () => {
    if (!fs.existsSync(path.join(BROWSER_DIR, 'index.html')) || !fs.existsSync(path.join(BROWSER_DIR, 'app.ts'))) {
      throw new Error('missing test files');
    }
  });

  // Build: tsc --noEmit (type-check) + compile + bundle.
  const build = spawnSync(process.execPath, [path.join(BROWSER_DIR, 'build.js')], { encoding: 'utf8', cwd: ROOT });
  test('build.js type-checks and compiles the TS snippet', () => {
    if (build.status !== 0) throw new Error((build.stdout || '') + (build.stderr || ''));
    if (!fs.existsSync(path.join(BROWSER_DIR, 'bundle.js'))) throw new Error('bundle.js not produced');
  });

  const server = spawn(process.execPath, [path.join(BROWSER_DIR, 'serve.js'), String(PORT)], { stdio: 'ignore', cwd: ROOT });
  server.unref();
  await waitForServer(BASE + '/', 10000);

  try {
    const args = [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
      '--disable-extensions', '--virtual-time-budget=5000', '--dump-dom', BASE + '/'
    ];
    const res = spawnSync(browser, args, { encoding: 'utf8', timeout: 120000 });
    const dom = res.stdout || '';
    const r = domResult(dom);
    const state = (r && r.state) || {};
    const counts = (r && r.layerTypeCounts) || {};

    test('snippet rendered the page (__TS_RENDERED__)', () => {
      if (!r || !r.rendered) throw new Error('not rendered -> ' + JSON.stringify(r));
    });
    test('page mounted into #crescent-root', () => {
      if (!r || !r.rootHasChildren) throw new Error('root empty -> ' + JSON.stringify(r));
    });
    test('all 4 layer types rendered in the DOM', () => {
      for (const t of ['text', 'image', 'shape', 'input']) {
        if (!counts[t]) throw new Error('missing layer_type=' + t + ' -> ' + JSON.stringify(counts));
      }
    });
    test('shape layers render SVG (triangle/polygon) and circle', () => {
      if (!r || !r.hasSvg) throw new Error('no svg found');
      if (!counts.shape || counts.shape < 4) throw new Error('expected >=4 shapes, got ' + counts.shape);
    });
    test('text layers render expected text content', () => {
      const texts = r && r.layerTexts ? r.layerTexts : {};
      if (!/Crescent/.test(texts.head_title || '') || !/Everything loads/.test(texts.head_sub || '')) {
        throw new Error('texts=' + JSON.stringify(texts));
      }
    });
    test('list input rendered its elements', () => {
      const labels = r && r.listLabels ? r.listLabels : [];
      for (const el of ['Starter', 'Pro', 'Enterprise']) {
        if (labels.indexOf(el) === -1) throw new Error('list missing ' + el + ' -> ' + JSON.stringify(labels));
      }
    });
    test('global math helpers produced correct results', () => {
      const m = state.math || {};
      if (m.add !== 5 || m.subtract !== 6 || m.multiply !== 20 || m.divide !== 5) {
        throw new Error('math=' + JSON.stringify(m));
      }
      if (m.sqrt !== 4 || m.sin !== 0 || m.cos !== 1) throw new Error('math/tri=' + JSON.stringify(m));
      if (typeof m.timestamp !== 'number' || m.timestamp <= 0) throw new Error('bad timestamp');
    });
    test('all frontend registries populated (layers/objects/pages/transitions/triggers)', () => {
      for (const key of ['layers', 'objects', 'pages', 'transitions', 'triggers']) {
        if (!state[key] || !state[key].length) {
          throw new Error('registry ' + key + ' empty -> ' + JSON.stringify(state));
        }
      }
    });
    test('responsive initialised with a breakpoint and ratios', () => {
      if (!state.hasResponsive) throw new Error('no responsive instance');
      if (!state.breakpoint) throw new Error('no breakpoint -> ' + JSON.stringify(state.breakpoint));
      if (!state.ratios || !state.ratios.height_ratio || !state.ratios.width_ratio) {
        throw new Error('no ratios -> ' + JSON.stringify(state.ratios));
      }
    });
    test('multi-page navigation works (home <-> about)', () => {
      if (state.currentPage !== 'home') throw new Error('currentPage=' + state.currentPage);
      if (state.currentAfterAbout !== 'about') throw new Error('currentAfterAbout=' + state.currentAfterAbout);
      if (state.currentAfterHome !== 'home') throw new Error('currentAfterHome=' + state.currentAfterHome);
    });
    test('transition control: play -> stopping is reflected in is_playing', () => {
      // play() runs async via rAF; ensure stop() was reached and is_playing toggles.
      if (state.transitionPlayingAfterStop !== false) throw new Error('is_playing after stop -> ' + state.transitionPlayingAfterStop);
    });
    test('click trigger fired, condition ran, true_sequence executed', () => {
      if (state.clickedFlag !== true) throw new Error('clickedFlag=' + state.clickedFlag);
      if (state.titleColourAfterClick !== '0,120,80') {
        throw new Error('title colour after trigger=' + state.titleColourAfterClick);
      }
    });
    test('page was registered and titled', () => {
      if (!r || r.title !== 'Crescent - Home' || (r.pages || []).indexOf('home') === -1) {
        throw new Error('title/pages -> ' + JSON.stringify(r));
      }
    });

    if (failed === 0) {
      console.log('\n  Verified: comprehensive TS page type-checked, compiled and rendered in a real browser.');
    }
  } finally {
    try { server.kill('SIGKILL'); } catch (e) {}
  }

  console.log('');
  console.log(failed === 0 ? '[ALL PASS] ' + passed + ' passed, ' + failed + ' failed'
    : '[FAILED] ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });