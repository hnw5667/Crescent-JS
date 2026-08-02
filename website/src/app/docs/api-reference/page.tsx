import Link from 'next/link';
import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function ApiReferencePage() {
  return (
    <>
      <DocHeader
        title="API Reference"
        description="A complete reference for every Crescent.js method."
        badge="Reference"
      />

      <Callout type="note" title="Convention">
        Core methods are called on the <code>crescent</code> instance, database methods on{' '}
        <code>crescent.db</code>, and authentication methods on{' '}
        <code>crescent.auth</code>.
      </Callout>

      <h2 id="page">page()</h2>
      <p>Creates a new page container.</p>
      <CodeBlock
        language="js"
        code={`const page = crescent.page({
  page_id: 'home',
  page_title: 'Home',
  page_description: 'Home page',
  size: { height: 900, width: 1440 }
});`}
      />
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>page_id</code></td>
            <td>string</td>
            <td>yes</td>
            <td>Unique identifier</td>
          </tr>
          <tr>
            <td><code>page_title</code></td>
            <td>string</td>
            <td>no</td>
            <td>Browser tab title</td>
          </tr>
          <tr>
            <td><code>page_description</code></td>
            <td>string</td>
            <td>no</td>
            <td>Meta description</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td>object</td>
            <td>yes</td>
            <td><code>{'{ height, width }'}</code> in pixels</td>
          </tr>
        </tbody>
      </table>

      <h2 id="object">object()</h2>
      <p>Creates a container for layers.</p>
      <CodeBlock
        language="js"
        code={`crescent.object({
  object_id: 'header',
  size: { height: 80, width: 600 },
  page_position: { x: 0, y: 0 }
});`}
      />
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>object_id</code></td>
            <td>string</td>
            <td>yes</td>
            <td>Unique identifier</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td>object</td>
            <td>yes</td>
            <td><code>{'{ height, width }'}</code></td>
          </tr>
          <tr>
            <td><code>page_position</code></td>
            <td>object</td>
            <td>no</td>
            <td>Cartesian <code>{'{ x, y }'}</code></td>
          </tr>
          <tr>
            <td><code>page_index</code></td>
            <td>number</td>
            <td>no</td>
            <td>Stacking order on the page</td>
          </tr>
          <tr>
            <td><code>bg_layer</code></td>
            <td>string</td>
            <td>no</td>
            <td>Layer rendered behind the object</td>
          </tr>
          <tr>
            <td><code>object_enabled</code></td>
            <td>boolean</td>
            <td>no</td>
            <td>Whether the object renders (default <code>true</code>)</td>
          </tr>
        </tbody>
      </table>

      <h2 id="layer">layer()</h2>
      <p>Creates a visual element. Requires <code>layer_type</code> and <code>layer_id</code>.</p>
      <CodeBlock
        language="js"
        code={`crescent.layer({
  layer_type: 'text',
  layer_id: 'title',
  text: 'Hello',
  size: 32,
  colour: '0,0,0'
});`}
      />
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>layer_type</code></td>
            <td>string</td>
            <td>yes</td>
            <td><code>text</code>, <code>image</code>, <code>shape</code>, <code>input</code></td>
          </tr>
          <tr>
            <td><code>layer_id</code></td>
            <td>string</td>
            <td>yes</td>
            <td>Unique identifier</td>
          </tr>
          <tr>
            <td><code>text</code></td>
            <td>string</td>
            <td>no</td>
            <td>Text content (text and shape layers)</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td>number | object</td>
            <td>no</td>
            <td>Font size for text, or <code>{'{ height, width }'}</code> for image/shape/input</td>
          </tr>
          <tr>
            <td><code>colour</code></td>
            <td>string</td>
            <td>no</td>
            <td>Colour as <code>'r,g,b'</code> (text and shape layers)</td>
          </tr>
          <tr>
            <td><code>image_location</code></td>
            <td>string</td>
            <td>no</td>
            <td>Image URL (image layers)</td>
          </tr>
          <tr>
            <td><code>layer_vertices</code></td>
            <td>number</td>
            <td>no</td>
            <td>Number of sides, e.g. <code>4</code> for a rectangle (shape layers)</td>
          </tr>
          <tr>
            <td><code>input_method</code></td>
            <td>string</td>
            <td>no</td>
            <td>Input style, e.g. <code>'text box'</code> (input layers)</td>
          </tr>
        </tbody>
      </table>

      <h2 id="function">function()</h2>
      <p>Defines a reusable backend function.</p>
      <CodeBlock
        language="js"
        code={`crescent.function({
  function_id: 'add',
  params: ['a', 'b'],
  body: function (a, b) {
    return a + b;
  }
});

crescent.get_function('add').call(2, 3); // 5`}
      />
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>function_id</code></td>
            <td>string</td>
            <td>yes</td>
            <td>Unique identifier</td>
          </tr>
          <tr>
            <td><code>params</code></td>
            <td>string[]</td>
            <td>no</td>
            <td>Argument names</td>
          </tr>
          <tr>
            <td><code>body</code></td>
            <td>function</td>
            <td>yes</td>
            <td>Executes when called</td>
          </tr>
        </tbody>
      </table>

      <h2 id="api_make">api_make()</h2>
      <p>Creates an HTTP server with endpoints.</p>
      <CodeBlock
        language="js"
        code={`const api = crescent.api_make({
  api_id: 'main',
  port: 3000
});

api.add_endpoint('GET', '/users', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ users: [] }));
});

api.start();`}
      />
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>add_endpoint(method, path, handler)</code></td>
            <td>Registers a route. <code>method</code> is GET, POST, PUT, or DELETE; <code>handler</code> receives Node.js <code>req</code> and <code>res</code></td>
          </tr>
          <tr>
            <td><code>start()</code></td>
            <td>Starts listening on the configured port</td>
          </tr>
        </tbody>
      </table>

      <h2 id="api_call">api_call()</h2>
      <p>Makes an outgoing HTTP request.</p>
      <CodeBlock
        language="js"
        code={`const request = crescent.api_call({
  api_call_id: 'fetch_users',
  url: 'https://api.example.com/users',
  method: 'GET'
});

request.call().then(function (data) {
  console.log(data);
});`}
      />

      <h2 id="db">Database Methods</h2>
      <p>Called on <code>crescent.db</code>. Data is stored in collections.</p>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>create(collection)</code></td>
            <td>Creates a new collection</td>
          </tr>
          <tr>
            <td><code>insert(collection, doc)</code></td>
            <td>Inserts a record and returns it with its <code>_id</code></td>
          </tr>
          <tr>
            <td><code>insert_many(collection, docs)</code></td>
            <td>Inserts multiple records at once</td>
          </tr>
          <tr>
            <td><code>find(collection, query)</code></td>
            <td>Returns all records matching a query</td>
          </tr>
          <tr>
            <td><code>find_one(collection, query)</code></td>
            <td>Returns the first record matching a query</td>
          </tr>
          <tr>
            <td><code>find_by_id(collection, id)</code></td>
            <td>Finds a record by <code>_id</code></td>
          </tr>
          <tr>
            <td><code>update(collection, query, updates)</code></td>
            <td>Updates all records matching a query</td>
          </tr>
          <tr>
            <td><code>update_one(collection, query, updates)</code></td>
            <td>Updates the first record matching a query</td>
          </tr>
          <tr>
            <td><code>delete(collection, query)</code></td>
            <td>Deletes all records matching a query</td>
          </tr>
        </tbody>
      </table>

      <h2 id="auth">Auth Methods</h2>
      <p>Called on <code>crescent.auth</code>.</p>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>signup().register(username, email, password)</code></td>
            <td>Creates a new user account</td>
          </tr>
          <tr>
            <td><code>login().authenticate(username, password)</code></td>
            <td>Validates credentials, returns the user, a session token, and a cookie header</td>
          </tr>
          <tr>
            <td><code>login().verify_session(token)</code></td>
            <td>Verifies a session token</td>
          </tr>
          <tr>
            <td><code>password.hash(password)</code></td>
            <td>Returns <code>{'{ hash, salt }'}</code></td>
          </tr>
          <tr>
            <td><code>password.verify(password, hash, salt)</code></td>
            <td>Checks a password against a stored hash</td>
          </tr>
          <tr>
            <td><code>password.check_strength(password)</code></td>
            <td>Returns a strength score and label</td>
          </tr>
          <tr>
            <td><code>oauth().add_provider(name, config)</code></td>
            <td>Configures an OAuth provider</td>
          </tr>
          <tr>
            <td><code>oauth().get_authorize_url(provider)</code></td>
            <td>Builds the authorization URL for a provider</td>
          </tr>
        </tbody>
      </table>

      <h2 id="page-methods">Page Methods</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>add_object(object)</code></td>
            <td>Adds an object to the page</td>
          </tr>
          <tr>
            <td><code>set_object_position(object_id, x, y)</code></td>
            <td>Sets an object's cartesian position</td>
          </tr>
          <tr>
            <td><code>render()</code></td>
            <td>Renders the page into the DOM</td>
          </tr>
        </tbody>
      </table>

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/backend">Backend Guide</Link> — functions, loops, and APIs in
          action
        </li>
        <li>
          <Link href="/docs/deployment">Deployment Guide</Link> — ship your app
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
