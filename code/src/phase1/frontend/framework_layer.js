/**
 * FrameworkLayer - Embed a React or Angular snippet as a Crescent.js layer (v2.7.0)
 *
 * Spec:
 *   - `layer_id` is the framework name ('react' | 'angular') OR a named id
 *     '<framework>:<name>' (e.g. 'react:hero'). Several layers of the same
 *     framework can therefore coexist on one page and inside one object.
 *   - `code` is either (a) string source, (b) a React/Angular component
 *     function, or (c) { component, props }.
 *   - The framework optimises the snippet so it fits inside the layer box.
 *   - If the content goes out of the layer bounds, an error is shown.
 *   - `layer.mount(target?, deps?)` really mounts component-form code
 *     (React via ReactDOM.createRoot, Angular via createComponent) and never
 *     evals string source: strings are inert build-time previews unless the
 *     developer supplies a `compile` hook in the layer config.
 *   - `react`, `react-dom` and `@angular/core` are devDependencies (optional at
 *     runtime — the layer works without them, they only enable live mounting).
 *
 * Example:
 *   const reactLayer = crescent.layer({
 *     layer_id: 'react',
 *     code: 'function App(){ return "Hello" }',
 *     size: { height: 200, width: 300 }
 *   });
 *
 *   const hero = crescent.layer({
 *     layer_id: 'react:hero',          // second React layer on the same page
 *     code: HeroComponent,             // real component -> mounts live
 *     props: { title: 'Hero' },
 *     size: { height: 200, width: 300 }
 *   });
 */

const BaseLayer = require('./base_layer');

const SUPPORTED_FRAMEWORKS = ['react', 'angular'];
const NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

function tryRequire(name) {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(name);
  } catch (e) {
    return null;
  }
}

function normalizeFrameworkName(value) {
  if (typeof value !== 'string') return null;
  const lower = value.trim().toLowerCase();
  return SUPPORTED_FRAMEWORKS.includes(lower) ? lower : null;
}

/**
 * Parse a framework layer id.
 *   'react'        -> { framework: 'react', id: 'react' }
 *   'react:hero'   -> { framework: 'react', id: 'react:hero' }
 *   'vue'          -> null
 *   'react:bad hi' -> null
 * The framework prefix is case-insensitive (normalised to lowercase,
 * e.g. 'React:Hero' -> id 'react:Hero'); the name part is case-sensitive and
 * must match [A-Za-z0-9_-]+.
 */
function parseFrameworkId(value) {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;
  const colon = raw.indexOf(':');
  const framework = normalizeFrameworkName(colon === -1 ? raw : raw.slice(0, colon));
  if (!framework) return null;
  if (colon === -1) return { framework, id: framework };
  const name = raw.slice(colon + 1);
  if (!NAME_PATTERN.test(name)) return null;
  return { framework, id: `${framework}:${name}` };
}

/**
 * Validate a framework-layer config. Throws with an actionable message.
 * Returns { framework, id } — the resolved framework name and the full layer_id.
 */
function validateFrameworkConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error(
      "Framework layer requires a config object like { layer_id: 'react', code: '...' }."
    );
  }
  const parsedId = parseFrameworkId(config.layer_id);
  // layer_id must be a framework name or '<framework>:<name>'.
  if (!parsedId) {
    throw new Error(
      `Framework layer layer_id must be 'react', 'angular', or '<framework>:<name>' ` +
      `where <name> matches [A-Za-z0-9_-]+. Got layer_id=${JSON.stringify(config.layer_id)}. ` +
      `Example: crescent.layer({ layer_type: 'react', layer_id: 'react', code: '...' })`
    );
  }
  const fromType = normalizeFrameworkName(config.layer_type);
  // If layer_type is given and is a framework name, it must match layer_id's prefix.
  if (fromType && fromType !== parsedId.framework) {
    throw new Error(
      `Framework layer mismatch: layer_id=${JSON.stringify(parsedId.id)} ` +
      `but layer_type=${JSON.stringify(config.layer_type)}. ` +
      `Set layer_type to '${parsedId.framework}'.`
    );
  }
  // If layer_type is set to something else entirely (e.g. 'text') while the id
  // names a framework, that is almost certainly a mistake — reject loudly.
  if (config.layer_type && !fromType) {
    throw new Error(
      `Framework layer "${parsedId.id}" must use layer_type '${parsedId.framework}' ` +
      `(got layer_type=${JSON.stringify(config.layer_type)}).`
    );
  }
  const code = config.code;
  const isComponentForm = typeof code === 'function'
    || (code && typeof code === 'object' && typeof code.component === 'function');
  if (!(isComponentForm || (typeof code === 'string' && code.trim()))) {
    throw new Error(
      `Framework layer "${parsedId.id}" requires "code" as a non-empty string, ` +
      `a component function, or { component, props }. ` +
      `Example: crescent.layer({ layer_id: '${parsedId.framework}', code: '<h1>Hello</h1>' })`
    );
  }
  return parsedId;
}

