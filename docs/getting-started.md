# Getting Started

Everything you need to install, set up, and build your first Crescent.js application.

---

## Installation

```bash
npm install crescent-js
```

---

## Your First App

```js
const crescent = require('crescent-js');

// 1. Create a page
const page = crescent.page({
  page_id: 'home',
  page_title: 'My First App',
  page_description: 'Built with Crescent.js',
  size: { height: 800, width: 1200 }
});

// 2. Create an object
const hero = crescent.object({
  object_id: 'hero',
  size: { height: 200, width: 600 }
});

// 3. Add a text layer
const title = crescent.layer({
  layer_type: 'text',
  layer_id: 'title',
  text: 'Hello, Crescent!',
  size: 32,
  colour: '0,0,0',
  bold: true,
  font: 'sans-serif',
  spacing: '0px'
});

hero.add_layer(title);

// 4. Add the object to the page
page.add_object(hero);

// 5. Position the object using cartesian coordinates
page.set_object_position('hero', 0, -100);

console.log('App created successfully!');
```

---

## Core Concepts

Crescent.js is built around two core pillars:

### Frontend
Build UIs using **pages**, **objects**, and **layers**. Pages hold objects, objects hold layers, and layers are the visual building blocks (text, image, shape, input). Everything is positioned using a cartesian coordinate system.

### Backend
Write logic using **functions**, **conditionals**, **loops**, and **API endpoints**. Create reusable server-side functions, branch logic with conditionals, iterate with loops, and define REST APIs.

---

## Project Structure

```
my-app/
├── src/
│   ├── pages/          # Page definitions
│   ├── components/     # Reusable objects and layers
│   ├── functions/      # Backend functions
│   └── app.js          # Entry point
└── package.json
```

---

## JS-First in One Minute (v1.0.6 → v3.0.0)

Prefer defining components entirely in JavaScript — no manual HTML. The framework generates HTML at build time with `id="section-{name}"`, bundles it with JS, and hydrates it via `rocket.js`. Current framework version is **v3.0.0**.

```js
const crescent = require('crescent-js');

const hero = crescent.component({
  component_id: 'hero',
  sections: [
    { name: 'title', layer_type: 'text', text: 'Hello, Crescent!', size: 32, colour: '0,0,0', bold: true },
    { name: 'cta', layer_type: 'shape', colour: '52,152,219', size: { width: 200, height: 50 } }
  ]
});

const html = crescent.generate_html(hero);          // build-time, Node
const bundle = crescent.build_bundle(hero);         // { js, html } unified
crescent.hydrate(document.getElementById('crescent-root'), hero); // runtime
```

Build for deployment:

```bash
crescent build src/app.js ./crescent_build  # pre-generates HTML, warms cache, writes bundle.json
```

Turn any folder into a **Tauri** desktop app (v2.6.0 — Tauri-only, needs Rust):

```bash
crescent app-build   # Tauri-only
# 1) Path of folder to make an app
# 2) Main .js file (Tauri WebView entry)
# 3) Name of the app
# 4) Logo image path (→ tauri.bundle.icon)
# 5) Detects host OS and lets you pick Tauri target OS(s): windows / macos / linux
# → writes <AppName>-standalone.zip in the same folder (one Tauri <App>-<os>/ per target)
```

See the [JS-First Component System guide](./js-first.md) and the new [App-Build Guide](./app-build.md) for full workflows.

---

## Next Steps

- [JS-First Guide](./js-first.md) — New JS-first workflow, section IDs, bundling & hydration
- [App-Build Guide](./app-build.md) — Turn any folder into a standalone app (v2.6.0)
- [Frontend Guide](./frontend.md) — Learn about pages, objects, layers, and rendering
- [Backend Guide](./backend.md) — Functions, conditionals, loops, and APIs
- [API Reference](./api-reference.md) — Complete method documentation
- [Bundling](./bundling.md) — Unified JS+HTML bundling and `crescent build`
- [Configuration](./configuration.md) — All configuration options