/**
 * ComponentCache - Optimised Frontend Rendering via re-use of stored components
 *
 * Task 10025: When a component (object) is sent to a web page it is stored in
 * the web page's cache (a .json file named `components-chacke.json`). Later,
 * matching ids mean the server only sends the id plus where the component goes.
 *
 * A "Secret" tracker folder (default `.crescent-tracker`) enables the
 * optimisation. It records when a component is modified vs stored, so an edited
 * component is re-sent as an update instead of serving stale cache.
 *
 * If the tracker folder is missing, the optimisation is OFF and components are
 * sent normally (fallback).
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_CACHE_DIR = path.join(process.cwd(), 'crescent_cache');
const DEFAULT_CACHE_FILE = 'components-chacke.json';
const TRACKER_MARKER = '.tracker';

const LAYER_FIELDS = [
  'layer_id', 'layer_type', 'position', 'index', 'colour', 'opacity',
  'size', 'text', 'image_location', 'layer_vertices', 'input_method',
  'rotate', 'bg_layer', 'object_id', 'page_position', 'page_index'
];

class ComponentCache {
  constructor(config) {
    config = config || {};
    this.config = config;
    this.cache_dir = config.cache_dir || DEFAULT_CACHE_DIR;
    this.cache_file = config.cache_file || DEFAULT_CACHE_FILE;
    this.cache_path = path.join(this.cache_dir, this.cache_file);
    this.tracker_dir = config.tracker_dir || path.join(this.cache_dir, '.crescent-tracker');
    this.secret = config.secret;
    this._enabled = this.has_tracker();
  }

  /** The optimisation is only ON when the secret/tracker folder exists. */
  is_enabled() {
    return this._enabled;
  }

  /** Alias - does the tracker folder exist? */
  has_tracker() {
    return fs.existsSync(this.tracker_dir);
  }

  /** Create the secret/tracker folder so the optimisation turns ON. */
  enable() {
    fs.mkdirSync(this.tracker_dir, { recursive: true });
    fs.writeFileSync(
      path.join(this.tracker_dir, TRACKER_MARKER),
      JSON.stringify({ enabled: true, created_at: Date.now() })
    );
    this._enabled = true;
    return this;
  }

  /** Disable the optimisation (fallback to normal sends). */
  disable() {
    this._enabled = false;
    if (this.has_tracker()) {
      try {
        fs.unlinkSync(path.join(this.tracker_dir, TRACKER_MARKER));
      } catch (err) {
        // ignore - proving the flag is gone is enough (or remove the folder)
      }
    }
    return this;
  }

  /**
   * Serialize a component object into a plain JSON-describable structure.
   * Handles RocketObject-like objects (layers as a Map or array) and plain
   * objects. Map layers are normalized into arrays.
   * Extended for JS-First components: includes sections + build-time HTML.
   */
  serialize_component(object) {
    if (!object) return null;

    // JS-First component path
    if (object.component_id !== undefined || object.sections !== undefined) {
      const jsComp = this._serialize_js_component(object);
      // Attach build-time HTML if available or generate
      try {
        const HtmlGenerator = require('./html_generator');
        const html = object._html || HtmlGenerator.generateComponentHTML(object);
        jsComp._html = html;
        jsComp.html = html;
        if (jsComp.sections) {
          jsComp.section_ids = jsComp.sections.map(s => s.section_id);
        }
      } catch (e) {
        // html generation is best-effort at serialize time
      }
      return jsComp;
    }

    const id = object.object_id !== undefined ? object.object_id : object.id;
    const position = this._get_position(object);
    const index = this._get_index(object);

    const component = {
      object_id: id,
      size: object.size || { height: 0, width: 0 },
      position,
      index,
      layers: this._serialize_layers(object.layers)
    };

    const bgLayer = object.bg_layer instanceof Map ? null : object.bg_layer;
    if (bgLayer !== undefined) component.bg_layer = bgLayer;
    if (typeof object.object_enabled === 'boolean') component.object_enabled = object.object_enabled;
    if (object.page_position && object.page_position.x !== undefined) component.page_position = object.page_position;
    if (typeof object.page_index === 'number') component.page_index = object.page_index;

    // If layers contain section-like data, also generate HTML
    if (object.layers || object._html) {
      try {
        const HtmlGenerator = require('./html_generator');
        const html = object._html || HtmlGenerator.generateComponentHTML({
          component_id: id,
          sections: (component.layers || []).map(l => ({
            section_id: l.layer_id,
            type: l.layer_type,
            text: l.text,
            content: l.text,
            style: { colour: l.colour, opacity: l.opacity }
          }))
        });
        component._html = html;
        component.html = html;
      } catch (e) {}
    }

    return component;
  }

  _serialize_js_component(object) {
    const id = object.component_id || object.id;
    let sections = [];
    if (object.sections instanceof Map) {
      sections = Array.from(object.sections.values()).map(s => Object.assign({}, s));
    } else if (Array.isArray(object.sections)) {
      sections = object.sections.map(s => Object.assign({}, s));
    } else if (object.sections && typeof object.sections === 'object') {
      sections = Object.values(object.sections).map(s => Object.assign({}, s));
    } else if (typeof object.get_sections === 'function') {
      sections = object.get_sections().map(s => Object.assign({}, s));
    }
    // Normalize sections
    sections = sections.map(s => {
      if (!s.section_id && s.section_name) s.section_id = s.section_name;
      if (!s.section_id && s.name) s.section_id = s.name;
      if (!s.section_id && s.id) s.section_id = s.id;
      return s;
    });

    const out = {
      component_id: id,
      component_name: object.component_name || id,
      size: object.size || null,
      style: object.style || {},
      className: object.className || object.class_name || '',
      sections,
      section_ids: sections.map(s => s.section_id).filter(Boolean),
      component_enabled: object.component_enabled !== undefined ? object.component_enabled : true,
      position: this._get_position(object),
      index: this._get_index(object)
    };
    if (object.page_position) out.page_position = object.page_position;
    if (typeof object.page_index === 'number') out.page_index = object.page_index;
    return out;
  }

  /** Extract a plain array from a Map / array / plain layers-object. */
  _serialize_layers(layers) {
    if (!layers) return [];
    let list;
    if (layers instanceof Map) {
      list = Array.from(layers.values());
    } else if (Array.isArray(layers)) {
      list = layers;
    } else if (typeof layers === 'object') {
      list = Object.values(layers);
    } else {
      return [];
    }
    return list.map(layer => this._serialize_layer(layer));
  }

  /** Shallow plain copy of a single layer (JSON-safe). */
  _serialize_layer(layer) {
    if (layer === null || layer === undefined) return null;
    if (typeof layer !== 'object') return layer;
    const out = {};
    for (const key of LAYER_FIELDS) {
      const value = layer[key];
      if (value === undefined || value instanceof Map) continue;
      out[key] = value;
    }
    for (const [key, value] of Object.entries(layer)) {
      if (out[key] !== undefined) continue;
      if (value === null || value instanceof Map) continue;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        out[key] = value;
      } else if (Array.isArray(value)) {
        out[key] = value;
      }
    }
    return out;
  }

  /**
   * Core method: decide, for an object, whether to send normally, push an
   * update that refreshes the web page cache, or just re-use the stored id.
   * Extended: includes build-time HTML when component is JS-First.
   */
  resolve_component(object, pagePosition, pageIndex) {
    if (!this.is_enabled()) {
      const comp = this.serialize_component(object);
      // Ensure html is included even in fallback mode
      if (object && (object.component_id !== undefined || object.sections !== undefined)) {
        try {
          const HtmlGenerator = require('./html_generator');
          const html = HtmlGenerator.generateComponentHTML(object);
          comp.html = html;
          comp._html = html;
        } catch (e) {}
      }
      return { type: 'normal', component: comp };
    }

    const id = object.object_id !== undefined ? object.object_id : (object.component_id !== undefined ? object.component_id : object.id);
    const position = pagePosition && pagePosition.x !== undefined
      ? pagePosition
      : (this.config.position || this._get_position(object));
    const index = typeof pageIndex === 'number'
      ? pageIndex
      : this._get_index(object);

    const modified = this._modified_at(object);
    const cached = this.get_cached(id);

    if (!cached || modified > cached.stored_at) {
      const stored = this.store_component(object);
      const component = stored.component;
      // Attach html for JS-First bundles
      let html = stored.html || (stored.component && (stored.component.html || stored.component._html));
      if (!html) {
        try {
          const HtmlGenerator = require('./html_generator');
          html = HtmlGenerator.generateComponentHTML(object);
        } catch (e) { html = null; }
      }
      const result = { type: 'update', id, position, index, component };
      if (html) { result.html = html; result.component.html = html; result.component._html = html; }
      return result;
    }

    // Reuse: include html reference for JS-First (id + location + cached html handle)
    const cachedHtml = cached.html || (cached.component && (cached.component.html || cached.component._html));
    if (cachedHtml) {
      return { type: 'reuse', id, position, index, html: cachedHtml };
    }
    return { type: 'reuse', id, position, index };
  }

  /**
   * Resolve a JS-First component explicitly (alias that guarantees HTML handling).
   */
  resolve_js_component(component, pagePosition, pageIndex) {
    return this.resolve_component(component, pagePosition, pageIndex);
  }

  /**
   * Immediately write a serialized component into the cache JSON under its
   * object_id, stamped with `stored_at`. Returns the stored entry.
   * Extended: persists build-time HTML alongside JS.
   */
  store_component(object, component) {
    const id = object.object_id !== undefined ? object.object_id : (object.component_id !== undefined ? object.component_id : object.id);
    const payload = component || this.serialize_component(object);
    // Ensure html is persisted
    let html = payload && (payload.html || payload._html);
    if (!html && object) {
      try {
        const HtmlGenerator = require('./html_generator');
        html = HtmlGenerator.generateComponentHTML(object);
        if (html) {
          payload.html = html;
          payload._html = html;
        }
      } catch (e) {}
    }
    const entry = { id, stored_at: Date.now(), component: payload, html: html || (payload && (payload.html || payload._html)) || null };

    const cacheEntries = this.load_cache();
    const found = cacheEntries.findIndex(entry => entry.id === id);
    if (found !== -1) {
      cacheEntries[found] = entry;
    } else {
      cacheEntries.push(entry);
    }
    this.save_cache(cacheEntries);
    return entry;
  }

  /** Get cached HTML for a component id, or null. */
  get_cached_html(id) {
    const entry = this.get_cached(id);
    if (!entry) return null;
    return entry.html || (entry.component && (entry.component.html || entry.component._html)) || null;
  }

  /** Store HTML explicitly (build-time generation path). */
  store_component_with_html(object, js, html) {
    // Compatibility shim for bundler: object may be cacheObj, js is js payload, html string
    if (object && typeof object === 'object' && (object.object_id || object.component_id || object.id)) {
      const id = object.object_id || object.component_id || object.id;
      const component = js || object;
      const htmlStr = html || (component && (component.html || component._html)) || null;
      if (htmlStr) {
        return this.store_html(id, htmlStr, component);
      }
      // fallback to normal store
      return this.store_component(object, component);
    }
    return this.store_html(object, js, html);
  }

  store_html(id, html, js) {
    const cacheEntries = this.load_cache();
    let entry = cacheEntries.find(e => e.id === id);
    if (!entry) {
      entry = { id, stored_at: Date.now(), component: js || { component_id: id }, html };
      cacheEntries.push(entry);
    } else {
      entry.html = html;
      if (js) entry.component = Object.assign(entry.component || {}, js, { html, _html: html });
      entry.stored_at = Date.now();
    }
    this.save_cache(cacheEntries);
    return entry;
  }

  /** Return the cached entry for `id`, or null when absent/cache missing. */
  get_cached(id) {
    const cacheEntries = this.load_cache();
    return cacheEntries.find(entry => entry.id === id) || null;
  }

  /** Read the JSON cache file. Returns [] if the file is missing/unreadable. */
  load_cache() {
    try {
      if (!fs.existsSync(this.cache_path)) return [];
      const data = JSON.parse(fs.readFileSync(this.cache_path, 'utf-8'));
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }

  save_cache(entries) {
    fs.mkdirSync(path.dirname(this.cache_path), { recursive: true });
    fs.writeFileSync(this.cache_path, JSON.stringify(entries, null, 2), 'utf-8');
  }

  /**
   * Build the full page payload: one resolution per component in page.objects.
   * Respects each object's page position/index where present.
   * Extended: also handles JS-First components stored on page._jsComponents.
   */
  build_page_payload(page) {
    const components = [];
    if (!page) return { components };

    const collectLists = [];
    if (page.objects) {
      const objects = page.objects;
      const list = objects instanceof Map
        ? Array.from(objects.values())
        : Array.isArray(objects) ? objects : Object.values(objects);
      collectLists.push(list);
    }
    if (page._jsComponents) {
      const jsList = page._jsComponents instanceof Map
        ? Array.from(page._jsComponents.values())
        : Array.isArray(page._jsComponents) ? page._jsComponents : Object.values(page._jsComponents);
      collectLists.push(jsList);
    }
    if (collectLists.length === 0 && Array.isArray(page)) {
      collectLists.push(page);
    }
    if (collectLists.length === 0) return { components };

    const all = collectLists.flat();
    for (const obj of all) {
      const id = obj.object_id !== undefined ? obj.object_id : (obj.component_id !== undefined ? obj.component_id : obj.id);
      let pagePosition;
      let pageIndex;

      if (page.position instanceof Map) {
        const maybe = page.position.get(id);
        if (maybe && maybe.x !== undefined) pagePosition = maybe;
      } else if (page.position) {
        const maybe = page.position[id];
        if (maybe && maybe.x !== undefined) pagePosition = maybe;
      }

      if (page.index instanceof Map) {
        const maybe = page.index.get(id);
        if (maybe !== undefined) pageIndex = maybe;
      } else if (page.index) {
        const maybe = page.index[id];
        if (maybe !== undefined) pageIndex = maybe;
      }

      components.push(this.resolve_component(obj, pagePosition, pageIndex));
    }

    return { components };
  }

  /**
   * Build page payload including HTML (JS-First unified bundling shape).
   * Mirrors build_page_payload but guarantees html fields.
   */
  build_page_payload_with_html(page) {
    const base = this.build_page_payload(page);
    // Ensure html present
    for (const c of base.components) {
      if (!c.html && c.component && c.component.html) c.html = c.component.html;
      if (!c.html && c.id) {
        const cachedHtml = this.get_cached_html(c.id);
        if (cachedHtml) c.html = cachedHtml;
      }
    }
    return base;
  }

  /** Clear the cache file. */
  clear() {
    if (fs.existsSync(this.cache_path)) {
      fs.unlinkSync(this.cache_path);
    }
    return this;
  }

  /** Plain {x,y} position for an object (skips RocketObject Map `position`). */
  _get_position(object) {
    if (object.page_position && object.page_position.x !== undefined) return object.page_position;
    if (object.position && !(object.position instanceof Map) && object.position.x !== undefined) {
      return object.position;
    }
    return { x: 0, y: 0 };
  }

  /** Numeric index for an object. */
  _get_index(object) {
    if (typeof object.page_index === 'number') return object.page_index;
    if (typeof object.index === 'number') return object.index;
    return 0;
  }

  /** ms from object.modified_at / modifiedAt; missing = "now" (always fresh). */
  _modified_at(object) {
    let value = object.modified_at !== undefined ? object.modified_at : object.modifiedAt;
    if (value === undefined) return Date.now();
    if (value instanceof Date) value = value.getTime();
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      return isNaN(parsed) ? Date.now() : parsed;
    }
    const num = Number(value);
    return isNaN(num) ? Date.now() : num;
  }
}

module.exports = ComponentCache;