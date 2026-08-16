#!/usr/bin/env node
/**
 * Builds the in-browser TypeScript test bundle.
 *
 * 1. Type-checks app.ts against index.d.ts with tsc --noEmit.
 * 2. Compiles app.ts to CommonJS JS.
 * 3. Inlines the real Crescent.js frontend modules (src/phase1/frontend/*)
 *    into a single bundle.js that the browser harness loads, and sets up the
 *    global `crescent` frontend singleton the compiled app talks to.
 *
 * Usage: node test/browser/build.js
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const TSC = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const FRONTEND_DIR = path.join(ROOT, 'src', 'phase1', 'frontend');
const OUT = path.join(__dirname, 'bundle.js');

// ---- 1. Type-check the snippet ------------------------------------------
const tsconfig = path.join(__dirname, 'tsconfig.json');
const check = spawnSync(process.execPath, [TSC, '--noEmit', '-p', tsconfig], {
  encoding: 'utf8', cwd: ROOT
});
if (check.status !== 0) {
  console.error('[browser] tsc --noEmit FAILED:\n' + (check.stdout || check.stderr || ''));
  process.exit(1);
}
console.log('[browser] snippet type-checked cleanly (tsc --noEmit)');

// ---- 2. Compile app.ts to CommonJS JS -----------------------------------
const ts = require(path.join(ROOT, 'node_modules', 'typescript'));
const appSrc = fs.readFileSync(path.join(__dirname, 'app.ts'), 'utf8');
const compiled = ts.transpileModule(appSrc, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2019,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true
  },
  fileName: path.join(__dirname, 'app.ts')
}).outputText;

// ---- 3. Inline the real framework frontend modules ----------------------
const modules = {
  'phase1/frontend/base_layer': 'base_layer',
  'phase1/frontend/text_layer': 'text_layer',
  'phase1/frontend/image_layer': 'image_layer',
  'phase1/frontend/shape_layer': 'shape_layer',
  'phase1/frontend/input_layer': 'input_layer',
  'phase1/frontend/object': 'object',
  'phase1/frontend/page': 'page',
  'phase1/frontend/renderer': 'renderer',
  'phase1/frontend/transition': 'transition',
  'phase1/frontend/trigger': 'trigger',
  'phase1/frontend/responsive': 'responsive'
};

let parts = [];
parts.push('(function(){');
parts.push('var __inlined = window.__inlined = { };');
for (const [id, file] of Object.entries(modules)) {
  let src = fs.readFileSync(path.join(FRONTEND_DIR, file + '.js'), 'utf8');
  // Inline relative requires referenced by these modules.
  src = src.replace(/require\('\.\/base_layer'\)/g, '__inlined[String("phase1/frontend/base_layer")]');
  // Modules that reference constructors directly via require get a helper.
  parts.push('__inlined[' + JSON.stringify(id) + '] = (function(){ var module={exports:{}}; (function(require,module,exports){' + src + '})(function(id){ return __inlined[String(id)]; }, module, module.exports); return module.exports; })();');
}
parts.push('})();');

// ---- Expose the global `crescent` frontend singleton (frontend half of rocket.js)
const globalSetup = `
(function(){
  var L = window.__inlined;
  var crescent = {
    _layers: {}, _objects: {}, _pages: {}, _transitions: {}, _triggers: {},
    _responsive: null,
    _renderer: new L['phase1/frontend/renderer'](),
    layer: function(config){
      var inst;
      switch(config.layer_type){
        case 'image': inst = new L['phase1/frontend/image_layer'](config); break;
        case 'shape': inst = new L['phase1/frontend/shape_layer'](config); break;
        case 'text':  inst = new L['phase1/frontend/text_layer'](config); break;
        case 'input': inst = new L['phase1/frontend/input_layer'](config); break;
        default: throw new Error('Unknown layer_type: ' + config.layer_type);
      }
      crescent._layers[config.layer_id] = inst; return inst;
    },
    object: function(config){
      var o = new L['phase1/frontend/object'](config);
      crescent._objects[config.object_id] = o; return o;
    },
    page: function(config){
      var p = new L['phase1/frontend/page'](config, crescent._renderer);
      crescent._pages[config.page_id] = p;
      crescent._renderer.register_page(p);
      return p;
    },
    transition: function(config){
      var t = new L['phase1/frontend/transition'](config);
      crescent._transitions[config.transition_id] = t; return t;
    },
    trigger: function(config){
      var t = new L['phase1/frontend/trigger'](config);
      crescent._triggers[config.trigger_id] = t; return t;
    },
    responsive: function(config){
      crescent._responsive = new L['phase1/frontend/responsive'](config);
      return crescent._responsive;
    },
    add: function(a, b){ return a + b; },
    subtract: function(a, b){ return a - b; },
    multiply: function(a, b){ return a * b; },
    divide: function(a, b){ return a / b; },
    sqrt: function(n){ return Math.sqrt(n); },
    sin: function(n){ return Math.sin(n); },
    cos: function(n){ return Math.cos(n); },
    tan: function(n){ return Math.tan(n); },
    get_timestamp: function(){ return Date.now(); },
    get renderer(){ return crescent._renderer; },
    get_page: function(id){ return crescent._pages[id]; },
    get_object: function(id){ return crescent._objects[id]; },
    get_layer: function(id){ return crescent._layers[id]; },
    get_transition: function(id){ return crescent._transitions[id]; },
    get_trigger: function(id){ return crescent._triggers[id]; },
    print: function(v){ console.log(v); return v; }
  };
  window.crescent = crescent;
})();
`;

// ---- The compiled app (imports 'crescent-js' -> global crescent) ---------
const appCode = compiled.replace(
  /require\("crescent-js"\)|require\('crescent-js'\)/g,
  '(window.crescent)'
);

const bundle = parts.join('\n')
  + '\n' + globalSetup
  + '\n' + '(function(){ var exports = {}; var module = { exports: exports }; ' + appCode + ' })();';

fs.writeFileSync(OUT, bundle);
console.log('[browser] bundle.js written (' + bundle.length + ' bytes)');