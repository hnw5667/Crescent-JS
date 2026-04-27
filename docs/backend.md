# Backend

Crescent.js provides built-in backend logic primitives — functions, conditionals, loops, API calls, and more — so you can build server-side logic without leaving the framework.

---

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Function** | A reusable block of logic with a handler. |
| **Conditional** | Branching logic with true/false paths. |
| **Loop** | Iterate over collections with a custom iteratee. |
| **API Call** | Make HTTP requests to external services. |
| **API Make** | Define and serve your own API endpoints. |
| **Collect** | Aggregate data from multiple sources. |
| **Boolean** | Logical operations (AND, OR, NOT). |

---

## Functions

Define reusable functions with the `rocket.function()` method.

### Creating a Function

```javascript
const calculateTotal = rocket.function({
  function_id: 'calculate-total',
  handler: (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
});
```

### Retrieving a Function

```javascript
const fn = rocket.get_function('calculate-total');
```

---

## Conditionals

Branch your logic based on conditions.

### Creating a Conditional

```javascript
const checkPermission = rocket.conditional({
  conditional_id: 'check-permission',
  condition: (user) => user.role === 'admin',
  onTrue: (user) => 'Welcome, admin ' + user.name,
  onFalse: (user) => 'Access denied'
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `condition` | function | A function that returns a boolean |
| `onTrue` | function | Executed when condition is true |
| `onFalse` | function | Executed when condition is false |

### Retrieving a Conditional

```javascript
const cond = rocket.get_conditional('check-permission');
```

---

## Loops

Iterate over arrays and collections.

### Creating a Loop

```javascript
const renderProducts = rocket.loop({
  loop_id: 'render-products',
  items: products,
  iteratee: (product, index) => {
    return '<div class="product">' + product.name + ' - $' + product.price + '</div>';
  }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `items` | array | The collection to iterate over |
| `iteratee` | function | Function called for each item, receives `(item, index)` |

### Retrieving a Loop

```javascript
const lp = rocket.get_loop('render-products');
```

---

## API Calls

Make HTTP requests to external APIs.

### Creating an API Call

```javascript
const fetchUsers = rocket.api_call({
  url: 'https://api.example.com/users',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer my-token'
  }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string | The URL to request |
| `method` | string | HTTP method: `GET`, `POST`, `PUT`, `DELETE` |
| `headers` | object | Request headers |

---

## API Make

Define your own API endpoints that other services can call.

### Creating an API Endpoint

```javascript
const userApi = rocket.api_make({
  api_id: 'users-api',
  route: '/api/users',
  method: 'GET',
  handler: (req, res) => {
    return { users: ['Alice', 'Bob', 'Charlie'] };
  }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `route` | string | The URL route for this endpoint |
| `method` | string | HTTP method this endpoint responds to |
| `handler` | function | Function that handles the request |

### Retrieving an API

```javascript
const api = rocket.get_api('users-api');
```

---

## Collect

Aggregate data from multiple sources into a single result.

### Creating a Collect

```javascript
const dashboardData = rocket.collect({
  collect_id: 'dashboard-data',
  sources: [
    { key: 'users',  url: '/api/users' },
    { key: 'orders', url: '/api/orders' },
    { key: 'stats',  url: '/api/stats' }
  ],
  handler: (results) => {
    return {
      userCount:  results.users.length,
      orderCount: results.orders.length,
      revenue:    results.stats.revenue
    };
  }
});
```

### Retrieving a Collect

```javascript
const col = rocket.get_collect('dashboard-data');
```

---

## Boolean

Perform logical operations.

### Creating a Boolean

```javascript
const isAdmin = rocket.boolean({
  boolean_id: 'is-admin',
  operation: 'AND',
  values: [user.isAuthenticated, user.role === 'admin']
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `operation` | string | Logical operation: `AND`, `OR`, `NOT` |
| `values` | array | Array of boolean values to evaluate |

### Retrieving a Boolean

```javascript
const bl = rocket.get_boolean('is-admin');
```

---

## Global Utility Functions

Rocket.js provides several built-in utility functions accessible directly on the `rocket` instance.

### Math Operations

```javascript
rocket.add(5, 3);       // 8
rocket.subtract(10, 4); // 6
rocket.multiply(3, 7);  // 21
rocket.divide(20, 4);   // 5
rocket.sqrt(16);        // 4
rocket.sin(0);          // 0
rocket.cos(0);          // 1
rocket.tan(0);          // 0
```

### Other Utilities

```javascript
rocket.print('Hello');          // Logs to console, returns the value
rocket.get_timestamp();         // Returns current Unix timestamp
rocket.redirect('/home');       // Redirects the browser (client-side only)
rocket.connect_and_pull(url);   // Fetch JSON from a URL
```

---

## Complete Example

```javascript
const rocket = require('crescent-js');

// Define a function
const getDiscount = rocket.function({
  function_id: 'get-discount',
  handler: (price, percent) => price * (1 - percent / 100)
});

// Use a conditional to check eligibility
const checkDiscount = rocket.conditional({
  conditional_id: 'check-discount',
  condition: (orderTotal) => orderTotal > 100,
  onTrue:  () => 'Eligible for 20% discount',
  onFalse: () => 'No discount available'
});

// Loop through items
const listItems = rocket.loop({
  loop_id: 'list-items',
  items: ['Widget', 'Gadget', 'Gizmo'],
  iteratee: (item, i) => '<li>' + item + '</li>'
});

// Create an API endpoint
rocket.api_make({
  api_id: 'products-api',
  route: '/api/products',
  method: 'GET',
  handler: (req, res) => {
    return { products: ['Widget', 'Gadget', 'Gizmo'] };
  }
});
```
