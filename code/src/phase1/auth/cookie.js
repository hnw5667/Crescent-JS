/**
 * Cookie - Session cookie management
 */

const crypto = require('crypto');

class Cookie {
  constructor(config = {}) {
    this.secret = config.secret || 'crescent-default-secret-change-me';
    this.cookie_name = config.cookie_name || 'crescent_session';
    this.max_age = config.max_age || 86400000; // 24 hours
    this.http_only = config.http_only !== undefined ? config.http_only : true;
    this.secure = config.secure !== undefined ? config.secure : false;
    this.same_site = config.same_site || 'lax';
    this.domain = config.domain || null;
    this.path = config.path || '/';
  }

  /**
   * Create a signed session token
   */
  create_token(user_id) {
    const payload = {
      user_id,
      iat: Date.now(),
      exp: Date.now() + this.max_age,
      jti: crypto.randomBytes(16).toString('hex')
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this._sign(encoded);
    return `${encoded}.${signature}`;
  }

  /**
   * Verify and decode a session token
   */
  verify_token(token) {
    try {
      const [encoded, signature] = token.split('.');
      if (!encoded || !signature) return null;

      const expected_sig = this._sign(encoded);
      if (signature !== expected_sig) return null;

      const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());

      if (payload.exp && Date.now() > payload.exp) return null;

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Parse cookie header and extract session token
   */
  parse_cookies(cookie_header) {
    const cookies = {};
    if (!cookie_header) return cookies;
    cookie_header.split(';').forEach(pair => {
      const [key, value] = pair.trim().split('=');
      if (key && value) cookies[key.trim()] = value.trim();
    });
    return cookies;
  }

  /**
   * Get session from request cookies
   */
  get_session(cookie_header) {
    const cookies = this.parse_cookies(cookie_header);
    const token = cookies[this.cookie_name];
    if (!token) return null;
    return this.verify_token(token);
  }

  /**
   * Generate Set-Cookie header value
   */
  set_cookie_header(token) {
    let header = `${this.cookie_name}=${token}`;
    if (this.max_age) header += `; Max-Age=${Math.floor(this.max_age / 1000)}`;
    if (this.domain) header += `; Domain=${this.domain}`;
    if (this.path) header += `; Path=${this.path}`;
    if (this.secure) header += '; Secure';
    if (this.http_only) header += '; HttpOnly';
    if (this.same_site) header += `; SameSite=${this.same_site}`;
    return header;
  }

  /**
   * Generate clear cookie header
   */
  clear_cookie_header() {
    let header = `${this.cookie_name}=`;
    header += '; Max-Age=0';
    if (this.domain) header += `; Domain=${this.domain}`;
    if (this.path) header += `; Path=${this.path}`;
    return header;
  }

  /**
   * Sign data with HMAC
   */
  _sign(data) {
    return crypto.createHmac('sha256', this.secret).update(data).digest('base64url');
  }
}

module.exports = Cookie;