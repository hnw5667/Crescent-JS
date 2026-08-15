import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function CompressionPage() {
  return (
    <>
      <DocHeader
        title="Compression"
        description="Compress all text and JSON packets so data travels small and opens anywhere."
        badge="v1.0.4 Feature"
      />

      <h2 id="overview">Overview</h2>
      <p>
        Every text and JSON packet Crescent.js sends can be compressed before it leaves the
        server. Compressed packets stay self-contained — anyone can open them with
        <code>decompress</code> (or <code>unwrap</code> when a secret was used) and get the exact
        original value back.
      </p>

      <Callout type="info" title="Works anywhere">
        Compression uses tried-and-true gzip under the hood. A compressed packet is plain
        base64, so it can be stored, logged, or transferred over any transport without
        breaking.
      </Callout>

      <h2 id="basic-compression">Basic Compression</h2>
      <p>
        Call <code>compress()</code> without a secret to get a pure compressed packet, and{' '}
        <code>decompress()</code> to open it.
      </p>
      <CodeBlock
        code={`const crescent = require('crescent-js');

// Compress a text or JSON packet
const packet = crescent.compress({
  user: 'alice',
  scores: [10, 25, 30],
  bio: 'A long text... '.repeat(200)
});

// Open the packet anywhere
const raw = crescent.decompress(packet);
console.log(raw.user); // 'alice'`}
      />

      <h2 id="packets-with-secret">Packets with a Secret</h2>
      <p>
        Passing a secret compresses <em>and</em> encrypts the payload with AES-256-GCM, so only
        someone with the secret can open it. Use <code>unwrap()</code> on the receiving side.
      </p>
      <CodeBlock
        code={`const crescent = require('crescent-js');

const packet = crescent.compress(
  { session: 'abc123', role: 'admin' },
  'my-server-secret'
);

// On the other side:
const data = crescent.decompress(packet, 'my-server-secret');
console.log(data.role); // 'admin'`}
      />

      <Callout type="tip" title="JSON is detected automatically">
        Objects and JSON strings are compressed as JSON and come back JSON-parsed. Plain text
        comes back as a string — no configuration needed.
      </Callout>

      <h2 id="notes">Notes</h2>
      <ul>
        <li>Compression is applied automatically to API calls, collected data, and database file storage.</li>
        <li>Compressed packets are smaller for realistic payloads — repetitive text shrinks dramatically.</li>
        <li>Use the encrypted tunnels guide for end-to-end encrypted connections.</li>
      </ul>

      <DocPagination />
    </>
  );
}