# Tabel Guide (v1.0.9 → v2.5.1)

> Current framework version is **v2.5.1** (adds App-Build). Tabel system is unchanged since v1.0.9, tested through v2.0.0 and still current.

User-configurable tables for the Crescent.js NoSQL database. Each tabel has columns, each row is its own object in a `.json` file, and the system handles hashing, sharding, copies, and hidden folders.

---

## Overview

A **tabel** is a named table you configure with basic JavaScript. Unlike collections (which are schemaless), a tabel has:

- **Columns** — the allowed fields for each row
- **Rows** — each row is a plain JS object stored in a `.json` file
- **Copies** — redundant copies for safety
- **Unique checks** — a single value cannot repeat in a chosen column (enforced via 160-bit hashing)
- **Sharding** — when a `.json` file grows past your `max_cells` limit, a second `.json` is created automatically
- **Hidden folders** — each tabel lives in its own hidden folder; `crescent tabels --show` / `--hide` toggles visibility

---

## Basic JS Setup

```js
const crescent = require('crescent-js');

// 1. Configure the tabel with basic JS
const users = crescent.table({
  table_name: 'users',          // required — name of the tabel
  columns: ['id', 'name', 'email', 'age'], // allowed columns
  max_cells: 1000,              // when a .json crosses this many cells, a second file is made
  copies: 2,                    // keep 2 copies of each file (redundancy)
  unique_columns: ['email'],    // email must not repeat (checked via 160-bit hash)
  hidden: true                  // keep folder hidden by default
});

// Alternative spellings all work: crescent.tabel, crescent.create_table, crescent.create_tabel

// 2. Each row is its own object in the .json file
users.insert({ id: 1, name: 'Alice', email: 'alice@example.com', age: 30 });
users.insert({ id: 2, name: 'Bob', email: 'bob@example.com', age: 25 });

// 3. Multiple tabels
const products = crescent.table({
  table_name: 'products',
  columns: ['sku', 'name', 'price'],
  max_cells: 500,
  copies: 1,
  unique_columns: ['sku']
});
products.insert({ sku: 'A001', name: 'Laptop', price: 1200 });

// 4. Query a single tabel via normal database searching
users.find({ age: { $gte: 30 } });        // => [Alice]
products.find({ price: { $gte: 100 } });  // => [Laptop]
users.findOne({ email: 'bob@example.com' });
users.findById(someId);
users.update({ name: 'Bob' }, { age: 26 });
users.delete({ age: { $lt: 20 } });
users.count({ city: 'NYC' });
```

> **Columns are enforced:** inserting `{ id: 1, name: 'Alice', extra: 'oops' }` when `columns` is `['id','name','email','age']` will throw `Column "extra" not defined`.

---

## Querying a Single Tabel

All normal query operators work on a single tabel:

```js
// Exact match
tabel.find({ name: 'Alice' });

// Operators
tabel.find({ age: { $gt: 25 } });
tabel.find({ age: { $gte: 30, $lte: 40 } });
tabel.find({ city: { $in: ['NYC','LA'] } });
tabel.find({ name: { $contains: 'Ali' } });
tabel.find({ name: { $regex: '^A' } });
tabel.find({ email: { $exists: true } });

// Combined
tabel.find({ city: 'NYC', age: { $gte: 30 } });
```

Each tabel’s `find`, `findOne`, `findById`, `update`, `delete`, `count` work exactly like the collection API but are scoped to that tabel’s sharded files.

---

## Unique Checks via 160-bit Hash (Bit-by-Bit)

When you set `unique_columns: ['email']`, the tabel hashes each `email` value to a **160-bit SHA1 hash** (40 hex chars). To check if a new value already exists, it does **bit-by-bit filtering**:

1. Hash the new value → 160-bit binary string (e.g., `11110100...`)
2. Take all existing rows’ hashes for that column
3. **First bit:** discard every row whose first bit does not match the new value’s first bit
4. **Second bit:** among the survivors, discard those whose second bit does not match
5. Repeat for all 160 bits — if any row matches all 160 bits, it’s a duplicate and the insert is rejected

This is equivalent to a trie/filter but described as “first bit clears non-matching, then second bit…”.

