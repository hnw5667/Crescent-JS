import Link from 'next/link';
import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function ExamplesPage() {
  return (
    <>
      <DocHeader title="Examples" description="Two fully working apps built only with Crescent.js — copy, run, and remix in the Playground." badge="Examples" />

      <Callout type="info" title="Where to find them">
        <code>examples/contact-form</code> and <code>examples/auth-system</code> at the repo root. Each has its own <code>app.js</code> + <code>README.md</code>. The <Link href="/playground">Playground</Link> lets you build the same pipelines visually.
      </Callout>

      <h2 id="contact-form">Contact Form — <code>examples/contact-form</code></h2>
      <p>
        Collects <strong>name</strong>, <strong>email</strong>, <strong>contact (optional)</strong> with frontend + backend + database. Port <code>3000</code>.
      </p>
      <CodeBlock filename="examples/contact-form/app.js (excerpt)" code={`const page = crescent.page({ page_id: 'contact', page_bg: '248,248,252', size: { height: 800, width: 1200 } });
const formCard = crescent.object({ object_id: 'form_card', size: { height: 420, width: 560 } });
formCard.add_layer(crescent.layer({ layer_type: 'input', layer_id: 'name_input', input_method: 'text box', box_inner_text: 'Enter your name *' }));
formCard.add_layer(crescent.layer({ layer_type: 'input', layer_id: 'email_input', input_method: 'text box', box_inner_text: 'Enter your email *' }));
// ... page.add_object(formCard); page.set_object_position('form_card', 0, -40);

const validateEmail = crescent.function({ function_id: 'validate_email', params: ['email'], body: email => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) });
const collectForm = crescent.collect({ collect_id: 'contact_collect', sources: [nameInput, emailInput], transform: d => ({ name: d.name_input, email: d.email_input, contact: d.contact_input || null }) });

const api = crescent.api_make({ api_id: 'contact_api', port: 3000, cors: true });
api.add_endpoint('POST', '/api/contact', (req, res) => {
  const { name, email, contact } = req.body;
  if (!validateEmail.call(email)) { res.writeHead(400); res.end(JSON.stringify({ error: 'Valid email required' })); return; }
  const doc = crescent.db.insert('contacts', { name, email, contact, submitted_at: Date.now() });
  res.writeHead(201, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, contact: doc }));
});`} />
      <CodeBlock filename="run" code={`cd examples/contact-form
npm install
node app.js
# http://localhost:3000  |  POST /api/contact  { name, email, contact? }`} language="bash" />

      <h3 id="contact-endpoints">Endpoints</h3>
      <ul>
        <li><code>GET /</code> — rendered page (SSR via <code>crescent.renderer</code>)</li>
        <li><code>GET /api/health</code> — health check</li>
        <li><code>POST /api/contact</code> — validates and saves to <code>contacts</code></li>
        <li><code>GET /api/contacts</code> — list all (sorted by <code>submitted_at</code>)</li>
        <li><code>GET /api/contacts/:id</code> — get one by <code>_id</code></li>
      </ul>

      <h2 id="auth-system">Auth System — <code>examples/auth-system</code></h2>
      <p>
        Fully working signup, login, logout, session cookie, protected route + 3 frontend pages. Port <code>3001</code>.
      </p>
      <CodeBlock filename="examples/auth-system/app.js (excerpt)" code={`const signup = crescent.auth.signup({ collection: 'users' });
const login = crescent.auth.login({ collection: 'users', max_attempts: 5, cookie: { secret: 'change-me', cookie_name: 'crescent_session' } });

const signupPage = crescent.page({ page_id: 'signup', size: { height: 800, width: 1200 } });
signupPage.add_object(signupCard); // object with input layers su_username / su_email / su_password

const api = crescent.api_make({ api_id: 'auth_api', port: 3001, cors: true });
api.add_endpoint('POST', '/api/auth/signup', async (req, res) => {
  const result = await signup.register(req.body.username, req.body.email, req.body.password);
  res.writeHead(result.success ? 201 : 400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(result));
});
api.add_endpoint('POST', '/api/auth/login', async (req, res) => {
  const result = await login.authenticate(req.body.username, req.body.password);
  if (!result.success) { res.writeHead(401); res.end(JSON.stringify(result)); return; }
  res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': result.set_cookie });
  res.end(JSON.stringify({ success: true, user: result.user, token: result.token }));
});
api.add_endpoint('GET', '/api/auth/me', (req, res) => {
  const session = login.verify_session(parseCookie(req.headers.cookie));
  if (!session) { res.writeHead(401); res.end(JSON.stringify({ error: 'Not authenticated' })); return; }
  res.end(JSON.stringify({ user: login.get_user_from_token(session.token) }));
});`} />
      <CodeBlock filename="run" code={`cd examples/auth-system
npm install
node app.js
# http://localhost:3001/signup  /login  /dashboard
# curl -X POST http://localhost:3001/api/auth/signup -H "Content-Type: application/json" -d '{"username":"alice","email":"alice@example.com","password":"Str0ng!Pass"}'
# curl -i -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"alice","password":"Str0ng!Pass"}'`} language="bash" />

      <h3 id="auth-endpoints">Endpoints</h3>
      <ul>
        <li><code>POST /api/auth/signup</code> — <code>weak</code> passwords rejected</li>
        <li><code>POST /api/auth/login</code> — returns <code>Set-Cookie</code>, 401 + lockout after 5 failures</li>
        <li><code>GET /api/auth/me</code> — session check (needs cookie)</li>
        <li><code>GET /api/protected</code> — protected resource (conditional guard)</li>
        <li><code>POST /api/auth/logout</code> — clears cookie</li>
        <li><code>GET /api/users</code> — public user list (hashes stripped, via <code>crescent.loop</code>)</li>
      </ul>

      <h2 id="playground">Try the Playground</h2>
      <p>
        <Link href="/playground">/playground</Link> (top nav) lets you build the same pipelines visually: frontend (live cartesian preview + scaling slider), backend blocks (connect like nodes), and fullstack pipeline (copy the full <code>require('crescent-js')</code> app).
      </p>
      <p>
        <Link href="/docs/playground">Playground docs →</Link> · <Link href="/docs/frontend">Frontend guide</Link> · <Link href="/docs/backend">Backend guide</Link> · <Link href="/docs/database">Database</Link> · <Link href="/docs/authentication">Auth</Link>
      </p>

      <DocPagination />
    </>
  );
}
