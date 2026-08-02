# Database Guide

Crescent.js includes a built-in, zero-configuration database with a full CRUD API.

---

## Overview

The database is accessible via `crescent.db` and provides:

- **Collections** — Named groups of documents
- **CRUD Operations** — Create, read, update, delete
- **Querying** — Find by fields, conditions
- **Sorting & Limiting** — Order and paginate results
- **Collection Management** — List, check existence, drop

---

## Getting Started

```js
const crescent = require('crescent-js');

// Access the database
const db = crescent.db;
```

---

## Collections

### Creating a Collection

```js
db.create('users');
db.create('posts', {
  schema: {
    title: { type: 'string', required: true },
    body: { type: 'string', required: true },
    tags: { type: 'array', default: [] }
  }
});
```

### Listing Collections

```js
const collections = db.list_collections();
// ['users', 'posts']
```

### Checking if a Collection Exists

```js
if (db.exists('users')) {
  // collection exists
}
```

### Dropping a Collection

```js
db.drop('temp_data');
```

---

## Inserting Documents

### Single Insert

```js
const user = db.insert('users', {
  _id: 'user_1',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  age: 30
});
```

### Batch Insert

```js
const users = db.insert_many('users', [
  { _id: 'user_2', name: 'Bob Smith', email: 'bob@example.com', age: 25 },
  { _id: 'user_3', name: 'Charlie Brown', email: 'charlie@example.com', age: 35 },
  { _id: 'user_4', name: 'Diana Prince', email: 'diana@example.com', age: 28 }
]);
```

> **Note:** Each document should have a unique `_id` field.

---

## Finding Documents

### Find All

```js
const allUsers = db.find('users');
// Returns all documents in the collection
```

### Find with Query

```js
const adults = db.find('users', { age: { $gte: 18 } });
const named = db.find('users', { name: 'Alice Johnson' });
```

### Find One

```js
const alice = db.find_one('users', { name: 'Alice Johnson' });
// Returns a single document or null
```

### Find by ID

```js
const user = db.find_by_id('users', 'user_1');
// Fast lookup by _id
```

---

## Updating Documents

### Update Many

```js
// Update all matching documents
const updated = db.update('users', { age: { $lt: 30 } }, { category: 'young' });
// Returns number of documents updated
```

### Update One

```js
db.update_one('users', { _id: 'user_2' }, { age: 26 });
// Updates only the first matching document
```

---

## Deleting Documents

### Delete Many

```js
const removed = db.delete('users', { age: 35 });
// Returns number of documents deleted
```

### Delete One

```js
db.delete_one('users', { _id: 'user_3' });
```

---

## Sorting & Limiting

### Sort

```js
const sorted = db.sort('users', {}, 'age', 'asc');
// Sort by age ascending ('asc' or 'desc')
```

### Limit

```js
const top3 = db.limit('users', {}, 3);
// Returns first 3 matching documents
```

### Combined Querying

```js
const recentAdults = db.find('users', { age: { $gte: 18 } })
  .sort('age', 'desc')
  .limit(10);
```

---

## Counting

```js
const total = db.count('users');
const adults = db.count('users', { age: { $gte: 18 } });
```

---

## Query Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equal to | `{ age: { $eq: 30 } }` |
| `$ne` | Not equal to | `{ age: { $ne: 30 } }` |
| `$gt` | Greater than | `{ age: { $gt: 18 } }` |
| `$gte` | Greater than or equal to | `{ age: { $gte: 18 } }` |
| `$lt` | Less than | `{ age: { $lt: 65 } }` |
| `$lte` | Less than or equal to | `{ age: { $lte: 65 } }` |
| `$in` | Value in array | `{ role: { $in: ['admin', 'mod'] } }` |
| `$nin` | Value not in array | `{ role: { $nin: ['banned'] } }` |

---

## Using with API Server

Combine the database with Crescents API server:

```js
const api = crescent.api_make({ api_id: 'user_api', port: 3000 });

api.add_endpoint('GET', '/users', (req, res) => {
  const users = crescent.db.find('users');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
});

api.add_endpoint('POST', '/users', (req, res) => {
  const user = crescent.db.insert('users', req.body);
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(user));
});

api.add_endpoint('GET', '/users/:id', (req, res) => {
  const user = crescent.db.find_by_id('users', req.params.id);
  if (!user) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(user));
});

api.start();
```

---

## Persistence

By default, the database is stored in-memory and resets on application restart. To enable persistent storage, configure the database when initializing Crescent:

```js
const crescent = require('crescent-js');

// Database configuration (if supported by your version)
crescent.db.configure({
  storage: 'file',
  path: './data/db.json'
});
```

---

## API Reference

Full database method reference available in the [API Reference](./api-reference.md#database-api).