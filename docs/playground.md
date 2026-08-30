# Playground

Try Crescent.js right in your browser — build a frontend visually, test ratio-based scaling, and wire backend blocks together like a node editor. No install needed.

> **Live playground:** [hnw5667.github.io/Crescent-JS/playground](https://hnw5667.github.io/Crescent-JS/playground) (or run the docs locally at `http://localhost:3000/playground`)

---

## What you can do

| Tab | What it tests |
|-----|---------------|
| **Frontend** | Create pages, objects, layers (text / shape / image / input). Drag to position with cartesian coordinates, edit props, see live renderer output. |
| **Responsive Scaling** | Resize the viewport slider and tweak `height_ratio` / `width_ratio` per object. Uses the same `transform: scale(viewportWidth / designWidth)` logic as `page.js` — `[0,0]` means “fill screen”. |
| **Backend Blocks** | Pre-built processes you connect like blocks: `Validate`, `Conditional`, `Save to DB`, `Query DB`, `API Call`, `API Endpoint`, `Auth Signup/Login`, `Boolean`, `Loop`, `Transform`. Click `→` on a block to connect it to the next one. |
| **Fullstack Pipeline** | See the whole flow — frontend form → `collect` → validation → backend chain → `crescent.db` — and submit a demo form that simulates the pipeline. Copies the equivalent Crescent.js code. |

All generated code is **pure Crescent.js** (`require('crescent-js')` only) — paste it into `app.js` and run with `crescent run app.js`.

---

## Frontend builder

```js
const crescent = require('crescent-js');

const page = crescent.page({
  page_id: 'landing',
  page_title: 'Playground',
  page_bg: '18,18,24',
  size: { height: 800, width: 1200 }
});

const hero = crescent.object({
  object_id: 'hero',
  size: { height: 200, width: 520 }
});

const title = crescent.layer({
  layer_type: 'text',
  layer_id: 'title',
  text: 'Welcome to Crescent',
  size: 28,
  colour: '255,255,255',
  bold: true
});

hero.add_layer(title);
hero.set_layer_position('title', 0, 40);
page.add_object(hero);
page.set_object_position('hero', 0, 80);
page.set_scaling_ratio('hero', [1, 1], [1, 1]);

page.render();
```

Positions use **cartesian coordinates** (center = `0,0`, +x right, +y up). See [Frontend Guide](./frontend.md) for all layer types.

---

## Responsive scaling

Crescent keeps pages responsive with ratio pairs:

```js
// Keep aspect, scale uniformly
page.set_scaling_ratio('hero', [1, 1], [1, 1]);

// Header stretches full width
page.set_scaling_ratio('header', [0, 0], [0, 0]);

// Manual API
const responsive = crescent.responsive({ page }).init();
responsive.get_breakpoint(); // 'mobile' | 'tablet' | 'desktop'
```

The playground’s viewport slider drives the same logic as the framework:

```js
const scale = viewportWidth / designWidth;
pageEl.style.transform = `scale(${scale})`;
container.style.height = designHeight * scale + 'px';
```

Try the preset buttons: **375px (mobile)**, **768px (tablet)**, **1200px (desktop)**.

---

## Backend blocks

Each block maps 1:1 to a Crescent backend API:

| Block | Crescent call |
|-------|---------------|
| Validate | `crescent.collect({ sources, validate })` + `crescent.function({ body: emailRegex })` |
| Conditional | `crescent.conditional({ if, else_if, else })` |
| Save to DB | `crescent.db.insert('contacts', doc)` |
| Query DB | `crescent.db.find('contacts', query)` |
| API Endpoint | `crescent.api_make({ port }).add_endpoint('POST', '/api/contacts', handler)` |
| API Call | `crescent.api_call({ url, method }).call()` |
| Auth Signup | `crescent.auth.signup().register(username, email, password)` |
| Auth Login | `crescent.auth.login().authenticate(username, password)` |
| Loop | `crescent.loop({ loop_type: 'for', start, end, actions })` |
| Boolean | `crescent.boolean({ operator: 'AND' }).evaluate()` |

Connect them in order — e.g.:

```
Frontend inputs → Validate → Conditional (if valid) → Save to DB → API 201
```

The code panel on the right always shows the current pipeline as runnable Crescent.js.

---

## Fullstack pipeline example

The pipeline tab renders the combination of your frontend + backend blocks as a single file — copy it to `app.js`:

```js
const crescent = require('crescent-js');

// --- Frontend (from builder) ---
const page = crescent.page({ page_id: 'app', size: { height: 900, width: 1200 } });
// ... objects/layers from builder ...

// --- Backend pipeline (from blocks) ---
crescent.db.create('contacts');

const formValues = page.get_values();
const collected = crescent.collect({
  collect_id: 'contact_form',
  sources: [formValues],
  validate: d => d.email && d.email.includes('@')
}).collect();

if (collected) {
  crescent.db.insert('contacts', collected);
  const api = crescent.api_make({ api_id: 'api', port: 3000 });
  api.add_endpoint('POST', '/api/contacts', (req, res) => {
    res.writeHead(201);
    res.end(JSON.stringify({ success: true }));
  });
  await api.start();
}
```

See the real apps in [`examples/`](../examples/) for complete working versions:
- [`examples/contact-form/`](../examples/contact-form/) — name/email/contact (optional) + DB + REST API
- [`examples/auth-system/`](../examples/auth-system/) — signup/login/sessions + protected dashboard

---

## Local dev

```bash
git clone https://github.com/hnw5667/Crescent-JS.git
cd Crescent-JS

# docs + playground (Next.js, static export → GitHub Pages)
cd website
npm install
npm run dev     # http://localhost:3000/playground
npm run build   # writes to website/out — deployed to gh-pages
```

The playground is a client component (`'use client'`) so it works with `next export` — no server required.

---

## Next steps

- [Frontend Guide](./frontend.md) — pages, objects, layers
- [Backend Guide](./backend.md) — functions, conditionals, loops
- [Database Guide](./database.md) — zero-config CRUD
- [Authentication Guide](./authentication.md) — signup/login/sessions
- [Examples → Contact Form](../examples/contact-form/README.md) and [Auth System](../examples/auth-system/README.md)
