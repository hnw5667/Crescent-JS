# 📦 Database Module

Access: `Crescent.Database`

The Database module gives you a complete data layer without needing MongoDB, PostgreSQL, or any external database. Everything is stored as JSON files on disk.

---

## Classes

| Class | Description |
|-------|-------------|
| [FileManager](#filemanager) | Create, read, list, and delete JSON collections |
| [QueryEngine](#queryengine) | In-memory queries with MongoDB-style operators |
| [DatabaseSyntax](#databasesyntax) | SQL-like syntax for database operations |
| [LiveSearch](#livesearch) | Full-text search with fuzzy matching |

---

## FileManager

Manages JSON file collections on disk. Each collection is a `.json` file in your data directory.

### Constructor

```javascript
const fm = new FileManager({ base_path: './data' });
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `base_path` | string | Directory path where collections are stored. Created automatically if it doesn't exist. |

### Methods

#### `create_collection(name)`

Creates a new collection (a JSON file). Throws an error if the collection already exists.

```javascript
fm.create_collection('users');   // Creates data/users.json
fm.create_collection('posts');   // Creates data/posts.json
```

#### `read_collection(name)`

Reads all documents from a collection. Returns an empty array if the collection doesn't exist.

```javascript
const users = fm.read_collection('users');
// [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]
```

#### `list_collections()`

Returns an array of all collection names in the base_path directory.

```javascript
fm.list_collections();
// ['users', 'posts']
```

#### `delete_collection(name)`

Deletes a collection file. Returns `true` on success.

```javascript
fm.delete_collection('posts'); // true
```

---

## QueryEngine

In-memory document store with MongoDB-style query operators. Perfect for fast queries without hitting disk.

### Constructor

```javascript
const qe = new QueryEngine();
```

### Methods

#### `insert(doc)`

Inserts a document. Returns the document with an `_id` field added.

```javascript
const result = qe.insert({ name: 'Alice', age: 30 });
// { _id: 'a1b2c3', name: 'Alice', age: 30 }
```

#### `find(query)`

Finds all documents matching the query. Pass `{}` to return all documents.

```javascript
qe.find({ name: 'Alice' });
// [{ _id: 'a1b2c3', name: 'Alice', age: 30 }]

qe.find({});  // All documents
```

#### `find_one(query)`

Finds the first matching document. Returns `null` if nothing matches.

```javascript
qe.find_one({ name: 'Alice' });
// { _id: 'a1b2c3', name: 'Alice', age: 30 }
```

#### `update(query, changes)`

Updates all matching documents with the `changes` object. Returns the number of documents updated.

```javascript
qe.update({ name: 'Alice' }, { age: 31 }); // 1
```

#### `delete(query)`

Deletes all matching documents. Returns the number deleted.

```javascript
qe.delete({ age: { $lt: 26 } }); // 1
```

#### `count(query)`

Counts matching documents.

```javascript
qe.count({ age: { $gt: 25 } }); // 2
```

### Query Operators

Use these inside any query value to build powerful filters:

| Operator | Meaning | Example |
|----------|---------|---------|
| `$gt` | Greater than | `{ age: { $gt: 25 } }` |
| `$lt` | Less than | `{ age: { $lt: 30 } }` |
| `$gte` | Greater than or equal | `{ age: { $gte: 25 } }` |
| `$lte` | Less than or equal | `{ age: { $lte: 30 } }` |
| `$ne` | Not equal | `{ status: { $ne: 'inactive' } }` |
| `$in` | Value is in array | `{ role: { $in: ['admin', 'mod'] } }` |
| `$contains` | String contains substring | `{ name: { $contains: 'ali' } }` |

### Complete Example

```javascript
const { QueryEngine } = Crescent.Database;
const qe = new QueryEngine();

qe.insert({ name: 'Alice', age: 30, role: 'admin' });
qe.insert({ name: 'Bob', age: 25, role: 'user' });
qe.insert({ name: 'Charlie', age: 35, role: 'mod' });

qe.find({ age: { $gt: 26 } });
// [{ name: 'Alice', ... }, { name: 'Charlie', ... }]

qe.find({ role: { $in: ['admin', 'mod'] } });
// [{ name: 'Alice', ... }, { name: 'Charlie', ... }]

qe.update({ name: 'Alice' }, { age: 31 }); // 1
qe.delete({ age: { $lt: 26 } });            // 1
qe.count({});                               // 2
```

---

## DatabaseSyntax

SQL-like syntax for database operations. Great for developers who prefer SQL-style commands over method calls.

### Constructor

```javascript
const syntax = new DatabaseSyntax(file_manager);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `file_manager` | FileManager | A FileManager instance to handle storage. |

### Commands

All commands are passed as strings to the `execute()` method.

| Command | Description |
|---------|-------------|
| `CREATE name` | Creates a new collection |
| `INSERT INTO name doc` | Inserts a document |
| `INSERT_MANY INTO name docs` | Inserts multiple documents |
| `SELECT FROM name` | Reads all documents |
| `SELECT FROM name WHERE query` | Reads with a filter |
| `UPDATE name SET changes WHERE query` | Updates matching documents |
| `DELETE FROM name WHERE query` | Deletes matching documents |
| `DROP name` | Deletes a collection |

### Example

```javascript
const { DatabaseSyntax, FileManager } = Crescent.Database;
const fm = new FileManager({ base_path: './data' });
const syntax = new DatabaseSyntax(fm);

syntax.execute('CREATE users');
syntax.execute('INSERT INTO users { "name": "Alice", "age": 30 }');
syntax.execute('INSERT_MANY INTO users [{ "name": "Bob" }, { "name": "Charlie" }]');
syntax.execute('SELECT FROM users');
syntax.execute('DROP users');
```

---

## LiveSearch

Full-text search with fuzzy matching. Build a search index from your documents and query it.

### Constructor

```javascript
const search = new LiveSearch();
```

### Methods

#### `build_index(docs, fields)`

Indexes documents on the specified fields for fast searching.

| Parameter | Type | Description |
|-----------|------|-------------|
| `docs` | array | Array of document objects |
| `fields` | array | Field names to index for search |

```javascript
search.build_index(docs, ['title', 'content']);
```

#### `search(query)`

Searches the index for exact or partial matches. Returns matching documents.

```javascript
search.search('guide');
// [{ title: 'Advanced Guide', content: '...' }]
```

#### `fuzzy_search(query, max_distance)`

Fuzzy search that tolerates typos. `max_distance` controls how different the query can be (default: 2).

```javascript
search.fuzzy_search('guid');   // Finds 'guide' (1 character off)
search.fuzzy_search('gide', 2); // Finds 'guide' (2 characters off)
```

### Complete Example

```javascript
const { LiveSearch } = Crescent.Database;
const search = new LiveSearch();

const docs = [
  { title: 'Getting Started', content: 'Learn the basics' },
  { title: 'Advanced Guide', content: 'Deep dive into features' },
  { title: 'API Reference', content: 'Complete API docs' }
];

search.build_index(docs, ['title', 'content']);

search.search('guide');        // [{ title: 'Advanced Guide', ... }]
search.fuzzy_search('guid');   // [{ title: 'Advanced Guide', ... }]
search.search('API');         // [{ title: 'API Reference', ... }]