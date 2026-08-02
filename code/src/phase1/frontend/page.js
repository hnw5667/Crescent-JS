/**
 * RocketPage - Full-page composition with cartesian coordinates and ratio-based scaling
 * 
 * From the spec:
 *   - Pages are a stack of objects placed and indexed to form a web page
 *   - Each page has a title, description, and URL
 *   - Each page has a height and width defining its cartesian plane
 *   - Each page has a bg (colour or layer) that fills the screen width
 *   - Objects are positioned using (x, y) cartesian coordinates
 *   - Objects are indexed for z-ordering (lower = back, higher = front)
 * 
 * Ratio-based scaling:
 *   - When the page is created, it gets a height and width
 *   - This creates two ratios: "height from top : height from bottom" and
 *     "width from left : width from right"
 *   - When the screen size changes, these ratios are maintained
 *   - If a ratio is 0:0, the object resizes to fit the screen in that ratio
 *   - The bg layer scales to fill the screen
 *   - Object layers scale using the same ratio method
 * 
 * Page format from spec:
 *   Page_ID/name = {
 *     page_bg = layer (or) colour
 *     page_url = www.xyz.com/home
 *     page_title = xyz
 *     page_description = this is the home of www.xyz.com
 *     page_type = home
 *     page_size = { height: N, width: M }
 *     objects = { object_ID_1, object_ID_2 }
 *     index = { object_ID_1 = 0, object_ID_2 = 1 }
 *     position = { object_ID_1 = (-10,0), object_ID_2 = (-3,3) }
 *   }
 */

class RocketPage {
  constructor(config, renderer) {
    this.page_id = config.page_id;
    this.page_enabled = config.page_enabled !== undefined ? config.page_enabled : true;
    
    // Page dimensions - defines the cartesian plane
    this.size = config.size || { height: 800, width: 1200 };
    
    // Background: can be a colour string or a layer instance
    this.page_bg = config.page_bg || '255,255,255';
    
    // Page metadata
    this.page_url = config.page_url || '/';
    this.page_title = config.page_title || '';
    this.page_description = config.page_description || '';
    this.page_type = config.page_type || 'home';
    
    // Object storage: map of object_id → object instance
    this.objects = new Map();
    
    // Index map: object_id → z-index
    this.index = new Map();
    
    // Position map: object_id → { x, y } in cartesian coordinates
    this.position = new Map();
    
    // Scaling ratios: object_id → { height_ratio: [top, bottom], width_ratio: [left, right] }
    // If both values are 0, the object resizes to fit the screen in that dimension
    this.scaling_ratios = new Map();
    
    this._renderer = renderer;
    this._element = null;
    this._resizeObserver = null;
    this._originalSize = { ...this.size };

    // Initialize from config
    if (config.objects_config) {
      for (const obj of config.objects_config) {
        this.add_object(obj);
      }
    }
    if (config.index_config) {
      for (const [id, idx] of Object.entries(config.index_config)) {
        this.index.set(id, idx);
      }
    }
    if (config.position_config) {
      for (const [id, pos] of Object.entries(config.position_config)) {
        this.position.set(id, pos);
      }
    }
    if (config.scaling_config) {
      for (const [id, ratios] of Object.entries(config.scaling_config)) {
        this.scaling_ratios.set(id, ratios);
      }
    }
  }

  /**
   * Get the cartesian range for this page
   */
  get_cartesian_range() {
    return {
      x: { min: -(this.size.width / 2), max: this.size.width / 2 },
      y: { min: -(this.size.height / 2), max: this.size.height / 2 }
    };
  }

  /**
   * Convert cartesian (x, y) to pixel position within the page
   * Cartesian: positive Y = UP, positive X = RIGHT
   * CSS: positive Y = DOWN, positive X = RIGHT
   * So we flip Y: top = centerY - y
   */
  _cartesian_to_pixel(x, y) {
    const centerX = this.size.width / 2;
    const centerY = this.size.height / 2;
    return {
      left: centerX + x,
      top: centerY - y
    };
  }

  /**
   * Add an object to this page
   */
  add_object(object) {
    this.objects.set(object.object_id, object);
    if (!this.index.has(object.object_id)) {
      this.index.set(object.object_id, this.objects.size - 1);
    }
    if (!this.position.has(object.object_id)) {
      this.position.set(object.object_id, { x: 0, y: 0 });
    }
    // Default scaling ratio: 0:0 (resize to fit)
    if (!this.scaling_ratios.has(object.object_id)) {
      this.scaling_ratios.set(object.object_id, {
        height_ratio: [0, 0],
        width_ratio: [0, 0]
      });
    }
    if (this._element) {
      const objEl = this._render_object(object);
      this._element.appendChild(objEl);
    }
    return this;
  }

  /**
   * Remove an object by its ID
   */
  remove_object(object_id) {
    const obj = this.objects.get(object_id);
    if (obj && this._element && obj._element) {
      this._element.removeChild(obj._element);
    }
    this.objects.delete(object_id);
    this.index.delete(object_id);
    this.position.delete(object_id);
    this.scaling_ratios.delete(object_id);
    return this;
  }

  /**
   * Get an object by its ID
   */
  get_object(object_id) {
    return this.objects.get(object_id) || null;
  }

  /**
   * Set the cartesian position for an object on this page
   */
  set_object_position(object_id, x, y) {
    this.position.set(object_id, { x, y });
    const obj = this.objects.get(object_id);
    if (obj && obj._element) {
      const pixel = this._cartesian_to_pixel(x, y);
      obj._element.style.left = `${pixel.left}px`;
      obj._element.style.top = `${pixel.top}px`;
      obj._element.style.transform = 'translate(-50%, -50%)';
    }
    return this;
  }

