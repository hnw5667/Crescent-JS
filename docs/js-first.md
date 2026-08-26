# JS-First Component System (v1.0.6 → v2.5.1)

Crescent-js v1.0.6 introduced **JS-first**; current stable is **v2.5.1** (adds App-Build alongside JS-First, no breaking changes). You write components entirely in JavaScript, and the framework generates the corresponding HTML, handles JS binding, and injects the result into component caching. No manual HTML wiring.

---

## 1. JS-First Authoring (Single Source of Truth)

Instead of authoring HTML and manually connecting it to JS, define a component once in JS:

```js
const crescent = require('crescent-js');

// Minimal
const card = crescent.component({
  component_id: 'card',
  sections: [
    { section_id: 'header', type: 'text', text: 'Hello', size: 24, colour: '0,0,0', bold: true },
    { section_id: 'body', text: 'Body content', colour: '50,50,50' }
  ]
});

// Full-featured
const hero = crescent.component({
  component_id: 'hero',
  size: { height: 300, width: 800 },
  style: { colour: '240,240,255' },           // component-level defaults
  sections: [
    { section_id: 'title', type: 'text', text: 'Welcome to Crescent v2.5.1', size: 32, colour: '255,255,255', bold: true },
    { section_id: 'subtitle', text: 'JS-First — write JS, get HTML + bindings', size: 18, colour: '230,230,230' },
    { section_id: 'cta_bg', type: 'shape', layer_vertices: 4, colour: '52,152,219', size: { height: 50, width: 200 }, rounded_corners: '8px' },
    { section_id: 'cta_text', type: 'text', text: 'Get Started', size: 16, colour: '255,255,255', bold: true },
    { section_id: 'pic', type: 'image', image_location: 'https://example.com/img.png', size: { height: 120, width: 200 } },
    { section_id: 'name', type: 'input', input_method: 'text box', box_inner_text: 'Your name', box_length: 30 }
  ]
});
```

**Section shape** (`SectionConfig`):

| Field | Alias | Type | Description |
|-------|-------|------|-------------|
| `section_id` | `section_name`, `name`, `id` | string | **Required**. Determines `id="section-{name}"`. |
| `type` | `layer_type`, `section_type` | string | `text` (default), `image`, `shape`, `input`, `section` |
| `text` | `content`, `html` | string | Text content ( `html` is raw, `text`/`content` are escaped) |
| `image_location` | - | string | For `type: 'image'` |
| `list_elements`, `select`, `box_inner_text`, etc. | - | any | For `type: 'input'` |
| `size` | - | number or `{ height, width }` | Font size (text) or box size |
| `colour`, `opacity`, `rounded_corners`, `rotate`, `font`, `bold`, `spacing`, `position`, `index` | - | any | Built-in CSS properties (see below) |
| `style` | - | object | Extra styles merged into CSS string |
| `tag` | - | string | HTML tag for section (default `div`) |

**Component helpers:**

```js
card.get_section('header');               // { section_id, type, text, ... }
card.get_sections();                      // ordered array
card.get_section_ids();                   // ['header','body']
card.has_section('header');               // true
card.add_section({ section_id: 'foot', text: 'Footer' });
card.remove_section('body');
card.set_section_property('header', 'text', 'Hi!');
card.set_property('size', { height: 200, width: 400 });
card.serialize();                         // plain JSON for bundling/cache
card.generate_html();                     // build-time HTML string
card.bundle();                            // { component_id, js, html, sections, timestamp }
card.bind_section('cta_bg', (el) => el.addEventListener('click', () => console.log('clicked')));
card.hydrate(container);                  // runtime hydrate helper
```

Sections can also be given as an object map:

```js
crescent.component({
  component_id: 'demo',
  sections: {
    header: { text: 'Header', bold: true },
    body: { text: 'Body' }
  }
});
```

---

## 2. Build-Time HTML Generation

HTML generation runs **on the development machine during the build step** (Node), not in the browser. Output is bundled and shipped alongside JS.

