const assert = require('assert');

// Resolve the tunnel module by relative path (code/test/phase1 -> code/src/phase1/backend)
const { EncryptedTunnel, createTunnel } = require('../../src/phase1/backend/tunnel');

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

// 1. Round trip: JSON object
test('Tunnel round-trip JSON', () => {
  const tunnel = createTunnel({ tunnel_id: 't1' });
  const packet = tunnel.send({ hello: 'world', n: 42 });
  const back = tunnel.receive(packet);
  assert.deepStrictEqual(back, { hello: 'world', n: 42 });
});

// 2. Round trip: long text
test('Tunnel round-trip text', () => {
  const tunnel = createTunnel();
  const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(40);
  const packet = tunnel.send(text);
  const back = tunnel.receive(packet);
  assert.strictEqual(back, text);
});

// 3. handshake proves open and returns a tunnel_id
test('Tunnel handshake open', () => {
  const tunnel = createTunnel({ secret: 'rocket-secret', tunnel_id: 'fixed-id' });
  const cap = tunnel.handshake('remote-peer', 'rocket-secret');
  assert.strictEqual(cap.status, 'open');
  assert.strictEqual(cap.tunnel_id, 'fixed-id');
  assert.ok(cap.secret_id);
  assert.notStrictEqual(cap.secret_id, 'rocket-secret'); // must not expose the full secret
});

// 4. is_open() lifecycle
test('Tunnel is_open lifecycle', () => {
  const tunnel = createTunnel();
  assert.strictEqual(tunnel.is_open(), true);
  tunnel.close();
  assert.strictEqual(tunnel.is_open(), false);
});

// 5. Wrong secret cannot decrypt
test('Tunnel wrong secret rejected', () => {
  const tunnel = createTunnel({ secret: 'right-secret' });
  const foreign = createTunnel({ secret: 'wrong-secret' });
  const packet = tunnel.send({ top: 'secret' });
  const back = foreign.receive(packet);
  assert.notDeepStrictEqual(back, { top: 'secret' }); // raw/undecodable, gracefully returned
});

// Bonus: per-call secret override
test('Tunnel per-call secret override', () => {
  const tunnel = createTunnel({ secret: 'base-secret' });
  const packet = tunnel.send('override me', { secret: 'call-secret' });
  assert.deepStrictEqual(tunnel.receive(packet, { secret: 'call-secret' }), 'override me');
  assert.notDeepStrictEqual(tunnel.receive(packet), 'override me'); // base secret fails
});

console.log('EncryptedTunnel tests: ' + passed + '/' + (passed + failed) + ' passed');
process.exit(failed > 0 ? 1 : 0);