# ⚙️ Backend Module

Access: `Crescent.Backend`

The Backend module provides server-side logic primitives — named functions, conditionals, loops, boolean logic, data collection, and HTTP utilities.

---

## Classes

| Class | Description |
|-------|-------------|
| [RocketFunction](#rocketfunction) | Named functions with enable/disable toggle |
| [Conditional](#conditional) | If/else evaluation |
| [Loop](#loop) | For-loops and for-in iteration |
| [RocketBoolean](#rocketboolean) | AND, OR, NOT logic chains |
| [Collect](#collect) | Gather and transform data |
| [APICall](#apicall) | Make HTTP requests |
| [APIMake](#apimake) | Build and send API requests |

---

## RocketFunction

Named functions you can enable and disable. Disabled functions return `null` when called.

### Constructor

```javascript
const fn = new RocketFunction('name', {
  body: (arg1, arg2) => result,
  enabled: true  // optional, default is true
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Function name (for debugging/logging) |
| `body` | function | The function to execute |
| `enabled` | boolean | Initial enabled state (default: `true`) |

### Methods

#### `call(...args)`

Executes the function if enabled. Returns `null` if disabled.

```javascript
const fn = new RocketFunction('greet', { body: (name) => `Hello, ${name}!` });
fn.call('World'); // 'Hello, World!'

fn.disable();
fn.call('World'); // null
```

#### `enable()` / `disable()`

Toggle the function on or off.

```javascript
fn.enable();   // Function will execute on call()
fn.disable();  // Function returns null on call()
```

#### `is_enabled()`

Returns whether the function is currently enabled.

```javascript
fn.is_enabled(); // true or false
```

---

## Conditional

If/else evaluation with custom condition functions.

### Constructor

```javascript
const cond = new Conditional({
  condition: () => boolean,
  if_branch: () => result,
  else_branch: () => result
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `condition` | function | A function that returns true or false |
| `if_branch` | function | Runs when condition is true |
| `else_branch` | function | Runs when condition is false |

### Methods

#### `evaluate()`

Evaluates the condition and runs the matching branch. Returns the branch's result.

```javascript
const cond = new Conditional({
  condition: () => 5 > 3,
  if_branch: () => 'yes',
  else_branch: () => 'no'
});
cond.evaluate(); // 'yes'
```

---

## Loop

For-loops and for-in iteration over collections.

### Constructor

```javascript
// Counted loop — runs N times
const loop = new Loop({
  type: 'for',
  count: 5,
  body: (i) => i * 2
});

// For-in loop — iterates over an array
const loop = new Loop({
  type: 'for_in',
  collection: [10, 20, 30],
  body: (item) => item + 5
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | `'for'` for counted, `'for_in'` for collection iteration |
| `count` | number | Number of iterations (for `type: 'for'`) |
| `collection` | array | Array to iterate over (for `type: 'for_in'`) |
| `body` | function | Function to run each iteration |

### Methods

#### `run()`

Executes the loop and returns an array of results.

```javascript
const loop1 = new Loop({ type: 'for', count: 3, body: (i) => i * 2 });
loop1.run(); // [0, 2, 4]

const loop2 = new Loop({ type: 'for_in', collection: ['a', 'b', 'c'], body: (x) => x.toUpperCase() });
loop2.run(); // ['A', 'B', 'C']
```

---

## RocketBoolean

AND, OR, NOT logic chains. Chain them together for complex conditions.

### Constructor

```javascript
const bool = new RocketBoolean();
```

### Methods

#### `AND(...conditions)`

Returns `true` if ALL conditions are true.

```javascript
bool.AND(true, true, true);   // true
bool.AND(true, false, true);  // false
```

#### `OR(...conditions)`

Returns `true` if ANY condition is true.

```javascript
bool.OR(false, true, false);  // true
bool.OR(false, false, false); // false
```

#### `NOT(condition)`

Returns the opposite of the condition.

```javascript
bool.NOT(true);   // false
bool.NOT(false);  // true
```

### Chaining Example

```javascript
const { RocketBoolean } = Crescent.Backend;
const bool = new RocketBoolean();

// Complex: (true OR false) AND (NOT false)
const result = bool.AND(
  bool.OR(true, false),
  bool.NOT(false)
);
// true
```

---

## Collect

Gather and transform data from multiple sources.

### Constructor

```javascript
const collect = new Collect();
```

### Methods

#### `gather(...sources)`

Combines multiple arrays into one flat array.

```javascript
collect.gather([1, 2], [3, 4], [5]);
// [1, 2, 3, 4, 5]
```

#### `transform(data, fn)`

Maps a function over the data. Returns a new array.

```javascript
collect.transform([1, 2, 3], (x) => x * 10);
// [10, 20, 30]
```

#### `filter(data, fn)`

Filters data by a predicate function.

```javascript
collect.filter([1, 2, 3, 4, 5], (x) => x > 3);
// [4, 5]
```

---

## APICall

Make HTTP requests to external APIs.

### Constructor

```javascript
const api = new APICall();
```

### Methods

#### `get(url, headers)`

Makes a GET request. Returns a Promise with the response.

```javascript
const data = await api.get('https://api.example.com/users');
```

#### `post(url, body, headers)`

Makes a POST request with a JSON body.

```javascript
const result = await api.post('https://api.example.com/users', { name: 'Alice' });
```

#### `put(url, body, headers)`

Makes a PUT request.

```javascript
await api.put('https://api.example.com/users/1', { name: 'Alice Updated' });
```

#### `delete(url, headers)`

Makes a DELETE request.

```javascript
await api.delete('https://api.example.com/users/1');
```

---

## APIMake

Build and send custom HTTP requests with full control over method, headers, and body.

### Constructor

```javascript
const api = new APIMake();
```

### Methods

#### `send(config)`

Sends a custom HTTP request. Returns a Promise.

```javascript
const result = await api.send({
  method: 'POST',
  url: 'https://api.example.com/data',
  headers: { 'Authorization': 'Bearer token123' },
  body: { key: 'value' }
});
```

| Config Field | Type | Description |
|-------------|------|-------------|
| `method` | string | HTTP method: GET, POST, PUT, DELETE, PATCH |
| `url` | string | Request URL |
| `headers` | object | Custom headers (optional) |
| `body` | object | Request body (optional) |