import Link from 'next/link';
import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function GettingStartedPage() {
  return (
    <>
      <DocHeader
        title="Introduction"
        description="Install Crescent.js and build your first full-stack application."
        badge="Getting Started"
      />

      <h2 id="installation">Installation</h2>
      <p>
        Install Crescent.js from npm. The framework has zero dependencies — everything you need
        is bundled in a single package.
      </p>
      <CodeBlock code={`npm install crescent-js`} language="bash" />

      <Callout type="info" title="What you get">
        A full-stack framework with frontend rendering, backend logic, a built-in database, and
        authentication — all behind one cohesive API.
      </Callout>

      <h2 id="your-first-app">Your First App</h2>
      <p>
        Create a page, add an object with a text layer, and position it using Crescent.js's
        cartesian coordinate system.
      </p>
      <CodeBlock
        filename="app.js"
        code={`const crescent = require('crescent-js');

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
  font: 'sans-serif'
});

hero.add_layer(title);

// 4. Add the object to the page
page.add_object(hero);

// 5. Position the object using cartesian coordinates
page.set_object_position('hero', 0, -100);

console.log('App created successfully!');`}
      />

      <Callout type="tip" title="Cartesian coordinates">
        Positions are measured from the center of the container. Positive x moves right,
        positive y moves down. <code>set_object_position('hero', 0, -100)</code> moves the
        object 100px upward.
      </Callout>

      <h2 id="core-concepts">Core Concepts</h2>
      <p>Crescent.js is built around two core pillars that work together seamlessly:</p>

      <h3 id="frontend-pillar">Frontend</h3>
      <p>
        Build UIs using <strong>pages</strong>, <strong>objects</strong>, and{' '}
        <strong>layers</strong>. Pages hold objects, objects hold layers, and layers are the
        visual building blocks (text, image, shape, input). Everything is positioned using a
        cartesian coordinate system.
      </p>

      <h3 id="backend-pillar">Backend</h3>
      <p>
        Write logic using <strong>functions</strong>, <strong>conditionals</strong>,{' '}
        <strong>loops</strong>, and <strong>API endpoints</strong>. Create reusable server-side
        functions, branch logic with conditionals, iterate with loops, and define REST APIs.
      </p>

      <h2 id="project-structure">Project Structure</h2>
      <p>A typical Crescent.js application follows this layout:</p>
      <CodeBlock
        filename="project structure"
        code={`my-app/
├── src/
│   ├── pages/          # Page definitions
│   ├── components/     # Reusable objects and layers
│   ├── functions/      # Backend functions
│   └── app.js          # Entry point
└── package.json`}
      />

      <h2 id="running-your-app">Running Your App</h2>
      <p>
        Use the <code>crescent</code> CLI to run your application. It automatically serves on
        port <code>3000</code> unless you specify a custom port.
      </p>
      <CodeBlock
        language="bash"
        code={`# Run on a specific port
crescent run src/app.js 3030

# Auto-run on port 3000
crescent run src/app.js`}
      />

      <h2 id="next-steps">Next Steps</h2>
      <p>Continue exploring the framework with these guides:</p>
      <ul>
        <li>
          <Link href="/docs/frontend">Frontend Guide</Link> — pages, objects, layers, and
          rendering
        </li>
        <li>
          <Link href="/docs/backend">Backend Guide</Link> — functions, conditionals, loops, and
          APIs
        </li>
        <li>
          <Link href="/docs/database">Database Guide</Link> — built-in CRUD database
        </li>
        <li>
          <Link href="/docs/authentication">Authentication Guide</Link> — signup, login, and
          OAuth
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
