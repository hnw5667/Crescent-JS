# Examples

Two fully working example apps built **entirely with Crescent.js** — every file is `require('crescent-js')` only. Copy either folder to start your own full-stack app.

| Example | Folder | Stack | Run |
|---------|--------|-------|-----|
| **Contact Form** | [`examples/contact-form/`](../examples/contact-form/) | Frontend (page/object/layer) + Backend (function/conditional/collect/api_make) + Database | `node examples/contact-form/app.js` → http://localhost:3000 |
| **Auth System** | [`examples/auth-system/`](../examples/auth-system/) | Frontend (3 pages, trigger, collect) + Auth (signup/login/cookie/PBKDF2) + Database | `node examples/auth-system/app.js` → http://localhost:3001 |

> All example code lives under [`examples/`](../examples/) - one folder per app, as requested. The playground at [/playground](https://crescent-js.vercel.app/playground) runs the same framework live in your tab.

---

## Contact Form — name, email, contact (optional)

**What it demonstrates:**
- `crescent.page` / `crescent.object` / `crescent.layer` (text/shape/input) with cartesian positioning and `set_scaling_ratio` for responsive behavior
- `crescent.function` for validators (name/email/contact)
- `crescent.collect` to gather + transform input values
- `crescent.trigger` on the submit shape/text to validate → insert → show success/error
- `crescent.db` zero-config (`contacts` collection) — `create`/`insert`/`find`/`delete_one`
- `crescent.api_make` REST: `POST /api/contacts`, `GET /api/contacts`, `GET /api/contacts/:id`, `DELETE /api/contacts/:id`
- SSR via `renderer.render_full_page`

**Structure:**

```
examples/contact-form/
├── app.js        # single file, ~330 lines, pure Crescent.js
├── package.json
└── README.md
```

**Quick start:**

```bash
npm install crescent-js
node examples/contact-form/app.js
# http://localhost:3000
# POST /api/contacts — curl -X POST http://localhost:3000/api/contacts -H "Content-Type: application/json" -d '{"name":"Asha","email":"asha@example.com","contact":"+91 ..."}'
```

See [`examples/contact-form/README.md`](../examples/contact-form/README.md) and the full [`app.js`](../examples/contact-form/app.js).

**Key snippet:**

```js
const page = crescent.page({ page_id: 'contact', page_bg: '245,245,255', size: { height: 900, width: 1200 } });
const formCard = crescent.object({ object_id: 'form_card', size: { height: 620, width: 520 } });

const nameInput = crescent.layer({ layer_type: 'input', layer_id: 'name_input', input_method: 'text box', box_inner_text: 'Full name *', size: { height: 44, width: 440 } });
const emailInput = crescent.layer({ layer_type: 'input', layer_id: 'email_input', input_method: 'text box', box_inner_text: 'Email address *', size: { height: 44, width: 440 } });
const contactInput = crescent.layer({ layer_type: 'input', layer_id: 'contact_input', input_method: 'text box', box_inner_text: 'Phone / contact (optional)', size: { height: 44, width: 440 } });

formCard.add_layer(nameInput); formCard.set_layer_position('name_input', 0, 135);
formCard.add_layer(emailInput); formCard.set_layer_position('email_input', 0, 75);
formCard.add_layer(contactInput); formCard.set_layer_position('contact_input', 0, 15);
page.add_object(formCard);
page.set_scaling_ratio('form_card', [1,1], [1,1]);

const validateEmail = crescent.function({ function_id: 'validate_email', params: ['email'], body: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) });
const collect = crescent.collect({ collect_id: 'contact_collect', sources: [nameInput, emailInput, contactInput], transform: d => ({ name: d.name_input.trim(), email: d.email_input.trim(), contact: d.contact_input.trim() }) });

crescent.trigger({ object_id: 'form_card', layer_id: 'submit_bg', event: 'click', true_sequence: [ async () => {
  const raw = collect.collect();
  if (!validateEmail.call(raw.email)) return; // show error layer
  crescent.db.insert('contacts', raw);
} ]}).attach(formCard);
```

---

## Auth System — signup / login / sessions + protected dashboard

**What it demonstrates:**
- Three `crescent.page` instances (`signup`, `login`, `dashboard`) with `renderer.navigate`
- Input layers + `collect` for form values
- `crescent.auth.signup({...}).register(username,email,password)` — PBKDF2, duplicate checks, strength reject
- `crescent.auth.login({...}).authenticate(username,password)` — lock after 5 fails, `token` + `set_cookie`
- `crescent.auth.cookie` — `verify_token`, `get_user_from_token`, `clear_cookie_header`
- `crescent.db` users collection (file-backed)
- `crescent.api_make` with protected `GET /api/auth/me` and `GET /api/users` (check `Cookie: crescent_session=<token>`) + public `POST /api/auth/signup|login|logout`
- Triggers for navigation (`su_link` → login, `logout_bg` → logout + redirect)

**Structure:**

```
examples/auth-system/
├── app.js        # single file, ~360 lines, pure Crescent.js
├── package.json
└── README.md
```

**Quick start:**

```bash
npm install crescent-js
node examples/auth-system/app.js
# http://localhost:3001  — /signup  /login  /dashboard
```

**Try:**

```bash
curl -X POST http://localhost:3001/api/auth/signup -H "Content-Type: application/json" -d '{"username":"asha","email":"asha@example.com","password":"Str0ngP@ss!"}'
curl -X POST http://localhost:3001/api/auth/login  -H "Content-Type: application/json" -d '{"username":"asha","password":"Str0ngP@ss!"}' -i
curl http://localhost:3001/api/auth/me -H "Cookie: crescent_session=<token>"
```

See [`examples/auth-system/README.md`](../examples/auth-system/README.md) and [`app.js`](../examples/auth-system/app.js).

**Key snippet:**

```js
crescent.db.create('users');
const signup = crescent.auth.signup({ collection: 'users' });
const login  = crescent.auth.login({ collection: 'users', cookie: { secret: 'change-me', max_age: 86400000 } });

const signupPage = crescent.page({ page_id: 'signup', size: { height: 900, width: 1200 } });
const loginPage  = crescent.page({ page_id: 'login',  size: { height: 900, width: 1200 } });

// triggers navigate between pages
crescent.trigger({ object_id: 'signup_card', layer_id: 'su_btn_bg', event: 'click', true_sequence: [ async () => {
  const { username, email, password } = signupCollect.collect();
  const res = await signup.register(username, email, password);
  if (res.success) crescent.renderer.navigate('login');
} ]}).attach(signupCard);

// API
const api = crescent.api_make({ api_id: 'auth_api', port: 3001, cors: true });
api.add_endpoint('POST', '/api/auth/login', async (req, res) => {
  const r = await login.authenticate(req.body.username, req.body.password);
  res.writeHead(r.success ? 200 : 401, { 'Content-Type': 'application/json', 'Set-Cookie': r.set_cookie });
  res.end(JSON.stringify(r));
});
```

---

## Running both examples together

```bash
# in separate terminals
node examples/contact-form/app.js   # :3000
node examples/auth-system/app.js    # :3001
```

Or with Crescent CLI:

```bash
crescent run examples/contact-form/app.js 3000
crescent run examples/auth-system/app.js 3001
crescent build examples/contact-form/app.js ./build  # unified JS+HTML bundle (see Bundling guide)
```

---

## Playground

Open [/playground](https://crescent-js.vercel.app/playground) to run the same pieces live in your browser — code snippets that drive the real framework, rendered in the preview stage. The playground and these examples use identical APIs.

Next: [Playground](./playground.md) • [Frontend](./frontend.md) • [Backend](./backend.md) • [Database](./database.md) • [Authentication](./authentication.md)
