export default function FrontendPage() {
  return (
    <>
      <h1>Frontend Guide</h1>
      <p>Build UIs with pages, objects, layers, transitions, and triggers.</p>

      <hr />

      <h2>Layers</h2>
      <p>Layers are the visual building blocks. Every visible element is a layer.</p>

      <h3>Layer Types</h3>
      <table>
        <thead>
          <tr><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>text</code></td><td>Text content with per-character property overrides</td></tr>
          <tr><td><code>image</code></td><td>Image display</td></tr>
          <tr><td><code>shape</code></td><td>Shapes defined by vertices (3=triangle, 4=rectangle, 0=circle)</td></tr>
          <tr><td><code>input</code></td><td>User input (text box or list)</td></tr>
        </tbody>
      </table>

      <h3>Common Properties</h3>
      <table>
        <thead>
          <tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>layer_id</code></td><td>string</td><td>required</td><td>Unique identifier</td></tr>
          <tr><td><code>layer_type</code></td><td>string</td><td>required</td><td><code>text</code>, <code>image</code>, <code>shape</code>, <code>input</code></td></tr>
          <tr><td><code>layer_enabled</code></td><td>boolean</td><td><code>true</code></td><td>Visibility</td></tr>
          <tr><td><code>position</code></td><td>object</td><td><code>{'{'} x: 0, y: 0 {'}'}</code></td><td>Cartesian position</td></tr>
          <tr><td><code>index</code></td><td>number</td><td><code>0</code></td><td>Z-index (lower = back)</td></tr>
          <tr><td><code>rotate</code></td><td>number/string</td><td><code>'0deg'</code></td><td>Rotation</td></tr>
          <tr><td><code>opacity</code></td><td>string</td><td><code>'100%'</code></td><td>Opacity percentage</td></tr>
          <tr><td><code>size</code></td><td>object</td><td><code>{'{'} height: 50, width: 50 {'}'}</code></td><td>Dimensions</td></tr>
          <tr><td><code>colour</code></td><td>string</td><td><code>'0,0,0'</code></td><td>RGB: <code>'R,G,B'</code></td></tr>
          <tr><td><code>rounded_corners</code></td><td>string</td><td><code>'0px'</code></td><td>Border radius</td></tr>
        </tbody>
      </table>

      <hr />

      <h2>Text Layer</h2>
      <pre><code>{`const title = crescent.layer({
  layer_type: 'text',
  layer_id: 'title',
  text: 'Hello World',
  size: 24,
  colour: '0,0,0',
  bold: false,
  underline: false,
  strike: false,
  highlight: false,
  font: 'sans-serif',
  spacing: '0px',
  properties: []
});`}</code></pre>

      <p><strong>Per-character overrides:</strong></p>
      <pre><code>{`const styled = crescent.layer({
  layer_type: 'text',
  layer_id: 'styled',
  text: "abc'de'fxx",
  size: 16,
  colour: '0,0,0',
  properties: [
    {
      range: [3, 4],
      colour: '255,0,0',
      bold: true,
      underline: true,
      size: 20,
      font: 'monospace',
      spacing: { internal: '2px', external: '4px' }
    }
  ]
});`}</code></pre>

      <hr />

      <h2>Image Layer</h2>
      <pre><code>{`const logo = crescent.layer({
  layer_type: 'image',
  layer_id: 'logo',
  image_location: 'images/logo.png',
  size: { height: 100, width: 200 }
});`}</code></pre>

      <hr />

      <h2>Shape Layer</h2>
      <pre><code>{`// Rectangle
const box = crescent.layer({
  layer_type: 'shape',
  layer_id: 'box',
  layer_vertices: 4,
  size: { height: 50, width: 200 },
  colour: '52,152,219',
  rounded_corners: '8px'
});

// Circle
const circle = crescent.layer({
  layer_type: 'shape',
  layer_id: 'circle',
  layer_vertices: 0,
  size: { height: 100, width: 100 },
  colour: '231,76,60'
});`}</code></pre>

      <hr />

      <h2>Objects</h2>
      <p>Objects are containers that hold layers in a cartesian coordinate system.</p>
      <pre><code>{`const card = crescent.object({
  object_id: 'card',
  size: { height: 300, width: 400 },
  bg_layer: 'bg_layer_id',
  layers_config: [titleLayer, logoLayer],
  index_config: { titleLayer: 0, logoLayer: 1 },
  position_config: { titleLayer: { x: -10, y: -2 }, logoLayer: { x: 5, y: 10 } }
});`}</code></pre>

      <h3>Cartesian Coordinate System</h3>
      <ul>
        <li>Center = <code>(0, 0)</code></li>
        <li>Positive x = right, negative x = left</li>
        <li>Positive y = down, negative y = up</li>
        <li>Layers outside object bounds are clipped</li>
      </ul>

      <hr />

      <h2>Pages</h2>
      <p>Pages are top-level containers that hold objects with ratio-based scaling.</p>
      <pre><code>{`const page = crescent.page({
  page_id: 'home',
  page_bg: '240,240,240',
  page_url: '/',
  page_title: 'Home',
  page_description: 'Welcome to my app',
  page_type: 'home',
  size: { height: 800, width: 1200 }
});`}</code></pre>

      <hr />

      <h2>Transitions</h2>
      <p>Animate property changes on layers within objects.</p>
      <pre><code>{`const slideIn = crescent.transition({
  objects: [headerObj, contentObj],
  time: '2s',
  changes: [
    { object_id: 'header', layer_id: 'title', property: 'size.width', value: 200 }
  ]
});

slideIn.play(() => console.log('done'));
slideIn.reverse();
slideIn.stop();`}</code></pre>

      <hr />

      <h2>Triggers</h2>
      <p>Respond to user interactions with boolean logic.</p>
      <pre><code>{`const clickTrigger = crescent.trigger({
  object_id: 'submitBtn',
  event: 'click',
  condition: (event, object) => true,
  true_sequence: [
    { type: 'transition', transition: slideIn },
    { type: 'api_call', api_call: myApiCall },
    { type: 'redirect', url: '/success' }
  ],
  false_sequence: [],
  redirect_page: null
});

clickTrigger.attach(myObject);`}</code></pre>

      <hr />

      <h2>Responsive Design</h2>
      <p>Ratio-based scaling maintains object proportions across screen sizes.</p>
      <pre><code>{`const responsive = crescent.responsive({
  page: homePage,
  breakpoints: [
    { name: 'mobile', maxWidth: 480 },
    { name: 'tablet', maxWidth: 768 },
    { name: 'desktop', maxWidth: 1200 },
    { name: 'large', maxWidth: Infinity }
  ]
});

responsive.init();`}</code></pre>
    </>
  );
}