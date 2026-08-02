import Link from 'next/link';
import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function DeploymentPage() {
  return (
    <>
      <DocHeader
        title="Deployment"
        description="Ship your Crescent.js application to production."
        badge="Reference"
      />

      <h2 id="overview">Overview</h2>
      <p>
        Because Crescent.js is a standard Node.js application, you can deploy it to any
        platform that runs Node.js — a VPS, a container, or a PaaS.
      </p>

      <h2 id="building">Building</h2>
      <p>Create an optimized production build of your app:</p>
      <CodeBlock
        language="bash"
        code={`crescent build`}
      />
      <p>
        The build step bundles your pages, layers, and functions into a single production
        artifact ready to serve.
      </p>

      <h2 id="serving">Serving</h2>
      <p>
        Run the production build with the same CLI you use in development. Configure the port
        through the <code>PORT</code> environment variable:
      </p>
      <CodeBlock
        language="bash"
        code={`PORT=8080 crescent run build/`}
      />

      <h2 id="environment-variables">Environment Variables</h2>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>PORT</code></td>
            <td>Port to listen on</td>
          </tr>
          <tr>
            <td><code>AUTH_SECRET</code></td>
            <td>Secret used to sign auth tokens</td>
          </tr>
          <tr>
            <td><code>DATABASE_FILE</code></td>
            <td>Path to the database file</td>
          </tr>
        </tbody>
      </table>

      <Callout type="tip" title="Persistent storage">
        If your host uses ephemeral filesystems, mount a persistent volume for the database
        file so data survives restarts.
      </Callout>

      <h2 id="docker">Docker</h2>
      <p>Here is a minimal <code>Dockerfile</code> for deploying your app:</p>
      <CodeBlock
        filename="Dockerfile"
        language="bash"
        code={`FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npx crescent build

EXPOSE 8080

CMD ["node", "build/server.js"]`}
      />

      <h2 id="deployment-platforms">Deployment Platforms</h2>
      <ul>
        <li>
          <strong>VPS / Cloud VM</strong> — run the production build behind a reverse proxy
        </li>
        <li>
          <strong>Docker</strong> — use the Dockerfile above on any container platform
        </li>
        <li>
          <strong>PaaS</strong> — most Node.js platforms detect the build and start commands
          automatically
        </li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/api-reference">API Reference</Link> — explore every method
        </li>
        <li>
          <Link href="/docs/configuration">Configuration Guide</Link> — finalize your config
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
