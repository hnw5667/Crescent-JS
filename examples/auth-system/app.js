/**
 * Crescent.js — Auth System Example
 * Fully working auth (signup, login, logout, protected route, session via cookies)
 * + Frontend (login/signup pages built with page/object/layer)
 * + Backend + Database + Auth, all in Crescent.js only.
 *
 * Run:
 *   npm install
 *   node app.js
 * Open http://localhost:3001
 */

let crescent;
try { crescent = require('crescent-js'); } catch { crescent = require('../../code/src/rocket'); }

// ============================================================
// 1) DATABASE + AUTH
// ============================================================
const db = crescent.db;
if (!db.exists('users')) db.create('users');

// Auth managers (backed by crescent.db via internal query engine)
const signup = crescent.auth.signup({
  collection: 'users',
  require_email_verification: false,
});
const login = crescent.auth.login({
  collection: 'users',
  max_attempts: 5,
  lock_duration: 15 * 60 * 1000,
  cookie: {
    secret: 'crescent-auth-example-secret-change-me',
    cookie_name: 'crescent_session',
    max_age: 24 * 60 * 60 * 1000,
    http_only: true,
    secure: false,
    same_site: 'lax',
  },
});

// Helpers: password strength / cookie
const passwordMgr = crescent.auth.password;
const cookieMgr = crescent.auth.cookie;

// ============================================================
// 2) FRONTEND — Two pages: signup + login + dashboard
// ============================================================

function makeAuthPage(pageId, title, bg) {
  return crescent.page({
    page_id: pageId,
    page_title: title,
    page_url: `/${pageId}`,
    page_bg: bg,
    size: { height: 800, width: 1200 },
  });
}

function makeCard(objectId, height) {
  const obj = crescent.object({ object_id: objectId, size: { height, width: 520 } });
  const bg = crescent.layer({
    layer_type: 'shape',
    layer_id: `${objectId}_bg`,
    layer_vertices: 4,
    colour: '255,255,255',
    rounded_corners: '16px',
    size: { height, width: 520 },
  });
  obj.add_layer(bg);
  obj.set_bg_layer(`${objectId}_bg`);
  return obj;
}

// --- Signup page ---
const signupPage = makeAuthPage('signup', 'Create account — Crescent.js', '245,245,250');
const signupHeader = crescent.object({ object_id: 'signup_header', size: { height: 100, width: 520 } });
signupHeader.add_layer(crescent.layer({ layer_type: 'text', layer_id: 'h1', text: 'Create account', size: 32, colour: '15,15,20', bold: true }));
signupHeader.add_layer(crescent.layer({ layer_type: 'text', layer_id: 'p', text: 'Signup with username, email and password', size: 13, colour: '100,100,110' }));
signupHeader.set_layer_position('h1', 0, 20);
signupHeader.set_layer_position('p', 0, -15);

const signupCard = makeCard('signup_card', 380);
const suUser = crescent.layer({ layer_type: 'input', layer_id: 'su_username', input_method: 'text box', box_inner_text: 'Username (3–32 chars)', size: { height: 46, width: 440 }, rounded_corners: '10px' });
const suEmail = crescent.layer({ layer_type: 'input', layer_id: 'su_email', input_method: 'text box', box_inner_text: 'Email', size: { height: 46, width: 440 }, rounded_corners: '10px' });
const suPass = crescent.layer({ layer_type: 'input', layer_id: 'su_password', input_method: 'text box', box_inner_text: 'Password (≥8 chars, mix)', size: { height: 46, width: 440 }, rounded_corners: '10px' });
const suBtnBg = crescent.layer({ layer_type: 'shape', layer_id: 'su_btn', layer_vertices: 4, colour: '124,58,237', rounded_corners: '10px', size: { height: 46, width: 440 } });
const suBtnText = crescent.layer({ layer_type: 'text', layer_id: 'su_btn_text', text: 'Sign up →', size: 15, colour: '255,255,255', bold: true });
[suUser, suEmail, suPass, suBtnBg, suBtnText].forEach((l) => signupCard.add_layer(l));
signupCard.set_layer_position('su_username', 0, 110);
signupCard.set_layer_position('su_email', 0, 55);
signupCard.set_layer_position('su_password', 0, 0);
signupCard.set_layer_position('su_btn', 0, -70);
signupCard.set_layer_position('su_btn_text', 0, -70);
signupCard.set_layer_index('su_btn_text', 5);

signupPage.add_object(signupHeader);
signupPage.add_object(signupCard);
signupPage.set_object_position('signup_header', 0, 240);
signupPage.set_object_position('signup_card', 0, -20);
signupPage.set_scaling_ratio('signup_header', [1, 1], [1, 1]);
signupPage.set_scaling_ratio('signup_card', [1, 1], [1, 1]);

