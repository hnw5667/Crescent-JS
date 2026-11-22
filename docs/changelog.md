# Changelog

Release history and updates for Crescent.js.

---

## v3.0.0

### Major — GitHub Pages retired, documentation moves to Vercel, README refresh

- **GitHub Pages is now a "moved" page:** `https://hnw5667.github.io/Crescent-JS` no longer auto-redirects. Every route renders a static **"Crescent.js has moved"** screen with a button that takes visitors to `https://crescent-js.vercel.app` when they choose. The old interstitial, pre-paint redirect script, `/redirect-failure` route and redirect component were removed.
- **Documentation lives on Vercel:** every link that pointed at `hnw5667.github.io/Crescent-JS` — root README, npm README, `code/package.json` `homepage`, and the docs — now points at `https://crescent-js.vercel.app` (guides at `/docs`).
- **README refresh:** the GitHub README leads with the Crescent.js wordmark and a clean install / quick start / what's-included layout; the npm README drops the changelog block and focuses on install, usage, CLI, TypeScript and documentation.
- **Version bump:** `code/package.json` `2.7.0`→`3.0.0`, `bundler.js` payload `2.7.0`→`3.0.0`, `app_build.js` manifests `2.7.0`→`3.0.0`, `about-webpage.txt` `2.7.0`→`3.0.0`, `navbar.tsx` `v2.7.0`→`v3.0.0`, docs currency pointers →`3.0.0`, `tasks/version.yaml` new `3.0.0`.

---

## v2.7.0

### Minor — Framework layers (React/Angular) + website webhook env fix

- **Framework layers (`react` / `angular`):** new `code/src/phase1/frontend/framework_layer.js` (`FrameworkLayer`, `ReactLayer`, `AngularLayer`). Developer keeps `layer_id` as the framework name (`'react'` or `'angular'`) and writes `code = { ... }`. `crescent.layer()` auto-detects the framework from `layer_id`/`layer_type`, validates (`layer_id` must match, `code` non-empty), and renders a constrained layer box (`overflow: hidden`, `contain: content`). Optimised to fit like a layer: inner mount is capped at `100%` width/height, overflow is measured (`measure_fit` / `assert_fits` / `check_overflow`) and shows an error (console + in-layer red badge / thrown `overflow` error) when content escapes the bounds. Build-time HTML (`html_generator.js`) emits an inert escaped `data-framework-code` snippet + `data-framework-content` mount. `react`, `react-dom`, `@angular/core` added as `devDependencies` (optional at runtime — probed best-effort, never required). Types added in `index.d.ts` (`FrameworkLayerConfig`, `FrameworkName`, `FrameworkLayer`, `ReactLayer`, `AngularLayer`, `layer()` overloads). Tested in `code/test/phase1/frontend/test_framework_layers.js` (12 tests).
- **Website webhook removed:** the Discord-webhook contact form is gone — no webhook URL anywhere in the website code. The `/contact` route, its navbar entry, and `website/.env.example` were deleted; the home page now points to the Discord server instead. The docs site now lives on Vercel at `https://crescent-js.vercel.app`.
- **Version bump:** `code/package.json` `2.6.0`→`2.7.0`, `bundler.js` payload `2.6.0`→`2.7.0`, `app_build.js` manifests `2.6.0`→`2.7.0`, `navbar.tsx` `v2.6.0`→`v2.7.0`, docs currency pointers →`2.7.0`, `tasks/version.yaml` new `2.7.0`.

---

## v2.6.0

### Minor — Framework bug fixes + Playground + Examples (v2.5.1 → v2.6.0)

