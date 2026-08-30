import Link from 'next/link';
import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function PlaygroundDocsPage() {
  return (
    <>
      <DocHeader
        title="Playground"
        description="Test frontend scaling, build UIs visually and chain backend blocks — in the browser, then export to Crescent.js."
        badge="Interactive"
      />

      <Callout type="tip" title="Try it live">
        Open the interactive playground at <Link href="/playground">/playground</Link> — it runs entirely in the browser (static export, GitHub Pages friendly) and generates Crescent.js code you can paste into <code>app.js</code>.
      </Callout>

      <h2 id="overview">Overview</h2>
      <p>
        The playground has three modes that mirror the framework itself:
      </p>
      <ul>
        <li><strong>Frontend Builder</strong> — pages → objects → layers, cartesian positioning, live preview with viewport scaling.</li>
        <li><strong>Scaling Lab</strong> — adjust <code>height_ratio</code> / <code>width_ratio</code> per object, see breakpoints (mobile 480, tablet 768, desktop 1200) and the <code>[0,0] = fill</code> rule.</li>
        <li><strong>Backend Blocks</strong> — drag pre-built processes (function, conditional, loop, boolean, api_call, api_make, collect, DB, auth) and connect them in sequence; play simulates execution and the panel generates real Crescent.js code.</li>
      </ul>

      <h2 id="frontend-builder">Frontend Builder</h2>
      <p>
        Add objects and layers (text, shape, image, input). Each object has a size and a cartesian position on the page; each layer has a cartesian position inside its object. Everything is rendered at the page&apos;s design size and scaled to the viewport with <code>transform: scale()</code> — the same as <code>page._apply_scaling()</code>.
      </p>
      <CodeBlock
        filename="frontend-builder.js"
        code={`const crescent = require('crescent-js');

const page = crescent.page({
  page_id: 'home',
  page_title: 'My App',
  size: { height: 800, width: 1200 }
});

const hero = crescent.object({ object_id: 'hero', size: { height: 220, width: 560 } });
hero.add_layer(crescent.layer({
  layer_type: 'text', layer_id: 'title',
  text: 'Hello Crescent', size: 28, colour: '15,23,42', bold: true
}));
hero.set_layer_position('title', 0, 40);

page.add_object(hero);
page.set_object_position('hero', 0, 120);
page.set_scaling_ratio('hero', [0,0], [0,0]); // fills on mobile

crescent.responsive({ page }).init();
page.render(); // browser
`}
      />

      <h2 id="scaling-lab">Scaling Lab</h2>
      <p>
        Ratio-based scaling is configured per object with <code>page.set_scaling_ratio(id, height_ratio, width_ratio)</code>. The lab lets you edit both ratios and see the fill behaviour live. The viewport slider also shows the active breakpoint and the computed <code>scale = viewport / designWidth</code>.
      </p>
      <CodeBlock
        filename="scaling.js"
        code={`page.set_scaling_ratio('hero', [0,0], [0,0]); // fills both axes on mobile
page.set_scaling_ratio('card', [2,1], [3,1]); // 2:1 vertical, 3:1 horizontal

const responsive = crescent.responsive({
  page,
  breakpoints: [
    { name: 'mobile', maxWidth: 480 },
    { name: 'tablet', maxWidth: 768 },
    { name: 'desktop', maxWidth: 1200 },
    { name: 'large', maxWidth: Infinity },
  ]
});
responsive.init();
responsive.get_breakpoint(); // 'mobile' | 'tablet' | 'desktop' | 'large'
`}
      />
      <Callout type="info" title="Rule of thumb">
        Use <code>[0,0]</code> for hero/full-bleed objects that should fill the screen on small devices. Use explicit ratios for sidebars/cards that should keep their position proportion.
      </Callout>

      <h2 id="backend-blocks">Backend Blocks</h2>
      <p>
        Blocks are pre-built Crescent.js processes. They connect top → bottom (execution order). Each block maps 1-to-1 to a framework call:
      </p>
      <table>
        <thead><tr><th>Block</th><th>Code</th></tr></thead>
        <tbody>
          <tr><td>Function</td><td><code>crescent.function()</code></td></tr>
          <tr><td>Conditional</td><td><code>crescent.conditional()</code></td></tr>
          <tr><td>Loop</td><td><code>crescent.loop()</code></td></tr>
          <tr><td>Boolean</td><td><code>crescent.boolean()</code></td></tr>
          <tr><td>API Call</td><td><code>crescent.api_call()</code></td></tr>
          <tr><td>API Server</td><td><code>crescent.api_make()</code></td></tr>
          <tr><td>Collect</td><td><code>crescent.collect()</code></td></tr>
          <tr><td>DB Create / Insert / Find / Update / Delete</td><td><code>crescent.db.*</code></td></tr>
          <tr><td>Auth Signup / Login / OAuth</td><td><code>crescent.auth.*</code></td></tr>
        </tbody>
      </table>
      <CodeBlock
        filename="backend-blocks.js"
        code={`const crescent = require('crescent-js');

crescent.db.create('contacts');

const api = crescent.api_make({ api_id: 'my_api', port: 3000 });
api.add_endpoint('POST', '/api/contact', (req, res) => {
  const doc = crescent.db.insert('contacts', req.body);
  res.writeHead(201); res.end(JSON.stringify(doc));
});
await api.start();

// conditional + collect example
const guard = crescent.conditional({
  conditional_id: 'check',
  if: { check: () => !!user.email, actions: [] },
  else: { actions: [] }
});
`}
      />
      <p>
        In the playground, fill each block&apos;s fields (e.g. <code>collection</code>, <code>route</code>, <code>operator</code>), reorder with ↑/↓, toggle enabled, then hit <strong>Play</strong> to simulate and <strong>Copy</strong> to export. Paste into <code>app.js</code> and run with <code>crescent run app.js</code> — no extra dependencies.
      </p>

      <h2 id="examples">Full examples</h2>
      <p>
        Two complete apps live in <code>examples/</code> (all Crescent.js only):
      </p>
      <ul>
        <li><Link href="https://github.com/hnw5667/Crescent-JS/tree/main/examples/contact-form">examples/contact-form</Link> — name/email/contact form + DB + API</li>
        <li><Link href="https://github.com/hnw5667/Crescent-JS/tree/main/examples/auth-system">examples/auth-system</Link> — signup/login/session/protected route + DB + auth</li>
      </ul>
      <CodeBlock
        language="bash"
        code={`node examples/contact-form/app.js  # http://localhost:3000
node examples/auth-system/app.js    # http://localhost:3001`}
      />

      <h2 id="next">Next steps</h2>
      <ul>
        <li><Link href="/playground">Open the playground</Link></li>
        <li><Link href="/docs/frontend">Frontend Guide</Link> — layers, objects, pages, responsive</li>
        <li><Link href="/docs/backend">Backend Guide</Link> — functions, conditionals, loops, APIs</li>
        <li><Link href="/docs/database">Database</Link> and <Link href="/docs/authentication">Authentication</Link></li>
      </ul>

      <DocPagination />
    </>
  );
}