```js
// Direct API
const html = crescent.generate_html(hero);
// or
const HtmlGenerator = require('crescent-js/src/phase1/frontend/html_generator');
const html2 = HtmlGenerator.generateComponentHTML(hero);
const pageHtml = HtmlGenerator.generatePageHTML(page); // page adds objects via layers
const sectionHtml = HtmlGenerator.generateSectionHTML({ name: 'title', text: 'Hi', layer_type: 'text' });

console.log(html);
// <div id="section-hero" class="crescent-component" data-component-id="hero" style="width:800px;height:300px;...">
//   <div id="section-title" data-section="title" data-layer-type="text" ...><p>...</p></div>
//   ...
// </div>
```

*No compilation step is required for the developer* — you author in plain JS/TS and call `generate_html` as part of your build script; the HTML is deterministic and ready to serve.

**Page integration:** `generatePageHTML` adapts legacy `RocketPage` objects (layers → sections) and, when a page has `_jsComponents`, injects each component's section HTML into the page shell.

---

## 3. Section-Based ID Assignment

Every generated element receives a deterministic ID:

```html
<div id="component-header">  <!-- sanitized as section-header -->
  <div id="section-title">...</div>
  <div id="section-subtitle">...</div>
  <div id="section-cta_bg">...</div>
</div>
```

- **Sanitization:** `sanitizeSectionName(name)` lowercases, replaces whitespace with `-`, strips illegal characters, collapses dashes. e.g., `"My Section"` → `section-my-section`.
- **Attributes:** each section also carries `data-section="{rawName}"`, `data-layer-type="{type}"`, `data-layer-id="{id}"` for stable JS→DOM mapping even if IDs are sanitized.
- **Determinism:** same `section_id` always produces the same `id`; this is the contract that `rocket.js` hydration relies on.

---

## 4. Runtime Connection via rocket.js (Hydration + CSS + Binding)

`rocket.js` is the bridge that binds pre-generated HTML to JS at runtime:

```js
// In the browser, after serving build-time HTML:
const container = document.getElementById('app');
container.innerHTML = pageBundle.html; // pre-generated HTML shipped with bundle

// Hydrate: find each section-{id}, apply CSS, connect logic
const result = crescent.hydrate(container, hero);
// { component_id: 'hero', hydrated: ['title','subtitle','cta_bg','cta_text',...], missing: [], allHydrated: true }

// Direct HtmlGenerator usage:
const { hydrated, missing, allHydrated } = HtmlGenerator.hydrate(container, hero);
```

**What hydration does:**

1. For each section, locates `#section-{sanitized}` (falls back to `[data-section]` and `document.getElementById`).
2. Applies built-in CSS via `applyBuiltInCSS` (`colour` → `rgb()`, `opacity` → `0..1`, `rounded_corners`, `rotate`, `size`, `font`, `spacing`, `position/index`, text decorations, etc.).
3. Sets `data-hydrated="true"` and `data-component-id`.
4. Calls `section.onHydrate(el, section)` if present and `component._bindings[section_name](el, section)` for programmatic bindings (`card.bind_section('title', fn)`).

**Lifecycle example:**

```js
const title = { section_id: 'title', text: 'Click me', onHydrate: (el) => el.addEventListener('click', () => console.log('title clicked')) };
const card = crescent.component({ component_id: 'card', sections: [title] });
// Build step:
const html = crescent.generate_html(card);          // shipped to browser
// Browser:
document.getElementById('app').innerHTML = html;
crescent.hydrate(document.getElementById('app'), card); // now title is clickable and styled
```

---

## 5. Component Caching (JS + HTML)

Generated HTML is added to the component cache, extending the existing `components-chacke.json` behavior to cover both JS and HTML:

