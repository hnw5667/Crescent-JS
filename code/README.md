<p align="center">
  <img src="https://raw.githubusercontent.com/hnw5667/Crescent-JS/main/assets/crescent-js-banner.svg" alt="Crescent.js" width="480">
</p>

<h1 align="center">Crescent.js</h1>

<p align="center">
  A full-stack JavaScript framework — frontend rendering, backend logic, database and authentication in one package.
</p>

<p align="center">
  <a href="https://crescent-js.vercel.app"><strong>Website</strong></a> ·
  <a href="https://crescent-js.vercel.app/docs"><strong>Documentation</strong></a> ·
  <a href="https://github.com/hnw5667/Crescent-JS"><strong>GitHub</strong></a> ·
  <a href="https://discord.gg/NxcuzXrhn5"><strong>Discord</strong></a>
</p>

## Install

```bash
npm install crescent-js
```

## Quick start

```js
const crescent = require('crescent-js');

const page = crescent.page({ page_id: 'home', page_title: 'My App' });
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

## CLI

```bash
crescent run <file> [port]      # start an app
crescent build <file> [outDir]  # build-time HTML + unified bundle
crescent app-build              # package a folder as a Tauri desktop app
crescent tabels --show|--hide   # inspect or hide Tabel storage
```

## TypeScript

Crescent.js ships official type definitions, so TypeScript projects get full type
checking and auto-complete out of the box:

```ts
import crescent, { Rocket, TextLayer, Transition } from 'crescent-js';

const page = crescent.page({ page_id: 'home', size: { height: 800, width: 1200 } });

const title: TextLayer = crescent.layer({
  layer_id: 'title',
  layer_type: 'text',
  text: 'Hi'
});

const custom: Rocket = new crescent.Rocket();
const transition = new Transition({ time: '1s', changes: [] });
```

## Documentation

Full guides, the API reference, the playground and complete examples live at
**[crescent-js.vercel.app](https://crescent-js.vercel.app)**.

- [Getting Started](https://crescent-js.vercel.app/docs/getting-started)
- [API Reference](https://crescent-js.vercel.app/docs/api-reference)
- [Playground](https://crescent-js.vercel.app/playground)
- [Examples](https://crescent-js.vercel.app/docs/examples)

## License

[MIT](https://github.com/hnw5667/Crescent-JS/blob/main/LICENSE) — with AI training
restrictions. See the [LICENSE](https://github.com/hnw5667/Crescent-JS/blob/main/LICENSE).
