#!/usr/bin/env node
/**
 * TypeScript Backend (Node) suite.
 *
 * Type-checks test/backend/app.ts, transpiles + runs it in Node against the
 * real framework (src/rocket.js), then asserts on every backend feature.
 *
 * Usage: node test/phase1/test_backend.js   (or npm test)
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BACKEND_DIR = path.join(ROOT, 'test', 'backend');

let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); passed++; console.log('[PASS]', name); }
  catch (err) { failed++; console.log('[FAIL]', name, '->', err.message); }
}

// 1. Build: type-check + transpile.
const build = spawnSync(process.execPath, [path.join(BACKEND_DIR, 'build.js')], {
  encoding: 'utf8', cwd: ROOT
});
test('backend app.ts type-checks and compiles', () => {
  if (build.status !== 0) throw new Error((build.stdout || '') + (build.stderr || ''));
  if (!fs.existsSync(path.join(BACKEND_DIR, 'compiled_app.js'))) throw new Error('compiled_app.js missing');
});

const COMPILED = path.join(BACKEND_DIR, 'compiled_app.js');
const STATE_MARKER = '__STATE__';

// 2. Run the compiled app in a throwaway cwd so data files stay out of the repo.
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'crescent-backend-'));
try {
  const run = spawnSync(process.execPath, [COMPILED], {
    encoding: 'utf8', cwd: sandbox, timeout: 60000
  });
  test('compiled backend app runs to completion (exit 0)', () => {
    if (run.status !== 0) throw new Error('exit ' + run.status + ' :: ' + (run.stderr || run.stdout || ''));
  });

  const stateText = (run.stdout || '').split('\n').find((l) => l.startsWith(STATE_MARKER));
  const state = stateText ? JSON.parse(stateText.slice(STATE_MARKER.length)) : null;
  test('backend app emitted __STATE__ JSON', () => {
    if (!state || typeof state !== 'object') throw new Error('no state captured');
  });

  const truthy = [
    ['db_created', 'db.create works', true],
    ['db_exists_before', 'db.exists reports true for created collection', true],
    ['db_list', 'list_collections() includes users', true],
    ['db_list_cities', 'list_collections() includes cities', true],
    ['db_count', 'insert + insert_many produce 4 documents', 4],
    ['db_find_age', 'find with $gte operator', 2],
    ['db_find_stream', 'find with $contains operator', 2],
    ['db_find_one', 'find_one returns matching doc', true],
    ['db_find_by_id', 'find_by_id returns the doc', true],
    ['db_sort_desc', 'sort desc by age', true],
    ['db_limit', 'limit returns cap', 2],
    ['db_update', 'update applies to matching doc', true],
    ['db_delete', 'delete removes matching doc', true],
    ['db_drop', 'drop removes a collection', true],
    ['db_len_after', 'final db count after delete', 3],
    ['ls_search', 'liveSearch.search finds indexed term'],
    ['ls_fuzzy', 'liveSearch.fuzzy_search matches fuzzy term'],
    ['ls_watch', 'liveSearch.watch registers without error'],
    ['auth_signup', 'auth.signup registers a user'],
    ['auth_dup_rejected', 'duplicate signup is rejected'],
    ['auth_login', 'auth.login authenticates and returns a signed session'],
    ['auth_login_rejected', 'wrong password is rejected'],
    ['pw_strong', 'password strength detects strong'],
    ['pw_weak', 'password strength detects weak'],
    ['pw_hash_verify', 'password.hash + verify round-trip'],
    ['pw_hash_rejects', 'password.verify rejects wrong password'],
    ['pw_token', 'reset token generation'],
    ['ck_token', 'cookie.create_token produces a token'],
    ['ck_verify', 'cookie.verify_token accepts valid token'],
    ['ck_parse', 'cookie.parse_cookies splits headers'],
    ['ck_session', 'cookie.get_session extracts the session'],
    ['oauth_url', 'oauth.get_authorize_url builds provider URL'],
    ['comp_roundtrip', 'compress/decompress round-trip (plain)'],
    ['comp_secret_roundtrip', 'compress/decompress with secret'],
    ['tun_roundtrip', 'tunnel.send + receive round-trip'],
    ['tun_open', 'tunnel starts open'],
    ['tun_handshake_ok', 'tunnel.handshake reports open'],
    ['tun_closed', 'tunnel.close() takes effect'],
    ['fn_call', 'function.call invokes the body'],
    ['fn_disabled', 'disabled function returns undefined'],
    ['loop_for', 'for loop runs with step'],
    ['loop_while', 'while loop runs to completion'],
    ['loop_for_in', 'for_in loop iterates'],
    ['cond_if', 'conditional true branch fires'],
    ['cond_else', 'conditional else branch fires'],
    ['cond_if_ran', 'if branch action executed'],
    ['cond_else_ran', 'else branch action executed'],
    ['bool_and', 'boolean AND'],
    ['bool_or', 'boolean OR'],
    ['bool_not', 'boolean NOT'],
    ['bool_chain', 'chained boolean evaluation'],
    ['collect_gather', 'collect gathers from sources + transform'],
    ['collect_data', 'collect.get_data returns the transformed payload'],
    ['cache_enabled', 'component cache enable() works'],
    ['cache_first_update', 'first resolve returns an update'],
    ['cache_second_reuse', 'second resolve reuses the cached component'],
    ['cache_cached', 'component is retrievable via get_cached'],
    ['cache_clear', 'cache.clear() empties the store'],
    ['api_roundtrip', 'api_make + api_call encrypted HTTP round-trip'],
  ];
  for (const [key, label, expected] of truthy) {
    test(label + ' (' + key + ')', () => {
      const want = expected === undefined ? true : expected;
      if (state[key] !== want) throw new Error('state["' + key + '"]=' + JSON.stringify(state[key]));
    });
  }
  test('api.response echoed the request body', () => {
    const echoed = state.api_response;
    if (!echoed || echoed.answer !== 42 || echoed.question !== 'life') {
      throw new Error('echoed=' + JSON.stringify(echoed));
    }
  });
} finally {
  try {
    const sandboxRoot = path.join(sandbox, 'crescent_data');
    if (fs.existsSync(sandboxRoot)) fs.rmSync(sandbox, { recursive: true, force: true });
    else fs.rmSync(sandbox, { recursive: true, force: true });
  } catch (e) { /* ignore */ }
}

console.log('');
console.log(failed === 0 ? '[ALL PASS] ' + passed + ' passed, ' + failed + ' failed'
  : '[FAILED] ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);