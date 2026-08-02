/**
 * RocketFunction - Custom function wrapper
 */

class RocketFunction {
  constructor(config) {
    this.function_id = config.function_id;
    this.function_enabled = config.function_enabled !== undefined ? config.function_enabled : true;
    this.params = config.params || [];
    this.body = config.body || function() {};
  }

  call(...args) {
    if (!this.function_enabled) return undefined;
    return this.body(...args);
  }

  set_enabled(bool) {
    this.function_enabled = bool;
    return this;
  }

  get_params() {
    return this.params;
  }

  set_body(fn) {
    this.body = fn;
    return this;
  }
}

module.exports = RocketFunction;