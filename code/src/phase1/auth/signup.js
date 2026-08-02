/**
 * Signup - User registration
 */

const crypto = require('crypto');
const Password = require('./password');
const DBSchema = require('./db_schema');

class Signup {
  constructor(query_engine, config = {}) {
    this._qe = query_engine;
    this._password = new Password(config.password || {});
    this._schema = new DBSchema();
    this.collection = config.collection || 'users';
    this.require_email_verification = config.require_email_verification || false;
  }

  /**
   * Register a new user
   */
  async register(username, email, password) {
    // Validate inputs
    if (!username || !email || !password) {
      return { success: false, error: 'Username, email, and password are required' };
    }

    // Check password strength
    const strength = this._password.check_strength(password);
    if (strength.strength === 'weak') {
      return { success: false, error: 'Password is too weak', strength };
    }

    // Check if username exists
    const existing_user = this._qe.findOne(this.collection, { username });
    if (existing_user) {
      return { success: false, error: 'Username already exists' };
    }

    // Check if email exists
    const existing_email = this._qe.findOne(this.collection, { email });
    if (existing_email) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password
    const { hash, salt } = this._password.hash(password);

    // Create user document
    const user = {
      _id: crypto.randomBytes(16).toString('hex'),
      username,
      email,
      password_hash: hash,
      salt,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    // Apply schema defaults
    const full_user = this._schema.apply_defaults(user);

    // Validate against schema
    const validation = this._schema.validate_user(full_user);
    if (!validation.valid) {
      return { success: false, error: 'Validation failed', errors: validation.errors };
    }

    // Insert into database
    const saved = this._qe.insert(this.collection, full_user);

    // Return user without sensitive data
    const safe_user = { ...saved };
    delete safe_user.password_hash;
    delete safe_user.salt;

    return {
      success: true,
      user: safe_user,
      verification_required: this.require_email_verification
    };
  }
}

module.exports = Signup;