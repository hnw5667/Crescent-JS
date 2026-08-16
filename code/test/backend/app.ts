/**
 * Comprehensive TypeScript backend harness (v1.0.5).
 *
 * Runs in Node against the REAL framework entry (require('crescent-js')
 * resolves to src/rocket.js). Type-checked by tsc against index.d.ts, then
 * transpiled + executed here. Every feature reports a boolean/value into the
 * returned state object that test_backend.js asserts on.
 *
 * Covered surface:
 *   - DB: create/insert/find/find_one/update/delete/count/sort/limit/exists
 *   - Live search: build_index/search/fuzzy_search/watch
 *   - Auth: signup, login, password strength/hash/verify, cookie tokens
 *   - Compression: compress/decompress round-trip (plain + secret)
 *   - Encrypted tunnels: send/receive/handshake/is_open/close
 *   - Functions, loops (for/while/for_in), conditionals, booleans
 *   - Collect: gather from sources + transform + validate
 *   - Component cache: enable/resolve/store/reuse/clear
 *   - API: api_make + api_call real HTTP round-trip over a local socket
 */
import crescent, { Rocket } from 'crescent-js';

export async function run(): Promise<Record<string, unknown>> {
  const state: Record<string, unknown> = {};

  // ===== DB =====
  const r = new Rocket();
  r.db.create('users');
  r.db.create('cities');
  state.db_created = true;
  state.db_exists_before = r.db.exists('users');
  const collections = r.db.list_collections().map((c: string) => c.replace('.json', ''));
  state.db_list = collections.indexOf('users') !== -1;
  state.db_list_cities = collections.indexOf('cities') !== -1;

  const alice = r.db.insert('users', { name: 'Alice', age: 30, city: 'Paris' });
  const bob = r.db.insert('users', { name: 'Bob', age: 25, city: 'Lyon' });
  r.db.insert_many('users', [
    { name: 'Cara', age: 41, city: 'Nice' },
    { name: 'Dan', age: 19, city: 'Paris' }
  ]);
  state.db_count = r.db.count('users');
  state.db_find_age = r.db.find('users', { age: { $gte: 30 } }).length;
  state.db_find_stream = r.db.find('users', { city: { $contains: 'is' } }).length;
  state.db_find_one = r.db.find_one('users', { name: 'Bob' })?.name === 'Bob';
  state.db_find_by_id = r.db.find_by_id('users', alice._id)?.name === 'Alice';
  state.db_sort_desc = r.db.sort('users', {}, 'age', 'desc')[0]?.name === 'Cara';
  state.db_limit = r.db.limit('users', {}, 2).length;
  state.db_update = r.db.update('users', { name: 'Alice' }, { age: 31 }) === 1;
  state.db_delete = r.db.delete('users', { name: 'Dan' }) === 1;
  state.db_drop = (r.db.drop('cities'), !r.db.exists('cities'));
  state.db_len_after = r.db.count('users');

  // ===== Live Search =====
  r.liveSearch.build_index('users', 'name');
  state.ls_search = r.liveSearch.search('users', 'name', 'ali').length >= 1;
  state.ls_fuzzy = r.liveSearch.fuzzy_search('users', 'alice').length >= 1;
  state.ls_watch = true; // watch() registered with no error
  r.liveSearch.watch('users', () => {});

  // ===== Auth =====
  const signup = r.auth.signup({ collection: 'users' });
  const registered = await signup.register('alice@example.com', 'alice@example.com', 'StrongPass123!');
  state.auth_signup = registered.success === true && !!registered.user;
  const dup = await r.auth.signup({ collection: 'users' })
    .register('alice@example.com', 'alice@example.com', 'StrongPass123!');
  state.auth_dup_rejected = dup.success === false;

  const login = await r.auth.login({ collection: 'users' })
    .authenticate('alice@example.com', 'StrongPass123!');
  state.auth_login = login.success === true && !!login.token && !!login.set_cookie;
  const bad = await r.auth.login({ collection: 'users' }).authenticate('alice@example.com', 'wrongpass');
  state.auth_login_rejected = bad.success === false;

  const pw = r.auth.password;
  state.pw_strong = pw.check_strength('StrongPass123!').strength === 'strong';
  state.pw_weak = pw.check_strength('abc').strength === 'weak';
  const hashed = pw.hash('hunter2');
  state.pw_hash_verify = pw.verify('hunter2', hashed.hash, hashed.salt);
  state.pw_hash_rejects = !pw.verify('wrong', hashed.hash, hashed.salt);
  state.pw_token = pw.generate_reset_token().length > 0;

  const ck = r.auth.cookie;
  const token = ck.create_token('user-1');
  state.ck_token = !!token;
  state.ck_verify = ck.verify_token(token)?.user_id === 'user-1';
  state.ck_parse = ck.parse_cookies('a=1; b=2').b === '2';
  state.ck_session = ck.get_session(`crescent_session=${token}`)?.user_id === 'user-1';

  // OAuth provider registration + authorize URL (no network).
  const oauth = r.auth.oauth({
    providers: {
      google: {
        client_id: 'g123',
        client_secret: 'sec',
        authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
        token_url: 'https://oauth2.googleapis.com/token',
        user_info_url: 'https://openidconnect.googleapis.com/v1/userinfo',
        redirect_uri: 'http://localhost:3000/oauth/google/callback'
      }
    }
  });
  state.oauth_url = oauth.get_authorize_url('google').indexOf('client_id=g123') !== -1;

  // ===== Compression =====
  const long = ('Crescent.js compression test '.repeat(400));
  const packed = crescent.compress(long);
  state.comp_roundtrip = crescent.decompress(packed) === long;
  const secret = 'crescent-demo-secret';
  const prepared = crescent.compress({ app: 'crescent', n: 42 }, secret);
  const opened = crescent.decompress(prepared, secret);
  state.comp_secret_roundtrip = opened && opened.app === 'crescent' && opened.n === 42;

  // ===== Encrypted Tunnels =====
  const tun = crescent.tunnel({ tunnel_id: 'browser-harness-tunnel', secret });
  const packet = tun.send({ hello: 'world', list: [1, 2, 3] }, { secret });
  const received = tun.receive(packet, { secret });
  state.tun_roundtrip = received.hello === 'world' && received.list.join(',') === '1,2,3';
  state.tun_open = tun.is_open();
  state.tun_handshake_ok = tun.handshake('', secret).status === 'open';
  tun.close();
  state.tun_closed = tun.is_open() === false;

  // ===== Functions =====
  const fn = crescent.function({
    function_id: 'double',
    body: (x: number) => x * 2
  });
  state.fn_call = fn.call(4) === 8;
  fn.set_enabled(false);
  state.fn_disabled = fn.call(4) === undefined;

  // ===== Loops =====
  const forSum: number[] = [];
  const forLoop = crescent.loop({
    loop_id: 'for1',
    loop_type: 'for',
    start: 0, end: 3, step: 1,
    actions: [(i: number) => i * 10]
  });
  state.loop_for = forLoop.run().join(',') === '0,10,20';

  let wc = 0;
  const whileLoop = crescent.loop({
    loop_id: 'while1',
    loop_type: 'while',
    condition: () => wc < 4,
    actions: [(i: number) => { wc++; return i; }]
  });
  const whileRes = whileLoop.run();
  state.loop_while = whileRes.length === 4;

  const forIn = crescent.loop({
    loop_id: 'forin1',
    loop_type: 'for_in',
    iterable: ['a', 'b', 'c'],
    actions: [(item: string) => item.toUpperCase()]
  });
  state.loop_for_in = forIn.run().join(',') === 'A,B,C';

  // ===== Conditionals =====
  const condTrue = crescent.conditional({
    conditional_id: 'c1',
    if: { check: () => true, actions: [(_: any) => { state.cond_if_ran = true; }] },
    else: { actions: [] }
  });
  state.cond_if = condTrue.evaluate() === 'if';
  const condElse = crescent.conditional({
    conditional_id: 'c2',
    if: { check: () => false, actions: [] },
    else: { actions: [(_: any) => { state.cond_else_ran = true; }] }
  });
  state.cond_else = condElse.evaluate() === 'else';

  // ===== Booleans =====
  const bAnd = crescent.boolean({ boolean_id: 'b1', value1: true, value2: true, operator: 'AND' });
  const bOr = crescent.boolean({ boolean_id: 'b2', value1: false, value2: true, operator: 'OR' });
  const bNot = crescent.boolean({ boolean_id: 'b3', value1: true, operator: 'NOT' });
  state.bool_and = bAnd.evaluate() === true;
  state.bool_or = bOr.evaluate() === true;
  state.bool_not = bNot.evaluate() === false;
  state.bool_chain = bAnd.or(bOr).evaluate() === true;

  // ===== Collect =====
  const source = {
    layer_id: 'form_name',
    get_value: () => 'Alice'
  };
  const collect = crescent.collect({
    collect_id: 'col1',
    sources: [source],
    transform: (data: Record<string, unknown>) => ({ payload: data }),
    validate: (data: { payload: Record<string, unknown> }) => data.payload.form_name === 'Alice'
  });
  state.collect_gather = collect.collect().payload.form_name === 'Alice';
  state.collect_data = collect.get_data()?.payload?.form_name === 'Alice';

  // ===== Component Cache =====
  const cacheDir = process.cwd() + '/.backend-cache';
  const cache = crescent.component_cache({ cache_dir: cacheDir, tracker_dir: cacheDir + '/.tracker' });
  cache.enable();
  state.cache_enabled = cache.is_enabled();
  const page = r.page({
    page_id: 'home',
    size: { height: 800, width: 1200 }
  });
  const btn = r.object({
    object_id: 'btn',
    size: { height: 40, width: 100 },
    layers_config: [
      { layer_id: 'btn_bg', layer_type: 'shape', layer_vertices: 4, size: { height: 40, width: 100 } }
    ]
  });
  page.add_object(btn);
  const first = cache.resolve_component(btn, { x: 0, y: 0 }, 0);
  state.cache_first_update = first.type === 'update' && !!first.component;
  const second = cache.resolve_component(btn, { x: 0, y: 0 }, 0);
  state.cache_second_reuse = second.type === 'reuse';
  state.cache_cached = cache.get_cached('btn') !== null;
  state.cache_clear = (cache.clear(), cache.load_cache().length === 0);

  // ===== API: real HTTP round-trip =====
  const port = 48000 + Math.floor(Math.random() * 1000);
  const api = crescent.api_make({
    api_id: 'testapi',
    port,
    host: '127.0.0.1',
    secret: 'api-secret',
    endpoints: [
      {
        method: 'POST',
        path: '/echo',
        handler: (req: any, res: any) => {
          res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
          res.end(crescent.compress({ echoed: req.body }, 'api-secret'));
        }
      }
    ]
  });
  await api.start();
  const call = crescent.api_call({
    api_call_id: 'call1',
    url: `http://127.0.0.1:${port}/echo`,
    method: 'POST',
    body: { question: 'life', answer: 42 },
    secret: 'api-secret',
    timeout: 5000
  });
  const response = await call.call();
  state.api_roundtrip = response && response.echoed && response.echoed.answer === 42;
  state.api_response = response ? response.echoed : null;
  await api.stop();

  return state;
}