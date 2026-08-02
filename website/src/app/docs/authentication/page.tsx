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
        <code>crescent.auth</code> API. Store users, validate credentials, and handle OAuth
        flows without managing sessions manually.
      </p>

      <Callout type="info" title="Built-in and secure">
        Passwords are stored securely, and the auth system is designed to work with the
        built-in database out of the box.
      </Callout>

      <h2 id="signup">Signup</h2>
      <CodeBlock
        filename="signup.js"
        code={`crescent.auth.signup({
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secure-password-123'
});`}
      />

      <h2 id="login">Login</h2>
      <p>Validate credentials and retrieve the user record with a simple login call.</p>
      <CodeBlock
        filename="login.js"
        code={`const user = crescent.auth.login({
  email: 'alice@example.com',
  password: 'secure-password-123'
});

console.log(user.name); // 'Alice'`}
      />

      <h2 id="password">Password Management</h2>
      <p>Reset a user's password when needed:</p>
      <CodeBlock
        filename="password.js"
        code={`crescent.auth.password({
  email: 'alice@example.com',
  password: 'new-password-456'
});`}
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
        code={`crescent.auth.oauth({
  provider: 'google',
  client_id: 'YOUR_CLIENT_ID',
  client_secret: 'YOUR_CLIENT_SECRET',
  redirect_uri: 'https://your-app.com/auth/callback'
});`}
      />

      <h2 id="full-example">Full Example</h2>
      <p>Here is a complete signup and login flow exposed through API endpoints:</p>
      <CodeBlock
        filename="auth-api.js"
        code={`// POST /signup - create a new account
crescent.api({
  method: 'POST',
  path: '/signup',
  handler: function (req) {
    const user = crescent.auth.signup({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    return { success: true, user: user.name };
  }
});

// POST /login - sign an existing user in
crescent.api({
  method: 'POST',
  path: '/login',
  handler: function (req) {
    const user = crescent.auth.login({
      email: req.body.email,
      password: req.body.password
    });
    return { success: true, user: user.name };
  }
});`}
      />

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/api-reference">API Reference</Link> — every method in detail
        </li>
        <li>
          <Link href="/docs/configuration">Configuration Guide</Link> — tune auth options
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
