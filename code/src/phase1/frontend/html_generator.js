/**
 * HTML Generator - Build-Time HTML Generation for JS-First Component System
 *
 * This module runs on the development machine during the build step (not
 * client-side). It generates deterministic HTML from JS component definitions,
 * assigns section-based IDs (id="section-{name}"), and applies built-in CSS.
 *
 * The generated HTML is bundled and shipped alongside JS, then hydrated by
 * rocket.js at runtime.
 */

function sanitizeSectionName(name) {
  if (!name || typeof name !== 'string') return 'unknown';
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown';
}

function sectionId(name) {
  return 'section-' + sanitizeSectionName(name);
}

function parseColour(colour) {
  if (!colour || typeof colour !== 'string') return 'transparent';
  const parts = colour.split(',').map(s => s.trim());
  if (parts.length === 3) return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
  if (parts.length === 4) return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]})`;
  return colour;
}

function parseOpacity(opacity) {
  if (opacity == null) return '1';
  if (typeof opacity === 'string' && opacity.endsWith('%')) {
    return String(parseFloat(opacity) / 100);
  }
  return String(opacity);
}

function parseRoundedCorners(value) {
  if (typeof value === 'number') return `${value}px`;
  if (!value || typeof value !== 'string') return '0px';
  const trimmed = value.trim();
  if (!trimmed) return '0px';
  const tokens = trimmed.split(/\s+/);
  const result = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.endsWith('px') || token.endsWith('%')) { result.push(token); continue; }
    if (/^\d+(\.\d+)?$/.test(token)) {
      if (i + 1 < tokens.length && /^(px|%)$/i.test(tokens[i + 1])) {
        result.push(`${token}${tokens[i + 1]}`); i++;
      } else {
        result.push(`${token}px`);
      }
      continue;
    }
    result.push(token);
  }
  return result.join(' ');
}

function parseRotate(rotate) {
  if (rotate == null) return '0deg';
  if (typeof rotate === 'string' && rotate.endsWith('deg')) return rotate;
  return `${rotate}deg`;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function styleObjectToString(styleObj) {
  return Object.entries(styleObj)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

/**
 * Build inline CSS for a generic layer based on built-in properties.
 */
function layerToStyle(layer) {
  const style = {};

  // Size
  if (layer.size) {
    if (typeof layer.size === 'number') {
      style['font-size'] = `${layer.size}px`;
    } else if (typeof layer.size === 'object') {
      if (layer.size.width != null) style['width'] = typeof layer.size.width === 'number' ? `${layer.size.width}px` : String(layer.size.width);
      if (layer.size.height != null) style['height'] = typeof layer.size.height === 'number' ? `${layer.size.height}px` : String(layer.size.height);
    } else if (typeof layer.size === 'string') {
      // already css string
    }
  }

  // Position - cartesian centered fallback handled by container; per-layer absolute
  // If position provided, we give left/top for deterministic rendering
  if (layer.position && typeof layer.position.x === 'number') {
    // Keep absolute-centered technique for compatibility with renderer
    style['position'] = 'absolute';
  }

  if (layer.colour) style['background-color'] = parseColour(layer.colour);
  if (layer.opacity != null) style['opacity'] = parseOpacity(layer.opacity);
  if (layer.rounded_corners != null) style['border-radius'] = parseRoundedCorners(layer.rounded_corners);
  if (layer.rotate != null) style['transform'] = `rotate(${parseRotate(layer.rotate)})`;
  if (layer.index != null) style['z-index'] = String(layer.index);

  // Layer-type specific
  if (layer.layer_type === 'text') {
    if (typeof layer.size === 'number') style['font-size'] = `${layer.size}px`;
    if (layer.font) style['font-family'] = layer.font;
    if (layer.spacing) style['letter-spacing'] = typeof layer.spacing === 'string' ? layer.spacing : `${layer.spacing}px`;
    if (layer.colour) style['color'] = parseColour(layer.colour);
    if (layer.bold) style['font-weight'] = 'bold';
    const dec = [];
    if (layer.underline) dec.push('underline');
    if (layer.strike) dec.push('line-through');
    if (dec.length) style['text-decoration'] = dec.join(' ');
    if (layer.highlight) style['background-color'] = 'yellow';
  }

  if (layer.layer_type === 'shape') {
    const vertices = layer.layer_vertices;
    const isCircle = vertices === 0 || vertices === 'circle' || vertices === '0';
    if (isCircle) style['border-radius'] = '50%';
  }

  if (layer.layer_type === 'react' || layer.layer_type === 'angular') {
    // Framework layers (v2.7.0): optimised to fit like a layer — constrained
    // box, clipped overflow, content containment.
    style['overflow'] = 'hidden';
    style['box-sizing'] = 'border-box';
    style['contain'] = 'content';
  }

  return style;
}

/**
 * Generate HTML for a single section (layer) with deterministic id="section-{name}".
 */
function generateSectionHTML(section) {
  if (!section || !section.name) throw new Error('Section must have a `name` property');
  const id = sectionId(section.name);
  const layerType = section.layer_type || 'text';
  const enabled = section.layer_enabled !== false;
  const displayStyle = enabled ? '' : 'display:none;';
  const css = layerToStyle(section);
  const styleStr = styleObjectToString(css);
  const combinedStyle = displayStyle + (styleStr ? (displayStyle ? '' : '') + styleStr : '');

  const fwAttr = (layerType === 'react' || layerType === 'angular')
    ? ` data-framework="${escapeHtml(String(layerType).toLowerCase())}"`
    : '';
  const dataAttrs = `data-section="${escapeHtml(section.name)}" data-layer-type="${escapeHtml(layerType)}" data-layer-id="${escapeHtml(section.layer_id || section.name)}"${fwAttr}`;

  let inner = '';
  switch (layerType) {
    case 'text': {
      const text = escapeHtml(section.text || '');
      const props = section.properties || [];
      if (props.length > 0) {
        // Simple per-character override: wrap in spans if needed
        // For build-time we generate separate spans for overridden ranges
        const chars = (section.text || '').split('');
        const overrideMap = {};
        for (const prop of props) {
          if (!prop.range || prop.range.length < 2) continue;
          const [start, end] = prop.range;
          for (let i = start; i <= end; i++) overrideMap[i] = prop;
        }
        let html = '';
        let curKey = null;
        let curSpanOpen = false;
        let buffer = '';
        function flush() {
          if (buffer) {
            html += curSpanOpen ? `<span style="${spanStyleFor(curKey)}">${escapeHtml(buffer)}</span>` : escapeHtml(buffer);
            buffer = '';
          }
        }
        function spanStyleFor(prop) {
          if (!prop) return '';
          const s = [];
          if (prop.colour) s.push(`color:${parseColour(prop.colour)}`);
          if (prop.size) s.push(`font-size:${typeof prop.size === 'number' ? prop.size + 'px' : prop.size}`);
          if (prop.font) s.push(`font-family:${prop.font}`);
          if (prop.bold) s.push('font-weight:bold');
          const dec = [];
          if (prop.underline) dec.push('underline');
          if (prop.strike) dec.push('line-through');
          if (dec.length) s.push(`text-decoration:${dec.join(' ')}`);
          if (prop.highlight) s.push('background-color:yellow');
          if (prop.spacing) {
            if (typeof prop.spacing === 'object') {
              if (prop.spacing.internal) s.push(`letter-spacing:${typeof prop.spacing.internal === 'string' ? prop.spacing.internal : prop.spacing.internal + 'px'}`);
            } else {
              s.push(`letter-spacing:${typeof prop.spacing === 'string' ? prop.spacing : prop.spacing + 'px'}`);
            }
          }
          return s.join(';');
        }
        for (let i = 0; i < chars.length; i++) {
          const override = overrideMap[i] || null;
          const key = override ? JSON.stringify(override) : 'default';
          if (key !== curKey) {
            flush();
            if (curSpanOpen) { curSpanOpen = false; }
            curKey = key;
            if (override) curSpanOpen = true;
            buffer += chars[i];
          } else {
            buffer += chars[i];
          }
        }
        flush();
        // If no override spans needed, just wrap in p
        inner = `<p style="margin:0;padding:0;line-height:1.2;${layerType === 'text' && section.font ? `font-family:${escapeHtml(section.font)};` : ''}">${html || text}</p>`;
      } else {
        const pStyle = [];
        if (section.font) pStyle.push(`font-family:${escapeHtml(section.font)}`);
        if (typeof section.size === 'number') pStyle.push(`font-size:${section.size}px`);
        if (section.spacing) pStyle.push(`letter-spacing:${typeof section.spacing === 'string' ? escapeHtml(section.spacing) : section.spacing + 'px'}`);
        if (section.colour) pStyle.push(`color:${parseColour(section.colour)}`);
        if (section.bold) pStyle.push('font-weight:bold');
        const dec = [];
        if (section.underline) dec.push('underline');
        if (section.strike) dec.push('line-through');
        if (dec.length) pStyle.push(`text-decoration:${dec.join(' ')}`);
        if (section.highlight) pStyle.push('background-color:yellow');
        inner = `<p style="${pStyle.join(';')};margin:0;padding:0;line-height:1.2">${text}</p>`;
      }
      break;
    }
    case 'image': {
      const src = escapeHtml(section.image_location || '');
      inner = `<img src="${src}" alt="${escapeHtml(section.name)}" style="width:100%;height:100%;object-fit:cover;display:block" />`;
      if (section.colour && section.colour !== '0,0,0') {
        inner += `<div style="position:absolute;top:0;left:0;width:100%;height:100%;background-color:${parseColour(section.colour)};mix-blend-mode:multiply;pointer-events:none"></div>`;
      }
      break;
    }
    case 'shape': {
      const vertices = section.layer_vertices;
      const isCircle = vertices === 0 || vertices === 'circle' || vertices === '0';
      if (isCircle) {
        // circle already via border-radius 50%
        inner = '';
      } else if (vertices === 3 || (typeof vertices === 'number' && vertices >= 5)) {
        // polygon via inline SVG
        const w = (section.size && section.size.width) || 100;
        const h = (section.size && section.size.height) || 100;
        const nw = typeof w === 'number' ? w : parseInt(w) || 100;
        const nh = typeof h === 'number' ? h : parseInt(h) || 100;
        const points = calculatePolygonPoints(nw, nh, Number(vertices));
        inner = `<svg width="100%" height="100%" viewBox="0 0 ${nw} ${nh}" style="display:block"><polygon points="${points}" fill="${parseColour(section.colour || '0,0,0')}"></polygon></svg>`;
      } else {
        // rectangle: no inner needed
        inner = '';
      }
      break;
    }
    case 'input': {
      if (section.input_method === 'list') {
        const elems = section.list_elements || [];
        const isRadio = section.select === 'one' || section.select == null;
        inner = `<div style="display:flex;flex-direction:column;gap:4px;padding:8px">` +
          elems.map(e => {
            const type = isRadio ? 'radio' : 'checkbox';
            return `<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="${type}" name="${escapeHtml(section.layer_id || section.name)}" value="${escapeHtml(e)}" /><span>${escapeHtml(e)}</span></label>`;
          }).join('') +
          `</div>`;
      } else {
        const placeholder = escapeHtml(section.box_inner_text || '');
        const size = section.box_length || 20;
        inner = `<input type="text" name="${escapeHtml(section.layer_id || section.name)}" placeholder="${placeholder}" size="${size}" style="width:100%;padding:8px 12px;border:1px solid #ccc;border-radius:${parseRoundedCorners(section.rounded_corners || '4px')};outline:none;font-family:${escapeHtml(section.written_inner_text_font || section.box_inner_text_font || 'sans-serif')};color:${parseColour(section.colour_text_written || section.colour_text || '0,0,0')};font-size:14px" />`;
      }
      break;
    }
    case 'react':
    case 'angular': {
      // Framework layer (v2.7.0): `code` holds the snippet; layer_id is either
      // the framework name or '<framework>:<name>' so several layers per
      // framework coexist. Build-time HTML keeps the snippet inert (escaped)
      // inside a UNIQUE mount (id = sanitize(layer_id) + '-mount') that is
      // constrained so it fits like a layer; overflow is reported at runtime
      // by FrameworkLayer.check_overflow().
      const sectionLayerId = String(section.layer_id || section.name || layerType);
      const fw = (layerType === 'react' || layerType === 'angular')
        ? String(layerType).toLowerCase()
        : (sectionLayerId.indexOf('angular:') === 0 ? 'angular' : 'react');
      const mountId = sanitizeSectionName(sectionLayerId) + '-mount';
      const code = section.code != null && typeof section.code === 'string' ? section.code : '';
      inner = `<div data-framework-content="${fw}" id="${mountId}" style="width:100%;height:100%;max-width:100%;max-height:100%;overflow:hidden;box-sizing:border-box;contain:content"></div>` +
        `<script type="text/plain" data-framework-code="${mountId}">${escapeHtml(code)}</script>` +
        `<div data-framework-error-slot="${fw}" style="display:none"></div>`;
      break;
    }
    default: {
      const text = escapeHtml(section.text || section.name || '');
      inner = `<span>${text}</span>`;
    }
  }

  const positionStyle = section.position ? `left:calc(50% + ${section.position.x}px);top:calc(50% + ${section.position.y}px);transform:translate(-50%, -50%) rotate(${parseRotate(section.rotate || '0deg')});position:absolute;` : 'position:relative;';

  // Merge position style if not already absolute
  let finalStyle = combinedStyle;
  if (section.position) {
    finalStyle = (finalStyle ? finalStyle + ';' : '') + positionStyle;
  } else {
    // ensure at least relative for layout
    finalStyle = (finalStyle ? finalStyle + ';' : '') + 'position:relative;';
  }

  // Ensure size if present but not in css
  if (section.size && typeof section.size === 'object') {
    if (section.size.width != null && !finalStyle.includes('width')) {
      finalStyle += `width:${typeof section.size.width === 'number' ? section.size.width + 'px' : section.size.width};`;
    }
    if (section.size.height != null && !finalStyle.includes('height')) {
      finalStyle += `height:${typeof section.size.height === 'number' ? section.size.height + 'px' : section.size.height};`;
    }
  }

  return `<div id="${id}" ${dataAttrs} style="${finalStyle}">${inner}</div>`;
}

function calculatePolygonPoints(width, height, vertices) {
  const cx = width / 2, cy = height / 2, rx = width / 2, ry = height / 2;
  const points = [];
  for (let i = 0; i < vertices; i++) {
    const angle = (2 * Math.PI * i / vertices) - Math.PI / 2;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
}

/**
 * Generate full HTML for a JS-First component (container + sections).
 * Build-time only (Node).
 */
function normalizeSections(sections) {
  if (!sections) return [];
  if (sections instanceof Map) return Array.from(sections.values());
  if (Array.isArray(sections)) return sections;
  if (typeof sections === 'object') return Object.values(sections);
  return [];
}

function normalizeSectionForHTML(raw) {
  const sec = Object.assign({}, raw);
  // Resolve name from various id fields
  const resolvedName = sec.name || sec.section_id || sec.section_name || sec.id || sec.layer_id;
  if (!resolvedName) throw new Error('Section must have a `name` or `section_id` property');
  sec.name = resolvedName;
  if (!sec.section_id) sec.section_id = resolvedName;
  if (!sec.layer_id) sec.layer_id = resolvedName;
  if (!sec.layer_type && sec.type) sec.layer_type = sec.type;
  if (!sec.layer_type) sec.layer_type = 'text';
  if (sec.position == null) sec.position = { x: 0, y: 0 };
  // Support content aliases
  if (sec.text == null && sec.content != null) sec.text = sec.content;
  if (sec.image_location == null && sec.imageLocation != null) sec.image_location = sec.imageLocation;
  return sec;
}

function generateComponentHTML(componentConfig) {
  if (!componentConfig || !componentConfig.component_id) throw new Error('componentConfig must have component_id');
  const componentId = sectionId(componentConfig.component_id);
  const rawSections = componentConfig.sections;
  const sections = normalizeSections(rawSections).map(normalizeSectionForHTML);
  const width = componentConfig.size && componentConfig.size.width ? (typeof componentConfig.size.width === 'number' ? componentConfig.size.width + 'px' : componentConfig.size.width) : 'auto';
  const height = componentConfig.size && componentConfig.size.height ? (typeof componentConfig.size.height === 'number' ? componentConfig.size.height + 'px' : componentConfig.size.height) : 'auto';

  const containerStyle = [
    `width:${width}`,
    `height:${height}`,
    'position:relative',
    'overflow:hidden',
    'box-sizing:border-box'
  ].join(';');

  const sectionsHTML = sections.map(s => generateSectionHTML(s)).join('\n');

  return `<div id="${componentId}" class="crescent-component" data-component-id="${escapeHtml(componentConfig.component_id)}" style="${containerStyle}">\n${sectionsHTML}\n</div>`;
}

/**
 * Generate HTML for a page composed of objects (legacy adapter).
 * Each object becomes a section-like div with id="section-{object_id}".
 */
function generatePageHTML(pageConfig) {
  if (!pageConfig || !pageConfig.page_id) throw new Error('pageConfig must have page_id');
  const pageId = sectionId(pageConfig.page_id);
  const bg = pageConfig.page_bg;
  let bgStyle = '';
  if (typeof bg === 'string') bgStyle = `background-color:${parseColour(bg)};`;
  const size = pageConfig.size || { width: 1200, height: 800 };
  const w = typeof size.width === 'number' ? size.width + 'px' : size.width;
  const h = typeof size.height === 'number' ? size.height + 'px' : size.height;
  const pageStyle = `width:${w};height:${h};position:relative;overflow:hidden;${bgStyle}`;

  const objects = pageConfig.objects_config || pageConfig.objects || [];
  const positions = pageConfig.position_config || pageConfig.position || {};
  const indices = pageConfig.index_config || pageConfig.index || {};

  const objectsHTML = objects.map(obj => {
    const id = obj.object_id || obj.id || 'unknown';
    const secId = sectionId(id);
    const pos = positions[id] || obj.page_position || { x: 0, y: 0 };
    const idx = indices[id] != null ? indices[id] : (obj.page_index || 0);
    // Serialize layers inside object as nested sections
    const layers = obj.layers instanceof Map ? Array.from(obj.layers.values()) : (obj.layers_config || obj.layers || []);
    const layersHTML = layers.map(layer => {
      const layerId = layer.layer_id || layer.name || 'layer';
      const layerSec = Object.assign({ name: layerId, layer_id: layerId, layer_type: layer.layer_type || 'text' }, layer);
      return generateSectionHTML(layerSec);
    }).join('\n');
    const objectSize = obj.size || { width: 400, height: 300 };
    const ow = typeof objectSize.width === 'number' ? objectSize.width + 'px' : objectSize.width;
    const oh = typeof objectSize.height === 'number' ? objectSize.height + 'px' : objectSize.height;
    const pixelLeft = `calc(50% + ${pos.x}px)`;
    const pixelTop = `calc(50% - ${pos.y}px)`;
    const objStyle = `position:absolute;left:${pixelLeft};top:${pixelTop};transform:translate(-50%, -50%);z-index:${idx};width:${ow};height:${oh};overflow:hidden;box-sizing:border-box`;
    return `<div id="${secId}" class="crescent-object" data-object-id="${escapeHtml(id)}" style="${objStyle}">\n${layersHTML}\n</div>`;
  }).join('\n');

  return `<div id="${pageId}" class="crescent-page" data-page-id="${escapeHtml(pageConfig.page_id)}" style="${pageStyle}">\n${objectsHTML}\n</div>`;
}

/**
 * Apply built-in CSS properties to an existing DOM element (runtime hydration helper).
 * Safe to call in browser or Node with a mock element having .style.
 */
function applyBuiltInCSS(element, layerConfig) {
  if (!element || !layerConfig) return;
  const style = element.style;
  if (!style) return;
  if (layerConfig.colour) style.backgroundColor = parseColour(layerConfig.colour);
  if (layerConfig.opacity != null) style.opacity = parseOpacity(layerConfig.opacity);
  if (layerConfig.rounded_corners != null) style.borderRadius = parseRoundedCorners(layerConfig.rounded_corners);
  if (layerConfig.rotate != null) style.transform = (style.transform || '') + ` rotate(${parseRotate(layerConfig.rotate)})`;
  if (layerConfig.size) {
    if (typeof layerConfig.size === 'object') {
      if (layerConfig.size.width != null) style.width = typeof layerConfig.size.width === 'number' ? `${layerConfig.size.width}px` : String(layerConfig.size.width);
      if (layerConfig.size.height != null) style.height = typeof layerConfig.size.height === 'number' ? `${layerConfig.size.height}px` : String(layerConfig.size.height);
    }
  }
  if (layerConfig.layer_type === 'text') {
    if (typeof layerConfig.size === 'number') style.fontSize = `${layerConfig.size}px`;
    if (layerConfig.font) style.fontFamily = layerConfig.font;
    if (layerConfig.spacing) style.letterSpacing = typeof layerConfig.spacing === 'string' ? layerConfig.spacing : `${layerConfig.spacing}px`;
    if (layerConfig.colour) style.color = parseColour(layerConfig.colour);
    if (layerConfig.bold) style.fontWeight = 'bold';
  }
}

/**
 * Create a DOM element for a component (client-side fallback when no pre-generated HTML).
 * Used by JSComponent.render().
 */
function createElement(componentConfig) {
  if (typeof document === 'undefined') return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = generateComponentHTML(componentConfig);
  return wrapper.firstElementChild;
}

/**
 * Runtime hydration: connect pre-generated HTML sections to JS component logic,
 * applying built-in CSS and invoking bindings.
 * @param {HTMLElement} container - root element containing section-* elements (or document)
 * @param {object|JSComponent} component - component with sections
 * @returns {{hydrated: string[], missing: string[], allHydrated: boolean}}
 */
function hydrate(container, component) {
  if (typeof document === 'undefined') {
    // Node fallback: return generated HTML
    try { return generateComponentHTML(component); } catch (e) { return null; }
  }
  const root = container || document;
  const sections = normalizeSections(component.sections).map(normalizeSectionForHTML);
  const hydrated = [];
  const missing = [];

  for (const section of sections) {
    const sid = sectionId(section.name);
    let el = null;
    try {
      if (root === document) {
        el = document.getElementById(sid);
      } else if (root.querySelector) {
        el = root.querySelector('#' + CSS.escape ? CSS.escape(sid) : sid) || document.getElementById(sid);
      }
      if (!el) el = document.getElementById(sid);
    } catch (e) {
      try { el = document.getElementById(sid); } catch (e2) {}
    }
    if (el) {
      applyBuiltInCSS(el, section);
      el.setAttribute('data-hydrated', 'true');
      el.setAttribute('data-component-id', component.component_id);
      // Invoke per-section hydration hook if present
      if (typeof section.onHydrate === 'function') {
        try { section.onHydrate(el, section); } catch (e) {}
      }
      if (component._bindings && typeof component._bindings[section.name] === 'function') {
        try { component._bindings[section.name](el, section); } catch (e) {}
      }
      // Also check bindings keyed by section_id
      if (component._bindings && typeof component._bindings[section.section_id] === 'function' && section.section_id !== section.name) {
        try { component._bindings[section.section_id](el, section); } catch (e) {}
      }
      hydrated.push(section.name);
    } else {
      missing.push(section.name);
    }
  }

  return {
    component_id: component.component_id,
    hydrated,
    missing,
    allHydrated: missing.length === 0
  };
}

module.exports = {
  sanitizeSectionName,
  sectionId,
  parseColour,
  parseOpacity,
  parseRoundedCorners,
  parseRotate,
  escapeHtml,
  layerToStyle,
  styleObjectToString,
  normalizeSections,
  normalizeSectionForHTML,
  generateSectionHTML,
  generateComponentHTML,
  generatePageHTML,
  applyBuiltInCSS,
  createElement,
  hydrate,
  calculatePolygonPoints
};
