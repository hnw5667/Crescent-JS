# Component Cache

Optimise frontend rendering by caching components and only shipping IDs when they haven't
changed.

---

## Overview

When a component is sent to a web page it is stored in the page's cache — a JSON file named
`components-chacke.json`. On the next request, matching component IDs mean the server only
has to send the ID and where it needs to be loaded, instead of the whole component. This
makes frontend rendering faster.

> **Edited components are handled** — If a component is edited under the same name, the server
> detects the change and sends an **update** that refreshes the web page's cache, so users
> never see a stale component.

## Enabling the Optimisation

The optimisation is only active when a hidden **tracker** folder exists. Call `enable()` to
create it. If the tracker folder is missing, the cache falls back to normal component sends.

```js
const crescent = require('crescent-js');

const cache = crescent.component_cache({
  cache_dir: './crescent_cache',
  cache_file: 'components-chacke.json'
});

cache.enable(); // creates the tracker folder -> optimisation ON
console.log(cache.is_enabled()); // true
```

## Resolving Components

Resolve a component to decide what actually goes over the wire:

```js
// First time: stored in the cache -> 'update'
const first = cache.resolve_component(heroObject);
// { type: 'update', id, position, index, component: {...} }

// Same component, unedited: only the ID and location -> 'reuse'
cache.resolve_component(heroObject);
// { type: 'reuse', id, position, index }

// Edited component -> server pushes a fresh 'update'
heroObject.modified_at = Date.now();
cache.resolve_component(heroObject);
// { type: 'update', component: {...} }
```

> **Fallback** — Without the tracker folder, every component resolves as
> `{ type: 'normal', component }` — sent like before the optimisation existed.

## Page Payloads

Use `render_page_payload(page)` to build the whole page: config plus one resolved component
per object.

```js
const payload = crescent.render_page_payload(homePage);
console.log(payload.components);
// [ { type: 'reuse', id: 'hero', position, index }, ... ]
```

## Clearing the Cache

```js
cache.clear(); // removes components-chacke.json
cache.disable(); // fall back to normal sends
```