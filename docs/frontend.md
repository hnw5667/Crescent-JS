# Frontend Guide

Build UIs with pages, objects, layers, transitions, and triggers.

---

## Layers

Layers are the visual building blocks. Every visible element is a layer.

### Layer Types

| Type | Description |
|------|-------------|
| `text` | Text content with per-character property overrides |
| `image` | Image display |
| `shape` | Shapes defined by vertices (3=triangle, 4=rectangle, 0=circle) |
| `input` | User input (text box or list) |

### Common Properties (All Layer Types)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `layer_id` | string | required | Unique identifier |
| `layer_type` | string | required | `text`, `image`, `shape`, `input` |
| `layer_enabled` | boolean | `true` | Whether the layer is visible |
| `position` | object | `{ x: 0, y: 0 }` | Cartesian position within parent object |
| `index` | number | `0` | Z-index for stacking (lower = back, higher = front) |
| `rotate` | number/string | `'0deg'` | Rotation (e.g., `45` or `'45deg'`) |
| `opacity` | string | `'100%'` | Opacity as percentage (e.g., `'50%'`) |
| `size` | object | `{ height: 50, width: 50 }` | Dimensions in pixels |
| `colour` | string | `'0,0,0'` | RGB format: `'R,G,B'` or `'R,G,B,A'` |
| `rounded_corners` | string | `'0px'` | Border radius (e.g., `'10px'`) |

### Text Layer

```js
const title = crescent.layer({
  layer_type: 'text',
  layer_id: 'title',
  text: 'Hello World',
  size: 24,                    // font size in px
  colour: '0,0,0',
  bold: false,
  underline: false,
  strike: false,
  highlight: false,
  font: 'sans-serif',          // font family
  spacing: '0px',              // letter spacing
  properties: []               // per-character overrides
});
```

**Per-character property overrides:**

```js
const styled = crescent.layer({
  layer_type: 'text',
  layer_id: 'styled',
  text: "abc'de'fxx",
  size: 16,
  colour: '0,0,0',
  bold: false,
  properties: [
    {
      range: [3, 4],           // override characters at index 3-4 ('de')
      colour: '255,0,0',
      bold: true,
      underline: true,
      size: 20,
      font: 'monospace',
      spacing: { internal: '2px', external: '4px' }  // multi-char: internal + external
    }
  ]
});
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` | string | `''` | Text content |
| `size` | number | `16` | Font size in px |
| `font` | string | `'sans-serif'` | Font family |
| `spacing` | string/number | `'0px'` | Letter spacing |
| `bold` | boolean | `false` | Bold text |
| `underline` | boolean | `false` | Underlined text |
| `strike` | boolean | `false` | Strikethrough text |
| `highlight` | boolean | `false` | Yellow highlight background |
| `properties` | array | `[]` | Per-character style overrides |

### Image Layer

```js
const logo = crescent.layer({
  layer_type: 'image',
  layer_id: 'logo',
  image_location: 'images/logo.png',  // local path or URL
  size: { height: 100, width: 200 },
  colour: '0,0,0',                    // optional colour overlay
  opacity: '100%',
  rounded_corners: '8px',
  rotate: '0deg'
});
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `image_location` | string | `''` | Image path or URL |

### Shape Layer

```js
const box = crescent.layer({
  layer_type: 'shape',
  layer_id: 'box',
  layer_vertices: 4,           // 4 = rectangle
  size: { height: 50, width: 200 },
  colour: '52,152,219',
  rounded_corners: '8px',
  opacity: '100%',
  rotate: '0deg'
});

const circle = crescent.layer({
  layer_type: 'shape',
  layer_id: 'circle',
  layer_vertices: 0,           // 0 or 'circle' = circle/ellipse
  size: { height: 100, width: 100 },
  colour: '231,76,60'
});

const triangle = crescent.layer({
  layer_type: 'shape',
  layer_id: 'tri',
  layer_vertices: 3,           // 3 = triangle
  size: { height: 100, width: 100 },
  colour: '46,204,113'
});
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `layer_vertices` | number/string | `4` | 0/`'circle'` = circle, 3 = triangle, 4 = rectangle, 5+ = polygon |

### Input Layer

#### Text Box Input

```js
const nameInput = crescent.layer({
  layer_type: 'input',
  layer_id: 'name_input',
  input_method: 'text box',
  box_length: 20,                          // character length
  box_inner_text: 'Enter your name...',    // placeholder text
  box_inner_text_properties: ['italic'],   // placeholder style: underline, strike, bold, italic
  box_inner_text_font: 'sans-serif',       // placeholder font
  colour_text: '0,0,0',                   // placeholder text colour
  written_inner_text_properties: [],        // written text style
  written_inner_text_font: 'sans-serif',   // written text font
  colour_text_written: '0,0,0',           // written text colour
  size: { height: 40, width: 300 },
  rounded_corners: '4px'
});
```

#### List Input