/** Normalise a layer_id into a unique, CSS-safe mount-node id. */
function sanitizeMountId(layerId) {
  const out = String(layerId === 0 ? String(layerId) : (layerId || ''))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (out || 'unknown') + '-mount';
}

class FrameworkLayer extends BaseLayer {
  constructor(config) {
    const parsed = validateFrameworkConfig(config || {});
    super(config);
    // layer.framework = the resolved framework name (canonical prefix).
    this.framework = parsed.framework;
    // layer.layer_id = the full unique id ('react' | 'react:hero' | ...), so
    // add_layer / set_layer_position keep working unchanged.
    this.layer_id = parsed.id;
    this.layer_type = parsed.framework;
    this.code = config.code;
    this.props = config.props || null;
    // Optional compile hook: turns string source into a mountable component.
    this.compile = typeof config.compile === 'function' ? config.compile : null;
    this._element = null;
  }

  get_framework() {
    return this.framework;
  }

  get_code() {
    return this.code;
  }

  /**
   * Optimisation: layer content must fit inside the layer box.
   * Returns { fits, overflowX, overflowY } for explicit sizes so callers
   * (and tests) can check without a DOM.
   */
  static measure_fit(layerSize, contentSize) {
    const lw = typeof layerSize.width === 'number' ? layerSize.width : parseFloat(layerSize.width);
    const lh = typeof layerSize.height === 'number' ? layerSize.height : parseFloat(layerSize.height);
    const cw = typeof contentSize.width === 'number' ? contentSize.width : parseFloat(contentSize.width);
    const ch = typeof contentSize.height === 'number' ? contentSize.height : parseFloat(contentSize.height);
    const overflowX = cw > lw;
    const overflowY = ch > lh;
    return { fits: !overflowX && !overflowY, overflowX, overflowY, layer: { width: lw, height: lh }, content: { width: cw, height: ch } };
  }

  /**
   * Assert content fits; throws the same error the renderer shows visually.
   */
  assert_fits(contentSize) {
    const result = FrameworkLayer.measure_fit(this.size, contentSize);
    if (!result.fits) {
      throw new Error(
        `Framework layer "${this.framework}" overflow: content ` +
        `(${result.content.width}x${result.content.height}) exceeds layer ` +
        `(${result.layer.width}x${result.layer.height}). ` +
        `Shrink the snippet or enlarge size { height, width }.`
      );
    }
    return result;
  }

  /**
   * Build the overflow error message (shared by DOM + Node paths).
   */
  overflow_error_text(details) {
    return (
      `Framework layer "${this.framework}" overflow: content goes out of the layer bounds` +
      (details ? ` (${details})` : '') +
      `. Shrink the snippet or enlarge size { height, width }.`
    );
  }

