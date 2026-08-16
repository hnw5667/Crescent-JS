import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function TypeScriptPage() {
  return (
    <>
      <DocHeader
        title="TypeScript"
        description="Crescent.js ships official type definitions so TypeScript consumers get full type checking and auto-complete out of the box."
        badge="v1.0.5 Feature"
      />

      <h2 id="overview">Overview</h2>
      <p>
        Since v1.0.5 the npm package <code>crescent-js</code> includes an{' '}
        <code>index.d.ts</code> declaration file. The <code>types</code> field in{' '}
        <code>package.json</code> points at it, so TypeScript finds it automatically ΓÇö no extra
        setup or <code>@types</code> package is needed.
      </p>

      <h2 id="setup">Setup</h2>
      <p>
        The framework itself is written in JavaScript and ships its own bundled type
        definitions, so there is nothing else to install.
      </p>
      <CodeBlock
        code={`npm install crescent-js`}
        language="bash"
      />

      <Callout type="tip" title="Zero extra dependencies">
        Type definitions are bundled in the package ΓÇö there is nothing else to install.
      </Callout>

      <h2 id="default-export">The Typed Singleton</h2>
      <p>
        The default export is the singleton <code>crescent</code> instance, typed as{' '}
        <code>Rocket</code>. Every method is strictly typed, so you get auto-complete and
        compile-time errors for wrong configs:
      </p>
      <CodeBlock
        filename="app.ts"
        code={`import crescent from 'crescent-js';

// Every config object is validated at compile time
const page = crescent.page({
  page_id: 'home',
  size: { height: 800, width: 1200 }
});

crescent.db.create('users');
crescent.db.insert('users', { name: 'Alice' });`}
      />

      <h2 id="named-exports">Named Exports</h2>
      <p>
        Every class is available as a named export ΓÇö usable both as a <em>type</em> and as a{' '}
        <em>value</em> (constructor):
      </p>
      <CodeBlock
        code={`import crescent, {
  Rocket,
  TextLayer,
  Transition,
  type LayerConfig
} from 'crescent-js';

// As a type
const title: TextLayer = crescent.layer({
  layer_id: 'title',
  layer_type: 'text',
  text: 'Hi'
});

// As a value
const custom = new crescent.Rocket();
const t = new Transition({ time: '1s', changes: [] });`}
      />

      <h2 id="layer-narrowing">Layer Type Narrowing</h2>
      <p>
        The <code>layer()</code> method is overloaded. Setting <code>layer_type</code> narrows
        the return type to the concrete layer class:
      </p>
      <CodeBlock
        code={`import crescent, { ImageLayer, InputLayer } from 'crescent-js';

const pic: ImageLayer = crescent.layer({
  layer_type: 'image',
  image_location: 'img/logo.png'
});

const field: InputLayer = crescent.layer({
  layer_type: 'input',
  input_method: 'list',
  list_elements: ['a', 'b']
});`}
      />

      <h2 id="config-interfaces">Configuration Interfaces</h2>
      <p>
        Every feature has a matching configuration interface for typed options:{' '}
        <code>LayerConfig</code>, <code>ObjectConfig</code>, <code>PageConfig</code>,{' '}
        <code>TransitionConfig</code>, <code>TriggerConfig</code>, <code>ResponsiveConfig</code>,{' '}
        <code>FunctionConfig</code>, <code>ConditionalConfig</code>, <code>LoopConfig</code>,{' '}
        <code>ApiCallConfig</code>, <code>ApiMakeConfig</code>, <code>CollectConfig</code>,{' '}
        <code>BooleanConfig</code>, <code>TunnelConfig</code>, <code>ComponentCacheConfig</code>,
        and the auth interfaces.
      </p>
      <CodeBlock
        code={`import crescent, { type ApiMakeConfig } from 'crescent-js';

const config: ApiMakeConfig = {
  api_id: 'rest',
  port: 3000,
  cors: true
};

const api = crescent.api_make(config);`}
      />

      <h2 id="verification">Verification</h2>
      <p>
        The package includes a TypeScript fixture that imports the package the way a real
        consumer would and exercises the full public API. It runs <code>tsc --noEmit</code>{' '}
        as part of the test suite, so the types are verified on every release.
      </p>

      <DocPagination />
    </>
  );
}
