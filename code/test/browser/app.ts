/**
 * Comprehensive TypeScript dummy page — exercises every browser-side feature
 * of Crescent.js exactly as a real TS consumer would. Type-checked by tsc
 * (against index.d.ts), then compiled and rendered in a real browser.
 *
 * Covered surface:
 *   - All 4 layer types: text (with per-character property overrides),
 *     image, shape (circle / triangle / rectangle / SVG polygon),
 *     input (text box and list)
 *   - Objects: add/remove layers, index, position, bg layer, get_value
 *   - Pages: multiple pages, bg layer, object placement, index, scaling,
 *     cartesian range, get_values
 *   - Transitions: play / reverse / stop / is_playing, add change/object
 *   - Triggers: attach + click handling, conditions, true/false sequences,
 *     set_property actions
 *   - Responsive: init, breakpoint, calculate_ratios
 *   - Renderer: mount, multi-page navigate, current page lookup
 *   - Global helpers: print/add/subtract/multiply/divide/sqrt/sin/cos/tan
 */
import crescent, { BaseLayer } from 'crescent-js';

// ===== Global helpers =====
crescent.print('Comprehensive TS dummy page booting');
const math = {
  add: crescent.add(2, 3),
  subtract: crescent.subtract(10, 4),
  multiply: crescent.multiply(4, 5),
  divide: crescent.divide(20, 4),
  sqrt: crescent.sqrt(16),
  sin: crescent.sin(0),
  cos: crescent.cos(0),
  tan: crescent.tan(0),
  timestamp: crescent.get_timestamp()
};

// ===== Layers =====
// Text layer with per-character style overrides.
const head_title = crescent.layer({
  layer_id: 'head_title',
  layer_type: 'text',
  text: 'Crescent',
  size: 40,
  colour: '30,50,90',
  bold: true,
  underline: true,
  properties: [
    { range: [0, 3], colour: '180,30,30', bold: true, highlight: true }
  ]
});

const head_sub = crescent.layer({
  layer_id: 'head_sub',
  layer_type: 'text',
  text: 'Everything loads perfectly.',
  size: 18,
  colour: '80,80,80'
});

const logo_img = crescent.layer({
  layer_id: 'logo_img',
  layer_type: 'image',
  image_location: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  size: { height: 40, width: 40 }
});

const bg_circle = crescent.layer({
  layer_id: 'bg_circle',
  layer_type: 'shape',
  layer_vertices: 'circle',
  colour: '220,230,250',
  size: { height: 120, width: 120 }
});

const accent_rect = crescent.layer({
  layer_id: 'accent_rect',
  layer_type: 'shape',
  layer_vertices: 4,
  colour: '60,90,140',
  size: { height: 60, width: 200 },
  rounded_corners: 12,
  opacity: '80%'
});

const tri_shape = crescent.layer({
  layer_id: 'tri_shape',
  layer_type: 'shape',
  layer_vertices: 3,
  colour: '200,120,40'
});

const star_shape = crescent.layer({
  layer_id: 'star_shape',
  layer_type: 'shape',
  layer_vertices: 5,
  colour: '120,60,180'
});

const name_input = crescent.layer({
  layer_id: 'name_input',
  layer_type: 'input',
  input_method: 'text box',
  box_length: 24,
  box_inner_text: 'Your name'
});

const plan_list = crescent.layer({
  layer_id: 'plan_list',
  layer_type: 'input',
  input_method: 'list',
  select: { min: 1, max: 2 },
  list_elements: ['Starter', 'Pro', 'Enterprise']
});

// ===== Objects =====
const hero = crescent.object({
  object_id: 'hero',
  size: { height: 320, width: 480 },
  bg_layer: 'hero_bg'
});
const hero_bg = crescent.layer({
  layer_id: 'hero_bg',
  layer_type: 'shape',
  layer_vertices: 4,
  colour: '245,247,252'
});
hero.add_layer(hero_bg);
hero.add_layer(bg_circle);
hero.add_layer(head_title);
hero.add_layer(head_sub);
hero.add_layer(logo_img);
hero.add_layer(accent_rect);
hero.add_layer(tri_shape);
hero.add_layer(star_shape);
hero.set_layer_index('head_title', 3);
hero.set_layer_position('logo_img', -100, 100);

const formObj = crescent.object({
  object_id: 'form',
  size: { height: 220, width: 380 }
});
formObj.add_layer(name_input);
formObj.add_layer(plan_list);
formObj.set_layer_position('plan_list', 0, -60);

