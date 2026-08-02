/**
 * TextLayer - Renders text with per-character property overrides
 * 
 * Format from spec:
 *   layer_id/name = {
 *     layer_type = text
 *     layer_enabled = true
 *     .text = "abcdefxx"
 *     .colour = 0,0,0
 *     .size = 10
 *     .spacing = 10 px
 *     .font = inter
 *     .strike = true
 *     .underline = false
 *     .highlight = true
 *     .bold = true
 *     property(abc'de'fxx) = { ... overrides for 'de' ... }
 *   }
 * 
 * The property() syntax selects a substring (marked with single quotes)
 * and applies style overrides to those characters.
 * 
 * For multi-character selections: spacing = { internal: X, external: Y }
 * For single-character selections: spacing = X (just external)
 */

const BaseLayer = require('./base_layer');

class TextLayer extends BaseLayer {
  constructor(config) {
    super(config);
    this.layer_type = 'text';
    this.text = config.text || '';
    this.size = config.size || 16;          // font size
    this.spacing = config.spacing || '0px'; // letter spacing
    this.font = config.font || 'sans-serif';
    this.strike = config.strike || false;
    this.underline = config.underline || false;
    this.highlight = config.highlight || false;
    this.bold = config.bold || false;
    // properties: array of { range: [start, end], ...style overrides }
    this.properties = config.properties || [];
  }

  render() {
    if (!this.layer_enabled) {
      const div = document.createElement('div');
      div.style.display = 'none';
      this._element = div;
      return div;
    }

    const container = document.createElement('div');
    container.dataset.layerId = this.layer_id;
    container.dataset.layerType = 'text';

    // Position using cartesian coordinates
    container.style.position = 'absolute';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.transform = `translate(calc(-50% + ${this.position.x}px), calc(-50% + ${this.position.y}px)) rotate(${this._parseRotate(this.rotate)})`;

    // Size
    container.style.width = typeof this.size.width === 'number' ? `${this.size.width}px` : (this.size.width || 'auto');
    container.style.height = typeof this.size.height === 'number' ? `${this.size.height}px` : (this.size.height || 'auto');

    // Styling
    container.style.opacity = this._parseOpacity(this.opacity);
    container.style.borderRadius = this._parseRoundedCorners(this.rounded_corners);
    container.style.overflow = 'hidden';
    container.style.zIndex = this.index;

    // Build the text with per-character spans
    const p = document.createElement('p');
    p.style.margin = '0';
    p.style.padding = '0';
    p.style.lineHeight = '1.2';
    p.style.fontFamily = this.font;
    p.style.fontSize = typeof this.size === 'number' ? `${this.size}px` : this.size;
    p.style.letterSpacing = typeof this.spacing === 'string' ? this.spacing : `${this.spacing}px`;
    p.style.color = this._parseColour(this.colour);

    // Build character spans with property overrides
    const chars = this.text.split('');
    const overrides = this._buildOverrideMap();

    let currentSpan = null;
    let currentStyleKey = null;

    for (let i = 0; i < chars.length; i++) {
      const override = overrides[i] || null;
      const styleKey = override ? JSON.stringify(override) : 'default';

      if (styleKey !== currentStyleKey || !currentSpan) {
        currentSpan = document.createElement('span');
        const style = override || this._getDefaultStyle();
        this._applySpanStyle(currentSpan, style);
        p.appendChild(currentSpan);
        currentStyleKey = styleKey;
      }

      currentSpan.textContent += chars[i];
    }

    container.appendChild(p);
    this._element = container;
    return container;
  }

  /**
   * Build a map of character index → style override
   * properties: [{ range: [start, end], colour, size, spacing, font, strike, underline, highlight, bold }]
   */
  _buildOverrideMap() {
    const map = {};
    for (const prop of this.properties) {
      if (!prop.range || prop.range.length < 2) continue;
      const [start, end] = prop.range;
      for (let i = start; i <= end; i++) {
        map[i] = prop;
      }
    }
    return map;
  }

  _getDefaultStyle() {
    return {
      colour: this.colour,
      size: this.size,
      spacing: this.spacing,
      font: this.font,
      strike: this.strike,
      underline: this.underline,
      highlight: this.highlight,
      bold: this.bold
    };
  }

  _applySpanStyle(span, style) {
    span.style.color = this._parseColour(style.colour || this.colour);
    span.style.fontSize = typeof style.size === 'number' ? `${style.size}px` : (style.size || `${this.size}px`);
    span.style.fontFamily = style.font || this.font;
    span.style.fontWeight = style.bold ? 'bold' : 'normal';

    const decorations = [];
    if (style.underline) decorations.push('underline');
    if (style.strike) decorations.push('line-through');
    span.style.textDecoration = decorations.length > 0 ? decorations.join(' ') : 'none';

    if (style.highlight) {
      span.style.backgroundColor = 'yellow';
    }

    // Spacing handling
    if (style.spacing) {
      if (typeof style.spacing === 'object') {
        // Multi-char selection: internal = letter-spacing, external = margin
        if (style.spacing.internal) {
          span.style.letterSpacing = typeof style.spacing.internal === 'string'
            ? style.spacing.internal
            : `${style.spacing.internal}px`;
        }
        if (style.spacing.external) {
          span.style.marginLeft = typeof style.spacing.external === 'string'
            ? style.spacing.external
            : `${style.spacing.external}px`;
          span.style.marginRight = typeof style.spacing.external === 'string'
            ? style.spacing.external
            : `${style.spacing.external}px`;
        }
      } else {
        // Single value or string
        span.style.letterSpacing = typeof style.spacing === 'string'
          ? style.spacing
          : `${style.spacing}px`;
      }
    }
  }

  _applyPropertyToElement(name, value) {
    if (!this._element) return;

    if (name === 'text') {
      // Re-render for text changes
      const parent = this._element.parentNode;
      if (parent) {
        const newEl = this.render();
        parent.replaceChild(newEl, this._element);
      }
      return;
    }

    // Find the inner <p> element
    const p = this._element.querySelector('p');
    if (!p) return;

    switch (name) {
      case 'size':
        p.style.fontSize = typeof value === 'number' ? `${value}px` : value;
        break;
      case 'font':
        p.style.fontFamily = value;
        break;
      case 'spacing':
        p.style.letterSpacing = typeof value === 'string' ? value : `${value}px`;
        break;
      case 'colour':
        p.style.color = this._parseColour(value);
        break;
      default:
        // Fall through to BaseLayer for position, opacity, etc.
        super._applyPropertyToElement(name, value);
        break;
    }
  }
}

module.exports = TextLayer;