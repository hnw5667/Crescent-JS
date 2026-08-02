/**
 * RocketObject - Container that holds layers in a cartesian coordinate system
 * 
 * From the spec:
 *   - An object has a predefined height and width
 *   - These are divided into x and y coordinates
 *   - If height is 400, it maps as -200 to 200 in y axis
 *   - If width is 300, it maps as -150 to 150 in x axis
 *   - Layers are imported by their layer_id/name
 *   - Layers are indexed (z-order): lower = back, higher = front
 *   - Layers are positioned using (x, y) cartesian coordinates
 *   - If a layer comes out of the object, the part outside is clipped
 * 
 * Object format from spec:
 *   object_ID/name = {
 *     layers = { layer_ID_1, layer_ID_2 }
 *     index = { layer_ID_1 = 0, layer_ID_2 = 1 }
 *     position = { layer_ID_1 = (-10,-2), layer_ID_2 = (5,10) }
 *     bg_layer = { layer_ID_2 }
 *     size = {height = n px, width = m px}
 *   }
 */

class RocketObject {
  constructor(config) {
    this.object_id = config.object_id;
    this.object_enabled = config.object_enabled !== undefined ? config.object_enabled : true;
    
    // Object dimensions - defines the cartesian plane
    // e.g., height: 400 → y ranges from -200 to 200
    // e.g., width: 300 → x ranges from -150 to 150
    this.size = config.size || { height: N, width: M };
    
    // Layer storage: map of layer_id → layer instance
    this.layers = new Map();
    
    // Index map: layer_id → z-index (lower = back, higher = front)
    this.index = new Map();
    
    // Position map: layer_id → { x, y } in cartesian coordinates
    this.position = new Map();
    
    // Background layer reference
    this.bg_layer = config.bg_layer || null;
    
    // Object's own position on the page (cartesian)
    this.page_position = config.page_position || { x: 0, y: 0 };
    
    // Object's own index on the page
    this.page_index = config.page_index || 0;
    
    this._element = null;
    this._transition = null;

    // Initialize from config if provided
    if (config.layers_config) {
      for (const layer of config.layers_config) {
        this.add_layer(layer);
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
  }

  /**
   * Get the cartesian range for this object
   * e.g., height 400 → y: -200 to 200
   * e.g., width 300 → x: -150 to 150
   */
  get_cartesian_range() {
    return {
      x: { min: -(this.size.width / 2), max: this.size.width / 2 },
      y: { min: -(this.size.height / 2), max: this.size.height / 2 }
    };
  }

  /**
   * Convert cartesian (x, y) to CSS pixel position within the object
   * Center of object = (0, 0)
   * Cartesian: positive x = right, positive y = UP
   * CSS: positive y = DOWN
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
   * Add a layer to this object
   */
  add_layer(layer) {
    this.layers.set(layer.layer_id, layer);
    // Set default index if not already set
    if (!this.index.has(layer.layer_id)) {
      this.index.set(layer.layer_id, this.layers.size - 1);
    }
    // Set default position if not already set
    if (!this.position.has(layer.layer_id)) {
      this.position.set(layer.layer_id, { x: 0, y: 0 });
    }
    // If rendered, add to DOM
    if (this._element) {
      const layerEl = this._render_layer(layer);
      this._element.appendChild(layerEl);
    }
    return this;
  }

  /**
   * Remove a layer by its ID
   */
  remove_layer(layer_id) {
    const layer = this.layers.get(layer_id);
    if (layer && this._element && layer._element) {
      this._element.removeChild(layer._element);
    }
    this.layers.delete(layer_id);
    this.index.delete(layer_id);
    this.position.delete(layer_id);
    if (this.bg_layer === layer_id) {
      this.bg_layer = null;
    }
    return this;
  }

  /**
   * Get a layer by its ID
   */
  get_layer(layer_id) {
    return this.layers.get(layer_id) || null;
  }

  /**
   * Set the z-index for a layer
   */
  set_layer_index(layer_id, idx) {
    this.index.set(layer_id, idx);
    const layer = this.layers.get(layer_id);
    if (layer && layer._element) {
      layer._element.style.zIndex = idx;
    }
    return this;
  }

  /**
   * Set the cartesian position for a layer within this object
   */
  set_layer_position(layer_id, x, y) {
    this.position.set(layer_id, { x, y });
    const layer = this.layers.get(layer_id);
    if (layer && layer._element) {
      const pixel = this._cartesian_to_pixel(x, y);
      layer._element.style.left = `${pixel.left}px`;
      layer._element.style.top = `${pixel.top}px`;
      layer._element.style.transform = `translate(-50%, -50%) rotate(${this._parseRotate(layer.rotate)})`;
    }
    return this;
  }

  /**
   * Set the background layer
   */
  set_bg_layer(layer_id) {
    this.bg_layer = layer_id;
    // Re-render to update bg layer styling
    if (this._element) {
      const parent = this._element.parentNode;
      if (parent) {
        const newEl = this.render();
        parent.replaceChild(newEl, this._element);
      }
    }
    return this;
  }

  /**
   * Render a single layer within this object's coordinate system
   */
  _render_layer(layer) {
    const pos = this.position.get(layer.layer_id) || { x: 0, y: 0 };
    const idx = this.index.get(layer.layer_id) || 0;
    const pixel = this._cartesian_to_pixel(pos.x, pos.y);

    // Override layer's position and index for rendering within this object
    layer.position = pos;
    layer.index = idx;

    const el = layer.render();

    // Override positioning to use cartesian-to-pixel conversion
    el.style.position = 'absolute';
    el.style.left = `${pixel.left}px`;
    el.style.top = `${pixel.top}px`;
    el.style.transform = `translate(-50%, -50%) rotate(${this._parseRotate(layer.rotate)})`;
    el.style.zIndex = idx;

    // If this is the bg layer, make it fill the entire object
    if (this.bg_layer === layer.layer_id) {
      el.style.left = '0';
      el.style.top = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.transform = 'none';
      el.style.zIndex = -1;
    }

    return el;
  }

  /**
   * Render this object as a DOM element
   */
  render() {
    const div = document.createElement('div');
    div.dataset.objectId = this.object_id;

    if (!this.object_enabled) {
      div.style.display = 'none';
      this._element = div;
      return div;
    }

    // Object size
    div.style.width = typeof this.size.width === 'number' ? `${this.size.width}px` : this.size.width;
    div.style.height = typeof this.size.height === 'number' ? `${this.size.height}px` : this.size.height;
    div.style.position = 'absolute';
    div.style.overflow = 'hidden'; // Clip layers that go outside

    // Render all layers, sorted by index (back to front)
    const sortedLayers = Array.from(this.layers.values()).sort((a, b) => {
      const idxA = this.index.get(a.layer_id) || 0;
      const idxB = this.index.get(b.layer_id) || 0;
      return idxA - idxB;
    });

    for (const layer of sortedLayers) {
      const layerEl = this._render_layer(layer);
      div.appendChild(layerEl);
    }

    this._element = div;
    return div;
  }

  /**
   * Collect values from all input layers in this object
   */
  get_value() {
    const values = {};
    for (const [id, layer] of this.layers) {
      if (layer.layer_type === 'input') {
        values[id] = layer.get_value();
      }
    }
    return values;
  }

  get_element() { return this._element; }

  _parseRotate(rotate) {
    if (typeof rotate === 'string' && rotate.endsWith('deg')) {
      return rotate;
    }
    return `${rotate}deg`;
  }

  set_property(name, value) {
    this[name] = value;
    if (this._element) {
      switch (name) {
        case 'size':
          this._element.style.width = typeof value.width === 'number' ? `${value.width}px` : value.width;
          this._element.style.height = typeof value.height === 'number' ? `${value.height}px` : value.height;
          break;
        case 'object_enabled':
          this._element.style.display = value ? '' : 'none';
          break;
      }
    }
  }

  set_transition(transition) {
    this._transition = transition;
    return this;
  }
}

module.exports = RocketObject;