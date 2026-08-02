export default function DatabasePage() {
  return (
    <>
      <h1>Database Guide</h1>
      <p>Crescent.js includes a built-in, zero-configuration database with a full CRUD API.</p>

      <hr />

      <h2>Overview</h2>
      <p>The database is accessible via <code>crescent.db</code> and provides collections, CRUD operations, querying, sorting, and collection management.</p>

      <pre><code>const db = crescent.db;</code></pre>

      <hr />

      <h2>Collections</h2>

      <h3>Creating a Collection</h3>
      <pre><code>{`db.create('users');
db.create('posts', {
  schema: {
    title: { type: 'string', required: true },
    body: { type: 'string', required: true },
    tags: { type: 'array', default: [] }
  }
});`}</code></pre>

      <h3>Listing & Checking</h3>
      <pre><code>{`db.list_collections();  // ['users', 'posts']
db.exists('users');      // true
db.drop('temp_data');`}</code></pre>

      <hr />

      <h2>Inserting Documents</h2>
      <pre><code>{`// Single insert
db.insert('users', { _id: 'user_1', name: 'Alice', email: 'alice@example.com', age: 30 });

// Batch insert
db.insert_many('users', [
  { _id: 'user_2', name: 'Bob', age: 25 },
  { _id: 'user_3', name: 'Charlie', age: 35 }
]);`}</code></pre>

      <hr />

      <h2>Finding Documents</h2>
      <pre><code>{`// Find all
db.find('users');

// Find with query
db.find('users', { age: { $gte: 18 } });

// Find one
db.find_one('users', { name: 'Alice Johnson' });

// Find by ID
db.find_by_id('users', 'user_1');`}</code></pre>

      <hr />

      <h2>Updating Documents</h2>
      <pre><code>{`// Update all matching
db.update('users', { age: { $lt: 30 } }, { category: 'young' });

// Update one
db.update_one('users', { _id: 'user_2' }, { age: 26 });`}</code></pre>

      <hr />

      <h2>Deleting Documents</h2>
      <pre><code>{`db.delete('users', { age: 35 });
db.delete_one('users', { _id: 'user_3' });`}</code></pre>

      <hr />

      <h2>Sorting & Limiting</h2>
      <pre><code>{`db.sort('users', {}, 'age', 'asc');  // Ascending
db.sort('users', {}, 'age', 'desc'); // Descending
db.limit('users', {}, 10);           // First 10

db.count('users');                   // Total count
db.count('users', { age: { $gte: 18 } });`}</code></pre>

      <hr />

      <h2>Query Operators</h2>
      <table>
        <thead>
          <tr><th>Operator</th><th>Description</th><th>Example</th></tr>
        </thead>
        <tbody>
          <tr><td><code>$eq</code></td><td>Equal to</td><td><code>{'{'} age: {'{'} $eq: 30 {'}'} {'}'}</code></td></tr>
          <tr><td><code>$ne</code></td><td>Not equal to</td><td><code>{'{'} age: {'{'} $ne: 30 {'}'} {'}'}</code></td></tr>
          <tr><td><code>$gt</code></td><td>Greater than</td><td><code>{'{'} age: {'{'} $gt: 18 {'}'} {'}'}</code></td></tr>
          <tr><td><code>$gte</code></td><td>Greater or equal</td><td><code>{'{'} age: {'{'} $gte: 18 {'}'} {'}'}</code></td></tr>
          <tr><td><code>$lt</code></td><td>Less than</td><td><code>{'{'} age: {'{'} $lt: 65 {'}'} {'}'}</code></td></tr>
          <tr><td><code>$lte</code></td><td>Less or equal</td><td><code>{'{'} age: {'{'} $lte: 65 {'}'} {'}'}</code></td></tr>
          <tr><td><code>$in</code></td><td>Value in array</td><td><code>{'{'} role: {'{'} $in: ['admin'] {'}'} {'}'}</code></td></tr>
          <tr><td><code>$nin</code></td><td>Value not in array</td><td><code>{'{'} role: {'{'} $nin: ['banned'] {'}'} {'}'}</code></td></tr>
        </tbody>
      </table>

      <hr />

      <h2>Using with API Server</h2>
      <pre><code>{`const api = crescent.api_make({ api_id: 'user_api', port: 3000 });

api.add_endpoint('GET', '/users', (req, res) => {
  const users = crescent.db.find('users');
  res.json(users);
});

api.add_endpoint('POST', '/users', (req, res) => {
  const user = crescent.db.insert('users', req.body);
  res.status(201).json(user);
});

api.add_endpoint('GET', '/users/:id', (req, res) => {
  const user = crescent.db.find_by_id('users', req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

api.start();`}</code></pre>
    </>
  );
}