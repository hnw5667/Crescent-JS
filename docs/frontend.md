# 🎨 Frontend Module

- **Page** → Full application view  
- **Object (RObject)** → Container (like a `div`)  
- **Layer** → Visual or functional element  

---

## 📦 Classes

| Class | Description |
|-------|-------------|
| Page | Top-level page container |
| Object (RObject) | Component that holds layers |
| BaseLayer | Background, padding, borders |
| TextLayer | Text content with styling |
| ImageLayer | Image display |
| ShapeLayer | Shapes (rectangle, circle) |
| InputLayer | Form inputs |
| Transition | CSS animations |
| Trigger | Event handlers |
| Responsive | Breakpoints |
| Renderer | Render pages to HTML |

---

# 📄 Page

The top-level container for your app.

## Constructor

```javascript
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
Parameters
Parameter	Description
page_bg	Background of the page
page_description	Improves SEO
page_type	Page classification
page_size	Base dimensions
objects	All objects in page
index	Object order
position	Object positions
📐 Ratio-Based Scaling
Page defines base height and width
Maintains position ratios on resize
Elements scale proportionally
0:0 ratio → element stretches
🧩 Object (RObject)

Container for layers.

Constructor
object_ID/name = {
  layers = { layer_ID_1, layer_ID_2 }
  index = { layer_ID_1 = 0, layer_ID_2 = 1 }
  position = { layer_ID_1 = (-10,-2), layer_ID_2 = (5,10) }
  bg_layer = { layer_ID_2 }
  size = {height = n px, width = m px}
}
Parameters
Parameter	Description
layers	All layers
index	Layer order
position	Layer positions
bg_layer	Background layer
size	Object dimensions
🎨 BaseLayer

Foundation layer for visuals.

Parameter	Description
layer_id	Unique ID
layer_type	Type of layer
layer_enabled	Enable/disable
colour	Background color
opacity	Transparency
rounded_corners	Border radius
rotate	Rotation
size	Dimensions
📝 TextLayer

Displays styled text.

Constructor
layer_id/name = {
  layer_type = text
  layer_enabled = true
  .text = "abcdefxx"
  .colour = 0,0,0
  .size = 10
  .spacing = 10 px
  .font = inter
  .strike = true
  .underline = false
  .highlight = true
  .bold = true
  property(abc'de'fxx) = { ... overrides ... }
}
🖼️ ImageLayer

Displays images.

Constructor
layer_id/name = {
  layer_type = image
  layer_enabled = true
  image_location = "url or path"
  .size = height x width
  .colour = 0,0,0
  .opacity = 100%
  .rounded_corners = 10 px
  .rotate = 360 deg
}
🔷 ShapeLayer

Renders shapes.

Constructor
layer_ID/name = {
  layer_type = shape
  layer_enabled = true
  layer_vertices = 4
  .size = height x width
  .colour = 0,0,0
  .opacity = 100%
  .rounded_corners = 10 px
  .rotate = 360 deg
}
⌨️ InputLayer

Handles input fields.

Constructor
layer_id/name = {
  layer_type = input
  layer_enabled = true
  input_method = text box
  .rounded_corners = 10 px
  .box_length = 10
  .box_inner_text = 'Crescent Moon'
  .box_inner_text_properties = [underline, strike, bold, italic]
  .box_inner_text_font = inter
  .colour_text = 0,0,0
  .written_inner_text_properties = [underline, strike, bold, italic]
  .written_inner_text_font = inter
  .colour_text_written = 0,0,0
}
🎬 Transition

Defines animations.

Constructor
transition_property = {
  import object_ID/name
  import object_ID_2/name

  time = 45 sec
  change.object_ID/name.layer_1:width = 100
  change.object_ID_2/name.layer_1:width = 100
}
⚡ Trigger

Handles events.

Constructor
if object_ID/name:clicked = true
  then play.transition_property
else
  then play.transition_property_2
Events
click
hover
scroll
keypress
📱 Responsive

Breakpoints for layouts.

Constructor
const responsive = new Responsive({
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px'
});
🖥️ Renderer

Renders pages to HTML.

Notes
Uses .basehtml
Combines HTML + JS
Final output layer
✅ Complete Example
layer_1 = {
  layer_type = image
  layer_enabled = true
  image_location = "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  .size = 480 x 360
  .opacity = 100%
  .rounded_corners = 10 px
}

object_ID_1 = {
  layers = { layer_1 }
  index = { layer_1 = 0 }
  position = { layer_1 = (-10,-2) }
  size = {height = 670 px, width = 670 px}
}

Page_ID/name = {
  page_bg = 0,0,0
  page_url = www.xyz.com/home
  page_title = xyz
  page_description = this is the home of www.xyz.com
  page_type = home
  page_size = { height: 1080, width: 1080}
  objects = { object_ID_1 }
  index = { object_ID_1 = 0 }
  position = { object_ID_1 = (-10,0) }
}

---
