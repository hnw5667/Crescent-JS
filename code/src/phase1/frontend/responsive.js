/**
 * Responsive - Ratio-based scaling system for pages and objects
 * 
 * From the spec:
 *   - When a page is created, it gets a height and width
 *   - This creates two ratios: "height from top : height from bottom" and
 *     "width from left : width from right"
 *   - When the screen size changes, these ratios are maintained
 *   - If a ratio is 0:0, the object resizes to fit the screen in that dimension
 *   - The bg layer scales to fill the screen
 *   - Object layers scale using the same ratio method
 */

class Responsive {
  constructor(config) {
    this.page = config.page || null;
    this._breakpoints = config.breakpoints || [
      { name: 'mobile', maxWidth: 480 },
      { name: 'tablet', maxWidth: 768 },
      { name: 'desktop', maxWidth: 1200 },
      { name: 'large', maxWidth: Infinity }
    ];
    this._currentBreakpoint = null;
    this._resizeHandler = null;
  }

  /**
   * Initialize responsive scaling for a page
   */
  init(page) {
    if (page) this.page = page;
    if (!this.page) return this;

    this._resizeHandler = () => this._on_resize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this._resizeHandler);
    }
    this._on_resize();
    return this;
  }

  /**
   * Get the current breakpoint name
   */
  get_breakpoint() {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    for (const bp of this._breakpoints) {
      if (width <= bp.maxWidth) return bp.name;
    }
    return 'large';
  }

  /**
   * Handle window resize
   */
  _on_resize() {
    const newBreakpoint = this.get_breakpoint();
    if (newBreakpoint !== this._currentBreakpoint) {
      this._currentBreakpoint = newBreakpoint;
    }
    if (this.page && this.page._apply_scaling) {
      this.page._apply_scaling();
    }
  }

  /**
   * Calculate scaling ratios for an object at a given viewport size
   * Returns { height_ratio: [top, bottom], width_ratio: [left, right] }
   */
  calculate_ratios(object, viewportWidth, viewportHeight) {
    const objWidth = object.size.width;
    const objHeight = object.size.height;
    const pageWidth = this.page ? this.page.size.width : viewportWidth;
    const pageHeight = this.page ? this.page.size.height : viewportHeight;

    const pos = this.page ? (this.page.position.get(object.object_id) || { x: 0, y: 0 }) : { x: 0, y: 0 };

    // Width ratio: left space : right space
    const leftSpace = (pageWidth / 2) + pos.x;
    const rightSpace = (pageWidth / 2) - pos.x;
    const widthRatio = [leftSpace, rightSpace];

    // Height ratio: top space : bottom space
    const topSpace = (pageHeight / 2) + pos.y;
    const bottomSpace = (pageHeight / 2) - pos.y;
    const heightRatio = [topSpace, bottomSpace];

    return { height_ratio: heightRatio, width_ratio: widthRatio };
  }

  /**
   * Apply scaling to an object based on viewport change
   */
  scale_object(object, originalWidth, originalHeight, newWidth, newHeight) {
    if (!object || !object._element) return;

    const scaleX = newWidth / originalWidth;
    const scaleY = newHeight / originalHeight;

    const ratios = this.page ? this.page.scaling_ratios.get(object.object_id) : null;

    if (ratios) {
      const hRatio = ratios.height_ratio;
      const wRatio = ratios.width_ratio;

      if (hRatio[0] === 0 && hRatio[1] === 0) {
        object._element.style.height = `${object.size.height * scaleY}px`;
      }

      if (wRatio[0] === 0 && wRatio[1] === 0) {
        object._element.style.width = `${object.size.width * scaleX}px`;
      }
    } else {
      // Default: scale proportionally
      object._element.style.width = `${object.size.width * scaleX}px`;
      object._element.style.height = `${object.size.height * scaleY}px`;
    }
  }

  /**
   * Destroy the responsive handler
   */
  destroy() {
    if (this._resizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', this._resizeHandler);
    }
    this._resizeHandler = null;
  }
}

module.exports = Responsive;