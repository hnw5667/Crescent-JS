/**
 * Collect - Gathers data from input layers across objects/pages
 */

class Collect {
  constructor(config) {
    this.collect_id = config.collect_id;
    this.sources = config.sources || [];
    this.transform = config.transform || null;
    this.validate = config.validate || null;
    this._data = null;
  }

  /**
   * Collect values from all sources
   */
  collect() {
    const data = {};

    for (const source of this.sources) {
      if (source && typeof source.get_value === 'function') {
        data[source.layer_id || source.object_id || 'unknown'] = source.get_value();
      } else if (source && typeof source.get_values === 'function') {
        data[source.page_id || 'unknown'] = source.get_values();
      }
    }

    // Apply transform if provided
    this._data = this.transform ? this.transform(data) : data;

    // Validate if provided
    if (this.validate && !this.validate(this._data)) {
      throw new Error('Collect validation failed');
    }

    return this._data;
  }

  /**
   * Get the last collected data
   */
  get_data() {
    return this._data;
  }

  /**
   * Add a source to collect from
   */
  add_source(source) {
    this.sources.push(source);
    return this;
  }

  /**
   * Set a transform function
   */
  set_transform(fn) {
    this.transform = fn;
    return this;
  }

  /**
   * Set a validation function
   */
  set_validate(fn) {
    this.validate = fn;
    return this;
  }

  /**
   * Send collected data to an API endpoint
   */
  async send(url, options = {}) {
    const data = this.collect();
    const response = await fetch(url, {
      method: options.method || 'POST',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

module.exports = Collect;