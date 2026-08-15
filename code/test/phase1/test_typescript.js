/**
 * Task - TypeScript compatibility test (v1.0.5).
 *
 * Verifies that the package is TypeScript-ready:
 *   1. package.json exposes a "types" field pointing at index.d.ts,
 *   2. index.d.ts is included in the published "files" list,
 *   3. a TypeScript fixture that imports the package (as a real consumer
 *      would) type-checks cleanly with `tsc --noEmit`.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PACKAGE_ROOT = path.join(__dirname, '..', '..');
const TYPESCRIPT_DIR = path.join(__dirname, '..', 'typescript');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('[PASS]', name);
  } catch (err) {
    failed++;
    console.log('[FAIL]', name, '->', err.message);
  }
}

function main() {
  const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));
  const typesField = pkg.types;
  const filesList = pkg.files || [];

  test('package.json exposes a "types" field', () => {
    assert.ok(typesField, 'expected package.json "types" field');
  });

  test('types field points to an existing declaration file', () => {
    assert.ok(typesField, 'missing "types" field');
    const typesPath = path.join(PACKAGE_ROOT, typesField);
    assert.ok(fs.existsSync(typesPath), `declaration file not found: ${typesField}`);
    assert.ok(typesPath.endsWith('.d.ts'), `"types" must point to a .d.ts file, got: ${typesField}`);
  });

  test('index.d.ts is listed in the published "files" array', () => {
    assert.ok(typesField, 'missing "types" field');
    assert.ok(filesList.includes(typesField), `"${typesField}" is not in the files array`);
  });

  test('typescript devDependency is declared', () => {
    assert.ok(pkg.devDependencies && pkg.devDependencies.typescript,
      'expected typescript in devDependencies so "npm test" can type-check');
  });

  let tscBin = null;
  try {
    tscBin = require.resolve('typescript/bin/tsc', { paths: [PACKAGE_ROOT] });
  } catch (err) {
    // fall back to a global-ish resolution below
  }

  test('typescript is installed (run "npm install" in the code/ folder)', () => {
    assert.ok(tscBin, 'typescript is not installed');
  });

  if (tscBin) {
    const tsconfig = path.join(TYPESCRIPT_DIR, 'tsconfig.json');
    const result = spawnSync(process.execPath, [tscBin, '--noEmit', '-p', tsconfig], {
      encoding: 'utf8',
      cwd: PACKAGE_ROOT
    });

    if (result.stdout && result.stdout.trim()) console.log(result.stdout.trim());
    if (result.stderr && result.stderr.trim()) console.error(result.stderr.trim());

    test('TypeScript fixture compiles cleanly (tsc --noEmit)', () => {
      assert.strictEqual(result.status, 0, 'tsc exited with errors:\n' + (result.stdout || result.stderr || ''));
    });
  }

  console.log('');
  console.log(failed === 0
    ? '[ALL PASS] ' + passed + ' passed, ' + failed + ' failed'
    : '[FAILED] ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed === 0 ? 0 : 1);
}

main();
