# 🔐 Auth Module

Access: `Crescent.Auth`

The Auth module handles user registration, login, password hashing, session tokens, and OAuth — all built in with no external dependencies.

---

## Classes

| Class | Description |
|-------|-------------|
| [Password](#password) | Hash and verify passwords with bcrypt |
| [Cookie](#cookie) | Create and verify HMAC-signed session tokens |
| [DBSchema](#dbschema) | Validate user data against a schema |
| [Signup](#signup) | Register new users with validation |
| [Login](#login) | Authenticate users and return session tokens |
| [OAuth](#oauth) | OAuth2 authorization flow |

---

## Password

Bcrypt password hashing and strength checking. All methods are static.

### Static Methods

#### `Password.hash(password)`

Hashes a password using bcrypt. Returns a Promise.

```javascript
const hash = await Password.hash('MyP@ss123');
// '$2b$10$...'
```

#### `Password.verify(password, hash)`

Verifies a password against a bcrypt hash. Returns a Promise<boolean>.

```javascript
const valid = await Password.verify('MyP@ss123', hash); // true
const invalid = await Password.verify('wrong', hash);   // false
```

#### `Password.strength(password)`

Checks password strength. Returns an object with a score and label.

```javascript
Password.strength('abc');        // { score: 0, label: 'weak' }
Password.strength('password');   // { score: 1, label: 'fair' }
Password.strength('P@ssw0rd!');  // { score: 4, label: 'strong' }
```

| Score | Label |
|-------|-------|
| 0-1 | weak |
| 2 | fair |
| 3 | good |
| 4-5 | strong |

---

## Cookie

HMAC-signed session tokens. Tokens are tamper-proof — if anyone changes even one character, verification fails.

### Constructor

```javascript
const cookie = new Cookie({ secret: 'your-secret-key' });
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `secret` | string | Secret key used for HMAC signing. Keep this safe! |

### Methods

#### `create_token(data)`

Creates an HMAC-signed token from a data object.

```javascript
const token = cookie.create_token({ user_id: 42, role: 'admin' });
// 'eyJ1c2VyX2lkIjo0Miwicm9sZSI6ImFkbWluIn0.abc123...'
```

#### `verify_token(token)`

Verifies a token's signature. Returns the original data if valid, `null` if tampered.

```javascript
const data = cookie.verify_token(token);       // { user_id: 42, role: 'admin' }
const bad = cookie.verify_token(token + 'x');  // null (tampered)
```

#### `parse_cookie_header(header, name)`

Extracts a cookie value by name from an HTTP Cookie header string.

```javascript
const val = cookie.parse_cookie_header('session=abc; theme=dark', 'session');
// 'abc'
```

---

## DBSchema

Validates user data against rules you define.

### Constructor

```javascript
const schema = new DBSchema({
  username: { type: 'string', min_length: 3, max_length: 20 },
  email: { type: 'string', format: 'email' },
  password: { type: 'string', min_length: 8 }
});
```

### Validation Rules

| Rule | Description |
|------|-------------|
| `type` | Expected type: `'string'`, `'number'`, `'boolean'` |
| `min_length` | Minimum string length |
| `max_length` | Maximum string length |
| `format` | Format validation: `'email'` |
| `required` | Field must be present (default: true) |

### Methods

#### `validate(data)`

Validates data against the schema. Returns `{ valid, errors }`.

```javascript
const result = schema.validate({ username: 'al', email: 'bad' });
// { valid: false, errors: ['username too short', 'email invalid format'] }

const good = schema.validate({ username: 'alice', email: 'a@b.com', password: 'Str0ng!' });
// { valid: true, errors: [] }
```

---

## Signup

User registration with built-in validation: duplicate checks, password strength, and schema validation.

### Constructor

```javascript
const signup = new Signup({ users_db: './users' });
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `users_db` | string | Path where user data is stored |

### Methods

#### `register(username, password)`

Registers a new user. Returns a Promise with the result.

```javascript
const result = await signup.register('alice', 'Str0ng!Pass');
// { success: true, user: { username: 'alice' } }

const dup = await signup.register('alice', 'other');
// { success: false, error: 'duplicate' }

const weak = await signup.register('bob', '123');
// { success: false, error: 'weak password' }
```

**Validation rules:**
- Username must be at least 3 characters
- Password must be at least 8 characters with uppercase, lowercase, and numbers
- Duplicate usernames are rejected

---

## Login

User authentication with session token generation.

### Constructor

```javascript
const login = new Login({ users_db: './users', secret: 'my-secret' });
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `users_db` | string | Path where user data is stored |
| `secret` | string | Secret key for signing session tokens |

### Methods

#### `authenticate(username, password)`

Authenticates a user and returns a session token.

```javascript
const result = await login.authenticate('alice', 'Str0ng!Pass');
// { success: true, token: '...' }

const fail = await login.authenticate('alice', 'wrong');
// { success: false, error: 'invalid credentials' }
```

#### `verify_session(token)`

Verifies a session token. Returns user data or null.

```javascript
const user = await login.verify_session(result.token);
// { username: 'alice' }
```

---

## OAuth

OAuth2 authorization flow support for third-party login (GitHub, Google, etc.).

### Constructor

```javascript
const oauth = new OAuth({
  provider: 'github',
  client_id: 'your-client-id',
  client_secret: 'your-client-secret',
  redirect_uri: 'http://localhost:3000/callback'
});
```

### Methods

#### `get_auth_url()`

Returns the URL to redirect users to for authorization.

```javascript
const url = oauth.get_auth_url();
// 'https://github.com/login/oauth/authorize?client_id=...'
```

#### `exchange_code(code)`

Exchanges an authorization code for an access token. Returns a Promise.

```javascript
const token_data = await oauth.exchange_code('auth-code-from-callback');
// { access_token: '...', token_type: 'bearer' }