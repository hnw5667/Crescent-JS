export default function AuthenticationPage() {
  return (
    <>
      <h1>Authentication Guide</h1>
      <p>Built-in user management with signup, login, OAuth, and session handling.</p>

      <hr />

      <h2>Overview</h2>
      <p>Crescent.js provides a complete authentication system:</p>
      <ul>
        <li><strong>Signup</strong> — User registration with password strength validation</li>
        <li><strong>Login</strong> — Authentication with account locking after failed attempts</li>
        <li><strong>OAuth</strong> — Third-party login (Google, GitHub, etc.)</li>
        <li><strong>Password</strong> — Secure hashing with PBKDF2</li>
        <li><strong>Cookie</strong> — Signed session tokens with configurable expiry</li>
      </ul>

      <hr />

      <h2>Signup</h2>
      <pre><code>{`const signup = crescent.auth.signup({
  collection: 'users',
  require_email_verification: false,
  password: {
    iterations: 100000,
    key_length: 64,
    digest: 'sha512'
  }
});

const result = await signup.register('john', 'john@example.com', 'SecureP@ss1');
// { success: true, user: { ... }, verification_required: false }`}</code></pre>

      <h3>Password Strength</h3>
      <table>
        <thead>
          <tr><th>Score</th><th>Strength</th><th>Result</th></tr>
        </thead>
        <tbody>
          <tr><td>0–2</td><td><code>weak</code></td><td>Rejected</td></tr>
          <tr><td>3–4</td><td><code>medium</code></td><td>Accepted</td></tr>
          <tr><td>5–6</td><td><code>strong</code></td><td>Accepted</td></tr>
        </tbody>
      </table>

      <p>Checks: length 8+, length 12+, lowercase, uppercase, digits, special characters.</p>

      <hr />

      <h2>Login</h2>
      <pre><code>{`const login = crescent.auth.login({
  collection: 'users',
  max_attempts: 5,
  lock_duration: 900000, // 15 minutes
  password: {
    iterations: 100000,
    key_length: 64,
    digest: 'sha512'
  },
  cookie: {
    secret: 'your-secret-key',
    cookie_name: 'crescent_session',
    max_age: 86400000, // 24 hours
    http_only: true,
    secure: false,
    same_site: 'lax'
  }
});

const result = await login.authenticate('john', 'SecureP@ss1');
// { success: true, user: { ... }, token, set_cookie: '...' }`}</code></pre>

      <h3>Session Management</h3>
      <pre><code>{`const session = login.verify_session(token);
const user = login.get_user_from_token(token);
const logout = login.logout();`}</code></pre>

      <hr />

      <h2>OAuth</h2>
      <pre><code>{`const oauth = crescent.auth.oauth({
  collection: 'users',
  providers: {
    google: {
      client_id: 'your-client-id',
      client_secret: 'your-client-secret',
      authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      token_url: 'https://oauth2.googleapis.com/token',
      user_info_url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      scope: 'profile email',
      redirect_uri: 'http://localhost:3000/auth/callback'
    },
    github: {
      client_id: 'your-client-id',
      client_secret: 'your-client-secret',
      authorize_url: 'https://github.com/login/oauth/authorize',
      token_url: 'https://github.com/login/oauth/access_token',
      user_info_url: 'https://api.github.com/user',
      scope: 'read:user user:email',
      redirect_uri: 'http://localhost:3000/auth/callback'
    }
  }
});

// Get authorization URL
const authUrl = oauth.get_authorize_url('google');

// Handle callback
const result = await oauth.authenticate('google', authorizationCode);`}</code></pre>

      <hr />

      <h2>Password Manager</h2>
      <pre><code>{`const password = crescent.auth.password;

const { hash, salt } = password.hash('my-password');
const valid = password.verify('my-password', hash, salt);
const strength = password.check_strength('P@ssw0rd!');`}</code></pre>

      <hr />

      <h2>Cookie Manager</h2>
      <pre><code>{`const cookie = crescent.auth.cookie;

const token = cookie.create_token('user_123');
const session = cookie.verify_token(token);
const setCookie = cookie.set_cookie_header(token);
const clearCookie = cookie.clear_cookie_header();`}</code></pre>

      <table>
        <thead>
          <tr><th>Property</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>secret</code></td><td>required</td><td>HMAC signing key</td></tr>
          <tr><td><code>cookie_name</code></td><td><code>'rocket_session'</code></td><td>Cookie name</td></tr>
          <tr><td><code>max_age</code></td><td><code>86400000</code></td><td>24 hours in ms</td></tr>
          <tr><td><code>http_only</code></td><td><code>true</code></td><td>HttpOnly flag</td></tr>
          <tr><td><code>secure</code></td><td><code>false</code></td><td>Secure flag</td></tr>
          <tr><td><code>same_site</code></td><td><code>'lax'</code></td><td>SameSite policy</td></tr>
        </tbody>
      </table>

      <hr />

      <h2>Security Best Practices</h2>
      <ol>
        <li><strong>Always change the cookie secret</strong> — Never use the default in production</li>
        <li><strong>Enable <code>secure</code> flag</strong> in production (requires HTTPS)</li>
        <li><strong>Use <code>same_site: 'strict'</code></strong> for sensitive applications</li>
        <li><strong>Set appropriate <code>lock_duration</code></strong> to prevent brute force</li>
        <li><strong>Require strong passwords</strong> — weak passwords are rejected by default</li>
        <li><strong>Keep <code>http_only: true</code></strong> to prevent XSS access to cookies</li>
      </ol>
    </>
  );
}