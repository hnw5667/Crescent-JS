/**
 * InputLayer - Form inputs (text box and list)
 * 
 * Format from spec - Text Box:
 *   layer_id/name = {
 *     layer_type = input
 *     layer_enabled = true
 *     input_method = text box
 *     .box_length = 10
 *     .box_inner_text = 'Crescent Moon'
 *     .box_inner_text_properties = [underline, strike, bold, italic]
 *     .box_inner_text_font = inter
 *     .colour_text = 0,0,0
 *     .written_inner_text_properties = [underline, strike, bold, italic]
 *     .written_inner_text_font = inter
 *     .colour_text_written = 0,0,0
 *   }
 * 
 * Format from spec - List:
 *   layer_id/name = {
 *     layer_type = input
 *     layer_enabled = true
 *     input_method = list
 *     select = one | more_than_one | { min: N, max: M }
 *     .list_elements = { "item1", "item2" }
 *     ...same text styling as text box
 *   }
 * 
 * Collected via: collect.input.layer_id/name
 */

const BaseLayer = require('./base_layer');

class InputLayer extends BaseLayer {
  constructor(config) {
    super(config);
    this.layer_type = 'input';
    this.input_method = config.input_method || 'text box'; // 'text box' or 'list'
    
    // Text box properties
    this.box_length = config.box_length || 20;
    this.box_inner_text = config.box_inner_text || '';
    this.box_inner_text_properties = config.box_inner_text_properties || [];
    this.box_inner_text_font = config.box_inner_text_font || 'sans-serif';
    this.colour_text = config.colour_text || '0,0,0';
    this.written_inner_text_properties = config.written_inner_text_properties || [];
    this.written_inner_text_font = config.written_inner_text_font || 'sans-serif';
    this.colour_text_written = config.colour_text_written || '0,0,0';
    
    // List properties
    this.select = config.select || 'one'; // 'one', 'more_than_one', or { min, max }
    this.list_elements = config.list_elements || [];
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
    container.dataset.layerType = 'input';

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

    if (this.input_method === 'list') {
      this._renderList(container);
    } else {
      this._renderTextBox(container);
    }

    this._element = container;
    return container;
  }

  /**
   * Render a text input box
   */
  _renderTextBox(container) {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = this.layer_id;
    input.placeholder = this.box_inner_text;
    input.size = this.box_length;
    input.style.width = '100%';
    input.style.padding = '8px 12px';
    input.style.borderRadius = this._parseRoundedCorners(this.rounded_corners);
    input.style.border = '1px solid #ccc';
    input.style.outline = 'none';
    input.style.fontFamily = this.box_inner_text_font;
    input.style.color = this._parseColour(this.colour_text);
    input.style.backgroundColor = 'transparent';
    input.style.fontSize = '14px';

    // Apply placeholder text properties
    const placeholderProps = this.box_inner_text_properties;
    const decorations = [];
    if (placeholderProps.includes('underline')) decorations.push('underline');
    if (placeholderProps.includes('strike')) decorations.push('line-through');
    if (decorations.length > 0) input.style.textDecoration = decorations.join(' ');
    if (placeholderProps.includes('bold')) input.style.fontWeight = 'bold';
    if (placeholderProps.includes('italic')) input.style.fontStyle = 'italic';

    // Written text styling via CSS
    const writtenProps = this.written_inner_text_properties;
    const writtenDecorations = [];
    if (writtenProps.includes('underline')) writtenDecorations.push('underline');
    if (writtenProps.includes('strike')) writtenDecorations.push('line-through');

    // Apply written text font and colour via inline style
    input.style.fontFamily = this.written_inner_text_font;
    input.style.color = this._parseColour(this.colour_text_written);

    container.appendChild(input);
  }

  /**
   * Render a list input (select/radio/checkbox)
   */
  _renderList(container) {
    const selectMode = this.select;
    const isMultiple = selectMode === 'more_than_one' || (typeof selectMode === 'object' && selectMode.min !== undefined);
    const isRadio = selectMode === 'one';

    const listContainer = document.createElement('div');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'column';
    listContainer.style.gap = '4px';
    listContainer.style.padding = '8px';
    listContainer.style.borderRadius = this._parseRoundedCorners(this.rounded_corners);
    listContainer.style.border = '1px solid #ccc';
    listContainer.style.fontFamily = this.written_inner_text_font;
    listContainer.style.color = this._parseColour(this.colour_text_written);

    for (const element of this.list_elements) {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '6px';
      label.style.cursor = 'pointer';

      const input = document.createElement('input');
      input.type = isRadio ? 'radio' : 'checkbox';
      input.name = this.layer_id;
      input.value = element;

      const text = document.createElement('span');
      text.textContent = element;

      label.appendChild(input);
      label.appendChild(text);
      listContainer.appendChild(label);
    }

    container.appendChild(listContainer);
  }

  /**
   * Get the current value of this input
   */
  get_value() {
    if (!this._element) return null;

    if (this.input_method === 'list') {
      const checked = this._element.querySelectorAll('input:checked');
      return Array.from(checked).map(el => el.value);
    } else {
      const input = this._element.querySelector('input');
      return input ? input.value : null;
    }
  }

  _applyPropertyToElement(name, value) {
    if (!this._element) return;

    switch (name) {
      case 'box_inner_text': {
        const input = this._element.querySelector('input');
        if (input) input.placeholder = value;
        break;
      }
      case 'colour_text': {
        const input = this._element.querySelector('input[type="text"]');
        if (input) input.style.color = this._parseColour(value);
        break;
      }
      default:
        super._applyPropertyToElement(name, value);
        break;
    }
  }
}

module.exports = InputLayer;