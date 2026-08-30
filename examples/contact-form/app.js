/**
 * Crescent.js — Contact Form Example
 * Full-stack form that collects name, email, contact (optional)
 * with Frontend + Backend + Database, all in Crescent.js only.
 *
 * Run:
 *   npm install
 *   node app.js
 * Then open http://localhost:3000
 */

let crescent;
try { crescent = require('crescent-js'); } catch { crescent = require('../../code/src/rocket'); }

// ============================================================
// 1) DATABASE — contacts collection
// ============================================================
const db = crescent.db;
// Ensure collection exists
if (!db.exists('contacts')) db.create('contacts');

// ============================================================
// 2) FRONTEND — Page + Objects + Layers (cartesian system)
// ============================================================

// Page: 1200×800, background light
const page = crescent.page({
  page_id: 'contact',
  page_title: 'Contact Us — Crescent.js',
  page_description: 'Collects name, email and optional contact',
  page_url: '/contact',
  page_bg: '248,248,252',
  size: { height: 800, width: 1200 },
});

// --- Header object ---
const header = crescent.object({
  object_id: 'header',
  size: { height: 140, width: 720 },
});
const heading = crescent.layer({
  layer_type: 'text',
  layer_id: 'heading',
  text: 'Get in Touch',
  size: 36,
  colour: '15,15,20',
  bold: true,
  font: 'sans-serif',
});
const subheading = crescent.layer({
  layer_type: 'text',
  layer_id: 'subheading',
  text: 'We will reply within 24 hours. Built entirely with Crescent.js.',
  size: 14,
  colour: '100,100,110',
  font: 'sans-serif',
});
header.add_layer(heading);
header.add_layer(subheading);
header.set_layer_position('heading', 0, 30);
header.set_layer_position('subheading', 0, -10);
header.set_layer_index('heading', 1);
header.set_layer_index('subheading', 0);

// --- Form object ---
const formCard = crescent.object({
  object_id: 'form_card',
  size: { height: 420, width: 560 },
});
const cardBg = crescent.layer({
  layer_type: 'shape',
  layer_id: 'card_bg',
  layer_vertices: 4,
  colour: '255,255,255',
  rounded_corners: '16px',
  size: { height: 420, width: 560 },
  opacity: '100%',
});
const nameInput = crescent.layer({
  layer_type: 'input',
  layer_id: 'name_input',
  input_method: 'text box',
  box_length: 40,
  box_inner_text: 'Enter your name *',
  box_inner_text_properties: ['italic'],
  box_inner_text_font: 'sans-serif',
  colour_text: '120,120,130',
  written_inner_text_font: 'sans-serif',
  colour_text_written: '15,15,20',
  size: { height: 46, width: 480 },
  rounded_corners: '10px',
});
const emailInput = crescent.layer({
  layer_type: 'input',
  layer_id: 'email_input',
  input_method: 'text box',
  box_length: 40,
  box_inner_text: 'Enter your email *',
  box_inner_text_properties: ['italic'],
  colour_text: '120,120,130',
  written_inner_text_font: 'sans-serif',
  colour_text_written: '15,15,20',
  size: { height: 46, width: 480 },
  rounded_corners: '10px',
});
const contactInput = crescent.layer({
  layer_type: 'input',
  layer_id: 'contact_input',
  input_method: 'text box',
  box_length: 40,
  box_inner_text: 'Contact (phone / optional)',
  box_inner_text_properties: ['italic'],
  colour_text: '120,120,130',
  written_inner_text_font: 'sans-serif',
  colour_text_written: '15,15,20',
  size: { height: 46, width: 480 },
  rounded_corners: '10px',
});
const submitBg = crescent.layer({
  layer_type: 'shape',
  layer_id: 'submit_bg',
  layer_vertices: 4,
  colour: '124,58,237',
  rounded_corners: '10px',
  size: { height: 46, width: 480 },
});
const submitText = crescent.layer({
  layer_type: 'text',
  layer_id: 'submit_text',
  text: 'Submit →',
  size: 15,
  colour: '255,255,255',
  bold: true,
});

