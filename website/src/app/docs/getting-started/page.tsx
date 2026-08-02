import Link from 'next/link';

export default function GettingStartedPage() {
  return (
    <>
      <h1>Getting Started</h1>
      <p>
        Everything you need to install, set up, and build your first Crescent.js application.
      </p>

      <hr />

      <h2>Installation</h2>
      <pre><code>npm install crescent-js</code></pre>

      <hr />

      <h2>Your First App</h2>
      <pre><code>{`const crescent = require('crescent-js');

// 1. Create a page
const page = crescent.page({
  page_id: 'home',
  page_title: 'My First App',
  page_description: 'Built with Crescent.js',
  size: { height: 800, width: 1200 }
});

// 2. Create an object
const hero = crescent.object({
  object_id: 'hero',
  size: { height: 200, width: 600 }
});

// 3. Add a text layer
const title = crescent.layer({
  layer_type: 'text',
  layer_id: 'title',
  text: 'Hello, Crescent!',
  size: 32,
  colour: '0,0,0',
  bold: true,
  font: 'sans-serif',
  spacing: '0px'
});

hero.add_layer(title);

// 4. Add the object to the page
page.add_object(hero);

// 5. Position the object using cartesian coordinates
page.set_object_position('hero', 0, -100);

console.log('App created successfully!');`}</code></pre>

      <hr />

      <h2>Core Concepts</h2>
      <p>
        Crescent.js is built around two core pillars:
      </p>

      <h3>Frontend</h3>
      <p>
        Build UIs using <strong>pages</strong>, <strong>objects</strong>, and <strong>layers</strong>.
        Pages hold objects, objects hold layers, and layers are the visual building blocks
        (text, image, shape, input). Everything is positioned using a cartesian coordinate system.
      </p>

      <h3>Backend</h3>
      <p>
        Write logic using <strong>functions</strong>, <strong>conditionals</strong>,
        <strong>loops</strong>, and <strong>API endpoints</strong>. Create reusable server-side
        functions, branch logic with conditionals, iterate with loops, and define REST APIs.
      </p>

      <hr />

      <h2>Project Structure</h2>
      <pre><code>{`my-app/
├── src/
│   ├── pages/          # Page definitions
│   ├── components/     # Reusable objects and layers
│   ├── functions/      # Backend functions
│   └── app.js          # Entry point
└── package.json`}</code></pre>

      <hr />

      <h2>Running Your App</h2>
      <pre><code>{`# Run on a specific port
crescent run src/app.js 3030

# Auto-run on port 3000
crescent run src/app.js`}</code></pre>

      <hr />

      <h2>Next Steps</h2>
      <ul>
        <li><Link href="/docs/frontend">Frontend Guide</Link> — Learn about pages, objects, layers, and rendering</li>
        <li><Link href="/docs/backend">Backend Guide</Link> — Functions, conditionals, loops, and APIs</li>
        <li><Link href="/docs/api-reference">API Reference</Link> — Complete method documentation</li>
        <li><Link href="/docs/configuration">Configuration</Link> — All configuration options</li>
      </ul>
    </>
  );
}