- **Framework audit (32 bugs) — 18 fixed:**
  - `object.js:32` `N/M` ReferenceError → default `400x300`
  - `login.js:29` lock never expires → check `locked_until` and auto-unlock
  - `cookie.js:9` secret unify `crescent-default-secret-change-me`→`crescent-default-secret`, `verify_token` `timingSafeEqual`
  - `password.js:27` `verify` `timingSafeEqual`
  - `signup.js:21` trim/normalize + case-insensitive duplicate
  - `file_manager.js:28` sanitize path traversal, `list_collections` `.json.enc` fix, decrypt warn
  - `query_engine.js:115` `$contains` array, `$exists` false, `$regex` ReDoS + length limit
  - `tabel.js:189` sharding `cells+newCells>max`, `_match` same fixes
  - `live_search.js:12` `invalidate` + staleness rebuild
  - `responsive.js:85` Y swap `top=Height/2 - y`, `scale_object` `_originalSize`
  - `transition.js:60` `ms` before `s`/`sec`
  - `loops.js:12` throw on `step 0`
  - `collect.js:86` `typeof pako` check
  - `api_make.js:34` CORS echo origin, `Buffer.concat` body, trailing slash + `decodeURIComponent`
  - `component_cache.js:20` typo `chacke`→`cache` + legacy migrate, `has_tracker` marker file
  - `cipher.js:8` PBKDF2 `100k` + legacy fallback, decrypt tries both keys
  - `rocket.js:281` Node `connect_and_pull` unwrap
  - `page.js:232` `Math.min(scaleX,scaleY)` for both dimensions
- **Playground (Next.js shell + Crescent runtime):** `website/src/app/playground` + `website/src/components/playground/Playground.tsx` — 4 tabs (Frontend Builder, Scaling Lab, Backend Blocks, Pipeline), cartesian preview, scaling slider, block palette → chain, pipeline simulation, full `crescent-js` code export. Top nav `Playground` + `Examples`, home banners, docs at `docs/playground.md` + `website/src/app/docs/playground`.
- **Examples (pure Crescent.js):** `examples/contact-form` (name/email/contact + `collect`/`conditional`/`db`/`api_make` 3000) and `examples/auth-system` (signup/login/session/protected 3001, 3 pages), each `app.js` + `README`.
- **Version bump:** `code/package.json` `2.5.1`→`2.6.0`, `bundler.js` `2.5.1`→`2.6.0`, `app_build.js` `2.5.1`→`2.6.0`, `about-webpage.txt` `2.5.1`→`2.6.0`, `navbar.tsx` `v2.5.1`→`v2.6.0`, docs `2.5.1`→`2.6.0`, `tasks/version.yaml` new `2.6.0`.

---

## v2.5.1

### Patch — Random Standalone Verification (Tauri-only)

- **App-Build verified on Win11 + cross-OS:** `crescent app-build` (Tauri-only — see v2.5.0) was exercised with a random temp folder (generated `main.js` + `logo.png` + `extra.js`), built for `windows` + `linux` + `macos` (one zip, per-OS Tauri scaffolds `src-tauri/tauri.conf.json` + `builder:"tauri"` manifests). The Windows standalone (`My-Test-App-windows/`) was launched on **Windows 11** (`Windows_NT 10.0.26200 win32 x64`, `crescent app-build` host) via `node main.js` / `launch.bat` fallback and via extracted `bundle/` check — **opens/does run**, so other OS bundles share the same logic and pass manifest/layer checks. `linux` and `macos` standalones were verified via manifest `platform` fields, `src-tauri/tauri.conf.json` existence, `app.manifest.json` `builder:"tauri"` + `version:"2.5.1"`, and ZIP central-directory integrity (`Expand-Archive` on Win11 extracts `windows/macos/linux` individually). Pure-Node ZIP (STORE/DEFLATE) + Tauri scaffold validated.
- **Version bump:** `code/package.json` `2.5.0` → `2.5.1`, `src/phase1/frontend/bundler.js` `version:'2.5.1'`, `src/cli/app_build.js` `version:'2.5.1'` (`builder:"tauri"`), `website/src/components/navbar.tsx` `v2.5.1`, `code/about-webpage.txt` `2.5.1`, `tasks/version.yaml` new `2.5.1` entry. No API break.

