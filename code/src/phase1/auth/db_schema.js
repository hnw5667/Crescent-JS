/**
 * DBSchema - Defines and validates user data schema
 */

class DBSchema {
  constructor() {
    this.user_schema = {
      _id: { type: 'string', required: true },
      username: { type: 'string', required: true, min_length: 3, max_length: 32 },
      email: { type: 'string', required: true, format: 'email' },
      password_hash: { type: 'string', required: true },
      salt: { type: 'string', required: true },
      created_at: { type: 'number', required: true },
      updated_at: { type: 'number', required: true },
      role: { type: 'string', default: 'user' },
      email_verified: { type: 'boolean', default: false },
      oauth_providers: { type: 'array', default: [] },
      last_login: { type: 'number', default: null },
      locked: { type: 'boolean', default: false },
      login_attempts: { type: 'number', default: 0 }
    };

    this.session_schema = {
      _id: { type: 'string', required: true },
      user_id: { type: 'string', required: true },
      token: { type: 'string', required: true },
      created_at: { type: 'number', required: true },
      expires_at: { type: 'number', required: true },
      ip: { type: 'string', default: null },
      user_agent: { type: 'string', default: null }
    };
  }

  /**
   * Validate a user document against the schema
   */
  validate_user(doc) {
    const errors = [];
    for (const [field, rules] of Object.entries(this.user_schema)) {
      const value = doc[field];

      if (value === undefined || value === null) {
        if (rules.required) errors.push(`${field} is required`);
        continue;
      }

      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }
      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
      }
      if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field} must be a boolean`);
      }
      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      }

      if (rules.min_length && typeof value === 'string' && value.length < rules.min_length) {
        errors.push(`${field} must be at least ${rules.min_length} characters`);
      }
      if (rules.max_length && typeof value === 'string' && value.length > rules.max_length) {
        errors.push(`${field} must be at most ${rules.max_length} characters`);
      }
      if (rules.format === 'email' && !this._validateEmail(value)) {
        errors.push(`${field} must be a valid email`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  /**
   * Apply defaults to a user document
   */
  apply_defaults(doc) {
    const result = { ...doc };
    for (const [field, rules] of Object.entries(this.user_schema)) {
      if (result[field] === undefined && rules.default !== undefined) {
        result[field] = typeof rules.default === 'function' ? rules.default() : rules.default;
      }
    }
    return result;
  }

  _validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

module.exports = DBSchema;