  /**
   * Set the z-index for an object
   */
  set_object_index(object_id, idx) {
    this.index.set(object_id, idx);
    const obj = this.objects.get(object_id);
    if (obj && obj._element) {
      obj._element.style.zIndex = idx;
    }
    return this;
  }

  /**
   * Set the scaling ratios for an object
   * height_ratio: [top, bottom] - if [0,0], object resizes to fit height
   * width_ratio: [left, right] - if [0,0], object resizes to fit width
   */
  set_scaling_ratio(object_id, height_ratio, width_ratio) {
    this.scaling_ratios.set(object_id, { height_ratio, width_ratio });
    return this;
  }

  /**
   * Render a single object within this page's coordinate system
   */
  _render_object(obj) {
    const pos = this.position.get(obj.object_id) || { x: 0, y: 0 };
    const idx = this.index.get(obj.object_id) || 0;
    const pixel = this._cartesian_to_pixel(pos.x, pos.y);

    const el = obj.render();

    // Position the object on the page using cartesian coordinates
    el.style.position = 'absolute';
    el.style.left = `${pixel.left}px`;
    el.style.top = `${pixel.top}px`;
    el.style.transform = 'translate(-50%, -50%)';
    el.style.zIndex = idx;

    return el;
  }

  /**
   * Apply ratio-based scaling when the viewport changes
   * 
   * The page renders at its design size (e.g., 1200x800).
   * We use CSS transform: scale() to uniformly scale the entire page
   * to fit the viewport width. This ensures:
   * - No objects get cut off when viewport shrinks
   * - Everything scales proportionally (maintains aspect ratio)
   * - Cartesian coordinates always work correctly at design size
   */
  _apply_scaling() {
    if (!this._element) return;

    const container = this._element.parentElement;
    if (!container) return;

    const viewportWidth = container.clientWidth;
    const designWidth = this._originalSize.width;
    const designHeight = this._originalSize.height;

    if (designWidth === 0) return;

    // Scale factor: fit the design width into the viewport
    const scale = viewportWidth / designWidth;

    // Apply uniform scale transform from top-left
    this._element.style.transform = `scale(${scale})`;
    this._element.style.transformOrigin = 'top left';

    // Adjust the container height to match the scaled height
    // so there's no extra space or cut-off
    const scaledHeight = designHeight * scale;
    container.style.height = `${scaledHeight}px`;
  }

  /**
   * Render this page as a DOM element
   */
  render() {
    const div = document.createElement('div');
    div.dataset.pageId = this.page_id;

    if (!this.page_enabled) {
      div.style.display = 'none';
      this._element = div;
      return div;
    }

    // Page renders at its design size (e.g., 1200x800)
    // The _apply_scaling() method will use CSS transform: scale() 
    // to uniformly scale the entire page to fit the viewport
    div.style.width = typeof this.size.width === 'number' ? `${this.size.width}px` : this.size.width;
    div.style.height = typeof this.size.height === 'number' ? `${this.size.height}px` : this.size.height;
    div.style.position = 'relative';
    div.style.overflow = 'hidden';

    // Background
    if (typeof this.page_bg === 'string') {
      div.style.backgroundColor = this._parseColour(this.page_bg);
    } else if (this.page_bg && typeof this.page_bg === 'object' && this.page_bg.render) {
      // It's a layer - render it as the background
      const bgEl = this.page_bg.render();
      bgEl.style.position = 'absolute';
      bgEl.style.top = '0';
      bgEl.style.left = '0';
      bgEl.style.width = '100%';
      bgEl.style.height = '100%';
      bgEl.style.zIndex = '-1';
      div.appendChild(bgEl);
    }

    // Render all objects, sorted by index (back to front)
    const sortedObjects = Array.from(this.objects.values()).sort((a, b) => {
      const idxA = this.index.get(a.object_id) || 0;
      const idxB = this.index.get(b.object_id) || 0;
      return idxA - idxB;
    });

    for (const obj of sortedObjects) {
      const objEl = this._render_object(obj);
      div.appendChild(objEl);
    }

    this._element = div;

    // We'll set up the ResizeObserver after the element is mounted
    // (needs parentElement to be available)
    this._needsObserverSetup = true;

    return div;
  }

  /**
   * Navigate to another page
   */
  navigate_to(page_id) {
    if (this._renderer) {
      this._renderer.navigate(`/${page_id}`);
    }
  }

  /**
   * Collect all input values from all objects
   */
  get_values() {
    const values = {};
    for (const [id, obj] of this.objects) {
      values[id] = obj.get_value();
    }
    return values;
  }

  get_element() { return this._element; }

  _parseColour(colour) {
    if (!colour) return 'transparent';
    if (typeof colour !== 'string') return 'transparent';
    const parts = colour.split(',').map(s => s.trim());
    if (parts.length === 3) return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
    if (parts.length === 4) return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]})`;
    return colour;
  }

  set_property(name, value) {
    this[name] = value;
    if (this._element) {
      switch (name) {
        case 'page_bg':
          if (typeof value === 'string') {
            this._element.style.backgroundColor = this._parseColour(value);
          }
          break;
        case 'size':
          this._element.style.width = typeof value.width === 'number' ? `${value.width}px` : value.width;
          this._element.style.height = typeof value.height === 'number' ? `${value.height}px` : value.height;
          this._apply_scaling();
          break;
        case 'page_enabled':
          this._element.style.display = value ? '' : 'none';
          break;
      }
    }
  }

  /**
   * Clean up resize observer
   */
  destroy() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }
}

module.exports = RocketPage;