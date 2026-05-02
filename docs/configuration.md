# Configuration Reference

All configuration options for Crescent.js components.

---

## Layer Configuration

### Common (All Layer Types)

```js
{
  layer_id: 'my_layer',       // string, required — unique identifier
  layer_type: 'text',         // 'text' | 'image' | 'shape' | 'input'
  layer_enabled: true,        // boolean — visibility
  position: { x: 0, y: 0 },  // object — cartesian position
  index: 0,                   // number — z-index (lower = back, higher = front)
  rotate: '0deg',            // number | string — rotation in degrees
  opacity: '100%',            // string — opacity as percentage
  size: { height: 50, width: 50 }, // object — dimensions in px
  colour: '0,0,0',           // string — RGB 'R,G,B' or RGBA 'R,G,B,A'
  rounded_corners: '0px'      // string — border radius
}
```

### Text Layer

```js
{
  layer_type: 'text',
  layer_id: 'title',
  text: 'Hello World',              // string — text content
  size: 16,                         // number — font size in px
  font: 'sans-serif',               // string — font family
  spacing: '0px',                   // string | number — letter spacing
  bold: false,                      // boolean — bold text
  underline: false,                 // boolean — underlined text
  strike: false,                    // boolean — strikethrough text
  highlight: false,                 // boolean — yellow highlight
  properties: [                     // array — per-character overrides
    {
      range: [3, 4],               // [start, end] character indices
      colour: '255,0,0',
      bold: true,
      underline: true,
      size: 20,
      font: 'monospace',
      spacing: {                    // object for multi-char: internal + external
        internal: '2px',            // letter-spacing within selection
        external: '4px'             // margin around selection
      }
    }
  ]
}
```

### Image Layer

```js
{
  layer_type: 'image',
  layer_id: 'logo',
  image_location: 'images/logo.png' // string — local path or URL
}
```

### Shape Layer

```js
{
  layer_type: 'shape',
  layer_id: 'box',
  layer_vertices: 4    // number | string — 0/'circle' = circle, 3 = triangle,
                        //   4 = rectangle, 5+ = polygon
}
```

### Input Layer

```js
// Text Box
{
  layer_type: 'input',
  layer_id: 'name_input',
  input_method: 'text box',                    // 'text box' | 'list'
  box_length: 20,                              // number — character length
  box_inner_text: 'Enter your name...',        // string — placeholder
  box_inner_text_properties: ['italic'],       // array — underline, strike, bold, italic
  box_inner_text_font: 'sans-serif',           // string — placeholder font
  colour_text: '0,0,0',                       // string — placeholder text colour
  written_inner_text_properties: [],            // array — written text styles
  written_inner_text_font: 'sans-serif',       // string — written text font
  colour_text_written: '0,0,0'                // string — written text colour
}

// List
{
  layer_type: 'input',
  layer_id: 'picker',
  input_method: 'list',
  select: 'one',                               // 'one' | 'more_than_one' | { min: N, max: M }
  list_elements: ['Red', 'Green', 'Blue'],     // array — selectable items
  colour_text_written: '0,0,0',
  written_inner_text_font: 'sans-serif'
}
```

---

## Object Configuration

**Spec format:**

```
object_ID/name = {
  layers = { layer_ID_1, layer_ID_2 }
  index = { layer_ID_1 = 0, layer_ID_2 = 1 }
  position = { layer_ID_1 = (-10,-2), layer_ID_2 = (5,10) }
  bg_layer = { layer_ID_2 }
  size = { height = n px, width = m px }
}
```

```js
{
  object_id: 'card',                    // string, required
  size: { height: 300, width: 400 },   // object, required — defines cartesian plane
  bg_layer: null,                       // string | null — background layer ID (fills entire object)
  object_enabled: true,                 // boolean — visibility
  layers_config: [],                    // array — pre-add layers
  index_config: {},                     // object — { layer_id: zIndex }
  position_config: {}                   // object — { layer_id: { x, y } }
}
```

---

## Page Configuration

**Spec format:**

```
Page_ID/name = {
  page_bg = layer (or) colour
  page_url = www.xyz.com/home
  page_title = xyz
  page_description = this is the home of www.xyz.com
  page_type = home
  page_size = { height: N, width: M }
  objects = { object_ID_1, object_ID_2 }
  index = { object_ID_1 = 0, object_ID_2 = 1 }
  position = { object_ID_1 = (-10,0), object_ID_2 = (-3,3) }
}
```

