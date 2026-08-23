import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function TabelPage() {
  return (
    <>
      <DocHeader
        title="Tabel Guide"
        description="User-configurable tables with columns, 160-bit hash uniqueness, sharding, copies, and hidden folders."
        badge="v1.0.9"
      />

      <h2 id="overview">Overview</h2>
      <p>
        A <strong>tabel</strong> is a named table you configure with plain JavaScript. Each tabel has <code>columns</code>, each row is a plain object in a <code>.json</code> file, and the system handles hashing, sharding, copies, and hidden storage.
      </p>
      <Callout type="tip" title="Spelling">
        Both <code>tabel</code> and <code>table</code> work — <code>crescent.table()</code>, <code>crescent.tabel()</code>, <code>crescent tabels</code> and <code>crescent tables</code> are aliases.
      </Callout>

      <h2 id="basic-setup">Basic JS Setup</h2>
      <CodeBlock
        filename="tabel-basic.js"
        code={`const crescent = require('crescent-js');

// Configure with basic JS
const users = crescent.table({
  table_name: 'users',
  columns: ['id', 'name', 'email', 'age'],
  max_cells: 1000,        // when a .json crosses this many cells, a second file is made
  copies: 2,              // keep 2 copies (redundancy)
  unique_columns: ['email'], // no repeat in this column (160-bit hash)
  hidden: true
});

// Each row is its own object in the .json file
users.insert({ id: 1, name: 'Alice', email: 'alice@example.com', age: 30 });
users.insert({ id: 2, name: 'Bob', email: 'bob@example.com', age: 25 });

// Multiple tabels
const products = crescent.table({
  table_name: 'products',
  columns: ['sku', 'name', 'price'],
  max_cells: 500,
  copies: 1,
  unique_columns: ['sku']
});`}
      />

      <h2 id="query-single">Query a Single Tabel</h2>
      <p>Use normal database searching, scoped to one tabel:</p>
      <CodeBlock
        filename="tabel-query.js"
        code={`users.find({ age: { $gte: 30 } });        // => [Alice]
products.find({ price: { $gte: 100 } });  // => [...]
users.findOne({ email: 'bob@example.com' });
users.findById(someId);
users.update({ name: 'Bob' }, { age: 26 });
users.delete({ age: { $lt: 20 } });
users.count({ city: 'NYC' });
users.all();  // all rows across shards
users.info(); // { table_name, columns, max_cells, copies, hidden, folder, parts, rows, cells }`}
      />

      <h2 id="unique-hash">Unique Checks via 160-bit Hash (Bit-by-Bit)</h2>
      <p>
        When <code>unique_columns: ['email']</code> is set, each <code>email</code> is hashed to <strong>SHA1</strong> (40 hex chars = 160 bits → 160-char binary). To check a new value, the system filters existing hashes bit-by-bit: first bit clears non-matching, then second bit, and so on. If all 160 bits match an existing row, the insert is rejected.
      </p>
      <CodeBlock
        filename="hash.js"
        code={`// email is unique, so this throws:
users.insert({ id: 3, name: 'Eve', email: 'alice@example.com' });
// => Error: Unique constraint violation on column "email"

// Internally:
// sha1Hex('alice@example.com') => 40-char hex => 160-bit binary
// hexToBinary => 160 chars, then loop bit 0..159 filtering
`}
      />

      <h2 id="sharding">Sharding When Max Cells Crossed</h2>
      <p>
        <code>max_cells</code> is user-configured. Each file’s cells = <code>rows × columns.length</code>. When the current <code>part_*.json</code> would cross the limit, the next <code>insert</code> creates <code>part_1.json</code>, then <code>part_2.json</code>, etc., all kept in that tabel’s folder.
      </p>
      <CodeBlock
        filename="sharding.js"
        code={`const small = crescent.table({
  table_name: 'small',
  columns: ['a','b'], // 2 columns
  max_cells: 4        // 4 cells = 2 rows per file max
});
small.insert({ a: 1, b: 1 }); // part_0.json: 1 row (2 cells)
small.insert({ a: 2, b: 2 }); // part_0.json: 2 rows (4 cells)
small.insert({ a: 3, b: 3 }); // crosses 4 → new file part_1.json
// small.info().parts === 2`}
      />

      <h2 id="copies">Multiple Copies (Redundancy)</h2>
      <CodeBlock
        filename="copies.js"
        code={`const important = crescent.table({
  table_name: 'important',
  columns: ['id','data'],
  copies: 3
});
important.insert({ id: 1, data: 'critical' });
// On disk: part_0.json, part_0.copy1.json, part_0.copy2.json
// find() reads only primaries, copies are for safety`}
      />

      <h2 id="hidden">Hidden Folders and CLI</h2>
      <p>
        Each tabel’s JSONs live in a hidden folder <code>crescent_data/.tabel_users/</code> (dot-prefix, plus Windows <code>attrib +h</code>). Toggle visibility:
      </p>
      <CodeBlock
        filename="bash"
        language="bash"
        code={`crescent tabels --list
# - users (hidden) columns:id,name,email,age parts:2 rows:4 copies:2

crescent tabels --show   # .tabel_* → tabel_* (visible)
crescent tabels --hide   # tabel_* → .tabel_* (hidden)
# aliases: tables, tabel, table all work`}
      />
      <CodeBlock
        filename="cli-js.js"
        code={`crescent.tabels.show(); // returns number shown
crescent.tabels.hide();
crescent.list_tabels(); // => [{ table_name, hidden, columns, parts, rows, copies }, ...]`}
      />

      <h2 id="api">Full API</h2>
      <CodeBlock
        filename="api.js"
        code={`// Create / get
crescent.table({ table_name, columns, max_cells, copies, unique_columns, hidden, base_dir })
crescent.tabel(config) // alias
crescent.create_table(config)
crescent.get_table('users')
crescent.list_tables() / crescent.list_tabels()
crescent.drop_table('users')

// Instance
tabel.insert(row)
tabel.find(query)
tabel.findOne(query)
tabel.findById(id)
tabel.update(query, updates)
tabel.delete(query)
tabel.count(query)
tabel.all()
tabel.info()
tabel.drop()`}
      />
      <Callout type="info" title="Plain English">
        Like <code>about-webpage.txt</code>, each tabel row is described in plain English when needed: a black square with bold white “Get Started” is one layer described as <code>a square of colour 0,0,0 with bold text of 255,255,255 which goes like Get Started all in one layer</code>.
      </Callout>

      <DocPagination />
    </>
  );
}
