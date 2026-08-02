import Link from 'next/link';
import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function FrontendPage() {
  return (
    <>
      <DocHeader
        title="Frontend Guide"
        description="Build user interfaces with pages, objects, and layers using Crescent.js."
        badge="Guides"
      />

      <h2 id="pages">Pages</h2>
      <p>
        Pages are the top-level containers of your UI. Every page has a unique{' '}
        <code>page_id</code>, a title, a description, and a size in pixels.
      </p>
      <CodeBlock
        filename="pages.js"
        code={`const page = crescent.page({
  page_id: 'landing',
  page_title: 'Landing Page',
  page_description: 'Marketing page',
  size: { height: 900, width: 1440 }
});

crescent.add_page(page);`}
      />

      <Callout type="note" title="Multiple pages">
        You can create as many pages as you need. Each page holds its own objects and is
        rendered independently.
      </Callout>

      <h2 id="objects">Objects</h2>
      <p>
        Objects are the building blocks placed on a page. Each object has a size, an
        optional position, and holds layers. Objects are the containers that define what
        appears on screen.
      </p>
      <CodeBlock
        filename="objects.js"
        code={`const header = crescent.object({
  object_id: 'header',
  size: { height: 80, width: '100%' },
  position: { x: 0, y: 0 },
  border_radius: 8,
  background_colour: '255,255,255'
});

page.add_object(header);`}
      />

      <h2 id="layers">Layers</h2>
      <p>
        Layers are the visual elements inside objects. Crescent.js supports four layer
        types: <code>text</code>, <code>image</code>, <code>shape</code>, and{' '}
        <code>input</code>. Layers are added to an object with{' '}
        <code>add_layer()</code>.
      </p>

      <h3 id="text-layers">Text Layers</h3>
      <CodeBlock
        filename="text-layer.js"
        code={`crescent.layer({
  layer_type: 'text',
  layer_id: 'title',
  text: 'Welcome to my app',
  size: 48,
  colour: '0,0,0',
  bold: true,
  font: 'sans-serif'
});`}
      />

      <h3 id="image-layers">Image Layers</h3>
      <CodeBlock
        filename="image-layer.js"
        code={`crescent.layer({
  layer_type: 'image',
  layer_id: 'logo',
  source: 'https://example.com/logo.png',
  size: { height: 60, width: 180 }
});`}
      />

      <h3 id="shape-layers">Shape Layers</h3>
      <CodeBlock
        filename="shape-layer.js"
        code={`crescent.layer({
  layer_type: 'shape',
  layer_id: 'divider',
  type: 'rectangle',
  fill: '0,0,0',
  width: 200,
  height: 2
});`}
      />

      <h3 id="input-layers">Input Layers</h3>
      <CodeBlock
        filename="input-layer.js"
        code={`crescent.layer({
  layer_type: 'input',
  layer_id: 'username',
  type: 'text',
  placeholder: 'Enter your username',
  width: 300,
  height: 45
});`}
      />

      <h2 id="positioning">Positioning</h2>
      <p>
        Crescent.js uses a <strong>cartesian coordinate system</strong> measured from the
        center of the container. Objects are positioned using{' '}
        <code>set_object_position()</code>.
      </p>
      <CodeBlock
        filename="positioning.js"
        code={`page.set_object_position('header', 0, 0);

// Move an object 150px to the right
page.set_object_position('card', 150, 0);

// Move an object 200px down
page.set_object_position('card', 0, 200);`}
      />

      <Callout type="warning" title="Coordinate system">
        Coordinates are relative to the <strong>center</strong>, not the top-left corner.
        Positive <code>x</code> moves right, positive <code>y</code> moves down.
      </Callout>

      <h2 id="adding-events">Adding Events</h2>
      <p>
        Layers can listen for user interactions like clicks and keyboard input. Events are
        wired up through the backend, so an event handler is defined as a function.
      </p>
      <CodeBlock
        filename="events.js"
        code={`object.add_event('click', 'on_click');

// Backend handler
crescent.function({
  function_id: 'on_click',
  parameters: ['event'],
  body: function (event) {
    console.log('Clicked!', event);
  }
});`}
      />

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/backend">Backend Guide</Link> — learn how functions and APIs work
          together
        </li>
        <li>
          <Link href="/docs/database">Database Guide</Link> — store and query your data
        </li>
      </ul>

      <DocPagination />
    </>
  );
}