---

## v2.5.0

### New Feature — App-Build (Turn Any Folder Into a Tauri App — Tauri-only)

- **CLI `crescent app-build` (Tauri-only):** Interactive flow that asks for (in order): path of the folder that needs to be made an app, main `.js` file that the Tauri WebView opens, name of the app, logo of the app (→ `tauri.bundle.icon`), then detects the host OS (`os.platform()` / `os.type()`) and shows all buildable OS targets (Windows / macOS / Linux) with the current OS marked native, asks which OS(s) to build for (numbers or `all`), scaffolds `src-tauri/tauri.conf.json` + icons per OS and runs `tauri build` (requires Rust + `@tauri/cli`), and produces a single `.zip` in the same folder that holds one Tauri standalone per selected OS (`<App>-windows/` with `nsis/msi`, `<App>-macos/` with `app/dmg`, `<App>-linux/` with `appimage/deb`). Each standalone contains a full copy of the source folder, `src-tauri/`, `app.manifest.json` (`builder:"tauri"`), `bundle/` (native binaries when built), `launch.*` scripts, and a README. A top-level `manifest.json` (`builder:"tauri"`) + `README.md` sits at the zip root. ZIP is built pure-Node (STORE + DEFLATE via `zlib.deflateRawSync`, manual CRC32/Local/Central/EOCD) with no external deps, and the output filename is `<SanitizedAppName>-standalone.zip`. Only Tauri is supported — no Electron.
- **Implementation:** `code/src/cli/app_build.js` (Tauri-only prompt loop, `detectHost()`, `collectFilesRecursive()`, Tauri `src-tauri/tauri.conf.json` scaffold + `builder:"tauri"` manifests, `buildApp()`, `buildZip()`) wired via `code/src/cli/run.js` (`crescent app-build` / `app_build` / `app:build` / `app build`), all code inside `code/` only. Requires `cargo`/`tauri` at build time.
- **Version bump:** `code/package.json` `2.0.0` → `2.5.0`, `src/phase1/frontend/bundler.js` `version:'2.5.0'`, `website/src/components/navbar.tsx` `v2.5.0`, `tasks/version.yaml` new `2.5.0` entry.

---

## v2.0.0

### Major Release — Tested in Real Case

- **Real-Case Verification:** All features up to v1.0.9 were tested together with random data in a real execution (`code/test/real_tabel_random.js`): creating tabels with columns, inserting random rows, verifying each row as its own object in sharded `.json` files, checking 160-bit hash bit-by-bit uniqueness, crossing `max_cells` to create second `.json`, handling multiple copies, hidden folders with `crescent tabels --show/--hide` (and `tables` alias), and querying a single tabel via normal searching (`find`, `findOne`, `update`, `delete`, `count`). Random snippet with 5 inserts confirmed sharding (2 parts), copies (`.copy1.json`), and retrieval.
- **Version bump:** `code/package.json` `1.0.9` → `2.0.0`, `src/phase1/frontend/bundler.js` `version:'2.0.0'`, `website/src/components/navbar.tsx` `v2.0.0`, `code/about-webpage.txt` regenerated with `2.0.0`, `tasks/version.yaml` new `2.0.0` entry. No breaking API changes — major version marks stable, fully-tested foundation (JS-First, Tabel, About, Bundling, Caching, DB, Auth).

---

## v1.0.9

