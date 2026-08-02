export default function ApiReferencePage() {
  return (
    <>
      <h1>API Reference</h1>
      <p>Complete method documentation for Crescent.js. Access via <code>const crescent = require('crescent-js');</code></p>

      <hr />

      <h2>Frontend API</h2>

      <h3>crescent.layer(config)</h3>
      <p>Create a visual layer. Returns a layer instance.</p>

      <table>
        <thead>
          <tr><th>Param</th><th>Type</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>layer_type</code></td><td>string</td><td>required</td><td><code>text</code>, <code>image</code>, <code>shape</code>, <code>input</code></td></tr>
          <tr><td><code>layer_id</code></td><td>string</td><td>required</td><td>Unique identifier</td></tr>
          <tr><td><code>layer_enabled</code></td><td>boolean</td><td><code>true</code></td><td>Visibility</td></tr>
          <tr><td><code>position</code></td><td>object</td><td><code> {'{'} x: 0, y: 0 {'}'}</code></td><td>Cartesian position</td></tr>
          <tr><td><code>index</code></td><td>number</td><td><code>0</code></td><td>Z-index</td></tr>
          <tr><td><code>rotate</code></td><td>number/string</td><td><code>'0deg'</code></td><td>Rotation</td></tr>
          <tr><td><code>opacity</code></td><td>string</td><td><code>'100%'</code></td><td>Opacity</td></tr>
          <tr><td><code>size</code></td><td>object</td><td><code>{'{'} height: 50, width: 50{'}'}</code></td><td>Dimensions</td></tr>
          <tr><td><code>colour</code></td><td>string</td><td><code>'0,0,0'</code></td><td>RGB colour</td></tr>
        </tbody>
      </table>

      <p><strong>Layer Methods:</strong> <code>get_value()</code>, <code>set_property(name, value)</code>, <code>render()</code>, <code>get_element()</code></p>

      <hr />

      <h3>crescent.object(config)</h3>
      <table>
        <thead>
          <tr><th>Param</th><th>Type</th><th>Default</th></tr>
        </thead>
        <tbody>
          <tr><td><code>object_id</code></td><td>string</td><td>required</td></tr>
          <tr><td><code>size</code></td><td>object</td><td>required</td></tr>
          <tr><td><code>bg_layer</code></td><td>string</td><td><code>null</code></td></tr>
          <tr><td><code>object_enabled</code></td><td>boolean</td><td><code>true</code></td></tr>
          <tr><td><code>layers_config</code></td><td>array</td><td>—</td></tr>
          <tr><td><code>index_config</code></td><td>object</td><td>—</td></tr>
          <tr><td><code>position_config</code></td><td>object</td><td>—</td></tr>
        </tbody>
      </table>

      <p><strong>Methods:</strong> <code>add_layer(layer)</code>, <code>remove_layer(id)</code>, <code>get_layer(id)</code>, <code>set_layer_position(id, x, y)</code>, <code>set_layer_index(id, idx)</code>, <code>set_bg_layer(id)</code>, <code>get_value()</code>, <code>render()</code>, <code>set_transition(t)</code></p>

      <hr />

      <h3>crescent.page(config)</h3>
      <table>
        <thead>
          <tr><th>Param</th><th>Type</th><th>Default</th></tr>
        </thead>
        <tbody>
          <tr><td><code>page_id</code></td><td>string</td><td>required</td></tr>
          <tr><td><code>page_bg</code></td><td>string/layer</td><td><code>'255,255,255'</code></td></tr>
          <tr><td><code>page_url</code></td><td>string</td><td><code>'/'</code></td></tr>
          <tr><td><code>page_title</code></td><td>string</td><td><code>''</code></td></tr>
          <tr><td><code>page_description</code></td><td>string</td><td><code>''</code></td></tr>
          <tr><td><code>size</code></td><td>object</td><td><code>{'{'} height: 800, width: 1200{'}'}</code></td></tr>
          <tr><td><code>scaling_config</code></td><td>object</td><td>—</td></tr>
        </tbody>
      </table>

      <p><strong>Methods:</strong> <code>add_object(obj)</code>, <code>remove_object(id)</code>, <code>set_object_position(id, x, y)</code>, <code>set_object_index(id, idx)</code>, <code>set_scaling_ratio(id, h, w)</code>, <code>get_values()</code>, <code>navigate_to(id)</code>, <code>render()</code>, <code>destroy()</code></p>

      <hr />

      <h3>crescent.transition(config)</h3>
      <table>
        <thead>
          <tr><th>Param</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>objects</code></td><td>array</td><td>Objects involved</td></tr>
          <tr><td><code>time</code></td><td>string/number</td><td>Duration</td></tr>
          <tr><td><code>changes</code></td><td>array</td><td>Property changes</td></tr>
        </tbody>
      </table>

      <p><strong>Methods:</strong> <code>play(onComplete)</code>, <code>reverse(onComplete)</code>, <code>stop()</code>, <code>add_change(obj, layer, prop, val)</code>, <code>add_object(obj)</code></p>

      <hr />

      <h3>crescent.trigger(config)</h3>
      <table>
        <thead>
          <tr><th>Param</th><th>Type</th></tr>
        </thead>
        <tbody>
          <tr><td><code>object_id</code></td><td>string</td></tr>
          <tr><td><code>event</code></td><td><code>'click'</code> | <code>'hover'</code> | <code>'scroll'</code> | <code>'keypress'</code> | <code>'focus'</code> | <code>'submit'</code></td></tr>
          <tr><td><code>condition</code></td><td>function</td></tr>
          <tr><td><code>true_sequence</code></td><td>array</td></tr>
          <tr><td><code>false_sequence</code></td><td>array</td></tr>
        </tbody>
      </table>

      <hr />

      <h2>Database API</h2>

      <h3>crescent.db</h3>
      <table>
        <thead>
          <tr><th>Method</th><th>Returns</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>create(collection)</code></td><td>this</td><td>Create collection</td></tr>
          <tr><td><code>drop(collection)</code></td><td>this</td><td>Drop collection</td></tr>
          <tr><td><code>insert(collection, doc)</code></td><td>document</td><td>Insert document</td></tr>
          <tr><td><code>insert_many(collection, docs)</code></td><td>array</td><td>Batch insert</td></tr>
          <tr><td><code>find(collection, query?)</code></td><td>array</td><td>Find documents</td></tr>
          <tr><td><code>find_one(collection, query)</code></td><td>document</td><td>Find one</td></tr>
          <tr><td><code>find_by_id(collection, id)</code></td><td>document</td><td>Find by _id</td></tr>
          <tr><td><code>update(collection, query, updates)</code></td><td>number</td><td>Update many</td></tr>
          <tr><td><code>update_one(collection, query, updates)</code></td><td>number</td><td>Update one</td></tr>
          <tr><td><code>delete(collection, query)</code></td><td>number</td><td>Delete many</td></tr>
          <tr><td><code>delete_one(collection, query)</code></td><td>number</td><td>Delete one</td></tr>
          <tr><td><code>count(collection, query?)</code></td><td>number</td><td>Count documents</td></tr>
          <tr><td><code>sort(collection, query, field, order)</code></td><td>array</td><td>Sort by field</td></tr>
          <tr><td><code>limit(collection, query, n)</code></td><td>array</td><td>Limit results</td></tr>
        </tbody>
      </table>

      <hr />

      <h2>Backend API</h2>

      <h3>crescent.function(config)</h3>
      <p><strong>Methods:</strong> <code>call(...args)</code>, <code>set_body(fn)</code>, <code>set_enabled(bool)</code>, <code>get_params()</code></p>

      <h3>crescent.conditional(config)</h3>
      <p><strong>Methods:</strong> <code>evaluate()</code>, <code>set_if(check, actions)</code>, <code>add_else_if(check, actions)</code>, <code>set_else(actions)</code></p>

      <h3>crescent.loop(config)</h3>
      <p><strong>Methods:</strong> <code>run()</code>, <code>get_results()</code></p>

      <h3>crescent.boolean(config)</h3>
      <p><strong>Methods:</strong> <code>evaluate()</code>, <code>and(other)</code>, <code>or(other)</code>, <code>not()</code></p>

      <h3>crescent.api_call(config)</h3>
      <p><strong>Methods:</strong> <code>call()</code>, <code>get_response()</code>, <code>get_error()</code></p>

      <h3>crescent.api_make(config)</h3>
      <p><strong>Methods:</strong> <code>add_endpoint(method, path, handler)</code>, <code>use(middleware)</code>, <code>start()</code>, <code>stop()</code></p>

      <hr />

      <h2>Utility Functions</h2>
      <table>
        <thead>
          <tr><th>Function</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>crescent.print(value)</code></td><td>Log and return value</td></tr>
          <tr><td><code>crescent.add(a, b)</code></td><td>Addition</td></tr>
          <tr><td><code>crescent.subtract(a, b)</code></td><td>Subtraction</td></tr>
          <tr><td><code>crescent.multiply(a, b)</code></td><td>Multiplication</td></tr>
          <tr><td><code>crescent.divide(a, b)</code></td><td>Division</td></tr>
          <tr><td><code>crescent.sqrt(n)</code></td><td>Square root</td></tr>
          <tr><td><code>crescent.sin(n)</code></td><td>Sine</td></tr>
          <tr><td><code>crescent.cos(n)</code></td><td>Cosine</td></tr>
          <tr><td><code>crescent.tan(n)</code></td><td>Tangent</td></tr>
          <tr><td><code>crescent.get_timestamp()</code></td><td>Current timestamp</td></tr>
          <tr><td><code>crescent.redirect(url)</code></td><td>Browser redirect</td></tr>
          <tr><td><code>crescent.connect_and_pull(url, options)</code></td><td>Fetch JSON</td></tr>
        </tbody>
      </table>
    </>
  );
}