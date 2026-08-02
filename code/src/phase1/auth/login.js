/**
 * Login - User authentication
 */

const Password = require('./password');
const Cookie = require('./cookie');

class Login {
  constructor(query_engine, config = {}) {
    this._qe = query_engine;
    this._password = new Password(config.password || {});
    this._cookie = new Cookie(config.cookie || {});
    this.collection = config.collection || 'users';
    this.max_attempts = config.max_attempts || 5;
    this.lock_duration = config.lock_duration || 900000; // 15 minutes
  }

  /**
   * Authenticate a user with username and password
   */
  async authenticate(username, password) {
    // Find user
    const user = this._qe.findOne(this.collection, { username });
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Check if locked
    if (user.locked) {
      return { success: false, error: 'Account locked. Try again later.' };
    }

    // Verify password
    const valid = this._password.verify(password, user.password_hash, user.salt);
    if (!valid) {
      // Increment login attempts
      const attempts = (user.login_attempts || 0) + 1;
      const updates = { login_attempts: attempts };

      if (attempts >= this.max_attempts) {
        updates.locked = true;
        updates.locked_until = Date.now() + this.lock_duration;
      }

      this._qe.update(this.collection, { _id: user._id }, updates);
      return { success: false, error: 'Invalid credentials' };
    }

    // Reset login attempts and update last login
    this._qe.update(this.collection, { _id: user._id }, {
      login_attempts: 0,
      last_login: Date.now()
    });

    // Create session token
    const token = this._cookie.create_token(user._id);

    // Return safe user data
    const safe_user = { ...user, login_attempts: 0, last_login: Date.now() };
    delete safe_user.password_hash;
    delete safe_user.salt;

    return {
      success: true,
      user: safe_user,
      token,
      set_cookie: this._cookie.set_cookie_header(token)
    };
  }

  /**
   * Verify a session token
   */
  verify_session(token) {
    return this._cookie.verify_token(token);
  }

  /**
   * Get user from session token
   */
  get_user_from_token(token) {
    const session = this.verify_session(token);
    if (!session) return null;
    return this._qe.findOne(this.collection, { _id: session.user_id });
  }

  /**
   * Logout - generate clear cookie header
   */
  logout() {
    return {
      success: true,
      clear_cookie: this._cookie.clear_cookie_header()
    };
  }
}

module.exports = Login;