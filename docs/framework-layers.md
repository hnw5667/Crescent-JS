# Framework Layers (v2.7.0 — React / Angular)

Embed a snippet from a different frontend framework as a Crescent.js layer.

---

## The rule

Keep `layer_id` as the name of the framework you are using, then write
`code = { this is where the code should be }`:

```js
const crescent = require('crescent-js');

// React
const reactLayer = crescent.layer({
  layer_type: 'react',
  layer_id: 'react',                        // MUST be 'react'
  code: 'function App(){ return "Hello" }', // code = { ... }
  size: { height: 200, width: 300 }
});

// Angular
const ngLayer = crescent.layer({
  layer_type: 'angular',
  layer_id: 'angular',                      // MUST be 'angular'
  code: '<app-hello name="Crescent"></app-hello>',
  size: { height: 200, width: 300 }
});

const card = crescent.object({ object_id: 'card', size: { height: 300, width: 400 } });
card.add_layer(reactLayer);
```

---

## Validation (fails fast)

| Mistake | Error |
|---------|-------|
| `layer_id: 'vue'` (or anything not `react`/`angular`) | `Framework layer layer_id must be the framework name ('react' or 'angular') ...` |
| `layer_id: 'react'` + `layer_type: 'angular'` | `Framework layer mismatch ...` |
| Missing / empty `code` | `Framework layer "react" requires "code" as a non-empty string ...` |

---

## Optimisation — fits like a layer

The layer box keeps its configured `size`. The inner mount is constrained:

```html
<div data-layer-id="react" data-framework="react" style="...;overflow:hidden;contain:content">
  <div data-framework-content="react" style="width:100%;height:100%;max-width:100%;max-height:100%;overflow:hidden"></div>
  <script type="text/plain" data-framework-code="react"><!-- escaped snippet --></script>
</div>
```

Helpers:

```js
FrameworkLayer.measure_fit({ width: 300, height: 200 }, { width: 400, height: 100 });
// { fits: false, overflowX: true, overflowY: false, ... }

layer.assert_fits({ width: 400, height: 100 }); // throws overflow error
layer.check_overflow(); // runtime DOM check → console error + red badge, returns bool
```

---

## If it goes out — the error

When content exceeds the layer bounds an error is shown three ways:

1. `assert_fits()` throws: `Framework layer "react" overflow: content (400x100) exceeds layer (300x200). Shrink the snippet or enlarge size { height, width }.`
2. Runtime `check_overflow()` (scheduled after `render()` and after `set_property('code', ...)`) logs `[Crescent] Framework layer ... overflow ...` and appends a red badge inside the layer.
3. The parent object still clips (`overflow: hidden` in `object.js`), so nothing leaks visually.

---

## Dependencies

`react`, `react-dom` and `@angular/core` are `devDependencies` in
`code/package.json` — they are probed best-effort (`try/catch`) for live
mount previews and are never hard-required, so framework layers work with or
without them installed.

---

## API

- `crescent.layer({ layer_type: 'react'|'angular', layer_id, code, ... })` → `FrameworkLayer`
- `layer.get_framework()` → `'react' | 'angular'`
- `layer.get_code()` → snippet string
- `layer.set_property('code', next)` → updates the stored snippet + re-checks bounds
- `FrameworkLayer.measure_fit(layerSize, contentSize)`, `layer.assert_fits()`, `layer.check_overflow()`, `validateFrameworkConfig()`
- Types: `FrameworkLayerConfig`, `FrameworkName`, `FitMeasurement`, `FrameworkLayer`, `ReactLayer`, `AngularLayer` in `index.d.ts`
- Tests: `code/test/phase1/frontend/test_framework_layers.js`

---

## Browser verification

- **Unit level (runs anywhere):** `code/test/phase1/frontend/test_framework_render_smoke.js`
  executes the real `render()` / `check_overflow()` / error-badge paths against
  a stub document — fitting layer renders box + mount + code holder with no
  error; scripted overflow produces the red badge + console error.
- **Real browser:** `code/test/browser/framework/test_framework_browser.js`
  serves `index.html` (+ offline React 18 UMD vendor files, no network needed),
  mounts a genuine `ReactDOM.createRoot(...).render(...)` inside a fitting
  `react` layer, keeps an `angular` layer with its snippet inert, and forces a
  300px-wide React render inside an 80×40 box to prove the overflow error
  (badge + `check_overflow()` + `assert_fits()` throw + validation rejections).
  Run it where Edge/Chrome can execute:
  `node test/browser/framework/test_framework_browser.js` from `code/`.
- **Angular note:** the snippet stays inert in the layer (Angular needs AoT
  compilation in the host app) — the layer guarantees box, code storage,
  fit optimisation, and the overflow error either way.
