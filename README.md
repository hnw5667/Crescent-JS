 🌙 Crescent.js

**A full-stack JavaScript framework with a built-in database, authentication, backend logic, and frontend rendering.**

No external databases. No config files. No setup wizards. Just install and build.

[![License: MIT + AI Restriction](https://img.shields.io/badge/License-MIT%20%2B%20AI%20Restriction-red.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/crescent-js.svg)](https://www.npmjs.com/package/crescent-js)
[![Tests](https://img.shields.io/badge/Tests-38%20passing-brightgreen.svg)](./test)

---

## Install

```bash
npm install crescent-js
```

## Quick Start

```javascript
const Crescent = require('crescent-js');

// Database — no external DB needed
const { FileManager, QueryEngine } = Crescent.Database;
const fm = new FileManager({ base_path: './data' });
fm.create_collection('users');

// Auth — bcrypt hashing & session tokens
const { Password, Signup, Login } = Crescent.Auth;
const hash = await Password.hash('mypassword');

// Backend — functions, conditionals, loops
const { RocketFunction, Conditional, Loop } = Crescent.Backend;
const fn = new RocketFunction('greet', { body: (name) => `Hello, ${name}!` });

// Frontend — component-based UI
const { Page, TextLayer } = Crescent.Frontend;
const page = new Page({ title: 'My App' });
```

---

## Modules

### 📦 Database

Everything you need to store and query data — no external database required.

| Class | What it does |
|-------|-------------|
| `FileManager` | Create, read, update, delete JSON collections on disk |
| `QueryEngine` | Query documents with operators: `$gt`, `$lt`, `$gte`, `$lte`, `$ne`, `$in`, `$contains` |
| `DatabaseSyntax` | SQL-like syntax: `CREATE`, `INSERT`, `SELECT`, `UPDATE`, `DELETE` |
| `LiveSearch` | Full-text search with fuzzy matching |

**Example:**
```javascript
const { QueryEngine } = Crescent.Database;
const qe = new QueryEngine();

qe.insert({ name: 'Alice', age: 30 });
qe.insert({ name: 'Bob', age: 25 });

// Find with operators
qe.find({ age: { $gt: 26 } });
// → [{ name: 'Alice', age: 30 }]

// Update and delete
qe.update({ name: 'Alice' }, { age: 31 });
qe.delete({ age: { $lt: 26 } });
```

### 🔐 Auth

User registration, login, and session management built in.

| Class | What it does |
|-------|-------------|
| `Password` | Hash passwords with bcrypt, verify them, check strength |
| `Cookie` | Create and verify HMAC-signed session tokens |
| `DBSchema` | Validate user data (username, email, password rules) |
| `Signup` | Register new users with duplicate & weak password checks |
| `Login` | Authenticate users and return session tokens |
| `OAuth` | OAuth2 authorization flow support |

**Example:**
```javascript
const { Signup, Login } = Crescent.Auth;

// Register
const signup = new Signup({ users_db: './users' });
await signup.register('alice', 'Str0ng!Pass');

// Login
const login = new Login({ users_db: './users' });
const session = await login.authenticate('alice', 'Str0ng!Pass');
// session = { username: 'alice', token: '...' }
```

### ⚙️ Backend

Server-side logic primitives — functions, conditionals, loops, and boolean chains.

| Class | What it does |
|-------|-------------|
| `RocketFunction` | Named functions with enable/disable toggle |
| `Conditional` | If/else evaluation with custom conditions |
| `Loop` | For-loops and for-in iteration |
| `RocketBoolean` | AND, OR, NOT logic chains |
| `Collect` | Gather and transform data from multiple sources |
| `APICall` | Make HTTP requests (GET, POST, PUT, DELETE) |
| `APIMake` | Build and send HTTP API requests |

**Example:**
```javascript
const { RocketFunction, Conditional } = Crescent.Backend;

// Functions with enable/disable
const fn = new RocketFunction('greet', {
  body: (name) => `Hello, ${name}!`
});
fn.call('World'); // 'Hello, World!'
fn.disable();
fn.call('World'); // null (function is disabled)

// Conditionals
const cond = new Conditional({
  condition: () => 5 > 3,
  if_branch: () => 'yes',
  else_branch: () => 'no'
});
cond.evaluate(); // 'yes'
```

### 🎨 Frontend

Component-based UI system with layers, transitions, and responsive design.

| Class | What it does |
|-------|-------------|
| `Page` | Top-level page container with metadata |
| `Object` (RObject) | Component that holds layers |
| `BaseLayer` | Base styling layer (background, padding, borders) |
| `TextLayer` | Text content with tag and styling |
| `ImageLayer` | Image display with source and sizing |
| `ShapeLayer` | Shapes (rectangle, circle) with styling |
| `InputLayer` | Form inputs (text, password, email, etc.) |
| `Transition` | CSS animations (fade, slide, scale, rotate) |
| `Trigger` | Event handlers (click, hover, focus, etc.) |
| `Responsive` | Responsive breakpoints (mobile, tablet, desktop) |
| `Renderer` | Render pages to HTML strings |

**Example:**
```javascript
const { Page, Object: RObj, TextLayer, BaseLayer } = Crescent.Frontend;

const page = new Page({ title: 'My App' });

const header = new RObj({ id: 'header' });
header.add_layer(new BaseLayer({
  styles: { background: '#1a1a2e', padding: '20px' }
}));
header.add_layer(new TextLayer({
  text: 'Welcome to Crescent.js!',
  tag: 'h1',
  styles: { color: '#ffffff' }
}));

page.add(header);
const html = page.render(); // Full HTML string
```

---

## Testing

```bash
npm test            # Run all tests
npm run test:phase1 # Phase 1 only
```

All 38 Phase 1 tests pass:
- 14 Database tests
- 11 Backend tests
- 13 Auth tests

---

## API Reference

Full API documentation is available in the [`docs/`](./docs) directory.

---

## License

MIT License with AI Training Restriction. See [LICENSE](./LICENSE).

**This software may NOT be used for AI model training.** For AI usage, please review our License.
