/**
 * Loop - For/while loop execution
 */

class Loop {
  constructor(config) {
    this.loop_id = config.loop_id;
    this.loop_enabled = config.loop_enabled !== undefined ? config.loop_enabled : true;
    this.loop_type = config.loop_type || 'for'; // for | while | for_in
    this.start = config.start || 0;
    this.end = config.end || 0;
    this.step = config.step || 1;
    this.condition = config.condition || null;
    this.iterable = config.iterable || [];
    this.actions = config.actions || [];
    this._results = [];
  }

  run() {
    if (!this.loop_enabled) return this._results;
    this._results = [];

    switch (this.loop_type) {
      case 'for':
        for (let i = this.start; i < this.end; i += this.step) {
          const result = this._executeActions(i);
          this._results.push(result);
        }
        break;

      case 'while':
        let safety = 0;
        while (this._checkCondition() && safety < 10000) {
          const result = this._executeActions(safety);
          this._results.push(result);
          safety++;
        }
        break;

      case 'for_in':
        for (const item of this.iterable) {
          const result = this._executeActions(item);
          this._results.push(result);
        }
        break;
    }

    return this._results;
  }

  _checkCondition() {
    if (typeof this.condition === 'function') return this.condition();
    return Boolean(this.condition);
  }

  _executeActions(iterator_value) {
    const results = [];
    for (const action of this.actions) {
      if (typeof action === 'function') {
        results.push(action(iterator_value));
      } else if (action.type === 'set_property' && action.target) {
        action.target.set_property(action.property, action.value);
      } else if (action.type === 'call_function' && typeof action.function === 'function') {
        results.push(action.function(iterator_value, ...(action.args || [])));
      }
    }
    return results.length === 1 ? results[0] : results;
  }

  get_results() { return this._results; }
}

module.exports = Loop;