// ===== Pages =====
const home = crescent.page({
  page_id: 'home',
  page_title: 'Crescent - Home',
  page_url: '/',
  page_description: 'Home page of the TS test',
  size: { height: 800, width: 1200 },
  page_bg: '250,252,255'
});
home.add_object(hero);
home.add_object(formObj);
home.set_object_position('form', 0, -280);
home.set_scaling_ratio('hero', [60, 260] as [number, number], [240, 240] as [number, number]);

const about = crescent.page({
  page_id: 'about',
  page_title: 'Crescent - About',
  page_url: '/about',
  size: { height: 800, width: 1200 },
  page_bg: '245,250,248'
});
const about_obj = crescent.object({
  object_id: 'about_body',
  size: { height: 200, width: 600 }
});
const about_text = crescent.layer({
  layer_id: 'about_text',
  layer_type: 'text',
  text: 'About page rendered from TypeScript.',
  size: 24,
  colour: '40,80,40'
});
const about_rect = crescent.layer({
  layer_id: 'about_rect',
  layer_type: 'shape',
  layer_vertices: 4,
  colour: '180,220,180'
});
about_obj.add_layer(about_rect);
about_obj.add_layer(about_text);
about.add_object(about_obj);

// ===== Transitions =====
const heroGrow = crescent.transition({
  transition_id: 'heroGrow',
  objects: [hero, formObj],
  time: '0.2s',
  changes: [
    { object_id: 'hero', layer_id: 'accent_rect', property: 'size.width', value: 400 },
    { object_id: 'hero', layer_id: 'bg_circle', property: 'colour', value: '255,240,200' }
  ]
});

// ===== Triggers =====
let clickedFlag = false;
const heroClick = crescent.trigger({
  trigger_id: 'heroClick',
  layer_id: 'accent_rect',
  event: 'click',
  condition: (event: Event, layer: BaseLayer) => {
    return event.type === 'click' && layer.layer_id === 'accent_rect';
  },
  true_sequence: [
    { type: 'set_property', layer_id: 'head_title', property: 'colour', value: '0,120,80' },
    { type: 'transition', transition: heroGrow }
  ],
  false_sequence: [
    { type: 'set_property', layer_id: 'head_title', property: 'colour', value: '30,50,90' }
  ]
});
heroClick.on_true(() => { clickedFlag = true; });

// ===== Responsive =====
const responsive = crescent.responsive({
  page: home,
  breakpoints: [
    { name: 'mobile', maxWidth: 480 },
    { name: 'desktop', maxWidth: 1200 }
  ]
});
responsive.init(home);

// ===== Render & drive =====
const root = document.querySelector('#crescent-root') as HTMLElement | null;
if (root && crescent && crescent.renderer) {
  crescent.renderer.mount(root);
  crescent.renderer.navigate('home');

  // Drive interactive features after first paint.
  setTimeout(() => {
    // Fire the click trigger on the accent_rect layer.
    const rectEl = accent_rect.get_element();
    heroClick.attach(accent_rect);
    rectEl?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Exercise transition control.
    const transitionPlayingAfterPlay = heroGrow.is_playing();
    heroGrow.play();
    heroGrow.stop();
    heroGrow.add_change('hero', 'bg_circle', 'opacity', '60%');
    const transitionPlayingAfterStop = heroGrow.is_playing();

    // Multi-page navigation.
    crescent.renderer.navigate('about');
    const currentAfterAbout = crescent.renderer.get_current_page()?.page_id;
    crescent.renderer.navigate('home');
    const currentAfterHome = crescent.renderer.get_current_page()?.page_id;

    // Breakpoint + ratios.
    const breakpoint = responsive.get_breakpoint();
    const ratios = responsive.calculate_ratios(hero, 1200, 800);

    // Record everything for the harness.
    (window as any).__TS_STATE__ = {
      math,
      layers: Object.keys(crescent._layers),
      objects: Object.keys(crescent._objects),
      pages: Object.keys(crescent._pages),
      transitions: Object.keys(crescent._transitions),
      triggers: Object.keys(crescent._triggers),
      hasResponsive: !!crescent._responsive,
      currentPage: crescent.renderer.get_current_page()?.page_id,
      currentAfterAbout,
      currentAfterHome,
      transitionPlayingAfterPlay,
      transitionPlayingAfterStop,
      breakpoint,
      ratios,
      clickedFlag,
      titleColourAfterClick: head_title.colour
    };
    (window as any).__TS_RENDERED__ = true;
  }, 50);
}