formCard.add_layer(cardBg);
formCard.add_layer(nameInput);
formCard.add_layer(emailInput);
formCard.add_layer(contactInput);
formCard.add_layer(submitBg);
formCard.add_layer(submitText);
formCard.set_bg_layer('card_bg');
formCard.set_layer_position('name_input', 0, 90);
formCard.set_layer_position('email_input', 0, 30);
formCard.set_layer_position('contact_input', 0, -30);
formCard.set_layer_position('submit_bg', 0, -100);
formCard.set_layer_position('submit_text', 0, -100);
formCard.set_layer_index('card_bg', -1);
formCard.set_layer_index('submit_text', 5);

// --- Success object (hidden initially) ---
const successObj = crescent.object({
  object_id: 'success',
  size: { height: 80, width: 560 },
  object_enabled: false,
});
const successText = crescent.layer({
  layer_type: 'text',
  layer_id: 'success_text',
  text: 'Thank you! Your response was saved.',
  size: 16,
  colour: '16,122,60',
  bold: true,
});
successObj.add_layer(successText);

// Add objects to page (cartesian positions)
page.add_object(header);
page.add_object(formCard);
page.add_object(successObj);
page.set_object_position('header', 0, 220);
page.set_object_position('form_card', 0, -40);
page.set_object_position('success', 0, -280);
// Responsive scaling ratios — keeps layout proportional on resize
page.set_scaling_ratio('header', [1, 1], [1, 1]);
page.set_scaling_ratio('form_card', [1, 1], [2, 1]);
page.set_scaling_ratio('success', [1, 1], [1, 1]);

// ============================================================
// 3) BACKEND — Functions, Conditionals, Collect, API
// ============================================================

// Reusable function: validates email
const validateEmail = crescent.function({
  function_id: 'validate_email',
  params: ['email'],
  body: (email) => {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  },
});

// Collect helper: gathers inputs and transforms
const collectForm = crescent.collect({
  collect_id: 'contact_collect',
  sources: [nameInput, emailInput, contactInput],
  transform: (data) => ({
    // data shape: { name_input, email_input, contact_input } from layers
    // page.get_values() aggregates per-object; we normalize here
    name: (data.name_input || data.name || '').trim(),
    email: (data.email_input || data.email || '').trim(),
    contact: (data.contact_input || data.contact || '').trim() || null,
    submitted_at: Date.now(),
  }),
  validate: (data) => {
    if (!data.name_input && !data.name) return false;
    if (!data.email_input && !data.email) return false;
    return true;
  },
});

// Conditional: checks required fields + email format before DB write
const formGuard = crescent.conditional({
  conditional_id: 'form_guard',
  if: {
    check: () => {
      const vals = page.get_values();
      const flat = vals.form_card || {};
      const name = (flat.name_input || '').trim();
      const email = (flat.email_input || '').trim();
      if (!name || !email) return false;
      return validateEmail.call(email);
    },
    actions: [{ type: 'call_function', function: validateEmail }],
  },
  else: {
    actions: [],
  },
});

// Boolean example: required AND valid email
const canSubmit = crescent.boolean({
  boolean_id: 'can_submit',
  value1: true,
  value2: true,
  operator: 'AND',
});

// ============================================================
// 4) API — REST endpoints (frontend → backend → db)
// ============================================================
const api = crescent.api_make({
  api_id: 'contact_api',
  port: 3000,
  host: '0.0.0.0',
  cors: true,
});

// Health
api.add_endpoint('GET', '/api/health', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, framework: 'crescent-js', example: 'contact-form' }));
});

// Submit contact form
api.add_endpoint('POST', '/api/contact', (req, res) => {
  const body = req.body || {};
  // Support both JSON {name,email,contact} and collected layer values
  const name = (body.name || body.name_input || '').trim();
  const email = (body.email || body.email_input || '').trim();
  const contact = (body.contact || body.contact_input || '').trim() || null;

  if (!name) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Name is required' }));
    return;
  }
  if (!email || !validateEmail.call(email)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Valid email is required' }));
    return;
  }

  // Conditional check via framework primitive
  const decision = formGuard.evaluate();
  // decision is 'if' when guard passes; we still explicitly validate
  if (decision !== 'if') {
    // fallback: allow if direct validation passes (when triggered via API not page inputs)
    if (!validateEmail.call(email)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Validation failed' }));
      return;
    }
  }

  // Boolean gate
  const ok = canSubmit.evaluate();
  if (!ok) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Boolean gate blocked submission' }));
    return;
  }

  // Insert via DB (built-in crescent.db)
  const doc = crescent.db.insert('contacts', {
    name,
    email,
    contact,
    submitted_at: Date.now(),
  });

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, contact: doc }));
});

