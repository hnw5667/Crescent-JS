export default function ConfigurationPage() {
  return (
    <>
      <h1>Configuration Reference</h1>
      <p>All configuration options for Crescent.js components.</p>

      <hr />

      <h2>Layer Configuration</h2>

      <h3>Common (All Types)</h3>
      <pre><code>{`{
  layer_id: 'my_layer',
  layer_type: 'text',        // 'text' | 'image' | 'shape' | 'input'
  layer_enabled: true,
  position: { x: 0, y: 0 },
  index: 0,
  rotate: '0deg',
  opacity: '100%',
  size: { height: 50, width: 50 },
  colour: '0,0,0',
  rounded_corners: '0px'
}`}</code></pre>

      <h3>Text Layer</h3>
      <pre><code>{`{
  layer_type: 'text',
  layer_id: 'title',
  text: 'Hello World',
  size: 16,
  font: 'sans-serif',
  spacing: '0px',
  bold: false,
  underline: false,
  strike: false,
  highlight: false,
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
}`}</code></pre>

      <h3>Image Layer</h3>
      <pre><code>{`{
  layer_type: 'image',
  layer_id: 'logo',
  image_location: 'images/logo.png'
}`}</code></pre>

      <h3>Shape Layer</h3>
      <pre><code>{`{
  layer_type: 'shape',
  layer_id: 'box',
  layer_vertices: 4
}`}</code></pre>

      <h3>Input Layer — Text Box</h3>
      <pre><code>{`{
  layer_type: 'input',
  layer_id: 'name',
  input_method: 'text box',
  box_length: 20,
  box_inner_text: 'Enter your name...',
  box_inner_text_properties: ['italic'],
  box_inner_text_font: 'sans-serif',
  colour_text: '0,0,0',
  written_inner_text_properties: [],
  written_inner_text_font: 'sans-serif',
  colour_text_written: '0,0,0'
}`}</code></pre>

      <h3>Input Layer — List</h3>
      <pre><code>{`{
  layer_type: 'input',
  layer_id: 'picker',
  input_method: 'list',
  select: 'one',         // 'one' | 'more_than_one' | { min, max }
  list_elements: ['Red', 'Green', 'Blue'],
  colour_text_written: '0,0,0',
  written_inner_text_font: 'sans-serif'
}`}</code></pre>

      <hr />

      <h2>Object Configuration</h2>
      <pre><code>{`{
  object_id: 'card',
  size: { height: 300, width: 400 },
  bg_layer: null,
  object_enabled: true,
  layers_config: [],
  index_config: {},
  position_config: {}
}`}</code></pre>

      <hr />

      <h2>Page Configuration</h2>
      <pre><code>{`{
  page_id: 'home',
  page_bg: '255,255,255',
  page_url: '/',
  page_title: 'Home',
  page_description: 'Welcome',
  page_type: 'home',
  size: { height: 800, width: 1200 },
  page_enabled: true,
  objects_config: [],
  index_config: {},
  position_config: {},
  scaling_config: {}
}`}</code></pre>

      <hr />

      <h2>Transition Configuration</h2>
      <pre><code>{`{
  objects: [obj1, obj2],
  time: '2s',
  changes: [
    { object_id: 'header', layer_id: 'title', property: 'size.width', value: 200 },
    { object_id: 'header', layer_id: 'bg', property: 'colour', value: '255,0,0' }
  ]
}`}</code></pre>

      <hr />

      <h2>Trigger Configuration</h2>
      <pre><code>{`{
  object_id: 'card',
  event: 'click',
  condition: (event, object) => true,
  true_sequence: [],
  false_sequence: [],
  redirect_page: null
}`}</code></pre>

      <hr />

      <h2>Function Configuration</h2>
      <pre><code>{`{
  function_id: 'handler',
  params: [],
  body: (args) => { },
  function_enabled: true
}`}</code></pre>

      <hr />

      <h2>Conditional Configuration</h2>
      <pre><code>{`{
  conditional_id: 'check',
  conditional_enabled: true,
  if: { check: () => true, actions: [] },
  else_if: [{ check: () => false, actions: [] }],
  else: { actions: [] }
}`}</code></pre>

      <hr />

      <h2>Loop Configuration</h2>
      <pre><code>{`{
  loop_id: 'iterate',
  loop_type: 'for',
  start: 0,
  end: 10,
  step: 1,
  loop_enabled: true
}`}</code></pre>

      <hr />

      <h2>API Call Configuration</h2>
      <pre><code>{`{
  api_call_id: 'fetchData',
  url: 'https://api.example.com',
  method: 'GET',
  headers: {},
  body: null,
  timeout: 30000
}`}</code></pre>

      <hr />

      <h2>API Server Configuration</h2>
      <pre><code>{`{
  api_id: 'myApi',
  port: 3000,
  host: 'localhost',
  cors: true
}`}</code></pre>
    </>
  );
}