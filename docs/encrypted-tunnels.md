# Encrypted Tunnels

Encrypted tunnels pipe outbound data through AES-256-GCM automatically.

---

## Overview

When a tunnel is open, all data that is sent out — API calls, collected payloads, and
framework connections — is automatically encrypted and compressed before leaving your server.
Receivers inside the framework decrypt it transparently, so your code stays unchanged.

> **Automatic** — You don't have to wrap every payload yourself. Once a tunnel exists the
> framework sends everything through it for you.

## Starting a Tunnel

Start an encrypted tunnel with `crescent.tunnel(config)` and a shared secret. It returns an
`EncryptedTunnel` instance.

```js
const crescent = require('crescent-js');

const tunnel = crescent.tunnel({
  secret: 'super-secret-key',
  tunnel_id: 'api-tunnel'
});

console.log(tunnel.is_open()); // true
console.log(tunnel.handshake().status); // 'open'
```

## Send and Receive

Send data through the tunnel to get a self-contained encrypted packet, then receive it on the
other side to get the original value back.

```js
const packet = tunnel.send({ message: 'hello', n: 42 });

// Anywhere on the other side, with the same secret:
const data = tunnel.receive(packet);
console.log(data.message); // 'hello'
```

## Handshake

The handshake proves a tunnel is established without revealing the full secret. It returns a
fingerprint you can check before trusting a peer.

```js
const capability = tunnel.handshake('https://api.example.com');
// { tunnel_id: 'api-tunnel', secret_id: '<hash>', status: 'open' }

if (capability.status === 'open') {
  tunnel.send({ auth: 'ok' });
}
```

## Automatic Outbound Encryption

With a tunnel open, framework methods such as `api_call`, `collect.send`, and
`connect_and_pull` automatically tunnel their outbound bytes and unwrap inbound responses.

```js
await connect_and_pull('https://api.example.com/data', {
  secret: 'shared-secret-key'
});

await crescent.collect({
  collect_id: 'form',
  sources: [nameInput, emailInput]
}).send('https://api.example.com/submit');
```

## Closing the Tunnel

```js
tunnel.close();
console.log(tunnel.is_open()); // false
```