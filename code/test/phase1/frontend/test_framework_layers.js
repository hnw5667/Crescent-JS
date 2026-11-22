/**
 * Framework Layer Tests (v2.7.0)
 * Verifies: react/angular layers via layer_id + code, MULTIPLE layers per
 * framework (<framework>:<name> ids), UNIQUE mount ids, parseFrameworkId,
 * run-time mount() contract (component functions, compile hook, inert
 * strings), fit optimisation, overflow errors, build-time HTML, validation.
 */

const assert = require('assert');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('[PASS]', name); }
  catch (e) { failed++; console.log('[FAIL]', name, '->', e.message); console.log((e.stack || '').split('\n').slice(0, 4).join('\n')); }
}

// ---------- minimal fake DOM (headless, like the render smoke test) ----------
function matchSelector(el, sel) {
  const attr = /^\[([\w-]+)(?:="([^"]*)")?\]$/.exec(sel);
  if (attr) {
    const val = el.attributes[attr[1]] !== undefined
      ? el.attributes[attr[1]]
      : (el.dataset && el.dataset[attr[1]] !== undefined ? el.dataset[attr[1]] : undefined);
    if (val === undefined) return attr[2] === undefined;
    return attr[2] === undefined || String(val) === attr[2];
  }
  return el.tagName === sel;
}

class FakeEl {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.textContent = '';
    this.parentNode = null;
    this.scrollWidth = 0;
    this.scrollHeight = 0;
    this.clientWidth = 0;
    this.clientHeight = 0;
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  removeChild(c) {
    const i = this.children.indexOf(c);
    if (i !== -1) this.children.splice(i, 1);
    c.parentNode = null;
    return c;
  }
  get firstChild() { return this.children[0] || null; }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  querySelectorAll(sel) {
    const out = [];
    (function walk(el) {
      for (const c of el.children) {
        if (matchSelector(c, sel)) out.push(c);
        walk(c);
      }
    })(this);
    return out;
  }
}

global.document = { createElement: (t) => new FakeEl(t) };

const crescent = require('../../../src/rocket');
const FrameworkLayer = require('../../../src/phase1/frontend/framework_layer');
const HtmlGenerator = require('../../../src/phase1/frontend/html_generator');
const { parseFrameworkId, isFrameworkId, normalizeFrameworkName } = FrameworkLayer;

// ---------- fake React / Angular dependency doubles ----------
function makeReactRecord() {
  return { elements: [], roots: [], rendered: [] };
}
function fakeReact(record) {
  return {
    createElement: (type, props, ...children) => {
      record.elements.push({ type, props });
      return { $reactElement: true, type, props };
    }
  };
}
function fakeReactDom(record) {
  return {
    createRoot: (el) => {
      record.roots.push(el);
      return { render: (tree) => { record.rendered.push({ el, tree }); } };
    }
  };
}

// 1. React layer via layer_id + code
test('crescent.layer creates react FrameworkLayer', () => {
  const layer = crescent.layer({
    layer_type: 'react',
    layer_id: 'react',
    code: 'function App(){ return "hi" }',
    size: { height: 200, width: 300 }
  });
  assert.ok(layer instanceof FrameworkLayer);
  assert.strictEqual(layer.get_framework(), 'react');
  assert.strictEqual(layer.layer_id, 'react');
  assert.strictEqual(layer.layer_type, 'react');
  assert.strictEqual(layer.get_code(), 'function App(){ return "hi" }');
});

// 2. Angular layer
test('crescent.layer creates angular FrameworkLayer', () => {
  const layer = crescent.layer({
    layer_type: 'angular',
    layer_id: 'angular',
    code: '<app-hello></app-hello>',
    size: { height: 100, width: 100 }
  });
  assert.strictEqual(layer.get_framework(), 'angular');
});

// 3. layer_id alone (type omitted) still resolves — bare framework name
test('layer_id as framework name without explicit type still works', () => {
  const layer = new FrameworkLayer({ layer_id: 'React', code: '<h1>x</h1>' });
  assert.strictEqual(layer.get_framework(), 'react');
  assert.strictEqual(layer.layer_id, 'react');
});

