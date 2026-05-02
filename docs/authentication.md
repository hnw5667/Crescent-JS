# Authentication Guide

Built-in user management with signup, login, OAuth, and session handling.

---

## Overview

Crescent.js provides a complete authentication system:

- **Signup** — User registration with password strength validation
- **Login** — Authentication with account locking after failed attempts
- **OAuth** — Third-party login (Google, GitHub, etc.)
- **Password** — Secure hashing with PBKDF2
- **Cookie** — Signed session tokens with configurable expiry

---

## Signup

Register new users with validation and password strength checks.

```js
const signup = crescent.auth.signup({
  collection: 'users',
  require_email_verification: false,
  password: {
    iterations: 100000,
    key_length: 64,
    digest: 'sha512'
  }
});

const result = await signup.register('john', 'john@example.com', 'SecureP@ss1');
// { success: true, user: { ... }, verification_required: false }
```

### Password Strength

| Score | Strength | Result |
|-------|----------|--------|
| 0–2 | `weak` | Rejected |
| 3–4 | `medium` | Accepted |
| 5–6 | `strong` | Accepted |

Checks: length ≥ 8, length ≥ 12, lowercase, uppercase, digits, special characters.

### Registration Flow

1. Validate required fields (username, email, password)
2. Check password strength (rejects `weak`)
3. Check for existing username
4. Check for existing email
5. Hash password with PBKDF2 + random salt
6. Apply schema defaults (role, email_verified, etc.)
7. Validate against user schema
8. Insert into collection
9. Return safe user (no password_hash or salt)

---

## Login

Authenticate users with username and password.

```js
const login = crescent.auth.login({
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
// { success: true, user: { ... }, token, set_cookie: '...' }
```

### Account Locking

After `max_attempts` failed logins, the account is locked for `lock_duration` milliseconds.

### Session Verification

```js
const session = login.verify_session(token);
const user = login.get_user_from_token(token);
const logoutResult = login.logout();
// { success: true, clear_cookie: '...' }
```

---

## OAuth

Third-party authentication with providers like Google and GitHub.

### Configuring Providers

```js
const oauth = crescent.auth.oauth({
  collection: 'users',
  providers: {
    google: {
      client_id: 'your-client-id',
      client_secret: 'your-client-secret',
      authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      token_url: 'https://oauth2.googleapis.com/token',
      user_info_url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      scope: 'openid profile email',
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
```

### OAuth Flow

```js
// 1. Redirect user to authorization URL
const authUrl = oauth.get_authorize_url('google');

// 2. Handle callback with authorization code
const result = await oauth.authenticate('google', authorizationCode);
// { success: true, user: { ... }, is_new: true/false }
```

### Adding Providers Dynamically

```js
oauth.add_provider('gitlab', {
  client_id: '...',
  client_secret: '...',
  authorize_url: 'https://gitlab.com/oauth/authorize',
  token_url: 'https://gitlab.com/oauth/token',
  user_info_url: 'https://gitlab.com/api/v4/user',
  scope: 'read_user',
  redirect_uri: 'http://localhost:3000/auth/callback'
});
```

---

## Password Manager

Direct access to password hashing and verification.

```js
const password = crescent.auth.password;

const { hash, salt } = password.hash('my-password');
const valid = password.verify('my-password', hash, salt); // true
const strength = password.check_strength('P@ssw0rd!'); // { strength: 'strong', score: 6 }
const token = password.generate_reset_token();
```

---

## Cookie Manager

Direct access to session token management.

```js
const cookie = crescent.auth.cookie;

const token = cookie.create_token('user_123');
const session = cookie.verify_token(token);
// { user_id: 'user_123', iat: ..., exp: ..., jti: '...' }

const cookies = cookie.parse_cookies('crescent_session=abc; other=xyz');
const session = cookie.get_session(request.headers.cookie);
const setCookie = cookie.set_cookie_header(token);
const clearCookie = cookie.clear_cookie_header();
```

### Cookie Configuration

| Property | Default | Description |
|----------|---------|-------------|
| `secret` | `'rocket-default-secret-change-me'` | HMAC signing key |
| `cookie_name` | `'rocket_session'` | Cookie name |
| `max_age` | `86400000` | 24 hours in ms |
| `http_only` | `true` | HttpOnly flag |
| `secure` | `false` | Secure flag |
| `same_site` | `'lax'` | SameSite policy |
| `domain` | `null` | Cookie domain |
| `path` | `'/'` | Cookie path |

---

## User Schema

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `_id` | string | ✅ | — |
| `username` | string (3–32 chars) | ✅ | — |
| `email` | string (email format) | ✅ | — |
| `password_hash` | string | ✅ | — |
| `salt` | string | ✅ | — |
| `created_at` | number | ✅ | — |
| `updated_at` | number | ✅ | — |
| `role` | string | ❌ | `'user'` |
| `email_verified` | boolean | ❌ | `false` |
| `oauth_providers` | array | ❌ | `[]` |
| `last_login` | number | ❌ | `null` |
| `locked` | boolean | ❌ | `false` |
| `login_attempts` | number | ❌ | `0` |

---

## Security Best Practices

1. **Always change the cookie secret** — Never use the default in production
2. **Enable `secure` flag** in production (requires HTTPS)
3. **Use `same_site: 'strict'`** for sensitive applications
4. **Set appropriate `lock_duration`** to prevent brute force
5. **Require strong passwords** — weak passwords are rejected by default
6. **Keep `http_only: true`** to prevent XSS access to cookies