# Authentication

Rocket.js comes with built-in authentication support — signup, login, OAuth, password management, and cookie-based sessions — so you don't need to wire up third-party auth libraries.

---

## Overview

The `rocket.auth` object provides everything you need:

| Method | Description |
|--------|-------------|
| `rocket.auth.signup()` | Register a new user |
| `rocket.auth.login()` | Authenticate an existing user |
| `rocket.auth.oauth()` | Authenticate via third-party OAuth providers |
| `rocket.auth.password` | Password hashing and verification utilities |
| `rocket.auth.cookie` | Cookie-based session management |

---

## Signup

Register a new user account.

### Basic Signup

```javascript
const user = rocket.auth.signup({
  username: 'rocketuser',
  email: 'user@example.com',
  password: 'securepassword123'
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string | Unique username for the account |
| `email` | string | Email address |
| `password` | string | Plain-text password (automatically hashed) |

### Signup with Additional Fields

```javascript
const user = rocket.auth.signup({
  username: 'rocketuser',
  email: 'user@example.com',
  password: 'securepassword123',
  role: 'admin',
  displayName: 'Rocket User'
});
```

---

## Login

Authenticate an existing user and create a session.

### Basic Login

```javascript
const session = rocket.auth.login({
  username: 'rocketuser',
  password: 'securepassword123'
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string | The user's username |
| `password` | string | The user's password |

### Login Response

The login method returns a session object containing:

```javascript
{
  success: true,
  token: 'session-token-here',
  user: {
    username: 'rocketuser',
    email: 'user@example.com',
    role: 'admin'
  }
}
```

---

## OAuth

Authenticate users via third-party providers (Google, GitHub, etc.).

### Setting Up OAuth

```javascript
const oauthSession = rocket.auth.oauth({
  provider: 'google',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://yourapp.com/auth/callback'
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `provider` | string | OAuth provider name (`google`, `github`, etc.) |
| `clientId` | string | OAuth client ID from the provider |
| `clientSecret` | string | OAuth client secret from the provider |
| `redirectUri` | string | Callback URL after authentication |

---

## Password Management

The built-in password manager handles hashing and verification.

### Hashing a Password

```javascript
const hashed = rocket.auth.password.hash('mypassword123');
```

### Verifying a Password

```javascript
const isValid = rocket.auth.password.verify('mypassword123', hashed);
// Returns true if the password matches
```

---

## Cookie Management

Manage session cookies for authenticated users.

### Setting a Cookie

```javascript
rocket.auth.cookie.set('session_token', user.token, {
  httpOnly: true,
  secure: true,
  maxAge: 86400000 // 24 hours in milliseconds
});
```

### Getting a Cookie

```javascript
const token = rocket.auth.cookie.get('session_token');
```

### Clearing a Cookie

```javascript
rocket.auth.cookie.clear('session_token');
```

---

## Complete Auth Flow Example

```javascript
const rocket = require('crescent-js');

// 1. Sign up a new user
const newUser = rocket.auth.signup({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'supersecret'
});

// 2. Log in
const session = rocket.auth.login({
  username: 'johndoe',
  password: 'supersecret'
});

if (session.success) {
  // 3. Set session cookie
  rocket.auth.cookie.set('session_token', session.token, {
    httpOnly: true,
    secure: true,
    maxAge: 86400000
  });

  console.log('User logged in:', session.user.username);
}

// 4. Later, log out
rocket.auth.cookie.clear('session_token');
```

---

## Security Best Practices

> ⚠️ Follow these guidelines to keep your application secure.

- Always use **HTTPS** in production to protect session tokens
- Set `httpOnly` and `secure` flags on session cookies
- **Hash passwords** — Rocket.js does this automatically with `signup()`
- Use **strong passwords** — enforce minimum length and complexity
- Set **reasonable expiration** on session cookies
