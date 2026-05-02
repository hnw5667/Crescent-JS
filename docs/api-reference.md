# API Reference

Complete method documentation for Crescent.js.

---

## Core Instance

Crescent.js exports a singleton instance by default:

```js
const crescent = require('crescent-js');
```

---

## Frontend API

### `crescent.layer(config)`

Create a visual layer. Returns a layer instance.

**Common Properties (All Types):**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.layer_type` | string | required | `text`, `image`, `shape`, `input` |
| `config.layer_id` | string | required | Unique identifier |
| `config.layer_enabled` | boolean | `true` | Whether layer is visible |
| `config.position` | object | `{ x: 0, y: 0 }` | Cartesian position |
| `config.index` | number | `0` | Z-index (lower = back, higher = front) |
| `config.rotate` | number/string | `'0deg'` | Rotation in degrees |
| `config.opacity` | string | `'100%'` | Opacity as percentage |
| `config.size` | object | `{ height: 50, width: 50 }` | Dimensions |
| `config.colour` | string | `'0,0,0'` | RGB: `'R,G,B'` or `'R,G,B,A'` |
| `config.rounded_corners` | string | `'0px'` | Border radius |

**Text-specific:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | string | `''` | Text content |
| `size` | number | `16` | Font size in px |
| `font` | string | `'sans-serif'` | Font family |
| `spacing` | string/number | `'0px'` | Letter spacing |
| `bold` | boolean | `false` | Bold text |
| `underline` | boolean | `false` | Underlined text |
| `strike` | boolean | `false` | Strikethrough text |
| `highlight` | boolean | `false` | Yellow highlight |
| `properties` | array | `[]` | Per-character overrides: `[{ range: [start, end], ...overrides }]` |

**Image-specific:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `image_location` | string | `''` | Image path or URL |

**Shape-specific:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `layer_vertices` | number/string | `4` | 0/`'circle'` = circle, 3 = triangle, 4 = rectangle, 5+ = polygon |

**Input-specific:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `input_method` | string | `'text box'` | `'text box'` or `'list'` |
| `box_length` | number | `20` | Text box character length |
| `box_inner_text` | string | `''` | Placeholder text |
| `box_inner_text_properties` | array | `[]` | Placeholder styles: `underline`, `strike`, `bold`, `italic` |
| `box_inner_text_font` | string | `'sans-serif'` | Placeholder font |
| `colour_text` | string | `'0,0,0'` | Placeholder text colour |
| `written_inner_text_properties` | array | `[]` | Written text styles |
| `written_inner_text_font` | string | `'sans-serif'` | Written text font |
| `colour_text_written` | string | `'0,0,0'` | Written text colour |
| `select` | string/object | `'one'` | `'one'`, `'more_than_one'`, or `{ min, max }` |
| `list_elements` | array | `[]` | List items for selection |

**Layer Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `get_value()` | any | Get current value (input layers) |
| `set_property(name, value)` | void | Update a property and re-render |
| `render()` | HTMLElement | Generate DOM element |
| `get_element()` | HTMLElement | Get rendered DOM element |

---

### `crescent.object(config)`

Create an object container. Returns a `RocketObject` instance.

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

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.object_id` | string | required | Unique identifier |
| `config.size` | object | required | `{ height, width }` in pixels |
| `config.page_position` | object | `{ x: 0, y: 0 }` | Position on the page |
| `config.page_index` | number | `0` | Z-index on the page |
| `config.bg_layer` | string/null | `null` | Background layer ID |
| `config.object_enabled` | boolean | `true` | Visibility toggle |
| `config.layers_config` | array | — | Pre-add layers |
| `config.index_config` | object | — | Pre-set layer indices `{ id: idx }` |
| `config.position_config` | object | — | Pre-set layer positions `{ id: { x, y } }` |

