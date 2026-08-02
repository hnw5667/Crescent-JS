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
        tables, insert records, query with filters, and update or delete data — all through
        the <code>crescent.db</code> API.
      </p>

      <Callout type="info" title="Zero configuration">
        The database is stored locally as <code>crescent.db</code> and works out of the box.
        No connection strings, no migrations, no ORM.
      </Callout>

      <h2 id="creating-tables">Creating Tables</h2>
      <CodeBlock
        filename="create-table.js"
        code={`// Create a table for users
crescent.db.create_table({
  table_id: 'users',
  columns: {
    id: 'INTEGER',
    name: 'TEXT',
    email: 'TEXT'
  }
});

// Create a table for products
crescent.db.create_table({
  table_id: 'products',
  columns: {
    id: 'INTEGER',
    name: 'TEXT',
    price: 'REAL'
  }
});`}
      />

      <h2 id="creating-rows">Creating Rows</h2>
      <CodeBlock
        filename="create-rows.js"
        code={`crescent.db.create_row({
  table_id: 'users',
  row: {
    name: 'Alice',
    email: 'alice@example.com'
  }
});

crescent.db.create_row({
  table_id: 'users',
  row: {
    name: 'Bob',
    email: 'bob@example.com'
  }
});`}
      />

      <h2 id="reading-rows">Reading Rows</h2>
      <p>
        Retrieve all rows or query with filters. Use <code>get_all_rows</code> for a full
        table scan, or provide a <code>filter</code> with a column and value.
      </p>
      <CodeBlock
        filename="read-rows.js"
        code={`// Get all users
const all = crescent.db.get_all_rows({ table_id: 'users' });

// Get a specific user
const alice = crescent.db.get_row({
  table_id: 'users',
  filter: { column: 'name', value: 'Alice' }
});

console.log(alice);`}
      />

      <Callout type="tip" title="Filters">
        Filters match a single column against a value. Combine multiple queries to narrow
        down results, or loop over results for more complex filtering.
      </Callout>

      <h2 id="updating-rows">Updating Rows</h2>
      <CodeBlock
        filename="update-rows.js"
        code={`crescent.db.update_row({
  table_id: 'users',
  row_id: 1,
  row: {
    email: 'alice@newdomain.com'
  }
});`}
      />

      <h2 id="deleting-rows">Deleting Rows</h2>
      <CodeBlock
        filename="delete-rows.js"
        code={`crescent.db.delete_row({
  table_id: 'users',
  row_id: 2
});`}
      />

      <h2 id="full-example">Full Example</h2>
      <p>Here is a complete CRUD flow combined with an API endpoint:</p>
      <CodeBlock
        filename="db-api.js"
        code={`// Create a users table on startup
crescent.db.create_table({
  table_id: 'users',
  columns: {
    id: 'INTEGER',
    name: 'TEXT',
    email: 'TEXT'
  }
});

// GET /users - list all users
crescent.api({
  method: 'GET',
  path: '/users',
  handler: function () {
    return crescent.db.get_all_rows({ table_id: 'users' });
  }
});

// POST /users - create a user
crescent.api({
  method: 'POST',
  path: '/users',
  handler: function (req) {
    crescent.db.create_row({
      table_id: 'users',
      row: {
        name: req.body.name,
        email: req.body.email
      }
    });
    return { success: true };
  }
});`}
      />

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/authentication">Authentication Guide</Link> — secure your app with
          signup and login
        </li>
        <li>
          <Link href="/docs/api-reference">API Reference</Link> — every method in detail
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
