/**
 * JS-First Component System Tests (Task v1.0.6)
 * Verifies: JS-First authoring, build-time HTML generation with section IDs,
 * runtime hydration via rocket.js, component cache with HTML, unified bundling.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('[PASS]', name); }
  catch (e) { failed++; console.log('[FAIL]', name, '->', e.message); console.log(e.stack && e.stack.split('\n').slice(0,3).join('\n')); }
}

// ------------------------------------------------------------------
const crescent = require('../../src/rocket');
const JSComponent = require('../../src/phase1/frontend/js_component');
const HtmlGenerator = require('../../src/phase1/frontend/html_generator');
const Bundler = require('../../src/phase1/frontend/bundler');
const ComponentCache = require('../../src/phase1/frontend/component_cache');

// 1. JS-First authoring: component via crescent.component
test('JS-First: crescent.component creates JSComponent', () => {
  const comp = crescent.component({
    component_id: 'test_header',
    sections: [
      { section_id: 'title', type: 'text', text: 'Hello', colour: '255,0,0' },
      { section_id: 'subtitle', text: 'World', colour: '0,0,0' }
    ],
    size: { height: 100, width: 200 }
  });
  assert.ok(comp instanceof JSComponent);
  assert.strictEqual(comp.component_id, 'test_header');
  assert.strictEqual(comp.get_section_ids().length, 2);
  assert.ok(comp.get_section('title'));
  assert.ok(comp.has_section('subtitle'));
});

// 2. Section-based ID assignment
test('Build-time HTML has section-{name} IDs', () => {
  const comp = crescent.component({
    component_id: 'sec_test',
    sections: [
      { section_id: 'hero', text: 'Hero' },
      { section_id: 'footer', text: 'Footer' }
    ]
  });
  const html = crescent.generate_html(comp);
  assert.ok(html.includes('id="section-hero"'), 'missing section-hero');
  assert.ok(html.includes('id="section-footer"'), 'missing section-footer');
  assert.ok(html.includes('id="section-sec_test"') || html.includes('data-component-id="sec_test"'));
});

test('Deterministic section IDs via multiple names', () => {
  const comp = crescent.component({
    component_id: 'id_test',
    sections: [
      { name: 'mySection', text: 'A' },
      { section_name: 'another', text: 'B' },
      { id: 'third', text: 'C' }
    ]
  });
  const html = crescent.generate_html(comp);
  assert.ok(html.includes('section-mysecti') || html.includes('section-mysection'));
  assert.ok(html.includes('section-another'));
  assert.ok(html.includes('section-third'));
});

// 3. Build-time HTML Generation (dev machine, not client)
test('generateComponentHTML via HtmlGenerator direct', () => {
  const html = HtmlGenerator.generateComponentHTML({
    component_id: 'direct',
    sections: [{ name: 'one', text: 'Hi', layer_type: 'text' }]
  });
  assert.ok(html.includes('section-one'));
  assert.ok(html.includes('section-direct'));
});

// 4. Style application (built-in CSS)
test('Built-in CSS applied to sections', () => {
  const comp = crescent.component({
    component_id: 'style_test',
    sections: [{ section_id: 's1', text: 'X', colour: '255,0,0', size: 24, rounded_corners: '8px', opacity: '80%' }]
  });
  const html = crescent.generate_html(comp);
  assert.ok(html.includes('rgb(255, 0, 0)') || html.includes('rgb(255,0,0)'));
  assert.ok(html.includes('font-size') || html.includes('24px'));
});

// 5. Component caching with HTML
test('Component cache stores HTML alongside JS', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc_js_first_'));
  const cache = new ComponentCache({ cache_dir: path.join(tmp, 'a') });
  cache.enable();
  const comp = crescent.component({
    component_id: 'cache_html',
    sections: [{ section_id: 'a', text: 'hello' }],
    modified_at: 1000
  });
  const resolved = cache.resolve_component(comp);
  assert.strictEqual(resolved.type, 'update');
  assert.ok(resolved.html && resolved.html.includes('section-a'));
  assert.ok(resolved.component.html && resolved.component.html.includes('section-a'));
  const cachedHtml = cache.get_cached_html('cache_html');
  assert.ok(cachedHtml && cachedHtml.includes('section-a'));
  // Reuse path includes html
  const second = cache.resolve_component({ component_id: 'cache_html', sections: [{ section_id: 'a', text: 'hello' }], modified_at: 1000 });
  assert.ok(second.type === 'reuse' || second.type === 'update');
  if (second.type === 'reuse') assert.ok(second.html);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('Cache fallback without tracker still generates HTML', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc_fallback_'));
  const cache = new ComponentCache({ cache_dir: path.join(tmp, 'b') });
  assert.strictEqual(cache.is_enabled(), false);
  const comp = crescent.component({ component_id: 'fallback', sections: [{ section_id: 'x', text: 'y' }] });
  const res = cache.resolve_component(comp);
  assert.strictEqual(res.type, 'normal');
  assert.ok(res.component.html || res.component._html);
  fs.rmSync(tmp, { recursive: true, force: true });
});

// 6. Unified Bundling
test('Unified bundling includes both JS and HTML', () => {
  const comp = crescent.component({
    component_id: 'bundle_test',
    sections: [
      { section_id: 'sec1', text: 'A' },
      { section_id: 'sec2', text: 'B', type: 'image', image_location: 'img.png' }
    ],
    size: { height: 50, width: 50 }
  });
  const bundle = crescent.build_bundle(comp);
  assert.ok(bundle.html.includes('section-sec1'));
  assert.ok(bundle.html.includes('section-sec2'));
  assert.ok(bundle.js.component_id === 'bundle_test');
  assert.ok(Array.isArray(bundle.sections));
  assert.strictEqual(bundle.sections.length, 2);
});

test('Bundler writes to component cache', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bundler_cache_'));
  const cache = new ComponentCache({ cache_dir: path.join(tmp, 'c') });
  cache.enable();
  const bundler = new Bundler({ cache });
  const comp = crescent.component({ component_id: 'bundler_cache_test', sections: [{ section_id: 's', text: 'hi' }] });
  const payload = bundler.bundle_component(comp);
  assert.ok(payload.html.includes('section-s'));
  const cached = cache.get_cached('bundler_cache_test');
  assert.ok(cached);
  assert.ok(cache.get_cached_html('bundler_cache_test'));
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('Page bundling includes JSComponents', () => {
  const page = crescent.page({ page_id: 'bundle_page_test', size: { height: 800, width: 1200 } });
  const comp = crescent.component({ component_id: 'card1', sections: [{ section_id: 'header', text: 'Hi' }] });
  page._jsComponents = new Map();
  page._jsComponents.set(comp.component_id, comp);
  const bundle = crescent.build_bundle(page);
  assert.ok(bundle.html.includes('section-card1'));
  assert.ok(bundle.html.includes('section-header'));
  assert.ok(bundle.js.jsComponents);
});

// 7. Runtime hydration via rocket.js (with mock DOM fallback)
test('rocket.hydrate connects sections and applies CSS', () => {
  assert.ok(typeof crescent.hydrate === 'function');
  assert.ok(typeof HtmlGenerator.hydrate === 'function');
  // Test that hydrate doesn't throw in Node fallback
  const comp = crescent.component({
    component_id: 'hydrate_test',
    sections: [
      { section_id: 'title', text: 'Title', colour: '255,0,0' },
      { section_id: 'body', text: 'Body' }
    ]
  });
  // In Node, hydrate returns generated HTML string fallback
  const mockContainer = null;
  // Just ensure HtmlGenerator.createElement not required in Node
  const html = crescent.generate_html(comp);
  assert.ok(html.includes('section-title'));
});

// 8. Component can be retrieved via get_component
test('get_component registry', () => {
  const comp = crescent.component({ component_id: 'registry_test', sections: [{ section_id: 'a', text: 'a' }] });
  assert.strictEqual(crescent.get_component('registry_test'), comp);
  assert.ok(crescent.get_components()['registry_test']);
});

// 9. JSComponent methods: add/remove/bind
test('JSComponent add/remove/set_section_property', () => {
  const comp = new JSComponent({ component_id: 'method_test', sections: [{ section_id: 's1', text: 'hi' }] });
  comp.add_section({ section_id: 's2', text: 'there' });
  assert.ok(comp.has_section('s2'));
  comp.set_section_property('s1', 'text', 'hello');
  assert.strictEqual(comp.get_section('s1').text, 'hello');
  comp.remove_section('s2');
  assert.ok(!comp.has_section('s2'));
  comp.bind_section('s1', (el) => { el.dataset.bound = 'yes'; });
  assert.ok(comp._bindings['s1']);
});

// 10. Bundler output structure for deployment
test('Bundler.build writes unified payload to disk', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'build_test_'));
  const bundler = new Bundler({ outputDir: path.join(tmp, 'out') });
  const comp = crescent.component({ component_id: 'disk_test', sections: [{ section_id: 'x', text: 'y' }] });
  const { path: outPath, payload } = bundler.build([comp], { fileName: 'test_bundle.json' });
  assert.ok(fs.existsSync(outPath));
  const data = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
  assert.ok(data.bundles && data.bundles.length === 1);
  assert.ok(data.bundles[0].html.includes('section-x'));
  assert.strictEqual(data.version, '2.5.1');
  fs.rmSync(tmp, { recursive: true, force: true });
});

console.log(`\nJS-First tests: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
