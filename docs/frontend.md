# 🎨 Frontend Module

Access: `Crescent.Frontend`

The Frontend module provides a component-based UI system. You build pages with objects, add layers for styling and content, and render everything to HTML.

---

## Classes

| Class | Description |
|-------|-------------|
| [Page](#page) | Top-level page container |
| [Object (RObject)](#object-robject) | Component that holds layers |
| [BaseLayer](#baselayer) | Background, padding, borders |
| [TextLayer](#textlayer) | Text content with tag and styling |
| [ImageLayer](#imagelayer) | Image display |
| [ShapeLayer](#shapelayer) | Shapes (rectangle, circle) |
| [InputLayer](#inputlayer) | Form inputs |
| [Transition](#transition) | CSS animations |
| [Trigger](#trigger) | Event handlers |
| [Responsive](#responsive) | Responsive breakpoints |
| [Renderer](#renderer) | Render pages to HTML |

---

## Page

The top-level container for your app. Holds all Objects and renders the full HTML page.

### Constructor

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
```

| Parameter |Description |
|-----------|-------------------|
| `page_bg`| The Backround of a page |
| `page_description` | The description of a page. Increases SEO optimisation |
| `page_type` | The type of page it is . Acts Like robot.txt and SEO Optimisation at once |
| `page_size` | The size of a page. This will change as scaled |
| `objects` | These are all the objects in a page |
| `index` | The index of all the objects in a page |
| `position` | The Position of all the objects in a page . Will be moved to fit scaling |

### * Ratio-based scaling:
 - When the page is created, it gets a height and width
 - This creates two ratios: "height from top : height from bottom" and "width from left : width from right"
 - When the screen size changes, these ratios are maintained
 - If a ratio is 0:0, the object resizes to fit the screen in that ratio
 - The bg layer scales to fill the screen
 - Object layers scale using the same ratio method

---

## Object (RObject)

A component that holds layers. Think of it as a `div` — it's the building block of your UI.

### Constructor

```javascript
object_ID/name = {
 *     layers = { layer_ID_1, layer_ID_2 }
 *     index = { layer_ID_1 = 0, layer_ID_2 = 1 }
 *     position = { layer_ID_1 = (-10,-2), layer_ID_2 = (5,10) }
 *     bg_layer = { layer_ID_2 }
 *     size = {height = n px, width = m px}
 *   }
```

| Parameter | Description |
|-----------|-------------------|
| `layers` | All the Layers in an object |
| `index` | The index value of all the layers in an object |
| `position` | the position of all the layers in an object |
| `bg_layer` | The backround layer for an object |
| `size` | The height and width of an object |

---

## BaseLayer

The Lowest part of a webpage that builds a webpage.


| Parameter | Description |
|-----------|-------------------|
| `layer_id` |This is the ID of the layer  |
| `layer_type` | This is the type ot layer it is. |
| `layer_enabled` | This is if the layer is enabled (or) disabled |
| `colour` | The colour of the layer |
| `opacity` | The opacity of the layer |
| `rounded_corners` | This is if the layer has rounded corners and how many pixel it is. |
| `rotate` | The extent in degrees to which a layer should be rotated. |
| `size` | The size of the layer. |

---

## TextLayer

Text content with a tag and styling.

### Constructor

```javascript
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
   property(abc'de'fxx) = { ... overrides for 'de' ... }
 }
```

| Parameter | Description |
|-----------|-------------------|
| `layer_type` | This explains the type of layer this is|
| `layer_enabled` | This explains if the layer is enabled |
| `.text` | The text inside the  |
| `.colour` | The colour of the text |
| `.size` | The size of the font |
| `.spacing` | The spacing between the letters |
| `.font` | The font of the text |
| `.strike` |  If the letter needs to to have a strike through. |
| `.underline` | If the letter has underline |
| `.highlight` | If the letter is Highlighted |
| `.bold` | If the letter is bold  |
| `property()` | This is the property that changes a part of the whole property , without changing the whole thing |

---

## ImageLayer

Image display with source and sizing.

### Constructor

```javascript
  layer_id/name = {
   layer_type = image
   layer_enabled = true
   image_location = "x_folder/y_image" (or) "www.xfolder.com/y_img"
   .size = height x width
   .colour = 0,0,0
   .opacity = 100%
   .rounded_corners = 10 px
   .rotate = 360 deg
 }
```

| Parameter | Description |
|-----------|-------------------|
| `layer_type` | This will check the type fo layer it is |
| `layer_enabled` | This will check if the layer is enabled |
| `layer_location` | This will get thelocation of the image in a codebase (or) use a url |
| `.size` | The size of the image |
| `.colour` | The colour of the image |
| `.opacity` | The opacity of the image |
| `.rounded_corners` | If the image has rounded corners |
| `.rotate` | If the image is rotated |

---

## ShapeLayer

Shapes with styling — rectangles, circles, etc.

### Constructor
layer
```javascript
  layer_ID/name = {
    layer_type = shape
    layer_enabled = true
    layer_vertices = 4
    .size = height x width
    .colour = 0,0,0
    .opacity = 100%
    .rounded_corners = 10 px 
    .rotate =  360 deg
  }
```

| Parameter | Description |
|-----------|-------------------|
|`layer_type`| the type of layer this is. |
|`layer_enabled`| If the layer is enabled |
|`layer_vertices`| The no.of vertices in a layer |
|`.size`| the size of the layer |
|`.colour`| the colour of the layer |
|`.opacity`| the opacity of the layer |
|`.rounded_corners`| if the layer has rounded corners |
|`.rotate`| if the layer is rotated |
---

## InputLayer

Form inputs — text box and list

### Constructor
  - For Text box :
```javascript
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
```

| Parameter | Description |
|-----------|-------------------|
| `layer_type` | input layer |
| `layer_enabled` | if the layer is enabled or disabled |
| `input_method` | typr of input(text box (or) list) |
| `.box_lenght` | the lenght of the input box (or) list |
| `.box_inner_text` | the text that should be inside as a watermark |
| `.box_inner_text_properties` | the properties of the text inside the box |
| `.box_inner_text_font` | the font of the text inside the box |
| `.colour_text` | the colour of the the text |
| `.written_inner_text_properties` | the inner text properties |
| `.written_inner_text_font` | the inner written text font |
| `.colour_text_written` | the colour of the written text |

---

## Transition

This is the animations and effects for this framework .

### Constructor

```javascript
transition_property = {
 import object_ID/name
 import object_ID_2/name
 
 time = 45 sec
 change.object_ID/name.layer_1:width = 100
 change.object_ID_2/name.layer_1:width = 100
}
```

| Parameter | Type | Description |
|-----------|-------------------|
| `change.object_id/name.layer_1` |the layer under going change |
| `time` | The time for the layer to go from it original state to the modified stage |

---

## Trigger

The event notifiers , these notify when an event like click , hover , scrool and keypress happen, these shoot out boolen like calues that trigger a conditional and do a function.

### Constructor

```javascript
if object_ID/name:clicked = true
  then play.transition_property
else
  then play.transition_property_2
```

| Parameter | Description |
|-----------|-------------------|
|`object_ID/name:`| the object that should be checked |
|`event`| this is the clicked,hovered,scrolled and keypress |

---

## Responsive

Responsive breakpoints for mobile, tablet, and desktop layouts.

### Constructor

```javascript
const responsive = new Responsive({
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px'
});
```

| Parameter | Max | Description |
|-----------|------|-------------|
| `mobile` | 480 | Mobile breakpoint |
| `tablet` | 768 | Tablet breakpoint |
| `desktop` | 1200 | Desktop breakpoint |

---

## Renderer

Renders pages and components to HTML strings.

### Constructor
- Every codebase should have .basehtml and this will be used to render the html and the js
---

## Complete Example

```javascript
layer_1 = {
   layer_type = image
   layer_enabled = true
   image_location = "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
   .size = 480 x 360
   .opacity = 100%
   .rounded_corners = 10 px
   .rotate = 360 deg
}
layer_2 = {
   layer_type = image
   layer_enabled = true
   image_location = "https://staticimg.publishstory.co/thumb/123963166.cms?imgsize=658570&width=760&height=428&resizemode=8"
   .size = 616 x 616
   .opacity = 100%
   .rounded_corners = 10 px
   .rotate = 360 deg
 }
 
 object_ID_1 = {
  layers = { layer_1, layer_2 }
  index = { layer_1 = 0, layer_2 = 1 }
  position = { layer_1 = (-10,-2)}
  bg_layer = { layer_ID_2 }
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
      index = { object_ID_1 = 0}
      position = { object_ID_1 = (-10,0)}
    }
```
```html
<!DOCTYPE html>
<html lang="en">    
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Me</title>
</html>
```
