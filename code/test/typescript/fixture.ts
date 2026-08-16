/**
 * TypeScript compatibility fixture (v1.0.5).
 *
 * Imports the package the way a real TypeScript consumer would and
 * exercises the public API so `tsc --noEmit` proves that:
 *   - `index.d.ts` resolves via the package.json "types" field,
 *   - every public method / class / interface is correctly typed,
 *   - the `export = rocket` singleton shape works with `import` syntax.
 *
 * This file is type-checked but never executed.
 */

import rocket, {
  Rocket,
  BaseLayer,
  TextLayer,
  ImageLayer,
  ShapeLayer,
  InputLayer,
  RocketObject,
  RocketPage,
  RocketRenderer,
  Transition,
  Trigger,
  Responsive,
  RocketFunction,
  Conditional,
  Loop,
  ApiCall,
  ApiMake,
  Collect,
  RocketBoolean,
  EncryptedTunnel,
  ComponentCache,
  DatabaseSyntax,
  QueryEngine,
  FileManager,
  LiveSearch,
  Signup,
  Login,
  OAuth,
  Password,
  Cookie,
  ScalingRatios,
  PasswordHash,
  PasswordStrength,
  SessionPayload,
  ComponentResolution
} from 'crescent-js';

// ---- Singleton + class export shape ----
const r: Rocket = rocket;
const RocketCtor: typeof Rocket = rocket.Rocket;
const custom = new RocketCtor();

// ---- Frontend ----
const title: TextLayer = rocket.layer({
  layer_id: 'title',
  layer_type: 'text',
  text: 'Hello',
  size: { width: 200, height: 40 },
  properties: [{ range: [0, 2], bold: true }]
});
const bg: ShapeLayer = rocket.layer({
  layer_id: 'bg',
  layer_type: 'shape',
  layer_vertices: 4,
  colour: '10,20,30'
});
const pic: ImageLayer = rocket.layer({
  layer_id: 'pic',
  layer_type: 'image',
  image_location: 'img/logo.png'
});
const field: InputLayer = rocket.layer({
  layer_id: 'field',
  layer_type: 'input',
  input_method: 'text box',
  list_elements: ['a', 'b']
});

const obj: RocketObject = rocket.object({
  object_id: 'hero',
  size: { height: 400, width: 300 }
});
obj.add_layer(title).add_layer(bg);
obj.get_layer('title');
obj.set_layer_position('title', -10, 5);
obj.set_layer_index('title', 1);
obj.set_bg_layer('bg');
obj.remove_layer('bg');
obj.get_value();
obj.set_property('object_enabled', true);
obj.set_transition(new Transition({ time: '1s', changes: [] }));

const page: RocketPage = rocket.page({
  page_id: 'home',
  size: { height: 800, width: 1200 },
  page_title: 'Home'
});
page.add_object(obj);
page.set_object_position('hero', 0, 0);
page.set_object_index('hero', 0);
page.set_scaling_ratio('hero', [0, 0], [0, 0]);
page.navigate_to('about');
page.get_values();
page.destroy();

const t = rocket.transition({ time: '2s' });
t.add_change('hero', 'title', 'size.width', 300).play(() => {}).reverse().stop();
const playing: boolean = t.is_playing();

const trig = rocket.trigger({
  layer_id: 'title',
  event: 'click',
  condition: () => true,
  true_sequence: [{ type: 'transition', transition: t }]
});
trig.on_true({ type: 'set_property', layer_id: 'title', property: 'colour', value: '1,1,1' });
trig.set_condition(() => false);
trig.set_redirect('/home');
trig.attach();
trig.tryAttach();
trig.detach();

const responsive = rocket.responsive({ page });
responsive.init();
const bp: string = responsive.get_breakpoint();
const ratios: ScalingRatios = responsive.calculate_ratios(obj, 1200, 800);
responsive.scale_object(obj, 1200, 800, 800, 600);
responsive.destroy();

// ---- Backend ----
const fn = rocket.function({ function_id: 'greet', params: ['name'], body: (name: string) => 'hi ' + name });
const greeting: string = fn.call('ada');
fn.set_enabled(false).set_body(() => 'x');
fn.get_params();

const cond = rocket.conditional({ conditional_id: 'c' });
cond.set_if(() => true, [() => 1]);
cond.add_else_if(() => false, []);
cond.set_else([]);
const which: 'if' | 'else_if' | 'else' | null = cond.evaluate();

const loop = rocket.loop({ loop_id: 'l', loop_type: 'for', start: 0, end: 5 });
const results: any[] = loop.run();
loop.get_results();

const boolExpr = rocket.boolean({ boolean_id: 'b', operator: 'AND' });
const truthy: boolean = boolExpr.evaluate();
boolExpr.and(boolExpr).or(boolExpr).not();

const call = rocket.api_call({ api_call_id: 'c1', url: 'https://example.com/api' });
const callPromise: Promise<any> = call.call();
call.get_response();
call.get_error();

const api = rocket.api_make({ api_id: 'rest', port: 3000 });
api.add_endpoint('GET', '/ping', (req: any, res: any) => { res.writeHead(200); res.end('pong'); });
api.use((req: any, res: any, next: () => void) => next());
const serverInfo: Promise<{ port: number; host: string }> = api.start();
api.stop();

