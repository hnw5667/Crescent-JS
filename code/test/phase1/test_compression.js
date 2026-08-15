/**
 * Task 10023 - Compression of text and .json packets.
 * Verifies cipher.compress/decompress/prepare/unwrap round-trips and that
 * compressed packets can be opened by anyone (pure base64+gzip or with secret).
 */

const assert = require('assert');
const cipher = require('../../src/phase1/cipher');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('[PASS] ' + name);
  } catch (err) {
    failed++;
    console.log('[FAIL] ' + name + ' -> ' + err.message);
  }
}

// 1. Text compression round-trip
test('Compress/decompress text', () => {
  const text = 'Compression of all text packets. '.repeat(200);
  const compressed = cipher.compress(text);
  assert.strictEqual(typeof compressed, 'string');
  assert.strictEqual(cipher.decompress(compressed), text);
});

// 2. JSON compression round-trip
test('Compress/decompress JSON', () => {
  const data = { a: 1, b: [2, 3, { c: 'x' }], nested: { deep: true } };
  const compressed = cipher.compress(JSON.stringify(data));
  const opened = JSON.parse(cipher.decompress(compressed));
  assert.deepStrictEqual(opened, data);
});

// 3. prepare/unwrap full packet (compression + encryption), JSON
test('prepare/unwrap JSON payload', () => {
  const data = { hello: 'world', n: 42 };
  const packet = cipher.prepare(data, 'k');
  assert.deepStrictEqual(cipher.unwrap(packet, 'k'), data);
});

// 4. prepare/unwrap text payload, openable anywhere with secret
test('prepare/unwrap text payload', () => {
  const text = 'a text '.repeat(150);
  const packet = cipher.prepare(text, 'secret');
  assert.strictEqual(cipher.unwrap(packet, 'secret'), text);
});

// 5. isJSON detects objects, json strings, and raw text
test('isJSON detection', () => {
  assert.strictEqual(cipher.isJSON({}), true);
  assert.strictEqual(cipher.isJSON('[1,2]'), true);
  assert.strictEqual(cipher.isJSON('hello'), false);
});

// 6. Rocket exposes compress/decompress + prepare through the framework
test('rocket.compress / rocket.decompress export', () => {
  const rocket = require('../../src/rocket');
  const text = 'Framework level compression. '.repeat(30);
  const compressed = rocket.compress(text, 'sec');
  assert.strictEqual(rocket.decompress(compressed, 'sec'), text);
});

// 7. Compression reduces payload size for repetitive data
test('compression actually shrinks large text', () => {
  const text = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'.repeat(50);
  const compressed = cipher.compress(text);
  assert.ok(compressed.length < text.length, 'compressed should be smaller');
});

console.log('Compression (Task 10023) tests: ' + passed + '/' + (passed + failed) + ' passed');
process.exit(failed > 0 ? 1 : 0);