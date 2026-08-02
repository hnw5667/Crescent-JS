import Link from 'next/link';
import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function ConfigurationPage() {
  return (
    <>
      <DocHeader
        title="Configuration"
        description="Tune the server, database, authentication, and build options for your app."
        badge="Reference"
      />

      <h2 id="overview">Overview</h2>
      <p>
        Crescent.js is designed to work with sensible defaults, but you can customize
        everything from the running port to how the database behaves.
      </p>

      <h2 id="server">Server</h2>
      <CodeBlock
        filename="config.js"
        code={`crescent.config({
  server: {
    port: 3030,
    host: '0.0.0.0'
  }
});`}
      />
      <table>
        <thead>
          <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>port</code></td>
            <td>number</td>
            <td><code>3000</code></td>
            <td>Port the server listens on</td>
          </tr>
          <tr>
            <td><code>host</code></td>
            <td>string</td>
            <td><code>'0.0.0.0'</code></td>
            <td>Interface to bind to</td>
          </tr>
        </tbody>
      </table>

      <h2 id="database">Database</h2>
      <CodeBlock
        filename="config.js"
        code={`crescent.config({
  database: {
    file: 'crescent.db',
    auto_create: true
  }
});`}
      />
      <table>
        <thead>
          <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>file</code></td>
            <td>string</td>
            <td><code>'crescent.db'</code></td>
            <td>Database file path</td>
          </tr>
          <tr>
            <td><code>auto_create</code></td>
            <td>boolean</td>
            <td><code>true</code></td>
            <td>Create the file if missing</td>
          </tr>
        </tbody>
      </table>

      <h2 id="authentication">Authentication</h2>
      <CodeBlock
        filename="config.js"
        code={`crescent.config({
  auth: {
    secret: 'change-me',
    token_expiry: '7d',
    oauth: {
      google: { client_id: '...', client_secret: '...' }
    }
  }
});`}
      />
      <table>
        <thead>
          <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>secret</code></td>
            <td>string</td>
            <td>-</td>
            <td>Signing secret for tokens</td>
          </tr>
          <tr>
            <td><code>token_expiry</code></td>
            <td>string</td>
            <td><code>'7d'</code></td>
            <td>Token lifetime</td>
          </tr>
          <tr>
            <td><code>oauth</code></td>
            <td>object</td>
            <td>-</td>
            <td>OAuth provider credentials</td>
          </tr>
        </tbody>
      </table>

      <Callout type="warning" title="Change the default secret">
        The default auth secret is a placeholder. Always set a unique secret before deploying
        to production.
      </Callout>

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/deployment">Deployment Guide</Link> — ship your app to production
        </li>
        <li>
          <Link href="/docs/api-reference">API Reference</Link> — explore every method
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
