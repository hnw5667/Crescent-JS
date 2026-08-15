# Crescent.js — Source Code

The complete source code for the Crescent.js framework, imported from the npm package `crescent-js`.

> **v1.0.4** adds Compression, Encrypted Tunnels, and an Optimised Component Cache.

## Documentation Website

Full, up-to-date documentation lives at:

- **Website** — <https://hnw5667.github.io/Crescent-JS>
- **GitHub** — <https://github.com/hnw5667/Crescent-JS>
- **Reddit** — <https://www.reddit.com/r/CrescentJS/>
- **npm** — <https://www.npmjs.com/package/crescent-js>

## Structure

```
code/
├── src/
│   ├── rocket.js              # Main entry point
│   ├── cli/
│   │   └── bin.js             # CLI entry (`crescent run`)
│   └── phase1/
│       ├── frontend/          # Pages, objects, layers, transitions, triggers
│       ├── backend/           # Functions, conditionals, loops, API calls, API server
│       ├── database/          # Built-in CRUD database (syntax, query engine, file storage)
│       └── auth/              # Signup, login, OAuth, password, session cookies
├── package.json
└── LICENSE
```

## Getting Started

```bash
npm install
```

```js
const crescent = require('./src/rocket.js');

// Frontend
const page = crescent.page({ page_id: 'home', size: { height: 800, width: 1200 } });

// Database
crescent.db.create('users');
crescent.db.insert('users', { name: 'Alice' });

// Auth
const result = await crescent.auth.signup().register('john', 'john@example.com', 'SecureP@ss1');
```

## Running

```bash
node src/rocket.js

# Or via the CLI
crescent run <FILE_PATH> [PORT]
```

## Tests

```bash
npm test
```

The full documentation is available in the root [`docs/`](../docs) folder and on the
[documentation website](https://hnw5667.github.io/Crescent-JS).