const collect = rocket.collect({ collect_id: 'form' });
collect.add_source(field);
collect.set_transform((data: any) => data);
collect.set_validate((data: any) => !!data);
const collected: any = collect.collect();
const sent: Promise<any> = collect.send('https://example.com', { method: 'POST', secret: 's' });

// ---- Compression & cipher ----
const packed: string = rocket.compress({ ok: true }, 'secret');
const unpacked: any = rocket.decompress(packed, 'secret');

// ---- Tunnels ----
const tunnel: EncryptedTunnel = rocket.tunnel({ tunnel_id: 't1', secret: 'secret' });
const packet: string = tunnel.send({ hello: 'world' });
const received: any = tunnel.receive(packet);
const hs: { status: 'open' | 'closed' } = tunnel.handshake('remote', 'secret');
tunnel.sendAsTunnel({ x: 1 });
const open: boolean = tunnel.is_open();
tunnel.close();

// ---- Component cache ----
const cache = rocket.component_cache({ cache_dir: '/tmp/crescent_cache' });
cache.enable();
cache.disable();
const enabled: boolean = cache.is_enabled();
cache.store_component(obj);
cache.resolve_component(obj);
cache.get_cached('hero');
cache.build_page_payload(page);
cache.clear();
const payload = rocket.render_page_payload(page, {});
const comps: ComponentResolution[] = payload.components;

// ---- Database ----
const db = rocket.db;
db.create('users');
db.insert('users', { name: 'Ada', age: 36 });
db.insert_many('users', [{ name: 'Grace', age: 45 }]);
const found: any[] = db.find('users', { age: { $gt: 30 } });
const one: any | null = db.find_one('users', { name: 'Ada' });
db.find_by_id('users', 'abc');
db.update('users', { name: 'Ada' }, { age: 37 });
db.update_one('users', { name: 'Ada' }, { age: 38 });
db.delete('users', { name: 'Ada' });
db.delete_one('users', { name: 'Grace' });
const total: number = db.count('users');
db.sort('users', {}, 'age', 'desc');
db.limit('users', {}, 10);
const list: string[] = db.list_collections();
db.exists('users');
db.drop('users');

const ls = rocket.liveSearch;
ls.build_index('users', 'name');
const hits: any[] = ls.search('users', 'name', 'ada');
const fuzzy: any[] = ls.fuzzy_search('users', 'ada', { threshold: 0.6, fields: ['name'] });
ls.watch('users', (event: any) => event.data);
ls.notify('users', 'insert', { id: 1 });

// ---- Auth ----
const signup = rocket.auth.signup({ collection: 'users' });
const signupResult: Promise<any> = signup.register('ada', 'ada@example.com', 'StrongPass123!');
const login = rocket.auth.login({});
const authResult: Promise<any> = login.authenticate('ada', 'StrongPass123!');
const session: SessionPayload | null = login.verify_session('token');
login.get_user_from_token('token');
const logoutResult: { success: boolean; clear_cookie: string } = login.logout();
const oauth = rocket.auth.oauth({});
oauth.add_provider('github', {
  client_id: 'x',
  client_secret: 'y',
  authorize_url: 'https://github.com/login/oauth/authorize',
  token_url: 'https://github.com/login/oauth/access_token',
  user_info_url: 'https://api.github.com/user',
  redirect_uri: 'http://localhost:3000/cb'
});
const url: string = oauth.get_authorize_url('github');
const pw = rocket.auth.password;
const hashed: PasswordHash = pw.hash('pass');
const valid: boolean = pw.verify('pass', hashed.hash, hashed.salt);
const reset: string = pw.generate_reset_token();
const strength: PasswordStrength = pw.check_strength('pass');
const cookie = rocket.auth.cookie;
const token: string = cookie.create_token('user1');
const cookieParsed: Record<string, string> = cookie.parse_cookies('a=1; b=2');
const header: string = cookie.set_cookie_header(token);
cookie.clear_cookie_header();

// ---- Renderer ----
const renderer: RocketRenderer = rocket.renderer;
renderer.basehtml('<html><body><div id="crescent-root"></div></body></html>');
renderer.root('#crescent-root');
renderer.register_page(page);
const fullHtml: string = renderer.render_full_page('home');
renderer.get_page('home');
renderer.get_current_page();

// ---- BaseLayer typed usage ----
const base: BaseLayer = title;
const el: HTMLElement | null = base.get_element();
base.set_property('colour', '255,255,255');

// ---- Class references available as named exports ----
const classes: Array<Function> = [Rocket, BaseLayer, TextLayer, ImageLayer, ShapeLayer, InputLayer, RocketObject, RocketPage, RocketRenderer, Transition, Trigger, Responsive, RocketFunction, Conditional, Loop, ApiCall, ApiMake, Collect, RocketBoolean, EncryptedTunnel, ComponentCache, DatabaseSyntax, QueryEngine, FileManager, LiveSearch, Signup, Login, OAuth, Password, Cookie];

export { rocket, custom };