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
        <code>function_id</code>, a list of <code>params</code>, and a body that executes
        when it is called.
      </p>
      <CodeBlock
        filename="functions.js"
        code={`crescent.function({
  function_id: 'greet_user',
  params: ['name', 'age'],
  body: function (name, age) {
    return 'Hello ' + name + '! You are ' + age + ' years old.';
  }
});

// Call the function
crescent.get_function('greet_user').call('Alice', 25);`}
      />

      <Callout type="tip" title="Reusable logic">
        Functions are stored by <code>function_id</code> and can be retrieved anywhere with{' '}
        <code>crescent.get_function()</code>. Define them once and call them from any page
        or API endpoint.
      </Callout>

      <h2 id="conditionals">Conditionals</h2>
      <p>
        Branch your logic using <code>crescent.conditional()</code>. Each branch has a{' '}
        <code>check</code> function and a list of <code>actions</code> to run when it
        passes.
      </p>
      <CodeBlock
        filename="conditionals.js"
        code={`function grant_access() { console.log('Access granted'); }
function limited_access() { console.log('Limited access'); }
function deny_access() { console.log('Access denied'); }

const check = crescent.conditional({
  conditional_id: 'age_gate',
  if: {
    check: function () { return age >= 18; },
    actions: [grant_access]
  },
  else_if: [
    {
      check: function () { return age >= 13; },
      actions: [limited_access]
    }
  ],
  else: {
    actions: [deny_access]
  }
});

check.evaluate();`}
      />

      <Callout type="info" title="Branch checks">
        A <code>check</code> is any function that returns true or false. If it returns a
        conditional instance, its <code>evaluate()</code> result is used instead.
      </Callout>

      <h2 id="loops">Loops</h2>
      <p>
        Iterate over collections with <code>crescent.loop()</code>. Use{' '}
        <code>loop_type: 'for_in'</code> to iterate an array, or{' '}
        <code>'for'</code>/<code>'while'</code> for counter-driven loops. Call{' '}
        <code>run()</code> to execute and collect results.
      </p>
      <CodeBlock
        filename="loops.js"
        code={`const loop = crescent.loop({
  loop_id: 'render_items',
  loop_type: 'for_in',
  iterable: ['apple', 'banana', 'cherry'],
  actions: [
    function (item) {
      console.log(item);
    }
  ]
});

loop.run();

// Counter loop: 0, 1, 2, ..., 9
crescent.loop({
  loop_id: 'count_to_ten',
  loop_type: 'for',
  start: 0,
  end: 10,
  step: 1,
  actions: [
    function (i) { console.log(i); }
  ]
}).run();`}
      />

      <h2 id="apis">API Endpoints</h2>
      <p>
        Create an HTTP server with <code>crescent.api_make()</code>, register endpoints
        with <code>add_endpoint()</code>, and start listening with{' '}
        <code>start()</code>.
      </p>
      <CodeBlock
        filename="apis.js"
        code={`const api = crescent.api_make({
  api_id: 'main',
  port: 3000
});

api.add_endpoint('GET', '/users', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ users: ['Alice', 'Bob'] }));
});

api.add_endpoint('POST', '/users', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ created: true, user: req.body }));
});

api.start();`}
      />

      <Callout type="info" title="Request handling">
        Handlers are Node.js HTTP handlers. Write a response with{' '}
        <code>res.writeHead()</code> and <code>res.end()</code>. Incoming JSON bodies are
        parsed into <code>req.body</code> for you.
      </Callout>

      <h2 id="combining">Combining It All</h2>
      <p>
        Functions, conditionals, loops, and APIs compose together. A common pattern is an
        API endpoint that validates input with a function and returns the result.
      </p>
      <CodeBlock
        filename="full-example.js"
        code={`// Create a backend function
crescent.function({
  function_id: 'validate_email',
  params: ['email'],
  body: function (email) {
    return email.includes('@');
  }
});

// Use it in an API endpoint
const api = crescent.api_make({
  api_id: 'main',
  port: 3000
});

api.add_endpoint('POST', '/signup', function (req, res) {
  const valid = crescent.get_function('validate_email').call(req.body.email);
  res.writeHead(valid ? 200 : 400, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(valid ? { status: 'ok' } : { error: 'Invalid email address' }));
});

api.start();`}
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
