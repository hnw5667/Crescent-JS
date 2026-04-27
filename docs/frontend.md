# Frontend

Rocket.js provides a declarative, component-based approach to building user interfaces. Everything is built using Pages, Objects, and Layers.

---

## Core Concepts

| Concept | Description |
|--------|------------|
| Page | A full page in your application. Contains objects. |
| Object | A reusable component/container. Contains layers. |
| Layer | A visual or functional layer within an object (text, image, shape, input, base). |
| Transition | Animations between states or pages. |
| Trigger | Event handlers for user interactions. |
| Responsive | Breakpoint configuration for responsive design. |

---

## Pages

A Page is the top-level container for your UI. Each page has an ID and a title.

### Creating a Page

```javascript
const page = rocket.page({
  page_id: 'dashboard',
  title: 'Dashboard'
});
```

### Adding Objects to a Page

```javascript
const header = rocket.object({ object_id: 'header' });
const sidebar = rocket.object({ object_id: 'sidebar' });
const content = rocket.object({ object_id: 'content' });

page.add(header);
page.add(sidebar);
page.add(content);
```

### Rendering a Page

```javascript
const html = page.render();
```

### Retrieving a Page

```javascript
const myPage = rocket.get_page('dashboard');
```

---

## Objects

An Object is a container that holds layers. Think of it as a component.

### Creating an Object

```javascript
const card = rocket.object({ object_id: 'product-card' });
```

### Adding Layers

```javascript
card.add_layer(
  rocket.layer({
    layer_type: 'base',
    layer_id: 'card-bg',
    styles: {
      background: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }
  })
);

card.add_layer(
  rocket.layer({
    layer_type: 'text',
    layer_id: 'card-title',
    text: 'Product Name',
    tag: 'h3'
  })
);

card.add_layer(
  rocket.layer({
    layer_type: 'image',
    layer_id: 'card-img',
    src: '/images/product.jpg',
    alt: 'Product image'
  })
);
```

### Retrieving an Object

```javascript
const myCard = rocket.get_object('product-card');
```

---

## Layers

Layers are the building blocks of objects. Each layer has a `layer_type`.

### Base Layer

```javascript
rocket.layer({
  layer_type: 'base',
  layer_id: 'container',
  styles: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px'
  }
});
```

### Text Layer

```javascript
rocket.layer({
  layer_type: 'text',
  layer_id: 'heading',
  text: 'Hello World',
  tag: 'h1',
  styles: {
    color: '#333333',
    fontSize: '32px',
    fontWeight: 'bold'
  }
});
```

| Parameter | Type | Description |
|----------|------|------------|
| `text` | string | The text content to display |
| `tag` | string | HTML tag (`h1`–`h6`, `p`, `span`, etc.) |
| `styles` | object | CSS styles |

---

### Image Layer

```javascript
rocket.layer({
  layer_type: 'image',
  layer_id: 'hero-img',
  src: '/images/hero.jpg',
  alt: 'Hero image',
  styles: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover'
  }
});
```

| Parameter | Type | Description |
|----------|------|------------|
| `src` | string | Image source URL |
| `alt` | string | Alt text |
| `styles` | object | CSS styles |

---

### Shape Layer

```javascript
rocket.layer({
  layer_type: 'shape',
  layer_id: 'divider',
  shape: 'rectangle',
  styles: {
    width: '100%',
    height: '2px',
    background: '#e0e0e0'
  }
});
```

---

### Input Layer

```javascript
rocket.layer({
  layer_type: 'input',
  layer_id: 'email-input',
  type: 'email',
  name: 'email',
  placeholder: 'Enter your email',
  styles: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc'
  }
});
```

---

## Transitions

```javascript
const fadeIn = rocket.transition({
  transition_id: 'fade-in',
  type: 'fade',
  duration: 300,
  easing: 'ease-in-out'
});
```

### Retrieve

```javascript
const myTransition = rocket.get_transition('fade-in');
```

---

## Triggers

```javascript
const clickTrigger = rocket.trigger({
  trigger_id: 'submit-form',
  event: 'click',
  action: () => {
    console.log('Form submitted!');
  }
});
```

### Retrieve

```javascript
const myTrigger = rocket.get_trigger('submit-form');
```

---

## Responsive Design

```javascript
rocket.responsive({
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px'
});
```

---

## Renderer

```javascript
// Render an entire page
const html = rocket.renderer.render_page(page);

// Render a single object
const html = rocket.renderer.render_component(object);
```

---

## Complete Example

```javascript
const rocket = require('crescent-js');

// Create a page
const page = rocket.page({
  page_id: 'login',
  title: 'Login'
});

// Header
const header = rocket.object({ object_id: 'header' });

header.add_layer(
  rocket.layer({
    layer_type: 'base',
    layer_id: 'header-bg',
    styles: {
      background: '#1a1a2e',
      padding: '20px',
      textAlign: 'center'
    }
  })
);

header.add_layer(
  rocket.layer({
    layer_type: 'text',
    layer_id: 'header-title',
    text: 'Welcome Back',
    tag: 'h1',
    styles: { color: '#ffffff' }
  })
);

// Form
const form = rocket.object({ object_id: 'login-form' });

form.add_layer(
  rocket.layer({
    layer_type: 'base',
    layer_id: 'form-bg',
    styles: {
      padding: '20px',
      maxWidth: '400px',
      margin: '0 auto'
    }
  })
);

form.add_layer(
  rocket.layer({
    layer_type: 'input',
    layer_id: 'username',
    type: 'text',
    name: 'username',
    placeholder: 'Username'
  })
);

form.add_layer(
  rocket.layer({
    layer_type: 'input',
    layer_id: 'password',
    type: 'password',
    name: 'password',
    placeholder: 'Password'
  })
);

// Assemble
page.add(header);
page.add(form);

const html = page.render();
```
