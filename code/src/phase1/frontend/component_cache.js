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
   */
  serialize_component(object) {
    if (!object) return null;
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

    return component;
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
   */
  resolve_component(object, pagePosition, pageIndex) {
    if (!this.is_enabled()) {
      return { type: 'normal', component: this.serialize_component(object) };
    }

    const id = object.object_id !== undefined ? object.object_id : object.id;
    const position = pagePosition && pagePosition.x !== undefined
      ? pagePosition
      : (this.config.position || this._get_position(object));
    const index = typeof pageIndex === 'number'
      ? pageIndex
      : this._get_index(object);

    const modified = this._modified_at(object);
    const cached = this.get_cached(id);

    if (!cached || modified > cached.stored_at) {
      const component = this.store_component(object).component;
      return { type: 'update', id, position, index, component };
    }

    return { type: 'reuse', id, position, index };
  }

  /**
   * Immediately write a serialized component into the cache JSON under its
   * object_id, stamped with `stored_at`. Returns the stored entry.
   */
  store_component(object, component) {
    const id = object.object_id !== undefined ? object.object_id : object.id;
    const payload = component || this.serialize_component(object);
    const entry = { id, stored_at: Date.now(), component: payload };

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
   */
  build_page_payload(page) {
    const components = [];
    if (!page || !page.objects) return { components };

    const objects = page.objects;
    const list = objects instanceof Map
      ? Array.from(objects.values())
      : Array.isArray(objects) ? objects : Object.values(objects);

    for (const obj of list) {
      const id = obj.object_id !== undefined ? obj.object_id : obj.id;
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