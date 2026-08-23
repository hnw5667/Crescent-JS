/**
 * About Webpage Generator - v1.0.7
 * Uses the actual frontend code (src/phase1/frontend/*.js) to generate
 * a plain-English explanation of how the frontend is made.
 * Output: about-webpage.txt (alongside HTML)
 *
 * This module introspects the frontend source files at build time and
 * produces a human-readable description of the architecture.
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = __dirname;

function readFrontendModules() {
  const files = fs.readdirSync(FRONTEND_DIR).filter(f => f.endsWith('.js'));
  const modules = files.map(f => {
    const full = path.join(FRONTEND_DIR, f);
    const content = fs.readFileSync(full, 'utf-8');
    return { file: f, content };
  });
  return modules;
}

function describeLayerTypes() {
  return [
    'text — shows words on the screen. You can set the text, font, size, colour, bold, underline, strike-through, highlight, and letter spacing. You can even style individual characters differently using per-character overrides (range: [start, end]).',
    'image — shows a picture from a file path or URL. You set where the image is, how big it is, and optional colour overlay, opacity, rounded corners, and rotation.',
    'shape — draws a shape. You pick how many corners it has: 0 or "circle" makes a circle, 3 makes a triangle, 4 makes a rectangle, 5 or more makes a polygon. You set its size and colour.',
    'input — lets the user type or choose. Two modes: text box (a single-line field with placeholder text) and list (a set of options where the user can pick one or many).'
  ];
}

function generateAboutWebpageText(options = {}) {
  const modules = readFrontendModules();
  const layerCount = 4;
  const objectModules = modules.filter(m => m.file === 'object.js').length;
  const pageModules = modules.filter(m => m.file === 'page.js').length;

  const lines = [];
  lines.push('About This Webpage — How The Frontend Is Made');
  lines.push('(Generated from the actual frontend code in src/phase1/frontend/ — plain English)');
  lines.push('');
  lines.push(`This file was generated at build time alongside the HTML, using the real frontend source code.`);
  lines.push(`Build date: ${new Date().toISOString()}`);
  lines.push(`Frontend source directory: src/phase1/frontend/`);
  lines.push(`Modules found: ${modules.map(m => m.file).join(', ')}`);
  lines.push(`Framework version: ${options.version || '1.0.7'}`);
  lines.push('');
  lines.push('================================================================');
  lines.push('1. BIG PICTURE — PAGES, OBJECTS, AND LAYERS');
  lines.push('================================================================');
  lines.push('');
  lines.push('Think of the webpage as a stack of sheets on a table.');
  lines.push('');
  lines.push('• Page — The top sheet. It is the whole webpage. A Page has a size (height and width in pixels), a background colour or background image, a title, a URL, and a description. Inside a Page you place Objects.');
  lines.push('• Object — A box that lives inside the Page. An Object also has a size (height and width). Inside an Object you place Layers. If a Layer sticks out of its Object, the part that sticks out is clipped (hidden). An Object knows where it sits on the Page using cartesian coordinates (see below) and has a z-index to control which Object is in front.');
  lines.push('• Layer — The smallest visible piece. Every button, line of text, picture, or input field you see is a Layer inside an Object. Layers are the building blocks.');
  lines.push('');
  lines.push(`There are ${layerCount} kinds of Layers:`);
  describeLayerTypes().forEach((d, i) => {
    lines.push(`  ${i + 1}. ${d}`);
  });
  lines.push('');
  lines.push('Every Layer, whether it is text, image, shape, or input, shares these common settings:');
  lines.push('  - layer_id (a unique name so the code can find it later)');
  lines.push('  - layer_type (what kind of Layer it is: text, image, shape, or input)');
  lines.push('  - size (how tall and wide it is, in pixels)');
  lines.push('  - position (where it sits inside its Object, using cartesian x and y)');
  lines.push('  - index (stacking order; lower numbers are behind, higher numbers are in front)');
  lines.push('  - colour (written as "R,G,B" like "255,0,0" for red, or "R,G,B,A" for transparency)');
  lines.push('  - opacity (how see-through it is, like "100%" for solid or "50%" for half-transparent)');
  lines.push('  - rounded_corners (how round the corners are, like "8px")');
  lines.push('  - rotate (how much it is tilted, like "45deg")');
  lines.push('  - layer_enabled (true means visible, false means hidden)');
  lines.push('');
  lines.push('================================================================');
  lines.push('2. HOW POSITIONS WORK — CARTESIAN COORDINATES');
  lines.push('================================================================');
  lines.push('');
  lines.push('Both Pages and Objects use a simple math grid called cartesian coordinates.');
  lines.push('Imagine the center of the Page (or Object) is 0,0. Moving right makes x bigger, moving left makes x smaller. Moving up makes y bigger, moving down makes y smaller. This is the opposite of how the browser normally thinks (where down is bigger), so the code flips y when it draws.');
  lines.push('Example: If a Page is 1200 pixels wide and 800 pixels tall, x goes from -600 (left edge) to +600 (right edge), and y goes from -400 (bottom) to +400 (top). If you say place an Object at (0, -100), it will appear 100 pixels above the center.');
  lines.push('Objects use the same idea for Layers: each Layer has an x and y inside its Object, and if it goes outside the Object, it gets clipped.');
  lines.push('');
  lines.push('================================================================');
  lines.push('3. HOW SIZE ADAPTS — RATIO-BASED SCALING AND RESPONSIVE DESIGN');
  lines.push('================================================================');
  lines.push('');
  lines.push('When you create a Page you give it a height and width (like 1200x800). For each Object the code remembers two ratios: how much empty space is above vs below it (height_ratio), and how much is to the left vs right (width_ratio). When the browser window gets smaller or bigger, those ratios are kept, so Objects move and scale proportionally. If a ratio is 0,0 it means "stretch to fill the screen in that direction". The Page background always fills the screen. A separate Responsive helper watches the window width and picks a breakpoint (mobile, tablet, desktop, large) so you can change behavior per screen size.');
  lines.push('');
  lines.push('================================================================');
  lines.push('4. ADDING LIFE — TRANSITIONS AND TRIGGERS');
  lines.push('================================================================');
  lines.push('');
  lines.push('• Transition — An animation. You say which Objects are involved, how long it should take (like "2s" or "45 sec"), and what should change (for example, make a Layer wider or change its colour). You can play it forward, reverse it back, or stop it mid-way. The code remembers the original values so reverse works.');
  lines.push('• Trigger — A reaction to something the user does. A Trigger watches a Layer for an event like click, hover, scroll, keypress, focus, or submit. It has a condition function that returns true or false. If true, it runs the true_sequence (a list of actions like play a Transition, call an API, or redirect to another page); if false, it runs the false_sequence. You attach a Trigger to a Layer and it listens for that event.');
  lines.push('');
  lines.push('================================================================');
  lines.push('5. SHOWING IT ON SCREEN — RENDERER');
  lines.push('================================================================');
  lines.push('');
  lines.push('The Renderer is the manager that actually puts Pages on the screen. You register Pages with it, tell it what base HTML to use (like a file with <div id="crescent-root">), tell it which element is the mount point, and then ask it to mount or navigate. Navigate swaps one Page for another, updates the browser URL and title, sets up a ResizeObserver to re-apply scaling when the window resizes, and re-attaches Triggers so they work again after the swap. It can also render a full HTML string on the server (SSR) by converting the DOM element to a string and injecting it into the base HTML.');
  lines.push('');
  lines.push('================================================================');
  lines.push('6. JS-FIRST COMPONENT SYSTEM (v1.0.6) — WRITE JS, GET HTML');
  lines.push('================================================================');
  lines.push('');
  lines.push('Since v1.0.6 the framework is JS-first. Instead of writing HTML by hand and wiring it to JavaScript, you write a Component entirely in JavaScript and the framework does the rest:');
  lines.push('  - You call crescent.component({ component_id, sections: [...] }). Each section has a section_id (like "title") and a type (text, image, shape, input, or generic section). That single JS definition is the source of truth.');
  lines.push('  - At build time on your development machine (not in the browser), crescent.generate_html(component) runs. It reads the JS, sanitizes each section name (lowercase, dashes for spaces, removes illegal characters), and emits HTML where every section gets a deterministic id="section-{name}" plus data-section and data-layer-id attributes. For example, a section with section_id "hero title" becomes <div id="section-hero-title">. Built-in CSS (colour, opacity, size, font, rounded corners, rotation, position, index, etc.) is turned into inline styles.');
  lines.push('  - The generated HTML is bundled with the JS logic into a unified bundle ({ js, html, sections }) via crescent.bundler() / crescent.build_bundle(). The bundle is written to disk as bundle.json plus per-component html/*.html and js/*.json files.');
  lines.push('  - The bundle is shipped to the browser. At runtime, rocket.js hydrates: crescent.hydrate(container, component) finds each #section-{name} in the pre-generated DOM, applies the built-in CSS, sets data-hydrated="true" and data-component-id, and calls any onHydrate or bind_section callbacks you registered, thus connecting the HTML to the JS logic. No manual wiring needed.');
  lines.push('  - Generated HTML is also added to the component cache (components-chacke.json). The cache stores both JS and HTML; on the next request it can send just the id and position for unchanged components (reuse), or an update if the component was edited (modified_at newer than stored_at). This mirrors the existing client-side bundling behavior but now covers both artifacts.');
  lines.push('');
  lines.push('Files that power this: src/phase1/frontend/js_component.js (defines JSComponent), src/phase1/frontend/html_generator.js (build-time HTML + hydrate), src/phase1/frontend/bundler.js (unified bundling), and extensions in component_cache.js and rocket.js.');
  lines.push('');
  lines.push('================================================================');
  lines.push('7. OPTIMISATIONS — CACHING, COMPRESSION, AND ENCRYPTION');
  lines.push('================================================================');
  lines.push('');
  lines.push('• Component Cache — When a component (an Object) is sent to the browser it is saved in components-chacke.json on the server. Next time the same id is requested and it has not been edited, the server only sends the id and where it should go, not the whole component. If the component was edited (modified_at is newer than stored_at), the server sends an update that refreshes the browser cache. A hidden .crescent-tracker folder enables this optimisation; without it the cache falls back to sending everything normally. Since v1.0.6 the cache also stores the build-time HTML.');
  lines.push('• Compression — All text and JSON is gzipped before sending, so it travels smaller but can still be opened anywhere. If you pass a secret, it also encrypts with AES-256-GCM.');
  lines.push('• Encrypted Tunnels — When you open a tunnel with crescent.tunnel(), any data you send out is automatically compressed and encrypted. The tunnel has methods like send, receive, handshake, is_open, and close.');
  lines.push('• Bundling — The framework does not ship a huge bundle. rocket.js is a tiny file (under 9KB gzipped) that knows how layer(), object(), page(), transition(), trigger(), and responsive() connect. It loads only the frontend modules the Page actually needs, never the backend or database code. Since v1.0.6 it also ships the pre-generated HTML alongside the JS.');
  lines.push('');
  lines.push('================================================================');
  lines.push('8. WHAT FILES ARE INVOLVED (actual code on disk)');
  lines.push('================================================================');
  lines.push('');
  modules.forEach(m => {
    const firstLine = m.content.split('\n')[0].trim().slice(0, 120);
    lines.push(`- ${m.file} — ${firstLine || '(no comment)'}`);
  });
  lines.push('');
  lines.push('All implementation lives strictly inside code/. No files are scattered outside code/ except documentation and the website. When you run a build (crescent build <app> <outDir>), the code reads your JS components, calls HtmlGenerator.generateComponentHTML, and writes the HTML files; simultaneously it writes about-webpage.txt using this generator, so the text file is always in sync with the actual code.');
  lines.push('');
  lines.push('================================================================');
  lines.push('9. SUMMARY IN ONE PARAGRAPH');
  lines.push('================================================================');
  lines.push('');
  lines.push('The frontend is made by defining Pages that contain Objects, and Objects that contain Layers (text, image, shape, or input). Everything is placed with cartesian coordinates centered at 0,0 and sized with ratio-based scaling so it adapts to different screens. Transitions animate changes and Triggers react to user actions; the Renderer puts Pages on the screen and handles navigation and resizing. Since v1.0.6 you can define a Component purely in JavaScript and the framework generates the HTML at build time with deterministic section-{name} ids, bundles JS and HTML together, caches both, and hydrates the HTML in the browser via rocket.js, applying styles and wiring logic automatically. Optimisations like component caching, compression, and encrypted tunnels keep the shipment small and secure. All of this is implemented in the JavaScript files under src/phase1/frontend/ and exposed through the singleton crescent object (require("crescent-js")).');
  lines.push('');
  lines.push(`End of about-webpage.txt — generated from frontend code (${modules.length} modules).`);
  return lines.join('\n');
}

function writeAboutWebpage(outPath, options) {
  const text = generateAboutWebpageText(options);
  const target = outPath || path.join(process.cwd(), 'about-webpage.txt');
  // Ensure directory exists
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, 'utf-8');
  return target;
}

module.exports = {
  generateAboutWebpageText,
  writeAboutWebpage,
  FRONTEND_DIR
};
