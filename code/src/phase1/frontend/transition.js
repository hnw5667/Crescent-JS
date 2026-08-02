/**
 * Transition - Animates property changes on layers within objects
 * 
 * From the spec:
 *   transition_property = {
 *     import object_ID/name
 *     import object_ID_2/name
 *     
 *     time = 45 sec
 *     change.object_ID/name.layer_1:width = 100
 *     change.object_ID_2/name.layer_1:width = 100
 *   }
 * 
 * The transition imports objects, specifies a duration, and lists
 * property changes. The animation is rendered by dividing the total
 * change per nanosecond and updating smoothly.
 * 
 * Usage:
 *   const transition = new Transition({
 *     objects: [obj1, obj2],
 *     time: '2s',           // or 2000 (ms)
 *     changes: [
 *       { object_id: 'header', layer_id: 'title', property: 'size.width', value: 200 },
 *       { object_id: 'header', layer_id: 'bg', property: 'colour', value: '255,0,0' }
 *     ]
 *   });
 *   transition.play();
 */

class Transition {
  constructor(config) {
    // Objects involved in this transition
    this.objects = config.objects || [];
    
    // Duration: supports '2s', '45 sec', or milliseconds as number
    this.time = this._parse_duration(config.time || '0.3s');
    
    // Property changes to animate
    // Each: { object_id, layer_id, property, value }
    this.changes = config.changes || [];
    
    // Animation state
    this._animationFrame = null;
    this._startTime = null;
    this._isPlaying = false;
    this._onComplete = null;
    
    // Store original values for reversal
    this._originalValues = new Map();
  }

  /**
   * Parse duration string to milliseconds
   * Supports: '2s', '45 sec', '1000ms', or number (ms)
   */
  _parse_duration(time) {
    if (typeof time === 'number') return time;
    if (typeof time !== 'string') return 300;
    
    const trimmed = time.trim().toLowerCase();
    
    if (trimmed.endsWith('sec')) {
      return parseFloat(trimmed) * 1000;
    }
    if (trimmed.endsWith('s')) {
      return parseFloat(trimmed) * 1000;
    }
    if (trimmed.endsWith('ms')) {
      return parseFloat(trimmed);
    }
    return parseFloat(trimmed) || 300;
  }

  /**
   * Get an object by its ID from the imported objects
   */
  _get_object(object_id) {
    return this.objects.find(o => o.object_id === object_id) || null;
  }

  /**
   * Get a layer from an object
   */
  _get_layer(object_id, layer_id) {
    const obj = this._get_object(object_id);
    if (!obj) return null;
    return obj.get_layer(layer_id);
  }

  /**
   * Get the current value of a property on a layer
   */
  _get_current_value(object_id, layer_id, property) {
    const layer = this._get_layer(object_id, layer_id);
    if (!layer) return null;
    
    // Handle nested properties like 'size.width'
    const parts = property.split('.');
    let current = layer;
    for (const part of parts) {
      if (current === null || current === undefined) return null;
      current = current[part];
    }
    return current;
  }

  /**
   * Set a property value on a layer
   */
  _set_property_value(object_id, layer_id, property, value) {
    const layer = this._get_layer(object_id, layer_id);
    if (!layer) {
      console.log(`[Transition] _set_property_value — layer NOT FOUND: ${object_id}.${layer_id}`);
      return;
    }
    
    // Handle nested properties like 'size.width'
    const parts = property.split('.');
    if (parts.length === 1) {
      layer.set_property(property, value);
    } else {
      // For nested properties like size.width, update the parent object
      const parentProp = parts[0];
      const childProp = parts[1];
      const parent = layer[parentProp];
      if (parent && typeof parent === 'object') {
        parent[childProp] = value;
        layer.set_property(parentProp, { ...parent });
      }
    }
  }

  /**
   * Store original values before animation starts
   */
  _store_original_values() {
    this._originalValues.clear();
    for (const change of this.changes) {
      const key = `${change.object_id}.${change.layer_id}.${change.property}`;
      const currentVal = this._get_current_value(change.object_id, change.layer_id, change.property);
      this._originalValues.set(key, currentVal);
    }
  }

  /**
   * Play the transition animation forward
   */
  play(onComplete) {
    this._onComplete = onComplete;
    this._store_original_values();
    this._startTime = performance.now();
    this._isPlaying = true;
    console.log(`[Transition:${this.changes.map(c => c.object_id + '.' + c.layer_id + '.' + c.property).join(', ')}] play() — ${this.time}ms, ${this.changes.length} changes, objects: ${this.objects.length}`);
    for (const change of this.changes) {
      const key = `${change.object_id}.${change.layer_id}.${change.property}`;
      const origVal = this._originalValues.get(key);
      console.log(`  Change: ${key} = ${JSON.stringify(origVal)} → ${JSON.stringify(change.value)}`);
    }
    this._animate();
    return this;
  }

