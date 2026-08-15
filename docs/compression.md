# Compression

Compress all text and JSON packets so data travels small and opens anywhere.

---

## Overview

Every text and JSON packet Crescent.js sends can be compressed before it leaves the server.
Compressed packets stay self-contained — anyone can open them with `decompress` (or `unwrap`
when a secret was used) and get the exact original value back.

> **Works anywhere** — Compression uses gzip under the hood. A compressed packet is plain
> base64, so it can be stored, logged, or transferred over any transport without breaking.

## Basic Compression

Call `compress()` without a secret to get a pure compressed packet, and `decompress()` to
open it.

```js
const crescent = require('crescent-js');

// Compress a text or JSON packet
const packet = crescent.compress({
  user: 'alice',
  scores: [10, 25, 30],
  bio: 'A long text... '.repeat(200)
});

// Open the packet anywhere
const raw = crescent.decompress(packet);
console.log(raw.user); // 'alice'
```

## Packets with a Secret

Passing a secret compresses **and** encrypts the payload with AES-256-GCM, so only someone
with the secret can open it.

```js
const packet = crescent.compress(
  { session: 'abc123', role: 'admin' },
  'my-server-secret'
);

// On the other side:
const data = crescent.decompress(packet, 'my-server-secret');
console.log(data.role); // 'admin'
```

> **JSON is detected automatically** — Objects and JSON strings are compressed as JSON and
> come back JSON-parsed. Plain text comes back as a string. No configuration needed.

## Notes

- Compression is applied automatically to API calls, collected data, and database file storage.
- Compressed packets are smaller for realistic payloads — repetitive text shrinks dramatically.
- Use the [Encrypted Tunnels](./encrypted-tunnels.md) guide for end-to-end encrypted
  connections.