```js
const colorPicker = crescent.layer({
  layer_type: 'input',
  layer_id: 'color_picker',
  input_method: 'list',
  select: 'one',                           // 'one', 'more_than_one', or { min: N, max: M }
  list_elements: ['Red', 'Green', 'Blue'],
  colour_text_written: '0,0,0',
  written_inner_text_font: 'sans-serif',
  size: { height: 120, width: 200 },
  rounded_corners: '4px'
});
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `input_method` | string | `'text box'` | `'text box'` or `'list'` |
| `box_length` | number | `20` | Text box character length |
| `box_inner_text` | string | `''` | Placeholder text |
| `box_inner_text_properties` | array | `[]` | Placeholder styles: `underline`, `strike`, `bold`, `italic` |
| `box_inner_text_font` | string | `'sans-serif'` | Placeholder font |
| `colour_text` | string | `'0,0,0'` | Placeholder text colour |
| `written_inner_text_properties` | array | `[]` | Written text styles |
| `written_inner_text_font` | string | `'sans-serif'` | Written text font |
| `colour_text_written` | string | `'0,0,0'` | Written text colour |
| `select` | string/object | `'one'` | `'one'`, `'more_than_one'`, or `{ min: N, max: M }` |
| `list_elements` | array | `[]` | List items for selection |

### Layer Methods

```js
layer.get_value();                // Get current value (input layers)
layer.set_property(name, value);  // Update a property and re-render
layer.render();                   // Generate DOM element
layer.get_element();              // Get the rendered DOM element
```

---

## Objects

Objects are containers that hold layers in a cartesian coordinate system.

### Creating Objects

```js
const card = crescent.object({
  object_id: 'card',
  size: { height: 300, width: 400 },
  bg_layer: 'bg_layer_id',
  layers_config: [titleLayer, logoLayer],
  index_config: { titleLayer: 0, logoLayer: 1 },
  position_config: { titleLayer: { x: -10, y: -2 }, logoLayer: { x: 5, y: 10 } }
});
```

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

### Cartesian Coordinate System

Objects use a cartesian coordinate system where:
- **Center** = `(0, 0)`
- **Positive x** = right, **negative x** = left
- **Positive y** = down, **negative y** = up
- If height is 400, y ranges from -200 to 200
- If width is 300, x ranges from -150 to 150

Layers outside the object bounds are **clipped**.

### Object Config

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `object_id` | string | required | Unique identifier |
| `size` | object | required | `{ height, width }` in pixels |
| `page_position` | object | `{ x: 0, y: 0 }` | Position on the page |
| `page_index` | number | `0` | Z-index on the page |
| `bg_layer` | string/null | `null` | Layer ID for background (fills entire object) |
| `object_enabled` | boolean | `true` | Visibility toggle |
| `layers_config` | array | — | Pre-add layers |
| `index_config` | object | — | Pre-set layer indices |
| `position_config` | object | — | Pre-set layer positions |

### Object Methods

```js
// Add/remove layers
object.add_layer(layer);
object.remove_layer(layer_id);
object.get_layer(layer_id);

// Position layers within the object (cartesian)
object.set_layer_position(layer_id, x, y);
object.set_layer_index(layer_id, zIndex);

// Background layer (fills entire object)
object.set_bg_layer(layer_id);

// Get values from all input layers
object.get_value();

// Get cartesian coordinate range
object.get_cartesian_range();

// Render to DOM
object.render();

// Get the rendered DOM element
object.get_element();

// Update properties
object.set_property(name, value);

// Apply transition
object.set_transition(transition);
```

---

## Pages

Pages are top-level containers that hold objects in a cartesian coordinate system with ratio-based scaling.

### Creating Pages

```js
const page = crescent.page({
  page_id: 'home',
  page_bg: '240,240,240',                    // colour string or layer instance
  page_url: 'www.xyz.com/home',
  page_title: 'Home',
  page_description: 'This is the home of www.xyz.com',
  page_type: 'home',
  size: { height: 800, width: 1200 },
  objects_config: [headerObj, contentObj],
  index_config: { headerObj: 0, contentObj: 1 },
  position_config: { headerObj: { x: -10, y: 0 }, contentObj: { x: -3, y: 3 } },
  scaling_config: {
    headerObj: { height_ratio: [0, 0], width_ratio: [0, 0] },
    contentObj: { height_ratio: [2, 1], width_ratio: [3, 1] }
  }
});
```

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

### Cartesian Coordinate System

Pages use the same cartesian system as objects:
- **Center** = `(0, 0)`
- If height is 800, y ranges from -400 to 400
- If width is 1200, x ranges from -600 to 600

### Ratio-Based Scaling

When the page is created, it gets a height and width. This creates two ratios for each object:
- **height_ratio**: `[top, bottom]` — proportion of space above vs below
- **width_ratio**: `[left, right]` — proportion of space left vs right

If a ratio is `[0, 0]`, the object resizes to fit the screen in that dimension. The `page_bg` layer scales to fill the screen.

### Page Config

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `page_id` | string | required | Unique identifier |
| `page_bg` | string/layer | `'255,255,255'` | Background: colour string or layer instance |
| `page_url` | string | `'/'` | Page URL |
| `page_title` | string | `''` | Page title |
| `page_description` | string | `''` | Meta description |
| `page_type` | string | `'home'` | Page type |
| `size` | object | `{ height: 800, width: 1200 }` | Dimensions in pixels |
| `page_enabled` | boolean | `true` | Visibility toggle |
| `objects_config` | array | — | Pre-add objects |
| `index_config` | object | — | Pre-set object indices `{ id: idx }` |
| `position_config` | object | — | Pre-set object positions `{ id: { x, y } }` |
| `scaling_config` | object | — | Pre-set scaling ratios `{ id: { height_ratio: [t,b], width_ratio: [l,r] } }` |

### Page Methods

```js
// Add/remove objects
page.add_object(object);
page.remove_object(object_id);
page.get_object(object_id);

