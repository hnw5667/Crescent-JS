# Changelog

Release history and updates for Crescent.js.

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
