/**
 * RocketBoolean - Boolean evaluator with AND/OR/NOT logic
 */

class RocketBoolean {
  constructor(config) {
    this.boolean_id = config.boolean_id;
    this.value1 = config.value1 !== undefined ? config.value1 : true;
    this.value2 = config.value2 !== undefined ? config.value2 : true;
    this.operator = config.operator || 'AND'; // AND | OR | NOT | XOR | NAND | NOR
  }

  /**
   * Evaluate the boolean expression
   */
  evaluate() {
    const v1 = this._resolve(this.value1);
    const v2 = this._resolve(this.value2);

    switch (this.operator) {
      case 'AND': return v1 && v2;
      case 'OR': return v1 || v2;
      case 'NOT': return !v1;
      case 'XOR': return v1 !== v2;
      case 'NAND': return !(v1 && v2);
      case 'NOR': return !(v1 || v2);
      default: return v1 && v2;
    }
  }

  /**
   * Resolve a value - could be boolean, function, or another RocketBoolean
   */
  _resolve(value) {
    if (typeof value === 'function') return Boolean(value());
    if (value && typeof value.evaluate === 'function') return value.evaluate();
    return Boolean(value);
  }

  /**
   * Chain with AND
   */
  and(other) {
    return new RocketBoolean({
      boolean_id: `${this.boolean_id}_and`,
      value1: this,
      value2: other,
      operator: 'AND'
    });
  }

  /**
   * Chain with OR
   */
  or(other) {
    return new RocketBoolean({
      boolean_id: `${this.boolean_id}_or`,
      value1: this,
      value2: other,
      operator: 'OR'
    });
  }

  /**
   * Negate
   */
  not() {
    return new RocketBoolean({
      boolean_id: `${this.boolean_id}_not`,
      value1: this,
      operator: 'NOT'
    });
  }
}

module.exports = RocketBoolean;