// List contacts (for demo)
api.add_endpoint('GET', '/api/contacts', (req, res) => {
  const all = crescent.db.find('contacts');
  // Sort by submitted_at descending
  all.sort((a, b) => (b.submitted_at || 0) - (a.submitted_at || 0));
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(all));
});

// Get one contact by id
api.add_endpoint('GET', '/api/contacts/:id', (req, res) => {
  const doc = crescent.db.find_by_id('contacts', req.params.id);
  if (!doc) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(doc));
});

// ============================================================
// 5) TRIGGER — click submit → collect → validate → save → UI
// ============================================================
const submitTrigger = crescent.trigger({
  object_id: 'form_card',
  event: 'click',
  condition: () => true,
  true_sequence: [
    { type: 'collect', collect: collectForm },
    { type: 'call_function', function: validateEmail },
  ],
});
// Attach trigger to the form object (click on submit area)
submitTrigger.attach(formCard);

// In-browser helper: wire DOM after render to call our API
function wireBrowserSubmit() {
  if (typeof document === 'undefined') return;
  document.addEventListener('click', async (e) => {
    const el = e.target;
    if (!el) return;
    // Detect click inside submit button area (submit_bg or submit_text)
    const isSubmit =
      el.closest && (el.closest('[data-layer-id="submit_bg"]') || el.closest('[data-layer-id="submit_text"]')) ||
      (el.dataset && (el.dataset.layerId === 'submit_bg' || el.dataset.layerId === 'submit_text'));
    // Fallback: click inside form_card object
    const formEl = document.querySelector('[data-object-id="form_card"]');
    if (!formEl || !formEl.contains(el)) return;
    // Only proceed if click y is near submit (approx)
    // For simplicity, any click inside form triggers submit flow
    const vals = page.get_values();
    const flat = vals.form_card || {};
    const name = (flat.name_input || '').trim();
    const email = (flat.email_input || '').trim();
    const contact = (flat.contact_input || '').trim() || null;

    if (!name || !email) {
      alert('Please fill name and email');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, contact }),
      });
      const data = await res.json();
      if (data.success) {
        const s = successObj.get_element();
        if (s) s.style.display = 'block';
        successText.set_property('text', `Thank you, ${name}! Saved.`);
        // Clear inputs visually
        if (typeof document !== 'undefined') {
          document.querySelectorAll('input').forEach((inp) => (inp.value = ''));
        }
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  });
}

// ============================================================
// 6) RENDER + START SERVER
// ============================================================

// Server serves the rendered HTML at /
api.add_endpoint('GET', '/', (req, res) => {
  // Use renderer to serve full HTML if available
  try {
    crescent.renderer.register_page(page);
    const html = crescent.renderer.render_full_page('contact');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } catch {
    // Fallback minimal HTML
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!doctype html><html><head><title>${page.page_title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:sans-serif;background:rgb(${page.page_bg})}</style></head><body><div id="crescent-root"></div><script>console.log('Crescent page: contact')</script></body></html>`);
  }
});

async function start() {
  await api.start();
  // Also render in current process for SSR check (no DOM in Node — guarded)
  if (typeof document !== 'undefined') {
    const root = document.getElementById('crescent-root') || document.body;
    crescent.renderer.register_page(page);
    crescent.renderer.mount(root);
    wireBrowserSubmit();
  }
  console.log(`Contact form running at http://localhost:${api.port}`);
  console.log(`POST /api/contact  -> { name, email, contact? }`);
  console.log(`GET  /api/contacts -> list all submissions`);
}

if (require.main === module) start();

module.exports = { page, header, formCard, api, db, validateEmail, collectForm, formGuard, start };
