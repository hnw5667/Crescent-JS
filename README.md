# Crescent.js

A full-stack JavaScript framework with integrated frontend rendering, backend logic, database support, and authentication.

---

## Overview

Crescent.js is a full-stack JavaScript framework that gives you everything you need to build modern web applications — from rendering pages and handling user interfaces to managing backend logic, database operations, and authentication — all in one cohesive package.

---

## Features

- **All-in-one** — Frontend, backend, database, and auth in a single framework
- **Declarative API** — Build UIs with layers, objects, and pages
- **Backend Logic** — Functions, conditionals, loops, and API management
- **Built-in Database** — Zero-configuration CRUD database
- **Authentication** — Signup, login, OAuth, and session handling
- **Responsive by Default** — Built-in responsive design using ratio-based scaling
- **Zero Config** — Get started immediately with sensible defaults

---

## Quick Start

```bash
npm install crescent-js
```

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

console.log('App created successfully!');
```

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](./docs/getting-started.md) | Installation, setup, and your first app |
| [Frontend](./docs/frontend.md) | Pages, objects, layers, transitions, and triggers |
| [Backend](./docs/backend.md) | Functions, conditionals, loops, and API management |
| [Database](./docs/database.md) | Built-in CRUD database operations |
| [Authentication](./docs/authentication.md) | Signup, login, OAuth, and sessions |
| [API Reference](./docs/api-reference.md) | Complete API documentation |
| [Configuration](./docs/configuration.md) | All configuration options |
| [Deployment](./docs/deployment.md) | Deploying to production |
| [Changelog](./docs/changelog.md) | Release history and updates |

---

## Project Structure

```
crescent-js/
├── code/                  # Framework source code
├── docs/                  # Documentation markdown files
├── website/               # Documentation website
├── README.md
├── LICENSE
├── CODE_OF_CONDUCT.md
└── CONTRIBUTING.md
```

---

## Running

```
crescent run <FILE_PATH> 3030   # Run on a specific port
crescent run <FILE_PATH>         # Auto-runs on port 3000
```

---

## Repository

```
crescent-js/
├── code/              # Framework source (from npm)
├── docs/              # Documentation
│   ├── getting-started.md
│   ├── frontend.md
│   ├── backend.md
│   ├── database.md
│   ├── authentication.md
│   ├── api-reference.md
│   ├── configuration.md
│   ├── deployment.md
│   ├── changelog.md
│   └── contributing.md
├── website/           # Next.js website
├── README.md
├── LICENSE
├── CODE_OF_CONDUCT.md
└── CONTRIBUTING.md
```

---

## License

This project is licensed under the terms described in the [LICENSE](./LICENSE) file.

---

## Contribute

If you find this project useful, consider starring the repo and contributing! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