**Object Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `add_layer(layer)` | this | Add a layer |
| `remove_layer(layer_id)` | this | Remove a layer |
| `get_layer(layer_id)` | layer/null | Get a layer by ID |
| `set_layer_position(id, x, y)` | this | Position a layer (cartesian) |
| `set_layer_index(id, idx)` | this | Set layer z-index |
| `set_bg_layer(layer_id)` | this | Set background layer (fills entire object) |
| `get_value()` | object | Get all input layer values |
| `get_cartesian_range()` | object | Get coordinate bounds `{ x: { min, max }, y: { min, max } }` |
| `render()` | HTMLElement | Render to DOM |
| `set_property(name, value)` | void | Update a property |
| `set_transition(transition)` | this | Apply a transition |
| `get_element()` | HTMLElement | Get rendered DOM element |

---

### `crescent.page(config)`

Create a page. Returns a `RocketPage` instance.

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

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.page_id` | string | required | Unique identifier |
| `config.page_bg` | string/layer | `'255,255,255'` | Background: colour string or layer |
| `config.page_url` | string | `'/'` | Page URL |
| `config.page_title` | string | `''` | Page title |
| `config.page_description` | string | `''` | Meta description |
| `config.page_type` | string | `'home'` | Page type |
| `config.size` | object | `{ height: 800, width: 1200 }` | Dimensions |
| `config.page_enabled` | boolean | `true` | Visibility toggle |
| `config.objects_config` | array | — | Pre-add objects |
| `config.index_config` | object | — | Pre-set object indices `{ id: idx }` |
| `config.position_config` | object | — | Pre-set object positions `{ id: { x, y } }` |
| `config.scaling_config` | object | — | Pre-set scaling ratios `{ id: { height_ratio: [t,b], width_ratio: [l,r] } }` |

**Page Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `add_object(object)` | this | Add an object |
| `remove_object(object_id)` | this | Remove an object |
| `get_object(object_id)` | object/null | Get an object |
| `set_object_position(id, x, y)` | this | Position an object (cartesian) |
| `set_object_index(id, idx)` | this | Set object z-index |
| `set_scaling_ratio(id, h_ratio, w_ratio)` | this | Set responsive scaling ratios |
| `get_cartesian_range()` | object | Get coordinate bounds |
| `get_values()` | object | Get all input values from all objects |
| `navigate_to(page_id)` | void | Navigate to another page |
| `render()` | HTMLElement | Render entire page |
| `get_element()` | HTMLElement | Get rendered DOM element |
| `set_property(name, value)` | void | Update a property |
| `destroy()` | void | Clean up resize observer |

---

### `crescent.transition(config)`

Create a transition animation. Animates property changes on layers within objects.

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

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.objects` | array | `[]` | Objects involved in the transition |
| `config.time` | string/number | `'0.3s'` | Duration: `'2s'`, `'45 sec'`, `'1000ms'`, or ms number |
| `config.changes` | array | `[]` | Property changes: `[{ object_id, layer_id, property, value }]` |

**Transition Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `play(onComplete)` | this | Play the transition forward |
| `reverse(onComplete)` | this | Reverse the transition back to original |
| `stop()` | this | Stop the animation |
| `is_playing()` | boolean | Check if currently playing |
| `add_change(object_id, layer_id, property, value)` | this | Add a property change |
| `add_object(object)` | this | Add an object to the transition |

---

### `crescent.trigger(config)`

Create an event trigger. Triggers are boolean: if true → execute `true_sequence`, if false → execute `false_sequence`.

**Spec format:**

```
if object_ID/name:clicked = true
  then play.transition_property
else
  then play.transition_property_2
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.object_id` | string | required | Object this trigger is attached to |
| `config.event` | string | `'click'` | Event type: `click`, `hover`, `scroll`, `keypress`, `focus`, `submit` |
| `config.condition` | function | `null` | Condition function `(event, object) => boolean` |
| `config.true_sequence` | array | `[]` | Actions when condition is true |
| `config.false_sequence` | array | `[]` | Actions when condition is false |
| `config.redirect_page` | string/null | `null` | Page ID to redirect to on true |

