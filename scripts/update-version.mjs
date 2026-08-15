#!/usr/bin/env node
/**
 * Mark a Crescent.js version as deployed in tasks/version.yaml and
 * tasks/tasks.yaml, stamping the release date.
 *
 * Usage: node scripts/update-version.mjs 1.0.4
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const VERSION_FILE = path.join(REPO_ROOT, 'tasks', 'version.yaml');
const TASKS_FILE = path.join(REPO_ROOT, 'tasks', 'tasks.yaml');

const requestedVersion = process.argv[2];
if (!requestedVersion) {
  console.error('Usage: node scripts/update-version.mjs <version>');
  process.exit(1);
}

const dateOfDeploy = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy

function stampVersionFile() {
  if (!fs.existsSync(VERSION_FILE)) {
    console.log(`[skip] ${VERSION_FILE} not found`);
    return;
  }
  const lines = fs.readFileSync(VERSION_FILE, 'utf-8').split(/\r?\n/);
  let currentVersion = null;
  const next = [];

  for (const line of lines) {
    const verMatch = line.match(/^Version:\s*(\S+)/);
    if (verMatch) {
      currentVersion = verMatch[1];
    }
    next.push(line);
    if (currentVersion === requestedVersion) {
      if (/^Status:/.test(line)) {
        next[next.length - 1] = 'Status: Deployed';
      } else if (/^Date-of-Deploy:/.test(line) || /^Data-OF-Deploy:/.test(line)) {
        next[next.length - 1] = 'Date-of-Deploy: ' + dateOfDeploy;
      }
    }
  }

  fs.writeFileSync(VERSION_FILE, next.join('\n'), 'utf-8');
  console.log(`[version.yaml] v${requestedVersion} -> Deployed (${dateOfDeploy})`);
}

function stampTasksFile() {
  if (!fs.existsSync(TASKS_FILE)) {
    console.log(`[skip] ${TASKS_FILE} not found`);
    return;
  }
  const text = fs.readFileSync(TASKS_FILE, 'utf-8');
  const updated = text.replace(/Task Status: Development/g, 'Task Status: Deployed')
    .replace(/Task Status: Testing/g, 'Task Status: Deployed')
    .replace(/Task Status: Planning/g, 'Task Status: Deployed')
    .replace(/Task Status: Deploying/g, 'Task Status: Deployed');
  fs.writeFileSync(TASKS_FILE, updated, 'utf-8');
  console.log('[tasks.yaml] task statuses -> Deployed');
}

stampVersionFile();
stampTasksFile();
console.log('Done. Release date stamped:', dateOfDeploy);