### New Features
- **Tabel System (User-Configurable Tables)** — New `crescent.table()` / `crescent.tabel()` API for the NoSQL DB:
  - Configure with basic JS: `crescent.table({ table_name, columns: ['id','name','email'], max_cells: 1000, copies: 2, unique_columns: ['email'] })`. Each row is its own object in a `.json` file; multiple tabels supported.
  - **Single-table queries** via normal searching: `tabel.find({ age: { $gte: 30 } })`, `findOne`, `findById`, `update`, `delete`, `count` — all work on one tabel’s sharded files.
  - **Unique checks via 160-bit hash bit-by-bit:** each value in a `unique_columns` is hashed to SHA1 (40 hex = 160 bits → 160-char binary). On insert, the system filters existing rows’ hashes bit-by-bit: first bit clears non-matching, then second bit, etc., until a duplicate is found or proven unique. Stored as `_hash` on each row.
  - **Sharding:** when a `.json` file’s cells (`rows * columns.length`) cross the user-set `max_cells`, the next insert creates a second `.json` (`part_1.json`, `part_2.json`, …) inside that tabel’s folder. Each tabel’s JSONs live together in one hidden folder.
  - **Copies (redundancy):** `copies: 2` keeps `part_0.json` + `part_0.copy1.json` etc.; reads use primary files, copies provide redundancy.
  - **Hidden folders:** each tabel’s folder is hidden by default (`.tabel_<name>` → dot-prefix, plus Windows `attrib +h`). `crescent tabels --show` renames to `tabel_<name>` (visible), `crescent tabels --hide` hides again; aliases `tables`/`tabel`/`table` also work. Folders live under `crescent_data/` (or custom `base_dir`).
  - **Implementation:** `src/phase1/database/tabel.js` (`Tabel`, `TabelManager`, `sha1Hex`, `hexToBinary`) integrated via `src/rocket.js` (`crescent.table` / `tabel`, `create_table`, `get_table`, `list_tabels`, `drop_table`, `tabels` manager) and `src/cli/run.js` (`crescent tabels --show|hide|list`). All code inside `code/` only.

### Documentation
- New [Tabel Guide](./tabel.md) and updates to [Database Guide](./database.md), [Configuration](./configuration.md), [API Reference](./api-reference.md) for tabel.
- Type definitions updated (`index.d.ts`: `TabelConfig`, `Tabel`, `TabelManager`, `crescent.table` etc.).
- Bundled type definitions and `about-webpage.txt` remain at `v1.0.8` generation; `1.0.9` focuses on tabel.

---

## v1.0.8

### New Features
- **Custom About Webpage TXT (per-page)** — `about-webpage.txt` is now custom for the actual page being built, not just generic:
  - `AboutGenerator` (`src/phase1/frontend/about_generator.js`) now introspects the real `crescent.component()` / `crescent.object()` / `crescent.page()` definitions passed to `Bundler.build()` and emits a `CUSTOM PAGE BREAKDOWN` where each layer is described in plain English in the user-requested style — e.g. a black square with white bold `Get Started` becomes `a square of colour 0,0,0 with bold text of 255,255,255 which goes like Get Started all in one layer`. The helper `describeSectionPlain()` handles text, shape, image, input and combined shape+text cases.
  - `Bundler.build()` now calls `generateAboutWebpageText({ version, components })` so the txt on disk (`<outDir>/about-webpage.txt` and `code/about-webpage.txt`) is always in sync with the bundled HTML’s actual layers. `crescent.generate_about_webpage({ components })` also supports custom.
  - Home page version bump `v1.0.7` → `v1.0.8` in `website/src/components/navbar.tsx` and docs.
  - Icons added for previously missing docs items: `TypeScript` → `<Braces>`, `Bundling` → `<Package>`, `JS-First` → `<Sparkles>`, `Component Cache` → `<Layers>` in `website/src/components/sidebar.tsx` (now every item has an icon).
- **Staging Home Example** — the dummy `home` used for `about-webpage.txt` regeneration includes `hero_title`, `hero_subtitle` and the `get_started` black button as one combined layer to demonstrate the custom sentence.

### Documentation
- Updated `docs/js-first.md`, `website/src/app/docs/js-first/page.tsx` (badge `v1.0.8`, custom section), and home/navbar version.
- Regenerated `code/about-webpage.txt` (12.8 KB → 13.8 KB) with custom breakdown.

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