  /**
   * Reverse the transition (animate back to original values)
   */
  reverse(onComplete) {
    this._onComplete = onComplete;
    this._startTime = performance.now();
    this._isPlaying = true;
    this._animate_reverse();
    return this;
  }

  /**
   * Animation loop - interpolates property values over time
   * The spec says: "dividing how much it should move or change per nanosecond
   * and changing it per nanosecond to make it more smooth"
   */
  _animate() {
    const animateFrame = (currentTime) => {
      if (!this._isPlaying) return;
      
      const elapsed = currentTime - this._startTime;
      const progress = Math.min(elapsed / this.time, 1);
      
      // Apply eased progress (ease-in-out)
      const easedProgress = this._ease_in_out(progress);
      
      // Interpolate each change
      for (const change of this.changes) {
        const key = `${change.object_id}.${change.layer_id}.${change.property}`;
        const originalValue = this._originalValues.get(key);
        
        if (originalValue !== null && originalValue !== undefined) {
          const interpolatedValue = this._interpolate(originalValue, change.value, easedProgress);
          this._set_property_value(change.object_id, change.layer_id, change.property, interpolatedValue);
        }
      }
      
      if (progress < 1) {
        this._animationFrame = requestAnimationFrame(animateFrame);
      } else {
        this._isPlaying = false;
        if (this._onComplete) this._onComplete();
      }
    };
    
    this._animationFrame = requestAnimationFrame(animateFrame);
  }

  /**
   * Reverse animation loop
   */
  _animate_reverse() {
    const animateFrame = (currentTime) => {
      if (!this._isPlaying) return;
      
      const elapsed = currentTime - this._startTime;
      const progress = Math.min(elapsed / this.time, 1);
      const easedProgress = this._ease_in_out(progress);
      
      for (const change of this.changes) {
        const key = `${change.object_id}.${change.layer_id}.${change.property}`;
        const originalValue = this._originalValues.get(key);
        
        if (originalValue !== null && originalValue !== undefined) {
          const interpolatedValue = this._interpolate(change.value, originalValue, easedProgress);
          this._set_property_value(change.object_id, change.layer_id, change.property, interpolatedValue);
        }
      }
      
      if (progress < 1) {
        this._animationFrame = requestAnimationFrame(animateFrame);
      } else {
        this._isPlaying = false;
        if (this._onComplete) this._onComplete();
      }
    };
    
    this._animationFrame = requestAnimationFrame(animateFrame);
  }

  /**
   * Interpolate between two values based on progress (0 to 1)
   */
  _interpolate(from, to, progress) {
    // Numeric interpolation
    if (typeof from === 'number' && typeof to === 'number') {
      return from + (to - from) * progress;
    }
    
    // String colour interpolation (r,g,b format)
    if (typeof from === 'string' && typeof to === 'string') {
      const fromParts = from.split(',').map(s => parseFloat(s.trim()));
      const toParts = to.split(',').map(s => parseFloat(s.trim()));
      
      if (fromParts.length === toParts.length && fromParts.length >= 3) {
        const interpolated = fromParts.map((f, i) => Math.round(f + (toParts[i] - f) * progress));
        return interpolated.join(',');
      }
    }
    
    // Object interpolation (e.g., { width: 100, height: 200 })
    if (typeof from === 'object' && typeof to === 'object' && from !== null && to !== null) {
      const result = {};
      for (const key of Object.keys(from)) {
        if (typeof from[key] === 'number' && typeof to[key] === 'number') {
          result[key] = from[key] + (to[key] - from[key]) * progress;
        } else {
          result[key] = progress >= 0.5 ? to[key] : from[key];
        }
      }
      return result;
    }
    
    // For non-interpolatable values, snap at 50%
    return progress >= 0.5 ? to : from;
  }

  /**
   * Ease-in-out function for smooth animation
   */
  _ease_in_out(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Stop the animation
   */
  stop() {
    this._isPlaying = false;
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }
    return this;
  }

  /**
   * Check if the transition is currently playing
   */
  is_playing() {
    return this._isPlaying;
  }

  /**
   * Add a change to the transition
   */
  add_change(object_id, layer_id, property, value) {
    this.changes.push({ object_id, layer_id, property, value });
    return this;
  }

  /**
   * Add an object to the transition
   */
  add_object(object) {
    this.objects.push(object);
    return this;
  }
}

module.exports = Transition;