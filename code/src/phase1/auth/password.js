/**
 * Password - Hashing and verification using Node.js crypto
 */

const crypto = require('crypto');

class Password {
  constructor(config = {}) {
    this.iterations = config.iterations || 100000;
    this.key_length = config.key_length || 64;
    this.digest = config.digest || 'sha512';
    this.salt_length = config.salt_length || 32;
  }

  /**
   * Hash a password with a random salt
   */
  hash(password) {
    const salt = crypto.randomBytes(this.salt_length).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, this.iterations, this.key_length, this.digest).toString('hex');
    return { hash, salt };
  }

  /**
   * Verify a password against a hash and salt
   */
  verify(password, hash, salt) {
    const computed = crypto.pbkdf2Sync(password, salt, this.iterations, this.key_length, this.digest).toString('hex');
    return computed === hash;
  }

  /**
   * Generate a random reset token
   */
  generate_reset_token() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Check password strength
   */
  check_strength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: 'weak', score };
    if (score <= 4) return { strength: 'medium', score };
    return { strength: 'strong', score };
  }
}

module.exports = Password;