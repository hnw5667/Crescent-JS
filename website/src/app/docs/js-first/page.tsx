import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function JsFirstPage() {
  return (
    <>
      <DocHeader
        title="JS-First Component System"
        description="Write components entirely in JavaScript. The framework generates HTML at build time with deterministic section IDs, bundles JS + HTML, and hydrates via rocket.js — plus a custom plain-English about-webpage.txt per page."
        badge="v2.5.1"
      />

      <h2 id="overview">Overview</h2>
      <p>
        From v1.0.6 Crescent.js is <strong>JS-first</strong>: a single JavaScript source of truth generates both the JS logic and the full HTML. No manual HTML wiring is needed. Build-time HTML generation runs on your development machine, the bundle ships both artifacts together, and <code>rocket.js</code> hydrates the pre-generated DOM at runtime while applying built-in CSS and connecting each <code>id=&quot;section-&#123;name&#125;&quot;</code> to its JS logic. Generated HTML is cached alongside JS in <code>components-chacke.json</code>. Since <strong>v1.0.7</strong> the same build also emits <code>about-webpage.txt</code> — a plain-English explanation of how the frontend is made, generated directly from <code>src/phase1/frontend/*.js</code>. In <strong>v1.0.8</strong> that file is now <em>custom per page</em>: it also lists each layer on the page in plain English, e.g. a black <code>Get Started</code> button reads as <code>a square of colour 0,0,0 with bold text of 255,255,255 which goes like Get Started all in one layer</code>.
      </p>

      <Callout type="tip" title="Single source of truth">
        Side-steps drift between HTML and JS — the names you author in JS (<code>name</code> / <code>section_id</code>) deterministically become the DOM ids that the runtime queries.
      </Callout>

      <h2 id="authoring">JS-First Authoring</h2>
      <CodeBlock
        filename="app.js"
        language="javascript"
        code={`const crescent = require('crescent-js');

const hero = crescent.component({
  component_id: 'hero',
  size: { width: 800, height: 300 },
  sections: [
    { section_id: 'hero-title', type: 'text', text: 'Hello, Crescent!', layer_type: 'text', size: 32, colour: '0,0,0', bold: true },
    { name: 'hero-subtitle', layer_type: 'text', text: 'No HTML wiring needed', size: 16, colour: '50,50,50' },
    { name: 'hero-cta', layer_type: 'shape', layer_vertices: 4, colour: '52,152,219', rounded_corners: '8px', size: { width: 200, height: 50 } }
  ]
});

// Manage sections after creation:
hero.add_section({ section_id: 'extra', type: 'text', text: 'Added later' });
hero.get_section('hero-title');
hero.set_section_property('hero-title', 'text', 'Updated!');`}
      />

      <h2 id="build-time">Build-Time HTML Generation</h2>
      <p>
        Generation is a Node-only step on your machine — the browser never synthesizes HTML. The generator at <code>src/phase1/frontend/html_generator.js</code> produces plain HTML strings with deterministic ids and inline built-in CSS.
      </p>
      <CodeBlock
        filename="build"
        language="javascript"
        code={`const html = crescent.generate_html(hero);
// <div id="section-hero" class="crescent-component" ...>
//   <div id="section-hero-title" data-section="hero-title" data-layer-type="text" style="font-size:32px;color:rgb(0,0,0);font-weight:bold">...</div>
// </div>

// Legacy pages are also supported:
const pageHtml = crescent.generate_page_html(page);`}
      />
      <CodeBlock
        filename="bash"
        language="bash"
        code={`crescent build src/app.js ./crescent_build
# crescent_build/bundle.json
# crescent_build/html/<component_id>.html
# crescent_build/js/<component_id>.json
# crescent_build/about-webpage.txt  (v1.0.8, custom per-page plain English)`}
      />
      <CodeBlock
        filename="bundler"
        language="javascript"
        code={`const bundler = crescent.bundler({ outDir: './crescent_build' });
const bundle = bundler.bundleComponent(hero);
// { component_id, js, html, sections: [{ name, id }], timestamp }
const result = bundler.build([hero, card], { outputDir: './out' });
 // result.path -> bundle.json, result.payload.version === '2.5.1'
 // also writes ./out/about-webpage.txt and code/about-webpage.txt (custom per-page)`}
      />

      <h2 id="section-ids">Section-Based ID Assignment</h2>
      <p>
        Every generated element carries <code>id=&quot;section-&#123;name&#125;&quot;</code>, sanitized deterministically from the section name/id: lowercased, whitespace → <code>-</code>, non-alphanumeric → <code>-</code>, collapsed, trimmed.
      </p>
      <CodeBlock
        filename="ids"
        language="html"
        code={`<div id="section-hero" data-component-id="hero">
  <div id="section-hero-title">...</div>
  <div id="section-hero-subtitle">...</div>
</div>`}
      />
      <CodeBlock
        filename="javascript"
        language="javascript"
        code={`const { sectionId } = require('crescent-js/src/phase1/frontend/html_generator');
sectionId('Hero Title'); // 'section-hero-title'`}
      />

      <h2 id="runtime">Runtime Connection via rocket.js</h2>
      <p><code>rocket.js</code> hydrates the pre-generated sections, connects each to its JS logic, and reapplies built-in CSS.</p>
      <CodeBlock
        filename="browser"
        language="javascript"
        code={`// Register logic in the browser:
crescent.component({ component_id: 'hero', sections: [...] });

// Hydrate a mounted container:
hero.hydrate(document.getElementById('crescent-root'));
crescent.hydrate('#crescent-root', hero);
crescent.hydrate(container, 'hero'); // lookup by id

// Per-section binding:
hero.bind_section('hero-title', (el, section) => {
  el.addEventListener('click', () => console.log(section.text));
});`}
      />
      <p>Result shape: <code>{`{ component_id, hydrated: string[], missing: string[], allHydrated: boolean }`}</code>.</p>

      <h2 id="css">Built-in CSS Properties</h2>
      <p>
        Applied at build time (inline) and reapplied at runtime by <code>applyBuiltInCSS</code>: <code>colour</code> → <code>rgb()/rgba()</code>, <code>opacity</code> → 0-1, <code>rounded_corners</code> → <code>border-radius</code>, <code>rotate</code> → <code>rotate()</code>, <code>size</code>, text styles, image/shape/input specifics.
      </p>

      <h2 id="caching">Component Caching</h2>
      <CodeBlock
        filename="cache"
        language="javascript"
        code={`const cache = crescent.component_cache({ cache_dir: './crescent_cache' });
cache.enable();

cache.resolve_component(hero); // { type:'update', id, position, index, component:{..., html}, html }
cache.resolve_component(hero); // { type:'reuse', id, position, index, html }
cache.get_cached_html('hero'); // "<div id=\\"section-hero\\" ...>..."
cache.store_html('hero', html, header.serialize());
cache.build_page_payload_with_html(page);`}
      />
      <Callout type="info" title="Tracker gate">
        Without the hidden <code>.crescent-tracker</code> folder the cache falls back to <code>{`{ type:'normal', component:{..., html} }`}</code> — rendering still works, just without reuse optimization.
      </Callout>

      <h2 id="bundle">Unified Bundling</h2>
      <CodeBlock
        filename="bundle"
        language="javascript"
        code={`const b = crescent.build_bundle(hero);
// { component_id, js, html, sections, timestamp }
crescent.build_page_bundle(page);

const bundler = crescent.bundler();
bundler.bundlePage(page);
bundler.build([hero, card], { outputDir: './out' });
 // ./crescent_build/bundle.json -> { version:'2.5.1', generated_at, bundles:[{ component_id, js, html }] }`}
      />

      <h2 id="about">About Webpage TXT (v1.0.7 → v1.0.8 custom, now v2.5.1)</h2>
      <p>
        With the HTML, the build also generates <code>about-webpage.txt</code> — a plain-English file that explains how the frontend is made, <strong>using the actual frontend code</strong> (<code>src/phase1/frontend/*.js</code>) as its source. It introspects the 16 frontend modules and describes Pages → Objects → Layers, cartesian coordinates, ratio-based scaling, Transitions/Triggers, Renderer, JS-First, and optimisations. Since <strong>v1.0.8</strong> it is <em>custom per page</em>: pass your components/page and each layer is described — e.g. a black square with white bold <code>Get Started</code> becomes <code>a square of colour 0,0,0 with bold text of 255,255,255 which goes like Get Started all in one layer</code>.
      </p>
      <CodeBlock
        filename="about"
        language="javascript"
        code={`// Generate or write the file anywhere:
crescent.generate_about_webpage({ version: '2.5.1' }); // generic
crescent.generate_about_webpage({ version: '2.5.1', components: [hero] }); // custom per-page
crescent.write_about_webpage('./about-webpage.txt', { components: [hero] });

// Via Bundler (automatic alongside HTML, now custom):
// ./out/about-webpage.txt  and  code/about-webpage.txt are written on every build with CUSTOM PAGE BREAKDOWN
const AboutGenerator = require('crescent-js/src/phase1/frontend/about_generator');
AboutGenerator.generateAboutWebpageText({ components: [hero] }); // includes square 0,0,0 + Get Started`}
      />
      <Callout type="tip" title="Plain English">
        Open <code>code/about-webpage.txt</code> or <code>crescent_build/about-webpage.txt</code> to read how the frontend works — no code knowledge required.
      </Callout>

      <DocPagination />
    </>
  );
}
