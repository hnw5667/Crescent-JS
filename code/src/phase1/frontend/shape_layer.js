/**
 * ShapeLayer - Renders shapes with configurable vertices
 * 
 * Format from spec:
 *   layer_id/name = {
 *     layer_type = shape
 *     layer_enabled = true
 *     layer_vertices = 4
 *     .size = height x width
 *     .colour = 0,0,0
 *     .opacity = 100%
 *     .rounded_corners = 10 px
 *     .rotate = 360 deg
 *   }
 * 
 * Vertices determine the shape:
 *   3 = triangle, 4 = rectangle, 5+ = polygon
 *   0 or "circle" = circle/ellipse
 */

const BaseLayer = require('./base_layer');

class ShapeLayer extends BaseLayer {
  constructor(config) {
    super(config);
    this.layer_type = 'shape';
    this.layer_vertices = config.layer_vertices || 4;
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
    container.dataset.layerType = 'shape';

    // Position using cartesian coordinates
    container.style.position = 'absolute';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.transform = `translate(calc(-50% + ${this.position.x}px), calc(-50% + ${this.position.y}px)) rotate(${this._parseRotate(this.rotate)})`;

    // Size
    const w = typeof this.size.width === 'number' ? this.size.width : parseInt(this.size.width) || 100;
    const h = typeof this.size.height === 'number' ? this.size.height : parseInt(this.size.height) || 100;
    container.style.width = `${w}px`;
    container.style.height = `${h}px`;

    // Styling
    container.style.opacity = this._parseOpacity(this.opacity);
    container.style.zIndex = this.index;
    container.style.overflow = 'hidden';

    // Create the shape using SVG or CSS
    const vertices = this.layer_vertices;
    const isCircle = vertices === 0 || vertices === 'circle' || vertices === '0';

    if (isCircle) {
      // Circle/ellipse
      container.style.borderRadius = '50%';
      container.style.backgroundColor = this._parseColour(this.colour);
    } else if (vertices === 3) {
      // Triangle - use SVG
      const svg = this._createPolygonSVG(w, h, vertices);
      container.appendChild(svg);
    } else if (vertices === 4) {
      // Rectangle - just a div with background
      container.style.borderRadius = this._parseRoundedCorners(this.rounded_corners);
      container.style.backgroundColor = this._parseColour(this.colour);
    } else {
      // Polygon with 5+ vertices - use SVG
      const svg = this._createPolygonSVG(w, h, vertices);
      container.appendChild(svg);
    }

    this._element = container;
    return container;
  }

  /**
   * Create an SVG polygon with the given number of vertices
   */
  _createPolygonSVG(width, height, vertices) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const polygon = document.createElementNS(ns, 'polygon');
    const points = this._calculatePolygonPoints(width, height, vertices);
    polygon.setAttribute('points', points);
    polygon.setAttribute('fill', this._parseColour(this.colour));

    svg.appendChild(polygon);
    return svg;
  }

  /**
   * Calculate polygon points for a regular polygon
   */
  _calculatePolygonPoints(width, height, vertices) {
    const cx = width / 2;
    const cy = height / 2;
    const rx = width / 2;
    const ry = height / 2;
    const points = [];

    for (let i = 0; i < vertices; i++) {
      const angle = (2 * Math.PI * i / vertices) - Math.PI / 2;
      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }

    return points.join(' ');
  }

  _applyPropertyToElement(name, value) {
    if (!this._element) return;

    switch (name) {
      case 'layer_vertices': {
        // Re-render for vertex changes
        const parent = this._element.parentNode;
        if (parent) {
          const newEl = this.render();
          parent.replaceChild(newEl, this._element);
        }
        break;
      }
      case 'colour': {
        // Update fill colour
        const polygon = this._element.querySelector('polygon');
        if (polygon) {
          polygon.setAttribute('fill', this._parseColour(value));
        } else {
          this._element.style.backgroundColor = this._parseColour(value);
        }
        break;
      }
      default:
        super._applyPropertyToElement(name, value);
        break;
    }
  }
}

module.exports = ShapeLayer;