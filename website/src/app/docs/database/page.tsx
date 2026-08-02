import Link from 'next/link';
import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function DatabasePage() {
  return (
    <>
      <DocHeader
        title="Database Guide"
        description="Use Crescent.js's built-in database for create, read, update, and delete operations."
        badge="Guides"
      />

      <h2 id="overview">Overview</h2>
      <p>
        Crescent.js ships with an embedded database that requires no external setup. Create
        collections, insert records, query with filters, and update or delete data — all
        through the <code>crescent.db</code> API.
      </p>

      <Callout type="info" title="Zero configuration">
        The database is stored locally and works out of the box. No connection strings, no
        migrations, no ORM.
      </Callout>

      <h2 id="creating-collections">Creating Collections</h2>
      <CodeBlock
        filename="create-collection.js"
        code={`// Create a collection for users
crescent.db.create('users');

// Create a collection for products
crescent.db.create('products');`}
      />

      <h2 id="inserting-records">Inserting Records</h2>
      <CodeBlock
        filename="insert-records.js"
        code={`crescent.db.insert('users', { name: 'Alice', email: 'alice@example.com' });
crescent.db.insert('users', { name: 'Bob', email: 'bob@example.com' });`}
      />

      <h2 id="reading-records">Reading Records</h2>
      <p>
        Retrieve all records or query with a filter object. Use <code>find</code> for every
        match and <code>find_one</code> for the first match.
      </p>
      <CodeBlock
        filename="read-records.js"
        code={`// Get all users
const all = crescent.db.find('users');

// Get a specific user
const alice = crescent.db.find_one('users', { name: 'Alice' });

console.log(alice);`}
      />

      <Callout type="tip" title="Queries">
        Queries are plain objects: <code>{'{ name: "Alice" }'}</code> matches every record
        where <code>name</code> equals <code>"Alice"</code>. Omit the query to return all
        records.
      </Callout>

      <h2 id="updating-records">Updating Records</h2>
      <CodeBlock
        filename="update-records.js"
        code={`crescent.db.update(
  'users',
  { name: 'Alice' },
  { email: 'alice@newdomain.com' }
);`}
      />

      <h2 id="deleting-records">Deleting Records</h2>
      <CodeBlock
        filename="delete-records.js"
        code={`crescent.db.delete('users', { name: 'Bob' });`}
      />

      <h2 id="full-example">Full Example</h2>
      <p>Here is a complete CRUD flow combined with an API endpoint:</p>
      <CodeBlock
        filename="db-api.js"
        code={`// Create a users collection on startup
crescent.db.create('users');

const api = crescent.api_make({
  api_id: 'main',
  port: 3000
});

// GET /users - list all users
api.add_endpoint('GET', '/users', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(crescent.db.find('users')));
});

// POST /users - create a user
api.add_endpoint('POST', '/users', function (req, res) {
  crescent.db.insert('users', req.body);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true }));
});

api.start();`}
      />

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/authentication">Authentication Guide</Link> — secure your app
          with signup and login
        </li>
        <li>
          <Link href="/docs/api-reference">API Reference</Link> — every method in detail
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