// --- Login page ---
const loginPage = makeAuthPage('login', 'Log in — Crescent.js', '245,245,250');
const loginHeader = crescent.object({ object_id: 'login_header', size: { height: 100, width: 520 } });
loginHeader.add_layer(crescent.layer({ layer_type: 'text', layer_id: 'h1', text: 'Welcome back', size: 32, colour: '15,15,20', bold: true }));
loginHeader.add_layer(crescent.layer({ layer_type: 'text', layer_id: 'p', text: 'Log in with username and password', size: 13, colour: '100,100,110' }));
loginHeader.set_layer_position('h1', 0, 20);
loginHeader.set_layer_position('p', 0, -15);

const loginCard = makeCard('login_card', 320);
const liUser = crescent.layer({ layer_type: 'input', layer_id: 'li_username', input_method: 'text box', box_inner_text: 'Username', size: { height: 46, width: 440 }, rounded_corners: '10px' });
const liPass = crescent.layer({ layer_type: 'input', layer_id: 'li_password', input_method: 'text box', box_inner_text: 'Password', size: { height: 46, width: 440 }, rounded_corners: '10px' });
const liBtnBg = crescent.layer({ layer_type: 'shape', layer_id: 'li_btn', layer_vertices: 4, colour: '15,15,20', rounded_corners: '10px', size: { height: 46, width: 440 } });
const liBtnText = crescent.layer({ layer_type: 'text', layer_id: 'li_btn_text', text: 'Log in →', size: 15, colour: '255,255,255', bold: true });
[liUser, liPass, liBtnBg, liBtnText].forEach((l) => loginCard.add_layer(l));
loginCard.set_layer_position('li_username', 0, 70);
loginCard.set_layer_position('li_password', 0, 15);
loginCard.set_layer_position('li_btn', 0, -55);
loginCard.set_layer_position('li_btn_text', 0, -55);
loginCard.set_layer_index('li_btn_text', 5);

loginPage.add_object(loginHeader);
loginPage.add_object(loginCard);
loginPage.set_object_position('login_header', 0, 240);
loginPage.set_object_position('login_card', 0, -20);

// --- Dashboard (protected) ---
const dashPage = makeAuthPage('dashboard', 'Dashboard — Crescent.js', '248,248,252');
const dashHeader = crescent.object({ object_id: 'dash_header', size: { height: 120, width: 720 } });
dashHeader.add_layer(crescent.layer({ layer_type: 'text', layer_id: 'dh1', text: 'You are logged in', size: 28, colour: '15,15,20', bold: true }));
dashHeader.add_layer(crescent.layer({ layer_type: 'text', layer_id: 'dp', text: 'Protected route — session verified via cookie', size: 13, colour: '100,100,110' }));
dashHeader.set_layer_position('dh1', 0, 20);
dashHeader.set_layer_position('dp', 0, -15);
const dashCard = makeCard('dash_card', 200);
const dashName = crescent.layer({ layer_type: 'text', layer_id: 'dash_name', text: 'User: —', size: 16, colour: '15,15,20', bold: true });
const dashEmail = crescent.layer({ layer_type: 'text', layer_id: 'dash_email', text: 'Email: —', size: 13, colour: '80,80,90' });
const dashLogoutBg = crescent.layer({ layer_type: 'shape', layer_id: 'dash_logout', layer_vertices: 4, colour: '220,38,38', rounded_corners: '10px', size: { height: 42, width: 200 } });
const dashLogoutText = crescent.layer({ layer_type: 'text', layer_id: 'dash_logout_text', text: 'Log out', size: 14, colour: '255,255,255', bold: true });
[dashName, dashEmail, dashLogoutBg, dashLogoutText].forEach((l) => dashCard.add_layer(l));
dashCard.set_layer_position('dash_name', 0, 40);
dashCard.set_layer_position('dash_email', 0, 10);
dashCard.set_layer_position('dash_logout', 0, -40);
dashCard.set_layer_position('dash_logout_text', 0, -40);
dashCard.set_layer_index('dash_logout_text', 5);
dashPage.add_object(dashHeader);
dashPage.add_object(dashCard);
dashPage.set_object_position('dash_header', 0, 220);
dashPage.set_object_position('dash_card', 0, 0);

// ============================================================
// 3) BACKEND — Functions + Conditionals + Collect
// ============================================================

const checkStrength = crescent.function({
  function_id: 'check_strength',
  params: ['password'],
  body: (pw) => passwordMgr.check_strength(pw),
});

const authGuard = crescent.conditional({
  conditional_id: 'auth_guard',
  if: {
    check: () => true, // replaced at request time with real check
    actions: [],
  },
  else: { actions: [] },
});

const signupCollect = crescent.collect({
  collect_id: 'signup_collect',
  sources: [suUser, suEmail, suPass],
  transform: (d) => ({
    username: (d.su_username || '').trim(),
    email: (d.su_email || '').trim(),
    password: d.su_password || '',
  }),
});

// Loop example: iterate over users to build a public list (no hashes)
const listUsersLoop = crescent.loop({
  loop_id: 'list_users',
  loop_type: 'for_in',
  iterable: [],
  actions: [(user) => ({ username: user.username, email: user.email, created_at: user.created_at })],
});

