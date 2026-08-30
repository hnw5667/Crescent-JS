# Crescent.js Examples

Two fully working apps built **only with Crescent.js** (no external framework, no Express, no React).

| Example | What it shows | Run |
|---------|---------------|-----|
| **contact-form** | Collects `name`, `email`, `contact?` via Frontend (page/object/layer cartesian + responsive scaling) → Backend (function, conditional, boolean, collect) → Database (`crescent.db`) → API (`crescent.api_make`) | `cd contact-form && npm install && node app.js` → http://localhost:3000 |
| **auth-system** | Complete auth: signup, login, logout, session cookie, protected route, 3 frontend pages — all Crescent | `cd auth-system && npm install && node app.js` → http://localhost:3001/signup |

Both examples also serve as references for the **Playground** at `/playground` on the docs site (Next.js shell, Crescent runtime).

## Try the Playground

- Visit the docs site → top nav **Playground**
- **Frontend** tab — build pages/objects/layers, see live preview + generated code
- **Responsive Scaling** tab — test `height_ratio`/`width_ratio` and viewport scale
- **Backend Blocks** tab — connect pre-built blocks (validate → conditional → save_db → api_endpoint …) like nodes
- **Fullstack Pipeline** tab — wire frontend → blocks → db, copy the full app code

All generated code is `require('crescent-js')` only and runs with `node app.js` or `crescent run app.js`.
