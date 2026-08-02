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
        All methods are called on the <code>crescent</code> instance unless noted otherwise.
      </Callout>

      <h2 id="page">page()</h2>
      <p>Creates a new page container.</p>
      <CodeBlock
        language="js"
        code={`crescent.page({
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
  size: { height: 80, width: '100%' },
  position: { x: 0, y: 0 }
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
            <td><code>position</code></td>
            <td>object</td>
            <td>no</td>
            <td>Cartesian <code>{'{ x, y }'}</code></td>
          </tr>
          <tr>
            <td><code>border_radius</code></td>
            <td>number</td>
            <td>no</td>
            <td>Corner radius in px</td>
          </tr>
          <tr>
            <td><code>background_colour</code></td>
            <td>string</td>
            <td>no</td>
            <td>RGB as <code>'r,g,b'</code></td>
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
            <td>Text content (text layers)</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td>number | object</td>
            <td>no</td>
            <td>Font size or <code>{'{ h, w }'}</code></td>
          </tr>
          <tr>
            <td><code>colour</code></td>
            <td>string</td>
            <td>no</td>
            <td>Text colour as <code>'r,g,b'</code></td>
          </tr>
          <tr>
            <td><code>source</code></td>
            <td>string</td>
            <td>no</td>
            <td>Image URL (image layers)</td>
          </tr>
        </tbody>
      </table>

      <h2 id="function">function()</h2>
      <p>Defines a reusable backend function.</p>
      <CodeBlock
        language="js"
        code={`crescent.function({
  function_id: 'add',
  parameters: ['a', 'b'],
  body: function (a, b) {
    return a + b;
  }
});

crescent.call_function('add', [2, 3]); // 5`}
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
            <td><code>parameters</code></td>
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

      <h2 id="api">api()</h2>
      <p>Creates a REST endpoint.</p>
      <CodeBlock
        language="js"
        code={`crescent.api({
  method: 'GET',
  path: '/users',
  handler: function (req, res) {
    return { users: [] };
  }
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
            <td><code>method</code></td>
            <td>string</td>
            <td>yes</td>
            <td>HTTP method: GET, POST, PUT, DELETE</td>
          </tr>
          <tr>
            <td><code>path</code></td>
            <td>string</td>
            <td>yes</td>
            <td>URL path</td>
          </tr>
          <tr>
            <td><code>handler</code></td>
            <td>function</td>
            <td>yes</td>
            <td>Receives <code>req</code>, <code>res</code></td>
          </tr>
        </tbody>
      </table>

      <h2 id="db">Database Methods</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>create_table()</code></td>
            <td>Creates a table with typed columns</td>
          </tr>
          <tr>
            <td><code>create_row()</code></td>
            <td>Inserts a row into a table</td>
          </tr>
          <tr>
            <td><code>get_all_rows()</code></td>
            <td>Returns every row in a table</td>
          </tr>
          <tr>
            <td><code>get_row()</code></td>
            <td>Finds a row with a filter</td>
          </tr>
          <tr>
            <td><code>update_row()</code></td>
            <td>Updates a row by <code>row_id</code></td>
          </tr>
          <tr>
            <td><code>delete_row()</code></td>
            <td>Deletes a row by <code>row_id</code></td>
          </tr>
        </tbody>
      </table>

      <h2 id="auth">Auth Methods</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>signup()</code></td>
            <td>Creates a new user account</td>
          </tr>
          <tr>
            <td><code>login()</code></td>
            <td>Validates credentials and returns the user</td>
          </tr>
          <tr>
            <td><code>password()</code></td>
            <td>Resets a user's password</td>
          </tr>
          <tr>
            <td><code>oauth()</code></td>
            <td>Configures an OAuth provider</td>
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
            <td><code>add_object()</code></td>
            <td>Adds an object to the page</td>
          </tr>
          <tr>
            <td><code>set_object_position()</code></td>
            <td>Sets an object's cartesian position</td>
          </tr>
        </tbody>
      </table>

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/configuration">Configuration Guide</Link> — server and build options
        </li>
        <li>
          <Link href="/docs/deployment">Deployment Guide</Link> — ship your app
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
