/**
 * ImageLayer - Displays an image
 * 
 * Format from spec:
 *   layer_id/name = {
 *     layer_type = image
 *     layer_enabled = true
 *     image_location = "x_folder/y_image" (or) "www.xfolder.com/y_img"
 *     .size = height x width
 *     .colour = 0,0,0
 *     .opacity = 100%
 *     .rounded_corners = 10 px
 *     .rotate = 360 deg
 *   }
 */

const BaseLayer = require('./base_layer');

class ImageLayer extends BaseLayer {
  constructor(config) {
    super(config);
    this.layer_type = 'image';
    this.image_location = config.image_location || '';
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
    container.dataset.layerType = 'image';

    // Position using cartesian coordinates
    container.style.position = 'absolute';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.transform = `translate(calc(-50% + ${this.position.x}px), calc(-50% + ${this.position.y}px)) rotate(${this._parseRotate(this.rotate)})`;

    // Size
    container.style.width = typeof this.size.width === 'number' ? `${this.size.width}px` : this.size.width;
    container.style.height = typeof this.size.height === 'number' ? `${this.size.height}px` : this.size.height;

    // Styling
    container.style.opacity = this._parseOpacity(this.opacity);
    container.style.borderRadius = this._parseRoundedCorners(this.rounded_corners);
    container.style.overflow = 'hidden';
    container.style.zIndex = this.index;

    // Create the image element
    const img = document.createElement('img');
    img.src = this.image_location;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.display = 'block';

    // Apply colour overlay if specified
    if (this.colour && this.colour !== '0,0,0') {
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = this._parseColour(this.colour);
      overlay.style.mixBlendMode = 'multiply';
      overlay.style.pointerEvents = 'none';
      container.appendChild(img);
      container.appendChild(overlay);
    } else {
      container.appendChild(img);
    }

    this._element = container;
    return container;
  }

  _applyPropertyToElement(name, value) {
    if (!this._element) return;

    switch (name) {
      case 'image_location': {
        const img = this._element.querySelector('img');
        if (img) img.src = value;
        break;
      }
      default:
        super._applyPropertyToElement(name, value);
        break;
    }
  }
}

module.exports = ImageLayer;