**Trigger Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `attach(object)` | this | Attach trigger to an object's DOM element |
| `detach()` | this | Detach trigger from its object |
| `on_true(action)` | this | Add action to true sequence |
| `on_false(action)` | this | Add action to false sequence |
| `set_condition(fn)` | this | Set condition function |
| `set_redirect(page_id)` | this | Set redirect page |

---

### `crescent.renderer`

Access the `RocketRenderer` instance. Manages page rendering, navigation, and SSR.

**Renderer Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `register_page(page)` | this | Register a page for rendering |
| `basehtml(htmlOrPath)` | this | Set base HTML string or file path |
| `root(selector)` | this | Define root mount point inside base HTML (default `#rocket-root`) |
| `mount(container)` | this | Mount to a DOM container (browser mode) |
| `navigate(page_id)` | this | Navigate to a registered page |
| `render_full_page(page_id)` | string | SSR: render full HTML with base HTML |
| `get_current_page()` | page/null | Get the currently displayed page |
| `get_page(page_id)` | page/null | Get a registered page by ID |

---

### `crescent.responsive(config)`

Configure responsive ratio-based scaling for pages and objects. When the screen size changes, height/width ratios are maintained. If a ratio is `0:0`, the object resizes to fit the screen in that dimension.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.page` | page/null | `null` | Page to scale |
| `config.breakpoints` | array | (see below) | Breakpoint definitions |

**Default breakpoints:** `[{ name: 'mobile', maxWidth: 480 }, { name: 'tablet', maxWidth: 768 }, { name: 'desktop', maxWidth: 1200 }, { name: 'large', maxWidth: Infinity }]`

**Responsive Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `init(page)` | this | Initialize responsive scaling for a page |
| `get_breakpoint()` | string | Get current breakpoint name |
| `calculate_ratios(object, vw, vh)` | object | Calculate scaling ratios: `{ height_ratio: [top, bottom], width_ratio: [left, right] }` |
| `scale_object(object, origW, origH, newW, newH)` | void | Apply scaling to an object |
| `destroy()` | void | Remove resize listener |

---

## Database API

### `crescent.db`

Access the `DatabaseSyntax` instance. Provides a clean API for CRUD operations.

**Database Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `create(collection, schema)` | this | Create a new collection |
| `drop(collection)` | this | Drop a collection |
| `insert(collection, document)` | document | Insert a document |
| `insert_many(collection, documents)` | array | Insert multiple documents |
| `find(collection, query)` | array | Find documents matching query |
| `find_one(collection, query)` | document/null | Find one document |
| `find_by_id(collection, id)` | document/null | Find document by `_id` |
| `update(collection, query, updates)` | number | Update matching documents |
| `update_one(collection, query, updates)` | number | Update one matching document |
| `delete(collection, query)` | number | Delete matching documents |
| `delete_one(collection, query)` | number | Delete one matching document |
| `count(collection, query)` | number | Count documents |
| `sort(collection, query, field, order)` | array | Sort documents (`'asc'`/`'desc'`) |
| `limit(collection, query, num)` | array | Limit results |
| `list_collections()` | array | List all collections |
| `exists(collection)` | boolean | Check if collection exists |

---

## Backend API

### `crescent.function(config)`

Create a server-side function.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.function_id` | string | required | Unique identifier |
| `config.params` | array | `[]` | Parameter names |
| `config.body` | function | `function() {}` | The function implementation |
| `config.function_enabled` | boolean | `true` | Whether active |

**Methods:** `call(...args)`, `set_body(fn)`, `set_enabled(bool)`, `get_params()`

---

### `crescent.conditional(config)`

