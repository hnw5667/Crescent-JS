# Getting Started

Learn how to set up a Rocket.js project from scratch and build your first application.

---

## Prerequisites

- **Node.js** 16.x or later
- **npm** 7.x or later

---

## Installation

Create a new project directory and install Rocket.js:

```bash
mkdir my-rocket-app
cd my-rocket-app
npm init -y
npm install crescent-js
```

---

## Your First App

Create an `app.js` file in your project root:

```javascript
const rocket = require('crescent-js');

// 1. Create a page
const homePage = rocket.page({
  page_id: 'home',
  title: 'My First Rocket App'
});

// 2. Create an object (a container for layers)
const hero = rocket.object({ object_id: 'hero' });

// 3. Add a background layer
hero.add_layer(
  rocket.layer({
    layer_type: 'base',
    layer_id: 'hero-bg',
    styles: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '80px 20px',
      textAlign: 'center'
    }
  })
);

// 4. Add a text layer
hero.add_layer(
  rocket.layer({
    layer_type: 'text',
    layer_id: 'hero-title',
    text: 'Welcome to Rocket.js',
    tag: 'h1',
    styles: {
      color: '#ffffff',
      fontSize: '48px'
    }
  })
);

// 5. Add the object to the page
homePage.add(hero);

// 6. Render the page
const html = homePage.render();
console.log(html);
```

Run it:

```bash
node app.js
```

---

## Adding Interactivity

Use triggers to respond to user events:

```javascript
const button = rocket.object({ object_id: 'cta-button' });

button.add_layer(
  rocket.layer({
    layer_type: 'base',
    layer_id: 'btn-bg',
    styles: {
      background: '#ff6b6b',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  })
);

button.add_layer(
  rocket.layer({
    layer_type: 'text',
    layer_id: 'btn-text',
    text: 'Click Me',
    tag: 'span',
    styles: {
      color: '#ffffff'
    }
  })
);

// Add a click trigger
const clickTrigger = rocket.trigger({
  trigger_id: 'btn-click',
  event: 'click',
  action: () => {
    console.log('Button was clicked!');
  }
});
```

---

## Adding Backend Logic

Rocket.js lets you define backend functions, conditionals, and loops:

```javascript
// Define a function
const greet = rocket.function({
  function_id: 'greet',
  handler: (name) => {
    return `Hello, ${name}!`;
  }
});

// Use a conditional
const checkAge = rocket.conditional({
  conditional_id: 'check-age',
  condition: (age) => age >= 18,
  onTrue: () => 'Adult',
  onFalse: () => 'Minor'
});

// Use a loop
const renderList = rocket.loop({
  loop_id: 'render-list',
  items: ['Apple', 'Banana', 'Cherry'],
  iteratee: (item, index) => {
    return `<li>${item}</li>`;
  }
});
```

---

## Adding Authentication

Set up user signup and login in just a few lines:

```javascript
// Signup
const user = rocket.auth.signup({
  username: 'rocketuser',
  email: '<user@example.com>',
  password: 'securepassword123'
});

// Login
const session = rocket.auth.login({
  username: 'rocketuser',
  password: 'securepassword123'
});
```

📖 **[Read the Authentication Guide →](./authentication.md)**

---

## Next Steps

- [Frontend Guide](./frontend.md) — Deep dive into pages, objects, and layers  
- [Backend Guide](./backend.md) — Functions, conditionals, loops, and APIs  
- [Authentication Guide](./authentication.md) — Full auth setup  
- [API Reference](./api-reference.md) — Complete method documentation  
