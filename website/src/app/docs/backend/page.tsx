import Link from 'next/link';
import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function BackendPage() {
  return (
    <>
      <DocHeader
        title="Backend Guide"
        description="Write server-side logic with functions, conditionals, loops, and API endpoints."
        badge="Guides"
      />

      <h2 id="functions">Functions</h2>
      <p>
        Functions are the core of your backend logic. Define a function with a unique{' '}
        <code>function_id</code>, a list of parameters, and a body that executes when it is
        called.
      </p>
      <CodeBlock
        filename="functions.js"
        code={`crescent.function({
  function_id: 'greet_user',
  parameters: ['name', 'age'],
  body: function (name, age) {
    return 'Hello ' + name + '! You are ' + age + ' years old.';
  }
});

// Call the function
crescent.call_function('greet_user', ['Alice', 25]);`}
      />

      <Callout type="tip" title="Reusable logic">
        Functions are reusable across pages and events. Define them once and call them
        anywhere in your application.
      </Callout>

      <h2 id="conditionals">Conditionals</h2>
      <p>
        Branch your logic using <code>conditionals</code>. A conditional evaluates a condition
        and routes to different functions based on the result.
      </p>
      <CodeBlock
        filename="conditionals.js"
        code={`crescent.conditional({
  conditional_id: 'is_adult',
  condition: 'age >= 18',
  true: 'adult_flow',
  false: 'minor_flow'
});

crescent.conditional({
  conditional_id: 'adult_flow',
  condition: 'true',
  true: 'show_welcome'
});`}
      />

      <h2 id="loops">Loops</h2>
      <p>
        Iterate over collections with <code>loops</code>. Each iteration receives the current
        item and its index, and can call functions for each one.
      </p>
      <CodeBlock
        filename="loops.js"
        code={`crescent.loop({
  loop_id: 'render_items',
  items: ['apple', 'banana', 'cherry'],
  body: function (item, index) {
    console.log(index + ': ' + item);
  }
});`}
      />

      <h2 id="apis">API Endpoints</h2>
      <p>
        Create REST API endpoints with <code>crescent.api()</code>. Each endpoint listens for
        an HTTP method and a path, and executes a handler with the request and response
        objects.
      </p>
      <CodeBlock
        filename="apis.js"
        code={`crescent.api({
  method: 'GET',
  path: '/users',
  handler: function (req, res) {
    return { users: ['Alice', 'Bob'] };
  }
});

crescent.api({
  method: 'POST',
  path: '/users',
  handler: function (req, res) {
    const body = req.body;
    return { created: true, user: body };
  }
});`}
      />

      <Callout type="info" title="Request handling">
        Handlers receive Express-style <code>req</code> and <code>res</code> objects. Return
        values are sent as JSON responses automatically.
      </Callout>

      <h2 id="combining">Combining It All</h2>
      <p>
        Functions, conditionals, loops, and APIs compose together. A common pattern is an API
        endpoint that validates input, loops over data, and returns a result.
      </p>
      <CodeBlock
        filename="full-example.js"
        code={`// Create a backend function
crescent.function({
  function_id: 'validate_email',
  parameters: ['email'],
  body: function (email) {
    return email.includes('@');
  }
});

// Use it in an API endpoint
crescent.api({
  method: 'POST',
  path: '/signup',
  handler: function (req, res) {
    const valid = crescent.call_function('validate_email', [req.body.email]);
    if (!valid) {
      return { error: 'Invalid email address' };
    }
    return { status: 'ok' };
  }
});`}
      />

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/database">Database Guide</Link> — persist data with the built-in
          database
        </li>
        <li>
          <Link href="/docs/authentication">Authentication Guide</Link> — protect your
          endpoints
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
