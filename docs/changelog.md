# Changelog

Release history and updates for Crescent.js.

---

## v1.0.7

### New Features
- **About Webpage (Plain English)** — Alongside the build-time HTML, the framework now also generates `about-webpage.txt` using the actual frontend code (`src/phase1/frontend/*.js`) to explain in plain English how the frontend is made:
  - Generator `src/phase1/frontend/about_generator.js` introspects the frontend directory at build time, enumerates the 16+ modules (`base_layer`, `text_layer`, `image_layer`, `shape_layer`, `input_layer`, `object`, `page`, `renderer`, `responsive`, `transition`, `trigger`, `component_cache`, `js_component`, `html_generator`, `bundler`, `about_generator`), and emits a human-readable walkthrough: Pages → Objects → Layers (4 types with common settings), cartesian coordinates, ratio-based scaling, Transitions/Triggers, Renderer, JS-First (v1.0.6), and optimisations (caching, compression, tunnels, bundling).
  - Every `Bundler.build([components])` now writes `about-webpage.txt` both to the build output (`<outDir>/about-webpage.txt`) and to `code/about-webpage.txt` (kept in repo, inside `code/` only). The file is also produced via `crescent.generate_about_webpage()` / `crescent.write_about_webpage(path)` / `AboutGenerator.generateAboutWebpageText()`.
  - The txt is shipped alongside `html/*.html` and `js/*.json` in the unified bundle, so deployments include a self-documenting explanation of the frontend.

### Documentation
- Updated [JS-First Guide](./js-first.md) and [Bundling Guide](./bundling.md) to mention `about-webpage.txt`.
- Type definitions updated (`index.d.ts`: `AboutGenerator`, `generate_about_webpage`, `write_about_webpage`).

---

## v1.0.6

### New Features
- **JS-First Component System** — Transition from HTML-first to JS-first architecture. Users write components entirely in JavaScript; the framework generates the corresponding HTML, handles JS binding, and injects into component caching:
  - **JS-First Authoring** — `crescent.component({ component_id, sections: [{ section_id, type, text/content, style }] })` is the single source of truth; no manual HTML required.
  - **Build-Time HTML Generation** — `crescent.generate_html(component)` / `HtmlGenerator.generateComponentHTML` runs on the development machine during the build step (not client-side); generated HTML is bundled and shipped alongside JS.
  - **Section-Based ID Assignment** — Every generated element receives a deterministic `id="section-{name}"` (with sanitization) plus `data-section` and `data-layer-id` attributes, providing a stable mapping between JS logic and DOM.
  - **Runtime Connection via rocket.js** — `crescent.hydrate(container, component)` / `HtmlGenerator.hydrate` hydrates pre-generated sections, connects each `section-{id}` to its JS logic, applies built-in CSS (`colour`, `opacity`, `size`, `font`, `rounded_corners`, `rotate`, `position`, etc.), and fires per-section `onHydrate` / `bind_section` callbacks. Built-in `page` bundling (`crescent.build_bundle(page)`) injects component HTML into the page shell.
  - **Component Caching (HTML+JS)** — `component_cache` now stores both JS and build-time HTML. `resolve_component` returns `{ type, id, component, html }`; reuse payloads carry `html` references; edited components emit `update` with refreshed HTML. New APIs: `get_cached_html(id)`, `store_html(id, html, js)`, `store_component_with_html`, `build_page_payload_with_html`, and `render_page_payload_with_html`.
  - **Unified Bundling** — `crescent.bundler()` / `crescent.build_bundle()` / `crescent.build_page_bundle()` produce `{ js, html, sections, timestamp }` or `{ page_id, js, html, bundles }` payloads; `Bundler.build([components], {outputDir})` writes `bundle.json` plus per-component `html/*.html` and `js/*.json` for deployment. `rocket.js` is the bridge that binds JS + HTML at runtime.
  - **Code Organization** — All implementation lives inside `code/` only: `src/phase1/frontend/js_component.js`, `src/phase1/frontend/html_generator.js`, `src/phase1/frontend/bundler.js`, extended `component_cache.js` and `rocket.js`.

### Documentation
- Added a [JS-First Guide](./js-first.md) documenting authoring, build-time generation, section IDs, rocket.js hydration, bundling, and caching.
- Updated [Frontend](./frontend.md), [Bundling](./bundling.md), [Component Cache](./component-cache.md), [Getting Started](./getting-started.md), [Configuration](./configuration.md), and [API Reference](./api-reference.md) for v1.0.6.

---

## v1.0.5

