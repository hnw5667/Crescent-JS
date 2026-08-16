/**
 * Test runner - runs all Phase 1 test suites for Crescent.js.
 * Suites: compression (10023), encrypted tunnels (10024), component cache (10025),
 * CLI (crescent run), TypeScript compatibility (v1.0.5), TS-in-browser render,
 * TS backend harness (db/auth/api/compression/tunnels/functions).
 */

const { spawnSync } = require('child_process');
const path = require('path');

const suites = [
  { name: 'Compression (Task 10023)', file: 'test_compression.js' },
  { name: 'Encrypted Tunnels (Task 10024)', file: 'test_encryption_tunnel.js' },
  { name: 'Component Cache (Task 10025)', file: path.join('frontend', 'test_component_cache.js') },
  { name: 'CLI (crescent run)', file: 'test_cli.js' },
  { name: 'TypeScript Compatibility (v1.0.5)', file: 'test_typescript.js' },
  { name: 'TypeScript Backend (Node)', file: path.join('..', 'backend', 'test_backend.js') },
  { name: 'TypeScript Frontend (real browser)', file: path.join('..', 'browser', 'test_browser.js') }
];

let failedSuites = 0;

for (const suite of suites) {
  console.log('\n=== ' + suite.name + ' ===');
  const result = spawnSync(process.execPath, [path.join(__dirname, suite.file)], {
    encoding: 'utf8',
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    failedSuites++;
  }
}

console.log('\n==============================================');
if (failedSuites === 0) {
  console.log('All Phase 1 test suites passed.');
} else {
  console.log(failedSuites + ' test suite(s) FAILED.');
}
process.exit(failedSuites === 0 ? 0 : 1);