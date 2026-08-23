# Crescent.js — Source Code

The complete source code for the Crescent.js framework, imported from the npm package `crescent-js`.

> **v1.0.9** — Tabel system: `crescent.table({ table_name, columns, max_cells, copies, unique_columns })` with 160-bit hash unique checks, sharding, hidden folders (`crescent tabels --show/--hide`).
> **v1.0.8** — Custom `about-webpage.txt` per page (e.g. `a square of colour 0,0,0 with bold text of 255,255,255 which goes like Get Started all in one layer`), home version `v1.0.8`, and icons for TypeScript/Bundling/JS-First.
> **v1.0.7** added plain-English `about-webpage.txt` generated from `src/phase1/frontend/*.js` alongside HTML.
> **v1.0.6** added JS-First Component System (`section-{name}` IDs, `rocket.js` hydration).
> **v1.0.5** added official TypeScript type definitions (`index.d.ts`).

## Documentation Website

Full, up-to-date documentation lives at:

- **Website** — <https://hnw5667.github.io/Crescent-JS>
- **GitHub** — <https://github.com/hnw5667/Crescent-JS>
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
├── index.d.ts                 # Official TypeScript types (v1.0.9)
├── about-webpage.txt          # Plain-English frontend explanation (v1.0.7 custom per-page in v1.0.8)
├── package.json               # v1.0.9
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

## TypeScript

Crescent.js ships official type definitions (`index.d.ts`). TypeScript consumers get full
type checking and auto-complete out of the box:

```ts
import crescent, { Rocket, TextLayer, Transition } from 'crescent-js';

// The default export is the typed singleton
const page = crescent.page({ page_id: 'home', size: { height: 800, width: 1200 } });

// `layer_type` narrows the return type to the concrete layer class
const title: TextLayer = crescent.layer({ layer_id: 'title', layer_type: 'text', text: 'Hi' });

// Classes are available as named exports for values and types
const custom: Rocket = new crescent.Rocket();
const transition = new Transition({ time: '1s', changes: [] });
```

## Running

```bash
node src/rocket.js

# Or via the CLI
crescent run <FILE_PATH> [PORT]
```

## Tests

```bash
npm test                # full suite: compression, tunnels, cache, CLI, TS
npm run test:backend    # TypeScript backend harness (db/auth/api/compression/…)
npm run test:browser    # TypeScript frontend rendered in a real browser
npm run test:typescript # tsc --noEmit against the consumer fixture
```

Every suite runs automatically before publishing (`prepublishOnly`), so a broken
or unverified framework cannot be shipped.

The full documentation is available in the root [`docs/`](../docs) folder and on the
[documentation website](https://hnw5667.github.io/Crescent-JS).