### New Features
- **TypeScript Support** — Crescent.js now ships official type definitions via `index.d.ts`.
  The npm package exposes a `"types"` field so TypeScript consumers get full auto-complete and
  type checking out of the box:
  - The default export is the singleton `crescent` instance, typed as `Rocket` — every method
    (`layer`, `function`, `boolean`, `page`, `transition`, `trigger`, `responsive`,
    `conditional`, `loop`, `api_call`, `api_make`, `collect`, `compress`, `tunnel`, …) is
    strictly typed.
  - Every class is available as a named export for use as a type or value, e.g.
    `import { Rocket, RocketPage, TextLayer, Transition } from 'crescent-js'`.
  - Full configuration interfaces for every feature: `LayerConfig`, `ObjectConfig`,
    `PageConfig`, `TransitionConfig`, `TriggerConfig`, `ResponsiveConfig`, `FunctionConfig`,
    `ConditionalConfig`, `LoopConfig`, `ApiCallConfig`, `ApiMakeConfig`, `CollectConfig`,
    `BooleanConfig`, `TunnelConfig`, `ComponentCacheConfig`, auth configs, and more.
  - `layer(config)` is overloaded so setting `layer_type` narrows the return type to the
    concrete layer class (`TextLayer`, `ImageLayer`, `ShapeLayer`, `InputLayer`).
  - The TypeScript suite (`test/typescript`) runs `tsc --noEmit` against a consumer fixture
    that exercises the entire public API and is part of the full `npm test` run.
  - A backend harness (`test/backend`) type-checks and runs in Node against the real framework —
    covering the database, live search, auth, compression, encrypted tunnels, functions, loops,
    conditionals, booleans, collect, component cache, and an encrypted `api_make`/`api_call`
    HTTP round-trip.
  - A frontend harness (`test/browser`) type-checks a comprehensive dummy page and renders it in
    a real headless browser to verify pages, objects, all four layer types, transitions,
    triggers, responsive, and multi-page navigation all load and behave correctly.

### Documentation
- Added a [TypeScript guide](./typescript.md).
- Added a [Bundling guide](./bundling.md) under Optimisation describing how the framework
  sends the browser a single small JavaScript file that understands and renders your app on
  the client.

---

## v1.0.4

### New Features
- **Compression (Task 10023)** — All text and `.json` packets are compressed with gzip so they
  travel small and can be opened anywhere. `crescent.compress(data, secret?)` /
  `crescent.decompress(packet, secret?)` produce self-contained packets; passing a secret adds
  AES-256-GCM encryption. API calls, collected data, and database files are compressed
  automatically.
- **Encrypted Tunnels (Task 10024)** — When a tunnel is open, outbound data is automatically
  encrypted and compressed before it is sent. `crescent.tunnel(config)` returns an
  `EncryptedTunnel` with `send`, `receive`, `handshake`, `is_open`, and `close`. Integrated
  with `api_call`, `api_make`, `collect`, and `connect_and_pull`.
- **Optimised Component Cache (Task 10025)** — Components sent to a web page are stored in a
  `components-chacke.json` cache. On repeat renders only the component ID and its location are
  sent. A hidden tracker folder records modification dates, so an edited component is
  re-sent as an update that refreshes the cache. Without the tracker folder the optimisation
  falls back to normal rendering. See `crescent.component_cache(config)` and
  `crescent.render_page_payload(page)`.

---

## v1.0.0

Initial release of Crescent.js.

### Frontend
- **Pages** — Top-level containers with cartesian coordinate positioning
- **Objects** — Layer containers with clipping and background support
- **Layers** — Text, image, shape, and input layer types
- **Transitions** — Fade, slide, scale, rotate, and custom animations
- **Triggers** — Click, hover, input, submit, load, and custom event handlers
- **Responsive** — Configurable breakpoints for mobile, tablet, and desktop

### Backend
- **Functions** — Reusable server-side functions with enable/disable
- **Conditionals** — Boolean branching with true/false actions
- **Loops** — For, while, and for-in iteration with action execution
- **Boolean Logic** — AND, OR, NOT, XOR, NAND, NOR operators with chaining
- **API Calls** — HTTP client with GET, POST, PUT, PATCH, DELETE support
- **API Server** — REST API creation with endpoints, middleware, and CORS
- **Collect** — Data gathering from layers, objects, and pages with validation
- **Database** — Built-in CRUD database with collections, queries, and sorting

### Utilities
- Math operations: add, subtract, multiply, divide, sqrt, sin, cos, tan
- `print()`, `get_timestamp()`, `redirect()`, `connect_and_pull()`

---

## Upcoming

- Enhanced transition library
- Performance optimizations
- Additional input layer types
- SSR improvements
