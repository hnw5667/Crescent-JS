# Contact Form — Crescent.js Example

A fully working form that collects **name**, **email**, and **contact (optional)** using only **Crescent.js**. It demonstrates:

- **Frontend** — `page` + `object` + `layer` with cartesian coordinates (`crescent.page`, `crescent.object`, `crescent.layer`, `set_layer_position`, `set_object_position`, `set_scaling_ratio`)
- **Responsive scaling** — `page.set_scaling_ratio` + underlying `transform: scale()` (see `code/src/phase1/frontend/page.js:232`)
- **Backend** — `crescent.function`, `crescent.conditional`, `crescent.boolean`, `crescent.collect`
- **Database** — `crescent.db` (`create`, `insert`, `find`, `find_by_id`)
- **API** — `crescent.api_make` with `add_endpoint` and `start()`

## Run

```bash
npm install
node app.js
# open http://localhost:3000
```

## Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET` | `/` | — | Rendered page (SSR via `crescent.renderer`) |
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/contact` | `{ name, email, contact? }` | Validates and saves to `contacts` collection |
| `GET` | `/api/contacts` | — | List all submissions (sorted by `submitted_at` desc) |
| `GET` | `/api/contacts/:id` | — | Get one submission by `_id` |

## How it works

1. **Frontend** builds a `page` (1200×800) with a `header` object and a `form_card` object. Inputs are `input` layers (`input_method: 'text box'`). Positions use the cartesian system: center is `(0,0)`, `+x` right, `+y` up. `page.set_scaling_ratio` keeps the layout responsive.
2. **Collect** (`crescent.collect`) gathers `name_input`, `email_input`, `contact_input` and transforms to `{ name, email, contact, submitted_at }`.
3. **Function** `validate_email` checks email format. **Conditional** `form_guard` branches on required fields. **Boolean** `can_submit` is an `AND` gate.
4. **Database** `crescent.db.insert('contacts', doc)` persists the submission to `crescent_data/contacts.json` (created automatically).
5. **API** `crescent.api_make({ port: 3000 }).add_endpoint('POST','/api/contact', handler)` exposes the form over HTTP. The browser trigger posts JSON to it and shows a success object (`successObj`).

All code is pure Crescent.js — no Express, no React, no extra DB driver.
