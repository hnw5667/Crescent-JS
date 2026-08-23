/**
 * JSComponent - JS-First Component System for Crescent-js v1.0.6
 *
 * Users define components entirely in JavaScript (no HTML authoring).
 * The framework generates the full HTML + JS bindings from this single source
 * of truth, with section-based IDs (section-{name}) for deterministic DOM mapping.
 */

class JSComponent {
  constructor(config) {
    if (!config || !config.component_id) {
      throw new Error('JSComponent requires config.component_id');
    }
    this.component_id = config.component_id;
    this.component_name = config.component_name || config.component_id;
    this.component_enabled = config.component_enabled !== undefined ? config.component_enabled : true;
    this.size = config.size || null;
    this.style = config.style || {};
    this.className = config.className || config.class_name || '';
    this.modified_at = config.modified_at || Date.now();
    this._element = null;

    // Sections: canonical Map<sectionId, sectionConfig>
    this.sections = new Map();
    this._sectionOrder = [];

    const rawSections = config.sections || [];
    if (Array.isArray(rawSections)) {
      for (const s of rawSections) this.add_section(s);
    } else if (typeof rawSections === 'object') {
      for (const [key, val] of Object.entries(rawSections)) {
        // key is section name if val has no id
        if (typeof val === 'object' && val !== null) {
          const sec = Object.assign({}, val);
          if (!sec.section_id && !sec.section_name && !sec.name && !sec.id) {
            sec.section_id = key;
          }
          this.add_section(sec);
        } else {
          this.add_section({ section_id: key, content: val });
        }
      }
    }
  }

  /**
   * Normalize a section config and add it.
   * Accepts: { section_id | section_name | name | id, type?, content?, text?, html?, style?, props?, ... }
   */
  add_section(section) {
    if (!section || typeof section !== 'object') {
      throw new Error('section must be an object');
    }
    const id = section.section_id || section.section_name || section.name || section.id;
    if (!id) {
      throw new Error('section requires section_id / section_name / name / id');
    }
    const normalized = Object.assign({}, section);
    normalized.section_id = id;
    // also keep name for convenience
    normalized.section_name = section.section_name || section.name || id;
    // type defaults to 'section'
    normalized.type = normalized.type || normalized.section_type || 'section';
    if (!this.sections.has(id)) {
      this._sectionOrder.push(id);
    }
    this.sections.set(id, normalized);
    this.modified_at = Date.now();
    return this;
  }

  remove_section(section_id) {
    this.sections.delete(section_id);
    this._sectionOrder = this._sectionOrder.filter(x => x !== section_id);
    this.modified_at = Date.now();
    return this;
  }

  get_section(section_id) {
    return this.sections.get(section_id) || null;
  }

  get_sections() {
    return this._sectionOrder.map(id => this.sections.get(id));
  }

  get_section_ids() {
    return [...this._sectionOrder];
  }

  has_section(section_id) {
    return this.sections.has(section_id);
  }

  set_property(name, value) {
    this[name] = value;
    this.modified_at = Date.now();
    return this;
  }

  set_section_property(section_id, prop, value) {
    const sec = this.sections.get(section_id);
    if (!sec) throw new Error(`Section "${section_id}" not found in component "${this.component_id}"`);
    sec[prop] = value;
    this.modified_at = Date.now();
    return this;
  }

  /**
   * Runtime render: creates DOM element with section-based IDs.
   * This is the client-side path (hydrate will reuse pre-generated HTML).
   */
  render() {
    // Use HtmlGenerator if available, otherwise inline
    try {
      const HtmlGenerator = require('./html_generator');
      const container = HtmlGenerator.createElement(this);
      this._element = container;
      return container;
    } catch (e) {
      // Fallback: simple div creation (no generator)
      const div = typeof document !== 'undefined' ? document.createElement('div') : null;
      if (!div) return null;
      div.id = `component-${this.component_id}`;
      div.dataset.componentId = this.component_id;
      for (const sec of this.get_sections()) {
        const el = document.createElement('div');
        el.id = `section-${sec.section_id}`;
        el.dataset.sectionId = sec.section_id;
        el.textContent = sec.content || sec.text || sec.html || '';
        div.appendChild(el);
      }
      this._element = div;
      return div;
    }
  }

  get_element() {
    return this._element;
  }

  /**
   * Serialize to plain object for caching/bundling.
   */
  serialize() {
    return {
      component_id: this.component_id,
      component_name: this.component_name,
      component_enabled: this.component_enabled,
      size: this.size,
      style: this.style,
      className: this.className,
      sections: this.get_sections().map(s => Object.assign({}, s)),
      modified_at: this.modified_at
    };
  }

  toJSON() {
    return this.serialize();
  }

  // ===== JS-First build-time APIs (v1.0.6) =====
  generate_html() {
    const HtmlGenerator = require('./html_generator');
    // Normalize sections to shape expected by generator (name field)
    const normalized = this.get_sections().map(s => Object.assign({}, s, {
      name: s.section_id || s.section_name || s.name || s.id,
      layer_type: s.layer_type || s.type || 'text',
      layer_id: s.layer_id || s.section_id
    }));
    return HtmlGenerator.generateComponentHTML({
      component_id: this.component_id,
      size: this.size,
      sections: normalized
    });
  }

  generateHTML() { return this.generate_html(); }

  to_html() { return this.generate_html(); }

  bundle() {
    const html = this.generate_html();
    const js = this.serialize();
    const sections = this.get_sections().map(s => ({
      name: s.section_id,
      id: 'section-' + String(s.section_id).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '-'),
      layer_type: s.layer_type || s.type || 'text',
      layer_id: s.section_id
    }));
    return { component_id: this.component_id, js, html, sections, timestamp: Date.now() };
  }

  hydrate(container) {
    const HtmlGenerator = require('./html_generator');
    return HtmlGenerator.hydrate(container || (typeof document !== 'undefined' ? document : null), this);
  }

  bind_section(sectionId, fn) {
    if (!this._bindings) this._bindings = {};
    this._bindings[sectionId] = fn;
    return this;
  }
  bindSection(s, fn) { return this.bind_section(s, fn); }

  touch() { this.modified_at = Date.now(); return this; }
}

module.exports = JSComponent;
