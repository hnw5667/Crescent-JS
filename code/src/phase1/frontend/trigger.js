/**
 * Trigger - Event handlers for user interactions
 * 
 * Triggers attach directly to layers via layer_id.
 * When the layer's DOM element is rendered, the trigger
 * binds its event listener to that specific element.
 * 
 * Supported events: click, hover, scroll, keypress, focus, submit
 * Hover triggers use hover_direction: 'enter' or 'leave'
 * 
 * Format:
 *   if layer_ID:clicked = true
 *     then play.transition_property
 *   else
 *     then play.transition_property_2
 */

class Trigger {
  constructor(config) {
    // The layer this trigger is attached to (primary identifier)
    this.layer_id = config.layer_id;
    
    // Event type: 'click', 'hover', 'scroll', 'keypress'
    this.event = config.event || 'click';
    
    // Condition function - returns true or false
    this.condition = config.condition || null;
    
    // True sequence: actions to execute when condition is true
    this.true_sequence = config.true_sequence || [];
    
    // False sequence: actions to execute when condition is false
    this.false_sequence = config.false_sequence || [];
    
    // Page redirect on true
    this.redirect_page = config.redirect_page || null;
    
    // For hover triggers: which direction to respond to
    this.hover_direction = config.hover_direction || null; // 'enter' or 'leave'
    
    // Internal state
    this._boundHandler = null;
    this._layer = null;
    this._isAttached = false;
    this._pendingAttach = false;
    this._boundElement = null;
  }

  /**
   * Resolve the target element for this trigger.
   * Looks up the layer from crescent._layers by layer_id,
   * then returns its DOM element.
   */
  _resolve_element() {
    // If we have a direct layer reference, use it
    if (this._layer) {
      const el = this._layer.get_element ? this._layer.get_element() : this._layer._element;
      if (el) return el;
    }
    
    // Fallback: look up from global crescent singleton
    const crescent = (typeof window !== 'undefined' && window.crescent) ? window.crescent : null;
    if (crescent && this.layer_id && crescent._layers[this.layer_id]) {
      const layer = crescent._layers[this.layer_id];
      this._layer = layer;
      const el = layer.get_element ? layer.get_element() : layer._element;
      if (el) return el;
    }
    
    // Last resort: search DOM by data-layer-id attribute
    if (typeof document !== 'undefined') {
      const found = document.querySelector(`[data-layer-id="${this.layer_id}"]`);
      if (found) return found;
    }
    
    return null;
  }

  /**
   * Attach this trigger to a layer.
   * Can pass a layer instance, or omit to auto-resolve from crescent._layers.
   * Supports deferred attachment — if the element doesn't exist yet,
   * it will auto-attach when the element becomes available (via tryAttach).
   */
  attach(layer) {
    if (layer) {
      this._layer = layer;
    }
    
    const element = this._resolve_element();
    
    if (!element) {
      this._pendingAttach = true;
      console.log(`[Trigger:${this.layer_id}] attach() — no element yet, pending (event: ${this.event})`);
      return this;
    }

    this._bindEvents(element);
    this._isAttached = true;
    this._pendingAttach = false;
    this._boundElement = element;
    console.log(`[Trigger:${this.layer_id}] attach() — bound to element (event: ${this.event})`);
    return this;
  }

  /**
   * Try to attach if previously pending (called after rendering)
   */
  tryAttach() {
    const element = this._resolve_element();
    if (!element) {
      console.log(`[Trigger:${this.layer_id}] tryAttach() — still no element`);
      return this;
    }

    // If already attached to the SAME element, skip
    if (this._isAttached && this._boundElement === element) {
      return this;
    }

    // If attached to a DIFFERENT element (page re-rendered), detach first
    if (this._isAttached) {
      this.detach();
    }

    this._bindEvents(element);
    this._isAttached = true;
    this._pendingAttach = false;
    this._boundElement = element;
    console.log(`[Trigger:${this.layer_id}] tryAttach() — SUCCESS (event: ${this.event})`);
    return this;
  }

  /**
   * Bind event listeners to an element
   */
  _bindEvents(element) {
    this._boundHandler = (event) => this._handle_event(event);

    switch (this.event) {
      case 'click':
        element.addEventListener('click', this._boundHandler);
        element.style.cursor = 'pointer';
        break;
      case 'hover':
        element.addEventListener('mouseenter', this._boundHandler);
        element.addEventListener('mouseleave', this._boundHandler);
        break;
      case 'scroll':
        element.addEventListener('scroll', this._boundHandler);
        break;
      case 'keypress':
        element.addEventListener('keypress', this._boundHandler);
        element.setAttribute('tabindex', '0');
        break;
      case 'focus':
        element.addEventListener('focus', this._boundHandler);
        element.setAttribute('tabindex', '0');
        break;
      case 'submit':
        element.addEventListener('submit', this._boundHandler);
        break;
    }
  }

