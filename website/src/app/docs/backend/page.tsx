export default function BackendPage() {
  return (
    <>
      <h1>Backend Guide</h1>
      <p>Write server-side logic with functions, conditionals, loops, API calls, and more.</p>

      <hr />

      <h2>Functions</h2>
      <pre><code>{`const greet = crescent.function({
  function_id: 'greet',
  params: ['name'],
  body: (name) => 'Hello, ' + name + '!'
});

const result = greet.call('World'); // "Hello, World!"`}</code></pre>

      <h3>Methods</h3>
      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>call(...args)</code></td><td>Execute with arguments</td></tr>
          <tr><td><code>set_enabled(bool)</code></td><td>Enable or disable</td></tr>
          <tr><td><code>set_body(fn)</code></td><td>Replace function body</td></tr>
        </tbody>
      </table>

      <hr />

      <h2>Conditionals</h2>
      <pre><code>{`const check = crescent.conditional({
  conditional_id: 'age_check',
  if: {
    check: () => user.age >= 18,
    actions: [{ type: 'call_function', function: grantAccess }]
  },
  else_if: [
    {
      check: () => user.age >= 13,
      actions: [{ type: 'call_function', function: limitedAccess }]
    }
  ],
  else: {
    actions: [{ type: 'call_function', function: denyAccess }]
  }
});

const result = check.evaluate(); // 'if', 'else_if', or 'else'`}</code></pre>

      <hr />

      <h2>Loops</h2>

      <h3>For Loop</h3>
      <pre><code>{`const loop = crescent.loop({
  loop_id: 'count',
  loop_type: 'for',
  start: 0,
  end: 10,
  step: 1,
  actions: [(i) => console.log(i)]
});

loop.run();`}</code></pre>

      <h3>While Loop</h3>
      <pre><code>{`const loop = crescent.loop({
  loop_id: 'process',
  loop_type: 'while',
  condition: () => hasMoreItems(),
  actions: [(i) => processNext()]
});

loop.run();`}</code></pre>

      <h3>For-In Loop</h3>
      <pre><code>{`const loop = crescent.loop({
  loop_id: 'iterate',
  loop_type: 'for_in',
  iterable: ['a', 'b', 'c'],
  actions: [(item) => console.log(item)]
});

loop.run();`}</code></pre>

      <hr />

      <h2>Boolean Logic</h2>
      <pre><code>{`const check = crescent.boolean({
  boolean_id: 'access_check',
  value1: true,
  value2: false,
  operator: 'AND'
});

check.evaluate(); // false`}</code></pre>

      <table>
        <thead>
          <tr><th>Operator</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>AND</code></td><td>Both true</td></tr>
          <tr><td><code>OR</code></td><td>At least one true</td></tr>
          <tr><td><code>NOT</code></td><td>Negate</td></tr>
          <tr><td><code>XOR</code></td><td>Exactly one true</td></tr>
          <tr><td><code>NAND</code></td><td>NOT AND</td></tr>
          <tr><td><code>NOR</code></td><td>NOT OR</td></tr>
        </tbody>
      </table>

      <hr />

      <h2>API Calls</h2>
      <pre><code>{`const api = crescent.api_call({
  api_call_id: 'fetch_users',
  url: 'https://api.example.com/users',
  method: 'GET',
  headers: { 'Authorization': 'Bearer token123' },
  timeout: 30000
});

const response = await api.call();`}</code></pre>

      <hr />

      <h2>API Server</h2>
      <pre><code>{`const api = crescent.api_make({
  api_id: 'my_api',
  port: 3000,
  host: 'localhost',
  cors: true
});

api.add_endpoint('GET', '/users', (req, res) => {
  res.json({ users: [] });
});

api.add_endpoint('GET', '/users/:id', (req, res) => {
  const userId = req.params.id;
  // ...
});

api.use((req, res, next) => {
  console.log('Request received');
  next();
});

await api.start();`}</code></pre>

      <hr />

      <h2>Collect</h2>
      <pre><code>{`const collect = crescent.collect({
  collect_id: 'form_data',
  sources: [nameInput, emailInput],
  transform: (data) => ({ ...data, submitted_at: Date.now() }),
  validate: (data) => data.email?.includes('@')
});

const formData = collect.collect();`}</code></pre>

      <hr />

      <h2>Global Utilities</h2>
      <pre><code>{`crescent.print(value);
crescent.add(a, b);
crescent.subtract(a, b);
crescent.multiply(a, b);
crescent.divide(a, b);
crescent.sqrt(n);
crescent.sin(n);
crescent.cos(n);
crescent.tan(n);
crescent.get_timestamp();
crescent.redirect(url);
crescent.connect_and_pull(url, options);`}</code></pre>
    </>
  );
}