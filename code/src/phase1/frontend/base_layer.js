/**
 * BaseLayer - Base class for all layers
 * 
 * Layers are the building blocks of the frontend.
 * Each layer has a unique ID/name and is positioned
 * using (x, y) coordinates within its parent object.
 * 
 * Layers are indexed to determine z-order:
 * - Lower index = further back
 * - Higher index = further front
 */

class BaseLayer {
  constructor(config) {
    this.layer_id = config.layer_id;
    this.layer_type = config.layer_type || 'base';
    this.layer_enabled = config.layer_enabled !== undefined ? config.layer_enabled : true;
    this.colour = config.colour || '0,0,0';
    this.opacity = config.opacity || '100%';
    this.rounded_corners = config.rounded_corners || '0px';
    this.rotate = config.rotate || '0deg';
    this.size = config.size || { height: 50, width: 50 };
    this.position = config.position || { x: 0, y: 0 };
    this.index = config.index || 0;
    this._element = null;
  }

  /**
   * Render this layer as a DOM element
   * Uses cartesian coordinates within the parent object
   */
  render() {
    const div = document.createElement('div');
    div.dataset.layerId = this.layer_id;
    div.dataset.layerType = this.layer_type;

    if (!this.layer_enabled) {
      div.style.display = 'none';
      this._element = div;
      return div;
    }

    // Position using cartesian coordinates (relative to object center)
    div.style.position = 'absolute';
    div.style.left = '50%';
    div.style.top = '50%';
    div.style.transform = `translate(calc(-50% + ${this.position.x}px), calc(-50% + ${this.position.y}px)) rotate(${this._parseRotate(this.rotate)})`;

    // Size
    div.style.width = typeof this.size.width === 'number' ? `${this.size.width}px` : this.size.width;
    div.style.height = typeof this.size.height === 'number' ? `${this.size.height}px` : this.size.height;

    // Styling
    div.style.backgroundColor = this._parseColour(this.colour);
    div.style.opacity = this._parseOpacity(this.opacity);
    div.style.borderRadius = this._parseRoundedCorners(this.rounded_corners);
    div.style.overflow = 'hidden';

    // Z-index from layer index
    div.style.zIndex = this.index;

    this._element = div;
    return div;
  }

  /**
   * Parse colour from "r,g,b" format to CSS rgb()
   */
  _parseColour(colour) {
    if (!colour) return 'transparent';
    if (typeof colour !== 'string') return 'transparent';
    const parts = colour.split(',').map(s => s.trim());
    if (parts.length === 3) return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
    if (parts.length === 4) return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]})`;
    return colour;
  }

  /**
   * Parse opacity - supports "100%" format
   */
  _parseOpacity(opacity) {
    if (typeof opacity === 'string' && opacity.endsWith('%')) {
      return String(parseFloat(opacity) / 100);
    }
    return opacity;
  }

  /**
   * Parse rotation - supports "360deg" format
   */
  _parseRotate(rotate) {
    if (typeof rotate === 'string' && rotate.endsWith('deg')) {
      return rotate;
    }
    return `${rotate}deg`;
  }

  /**
   * Parse rounded_corners - enforces pixel units
   * 
   * Supports all spec formats:
   *   10          → 10px
   *   10px        → 10px
   *   10 px       → 10px       (spec format with space)
   *   8px 4px     → 8px 4px    (horizontal/vertical)
   *   8 px 4 px   → 8px 4px
   *   12px 0 8px 4px → 12px 0px 8px 4px  (individual corners)
   *   50%         → 50%       (percentages kept as-is)
   *   0           → 0px
   */
  _parseRoundedCorners(value) {
    // If it's a number, just append px
    if (typeof value === 'number') {
      return `${value}px`;
    }
    if (!value || typeof value !== 'string') {
      return '0px';
    }

    const trimmed = value.trim();
    if (!trimmed) return '0px';

    // Tokenize: split by whitespace, then combine number+unit pairs
    // e.g. "8 px" → ["8", "px"] → "8px"
    // e.g. "8px 4 px" → ["8px", "4", "px"] → "8px 4px"
    const tokens = trimmed.split(/\s+/);
    const result = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Already has px — keep as-is
      if (token.endsWith('px')) {
        result.push(token);
        continue;
      }
      // Already a percentage — keep as-is
      if (token.endsWith('%')) {
        result.push(token);
        continue;
      }
      // Plain number — check if next token is a unit (px, %)
      if (/^\d+(\.\d+)?$/.test(token)) {
        if (i + 1 < tokens.length && /^(px|%)$/i.test(tokens[i + 1])) {
          result.push(`${token}${tokens[i + 1]}`);
          i++; // Skip the unit token — it's been combined
        } else {
          result.push(`${token}px`);
        }
        continue;
      }
      // Fallback — return as-is
      result.push(token);
    }

    return result.join(' ');
  }

  /**
   * Get the current value (for input layers)
   */
  get_value() {
    return null;
  }

  get_element() { return this._element; }

  /**
   * Set a property and update the DOM element if rendered
   */
  set_property(name, value) {
    this[name] = value;
    this._applyPropertyToElement(name, value);
  }

  _applyPropertyToElement(name, value) {
    if (!this._element) return;
    switch (name) {
      case 'colour':
        this._element.style.backgroundColor = this._parseColour(value);
        break;
      case 'opacity':
        this._element.style.opacity = this._parseOpacity(value);
        break;
      case 'size':
        this._element.style.width = typeof value.width === 'number' ? `${value.width}px` : value.width;
        this._element.style.height = typeof value.height === 'number' ? `${value.height}px` : value.height;
        break;
      case 'position':
        this._element.style.transform = `translate(calc(-50% + ${value.x}px), calc(-50% + ${value.y}px)) rotate(${this._parseRotate(this.rotate)})`;
        break;
      case 'rotate':
        this._element.style.transform = `translate(calc(-50% + ${this.position.x}px), calc(-50% + ${this.position.y}px)) rotate(${this._parseRotate(value)})`;
        break;
      case 'rounded_corners':
        this._element.style.borderRadius = this._parseRoundedCorners(value);
        break;
      case 'index':
        this._element.style.zIndex = value;
        break;
      case 'layer_enabled':
        this._element.style.display = value ? '' : 'none';
        break;
    }
  }
}

module.exports = BaseLayer;