  _show_overflow_error(container, details) {
    const message = this.overflow_error_text(details);
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Crescent] ' + message);
    }
    if (container && typeof document !== 'undefined') {
      // Visual error badge inside the layer (kept inside bounds).
      const badge = document.createElement('div');
      badge.setAttribute('data-framework-error', 'overflow');
      badge.style.position = 'absolute';
      badge.style.left = '0';
      badge.style.right = '0';
      badge.style.bottom = '0';
      badge.style.padding = '6px 8px';
      badge.style.fontSize = '12px';
      badge.style.fontFamily = 'sans-serif';
      badge.style.color = '#fff';
      badge.style.backgroundColor = 'rgba(220,38,38,0.92)';
      badge.style.zIndex = '9999';
      badge.textContent = message;
      container.appendChild(badge);
      container.dataset.frameworkOverflow = 'true';
    }
    return message;
  }

  /**
   * Check the live DOM element for overflow; shows the error overlay when
   * content escapes the layer box. Returns true when overflowing.
   */
  check_overflow() {
    if (!this._element || typeof this._element.querySelector !== 'function') return false;
    const content = this._element.querySelector('[data-framework-content]');
    const host = content || this._element;
    let overflowing = false;
    let details = '';
    try {
      if (typeof host.scrollWidth === 'number' && typeof host.clientWidth === 'number') {
        if (host.scrollWidth > host.clientWidth + 1 || host.scrollHeight > host.clientHeight + 1) {
          overflowing = true;
          details = `${host.scrollWidth}x${host.scrollHeight} vs layer ${host.clientWidth}x${host.clientHeight}`;
        }
      }
    } catch (e) {
      // Non-fatal: measurement only.
    }
    if (overflowing) this._show_overflow_error(this._element, details);
    else if (this._element.dataset) delete this._element.dataset.frameworkOverflow;
    return overflowing;
  }

  render() {
    if (!this.layer_enabled) {
      const hidden = typeof document !== 'undefined' ? document.createElement('div') : null;
      if (hidden) {
        hidden.style.display = 'none';
        this._element = hidden;
        return hidden;
      }
      return null;
    }
    if (typeof document === 'undefined') return null;

    const container = document.createElement('div');
    container.dataset.layerId = this.layer_id;   // full unique id
    container.dataset.layerType = this.layer_type; // framework prefix
    container.dataset.framework = this.framework;

    // Layer-box positioning (cartesian, like every other layer).
    container.style.position = 'absolute';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.transform = `translate(calc(-50% + ${this.position.x}px), calc(-50% + ${this.position.y}px)) rotate(${this._parseRotate(this.rotate)})`;

    // Layer-box size — the optimisation target: content must stay inside.
    container.style.width = typeof this.size.width === 'number' ? `${this.size.width}px` : this.size.width;
    container.style.height = typeof this.size.height === 'number' ? `${this.size.height}px` : this.size.height;
    container.style.overflow = 'hidden';
    container.style.contain = 'content';
    container.style.boxSizing = 'border-box';

    // Standard styling.
    container.style.backgroundColor = this._parseColour(this.colour);
    container.style.opacity = this._parseOpacity(this.opacity);
    container.style.borderRadius = this._parseRoundedCorners(this.rounded_corners);
    container.style.zIndex = this.index;

    // Inner mount: constrained so framework output fits like a layer.
    // UNIQUE per layer layer_id so 'react' and 'react:hero' coexist.
    const mount = document.createElement('div');
    mount.setAttribute('data-framework-content', this.framework);
    mount.id = sanitizeMountId(this.layer_id);
    mount.style.width = '100%';
    mount.style.height = '100%';
    mount.style.maxWidth = '100%';
    mount.style.maxHeight = '100%';
    mount.style.overflow = 'hidden';
    mount.style.boxSizing = 'border-box';
    mount.style.contain = 'content';
    container.appendChild(mount);

    // Keep the raw snippet with the layer (escaped, inert) so build-time HTML
    // and hydration can find it without executing arbitrary code.
    const codeHolder = document.createElement('script');
    codeHolder.setAttribute('type', 'text/plain');
    codeHolder.setAttribute('data-framework-code', this.layer_id);
    codeHolder.textContent = typeof this.code === 'string' ? this.code : '';
    container.appendChild(codeHolder);

    this._element = container;

    // Real mount (graceful — no eval, never throws).
    try {
      this.mount();
    } catch (e) {
      // Never break rendering because mounting failed.
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(`[Crescent] framework layer "${this.layer_id}" mount skipped:`, e.message);
      }
    }

    // Post-mount overflow check (async so layout has settled).
    try {
      const self = this;
      const schedule = typeof requestAnimationFrame !== 'undefined'
        ? requestAnimationFrame
        : (fn) => setTimeout(fn, 0);
      schedule(() => self.check_overflow());
    } catch (e) {}

    return container;
  }

  /**
   * Mount the layer's code into its mount node.
   *
   * Contract (no eval, no new dependencies; never throws):
   *   - String code + `compile` hook  -> compile(code, { framework, layer_id,
   *     mount, React, ReactDOM }); a returned component function is mounted
   *     for real (React path); any other successful call counts as a mount.
   *   - String code without `compile` -> inert source preview
   *     (data-framework-preview="source"); { mounted:false, reason:'uncompiled-source' }.
   *   - React component function      -> ReactDOM.createRoot(mount).render(
   *     React.createElement(component, props)); mounted:true.
   *   - Angular component class       -> createComponent + createEnvironmentInjector;
   *     any failure returns { mounted:false, reason }.
   *
   * @param {HTMLElement} [target]  mount node (defaults to the layer's inner
   *                                [data-framework-content] node when rendered).
   * @param {object}      [deps]    optional { React, ReactDOM, angularCore,
   *                                angularPlatformBrowser, document } injection
   *                                for headless tests; others resolve from
   *                                globals or require().
   * @returns {{ mounted: boolean, framework: string, reason?: string }}
   */
  mount(target, deps) {
    const result = { mounted: false, framework: this.framework };
    try {
      const resolved = this._resolveMountDeps(deps);
      if (target) this._lastMountTarget = target;
      if (deps) this._lastMountDeps = deps;
      const mountNode = target
        || (this._lastMountTarget && this._lastMountTarget.parentNode ? this._lastMountTarget : null)
        || this._defaultMountNode();
      if (!mountNode) {
        result.reason = 'no-mount-node';
        return result;
      }

      const source = this._codeComponent();
      if (typeof this.code === 'string') {
        if (typeof this.compile === 'function') {
          try {
            const compiled = this.compile(this.code, {
              framework: this.framework,
              layer_id: this.layer_id,
              mount: mountNode,
              React: resolved.React,
              ReactDOM: resolved.ReactDOM
            });
            if (typeof compiled === 'function') {
              return this._mountReact(compiled, this.props, mountNode, resolved, result);
            }
            // The compile hook is expected to have mounted the output itself.
            result.mounted = true;
            return result;
          } catch (e) {
            result.reason = 'compile-failed: ' + (e && e.message ? e.message : String(e));
            return result;
          }
        }
        // Without a compile hook string source stays an inert, escaped preview.
        this._renderSourcePreview(mountNode);
        result.reason = 'uncompiled-source';
        return result;
      }

      if (typeof source.component !== 'function') {
        result.reason = 'no-mountable-code';
        return result;
      }
      if (this.framework === 'react') {
        if (!resolved.React || !resolved.ReactDOM) {
          result.reason = 'missing-dependency';
          return result;
        }
        return this._mountReact(source.component, source.props, mountNode, resolved, result);
      }
      return this._mountAngular(source.component, mountNode, resolved, result);
    } catch (e) {
      result.mounted = false;
      result.reason = 'mount-failed: ' + (e && e.message ? e.message : String(e));
      return result;
    }
  }

  /** { React, ReactDOM, angularCore, angularPlatformBrowser, document } resolver. */
  _resolveMountDeps(userDeps) {
    const d = userDeps || {};
    const g = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : null);
    return {
      React: d.React || (g && g.React) || tryRequire('react'),
      ReactDOM: d.ReactDOM || (g && g.ReactDOM) || tryRequire('react-dom'),
      angularCore: d.angularCore || (g && g.angular && g.angular.core) || tryRequire('@angular/core'),
      angularPlatformBrowser: d.angularPlatformBrowser || (g && g.angular && g.angular.platformBrowser) || tryRequire('@angular/platform-browser'),
      document: (typeof document !== 'undefined') ? document : null
    };
  }

  /** Element to mount into: the rendered layer's inner mount node. */
  _defaultMountNode() {
    if (this._element && typeof this._element.querySelector === 'function') {
      const inner = this._element.querySelector('[data-framework-content]');
      if (inner) return inner;
    }
    return null;
  }

  /** Extract { component, props } from component-form code. */
  _codeComponent() {
    const code = this.code;
    if (typeof code === 'string') return { component: null, props: null };
    if (typeof code === 'function') return { component: code, props: this.props || null };
    if (code && typeof code === 'object' && typeof code.component === 'function') {
      return { component: code.component, props: code.props || this.props || null };
    }
    return { component: null, props: null };
  }

  _mountReact(component, props, mountNode, deps, result) {
    try {
      const propsArg = props && Object.keys(props).length ? props : undefined;
      deps.ReactDOM.createRoot(mountNode).render(deps.React.createElement(component, propsArg));
      try { mountNode.setAttribute('data-framework-mounted', 'true'); } catch (e) {}
      result.mounted = true;
    } catch (e) {
      result.reason = 'react-mount-failed: ' + (e && e.message ? e.message : String(e));
    }
    return result;
  }

  _mountAngular(component, mountNode, deps, result) {
    const core = deps.angularCore;
    const platform = deps.angularPlatformBrowser;
    if (!core || !platform || typeof platform.createComponent !== 'function') {
      result.reason = 'missing-dependency';
      return result;
    }
    try {
      // Fail fast when this is not an Angular component class at all.
      if (!component || (component.prototype && !component.prototype.ngComponentDef
        && !component.prototype['ɵcmp'] && !component.prototype['ɵfac']
        && typeof component.decorators === 'undefined' && !component.ngComponentDef)) {
        // createComponent below will still be attempted and will throw with
        // the authoritative Angular error; nothing done here on purpose.
      }
      let environmentInjector = null;
      if (typeof core.createEnvironmentInjector === 'function') {
        try {
          environmentInjector = core.createEnvironmentInjector([], platform.injector || null);
        } catch (e) {
          environmentInjector = null;
        }
      }
      const ref = platform.createComponent(component, {
        host: mountNode,
        environmentInjector: environmentInjector || undefined
      });
      if (ref && typeof ref.injector !== 'undefined') {
        try { mountNode.setAttribute('data-framework-mounted', 'true'); } catch (e) {}
        result.mounted = true;
      } else {
        result.reason = 'angular-mount-failed: createComponent returned no component ref';
      }
    } catch (e) {
      result.reason = 'angular-mount-failed: ' + (e && e.message ? e.message : String(e));
    }
    return result;
  }

  /** Replace the mount content with an inert, escaped source preview. */
  _renderSourcePreview(mountNode) {
    // Clear previous content (preview or a stale mount) before re-previewing.
    try {
      while (mountNode.firstChild) mountNode.removeChild(mountNode.firstChild);
    } catch (e) {}
    const preview = document.createElement('div');
    preview.setAttribute('data-framework-preview', 'source');
    preview.style.width = '100%';
    preview.style.height = '100%';
    preview.style.overflow = 'hidden';
    preview.style.fontFamily = 'sans-serif';
    preview.style.fontSize = '12px';
    preview.style.color = '#555';
    preview.style.whiteSpace = 'pre-wrap';
    preview.style.wordBreak = 'break-word';
    preview.textContent = this.code;
    mountNode.appendChild(preview);
  }

  _applyPropertyToElement(name, value) {
    if (!this._element) return;
    if (name === 'code') {
      this.code = value;
      const holder = this._element.querySelector('[data-framework-code]');
      if (holder) holder.textContent = typeof value === 'string' ? value : '';
      // Re-mount with the new code (strings stay inert, components remount).
      try {
        this.mount();
      } catch (e) {
        // Mounting is best-effort; the property change itself must not fail.
      }
      // Re-check bounds after code changes.
      try {
        const schedule = typeof requestAnimationFrame !== 'undefined'
          ? requestAnimationFrame
          : (fn) => setTimeout(fn, 0);
        schedule(() => this.check_overflow());
      } catch (e) {}
      return;
    }
    super._applyPropertyToElement(name, value);
  }

  serialize() {
    return {
      layer_id: this.layer_id,
      layer_type: this.layer_type,
      framework: this.framework,
      code: this.code,
      props: this.props,
      size: this.size,
      position: this.position,
      index: this.index,
      colour: this.colour,
      opacity: this.opacity,
      rounded_corners: this.rounded_corners,
      rotate: this.rotate,
      layer_enabled: this.layer_enabled
    };
  }

  toJSON() {
    return this.serialize();
  }
}

class ReactLayer extends FrameworkLayer {
  constructor(config) {
    super(Object.assign({}, config, { layer_id: 'react', layer_type: 'react' }));
  }
}

class AngularLayer extends FrameworkLayer {
  constructor(config) {
    super(Object.assign({}, config, { layer_id: 'angular', layer_type: 'angular' }));
  }
}

module.exports = FrameworkLayer;
module.exports.FrameworkLayer = FrameworkLayer;
module.exports.ReactLayer = ReactLayer;
module.exports.AngularLayer = AngularLayer;
module.exports.SUPPORTED_FRAMEWORKS = SUPPORTED_FRAMEWORKS;
module.exports.parseFrameworkId = parseFrameworkId;
module.exports.normalizeFrameworkName = normalizeFrameworkName;
module.exports.validateFrameworkConfig = validateFrameworkConfig;
module.exports.isFrameworkId = normalizeFrameworkName;