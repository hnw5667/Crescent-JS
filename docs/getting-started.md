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

## Next Steps

- [Frontend Guide](./frontend.md) — Learn about pages, objects, layers, and rendering
- [Backend Guide](./backend.md) — Functions, conditionals, loops, and APIs
- [API Reference](./api-reference.md) — Complete method documentation
- [Configuration](./configuration.md) — All configuration options