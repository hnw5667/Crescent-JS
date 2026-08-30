# Auth System — Crescent.js Example

A fully working authentication system built **only with Crescent.js**. It demonstrates:

- **Frontend** — three `page`/`object`/`layer` UIs (signup, login, dashboard) with cartesian coordinates and scaling
- **Database** — `crescent.db` (`create`, `insert`, `find`, `find_by_id`, `count`)
- **Auth** — `crescent.auth.signup`, `crescent.auth.login`, `crescent.auth.password`, `crescent.auth.cookie`
- **Backend primitives** — `crescent.function`, `crescent.conditional`, `crescent.collect`, `crescent.loop`, `crescent.boolean`
- **API** — `crescent.api_make` with cookie-based sessions, protected routes, and redirects

## Run

```bash
npm install
node app.js
# open http://localhost:3001/signup
```

## Pages

| Path | Description |
|------|-------------|
| `/signup` | Create account (username, email, password) — uses `crescent.auth.signup().register` |
| `/login` | Log in — uses `crescent.auth.login().authenticate` → `Set-Cookie: crescent_session=...` |
| `/dashboard` | Protected — redirects to `/login` if no valid session cookie |
| `/` | Redirects to `/signup` |

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | — | Health + user count |
| `POST` | `/api/auth/signup` | — | `{ username, email, password }` — validates strength (`weak` rejected) |
| `POST` | `/api/auth/login` | — | `{ username, password }` — returns `Set-Cookie` on success, 401 + lockout after 5 failures |
| `GET` | `/api/auth/me` | Cookie | Returns session + safe user (no hash/salt) |
| `GET` | `/api/protected` | Cookie | Demo protected resource — uses `crescent.conditional` as guard |
| `POST` | `/api/auth/logout` | Cookie | Clears `crescent_session` |
| `GET` | `/api/users` | — | List users (public projection, hashes stripped) — mapped via `crescent.loop` |

## How it works

1. **DB** — `crescent.db.create('users')` creates `crescent_data/users.json`. All auth reads/writes go through this.
2. **Signup** — `signup.register(username, email, password)` checks strength (`password.check_strength`), duplicate username/email, hashes with PBKDF2+salt, validates schema, inserts, returns safe user.
3. **Login** — `login.authenticate(username, password)` verifies hash, enforces `max_attempts`/`lock_duration`, creates HMAC-signed token via `cookie.create_token`, returns `Set-Cookie`.
4. **Session** — Every request parses `Cookie` header with `cookie.parse_cookies`, verifies with `login.verify_session(token)`. `/dashboard` and `/api/protected` redirect/401 if missing.
5. **Frontend** — Each page is a Crescent `page` with objects positioned via `set_object_position` (cartesian) and layers positioned via `set_layer_position`. `set_scaling_ratio` keeps them responsive. Inputs are `input` layers with `box_inner_text`.

Test with curl:

```bash
# signup
curl -X POST http://localhost:3001/api/auth/signup -H "Content-Type: application/json" -d '{"username":"alice","email":"alice@example.com","password":"Str0ng!Pass"}'

# login (capture cookie)
curl -i -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"alice","password":"Str0ng!Pass"}'

# me (use cookie from above)
curl http://localhost:3001/api/auth/me -H "Cookie: crescent_session=YOUR_TOKEN"

# protected
curl http://localhost:3001/api/protected -H "Cookie: crescent_session=YOUR_TOKEN"
```