// 4. Validation: bad layer_id (updated message, incl. invalid names)
test('rejects non-framework / invalid layer_id', () => {
  assert.throws(
    () => new FrameworkLayer({ layer_id: 'vue', code: 'x' }),
    /layer_id must be 'react', 'angular', or '<framework>:<name>'/
  );
  assert.throws(
    () => new FrameworkLayer({ layer_id: 'vue:app', code: 'x' }),
    /layer_id must be 'react', 'angular', or '<framework>:<name>'/
  );
  assert.throws(
    () => new FrameworkLayer({ layer_id: 'react:bad name!', code: 'x' }),
    /layer_id must be 'react', 'angular', or '<framework>:<name>'/
  );
  assert.throws(
    () => new FrameworkLayer({ layer_id: 'react:', code: 'x' }),
    /layer_id must be 'react', 'angular', or '<framework>:<name>'/
  );
});

// 5. Validation: missing code (string only, or not a mountable form)
test('rejects missing code', () => {
  assert.throws(() => crescent.layer({ layer_type: 'react', layer_id: 'react' }), /requires "code"/);
  assert.throws(() => crescent.layer({ layer_type: 'react', layer_id: 'react', code: '   ' }), /requires "code"/);
  assert.throws(() => new FrameworkLayer({ layer_id: 'react', code: { not: 'component' } }), /requires "code"/);
});

// 6. Validation: type/id mismatch (message kept)
test('rejects layer_type/layer_id mismatch', () => {
  assert.throws(
    () => crescent.layer({ layer_type: 'angular', layer_id: 'react', code: 'x' }),
    /mismatch/
  );
  assert.throws(
    () => crescent.layer({ layer_type: 'angular', layer_id: 'react:hero', code: 'x' }),
    /mismatch/
  );
});

// 7. Fit optimisation: measure_fit
test('measure_fit detects overflow', () => {
  const ok = FrameworkLayer.measure_fit({ width: 300, height: 200 }, { width: 100, height: 100 });
  assert.strictEqual(ok.fits, true);
  const bad = FrameworkLayer.measure_fit({ width: 300, height: 200 }, { width: 400, height: 100 });
  assert.strictEqual(bad.fits, false);
  assert.strictEqual(bad.overflowX, true);
});

// 8. assert_fits throws with helpful error
test('assert_fits throws overflow error', () => {
  const layer = crescent.layer({
    layer_type: 'react', layer_id: 'react',
    code: 'x', size: { height: 50, width: 50 }
  });
  assert.throws(() => layer.assert_fits({ width: 200, height: 200 }), /overflow/);
  assert.doesNotThrow(() => layer.assert_fits({ width: 10, height: 10 }));
});

// 9. parseFrameworkId — the new id grammar
test('parseFrameworkId parses bare framework names', () => {
  assert.deepStrictEqual(parseFrameworkId('react'), { framework: 'react', id: 'react' });
  assert.deepStrictEqual(parseFrameworkId('angular'), { framework: 'angular', id: 'angular' });
  assert.deepStrictEqual(parseFrameworkId('  React '), { framework: 'react', id: 'react' });
  assert.strictEqual(parseFrameworkId('vue'), null);
  assert.strictEqual(parseFrameworkId(42), null);
  assert.strictEqual(parseFrameworkId(''), null);
});

test('parseFrameworkId parses <framework>:<name> ids', () => {
  assert.deepStrictEqual(parseFrameworkId('react:hero'), { framework: 'react', id: 'react:hero' });
  assert.deepStrictEqual(parseFrameworkId('angular:card'), { framework: 'angular', id: 'angular:card' });
  assert.deepStrictEqual(parseFrameworkId('React:Hero'), { framework: 'react', id: 'react:Hero' });
  assert.strictEqual(parseFrameworkId('react:bad name'), null);
  assert.strictEqual(parseFrameworkId('react:'), null);
  // Compatibility aliases still exported.
  assert.strictEqual(typeof normalizeFrameworkName, 'function');
  assert.strictEqual(typeof isFrameworkId, 'function');
  assert.strictEqual(normalizeFrameworkName('React'), 'react');
  assert.strictEqual(normalizeFrameworkName('react'), 'react');
  assert.strictEqual(normalizeFrameworkName('vue'), null);
  assert.strictEqual(normalizeFrameworkName('React:hero'), null); // bare names only
});

