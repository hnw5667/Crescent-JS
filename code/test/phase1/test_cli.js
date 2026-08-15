/**
 * Task - CLI (`crescent run <app.js> [port]`) integration test.
 *
 * Spawns the real CLI binary against a real app file and verifies that:
 *   1. the app is loaded and its api_make server starts,
 *   2. requests to an endpoint return an encrypted/compressed packet that
 *      the cipher unwraps back to the original JSON,
 *   3. the process stays alive until it is killed.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const cipher = require('../../src/phase1/cipher');

const BIN = path.join(__dirname, '..', '..', 'src', 'cli', 'bin.js');
const ROCKET = path.join(__dirname, '..', '..', 'src', 'rocket.js');
const CIPHER = path.join(__dirname, '..', '..', 'src', 'phase1', 'cipher.js');
const SECRET = 'cli-test-secret';

let passed = 0;
let failed = 0;

function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed++;
      console.log('[PASS]', name);
    })
    .catch((err) => {
      failed++;
      console.log('[FAIL]', name, '->', err.message);
    });
}

function portFree(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(false));
    server.listen(port, '127.0.0.1', () => server.close(() => resolve(true)));
  });
}

function pickPort(start) {
  return portFree(start).then((free) => {
    if (free) return start;
    return pickPort(start + 1);
  });
}

function fetchPacket(port, timeout = 8000) {
  const deadline = Date.now() + timeout;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get({ host: '127.0.0.1', port, path: '/ping', timeout: 1500 }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', () => {
        if (Date.now() > deadline) reject(new Error('server did not come up in time'));
        else setTimeout(attempt, 150);
      });
      req.on('timeout', () => req.destroy());
    };
    attempt();
  });
}

function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crescent_cli_'));
  const appFile = path.join(root, 'app.js');
  const portPromise = pickPort(39125);

  fs.writeFileSync(appFile, [
    'const crescent = require(' + JSON.stringify(ROCKET) + ');',
    'const cipher = require(' + JSON.stringify(CIPHER) + ');',
    'const port = Number(process.env.PORT || 3000);',
    'const api = crescent.api_make({ api_id: "cli_test", port, host: "127.0.0.1", secret: ' + JSON.stringify(SECRET) + ' });',
    'api.add_endpoint("GET", "/ping", (req, res) => {',
    '  res.writeHead(200, { "Content-Type": "application/octet-stream" });',
    '  res.end(cipher.prepare({ ok: true, from: "cli" }, ' + JSON.stringify(SECRET) + '));',
    '});',
    'api.start().then(() => console.log("READY"));',
    ''
  ].join('\n'));

  Promise.all([portPromise])
    .then(([port]) => {
      const child = spawn(process.execPath, [BIN, 'run', appFile, String(port)], {
        cwd: path.join(__dirname, '..', '..'),
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => { stdout += d; });
      child.stderr.on('data', (d) => { stderr += d; });

      let settled = false;
      function finish() {
        if (settled) return;
        settled = true;
        try {
          fs.rmSync(root, { recursive: true, force: true });
        } catch (e) { /* best-effort */ }
      }

      const isAlive = () => child.exitCode === null;

      return test('CLI loads the app and stays alive', () => {
        return new Promise((resolve, reject) => {
          const deadline = Date.now() + 10000;
          const wait = () => {
            if (isAlive() && /READY/.test(stdout)) return resolve();
            if (!isAlive()) return reject(new Error('CLI exited early: ' + stderr));
            if (Date.now() > deadline) return reject(new Error('timed out waiting for app'));
            setTimeout(wait, 150);
          };
          wait();
        });
      })
        .then(() => test('GET /ping returns an encrypted packet that unwraps to JSON', () => {
          return fetchPacket(port).then((res) => {
            assert.strictEqual(res.status, 200);
            const data = cipher.unwrap(res.body, SECRET);
            assert.deepStrictEqual(data, { ok: true, from: 'cli' });
          });
        }))
        .then(() => test('PORT env var was exposed to the app', () => {
          assert.ok(stdout.indexOf('running on port ' + port) !== -1);
        }))
        .then(() => {
          child.kill('SIGKILL');
          return new Promise((resolve) => child.once('exit', resolve));
        })
        .then(() => {
          finish();
          console.log('');
          console.log(failed === 0
            ? '[ALL PASS] ' + passed + ' passed, ' + failed + ' failed'
            : '[FAILED] ' + passed + ' passed, ' + failed + ' failed');
          process.exit(failed === 0 ? 0 : 1);
        })
        .catch((err) => {
          finish();
          child.kill('SIGKILL');
          console.error(err && err.stack || err);
          console.log('');
          console.log('[FAILED] ' + passed + ' passed, ' + failed + ' failed');
          process.exit(1);
        });
    });
}

main();