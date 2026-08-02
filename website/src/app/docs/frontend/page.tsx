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

// Add objects and render the page
const hero = crescent.object({
  object_id: 'hero',
  size: { height: 200, width: 600 }
});

page.add_object(hero);
page.render();`}
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
  size: { height: 80, width: 600 },
  page_position: { x: 0, y: 0 }
});

page.add_object(header);

// Reposition after adding
page.set_object_position('header', 0, 100);`}
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
        code={`const title = crescent.layer({
  layer_type: 'text',
  layer_id: 'title',
  text: 'Welcome to my app',
  size: 48,
  colour: '0,0,0',
  bold: true,
  font: 'sans-serif'
});

header.add_layer(title);`}
      />

      <h3 id="image-layers">Image Layers</h3>
      <CodeBlock
        filename="image-layer.js"
        code={`const logo = crescent.layer({
  layer_type: 'image',
  layer_id: 'logo',
  image_location: 'https://example.com/logo.png',
  size: { height: 60, width: 180 }
});

header.add_layer(logo);`}
      />

      <h3 id="shape-layers">Shape Layers</h3>
      <CodeBlock
        filename="shape-layer.js"
        code={`const divider = crescent.layer({
  layer_type: 'shape',
  layer_id: 'divider',
  layer_vertices: 4,
  size: { height: 2, width: 200 },
  colour: '0,0,0'
});

header.add_layer(divider);`}
      />

      <h3 id="input-layers">Input Layers</h3>
      <CodeBlock
        filename="input-layer.js"
        code={`const username = crescent.layer({
  layer_type: 'input',
  layer_id: 'username',
  input_method: 'text box',
  box_length: 20,
  box_inner_text: 'Enter your username',
  size: { height: 45, width: 300 }
});

header.add_layer(username);`}
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

// Move an object 200px up
page.set_object_position('card', 0, 200);`}
      />

      <Callout type="warning" title="Coordinate system">
        Coordinates are relative to the <strong>center</strong>, not the top-left corner.
        Positive <code>x</code> moves right, positive <code>y</code> moves up.
      </Callout>

      <h2 id="adding-events">Adding Events</h2>
      <p>
        Layers can listen for user interactions like clicks, hovers, and keyboard input.
        Events are wired up with <code>crescent.trigger()</code>, which binds a handler
        to the layer's rendered element by <code>layer_id</code>.
      </p>
      <CodeBlock
        filename="events.js"
        code={`crescent.trigger({
  layer_id: 'title',
  event: 'click',
  true_sequence: [
    function (event) {
      console.log('Clicked!', event);
    }
  ]
});

crescent.trigger({
  layer_id: 'logo',
  event: 'hover',
  hover_direction: 'enter',
  true_sequence: [
    function () {
      console.log('Hovering the logo');
    }
  ]
});`}
      />

      <Callout type="info" title="Trigger actions">
        Trigger sequences are arrays of functions. They can also hold actions like{' '}
        <code>{'{ type: "redirect", page_id: "home" }'}</code> or{' '}
        <code>{'{ type: "set_property", layer_id, property, value }'}</code>.
      </Callout>

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
