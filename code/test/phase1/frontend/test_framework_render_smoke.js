/**
 * Minimal fake-DOM smoke test for FrameworkLayer rendering.
 *
 * This is NOT a browser test: it executes the REAL render()/check_overflow()/
 * _show_overflow_error() code paths against a tiny stub document so structural
 * bugs (typos, missing attrs) surface in CI. Real layout/paint is verified by
 * test/browser/framework/test_framework_browser.js in a real browser.
 */

const assert = require('assert');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('[PASS]', name); }
  catch (e) { failed++; console.log('[FAIL]', name, '->', e.message); }
}

// ---------- tiny fake DOM ----------
function matchSelector(el, sel) {
  const attr = /^\[([\w-]+)(?:="([^"]*)")?\]$/.exec(sel);
  if (attr) {
    const val = el.attributes[attr[1]] !== undefined ? el.attributes[attr[1]]
      : (el.dataset && el.dataset[attr[1]] !== undefined ? el.dataset[attr[1]] : undefined);
    if (val === undefined) {
      // dataset.* assignments mirror to attributes for data-* names
      if (attr[1].indexOf('data-') === 0) {
        const key = attr[1].slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        const dv = el.dataset ? el.dataset[key] : undefined;
        if (dv === undefined) return false;
        return attr[2] === undefined || String(dv) === attr[2];
      }
      return false;
    }
    return attr[2] === undefined || String(val) === attr[2];
  }
  return el.tag === sel;
}

class FakeEl {
  constructor(tag) {
    this.tag = tag;
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
  replaceChild(n, o) {
    const i = this.children.indexOf(o);
    if (i !== -1) { this.children[i] = n; n.parentNode = this; }
    return o;
  }
  removeChild(c) {
    const i = this.children.indexOf(c);
    if (i !== -1) this.children.splice(i, 1);
    return c;
  }
  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all.length ? all[0] : null;
  }
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

const FrameworkLayer = require('../../../src/phase1/frontend/framework_layer');

// Capture console.error for the overflow assertion.
const errors = [];
const origError = console.error;
console.error = (...a) => { errors.push(a.join(' ')); };

// ---- 1. Fitting layer renders full structure, no error ----
test('fitting react layer renders box + mount + code holder', () => {
  const layer = new FrameworkLayer({
    layer_id: 'react',
    code: 'function Welcome(){ return "hi"; }',
    size: { height: 160, width: 300 }
  });
  const el = layer.render();
  assert.ok(el, 'render returned nothing');
  assert.strictEqual(el.dataset.layerId, 'react');
  assert.strictEqual(el.dataset.framework, 'react');
  assert.strictEqual(el.style.overflow, 'hidden');
  assert.strictEqual(el.style.width, '300px');
  const mount = el.querySelector('[data-framework-content]');
  assert.ok(mount, 'mount node missing');
  assert.strictEqual(mount.style.maxWidth, '100%');
  const code = el.querySelector('[data-framework-code]');
  assert.ok(code, 'code holder missing');
  assert.ok(code.textContent.indexOf('Welcome') !== -1);
});

test('fitting layer: check_overflow false, no badge', () => {
  const layer = new FrameworkLayer({ layer_id: 'angular', code: '<a></a>', size: { height: 120, width: 300 } });
  const el = layer.render();
  const mount = el.querySelector('[data-framework-content]');
  mount.scrollWidth = 200; mount.clientWidth = 300;
  mount.scrollHeight = 100; mount.clientHeight = 120;
  assert.strictEqual(layer.check_overflow(), false);
  assert.strictEqual(el.querySelector('[data-framework-error]'), null);
});

// ---- 2. Overflowing layer: badge + flag + console error ----
test('overflowing layer shows the red error badge', () => {
  const layer = new FrameworkLayer({
    layer_id: 'react',
    code: 'function TooBig(){ return "x"; }',
    size: { height: 40, width: 80 }
  });
  const el = layer.render();
  const mount = el.querySelector('[data-framework-content]');
  mount.scrollWidth = 300; mount.clientWidth = 80;   // content escapes horizontally
  mount.scrollHeight = 60; mount.clientHeight = 40;
  assert.strictEqual(layer.check_overflow(), true);
  const badge = el.querySelector('[data-framework-error]');
  assert.ok(badge, 'error badge missing');
  assert.ok(/overflow/i.test(badge.textContent), 'badge text wrong: ' + badge.textContent);
  assert.strictEqual(el.dataset.frameworkOverflow, 'true');
  assert.ok(errors.some((m) => /overflow/i.test(m)), 'console.error missing overflow message');
});

test('assert_fits throws the documented overflow error', () => {
  const layer = new FrameworkLayer({ layer_id: 'react', code: 'x', size: { height: 40, width: 80 } });
  assert.throws(() => layer.assert_fits({ width: 300, height: 20 }), /overflow/);
});

test('set_property("code") updates the holder', () => {
  const layer = new FrameworkLayer({ layer_id: 'react', code: 'v1', size: { height: 40, width: 80 } });
  layer.render();
  layer.set_property('code', 'v2-updated');
  const holder = layer._element.querySelector('[data-framework-code]');
  assert.ok(holder && holder.textContent === 'v2-updated');
});

console.error = origError;
console.log(`\nFramework render smoke tests: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
