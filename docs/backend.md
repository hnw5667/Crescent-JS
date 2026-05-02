# Backend Guide

Write server-side logic with functions, conditionals, loops, API calls, and more.

---

## Functions

Create reusable server-side functions.

```js
const greet = crescent.function({
  function_id: 'greet',
  params: ['name'],
  body: (name) => `Hello, ${name}!`
});

// Execute
const result = greet.call('World'); // "Hello, World!"
```

### Function Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `function_id` | string | required | Unique identifier |
| `params` | array | `[]` | Parameter names |
| `body` | function | `function() {}` | The function to execute |
| `function_enabled` | boolean | `true` | Whether the function is active |

### Function Methods

```js
func.call(...args);           // Execute the function with arguments
func.set_enabled(bool);       // Enable or disable the function
func.set_body(fn);            // Replace the function body
func.get_params();            // Get the parameter list
```

---

## Conditionals

Branch logic with if / else-if / else chains.

```js
const check = crescent.conditional({
  conditional_id: 'age_check',
  if: {
    check: () => user.age >= 18,
    actions: [
      { type: 'call_function', function: grantAccess }
    ]
  },
  else_if: [
    {
      check: () => user.age >= 13,
      actions: [
        { type: 'call_function', function: limitedAccess }
      ]
    }
  ],
  else: {
    actions: [
      { type: 'call_function', function: denyAccess }
    ]
  }
});

// Evaluate — returns 'if', 'else_if', or 'else'
const result = check.evaluate();
```

### Conditional Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `conditional_id` | string | required | Unique identifier |
| `conditional_enabled` | boolean | `true` | Whether the conditional is active |
| `if` | object | `{ check: false, actions: [] }` | If branch: `{ check, actions }` |
| `else_if` | array | `[]` | Array of `{ check, actions }` branches |
| `else` | object | `{ actions: [] }` | Else branch: `{ actions }` |

### Conditional Methods

```js
conditional.evaluate();                          // Run and return 'if', 'else_if', or 'else'
conditional.set_if(check, actions);              // Set the if branch
conditional.add_else_if(check, actions);         // Add an else-if branch
conditional.set_else(actions);                   // Set the else branch
```

---

## Loops

Iterate with for, while, and for-in loops.

### For Loop

```js
const loop = crescent.loop({
  loop_id: 'count',
  loop_type: 'for',
  start: 0,
  end: 10,
  step: 1,
  actions: [
    (i) => console.log(i)
  ]
});

loop.run();
```

### While Loop

```js
const loop = crescent.loop({
  loop_id: 'process',
  loop_type: 'while',
  condition: () => hasMoreItems(),
  actions: [
    (i) => processNext()
  ]
});

loop.run();
```

### For-In Loop

```js
const loop = crescent.loop({
  loop_id: 'iterate',
  loop_type: 'for_in',
  iterable: ['a', 'b', 'c'],
  actions: [
    (item) => console.log(item)
  ]
});

loop.run();
```

### Loop Configuration

| Property | Type | Description |
|----------|------|-------------|
| `loop_id` | string | Unique identifier |
| `loop_type` | string | `for`, `while`, `for_in` |
| `start` | number | Start value (for loop) |
| `end` | number | End value (for loop) |
| `step` | number | Step increment (for loop) |
| `condition` | function/any | While condition |
| `iterable` | array | Items to iterate (for_in) |
| `actions` | array | Actions to execute each iteration |
| `loop_enabled` | boolean | Whether the loop is active |

---

## Boolean Logic

Evaluate boolean expressions with AND, OR, NOT, XOR, NAND, NOR.

```js
const check = crescent.boolean({
  boolean_id: 'access_check',
  value1: true,
  value2: false,
  operator: 'AND'
});

check.evaluate(); // false
```

### Chaining

```js
const result = crescent.boolean({ boolean_id: 'a', value1: true, operator: 'NOT' })
  .and(crescent.boolean({ boolean_id: 'b', value1: true }))
  .evaluate();
```

### Operators

