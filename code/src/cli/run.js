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
  console.error('Usage: crescent run <app.js> [port]');
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

  if (args[0] !== 'run') usage();
  if (!args[1]) usage();

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