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

## JS-First Unified Bundling (v1.0.6)

In addition to the tiny runtime, v1.0.6 introduces **JS-first unified bundling** — the bundle now ships both JS logic and build-time generated HTML together, with `rocket.js` as the bridge.

- **Build-time HTML generation** runs on your machine (`crescent build src/app.js ./crescent_build`), not in the browser. For each `crescent.component({ component_id, sections })` the framework generates HTML with deterministic `id="section-{name}"` and inline built-in CSS.
- **Unified bundle payload** — `crescent.bundler().bundleComponent(component)` returns `{ component_id, js, html, sections }`. `bundler.build([components])` writes `bundle.json`, `html/*.html`, and `js/*.json`.
- **Component cache integration** — generated HTML is added to `components-chacke.json` via `component_cache` so repeat renders only send `{ id, position, index, html }` references or an `update` when `modified_at` changes.
- **Runtime hydration** — `crescent.hydrate(container, component)` / `component.hydrate(container)` hydrates the pre-generated markup, reapplies built-in CSS (`colour`, `opacity`, `rounded_corners`, `rotate`, `size`, etc.), and invokes per-section bindings.

```bash
crescent build src/app.js ./crescent_build
# crescent_build/bundle.json -> { version:"1.0.6", generated_at, bundles:[{ component_id, js, html }] }
```

```js
const hero = crescent.component({ component_id:'hero', sections:[{ name:'hero-title', text:'Hello' }] });
const html = crescent.generate_html(hero);           // build-time
const bundle = crescent.build_bundle(hero);          // { js, html }
const cache = crescent.component_cache(); cache.enable();
cache.resolve_component(hero); // -> { type:'update', html } -> { type:'reuse', html }
hero.hydrate(document.getElementById('crescent-root'));
```

See the full [JS-First Component System guide](./js-first.md) for section-based IDs, bundler API, and migration.

---

## Relationship to Other Optimisations

Bundling is one of several client-side optimisations. It pairs naturally with:

- **[Component Cache](./component-cache.md)** — only the changed component payloads travel to
  the page; unchanged components are reused by id (now with pre-generated HTML).
- **[JS-First](./js-first.md)** — unified JS + HTML bundling and hydration via `rocket.js`.
- **[Compression](./compression.md)** — the small payloads the runtime sends can be gzip
  compressed to shrink them further.

See also the [TypeScript guide](./typescript.md) for the typed API surface and how the
run-time language handling works.

---

## JS-First Unified Bundling (v1.0.6)

v1.0.6 adds a **JS-first build-time bundling** path that ships **both JS logic and pre-generated HTML**.

1. **JS-First authoring** — `crescent.component({ component_id, sections: [...] })` defines a component purely in JS (see [JS-First Guide](./js-first.md)).
2. **Build-time HTML** — `crescent.generate_html(component)` / `HtmlGenerator.generateComponentHTML(component)` runs **on the dev machine**, not in the browser. It emits deterministic `id="section-{name}"` markup with built-in CSS inlined.
3. **Unified bundle** — `crescent.bundler()` / `crescent.build_bundle(component)` / `crescent.build_bundle(page)` returns `{ js, html, sections }` or `{ page_id, js, html, bundles }`. `Bundler.build([components], {outputDir})` writes `bundle.json` + `html/*.html` + `js/*.json` for deployment.
4. **rocket.js as bridge** — the same tiny runtime hydrates: `crescent.hydrate(container, component)` finds each `section-{id}`, applies built-in CSS, fires `onHydrate`/`bind_section` callbacks, and connects the HTML to the JS logic. No manual wiring.
5. **Cache integration** — generated HTML is stored alongside JS in `components-chacke.json`; `cache.resolve_component` now returns `html` fields and reuse payloads carry the cached HTML handle.

Example build script:

```js
const crescent = require('crescent-js');
const Bundler = require('crescent-js/src/phase1/frontend/bundler');

const hero = crescent.component({
  component_id: 'hero',
  sections: [{ section_id: 'title', text: 'Hello Crescent' }]
});
const bundler = new Bundler({ outputDir: './dist' });
bundler.build([hero], { fileName: 'bundle.json' });
// -> ./dist/bundle.json, ./dist/html/hero.html, ./dist/js/hero.json
```

In the browser, include the pre-generated HTML and hydrate:

```html
<div id="app"><!-- pre-generated HTML shipped from dist/html/hero.html --></div>
<script>
  crescent.hydrate(document.getElementById('app'), hero);
</script>
```

This keeps the runtime under 9 KB — the app payload is the generated HTML plus the small JS component definition, with no large dependency graph.