// 10. MULTIPLE layers per framework: 'react', 'react:hero', 'angular:card' coexist
test('multiple layers per framework coexist in one object', () => {
  const obj = crescent.object({ object_id: 'multi_fw', size: { height: 400, width: 400 } });
  const a = crescent.layer({ layer_type: 'react', layer_id: 'react', code: 'a' });
  const b = crescent.layer({ layer_type: 'react', layer_id: 'react:hero', code: 'b' });
  const c = crescent.layer({ layer_type: 'angular', layer_id: 'angular:card', code: 'c' });
  obj.add_layer(a);
  obj.add_layer(b);
  obj.add_layer(c);
  assert.ok(obj.get_layer('react'));
  assert.ok(obj.get_layer('react:hero'));
  assert.ok(obj.get_layer('angular:card'));
  assert.strictEqual(obj.get_layer('react:hero'), b);
  // set_layer_position keeps working with the full unique id
  obj.set_layer_position('react:hero', 10, 20);
  assert.deepStrictEqual(obj.position.get('react:hero'), { x: 10, y: 20 });
});

// 11. Unique mount ids per layer_id + framework/layer-id attributes
test('render produces unique mount ids; data-framework is the prefix; data-layer-id the full id', () => {
  const a = new FrameworkLayer({ layer_id: 'react', layer_type: 'react', code: 'a', size: { height: 100, width: 100 } });
  const b = new FrameworkLayer({ layer_id: 'react:hero', layer_type: 'react', code: 'b', size: { height: 100, width: 100 } });
  const c = new FrameworkLayer({ layer_id: 'angular', layer_type: 'angular', code: 'c', size: { height: 100, width: 100 } });
  const ea = a.render(), eb = b.render(), ec = c.render();
  const ma = ea.querySelector('[data-framework-content]');
  const mb = eb.querySelector('[data-framework-content]');
  const mc = ec.querySelector('[data-framework-content]');
  assert.strictEqual(ma.id, 'react-mount');       // backward compatible
  assert.strictEqual(mb.id, 'react-hero-mount');  // unique
  assert.strictEqual(mc.id, 'angular-mount');
  assert.strictEqual(ea.dataset.framework, 'react');
  assert.strictEqual(ea.dataset.layerId, 'react');
  assert.strictEqual(eb.dataset.framework, 'react');
  assert.strictEqual(eb.dataset.layerId, 'react:hero');
  assert.strictEqual(ec.dataset.framework, 'angular');
  assert.strictEqual(ec.dataset.layerId, 'angular');

  const weird = new FrameworkLayer({ layer_id: 'react:my-hero-x', layer_type: 'react', code: 'w', size: { height: 10, width: 10 } });
  const mount = weird.render().querySelector('[data-framework-content]');
  assert.strictEqual(mount.id, 'react-my-hero-x-mount');
});

// 12. mount(): React component function mounts for real with fake deps
test('mount() react component function, fake deps', () => {
  const record = makeReactRecord();
  const layer = new FrameworkLayer({
    layer_id: 'react:hero', layer_type: 'react',
    code: function Hero() { return null; },
    size: { height: 100, width: 100 }
  });
  const el = layer.render();
  const mount = el.querySelector('[data-framework-content]');
  const result = layer.mount(mount, {
    React: fakeReact(record),
    ReactDOM: fakeReactDom(record),
    document: global.document
  });
  assert.strictEqual(result.mounted, true);
  assert.strictEqual(result.framework, 'react');
  assert.strictEqual(result.reason, undefined);
  assert.strictEqual(record.roots.length, 1);
  assert.strictEqual(record.roots[0], mount);
  assert.strictEqual(record.rendered.length, 1);
});

