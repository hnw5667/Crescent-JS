# API Reference

Complete documentation for every method available in Rocket.js.

---

## Importing

```javascript
const rocket = require('crescent-js');
```

---

## Frontend Methods

### `rocket.page(config)`

Creates a new page.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.page_id` | string | Unique identifier for the page |
| `config.title` | string | Page title |

**Returns:** Page instance

---

### `rocket.object(config)`

Creates a new object (component container).

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.object_id` | string | Unique identifier for the object |

**Returns:** Object instance

---

### `rocket.layer(config)`

Creates a new layer. The `layer_type` determines the layer behavior.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.layer_type` | string | Type: `base`, `text`, `image`, `shape`, `input` |
| `config.layer_id` | string | Unique identifier for the layer |
| `config.text` | string | Text content (text layer) |
| `config.tag` | string | HTML tag (text layer) |
| `config.src` | string | Image source URL (image layer) |
| `config.alt` | string | Alt text (image layer) |
| `config.shape` | string | Shape type (shape layer) |
| `config.type` | string | Input type (input layer) |
| `config.name` | string | Input name (input layer) |
| `config.placeholder` | string | Placeholder text (input layer) |
| `config.styles` | object | CSS styles for any layer |

**Returns:** Layer instance

---

### `rocket.transition(config)`

Creates a transition animation.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.transition_id` | string | Unique identifier |
| `config.type` | string | Transition type: `fade`, `slide`, `scale`, `rotate` |
| `config.duration` | number | Duration in ms |
| `config.easing` | string | CSS easing function |

**Returns:** Transition instance

---

### `rocket.trigger(config)`

Creates an event trigger.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.trigger_id` | string | Unique identifier |
| `config.event` | string | Event type: `click`, `hover`, `focus`, `submit`, `change`, `keydown` |
| `config.action` | function | Callback function |

**Returns:** Trigger instance

---

### `rocket.responsive(config)`

Sets responsive breakpoints.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.mobile` | string | Mobile breakpoint (e.g. `'480px'`) |
| `config.tablet` | string | Tablet breakpoint (e.g. `'768px'`) |
| `config.desktop` | string | Desktop breakpoint (e.g. `'1024px'`) |

**Returns:** Responsive instance

---

## Backend Methods

### `rocket.function(config)`

Creates a reusable function.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.function_id` | string | Unique identifier |
| `config.handler` | function | The function logic |

**Returns:** RocketFunction instance

---

### `rocket.conditional(config)`

Creates a conditional branch.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.conditional_id` | string | Unique identifier |
| `config.condition` | function | Function that returns a boolean |
| `config.onTrue` | function | Executed when condition is true |
| `config.onFalse` | function | Executed when condition is false |

**Returns:** Conditional instance

---

### `rocket.loop(config)`

Creates a loop over a collection.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.loop_id` | string | Unique identifier |
| `config.items` | array | The collection to iterate over |
| `config.iteratee` | function | Function called for each item, receives `(item, index)` |

**Returns:** Loop instance

---

### `rocket.api_call(config)`

Makes an HTTP request to an external API.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.url` | string | The URL to request |
| `config.method` | string | HTTP method: `GET`, `POST`, `PUT`, `DELETE` |
| `config.headers` | object | Request headers |

**Returns:** ApiCall instance

---

### `rocket.api_make(config)`

Defines an API endpoint.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.api_id` | string | Unique identifier |
| `config.route` | string | The URL route for this endpoint |
| `config.method` | string | HTTP method this endpoint responds to |
| `config.handler` | function | Function that handles the request |

**Returns:** ApiMake instance

---

### `rocket.collect(config)`

Aggregates data from multiple sources.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.collect_id` | string | Unique identifier |
| `config.sources` | array | Array of source definitions |
| `config.handler` | function | Aggregation function receiving all results |

**Returns:** Collect instance

---

### `rocket.boolean(config)`

Creates a logical operation.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.boolean_id` | string | Unique identifier |
| `config.operation` | string | Logical operation: `AND`, `OR`, `NOT` |
| `config.values` | array | Array of boolean values to evaluate |

**Returns:** RocketBoolean instance

---

## Authentication Methods

### `rocket.auth.signup(config)`

Registers a new user.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.username` | string | Unique username |
| `config.email` | string | Email address |
| `config.password` | string | Plain-text password (auto-hashed) |

**Returns:** Signup instance

---

### `rocket.auth.login(config)`

Authenticates an existing user.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.username` | string | The user's username |
| `config.password` | string | The user's password |

**Returns:** Login instance with session data

---

### `rocket.auth.oauth(config)`

Authenticates via a third-party OAuth provider.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.provider` | string | OAuth provider name |
| `config.clientId` | string | OAuth client ID |
| `config.clientSecret` | string | OAuth client secret |
| `config.redirectUri` | string | Callback URL |

**Returns:** OAuth instance

---

### `rocket.auth.password`

Password hashing and verification utilities.

| Method | Description |
|--------|-------------|
| `password.hash(plain)` | Hashes a plain-text password |
| `password.verify(plain, hash)` | Verifies a password against a hash |

---

### `rocket.auth.cookie`

Cookie-based session management.

| Method | Description |
|--------|-------------|
| `cookie.set(name, value, options)` | Sets a cookie |
| `cookie.get(name)` | Gets a cookie value |
| `cookie.clear(name)` | Clears a cookie |

---

## Global Utility Methods

### Math

| Method | Description |
|--------|-------------|
| `rocket.add(a, b)` | Returns `a + b` |
| `rocket.subtract(a, b)` | Returns `a - b` |
| `rocket.multiply(a, b)` | Returns `a * b` |
| `rocket.divide(a, b)` | Returns `a / b` (throws on divide by zero) |
| `rocket.sqrt(n)` | Returns square root |
| `rocket.sin(n)` | Returns sine |
| `rocket.cos(n)` | Returns cosine |
| `rocket.tan(n)` | Returns tangent |

### Other

| Method | Description |
|--------|-------------|
| `rocket.print(value)` | Logs to console and returns the value |
| `rocket.get_timestamp()` | Returns current Unix timestamp |
| `rocket.redirect(url)` | Redirects the browser (client-side only) |
| `rocket.connect_and_pull(url, options)` | Fetches JSON from a URL |

---

## Getter Methods

| Method | Description |
|--------|-------------|
| `rocket.get_page(id)` | Retrieves a page by ID |
| `rocket.get_object(id)` | Retrieves an object by ID |
| `rocket.get_layer(id)` | Retrieves a layer by ID |
| `rocket.get_function(id)` | Retrieves a function by ID |
| `rocket.get_transition(id)` | Retrieves a transition by ID |
| `rocket.get_trigger(id)` | Retrieves a trigger by ID |
| `rocket.get_conditional(id)` | Retrieves a conditional by ID |
| `rocket.get_loop(id)` | Retrieves a loop by ID |
| `rocket.get_boolean(id)` | Retrieves a boolean by ID |
| `rocket.get_api(id)` | Retrieves an API by ID |
| `rocket.renderer` | Access the Renderer instance |
| `rocket.db` | Access the Database instance |