| Operator | Description |
|----------|-------------|
| `AND` | Both values must be true |
| `OR` | At least one value must be true |
| `NOT` | Negates the first value |
| `XOR` | Exactly one value is true |
| `NAND` | NOT AND |
| `NOR` | NOT OR |

---

## API Calls

Make HTTP requests to external APIs.

```js
const api = crescent.api_call({
  api_call_id: 'fetch_users',
  url: 'https://api.example.com/users',
  method: 'GET',
  headers: { 'Authorization': 'Bearer token123' },
  timeout: 30000
});

// Execute
const response = await api.call();
```

### API Call Configuration

| Property | Type | Description |
|----------|------|-------------|
| `api_call_id` | string | Unique identifier |
| `url` | string | Request URL |
| `method` | string | HTTP method (GET, POST, PUT, PATCH, DELETE) |
| `headers` | object | Request headers |
| `body` | any | Request body (POST/PUT/PATCH) |
| `timeout` | number | Timeout in ms (default: 30000) |

---

## API Server

Create REST API endpoints.

```js
const api = crescent.api_make({
  api_id: 'my_api',
  port: 3000,
  host: 'localhost',
  cors: true
});

// Add endpoints
api.add_endpoint('GET', '/users', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ users: [] }));
});

api.add_endpoint('POST', '/users', (req, res) => {
  const user = req.body;
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ created: user }));
});

// Start the server
await api.start();

// Stop the server
await api.stop();
```

### Path Parameters

Use `:param` syntax for dynamic routes:

```js
api.add_endpoint('GET', '/users/:id', (req, res) => {
  const userId = req.params.id;
  // ...
});
```

### Middleware

```js
api.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

---

## Collect

Gather data from multiple sources (layers, objects, pages).

```js
const collect = crescent.collect({
  collect_id: 'form_data',
  sources: [nameInput, emailInput],
  transform: (data) => ({ ...data, submitted_at: Date.now() }),
  validate: (data) => data.email && data.email.includes('@')
});

const formData = collect.collect();
```

### Collect Methods

```js
collect.collect();           // Gather from all sources
collect.add_source(source);  // Add a data source
collect.set_transform(fn);   // Set transform function
collect.set_validate(fn);    // Set validation function
collect.send(url, options);  // Collect and send to API
```

---

## Database

Crescent.js includes a built-in database with a clean CRUD API.

```js
// Access the database
const db = crescent.db;

// Create a collection
db.create('users');

// Insert documents
db.insert('users', { _id: '1', name: 'Alice', age: 30 });
db.insert_many('users', [
  { _id: '2', name: 'Bob', age: 25 },
  { _id: '3', name: 'Charlie', age: 35 }
]);

// Find documents
const all = db.find('users');
const alice = db.find_one('users', { name: 'Alice' });
const byId = db.find_by_id('users', '1');

// Update documents
db.update('users', { name: 'Alice' }, { age: 31 });
db.update_one('users', { name: 'Bob' }, { age: 26 });

// Delete documents
db.delete('users', { name: 'Charlie' });
db.delete_one('users', { _id: '2' });

// Count, sort, limit
const count = db.count('users');
const sorted = db.sort('users', {}, 'age', 'asc');
const limited = db.limit('users', {}, 10);

// Collection management
db.list_collections();
db.exists('users');
db.drop('users');
```

---

## Global Utility Functions

Crescent.js provides built-in utility functions:

```js
crescent.print(value);              // Console.log and return value
crescent.add(a, b);                 // Addition
crescent.subtract(a, b);            // Subtraction
crescent.multiply(a, b);            // Multiplication
crescent.divide(a, b);              // Division (throws on /0)
crescent.sqrt(n);                   // Square root
crescent.sin(n);                    // Sine
crescent.cos(n);                    // Cosine
crescent.tan(n);                    // Tangent
crescent.get_timestamp();           // Current timestamp
crescent.redirect(url);             // Browser redirect
crescent.connect_and_pull(url, options);  // Fetch JSON from URL