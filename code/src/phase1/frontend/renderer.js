class RocketRenderer {
  constructor() {
    this.pages = new Map();
    this._container = null;
    this._currentPage = null;

    this._baseHTML = null;
    this._rootSelector = "#crescent-root";
  }

  /**
   * Register a page
   */
  register_page(page) {
    this.pages.set(page.page_id, page);
    return this;
  }

  /**
   * Set base HTML (string or file path)
   */
  basehtml(htmlOrPath) {
    this._baseHTML = htmlOrPath;
    return this;
  }

  /**
   * Define root mount point inside base HTML
   */
  root(selector) {
    this._rootSelector = selector;
    return this;
  }

  /**
   * Mount (browser mode)
   */
  mount(container) {
    this._container = container;
    return this;
  }

  /**
   * Navigate
   */
  navigate(page_id) {
    const page = this.pages.get(page_id);
    if (!page) {
      console.error(`Page "${page_id}" not found`);
      return;
    }

    const pageEl = page.render();

    // If baseHTML is used → inject into root
    if (this._baseHTML) {
      const root = document.querySelector(this._rootSelector);

      if (!root) {
        console.error(`Root "${this._rootSelector}" not found in base HTML`);
        return;
      }

      root.innerHTML = '';
      root.appendChild(pageEl);
    } 
    // fallback (your old behavior)
    else if (this._container) {
      this._container.innerHTML = '';
      this._container.appendChild(pageEl);
    }

    // Set up ResizeObserver on the container after mounting
    if (page._needsObserverSetup && typeof ResizeObserver !== 'undefined') {
      const container = pageEl.parentElement;
      if (container) {
        if (page._resizeObserver) page._resizeObserver.disconnect();
        page._resizeObserver = new ResizeObserver(() => {
          page._apply_scaling();
        });
        page._resizeObserver.observe(container);
      }
      page._needsObserverSetup = false;
    }

    // Apply initial scaling
    page._apply_scaling();

    // Set _renderer on all objects so triggers can navigate
    for (const [id, obj] of page.objects) {
      obj._renderer = this;
    }

    // Re-attach any pending triggers
    console.log('[Renderer] navigate() — re-attaching triggers...');
    var _c = (typeof window !== 'undefined' && window.crescent) ? window.crescent : (typeof crescent !== 'undefined' ? crescent : null);
    if (_c && _c._triggers) {
      const triggerIds = Object.keys(_c._triggers);
      console.log('[Renderer] Found', triggerIds.length, 'triggers:', triggerIds.join(', '));
      for (const [id, trigger] of Object.entries(_c._triggers)) {
        if (trigger.tryAttach) trigger.tryAttach();
      }
    } else {
      console.log('[Renderer] crescent or crescent._triggers not available!');
    }

    // Title
    if (page.page_title) {
      document.title = page.page_title;
    }

    // URL
    if (page.page_url && typeof history !== 'undefined') {
      history.pushState({ page_id }, '', page.page_url);
    }

    this._currentPage = page_id;
    return this;
  }

  /**
   * SSR: Render full HTML (with basehtml)
   */
  render_full_page(page_id) {
    const page = this.pages.get(page_id);
    if (!page) return "";

    const pageHTML = this._element_to_string(page.render());

    // If no base HTML → return raw
    if (!this._baseHTML) return pageHTML;

    let base = this._baseHTML;

    // If it's a file path (Node)
    if (typeof require !== "undefined" && base.endsWith(".html")) {
      const fs = require("fs");
      base = fs.readFileSync(base, "utf-8");
    }

    // Inject into root
    return base.replace(
      new RegExp(`(<[^>]*id=["']${this._rootSelector.replace("#", "")}["'][^>]*>)(</[^>]+>)`),
      `$1${pageHTML}$2`
    );
  }

  /**
   * Convert element → string
   */
  _element_to_string(el) {
    const serializer = new (typeof XMLSerializer !== 'undefined'
      ? XMLSerializer
      : require('xmldom').XMLSerializer)();

    return serializer.serializeToString(el);
  }

  get_current_page() {
    return this._currentPage ? this.pages.get(this._currentPage) : null;
  }

  get_page(page_id) {
    return this.pages.get(page_id) || null;
  }
}

module.exports = RocketRenderer;