  /**
   * Detach this trigger from its element
   */
  detach() {
    if (!this._isAttached) return this;

    const element = this._boundElement;
    if (!element || !this._boundHandler) {
      this._isAttached = false;
      this._boundHandler = null;
      this._boundElement = null;
      return this;
    }

    switch (this.event) {
      case 'click':
        element.removeEventListener('click', this._boundHandler);
        break;
      case 'hover':
        element.removeEventListener('mouseenter', this._boundHandler);
        element.removeEventListener('mouseleave', this._boundHandler);
        break;
      case 'scroll':
        element.removeEventListener('scroll', this._boundHandler);
        break;
      case 'keypress':
        element.removeEventListener('keypress', this._boundHandler);
        break;
      case 'focus':
        element.removeEventListener('focus', this._boundHandler);
        break;
      case 'submit':
        element.removeEventListener('submit', this._boundHandler);
        break;
    }

    this._isAttached = false;
    this._boundHandler = null;
    this._boundElement = null;
    return this;
  }

  /**
   * Handle the triggered event
   */
  _handle_event(event) {
    // For hover triggers, filter by direction (enter/leave)
    if (this.event === 'hover' && this.hover_direction) {
      if (this.hover_direction === 'enter' && event.type !== 'mouseenter') return;
      if (this.hover_direction === 'leave' && event.type !== 'mouseleave') return;
    }

    console.log(`[Trigger:${this.layer_id}] event: ${event.type}, direction: ${this.hover_direction || 'n/a'}`);

    // Evaluate the condition
    let conditionResult = true;

    if (this.condition) {
      conditionResult = this.condition(event, this._layer);
    }

    // Execute the appropriate sequence
    if (conditionResult) {
      this._execute_sequence(this.true_sequence, event);
      
      // Handle page redirect
      if (this.redirect_page) {
        const crescent = (typeof window !== 'undefined' && window.crescent) ? window.crescent : null;
        if (crescent && crescent._renderer) {
          crescent._renderer.navigate(this.redirect_page);
        }
      }
    } else {
      this._execute_sequence(this.false_sequence, event);
    }
  }

  /**
   * Execute a sequence of actions
   */
  _execute_sequence(sequence, event) {
    for (const action of sequence) {
      if (typeof action === 'function') {
        action(event, this._layer);
      } else if (action && typeof action === 'object') {
        switch (action.type) {
          case 'transition':
            if (action.transition && action.transition.play) {
              action.transition.play();
            }
            break;
          case 'api_call':
            if (action.api_call && typeof action.api_call.execute === 'function') {
              action.api_call.execute();
            }
            break;
          case 'redirect':
            const crescent = (typeof window !== 'undefined' && window.crescent) ? window.crescent : null;
            if (action.page_id && crescent && crescent._renderer) {
              crescent._renderer.navigate(action.page_id);
            } else if (action.url) {
              const pageId = action.url.replace(/^\//, '') || 'home';
              if (crescent && crescent._renderer) {
                crescent._renderer.navigate(pageId);
              } else if (typeof window !== 'undefined') {
                window.location.href = action.url;
              }
            }
            break;
          case 'set_property':
            if (action.layer_id && action.property !== undefined) {
              const crescent = (typeof window !== 'undefined' && window.crescent) ? window.crescent : null;
              if (crescent) {
                const layer = crescent._layers[action.layer_id];
                if (layer && layer.set_property) {
                  layer.set_property(action.property, action.value);
                }
              }
            }
            break;
        }
      }
    }
  }

  /**
   * Add an action to the true sequence
   */
  on_true(action) {
    this.true_sequence.push(action);
    return this;
  }

  /**
   * Add an action to the false sequence
   */
  on_false(action) {
    this.false_sequence.push(action);
    return this;
  }

  /**
   * Set the condition function
   */
  set_condition(conditionFn) {
    this.condition = conditionFn;
    return this;
  }

  /**
   * Set the redirect page
   */
  set_redirect(page_id) {
    this.redirect_page = page_id;
    return this;
  }
}

module.exports = Trigger;