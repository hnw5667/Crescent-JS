import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function ComponentCachePage() {
  return (
    <>
      <DocHeader
        title="Component Cache"
        description="Optimise frontend rendering by caching components and only shipping IDs when they haven't changed."
        badge="v1.0.4 Feature"
      />

      <h2 id="overview">Overview</h2>
      <p>
        When a component is sent to a web page it is stored in the page's cache — a JSON file
        named <code>components-chacke.json</code>. On the next request, matching component IDs
        mean the server only has to send the ID and where it needs to be loaded, instead of the
        whole component. This makes frontend rendering faster.
      </p>

      <Callout type="tip" title="Edited components are handled">
        If a component is edited under the same name, the server detects the change and sends
        an <strong>update</strong> that refreshes the web page's cache — so users never see a
        stale component.
      </Callout>

      <h2 id="enabling">Enabling the Optimisation</h2>
      <p>
        The optimisation is only active when a hidden <strong>tracker</strong> folder exists.
        Call <code>enable()</code> to create it. If the tracker folder is missing, the cache
        falls back to normal component sends.
      </p>
      <CodeBlock
        code={`const crescent = require('crescent-js');

const cache = crescent.component_cache({
  cache_dir: './crescent_cache',
  cache_file: 'components-chacke.json'
});

cache.enable(); // creates the tracker folder -> optimisation ON
console.log(cache.is_enabled()); // true`}
      />

      <h2 id="resolving">Resolving Components</h2>
      <p>
        Resolve a component to decide what actually goes over the wire:
      </p>
      <CodeBlock
        code={`// First time: stored in the cache -> 'update'
const first = cache.resolve_component(heroObject);
// { type: 'update', id, position, index, component: {...} }

// Same component, unedited: only the ID and location -> 'reuse'
cache.resolve_component(heroObject);
// { type: 'reuse', id, position, index }

// Edited component -> server pushes a fresh 'update'
heroObject.modified_at = Date.now();
cache.resolve_component(heroObject);
// { type: 'update', id, position, index, component: {...} }`}
      />

      <Callout type="info" title="Fallback">
        Without the tracker folder, every component resolves as{' '}
        <code>{`{ type: 'normal', component }`}</code> — sent like before the optimisation
        existed.
      </Callout>

      <h2 id="page-payloads">Page Payloads</h2>
      <p>
        Use <code>render_page_payload(page)</code> to build the whole page: config plus one
        resolved component per object.
      </p>
      <CodeBlock
        code={`const payload = crescent.render_page_payload(homePage);
console.log(payload.components);
// [ { type: 'reuse', id: 'hero', position, index }, ... ]`}
      />

      <h2 id="clearing">Clearing the Cache</h2>
      <CodeBlock
        code={`cache.clear(); // removes components-chacke.json
cache.disable(); // fall back to normal sends`}
      />

      <DocPagination />
    </>
  );
}