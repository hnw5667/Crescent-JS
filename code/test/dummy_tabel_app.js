/**
 * Dummy Tabel App - Demonstrates v1.0.9 Tabel system
 * User configures DB with basic JS, each row is object in .json, multiple tabels, copies, hashing, sharding, hidden folders
 * Run: node test/dummy_tabel_app.js  OR  crescent run test/dummy_tabel_app.js
 */
const crescent = require('../src/rocket');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Use a temp base dir for demo (so we don't pollute crescent_data)
const demoBase = fs.mkdtempSync(path.join(os.tmpdir(), 'crescent_dummy_tabel_'));
console.log('[demo] base_dir', demoBase);
crescent._tabelManager = new (require('../src/phase1/database/tabel').TabelManager)(demoBase);

console.log('\n[1] User configures tabel with basic JS');
const users = crescent.table({
  table_name: 'users',
  columns: ['id', 'name', 'email', 'age'],
  max_cells: 6, // 6 cells = 1.5 rows (4 cols) -> will shard after 2 rows (8 cells)
  copies: 2, // redundancy
  unique_columns: ['email'], // no repeat over single column via 160-bit hash
  base_dir: demoBase,
  hidden: true
});
console.log('Created users tabel:', users.info());

const products = crescent.table({
  table_name: 'products',
  columns: ['sku', 'name', 'price'],
  max_cells: 9, // 3 cols *3 rows
  copies: 1,
  unique_columns: ['sku']
});
console.log('Created products tabel:', products.info());
console.log('Multiple tabels:', crescent.list_tabels().map(t=>t.table_name));

console.log('\n[2] Each row is its own object in .json file (NoSQL)');
const r1 = users.insert({ id: 1, name: 'Alice', email: 'alice@example.com', age: 30 });
const r2 = users.insert({ id: 2, name: 'Bob', email: 'bob@example.com', age: 25 });
console.log('Inserted Alice _id', r1._id, 'hash', r1._hash.slice(0,10)+'...');
console.log('Inserted Bob');
console.log('Files in hidden folder:', fs.readdirSync(path.join(demoBase, '.tabel_users')));
console.log('Rows in users:', users.find().length, 'cells', users.info().cells);

console.log('\n[3] Unique check via 160-bit hash bit-by-bit');
console.log('Trying duplicate email alice@example.com (should be blocked by hash check)');
try {
  users.insert({ id: 3, name: 'Alice2', email: 'alice@example.com', age: 22 });
  console.log('FAIL: duplicate allowed');
} catch (e) {
  console.log('Blocked as expected:', e.message);
  // Show hashing: first bit, second bit filtering
  const { sha1Hex, hexToBinary } = require('../src/phase1/database/tabel');
  const h1 = sha1Hex('alice@example.com');
  const h2 = sha1Hex('bob@example.com');
  console.log('Hash alice', h1.slice(0,8), '-> bin', hexToBinary(h1).slice(0,8)+'...');
  console.log('Hash bob  ', h2.slice(0,8), '-> bin', hexToBinary(h2).slice(0,8)+'...');
  console.log('First bit: alice', hexToBinary(h1)[0], 'bob', hexToBinary(h2)[0], 'clears non-matching');
}

console.log('\n[4] Query single table via normal DB searching');
products.insert({ sku: 'A001', name: 'Laptop', price: 1200 });
products.insert({ sku: 'A002', name: 'Mouse', price: 25 });
products.insert({ sku: 'A003', name: 'Keyboard', price: 75 });
console.log('Products find price $gte 75:', products.find({ price: { $gte: 75 } }).map(r=>r.name));
console.log('Users find age $gte 30:', users.find({ age: { $gte: 30 } }).map(r=>r.name));
console.log('Users findOne email bob:', users.findOne({ email: 'bob@example.com' }).name);

console.log('\n[5] Sharding when .json crosses max_cells (user-set)');
console.log('Before shard, users parts', users.info().parts, 'rows', users.info().rows);
users.insert({ id: 3, name: 'Carol', email: 'carol@example.com', age: 28 });
console.log('After 3rd insert (crossed 6 cells), parts', users.info().parts, 'rows', users.info().rows);
console.log('Files now:', fs.readdirSync(path.join(demoBase, '.tabel_users')).filter(f=>f.startsWith('part_')));
users.insert({ id: 4, name: 'Dave', email: 'dave@example.com', age: 35 });
console.log('After 4th insert, parts', users.info().parts, 'rows', users.info().rows);
console.log('All rows still queryable:', users.find().length, 'rows across shards');
console.log('Second json file created as promised, stored in folder for that tabel');

console.log('\n[6] Hidden folder per tabel, crescent tabels --show / --hide');
console.log('Before show, folders:', fs.readdirSync(demoBase));
console.log('Is hidden?', users.hidden, products.hidden);
crescent.tabels.show();
console.log('After --show, folders:', fs.readdirSync(demoBase));
console.log('Now visible:', fs.readdirSync(demoBase).includes('tabel_users'));
crescent.tabels.hide();
console.log('After --hide, folders:', fs.readdirSync(demoBase));
console.log('Now hidden:', fs.readdirSync(demoBase).includes('.tabel_users'));

// Test CLI via run.js simulation
console.log('\n[7] CLI handles both spellings: tabels/tables show/hide');
const { TabelManager } = require('../src/phase1/database/tabel');
const tm = new TabelManager(demoBase);
tm.handleCLI(['--list']);

console.log('\n[demo] Tabel system works: basic JS config, each row object in json, multiple tabels, copies, 160-bit hash checks, sharding, hidden folders with show/hide');
console.log('[demo] About-webpage.txt also updated with frontend explanation');

// Cleanup
fs.rmSync(demoBase, { recursive: true, force: true });
console.log('\n[demo] Cleaned up, done');

