#!/usr/bin/env node
/**
 * Builds the Node backend TypeScript harness.
 *
 * 1. Type-checks app.ts against index.d.ts with tsc --noEmit.
 * 2. Transpiles app.ts to CommonJS.
 * 3. Rewrites the generated `require("crescent-js")` so the compiled file
 *    resolves to the real framework entry (src/rocket.js) at runtime.
 *
 * Usage: node test/backend/build.js
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const TSC = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const ENTRY = path.join(ROOT, 'src', 'rocket.js');
const OUT = path.join(__dirname, 'compiled_app.js');

// ---- 1. Type-check ------------------------------------------------------
const tsconfig = path.join(__dirname, 'tsconfig.json');
const check = spawnSync(process.execPath, [TSC, '--noEmit', '-p', tsconfig], {
  encoding: 'utf8', cwd: ROOT
});
if (check.status !== 0) {
  console.error('[backend] tsc --noEmit FAILED:\n' + (check.stdout || check.stderr || ''));
  process.exit(1);
}
console.log('[backend] app.ts type-checked cleanly (tsc --noEmit)');

// ---- 2. Transpile ---------------------------------------------------------
const ts = require(path.join(ROOT, 'node_modules', 'typescript'));
const src = fs.readFileSync(path.join(__dirname, 'app.ts'), 'utf8');
const compiled = ts.transpileModule(src, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2019,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true
  },
  fileName: path.join(__dirname, 'app.ts')
}).outputText;

// ---- 3. Rewrite the crescent-js require to the real entry ----------------
const entryRequire = JSON.stringify(ENTRY.replace(/\\/g, '/'));
const final = compiled
  .replace(/require\("crescent-js"\)/g, 'require(' + entryRequire + ')')
  .replace(/require\('crescent-js'\)/g, 'require(' + entryRequire + ')')
  // Make the runner able to require() the compiled file and await run().
  + '\n\nif (module === require.main) { run().then((s) => console.log("__STATE__" + JSON.stringify(s))).catch((e) => { console.error(e); process.exit(1); }); }\n';

fs.writeFileSync(OUT, final);
console.log('[backend] compiled_app.js written (' + final.length + ' bytes)');