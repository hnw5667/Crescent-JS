/**
 * Bundler - Unified Bundling for JS-First Component System
 *
 * The final bundle includes both the JS logic and the pre-generated HTML,
 * with rocket.js serving as the bridge that binds them together at runtime.
 *
 * Build-time HTML generation occurs on the development machine during the
 * build step (not client-side). Generated HTML is bundled and shipped
 * alongside the JS and injected into component caching.
 */

const fs = require('fs');
const path = require('path');
const htmlGenerator = require('./html_generator');
let AboutGenerator;
try { AboutGenerator = require('./about_generator'); } catch (e) { AboutGenerator = null; }

class Bundler {
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'crescent_build');
    this.cache = options.cache || null; // optional ComponentCache instance
  }

  /**
   * Bundle a single JSFirstComponent into unified { js, html } payload.
   */
  bundle_component(component) {
    if (!component) throw new Error('bundle_component requires a component');
    // Support both JSFirstComponent instances and plain configs
    const isInstance = typeof component.generate_html === 'function' || typeof component.bundle === 'function';
    let payload;
    if (isInstance && typeof component.bundle === 'function') {
      payload = component.bundle();
    } else {
      // Plain config
      const html = htmlGenerator.generateComponentHTML(component);
      payload = {
        component_id: component.component_id || component.componentId,
        js: {
          component_id: component.component_id,
          size: component.size,
          sections: component.sections || [],
          page_position: component.page_position,
          page_index: component.page_index,
          modified_at: component.modified_at || Date.now()
        },
        html,
        sections: (component.sections || []).map(s => ({
          name: s.name,
          id: htmlGenerator.sectionId(s.name),
          layer_type: s.layer_type,
          layer_id: s.layer_id || s.name
        })),
        timestamp: Date.now()
      };
    }

    // If cache provided, inject into component caching (store html alongside js)
    if (this.cache) {
      try {
        // Component cache expects object-like: object_id
        const cacheObj = {
          object_id: payload.component_id,
          size: payload.js.size,
          layers: payload.js.sections,
          page_position: payload.js.page_position,
          page_index: payload.js.page_index,
          modified_at: payload.js.modified_at,
          // custom field for html generation transparency
          _generatedHtml: payload.html
        };
        // Use extended store_component that saves html
        if (typeof this.cache.store_component_with_html === 'function') {
          this.cache.store_component_with_html(cacheObj, payload.js, payload.html);
        } else if (typeof this.cache.store_component === 'function') {
          // fallback: embed html into component payload if cache supports extra field
          const entry = this.cache.store_component(cacheObj, Object.assign({}, payload.js, { html: payload.html }));
          // If store_component returns entry, attach html
          if (entry && !entry.html) entry.html = payload.html;
        }
      } catch (e) {
        // Non-fatal: bundling should succeed even if cache fails
        if (typeof console !== 'undefined' && console.warn) console.warn('[Bundler] cache store failed:', e.message);
      }
    }

    return payload;
  }

  bundleComponent(c) { return this.bundle_component(c); }

  /**
   * Bundle a RocketPage (legacy) into unified payload.
   * Generates HTML for each object section.
   */
  bundle_page(page) {
    if (!page) throw new Error('bundle_page requires a page');
    // Extract page config from RocketPage instance or plain object
    let pageConfig;
    if (page.objects instanceof Map) {
      // RocketPage instance
      const objects = Array.from(page.objects.values()).map(obj => {
        const layers = obj.layers instanceof Map ? Array.from(obj.layers.values()) : [];
        return {
          object_id: obj.object_id,
          size: obj.size,
          layers: layers,
          page_position: page.position instanceof Map ? page.position.get(obj.object_id) : undefined,
          page_index: page.index instanceof Map ? page.index.get(obj.object_id) : undefined,
          modified_at: obj.modified_at
        };
      });
      pageConfig = {
        page_id: page.page_id,
        page_bg: page.page_bg,
        size: page.size,
        objects_config: objects.map(o => ({
          object_id: o.object_id,
          size: o.size,
          layers_config: o.layers
        })),
        position_config: (() => {
          const out = {};
          if (page.position instanceof Map) { for (const [k, v] of page.position) out[k] = v; }
          return out;
        })(),
        index_config: (() => {
          const out = {};
          if (page.index instanceof Map) { for (const [k, v] of page.index) out[k] = v; }
          return out;
        })()
      };
    } else {
      pageConfig = page;
    }

    let html = htmlGenerator.generatePageHTML(pageConfig);
    // If page has JS-First components, append their build-time HTML
    let jsComponents = [];
    if (page.objects instanceof Map && page._jsComponents instanceof Map) {
      jsComponents = Array.from(page._jsComponents.values());
    } else if (page._jsComponents) {
      jsComponents = page._jsComponents instanceof Map ? Array.from(page._jsComponents.values()) : (Array.isArray(page._jsComponents) ? page._jsComponents : Object.values(page._jsComponents));
    } else if (Array.isArray(pageConfig.jsComponents)) {
      jsComponents = pageConfig.jsComponents;
    }
    if (jsComponents.length) {
      const compHtmls = jsComponents.map(c => {
        try { return htmlGenerator.generateComponentHTML(c); } catch (e) { return ''; }
      }).join('\n');
      // Inject into page HTML: before closing </div> of page
      if (html && html.includes('</div>')) {
        const lastIdx = html.lastIndexOf('</div>');
        html = html.slice(0, lastIdx) + compHtmls + '\n' + html.slice(lastIdx);
      } else {
        html = html + '\n' + compHtmls;
      }
    }
    const js = {
      page_id: pageConfig.page_id,
      size: pageConfig.size,
      page_bg: pageConfig.page_bg,
      objects: pageConfig.objects_config || pageConfig.objects || [],
      jsComponents: jsComponents.map(c => (typeof c.serialize === 'function' ? c.serialize() : c))
    };

    const payload = {
      page_id: pageConfig.page_id,
      js,
      html,
      bundles: jsComponents.map(c => {
        try {
          const h = htmlGenerator.generateComponentHTML(c);
          return { component_id: c.component_id || c.componentId, html: h, js: typeof c.serialize === 'function' ? c.serialize() : c };
        } catch (e) { return null; }
      }).filter(Boolean),
      timestamp: Date.now()
    };

    if (this.cache) {
      // Cache each object
      const objects = pageConfig.objects_config || pageConfig.objects || [];
      for (const obj of objects) {
        try {
          const cacheObj = {
            object_id: obj.object_id,
            size: obj.size,
            layers: obj.layers_config || obj.layers || [],
            modified_at: obj.modified_at || Date.now()
          };
          if (typeof this.cache.store_component_with_html === 'function') {
            // For page bundling we store object html section
            const objHtml = htmlGenerator.generateSectionHTML({
              name: obj.object_id,
              layer_type: 'text',
              text: '',
              size: obj.size
            });
            this.cache.store_component_with_html(cacheObj, cacheObj, objHtml);
          }
        } catch (e) {}
      }
    }

    return payload;
  }

  bundlePage(p) { return this.bundle_page(p); }

  /**
   * Bundle multiple components / pages into a single build artifact.
   */
  bundle_all(components) {
    if (!Array.isArray(components)) throw new Error('bundle_all requires an array');
    const results = components.map(c => {
      // Heuristic: if c has page_id, treat as page
      if (c.page_id || (c.objects && c.objects instanceof Map)) return this.bundle_page(c);
      return this.bundle_component(c);
    });
    return {
      version: '2.0.0',
      generated_at: new Date().toISOString(),
      bundles: results
    };
  }

  bundleAll(c) { return this.bundle_all(c); }

  /**
   * Write bundle(s) to disk (build-time).
   * Returns { path, payload }
   */
  build(components, options = {}) {
    const outDir = options.outputDir || this.outputDir;
    const fileName = options.fileName || 'bundle.json';
    const payload = this.bundle_all(components);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, fileName);
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');

    // Also write individual HTML files for inspection
    if (options.writeHtml !== false) {
      const htmlDir = path.join(outDir, 'html');
      fs.mkdirSync(htmlDir, { recursive: true });
      for (const bundle of payload.bundles) {
        const id = bundle.component_id || bundle.page_id || 'unknown';
        const safe = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
        fs.writeFileSync(path.join(htmlDir, `${safe}.html`), bundle.html, 'utf-8');
      }
    }

    // Also write JS sidecar (component js as json)
    if (options.writeJs !== false) {
      const jsDir = path.join(outDir, 'js');
      fs.mkdirSync(jsDir, { recursive: true });
      for (const bundle of payload.bundles) {
        const id = bundle.component_id || bundle.page_id || 'unknown';
        const safe = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
        fs.writeFileSync(path.join(jsDir, `${safe}.json`), JSON.stringify(bundle.js, null, 2), 'utf-8');
      }
    }

    // Generate about-webpage.txt alongside HTML (uses frontend code, plain English) — custom per page
    if (AboutGenerator && options.writeAbout !== false) {
      try {
        const aboutText = AboutGenerator.generateAboutWebpageText({ version: payload.version, components: components, page: components.length === 1 && components[0].page_id ? components[0] : null });
        // Write to build output
        fs.writeFileSync(path.join(outDir, 'about-webpage.txt'), aboutText, 'utf-8');
        // Also ensure code/about-webpage.txt stays in sync (for repo)
        try {
          const repoAbout = path.join(__dirname, '..', '..', '..', 'about-webpage.txt');
          fs.writeFileSync(repoAbout, aboutText, 'utf-8');
        } catch (e) {}
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) console.warn('[Bundler] about-webpage.txt generation failed:', e.message);
      }
    }

    return { path: outPath, payload };
  }

  /**
   * Build to a single file suitable for deployment (unified payload).
   */
  build_unified(components, outPath) {
    const payload = this.bundle_all(components);
    const target = outPath || path.join(this.outputDir, 'bundle.json');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(payload, null, 2), 'utf-8');
    return { path: target, payload };
  }

  buildUnified(c, p) { return this.build_unified(c, p); }
}

module.exports = Bundler;
