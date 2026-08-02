/**
 * OAuth - Third-party authentication (Google, GitHub, etc.)
 */

const crypto = require('crypto');
const https = require('https');

class OAuth {
  constructor(query_engine, config = {}) {
    this._qe = query_engine;
    this.collection = config.collection || 'users';
    this.providers = {};

    // Register configured providers
    if (config.providers) {
      for (const [name, cfg] of Object.entries(config.providers)) {
        this.add_provider(name, cfg);
      }
    }
  }

  /**
   * Add an OAuth provider
   */
  add_provider(name, config) {
    this.providers[name] = {
      client_id: config.client_id,
      client_secret: config.client_secret,
      authorize_url: config.authorize_url,
      token_url: config.token_url,
      user_info_url: config.user_info_url,
      scope: config.scope || 'openid profile email',
      redirect_uri: config.redirect_uri
    };
    return this;
  }

  /**
   * Generate authorization URL for a provider
   */
  get_authorize_url(provider_name, state = null) {
    const provider = this.providers[provider_name];
    if (!provider) throw new Error(`Provider ${provider_name} not configured`);

    const params = new URLSearchParams({
      client_id: provider.client_id,
      redirect_uri: provider.redirect_uri,
      response_type: 'code',
      scope: provider.scope,
      state: state || crypto.randomBytes(16).toString('hex')
    });

    return `${provider.authorize_url}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchange_code(provider_name, code) {
    const provider = this.providers[provider_name];
    if (!provider) throw new Error(`Provider ${provider_name} not configured`);

    return new Promise((resolve, reject) => {
      const url = new URL(provider.token_url);
      const lib = url.protocol === 'https:' ? https : require('http');

      const body = new URLSearchParams({
        client_id: provider.client_id,
        client_secret: provider.client_secret,
        code,
        redirect_uri: provider.redirect_uri,
        grant_type: 'authorization_code'
      }).toString();

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
          'Accept': 'application/json'
        }
      };

      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Invalid token response')); }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * Get user info from provider
   */
  async get_user_info(provider_name, access_token) {
    const provider = this.providers[provider_name];
    if (!provider) throw new Error(`Provider ${provider_name} not configured`);

    return new Promise((resolve, reject) => {
      const url = new URL(provider.user_info_url);
      const lib = url.protocol === 'https:' ? https : require('http');

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json'
        }
      };

      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Invalid user info response')); }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Authenticate or register user via OAuth
   */
  async authenticate(provider_name, code) {
    try {
      // Exchange code for token
      const tokens = await this.exchange_code(provider_name, code);

      // Get user info
      const profile = await this.get_user_info(provider_name, tokens.access_token);

      // Find existing user by OAuth provider
      const existing = this._qe.findOne(this.collection, {
        oauth_providers: { $contains: provider_name },
        email: profile.email
      });

      if (existing) {
        // Update last login
        this._qe.update(this.collection, { _id: existing._id }, {
          last_login: Date.now()
        });
        const safe_user = { ...existing, last_login: Date.now() };
        delete safe_user.password_hash;
        delete safe_user.salt;
        return { success: true, user: safe_user, is_new: false };
      }

      // Register new user via OAuth
      const new_user = {
        _id: crypto.randomBytes(16).toString('hex'),
        username: profile.login || profile.name || profile.email.split('@')[0],
        email: profile.email,
        password_hash: null,
        salt: null,
        oauth_providers: [provider_name],
        oauth_ids: { [provider_name]: profile.id || profile.sub },
        created_at: Date.now(),
        updated_at: Date.now()
      };

      const saved = this._qe.insert(this.collection, new_user);
      const safe_user = { ...saved };
      delete safe_user.password_hash;
      delete safe_user.salt;

      return { success: true, user: safe_user, is_new: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = OAuth;