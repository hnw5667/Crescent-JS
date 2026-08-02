/**
 * Conditional - If/else_if/else evaluation
 */

class Conditional {
  constructor(config) {
    this.conditional_id = config.conditional_id;
    this.conditional_enabled = config.conditional_enabled !== undefined ? config.conditional_enabled : true;
    this.if_branch = config.if || { check: false, actions: [] };
    this.else_if_branches = config.else_if || [];
    this.else_branch = config.else || { actions: [] };
  }

  evaluate() {
    if (!this.conditional_enabled) return null;

    // Check if branch
    if (this._checkCondition(this.if_branch.check)) {
      this._executeActions(this.if_branch.actions);
      return 'if';
    }

    // Check else_if branches
    for (const branch of this.else_if_branches) {
      if (this._checkCondition(branch.check)) {
        this._executeActions(branch.actions);
        return 'else_if';
      }
    }

    // Default to else
    this._executeActions(this.else_branch.actions);
    return 'else';
  }

  _checkCondition(check) {
    if (typeof check === 'function') return check();
    if (check && typeof check.evaluate === 'function') return check.evaluate();
    return Boolean(check);
  }

  _executeActions(actions) {
    if (!actions) return;
    for (const action of actions) {
      if (typeof action === 'function') action();
      else if (action.type === 'set_property' && action.target) {
        action.target.set_property(action.property, action.value);
      } else if (action.type === 'call_function' && typeof action.function === 'function') {
        action.function(...(action.args || []));
      }
    }
  }

  set_if(check, actions) {
    this.if_branch = { check, actions: actions || [] };
    return this;
  }

  add_else_if(check, actions) {
    this.else_if_branches.push({ check, actions: actions || [] });
    return this;
  }

  set_else(actions) {
    this.else_branch = { actions: actions || [] };
    return this;
  }
}

module.exports = Conditional;