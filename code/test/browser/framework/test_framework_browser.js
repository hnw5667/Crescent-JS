#!/usr/bin/env node
/**
 * Framework-layers real-browser check.
 *
 * Serves test/browser/framework/ (+ React UMD vendor files), renders the
 * page in headless Edge/Chrome, and asserts:
 *   1. The React snippet really loads (ReactDOM output in the layer box).
 *   2. The Angular snippet loads as a layer (box + inert code attached).
 *   3. Fitting layers show NO error; the overflowing layer DOES show the
 *      red overflow error (console + badge + assert_fits throw).
 *
 * Usage: node test/browser/framework/test_framework_browser.js
 */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const DIR = __dirname;
const CODE_ROOT = path.resolve(DIR, '..', '..', '..');
const PORT = 8125;
const BASE = 'http://127.0.0.1:' + PORT;

const VENDOR = {
  '/vendor/react.production.min.js': path.join(
    CODE_ROOT, '..', 'website', 'node_modules', 'react', 'umd', 'react.production.min.js'),
  '/vendor/react-dom.production.min.js': path.join(
    CODE_ROOT, '..', 'website', 'node_modules', 'react-dom', 'umd', 'react-dom.production.min.js')
};

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('[PASS]', name); }
  catch (err) { failed++; console.log('[FAIL]', name, '->', err.message); }
}

