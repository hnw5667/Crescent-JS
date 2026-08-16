import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function BundlingPage() {
  return (
    <>
      <DocHeader
        title="Bundling"
        description="Send the browser a single small file that renders your app. Crescent.js is fully bundler-compatible via a tiny Node entry point."
        badge="v1.0.5 Feature"
      />

      <h2 id="overview">Overview</h2>
      <p>
        Crescent.js apps are written against the frontend API (<code>crescent.layer</code>,{' '}
        <code>crescent.object</code>, <code>crescent.page</code>, <code>crescent.renderer</code>{' '}
        and friends). Those modules are plain browser-compatible ES/CommonJS classes that only
        touch <code>document</code>, <code>window</code>, <code>history</code> and{' '}
        <code>ResizeObserver</code>. The Node-only parts (file system, database, auth, API server)
        live in the server-side module and are never pulled into the browser bundle.
      </p>

      <h2 id="why-bundle">Why bundle at all?</h2>
      <p>
        Shipping one small, self-contained file means the browser makes a single request and
        does not need to resolve many module files at runtime. This is the recommended way to
        distribute a Crescent.js frontend for production.
      </p>

      <h2 id="bundler-compatibility">Bundler compatibility</h2>
      <p>
        Crescent.js ships an <code>index.js</code> that re-exports the frontend API, so it
        works with any standard bundler — esbuild, Vite, Rollup and webpack all resolve it via
        the <code>main</code> field in <code>package.json</code>.
      </p>

      <Callout type="tip" title="No browser polyfills needed">
        The frontend modules rely only on browser-native APIs, so no shims or polyfills are
        required to bundle the renderer.
      </Callout>

      <h2 id="esbuild-example">Example: esbuild</h2>
      <CodeBlock
        filename="build.mjs"
        language="javascript"
        code={`import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  outfile: 'dist/app.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2019'
});`}
      />

      <h2 id="entry-point">The frontend entry point</h2>
      <p>
        The framework exposes the browser surface of the API directly, so your <code>src/app.ts</code>{' '}
        imports the singleton exactly as in development and the bundler inlines only the modules
        it actually uses:
      </p>
      <CodeBlock
        filename="src/app.ts"
        code={`import crescent from 'crescent-js';

const title = crescent.layer({
  layer_type: 'text',
  text: 'Hello from the bundle',
  size: 32
});

const page = crescent.page({ page_id: 'home', size: { height: 800, width: 1200 } });
page.add_layer(title);
crescent.renderer.mount(container);
crescent.renderer.navigate('home');`}
      />

      <h2 id="node-boundary">Where the Node boundary is</h2>
      <p>
        Server features — <code>db</code>, <code>auth</code>, <code>api_make</code>,{' '}
        <code>compress</code>, <code>encrypted_tunnels</code> and the import/export helpers — are{' '}
        <em>not</em> part of the frontend surface. They are exercised through the CLI (<code>crescent run</code>)
        or a Node entry point, and are not reachable from the browser bundle. This keeps the
        client payload lean and the server surface server-side.
      </p>

      <Callout type="info" title="Verified in a real browser">
        A TypeScript snippet that builds a page and mounts it is automatically type-checked,
        compiled and rendered in a headless browser as part of the test suite, confirming the
        bundling workflow end to end.
      </Callout>

      <DocPagination />
    </>
  );
}
