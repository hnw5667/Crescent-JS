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

The top-level container for your app. Holds all components and renders the full HTML page.

### Constructor

```javascript
const page = new Page({ title: 'My App' });
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | string | Page title (shown in browser tab) |

### Methods

#### `add(component)`

Adds a component (RObject) to the page.

```javascript
page.add(header);
page.add(main_content);
```

#### `render()`

Renders the entire page to an HTML string.

```javascript
const html = page.render();
// '<!DOCTYPE html><html><head>...</head><body>...</body></html>'
```

---

## Object (RObject)

A component that holds layers. Think of it as a `div` — it's the building block of your UI.

### Constructor

```javascript
const obj = new RObject({ id: 'header' });
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique identifier for the component |

### Methods

#### `add_layer(layer)`

Adds a layer to the component. Layers are rendered in order.

```javascript
obj.add_layer(new BaseLayer({ styles: { background: '#1a1a2e' } }));
obj.add_layer(new TextLayer({ text: 'Hello!', tag: 'h1' }));
```

---

## BaseLayer

Base styling layer — background, padding, borders, and any CSS properties.

### Constructor

```javascript
const base = new BaseLayer({
  styles: {
    background: '#1a1a2e',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #333'
  }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `styles` | object | CSS properties as camelCase keys |

---

## TextLayer

Text content with a tag and styling.

### Constructor

```javascript
const text = new TextLayer({
  text: 'Welcome!',
  tag: 'h1',
  styles: { color: '#ffffff', fontSize: '24px' }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | string | The text content |
| `tag` | string | HTML tag: `'h1'`, `'p'`, `'span'`, `'a'`, etc. |
| `styles` | object | CSS properties (optional) |

---

## ImageLayer

Image display with source and sizing.

### Constructor

```javascript
const img = new ImageLayer({
  src: '/images/logo.png',
  alt: 'Logo',
  styles: { width: '200px', borderRadius: '8px' }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `src` | string | Image source URL or path |
| `alt` | string | Alt text for accessibility |
| `styles` | object | CSS properties (optional) |

---

## ShapeLayer

Shapes with styling — rectangles, circles, etc.

### Constructor

```javascript
const shape = new ShapeLayer({
  shape: 'rectangle',
  styles: { width: '100px', height: '60px', background: '#f97316' }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `shape` | string | Shape type: `'rectangle'`, `'circle'` |
| `styles` | object | CSS properties |

---

## InputLayer

Form inputs — text, password, email, and more.

### Constructor

```javascript
const input = new InputLayer({
  type: 'text',
  name: 'username',
  placeholder: 'Enter username',
  styles: { padding: '10px', borderRadius: '4px' }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Input type: `'text'`, `'password'`, `'email'`, `'number'`, etc. |
| `name` | string | Input name attribute |
| `placeholder` | string | Placeholder text (optional) |
| `styles` | object | CSS properties (optional) |

---

## Transition

CSS animations for components.

### Constructor

```javascript
const transition = new Transition({
  type: 'fade',
  duration: '0.3s',
  timing: 'ease'
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Animation type: `'fade'`, `'slide'`, `'scale'`, `'rotate'` |
| `duration` | string | Animation duration (default: `'0.3s'`) |
| `timing` | string | Timing function: `'ease'`, `'linear'`, `'ease-in-out'` |

---

## Trigger

Event handlers for user interactions.

### Constructor

```javascript
const trigger = new Trigger({
  event: 'click',
  action: () => console.log('Clicked!')
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | Event type: `'click'`, `'hover'`, `'focus'`, `'submit'`, etc. |
| `action` | function | Function to run when the event fires |

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

| Parameter | Type | Description |
|-----------|------|-------------|
| `mobile` | string | Mobile breakpoint |
| `tablet` | string | Tablet breakpoint |
| `desktop` | string | Desktop breakpoint |

---

## Renderer

Renders pages and components to HTML strings.

### Constructor

```javascript
const renderer = new Renderer();
```

### Methods

#### `render_page(page)`

Renders a full Page object to an HTML string.

```javascript
const html = renderer.render_page(page);
```

#### `render_component(component)`

Renders a single RObject component to an HTML string.

```javascript
const html = renderer.render_component(header);
```

---

## Complete Example

```javascript
const { Page, Object: RObj, TextLayer, BaseLayer, InputLayer } = Crescent.Frontend;

// Create a page
const page = new Page({ title: 'Login' });

// Build a header
const header = new RObj({ id: 'header' });
header.add_layer(new BaseLayer({
  styles: { background: '#1a1a2e', padding: '20px', textAlign: 'center' }
}));
header.add_layer(new TextLayer({
  text: 'Welcome Back',
  tag: 'h1',
  styles: { color: '#ffffff' }
}));

// Build a form
const form = new RObj({ id: 'login-form' });
form.add_layer(new BaseLayer({
  styles: { padding: '20px', maxWidth: '400px', margin: '0 auto' }
}));
form.add_layer(new InputLayer({
  type: 'text', name: 'username', placeholder: 'Username'
}));
form.add_layer(new InputLayer({
  type: 'password', name: 'password', placeholder: 'Password'
}));

// Assemble and render
page.add(header);
page.add(form);
const html = page.render();