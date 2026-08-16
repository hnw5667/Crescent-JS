# TypeScript

Use Crescent.js from TypeScript with full type checking and auto-complete.

---

## Overview

Since v1.0.5 the npm package `crescent-js` includes an `index.d.ts` declaration file. The
`types` field in `package.json` points at it, so TypeScript finds it automatically — no extra
setup or `@types` package is needed. Every public method, class, and configuration interface is
typed to match the real framework API.

---

## Setup

```bash
npm install crescent-js
```

The framework itself is written in JavaScript and ships its own bundled type definitions, so
there is nothing else to install.

```ts
import crescent from 'crescent-js';
```

Because the package uses the `export =` shape, both CommonJS (`require`) and ES module
(`import`) consumers are supported — TypeScript resolves the `"types"` field either way.

---

## The Typed Singleton

The default export is the singleton `crescent` instance, typed as `Rocket`. Every method is
strictly typed, so you get auto-complete and compile-time errors for wrong configs:

```ts
import crescent from 'crescent-js';

const page = crescent.page({
  page_id: 'home',
  size: { height: 800, width: 1200 }
});

crescent.db.create('users');
crescent.db.insert('users', { name: 'Alice' });
```

---

## Named Exports

Every class is available as a named export — usable both as a **type** and as a **value**
(constructor):

```ts
import crescent, {
  Rocket,
  TextLayer,
  Transition,
  type LayerConfig
} from 'crescent-js';

// As a type
const title: TextLayer = crescent.layer({
  layer_id: 'title',
  layer_type: 'text',
  text: 'Hi'
});

// As a value
const custom = new crescent.Rocket();
const t = new Transition({ time: '1s', changes: [] });
```

> The reserved word `function` is exported under the `_function` alias internally, so
> `crescent.function(...)` still type-checks normally on the singleton.

---

## Layer Type Narrowing

The `layer(config)` method is overloaded. Setting `layer_type` narrows the return type to the
concrete layer class:

```ts
import crescent, { ImageLayer, InputLayer } from 'crescent-js';

const pic: ImageLayer = crescent.layer({
  layer_type: 'image',
  image_location: 'img/logo.png'
});

const field: InputLayer = crescent.layer({
  layer_type: 'input',
  input_method: 'list',
  list_elements: ['a', 'b']
});
```

---

## Configuration Interfaces

Every feature has a matching configuration interface for typed options:

- **Frontend** — `LayerConfig`, `ObjectConfig`, `PageConfig`, `TransitionConfig`,
  `TriggerConfig`, `ResponsiveConfig`
- **Backend** — `FunctionConfig`, `ConditionalConfig`, `LoopConfig`, `ApiCallConfig`,
  `ApiMakeConfig`, `CollectConfig`, `BooleanConfig`
- **Optimisation** — `TunnelConfig`, `ComponentCacheConfig`
- **Auth** — `OAuthProviderConfig`, `PasswordHash`, `PasswordStrength`, `SessionPayload`

```ts
import crescent, { type ApiMakeConfig } from 'crescent-js';

const config: ApiMakeConfig = {
  api_id: 'rest',
  port: 3000,
  cors: true
};

const api = crescent.api_make(config);
```

---

## Important Types

```ts
import type {
  Size, Point, ScalingRatios,           // geometry
  PagePayload, ComponentResolution,     // component cache payloads
  Branch, BranchAction,                 // conditionals
  SessionPayload, PasswordHash          // auth
} from 'crescent-js';
```

---

## Verification

The package includes a TypeScript fixture (`test/typescript/fixture.ts`) that imports the
package the way a real consumer would and exercises the full public API. It runs
`tsc --noEmit` as part of the test suite, so the types are verified on every release:

```bash
npm run test:typescript
# or
npm test
```
