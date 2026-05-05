# 🚀 crescent.js

A full-stack JavaScript framework with integrated frontend rendering, backend logic, and database support.

---

## 📌 Overview

crescent.js is a full-stack JavaScript framework that gives you everything you need to build modern web applications — from rendering pages and handling user interfaces to managing backend logic and database operations — all in one cohesive package.

---

## ✨ Why crescent.js?

- 🧩 **All-in-one** — Frontend, backend, and database in a single framework  
- 🧱 **Declarative API** — Build UIs with layers, objects, and pages  
- ⚙️ **Backend Logic** — Functions, conditionals, loops, and API management  
- 📱 **Responsive by Default** — Built-in responsive design support  
- 🚀 **Zero Config** — Get started immediately with sensible defaults  

---

## ⚡ Quick Start

```bash
npm install crescent-js
```

```js
const rocket = require('crescent-js');

// Create a page
const page = rocket.page({
  page_id: 'home',
  title: 'My App'
});

// Add content
const heading = rocket.object({ object_id: 'heading' });

heading.add_layer(
  rocket.layer({
    layer_type: 'text',
    layer_id: 'title',
    text: 'Hello, Moon!',
    tag: 'h1'
  })
);

page.add(heading);

// Render
console.log(page.render());
```

➡️ **Next Step:** [Getting Started Guide](./docs/getting-started.md)

---

## 📚 Documentation

| Guide | Description |
|------|------------|
| [Getting Started](./docs/getting-started.md) | Installation, setup, and your first app |
| [Frontend](./docs/frontend.md) | Pages, objects, layers, transitions, and triggers |
| [Backend](./docs/backend.md) | Functions, conditionals, loops, and API management |
| [API Reference](./docs/api-reference.md) | Complete API documentation |
| [Configuration](./docs/configuration.md) | Configuration options and customization |
| [Contributing](./docs/contributing.md) | How to contribute |
| [Changelog](./docs/changelog.md) | Release history and updates |

---

## 🗂️ Project Structure

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

## How to run
```
cresent run <FILE_PATH> 3030 --> To run on a Specific Port
crescent run <FILE_PATH> ------> Auto Runs the file on 3000
```
---

## 📄 License

This project is licensed under the terms described in the [LICENSE](./LICENSE) file.

---

## ⭐ Contribute

If you find this project useful, consider starring ⭐ the repo and contributing!