// 13. mount(): { component, props } form
test('mount() accepts { component, props } and forwards props', () => {
  const record = makeReactRecord();
  const layer = new FrameworkLayer({
    layer_id: 'react', layer_type: 'react',
    code: { component: function Hero(props) { return null; }, props: { title: 'Hero' } },
    size: { height: 100, width: 100 }
  });
  const el = layer.render();
  const result = layer.mount(el.querySelector('[data-framework-content]'), {
    React: fakeReact(record),
    ReactDOM: fakeReactDom(record)
  });
  assert.strictEqual(result.mounted, true);
  assert.strictEqual(record.elements.length, 1);
  assert.deepStrictEqual(record.elements[0].props, { title: 'Hero' });
});

// 14. mount(): React component without React/ReactDOM -> graceful failure
test('mount() react component without deps returns mounted:false + reason', () => {
  const layer = new FrameworkLayer({
    layer_id: 'react', layer_type: 'react',
    code: function Hero() { return null; },
    size: { height: 100, width: 100 }
  });
  const el = layer.render();
  const result = layer.mount(el.querySelector('[data-framework-content]'), {});
  assert.strictEqual(result.mounted, false);
  assert.strictEqual(result.reason, 'missing-dependency');
});

// 15. mount(): string code without compile -> inert source preview
test('mount() string without compile stays inert (uncompiled-source)', () => {
  const layer = new FrameworkLayer({
    layer_id: 'react', layer_type: 'react',
    code: 'function App(){ return <h1>Hi</h1> }',
    size: { height: 100, width: 100 }
  });
  const el = layer.render();
  const mount = el.querySelector('[data-framework-content]');
  const result = layer.mount(mount, { document: global.document });
  assert.strictEqual(result.mounted, false);
  assert.strictEqual(result.reason, 'uncompiled-source');
  const preview = mount.querySelector('[data-framework-preview="source"]');
  assert.ok(preview, 'source preview missing');
  assert.strictEqual(preview.textContent, 'function App(){ return <h1>Hi</h1> }');
});

// 16. mount(): compile hook returning a component mounts it
test('mount() compile hook returning a component mounts for real', () => {
  const record = makeReactRecord();
  let saw = null;
  const layer = new FrameworkLayer({
    layer_id: 'react', layer_type: 'react',
    code: 'const App = () => null',
    size: { height: 100, width: 100 },
    compile(code, ctx) {
      saw = { code, ctx };
      return function CompiledApp() { return null; };
    }
  });
  const el = layer.render();
  const mount = el.querySelector('[data-framework-content]');
  const result = layer.mount(mount, {
    React: fakeReact(record), ReactDOM: fakeReactDom(record), document: global.document
  });
  assert.strictEqual(result.mounted, true);
  assert.ok(saw, 'compile hook not called');
  assert.strictEqual(saw.code, 'const App = () => null');
  assert.strictEqual(saw.ctx.framework, 'react');
  assert.strictEqual(saw.ctx.mount, mount);
  assert.ok(saw.ctx.React, 'ctx.React missing');
  assert.ok(saw.ctx.ReactDOM, 'ctx.ReactDOM missing');
  assert.strictEqual(record.rendered.length, 1, 'compiled component not rendered');
});

// 17. mount(): compile hook that mounts itself (no return value) counts as mounted
test('mount() compile hook without return value counts as a mount', () => {
  const layer = new FrameworkLayer({
    layer_id: 'react', layer_type: 'react',
    code: '/* mount by hand inside the hook */',
    size: { height: 100, width: 100 },
    compile() { /* side-effect mount */ }
  });
  const el = layer.render();
  const result = layer.mount(el.querySelector('[data-framework-content]'), { document: global.document });
  assert.strictEqual(result.mounted, true);
});

// 18. mount(): compile hook that throws -> graceful failure, never throws
test('mount() compile failure returns mounted:false with reason', () => {
  const layer = new FrameworkLayer({
    layer_id: 'react', layer_type: 'react',
    code: 'const Broken = () => null',
    size: { height: 100, width: 100 },
    compile() { throw new Error('boom'); }
  });
  const el = layer.render();
  const result = layer.mount(el.querySelector('[data-framework-content]'), { document: global.document });
  assert.strictEqual(result.mounted, false);
  assert.ok(/^compile-failed/.test(result.reason), 'reason: ' + result.reason);
});