function findBrowser() {
  const candidates = [
    process.env.EDGE_PATH, process.env.CHROME_PATH,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

function waitForServer(url, ms) {
  const start = Date.now();
  return new Promise((res, rej) => {
    (function tick() {
      http.get(url, (r) => { r.resume(); res(); })
        .on('error', () => (Date.now() - start > ms ? rej(new Error('server timeout')) : setTimeout(tick, 150)));
    })();
  });
}

function serve() {
  const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    // Result beacon from the page (primary channel — see index.html).
    if (urlPath === '/__result__') {
      try {
        const query = req.url.split('?')[1] || '';
        const m = /(?:^|&)d=([^&]*)/.exec(query);
        server.captured = m ? JSON.parse(decodeURIComponent(m[1].replace(/\+/g, '%20'))) : null;
      } catch (e) { server.captured = { beaconParseError: String(e.message) }; }
      res.writeHead(204);
      res.end();
      return;
    }
    let file;
    if (VENDOR[urlPath]) {
      file = VENDOR[urlPath];
    } else {
      const rel = urlPath === '/' ? '/index.html' : urlPath;
      file = path.join(DIR, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
    }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('not found: ' + urlPath); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  });
  return server;
}

function domResult(dom) {
  const m = /<script type="text\/plain" id="crescent-result">([\s\S]*?)<\/script>/.exec(dom);
  if (!m || !m[1].trim()) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

async function main() {
  const browser = findBrowser();
  test('found a real browser (Edge/Chrome)', () => {
    if (!browser) throw new Error('none found; set EDGE_PATH/CHROME_PATH');
  });
  if (!browser) process.exit(1);
  console.log('  browser:', browser);

  for (const [url, file] of Object.entries(VENDOR)) {
    test('vendor present: ' + url, () => {
      if (!fs.existsSync(file)) throw new Error('missing ' + file);
    });
  }

  const build = spawnSync(process.execPath, [path.join(DIR, 'build_fw.js')], { encoding: 'utf8', cwd: CODE_ROOT });
  test('build_fw.js bundles real framework modules + app', () => {
    if (build.status !== 0) throw new Error((build.stdout || '') + (build.stderr || ''));
    if (!fs.existsSync(path.join(DIR, 'bundle_fw.js'))) throw new Error('bundle_fw.js not produced');
  });
  if (build.status !== 0) process.exit(1);

  const server = serve();
  await new Promise((res) => server.listen(PORT, res));
  await waitForServer(BASE + '/', 10000);

  // Launch the browser WITHOUT --dump-dom (it never terminates here).
  // The page beacons its result JSON back to the server (see index.html);
  // we wait for the beacon, then kill the browser and assert.
  // An isolated --user-data-dir keeps the test off any running Edge profile.
  const os = require('os');
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crescent-fw-edge-'));
  const browserProc = spawn(browser, [
    '--headless', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--disable-extensions', '--disable-dev-shm-usage', '--no-zygote',
    '--hide-scrollbars', '--user-data-dir=' + profileDir, BASE + '/'
  ], { stdio: 'ignore' });
  browserProc.unref();

  const r = await new Promise((resolve) => {
    const start = Date.now();
    (function poll() {
      if (server.captured) return resolve(server.captured);
      if (Date.now() - start > 60000) return resolve(null);
      setTimeout(poll, 250);
    })();
  });

  try { browserProc.kill('SIGKILL'); } catch (e) {}
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) {}

  try {
    test('page beaconed its result JSON back', () => {
      if (!r || r.beaconParseError) {
        throw new Error(r && r.beaconParseError ? r.beaconParseError : 'no /__result__ beacon captured in 60s');
      }
    });
    if (!r || r.beaconParseError) { server.close(); process.exit(1); }

    // ---- React layers (string + component, multiple per page) ----
    test('react layer box rendered in the page', () => {
      if (!r.reactBoxPresent) throw new Error('no [data-layer-id="react"] in DOM');
      if (!r.reactBoxHasMount) throw new Error('react box has no mount node');
      if (!r.reactBoxHasCode) throw new Error('react box lost its code holder');
    });
    test('two react layers coexist with unique mount ids', () => {
      const str = r.appResults.string || {};
      if (str.reason !== 'uncompiled-source') {
        throw new Error("string layer did not stay inert: " + JSON.stringify(str));
      }
      const hero = r.appResults.hero || {};
      if (hero.mounted !== true) throw new Error('hero layer not mounted: ' + JSON.stringify(hero));
      const overflow = r.appResults.overflow || {};
      if (overflow.mounted !== true) throw new Error('overflow layer not mounted: ' + JSON.stringify(overflow));
    });
    test('string react layer stays an inert source preview', () => {
      if (!r.stringPreviewPresent) throw new Error('no [data-framework-preview="source"] in the string layer');
    });
    test('real React output mounted ("Hello from React")', () => {
      if (!r.reactRendered) throw new Error('layer.mount() did not report mounted:true');
      if (!/Hello from React/.test(r.heroMountedText || '')) {
        throw new Error('React text missing from hero layer DOM');
      }
    });
    test('fitting react layers show NO error', () => {
      if (r.reactFitHasError) throw new Error('unexpected error badge on fitting string layer');
      if (r.reactFitOverflowFlag) throw new Error('unexpected overflow flag on fitting string layer');
      if (r.heroHadError) throw new Error('unexpected error badge on hero layer');
    });

    // ---- Angular snippet loads ----
    test('angular layer box rendered with its snippet', () => {
      if (!r.angularBoxPresent) throw new Error('no [data-layer-id="angular"] in DOM');
      if (!r.angularDomHasSnippet) throw new Error('angular snippet missing from DOM');
      if (!r.angularCodeKept) throw new Error('angular code holder check failed');
    });
    test('angular string stays inert (no execution claimed)', () => {
      if (!r.angularInert) throw new Error('angular string layer mounted or lost its inert preview');
      const app = r.appResults.angular || {};
      if (app.mounted) throw new Error('angular string layer wrongly reported mounted');
    });
    test('fitting angular layer shows NO error', () => {
      if (r.angularFitHasError) throw new Error('unexpected error badge on angular layer');
    });

    // ---- Overflow error path ----
    test('overflowing layer triggered check_overflow', () => {
      if (!r.overflowDetected) throw new Error('check_overflow() did not detect the overflow');
    });
    test('red overflow error badge is in the DOM', () => {
      if (!(r.overflowBadgeCount >= 1)) throw new Error('no [data-framework-error="overflow"] badge found');
      if (!/overflow/i.test(r.overflowMessage || '')) throw new Error('badge text wrong: ' + r.overflowMessage);
    });
    test('assert_fits throws the overflow error', () => {
      if (!r.assertFitsThrew) throw new Error('assert_fits did not throw');
      if (!/overflow/i.test(r.assertFitsMessage || '')) throw new Error('wrong message: ' + r.assertFitsMessage);
    });

    // ---- Validation errors ----
    test('bad layer_id rejected in browser', () => {
      if (!/must be 'react', 'angular', or '<framework>:<name>'/.test(r.validation.badId || '')) {
        throw new Error('badId=' + r.validation.badId);
      }
    });
    test('invalid named layer_id rejected in browser', () => {
      if (!/must be 'react', 'angular', or '<framework>:<name>'/.test(r.validation.badNamedId || '')) {
        throw new Error('badNamedId=' + r.validation.badNamedId);
      }
    });
    test('missing code rejected in browser', () => {
      if (!/requires "code"/.test(r.validation.missingCode || '')) throw new Error('missingCode=' + r.validation.missingCode);
    });
    test('type/id mismatch rejected in browser', () => {
      if (!/mismatch/.test(r.validation.mismatch || '')) throw new Error('mismatch=' + r.validation.mismatch);
    });

    // ---- No page-level JS errors ----
    test('no uncaught page errors', () => {
      const errs = (r.windowErrors || []).concat(r.appPageErrors || []);
      if (errs.length) throw new Error(errs.join(' | ').slice(0, 500));
    });
  } finally {
    server.close();
  }

  console.log('');
  console.log(failed === 0 ? '[ALL PASS] ' + passed + ' passed, ' + failed + ' failed'
    : '[FAILED] ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