Create a conditional with if / else-if / else branches.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.conditional_id` | string | required | Unique identifier |
| `config.conditional_enabled` | boolean | `true` | Whether active |
| `config.if` | object | `{ check: false, actions: [] }` | If branch: `{ check, actions }` |
| `config.else_if` | array | `[]` | Array of `{ check, actions }` branches |
| `config.else` | object | `{ actions: [] }` | Else branch: `{ actions }` |

**Methods:** `evaluate()`, `set_if(check, actions)`, `add_else_if(check, actions)`, `set_else(actions)`

---

### `crescent.loop(config)`

Create a loop.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.loop_id` | string | required | Unique identifier |
| `config.loop_type` | string | — | `for`, `while`, `for_in` |
| `config.start` | number | — | Start (for) |
| `config.end` | number | — | End (for) |
| `config.step` | number | — | Step (for) |
| `config.condition` | function/any | — | Condition (while) |
| `config.iterable` | array | — | Items (for_in) |
| `config.actions` | array | — | Actions per iteration |
| `config.loop_enabled` | boolean | `true` | Whether active |

**Methods:** `run()`, `get_results()`

---

### `crescent.boolean(config)`

Create a boolean evaluator.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.boolean_id` | string | required | Unique identifier |
| `config.value1` | any | — | First value |
| `config.value2` | any | — | Second value |
| `config.operator` | string | — | `AND`, `OR`, `NOT`, `XOR`, `NAND`, `NOR` |

**Methods:** `evaluate()`, `and(other)`, `or(other)`, `not()`

---

### `crescent.api_call(config)`

Create an HTTP client.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.api_call_id` | string | required | Unique identifier |
| `config.url` | string | — | Request URL |
| `config.method` | string | `'GET'` | HTTP method |
| `config.headers` | object | — | Request headers |
| `config.body` | any | — | Request body |
| `config.timeout` | number | `30000` | Timeout in ms |

**Methods:** `call()`, `get_response()`, `get_error()`

---

### `crescent.api_make(config)`

Create a REST API server.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.api_id` | string | required | Unique identifier |
| `config.port` | number | `3000` | Port |
| `config.host` | string | `'localhost'` | Hostname |
| `config.cors` | boolean | `true` | Enable CORS |

**Methods:** `add_endpoint(method, path, handler)`, `use(middleware)`, `start()`, `stop()`

---

### `crescent.collect(config)`

Create a data collector.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.collect_id` | string | required | Unique identifier |
| `config.sources` | array | — | Data sources |
| `config.transform` | function | — | Transform function |
| `config.validate` | function | — | Validation function |

**Methods:** `collect()`, `add_source(source)`, `set_transform(fn)`, `set_validate(fn)`, `send(url, options)`, `get_data()`

---

## Utility Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `crescent.print(value)` | any | Log and return value |
| `crescent.add(a, b)` | number | Addition |
| `crescent.subtract(a, b)` | number | Subtraction |
| `crescent.multiply(a, b)` | number | Multiplication |
| `crescent.divide(a, b)` | number | Division (throws on /0) |
| `crescent.sqrt(n)` | number | Square root |
| `crescent.sin(n)` | number | Sine |
| `crescent.cos(n)` | number | Cosine |
| `crescent.tan(n)` | number | Tangent |
| `crescent.get_timestamp()` | number | Current timestamp |
| `crescent.redirect(url)` | void | Browser redirect |
| `crescent.connect_and_pull(url, options)` | Promise | Fetch JSON |

---

## Getters

| Method | Returns | Description |
|--------|---------|-------------|
| `crescent.db` | DatabaseSyntax | Database instance |
| `crescent.renderer` | Renderer | Renderer instance |
| `crescent.get_page(id)` | Page/null | Get page by ID |
| `crescent.get_object(id)` | Object/null | Get object by ID |
| `crescent.get_layer(id)` | Layer/null | Get layer by ID |
| `crescent.get_function(id)` | Function/null | Get function by ID |
| `crescent.get_transition(id)` | Transition/null | Get transition by ID |
| `crescent.get_trigger(id)` | Trigger/null | Get trigger by ID |
| `crescent.get_conditional(id)` | Conditional/null | Get conditional by ID |
| `crescent.get_loop(id)` | Loop/null | Get loop by ID |
| `crescent.get_boolean(id)` | Boolean/null | Get boolean by ID |
| `crescent.get_api(id)` | ApiMake/null | Get API by ID |