```js
const cache = crescent.component_cache({ cache_dir: './crescent_cache' });
cache.enable(); // creates .crescent-tracker — optimisation ON

// First resolve: update + stores html
const first = cache.resolve_component(hero);
// { type: 'update', id: 'hero', position, index, component: { ..., html }, html }

// Second resolve (same modified_at): reuse — only id + location + html reference
const second = cache.resolve_component(hero);
// { type: 'reuse', id: 'hero', position, index, html }

// Retrieve cached html
cache.get_cached_html('hero'); // "<div id=..."

// Explicit HTML store
cache.store_html('hero', '<div>...</div>', hero.serialize());
cache.store_component_with_html(hero, hero.serialize(), '<div>...</div>');

// Page payload with HTML
cache.build_page_payload(page);               // { components: [{type, id, component, position, index}, ...] }
cache.build_page_payload_with_html(page);    // same but guarantees `html` on each entry
crescent.render_page_payload_with_html(page); // singleton shortcut
```

Fallback: without the tracker folder (`cache.is_enabled() === false`), every resolve returns `{ type: 'normal', component: { ..., html } }` — still including HTML, but no reuse.

---

## 6. Unified Bundling (Deployment)

The final bundle includes **both JS logic and pre-generated HTML**; `rocket.js` binds them at runtime.

```js
const bundler = crescent.bundler({ outputDir: './crescent_dist' });

// Single component
const bundle = crescent.build_bundle(hero);
// { component_id: 'hero', js: { component_id, size, sections, modified_at }, html, sections: [{name,id,layer_type}], timestamp }

// Page (with _jsComponents or objects)
const pageBundle = crescent.build_bundle(page);
// { page_id: 'home', js: { page_id, size, objects, jsComponents }, html, bundles: [{component_id, html, js}], timestamp }

// Or page helper:
crescent.build_page_bundle(page);

// Low-level Bundler API
const { path, payload } = bundler.build([hero, page], { fileName: 'bundle.json' });
// writes: dist/bundle.json, dist/html/{id}.html, dist/js/{id}.json
// payload.version === '2.5.1', payload.bundles === [...]
bundler.build_unified([hero, page], './dist/bundle.json');
```

**Deployment:** the `bundle.json` + `html/*.html` + `js/*.json` artifacts are what you ship; no per-app compilation of `rocket.js` is needed — its size stays under ~9 KB and it fetches only required modules on demand.

---

## 7. Code Organization

All implementation lives **strictly inside `code/`** per framework policy:

```
code/src/phase1/frontend/js_component.js    # JSComponent class
code/src/phase1/frontend/html_generator.js  # build-time HTML + hydration
code/src/phase1/frontend/bundler.js         # unified bundling bridge
code/src/phase1/frontend/component_cache.js # extended cache (HTML+JS)
code/src/rocket.js                          # public API: component(), generate_html(), bundler(), hydrate()
code/index.d.ts                             # TypeScript definitions for JS-First
```

No files are scattered outside `code/`; documentation stays in `docs/`.

---

## 8. End-to-End Example

```js
// build.js (run on dev machine)
const crescent = require('crescent-js');
const fs = require('fs');

const hero = crescent.component({
  component_id: 'hero',
  sections: [
    { section_id: 'title', text: 'Hello Crescent', size: 36, colour: '255,255,255', bold: true },
    { section_id: 'cta', type: 'shape', colour: '52,152,219', size: { height: 50, width: 200 }, rounded_corners: '8px' }
  ]
});

const Bundler = require('crescent-js/src/phase1/frontend/bundler');
const bundler = new Bundler({ outputDir: './dist' });
bundler.build([hero], { fileName: 'bundle.json' });
console.log('Build done: ./dist/bundle.json + ./dist/html/*.html');

// browser.js (runs in browser, consumes build output)
const crescent = require('crescent-js');
const bundle = require('./dist/bundle.json').bundles[0];
document.getElementById('app').innerHTML = bundle.html;
const heroComp = crescent.component({ component_id: 'hero', sections: [{ section_id: 'title', text: 'Hello Crescent' }, { section_id: 'cta', type: 'shape' }] });
crescent.hydrate(document.getElementById('app'), heroComp);
```

See `code/test/dummy_app_js_first.js` and `code/test/phase1/test_js_first.js` for runnable demonstrations and tests.
