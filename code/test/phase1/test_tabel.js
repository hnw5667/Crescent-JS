/**
 * Tabel System Tests - v1.0.9
 * Tests user-configurable tables with columns, hashing, sharding, copies, hidden folders
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('[PASS]', name); }
  catch (e) { failed++; console.log('[FAIL]', name, '->', e.message); console.log(e.stack && e.stack.split('\n').slice(0,4).join('\n')); }
}

const { TabelManager, Tabel, sha1Hex, hexToBinary } = require('../../src/phase1/database/tabel');
const crescent = require('../../src/rocket');

// Helper to create temp manager
function tempManager() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crescent_tabel_test_'));
  return { tmp, tm: new TabelManager(tmp) };
}

// 1. Create table with basic JS
test('Create table with columns via basic JS', () => {
  const { tmp, tm } = tempManager();
  const t = tm.createTable({ table_name: 'users', columns: ['id','name','email'], max_cells: 100, copies: 1 });
  assert.strictEqual(t.table_name, 'users');
  assert.deepStrictEqual(t.columns, ['id','name','email']);
  assert.strictEqual(t.max_cells, 100);
  assert.strictEqual(t.copies, 1);
  assert.ok(fs.existsSync(path.join(tmp, '.tabel_users')));
  fs.rmSync(tmp, { recursive: true, force: true });
});

// 2. Each row is its own object in .json
test('Each row is its own object in .json file', () => {
  const { tmp, tm } = tempManager();
  const t = tm.createTable({ table_name: 'items', columns: ['a','b'], max_cells: 100 });
  const r1 = t.insert({ a: 1, b: 2 });
  const r2 = t.insert({ a: 3, b: 4 });
  assert.ok(r1._id && r2._id);
  const files = fs.readdirSync(path.join(tmp, '.tabel_items'));
  assert.ok(files.includes('part_0.json'));
  const data = JSON.parse(fs.readFileSync(path.join(tmp, '.tabel_items','part_0.json'),'utf-8'));
  assert.strictEqual(data.length, 2);
  assert.strictEqual(data[0].a, 1);
  fs.rmSync(tmp, { recursive: true, force: true });
});

// 3. Multiple tables
test('Multiple tables can be created', () => {
  const { tmp, tm } = tempManager();
  tm.createTable({ table_name: 't1', columns: ['x'] });
  tm.createTable({ table_name: 't2', columns: ['y'] });
  const list = tm.listTables();
  assert.strictEqual(list.length, 2);
  assert.ok(list.some(t=>t.table_name==='t1'));
  assert.ok(list.some(t=>t.table_name==='t2'));
  fs.rmSync(tmp, { recursive: true, force: true });
});

// 4. Multiple copies (redundancy)
test('Multiple copies creates duplicate files', () => {
  const { tmp, tm } = tempManager();
  const t = tm.createTable({ table_name: 'copied', columns: ['a'], max_cells: 100, copies: 3 });
  t.insert({ a: 1 });
  const files = fs.readdirSync(path.join(tmp, '.tabel_copied'));
  assert.ok(files.includes('part_0.json'));
  assert.ok(files.includes('part_0.copy1.json'));
  assert.ok(files.includes('part_0.copy2.json'));
  // Find should not double count
  assert.strictEqual(t.find().length, 1);
  fs.rmSync(tmp, { recursive: true, force: true });
});

// 5. Unique column via 160-bit hash bit-by-bit
test('Unique column check via 160-bit hash (bit-by-bit filtering)', () => {
  const { tmp, tm } = tempManager();
  const t = tm.createTable({ table_name: 'uniq', columns: ['email','name'], max_cells: 100, unique_columns: ['email'] });
  t.insert({ email: 'a@b.com', name: 'Alice' });
  // Duplicate should be blocked
  assert.throws(() => t.insert({ email: 'a@b.com', name: 'Alice2' }), /Unique constraint violation/);
  // Different value should pass
  t.insert({ email: 'b@b.com', name: 'Bob' });
  assert.strictEqual(t.find().length, 2);
  // Check hashing is 160-bit (SHA1)
  const hex = sha1Hex('a@b.com');
  assert.strictEqual(hex.length, 40);
  const bin = hexToBinary(hex);
  assert.strictEqual(bin.length, 160);
  // Bit-by-bit filtering: first bit mismatch clears
  // Insert same email with different case should be considered different (hash differs)
  t.insert({ email: 'A@B.COM', name: 'Alice3' });
  assert.strictEqual(t.find().length, 3);
  fs.rmSync(tmp, { recursive: true, force: true });
});

// 6. Sharding when .json crosses max_cells
test('Sharding when json crosses max_cells creates second json', () => {
  const { tmp, tm } = tempManager();
  // max_cells 4, columns 2 => max 2 rows per file (2*2=4)
  const t = tm.createTable({ table_name: 'shard', columns: ['a','b'], max_cells: 4, copies: 1 });
  t.insert({ a: 1, b: 1 });
  t.insert({ a: 2, b: 2 });
  let info = t.info();
  assert.strictEqual(info.parts, 1);
  assert.strictEqual(info.rows, 2);
  // Next insert should go to new file because 2 rows already =4 cells, next would cross
  t.insert({ a: 3, b: 3 });
  info = t.info();
  assert.strictEqual(info.parts, 2);
  assert.strictEqual(info.rows, 3);
  // Verify files
  const files = fs.readdirSync(path.join(tmp, '.tabel_shard')).filter(f=>f.startsWith('part_'));
  assert.strictEqual(files.length, 2);
  // Find should still work across shards
  assert.strictEqual(t.find({a:3}).length, 1);
  assert.strictEqual(t.find().length, 3);
  fs.rmSync(tmp, { recursive: true, force: true });
});

// 7. Hidden folder and show/hide via CLI
test('Table folder is hidden by default and show/hide toggles', () => {
  const { tmp, tm } = tempManager();
  tm.createTable({ table_name: 'hidden_test', columns: ['x'] });
  let folders = fs.readdirSync(tmp);
  assert.ok(folders.includes('.tabel_hidden_test'));
  assert.ok(!folders.includes('tabel_hidden_test'));
  // Show
  tm.show();
  folders = fs.readdirSync(tmp);
  assert.ok(folders.includes('tabel_hidden_test'));
  assert.ok(!folders.includes('.tabel_hidden_test'));
  let list = tm.listTables();
  assert.strictEqual(list[0].hidden, false);
  // Hide
  tm.hide();
  folders = fs.readdirSync(tmp);
  assert.ok(folders.includes('.tabel_hidden_test'));
  list = tm.listTables();
  assert.strictEqual(list[0].hidden, true);
  fs.rmSync(tmp, { recursive: true, force: true });
});

// 8. Query single table via normal DB searching
test('Query single table via normal searching (find with operators)', () => {
  const { tmp, tm } = tempManager();
  const t = tm.createTable({ table_name: 'query', columns: ['name','age','city'] });
  t.insert({ name: 'Alice', age: 30, city: 'NYC' });
  t.insert({ name: 'Bob', age: 25, city: 'LA' });
  t.insert({ name: 'Carol', age: 35, city: 'NYC' });
  assert.strictEqual(t.find({ city: 'NYC' }).length, 2);
  assert.strictEqual(t.find({ age: { $gte: 30 } }).length, 2);
  assert.strictEqual(t.findOne({ name: 'Bob' }).age, 25);
  assert.strictEqual(t.count({ city: 'NYC' }), 2);
  // Update
  t.update({ name: 'Bob' }, { age: 26 });
  assert.strictEqual(t.findOne({ name: 'Bob' }).age, 26);
  // Delete
  t.delete({ city: 'LA' });
  assert.strictEqual(t.find().length, 2);
  fs.rmSync(tmp, { recursive: true, force: true });
});

// 9. Integration via crescent singleton (basic JS)
test('crescent.table() via singleton with basic JS config', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crescent_dup_'));
  // Override manager to use tmp
  const origBase = crescent.tabels.base_dir;
  crescent._tabelManager = new TabelManager(tmp);
  const t = crescent.table({ table_name: 'singleton', columns: ['id','val'], max_cells: 10, unique_columns: ['id'] });
  assert.strictEqual(t.table_name, 'singleton');
  t.insert({ id: '1', val: 'a' });
  assert.strictEqual(crescent.get_table('singleton').find().length, 1);
  assert.strictEqual(crescent.list_tabels().length, 1);
  // Cleanup
  crescent._tabelManager.dropTable('singleton');
  fs.rmSync(tmp, { recursive: true, force: true });
  crescent._tabelManager = new TabelManager(origBase);
});

// 10. CLI tabels --show / --hide via manager handleCLI
test('CLI tabels --show / --hide via handleCLI', () => {
  const { tmp, tm } = tempManager();
  tm.createTable({ table_name: 'cli1', columns: ['a'] });
  tm.createTable({ table_name: 'cli2', columns: ['b'] });
  // Initially hidden
  assert.ok(fs.readdirSync(tmp).every(f=>f.startsWith('.tabel_')));
  tm.handleCLI(['--show']);
  assert.ok(fs.readdirSync(tmp).every(f=>f.startsWith('tabel_') && !f.startsWith('.tabel_')));
  tm.handleCLI(['--hide']);
  assert.ok(fs.readdirSync(tmp).every(f=>f.startsWith('.tabel_')));
  fs.rmSync(tmp, { recursive: true, force: true });
});

console.log(`\nTabel tests: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
