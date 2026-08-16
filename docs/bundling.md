# Bundling

Crescent.js does not bundle the way traditional frontend toolchains do. Instead of shipping a
large dependency graph to the browser, the framework sends the client a **single small
JavaScript file** that understands the framework and renders your app on the browser. This is
what makes a Crescent.js frontend stay lightweight — the run-time file itself is well under
9 KB.

---

## The Idea

Traditional bundlers walk your project, concatenate every imported module, and ship one big
`bundle.js` that grows with your app. Crescent.js takes the opposite approach:

1. **A tiny runtime file** (`rocket.js`) knows exactly how the framework's modules connect —
   `layer()`, `object()`, `page()`, `transition()`, `trigger()`, `responsive()` — and how to
   drive the renderer.
2. **Framework modules load on demand.** The runtime fetches only the frontend modules your
   page actually needs from the server — it never pulls in the backend, database, or auth
   code to render the browser.
3. **The app file is executed as-is.** Your Crescent.js app definition runs directly in the
   browser against the runtime. Because the runtime understands the framework natively, no
   compilation step is required.
4. **Only what is needed is sent.** The `ts` **or** `js` app file is requested based on what
   you asked for — never both.

Result: the payload the browser receives for a rendered page is the small runtime file plus
the small set of framework modules it fetches, and the run-time itself stays under 9 KB
(gzipped).

---

## How It Connects

The runtime mirrors the exact connections in the main entry point (`src/rocket.js`):

- `crescent.layer(config)` → `new ImageLayer / ShapeLayer / TextLayer / InputLayer(config)`
- `crescent.object(config)` → `new RocketObject(config)`
- `crescent.page(config)` → `new RocketPage(config, renderer)` + `renderer.register_page(page)`
- `crescent.transition(config)` → `new Transition(config)`
- `crescent.trigger(config)` → `new Trigger(config)`
- `crescent.responsive(config)` → `new Responsive(config)`

Pages are registered on the renderer before rendering; when a page finishes mounting, its
triggers are re-attached to the rendered DOM, exactly as the renderer's `navigate()` does.

---

## Sending Only the File That Is Needed

The `<script>` tag that loads the runtime also declares which app file to run and which page
to mount:

```html
<script
  src="/browser/rocket.js"
  data-app="/app.js"
  data-mount="#crescent-root"
  data-page="home">
</script>
```

Because the runtime reads the app URL from the tag, the page only ever requests the exact
app file you point it at. For a TypeScript app you would point `data-app` at the `.ts` file —
the runtime's language handling kicks in so only that file is requested and executed. You
never send both `ts` and `js` versions; you send **the one that is needed**.

---

## Why It Stays Small

- The runtime is not a copy of the whole framework; it is a thin loader + connection layer.
- Framework modules are fetched on demand instead of being pre-merged, so unused subsystems
  (database, auth, backend servers) never reach the browser.
- No generated per-app bundle is produced — the runtime is a fixed-size file that works for
  any app, so its size does not grow with your project.

---

## Relationship to Other Optimisations

Bundling is one of several client-side optimisations. It pairs naturally with:

- **[Component Cache](./component-cache.md)** — only the changed component payloads travel to
  the page; unchanged components are reused by id.
- **[Compression](./compression.md)** — the small payloads the runtime sends can be gzip
  compressed to shrink them further.

See also the [TypeScript guide](./typescript.md) for the typed API surface and how the
run-time language handling works.
