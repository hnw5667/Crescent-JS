import Link from 'next/link';
import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function AuthenticationPage() {
  return (
    <>
      <DocHeader
        title="Authentication Guide"
        description="Add signup, login, and OAuth support to your application."
        badge="Guides"
      />

      <h2 id="overview">Overview</h2>
      <p>
        Crescent.js provides a built-in authentication system through the{' '}
        <code>crescent.auth</code> namespace, with <code>signup</code>,{' '}
        <code>login</code>, <code>password</code>, and <code>oauth</code> submodules.
        Store users, validate credentials, and handle OAuth flows without managing
        sessions manually.
      </p>

      <Callout type="info" title="Built-in and secure">
        Passwords are hashed with a per-user salt before being stored, and the auth system
        works with the built-in database out of the box.
      </Callout>

      <h2 id="signup">Signup</h2>
      <CodeBlock
        filename="signup.js"
        code={`const signup = crescent.auth.signup();

const result = await signup.register('Alice', 'alice@example.com', 'secure-password-123');

console.log(result.success); // true
console.log(result.user.username); // 'Alice'
console.log(result.user.email); // 'alice@example.com'`}
      />

      <Callout type="note" title="What is checked">
        Usernames and emails must be unique, and the password must pass the built-in
        strength check. Weak passwords are rejected with a <code>strength</code> reason.
      </Callout>

      <h2 id="login">Login</h2>
      <p>
        Validate credentials with <code>authenticate()</code>. On success you get the user
        record, a session token, and a <code>Set-Cookie</code> header.
      </p>
      <CodeBlock
        filename="login.js"
        code={`const login = crescent.auth.login();

const result = await login.authenticate('alice@example.com', 'secure-password-123');

console.log(result.success); // true
console.log(result.user.username); // 'Alice'
console.log(result.token); // session token
console.log(result.set_cookie); // 'Set-Cookie: ...'

// Later: verify a session token
login.verify_session(result.token);`}
      />

      <h2 id="password">Password Management</h2>
      <p>Hash, verify, and check the strength of passwords:</p>
      <CodeBlock
        filename="password.js"
        code={`const password = crescent.auth.password;

// Hash a password (returns a hash and its salt)
const { hash, salt } = password.hash('new-password-456');

// Verify a password against a stored hash and salt
const valid = password.verify('new-password-456', hash, salt); // true

// Check strength before saving
const strength = password.check_strength('weak'); // { score, strength: 'weak' }`}
      />

      <Callout type="warning" title="Store passwords safely">
        Always use strong passwords. The auth system handles hashing internally, but you
        should never log or expose raw passwords.
      </Callout>

      <h2 id="oauth">OAuth</h2>
      <p>
        Configure OAuth providers so users can sign in with third-party accounts:
      </p>
      <CodeBlock
        filename="oauth.js"
        code={`const oauth = crescent.auth.oauth();

oauth.add_provider('google', {
  client_id: 'YOUR_CLIENT_ID',
  client_secret: 'YOUR_CLIENT_SECRET',
  authorize_url: 'https://accounts.google.com/o/oauth2/auth',
  token_url: 'https://oauth2.googleapis.com/token',
  user_info_url: 'https://www.googleapis.com/oauth2/v3/userinfo',
  redirect_uri: 'https://your-app.com/auth/callback'
});

// Build the authorization URL for the browser
const url = oauth.get_authorize_url('google');`}
      />

      <h2 id="full-example">Full Example</h2>
      <p>Here is a complete signup and login flow exposed through API endpoints:</p>
      <CodeBlock
        filename="auth-api.js"
        code={`const api = crescent.api_make({
  api_id: 'main',
  port: 3000
});

// POST /signup - create a new account
api.add_endpoint('POST', '/signup', async function (req, res) {
  const result = await crescent.auth.signup().register(
    req.body.name,
    req.body.email,
    req.body.password
  );
  res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
});

// POST /login - sign an existing user in
api.add_endpoint('POST', '/login', async function (req, res) {
  const result = await crescent.auth.login().authenticate(
    req.body.email,
    req.body.password
  );
  if (result.success) {
    res.writeHead(200, { 'Content-Type': 'application/json', ...result.set_cookie });
  } else {
    res.writeHead(401, { 'Content-Type': 'application/json' });
  }
  res.end(JSON.stringify(result.user || result));
});

api.start();`}
      />

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/api-reference">API Reference</Link> — every method in detail
        </li>
        <li>
          <Link href="/docs/database">Database Guide</Link> — how user data is stored
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