// ============================================================
// 4) API — auth endpoints (all use crescent.auth + crescent.db)
// ============================================================
const api = crescent.api_make({ api_id: 'auth_api', port: 3001, host: '0.0.0.0', cors: true });

// Helper: read session from Cookie header
function getSessionFromReq(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieMgr.parse_cookies(cookieHeader);
  const token = cookies[login._cookie.cookie_name || 'crescent_session'] || cookies.crescent_session;
  if (!token) return null;
  const session = login.verify_session(token);
  return session || null;
}

api.add_endpoint('GET', '/api/health', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, example: 'auth-system', users: db.count('users') }));
});

// Signup
api.add_endpoint('POST', '/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'username, email, password required' }));
    return;
  }
  // strength check via function primitive
  const strength = checkStrength.call(password);
  if (strength.strength === 'weak') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Password too weak', strength }));
    return;
  }
  const result = await signup.register(username, email, password);
  if (!result.success) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
});

// Login
api.add_endpoint('POST', '/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'username and password required' }));
    return;
  }
  const result = await login.authenticate(username, password);
  if (!result.success) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }
  // Set cookie
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Set-Cookie': result.set_cookie,
  });
  res.end(JSON.stringify({ success: true, user: result.user, token: result.token }));
});

// Me (session check)
api.add_endpoint('GET', '/api/auth/me', (req, res) => {
  const session = getSessionFromReq(req);
  if (!session) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not authenticated' }));
    return;
  }
  const user = login.get_user_from_token(session && session.jti ? req.headers.cookie?.match(/crescent_session=([^;]+)/)?.[1] : '');
  // simpler: find by id from session
  const u = db.find_by_id('users', session.user_id);
  if (!u) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'User not found' }));
    return;
  }
  const safe = { ...u };
  delete safe.password_hash;
  delete safe.salt;
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ user: safe, session }));
});

// List users (public projection) — demonstrates Loop primitive concept
api.add_endpoint('GET', '/api/users', (req, res) => {
  const all = db.find('users');
  // Use loop to map
  listUsersLoop.iterable = all;
  const projected = all.map((u) => {
    const safe = { ...u };
    delete safe.password_hash;
    delete safe.salt;
    return safe;
  });
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(projected));
});

// Logout
api.add_endpoint('POST', '/api/auth/logout', (req, res) => {
  const result = login.logout();
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Set-Cookie': result.clear_cookie,
  });
  res.end(JSON.stringify(result));
});

// Protected example
api.add_endpoint('GET', '/api/protected', (req, res) => {
  const session = getSessionFromReq(req);
  if (!session) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized — login required' }));
    return;
  }
  // Conditional guard demo
  authGuard.set_if(() => !!session, []);
  const decision = authGuard.evaluate();
  if (decision !== 'if') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Forbidden' }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'You accessed a protected resource', session }));
});

// ============================================================
// 5) TRIGGERS (frontend click → would POST to above endpoints)
// ============================================================
const suTrigger = crescent.trigger({
  object_id: 'signup_card',
  event: 'click',
  condition: () => true,
  true_sequence: [{ type: 'collect', collect: signupCollect }],
});
suTrigger.attach(signupCard);

const liTrigger = crescent.trigger({
  object_id: 'login_card',
  event: 'click',
  condition: () => true,
  true_sequence: [],
});
liTrigger.attach(loginCard);

// ============================================================
// 6) SERVE PAGES + START
// ============================================================

function renderPageHtml(page) {
  try {
    crescent.renderer.register_page(page);
    return crescent.renderer.render_full_page(page.page_id);
  } catch {
    return `<!doctype html><html><head><title>${page.page_title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:sans-serif;background:rgb(${page.page_bg})}</style></head><body><div id="crescent-root"></div></body></html>`;
  }
}

api.add_endpoint('GET', '/', (req, res) => {
  res.writeHead(302, { Location: '/signup' });
  res.end();
});
api.add_endpoint('GET', '/signup', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(renderPageHtml(signupPage));
});
api.add_endpoint('GET', '/login', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(renderPageHtml(loginPage));
});
api.add_endpoint('GET', '/dashboard', (req, res) => {
  const session = getSessionFromReq(req);
  if (!session) {
    res.writeHead(302, { Location: '/login' });
    res.end();
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(renderPageHtml(dashPage));
});

async function start() {
  await api.start();
  console.log(`Auth system running at http://localhost:${api.port}`);
  console.log(`  POST /api/auth/signup {username,email,password}`);
  console.log(`  POST /api/auth/login  {username,password} -> Set-Cookie`);
  console.log(`  GET  /api/auth/me     -> session check (needs Cookie)`);
  console.log(`  GET  /api/protected   -> protected resource`);
  console.log(`  Pages: /signup /login /dashboard`);
}

if (require.main === module) start();

module.exports = { signupPage, loginPage, dashPage, api, db, signup, login, start };
