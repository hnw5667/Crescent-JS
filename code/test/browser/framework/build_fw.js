#!/usr/bin/env node
/**
 * Builds the framework-layers in-browser test bundle.
 *
 * Inlines the REAL Crescent.js frontend modules (src/phase1/frontend/*)
 * into a single bundle_fw.js, exposes a framework-aware `crescent`
 * singleton (same layer() rules as src/rocket.js), then appends app_fw.js.
 *
 * Usage: node test/browser/framework/build_fw.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const FRONTEND_DIR = path.join(ROOT, 'src', 'phase1', 'frontend');
const OUT = path.join(__dirname, 'bundle_fw.js');

const modules = {
  'phase1/frontend/base_layer': 'base_layer',
  'phase1/frontend/text_layer': 'text_layer',
  'phase1/frontend/framework_layer': 'framework_layer',
  'phase1/frontend/object': 'object',
  'phase1/frontend/page': 'page',
  'phase1/frontend/renderer': 'renderer'
};

const parts = [];
parts.push('(function(){');
parts.push('var __inlined = window.__inlined = window.__inlined || {};');
for (const [id, file] of Object.entries(modules)) {
  let src = fs.readFileSync(path.join(FRONTEND_DIR, file + '.js'), 'utf8');
  src = src
    .replace(/require\('\.\/base_layer'\)/g, '__inlined[String("phase1/frontend/base_layer")]')
    .replace(/require\("\.\/base_layer"\)/g, '__inlined[String("phase1/frontend/base_layer")]');
  parts.push(
    '__inlined[' + JSON.stringify(id) + '] = (function(){ var module={exports:{}}; ' +
    '(function(require,module,exports){' + src + '})' +
    '(function(mid){ return __inlined[String(mid)]; }, module, module.exports); ' +
    'return module.exports; })();'
  );
}
parts.push('window.__FrameworkLayer__ = __inlined["phase1/frontend/framework_layer"];');
parts.push('})();');

const globalSetup = `
(function(){
  var L = window.__inlined;
  var FrameworkLayer = L['phase1/frontend/framework_layer'];
  var crescent = {
    _layers: {}, _objects: {}, _pages: {},
    _renderer: new L['phase1/frontend/renderer'](),
    layer: function(config){
      var parsedFwId = FrameworkLayer.parseFrameworkId ? FrameworkLayer.parseFrameworkId(config && config.layer_id) : null;
      var fwType = config && typeof config.layer_type === 'string' ? FrameworkLayer.normalizeFrameworkName(config.layer_type) : null;
      var isFw = !!(parsedFwId || fwType);
      var inst;
      if (isFw) {
        inst = new FrameworkLayer(config);
        crescent._layers[inst.layer_id] = inst;
        return inst;
      }
      switch(config.layer_type){
        case 'text': inst = new L['phase1/frontend/text_layer'](config); break;
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
    get renderer(){ return crescent._renderer; },
    get_layer: function(id){ return crescent._layers[id]; }
  };
  window.crescent = crescent;
})();
`;

const appCode = fs.readFileSync(path.join(__dirname, 'app_fw.js'), 'utf8');

fs.writeFileSync(OUT, parts.join('\n') + '\n' + globalSetup + '\n' + appCode);
console.log('[browser-fw] bundle_fw.js written (' + fs.statSync(OUT).size + ' bytes)');
