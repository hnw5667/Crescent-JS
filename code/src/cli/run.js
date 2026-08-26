#!/usr/bin/env node
/**
 * Crescent.js CLI - `crescent run <app.js> [port]`
 *
 * Loads a Crescent.js application file and keeps it running so the
 * application's own servers (created with api_make().start()) keep
 * serving.
 *
 * The effective port is resolved as: [port argument] > [PORT env var] >
 * [3000 default] and is exposed to the app via process.env.PORT.
 *
 * Usage:
 *   crescent run src/app.js 8080
 *   crescent run src/app.js
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = 3000;

function usage() {
  console.error('Usage:');
  console.error('  crescent run <app.js> [port]        Run a Crescent.js app');
  console.error('  crescent build <app.js> [outDir]    Build-time HTML generation (JS-First) + unified bundle');
  console.error('  crescent app-build                  Turn any folder into a standalone app (interactive)');
  console.error('  crescent tabels --show              Show hidden tabel folders');
  console.error('  crescent tabels --hide              Hide tabel folders');
  console.error('  crescent tabels --list              List all tabels');
  console.error('  (aliases: tables, tabel, table)');
  process.exit(1);
}

function resolvePort(raw) {
  const value = raw === undefined || raw === null
    ? (process.env.PORT || String(DEFAULT_PORT))
    : String(raw);
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    console.error('[crescent] invalid port: ' + value);
    process.exit(1);
  }
  return port;
}

function main() {
  const args = process.argv.slice(2);

  // Handle app-build (folder → standalone zip) — interactive
  // Accept `crescent app-build`, `app_build`, `app:build`, and `crescent app build`
  const isAppBuild = args[0] === 'app-build' || args[0] === 'app_build' || args[0] === 'app:build' || (args[0] === 'app' && args[1] === 'build');
  if (isAppBuild) {
    if (args.includes('--help') || args.includes('-h')) {
      console.log('Usage: crescent app-build');
      console.log('');
      console.log('  Interactive prompts:');
      console.log('    1) Path of the folder that needs to be made an app');
      console.log('    2) Main .js file (first file that opens when user opens the app)');
      console.log('    3) Name of the app');
      console.log('    4) Logo of the app (image path)');
      console.log('    5) Detect host OS and pick target OS(s) to build for');
      console.log('  Result: a single .zip in the source folder, holding one standalone folder per target OS');
      process.exit(0);
    }
    const appBuild = require('./app_build');
    appBuild.cliMain();
    return;
  }

  // Handle tabels/tables commands (hidden folder show/hide)
  const tabelCmds = ['tabels', 'tables', 'tabel', 'table'];
  if (args[0] && tabelCmds.includes(args[0])) {
    const flag = args[1] || '--list';
    const { TabelManager } = require('../phase1/database/tabel');
    const manager = new TabelManager();
    manager.handleCLI([flag]);
    process.exit(0);
    return;
  }

  if (!args[0] || (args[0] !== 'run' && args[0] !== 'build')) usage();
  if (!args[1]) usage();

  if (args[0] === 'build') {
    const file = path.resolve(process.cwd(), args[1]);
    if (!fs.existsSync(file)) {
      console.error('[crescent] app file not found: ' + file);
      process.exit(1);
    }
    const outDir = args[2] ? path.resolve(process.cwd(), args[2]) : path.join(process.cwd(), 'crescent_build');
    try {
      // Clear require cache for fresh load
      delete require.cache[require.resolve(file)];
      const exported = require(file);
      const crescent = require('../rocket');
      // Collect components from crescent registry and exported values
      let components = Object.values(crescent._components || {});
      // Only fall back to exported inspection if registry is empty (prevents double-counting bundles)
      if (components.length === 0 && exported) {
        const isComponentLike = (v) => v && (v.component_id || v.componentId) && (v.sections || v._sectionOrder || v.get_sections);
        if (isComponentLike(exported)) components.push(exported);
        else if (Array.isArray(exported)) {
          for (const e of exported) if (isComponentLike(e)) components.push(e);
        } else if (typeof exported === 'object') {
          for (const v of Object.values(exported)) if (isComponentLike(v) && !v.html) components.push(v);
        }
      }
      // Deduplicate by component_id
      const seen = new Set();
      components = components.filter(c => {
        const id = c.component_id || c.componentId || c.id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      if (components.length === 0) {
        console.warn('[crescent] build: no JS-First components found in ' + file + '. Did you use crescent.component()?');
      }
      const Bundler = require('../phase1/frontend/bundler');
      const ComponentCache = require('../phase1/frontend/component_cache');
      const cache = new ComponentCache();
      try { cache.enable(); } catch (e) {}
      const bundler = new Bundler({ outputDir: outDir, cache });
      const result = bundler.build(components, { outputDir: outDir });
      console.log('[crescent] build complete: ' + result.payload.bundles.length + ' bundle(s)');
      console.log('[crescent] bundle written to: ' + result.path);
      console.log('[crescent] html -> ' + path.join(outDir, 'html'));
      console.log('[crescent] js   -> ' + path.join(outDir, 'js'));
      process.exit(0);
    } catch (err) {
      console.error('[crescent] build failed: ' + (err && err.stack ? err.stack : err));
      process.exit(1);
    }
    return;
  }

  // run
  const file = path.resolve(process.cwd(), args[1]);
  if (!fs.existsSync(file)) {
    console.error('[crescent] app file not found: ' + file);
    process.exit(1);
  }

  const port = args.length > 2 ? resolvePort(args[2]) : resolvePort(null);
  process.env.PORT = String(port);
  process.env.CRESCENT_RUN = '1';

  try {
    require(file);
    console.log('[crescent] ' + path.relative(process.cwd(), file) + ' running on port ' + port);
  } catch (err) {
    console.error('[crescent] failed to load app: ' + (err && err.stack ? err.stack : err));
    process.exit(1);
  }
}

main();