// 19. Angular: createComponent/createEnvironmentInjector path with fake deps
test('mount() angular component class with fake deps', () => {
  const layer = new FrameworkLayer({
    layer_id: 'angular:card', layer_type: 'angular',
    code: class CardComponent {},
    size: { height: 100, width: 100 }
  });
  const el = layer.render();
  let envInjectorParent = null;
  const angularCore = { createEnvironmentInjector: (_p, parent) => ({ parent }) };
  const platform = { createComponent: (type, opts) => ({ injector: {}, opts }) };
  const deps = { angularCore, angularPlatformBrowser: platform, document: global.document };
  const result = layer.mount(el.querySelector('[data-framework-content]'), deps);
  assert.strictEqual(result.mounted, true, 'reason: ' + result.reason);
  assert.strictEqual(result.framework, 'angular');
});

// 20. Angular: failing createComponent -> mounted:false, reason, never throws
test('mount() angular failure returns reason and never throws', () => {
  const layer = new FrameworkLayer({
    layer_id: 'angular', layer_type: 'angular',
    code: function NotAnAngularComponent() {},
    size: { height: 100, width: 100 }
  });
  const el = layer.render();
  const result = layer.mount(el.querySelector('[data-framework-content]'), {
    angularCore: { createEnvironmentInjector: () => null },
    angularPlatformBrowser: { createComponent: () => { throw new Error('NG0307 not compiled'); } },
    document: global.document
  });
  assert.strictEqual(result.mounted, false);
  assert.ok(/^angular-mount-failed/.test(result.reason), 'reason: ' + result.reason);
});

// 21. Angular string -> inert, never executed (no angular import attempted)
test('mount() angular string without compile returns uncompiled-source', () => {
  const layer = new FrameworkLayer({
    layer_id: 'angular', layer_type: 'angular',
    code: '<app-hello name="Crescent"></app-hello>',
    size: { height: 100, width: 100 }
  });
  const el = layer.render();
  const result = layer.mount(el.querySelector('[data-framework-content]'), { document: global.document });
  assert.strictEqual(result.mounted, false);
  assert.strictEqual(result.reason, 'uncompiled-source');
});

// 22. render() auto-mounts component-form code using globals
test('render() automatically mounts component code (global React/ReactDOM)', () => {
  const record = makeReactRecord();
  global.React = fakeReact(record);
  global.ReactDOM = fakeReactDom(record);
  try {
    const layer = new FrameworkLayer({
      layer_id: 'react:auto', layer_type: 'react',
      code: function Auto() { return null; },
      size: { height: 100, width: 100 }
    });
    layer.render();
    assert.strictEqual(record.rendered.length, 1, 'render() did not auto-mount');
    assert.strictEqual(layer.mount().mounted, true, 're-mount with recorded target failed');
  } finally {
    delete global.React;
    delete global.ReactDOM;
  }
});

// 23. set_property('code', ...) re-mounts when mountable
test('set_property code re-mounts mountable code', () => {
  const record = makeReactRecord();
  global.React = fakeReact(record);
  global.ReactDOM = fakeReactDom(record);
  try {
    const layer = new FrameworkLayer({
      layer_id: 'react', layer_type: 'react',
      code: 'v1 (string -> inert)',
      size: { height: 100, width: 100 }
    });
    layer.render();
    layer.set_property('code', function Updated() { return null; });
    assert.strictEqual(record.rendered.length, 1, 'set_property did not re-mount');
    // String again goes inert with the new text (no remount teaser).
    layer.set_property('code', 'v2');
    const preview = layer._element.querySelector('[data-framework-preview]');
    assert.strictEqual(preview.textContent, 'v2');
  } finally {
    delete global.React;
    delete global.ReactDOM;
  }
});