```js
{
  page_id: 'home',                      // string, required
  page_bg: '255,255,255',               // string | layer — background colour or layer
  page_url: '/',                         // string — page URL
  page_title: 'Home',                   // string — page title
  page_description: 'Welcome',          // string — meta description
  page_type: 'home',                    // string — page type
  size: { height: 800, width: 1200 },   // object — dimensions in px
  page_enabled: true,                    // boolean — visibility
  objects_config: [],                    // array — pre-add objects
  index_config: {},                      // object — { object_id: zIndex }
  position_config: {},                   // object — { object_id: { x, y } }
  scaling_config: {}                     // object — { object_id: { height_ratio: [t,b], width_ratio: [l,r] } }
}
```

---

## Transition Configuration

**Spec format:**

```
transition_property = {
  import object_ID/name
  import object_ID_2/name
  
  time = 45 sec
  change.object_ID/name.layer_1:width = 100
  change.object_ID_2/name.layer_1:width = 100
}
```

```js
{
  objects: [obj1, obj2],                    // array — objects involved in the transition
  time: '2s',                               // string | number — '2s', '45 sec', '1000ms', or ms number
  changes: [                                // array — property changes to animate
    { object_id: 'header', layer_id: 'title', property: 'size.width', value: 200 },
    { object_id: 'header', layer_id: 'bg', property: 'colour', value: '255,0,0' }
  ]
}
```

---

## Trigger Configuration

**Spec format:**

```
if object_ID/name:clicked = true
  then play.transition_property
else
  then play.transition_property_2
```

```js
{
  object_id: 'card',                       // string, required — object this trigger is attached to
  event: 'click',                          // 'click' | 'hover' | 'scroll' | 'keypress' | 'focus' | 'submit'
  condition: (event, object) => true,      // function | null — condition evaluator
  true_sequence: [],                       // array — actions when condition is true
  false_sequence: [],                      // array — actions when condition is false
  redirect_page: null                      // string | null — page ID to redirect to on true
}
```

---

## Responsive Configuration

Ratio-based scaling: when the screen size changes, height/width ratios are maintained. If a ratio is `0:0`, the object resizes to fit.

```js
{
  page: myPage,               // page | null — page to scale
  breakpoints: [              // array — breakpoint definitions
    { name: 'mobile', maxWidth: 480 },
    { name: 'tablet', maxWidth: 768 },
    { name: 'desktop', maxWidth: 1200 },
    { name: 'large', maxWidth: Infinity }
  ]
}
```

---

## Function Configuration

```js
{
  function_id: 'handler',       // string, required
  params: [],                   // array — parameter names
  body: (args) => { },          // function — the function implementation
  function_enabled: true         // boolean
}
```

---

## Conditional Configuration

```js
{
  conditional_id: 'check',              // string, required
  conditional_enabled: true,            // boolean — whether active
  if: {                                 // object — if branch
    check: () => true,                  // function | any — condition to evaluate
    actions: []                         // array — actions to execute if true
  },
  else_if: [                            // array — else-if branches
    {
      check: () => false,              // function | any
      actions: []                       // array
    }
  ],
  else: {                               // object — else branch
    actions: []                         // array — actions when no condition matches
  }
}
```

---

## Loop Configuration

```js
{
  loop_id: 'iterate',           // string, required
  loop_type: 'for',             // 'for' | 'while' | 'for_in'
  start: 0,                     // number (for)
  end: 10,                      // number (for)
  step: 1,                      // number (for)
  condition: () => true,        // function | any (while)
  iterable: [],                 // array (for_in)
  actions: [],                  // array
  loop_enabled: true            // boolean
}
```

---

## Boolean Configuration

```js
{
  boolean_id: 'flag',           // string, required
  value1: true,                 // any
  value2: false,                // any
  operator: 'AND'               // 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR'
}
```

---

## API Call Configuration

```js
{
  api_call_id: 'fetchData',     // string, required
  url: 'https://api.example.com', // string
  method: 'GET',                 // string
  headers: {},                   // object
  body: null,                    // any
  timeout: 30000                 // number — ms
}
```

---

## API Server Configuration

```js
{
  api_id: 'myApi',              // string, required
  port: 3000,                   // number
  host: 'localhost',            // string
  cors: true                    // boolean
}
```

---

## Collect Configuration

```js
{
  collect_id: 'formData',       // string, required
  sources: [],                  // array
  transform: (data) => data,    // function
  validate: (data) => true      // function
}