// Position objects using cartesian coordinates
page.set_object_position(object_id, x, y);
page.set_object_index(object_id, zIndex);

// Set scaling ratios for responsive behavior
page.set_scaling_ratio(object_id, height_ratio, width_ratio);

// Get cartesian coordinate range
page.get_cartesian_range();

// Get all input values from all objects
page.get_values();

// Navigate to another page
page.navigate_to(page_id);

// Render the entire page
page.render();

// Get the rendered DOM element
page.get_element();

// Update properties
page.set_property(name, value);

// Clean up
page.destroy();
```

---

## Transitions

Animate property changes on layers within objects. Transitions import objects, specify a duration, and list property changes.

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
const slideIn = crescent.transition({
  objects: [headerObj, contentObj],
  time: '2s',               // '2s', '45 sec', '1000ms', or ms number
  changes: [
    { object_id: 'header', layer_id: 'title', property: 'size.width', value: 200 },
    { object_id: 'header', layer_id: 'bg', property: 'colour', value: '255,0,0' }
  ]
});

// Play forward
slideIn.play(() => console.log('done'));

// Reverse back to original
slideIn.reverse();

// Stop mid-animation
slideIn.stop();

// Add more changes dynamically
slideIn.add_change('header', 'title', 'opacity', '50%');
slideIn.add_object(anotherObj);
```

---

## Triggers

Triggers respond to user interactions. They are boolean: if true → execute `true_sequence`, if false → execute `false_sequence`.

**Spec format:**

```
if object_ID/name:clicked = true
  then play.transition_property
else
  then play.transition_property_2
```

```js
const clickTrigger = crescent.trigger({
  object_id: 'submitBtn',
  event: 'click',             // 'click', 'hover', 'scroll', 'keypress', 'focus', 'submit'
  condition: (event, object) => true,   // optional condition function
  true_sequence: [
    { type: 'transition', transition: slideIn },
    { type: 'api_call', api_call: myApiCall },
    { type: 'redirect', url: '/success' }
  ],
  false_sequence: [],
  redirect_page: null          // page ID to redirect to on true
});

// Attach to an object
clickTrigger.attach(myObject);

// Add actions dynamically
clickTrigger.on_true({ type: 'redirect', url: '/done' });
clickTrigger.on_false({ type: 'transition', transition: fadeOut });
clickTrigger.set_condition((event, obj) => obj.get_value().checked);
clickTrigger.set_redirect('successPage');
```

---

## Renderer

The renderer manages page rendering, navigation, and SSR.

```js
// Register pages
crescent.renderer.register_page(homePage);
crescent.renderer.register_page(aboutPage);

// Set base HTML (string or file path)
crescent.renderer.basehtml('<html><body><div id="rocket-root"></div></body></html>');

// Define root mount point (default: #rocket-root)
crescent.renderer.root('#app');

// Mount to a DOM container (browser mode)
crescent.renderer.mount(document.getElementById('app'));

// Navigate between pages
crescent.renderer.navigate('home');
crescent.renderer.navigate('about');

// SSR: render full HTML
const html = crescent.renderer.render_full_page('home');

// Get current page
const current = crescent.renderer.get_current_page();
```

---

## Responsive Design

Ratio-based scaling: when the screen size changes, height/width ratios are maintained. If a ratio is `0:0`, the object resizes to fit.

```js
const responsive = crescent.responsive({
  page: homePage,
  breakpoints: [
    { name: 'mobile', maxWidth: 480 },
    { name: 'tablet', maxWidth: 768 },
    { name: 'desktop', maxWidth: 1200 },
    { name: 'large', maxWidth: Infinity }
  ]
});

// Initialize scaling
responsive.init();

// Get current breakpoint
responsive.get_breakpoint();  // 'mobile' | 'tablet' | 'desktop' | 'large'

// Calculate scaling ratios for an object
const ratios = responsive.calculate_ratios(myObject, 1200, 800);
// { height_ratio: [top, bottom], width_ratio: [left, right] }

// Scale an object manually
responsive.scale_object(myObject, 1200, 800, 600, 400);

// Clean up
responsive.destroy();