// 24. Build-time HTML supports framework layers (unchanged shape)
test('generateSectionHTML supports framework layers', () => {
  const html = HtmlGenerator.generateSectionHTML({
    name: 'react', layer_id: 'react', layer_type: 'react',
    code: '<h1>Hello</h1>', size: { width: 200, height: 100 }
  });
  assert.ok(html.includes('data-framework="react"'), 'missing data-framework');
  assert.ok(html.includes('id="react-mount"'), 'missing mount id');
  assert.ok(html.includes('data-framework-code'), 'missing code holder');
  assert.ok(html.includes('&lt;h1&gt;'), 'code should be escaped');
});

// 25. Build-time HTML: multiple layers per framework -> unique mount ids
test('generateSectionHTML unique mount ids for named layers', () => {
  const plain = HtmlGenerator.generateSectionHTML({
    name: 'react', layer_id: 'react', layer_type: 'react', code: 'a', size: { width: 100, height: 50 }
  });
  const hero = HtmlGenerator.generateSectionHTML({
    name: 'hero', layer_id: 'react:hero', layer_type: 'react', code: 'b', size: { width: 100, height: 50 }
  });
  const angular = HtmlGenerator.generateSectionHTML({
    name: 'card', layer_id: 'angular:card', layer_type: 'angular', code: 'c', size: { width: 100, height: 50 }
  });
  assert.ok(plain.includes('id="react-mount"'));
  assert.ok(hero.includes('id="react-hero-mount"'));
  assert.ok(angular.includes('id="angular-card-mount"'));
  assert.ok(hero.includes('data-framework="react"'));
  assert.ok(hero.includes('data-layer-id="react:hero"'));
  assert.ok(angular.includes('data-layer-id="angular:card"'));
});

// 26. component-level HTML + bundling keep multiple framework sections
test('component + bundle include framework sections with unique ids', () => {
  const comp = crescent.component({
    component_id: 'fw_multi',
    sections: [
      { section_id: 'react', name: 'react', layer_id: 'react', layer_type: 'react', code: 'const a = 1' },
      { section_id: 'hero', name: 'hero', layer_id: 'react:hero', layer_type: 'react', code: 'const b = 2' }
    ]
  });
  const html = crescent.generate_html(comp);
  assert.ok(html.includes('section-react'));
  assert.ok(html.includes('section-hero'));
  assert.ok(html.includes('react-mount'));
  assert.ok(html.includes('react-hero-mount'));
  assert.notStrictEqual(html.indexOf('id="react-mount"'), html.indexOf('id="react-hero-mount"'));
  const bundle = crescent.build_bundle(comp);
  assert.ok(bundle.html.includes('react-hero-mount'));
});

// 27. set_property('code') is safe headless (never rendered)
test('set_property code is safe headless', () => {
  const layer = crescent.layer({
    layer_type: 'angular', layer_id: 'angular', code: 'v1', size: { height: 10, width: 10 }
  });
  layer.set_property('code', 'v2');
  assert.strictEqual(layer.code, 'v2');
});

// 28. devDependencies are declared (react, react-dom, @angular/core)
test('react/angular declared as devDependencies', () => {
  const pkg = require('../../../package.json');
  assert.ok(pkg.devDependencies.react, 'react devDep missing');
  assert.ok(pkg.devDependencies['react-dom'], 'react-dom devDep missing');
  assert.ok(pkg.devDependencies['@angular/core'], '@angular/core devDep missing');
});

// 29. overflow behaviour unchanged for named layers (serialisation etc.)
test('serialize keeps full layer_id and framework prefix', () => {
  const layer = new FrameworkLayer({
    layer_id: 'react:hero', layer_type: 'react', code: 'a', size: { height: 10, width: 10 }
  });
  const el = layer.render();
  const s = layer.serialize();
  assert.strictEqual(s.layer_id, 'react:hero');
  assert.strictEqual(s.framework, 'react');
  assert.strictEqual(s.layer_type, 'react');
  assert.ok(el, 'render returned nothing');
  // Overflow fits-check still works on named layers.
  assert.throws(() => layer.assert_fits({ width: 999, height: 999 }), /overflow/);
});

console.log(`\nFramework layer tests: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
