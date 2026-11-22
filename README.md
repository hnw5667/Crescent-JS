<p align="center">
  <img src="assets/crescent-js-banner.svg" alt="Crescent.js" width="480">
</p>

<h1 align="center">Crescent.js</h1>

<p align="center">
  A full-stack JavaScript framework — frontend rendering, backend logic, database and authentication in one package.
</p>

<p align="center">
  <a href="https://crescent-js.vercel.app"><strong>Website</strong></a> ·
  <a href="https://crescent-js.vercel.app/docs"><strong>Documentation</strong></a> ·
  <a href="https://www.npmjs.com/package/crescent-js"><strong>npm</strong></a> ·
  <a href="https://github.com/hnw5667/Crescent-JS"><strong>GitHub</strong></a> ·
  <a href="https://discord.gg/NxcuzXrhn5"><strong>Discord</strong></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/crescent-js"><img src="https://img.shields.io/npm/v/crescent-js?color=7c6cff&label=npm" alt="npm version"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-e8d6a3" alt="MIT license"></a>
</p>

---

## Install

```bash
npm install crescent-js
```

## Quick start

```js
const crescent = require('crescent-js');

const page = crescent.page({
  page_id: 'home',
  page_title: 'My App'
});

const heading = crescent.object({ object_id: 'heading' });

heading.add_layer(
  crescent.layer({
    layer_type: 'text',
    layer_id: 'title',
    text: 'Hello, Crescent!',
    size: 32,
    colour: '0,0,0',
    bold: true
  })
);

page.add_object(heading);
page.set_object_position('heading', 0, -100);
```

Run it:

```bash
crescent run app.js        # http://localhost:3000
crescent run app.js 3030   # specific port
crescent build app.js dist # build-time HTML + unified bundle
```

## What is included

| Layer | Highlights |
|-------|-----------|
| Frontend | Pages, objects, layers, cartesian positioning, transitions and triggers |
| Backend | Functions, conditionals, loops, boolean logic, REST endpoints, external API calls |
| Database | Zero-config CRUD, collections, querying, sorting, limiting, pagination |
| Auth | Signup, login, OAuth providers, signed cookie sessions, account locking |
| Delivery | Component cache, packet compression, AES-256-GCM encrypted tunnels, unified bundling |
| Desktop | `crescent app-build` — turn a folder into a Tauri app for Windows, macOS or Linux |
| Interop | Framework layers — embed React or Angular snippets as native Crescent.js layers |

## Documentation

Guides live in [`docs/`](./docs) and are published at **[crescent-js.vercel.app/docs](https://crescent-js.vercel.app/docs)**.

- **Start** — [Getting Started](./docs/getting-started.md) · [JS-First Components](./docs/js-first.md) · [Playground](./docs/playground.md)
- **Frontend** — [Frontend Guide](./docs/frontend.md) · [Framework Layers](./docs/framework-layers.md) · [Component Cache](./docs/component-cache.md) · [Compression](./docs/compression.md)
- **Backend & data** — [Backend Guide](./docs/backend.md) · [Database Guide](./docs/database.md) · [Authentication](./docs/authentication.md) · [Tabel System](./docs/tabel.md) · [Encrypted Tunnels](./docs/encrypted-tunnels.md)
- **Build & ship** — [Bundling](./docs/bundling.md) · [App-Build](./docs/app-build.md) · [Deployment](./docs/deployment.md) · [Configuration](./docs/configuration.md) · [TypeScript](./docs/typescript.md)
- **Reference** — [API Reference](./docs/api-reference.md) · [Examples](./docs/examples.md) · [Changelog](./docs/changelog.md) · [Contributing](./docs/contributing.md)

## Repository layout

```
crescent-js/
├── code/       # Framework source (published to npm)
├── docs/       # Markdown documentation
├── site/       # Main website — React + Vite (crescent-js.vercel.app)
├── website/    # Legacy GitHub Pages landing (now a "moved" notice)
├── examples/   # Example apps (contact form, auth system)
├── tests/      # Test suites
└── tasks/      # Task and version tracking
```

## License

[MIT](./LICENSE) — with AI training restrictions. See [LICENSE](./LICENSE).
