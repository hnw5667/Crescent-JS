import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function EncryptedTunnelsPage() {
  return (
    <>
      <DocHeader
        title="Encrypted Tunnels"
        description="Encrypted tunnels pipe outbound data through AES-256-GCM automatically."
        badge="v1.0.4 Feature"
      />

      <h2 id="overview">Overview</h2>
      <p>
        When a tunnel is open, all data that is sent out — API calls, collected payloads, and
        framework connections — is automatically encrypted and compressed before leaving your
        server. Receivers inside the framework decrypt it transparently, so your code stays
        unchanged.
      </p>

      <Callout type="info" title="Automatic">
        You don't have to wrap every payload yourself. Once a tunnel exists the framework sends
        everything through it for you.
      </Callout>

      <h2 id="starting-a-tunnel">Starting a Tunnel</h2>
      <p>
        Start an encrypted tunnel with <code>crescent.tunnel(config)</code> and a shared secret.
        It returns an <code>EncryptedTunnel</code> instance.
      </p>
      <CodeBlock
        code={`const crescent = require('crescent-js');

// Start a tunnel with a shared secret
const tunnel = crescent.tunnel({
  secret: 'super-secret-key',
  tunnel_id: 'api-tunnel'
});

console.log(tunnel.is_open()); // true
console.log(tunnel.handshake().status); // 'open'`}
      />

      <h2 id="send-and-receive">Send and Receive</h2>
      <p>
        Send data through the tunnel to get a self-contained encrypted packet, then receive it
        on the other side to get the original value back.
      </p>
      <CodeBlock
        code={`const packet = tunnel.send({ message: 'hello', n: 42 });

// Anywhere on the other side, with the same secret:
const data = tunnel.receive(packet);
console.log(data.message); // 'hello'`}
      />

      <h2 id="handshake">Handshake</h2>
      <p>
        The handshake proves a tunnel is established without revealing the full secret. It
        returns a fingerprint you can check before trusting a peer.
      </p>
      <CodeBlock
        code={`const capability = tunnel.handshake('https://api.example.com');
// { tunnel_id: 'api-tunnel', secret_id: '<hash>', status: 'open' }

if (capability.status === 'open') {
  // Safe to send
  tunnel.send({ auth: 'ok' });
}`}
      />

      <h2 id="automatic-outbound">Automatic Outbound Encryption</h2>
      <p>
        With a tunnel open, framework methods such as <code>api_call</code>,{' '}
        <code>collect.send</code>, and <code>connect_and_pull</code> automatically tunnel their
        outbound bytes and unwrap inbound responses.
      </p>
      <CodeBlock
        code={`await connect_and_pull('https://api.example.com/data', {
  secret: 'shared-secret-key'
});

await crescent.collect({
  collect_id: 'form',
  sources: [nameInput, emailInput]
}).send('https://api.example.com/submit');`}
      />

      <h2 id="closing">Closing the Tunnel</h2>
      <CodeBlock
        code={`tunnel.close();
console.log(tunnel.is_open()); // false`}
      />

      <DocPagination />
    </>
  );
}