```js
// email is unique, so this throws:
users.insert({ id: 3, name: 'Eve', email: 'alice@example.com' });
// => Error: Unique constraint violation on column "email" for value "alice@example.com"
```

The hash is 160 bits (`SHA1`), stored as `_hash` on each row alongside `_id` and `_created`.

---

## Sharding: Second JSON When Max Cells Crossed

You set `max_cells` (user-configured). Each file’s **cells** = `rows * columns.length` (or sum of keys if no columns).

```js
const small = crescent.table({
  table_name: 'small',
  columns: ['a','b'], // 2 columns
  max_cells: 4        // 4 cells = 2 rows (2*2) per file max
});
small.insert({ a: 1, b: 1 }); // file part_0.json: 1 row (2 cells) -> ok
small.insert({ a: 2, b: 2 }); // part_0.json: 2 rows (4 cells) -> ok
small.insert({ a: 3, b: 3 }); // part_0.json would be 6 cells (>4) -> new file part_1.json created
// Result: 2 files, each tabel’s json files kept together in that tabel’s folder
```

The `.json` for a single tabel is kept in a **folder for that tabel** (e.g., `crescent_data/.tabel_users/`). When the current `part_*.json` crosses `max_cells`, the next `insert` creates `part_1.json`, then `part_2.json`, etc.

---

## Multiple Copies (Redundancy)

```js
const important = crescent.table({
  table_name: 'important',
  columns: ['id','data'],
  copies: 3 // keep 3 copies of each part file
});
important.insert({ id: 1, data: 'critical' });
// On disk: part_0.json, part_0.copy1.json, part_0.copy2.json (all identical)
```

If a file is corrupted, a copy remains. `find` reads only the primary `part_*.json` files, not the `.copy*.json` duplicates.

---

## Hidden Folders and CLI

Each tabel’s folder is **hidden by default** (name starts with `.tabel_` → `.tabel_users`). It lives under `crescent_data/` (or your `base_dir`).

```bash
# List tabels
crescent tabels --list
# or
crescent tables --list
# Output:
#   - users (hidden) columns:id,name,email,age parts:2 rows:4 copies:2
#   - products (hidden) ...

# Make hidden folders visible (renames .tabel_* → tabel_*)
crescent tabels --show
# also: crescent tables --show, crescent tabel --show

# Hide again (renames tabel_* → .tabel_*)
crescent tabels --hide
```

On Windows the hidden attribute is also set via `attrib +h` / `-h`; on Unix the dot-prefix hides it.

**Via code:**

```js
crescent.tabels.show(); // returns number of tabels shown
crescent.tabels.hide();
crescent.list_tabels(); // => [{ table_name, hidden, columns, parts, rows, copies }, ...]
```

---

## Full API

```js
// Create / get
crescent.table({ table_name, columns, max_cells, copies, unique_columns, hidden, base_dir })
crescent.tabel(config) // alias
crescent.create_table(config)
crescent.get_table('users')
crescent.list_tables() / crescent.list_tabels()
crescent.drop_table('users')

// Instance methods
tabel.insert(row)
tabel.find(query)
tabel.findOne(query)
tabel.findById(id)
tabel.update(query, updates)
tabel.delete(query)
tabel.count(query)
tabel.all() // all rows across shards
tabel.info() // { table_name, columns, max_cells, copies, unique_columns, hidden, folder, parts, rows, cells }
tabel.drop()
```

All tabels are accessible via `crescent.tabels` / `crescent.tables` / `crescent.tabelManager` (the `TabelManager` singleton).

---

## Example: Staging Home with Get Started Button

The same plain-English style used for `about-webpage.txt` applies: a black square button with white bold “Get Started” text is one layer:

```js
const hero = crescent.component({
  component_id: 'home',
  sections: [
    { section_id: 'get_started', type: 'shape', layer_vertices: 4, colour: '0,0,0', text: 'Get Started', bold: true, colour_text: '255,255,255', size: { height: 44, width: 180 } }
  ]
});
// about-webpage.txt will describe it as:
// "a square of colour 0,0,0 with bold text of 255,255,255 which goes like Get Started all in one layer"
```

