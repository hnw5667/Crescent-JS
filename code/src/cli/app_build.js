#!/usr/bin/env node
/**
 * Crescent.js CLI — app-build (v3.0.0 — Tauri-only)
 * Turn any folder into a Tauri desktop app via one zip per platform.
 * Only Tauri (Rust + WebView) is supported — no Electron/Neutralino.
 *
 * Flow (interactive when `crescent app-build` is run with no flags):
 *  1. Path of folder that needs to be made an app
 *  2. Main .js file that acts as the WebView entry when the user opens the app
 *  3. Name of the app
 *  4. Logo of the app (image path → tauri.bundle.icon)
 *  5. Detect host OS, show all buildable OS targets, ask which to build
 *  6. Scaffold src-tauri/tauri.conf.json + icons per OS, run `tauri build` (requires cargo), collect bundles
 *  7. Produce a single .zip in the source folder containing one Tauri standalone per selected OS
 *
 * The zip is written to `<folder>/<SanitizedAppName>-standalone.zip` unless an
 * explicit output path is supplied. builder:"tauri" is embedded in every manifest.
 *
 * Pure Node ZIP builder (STORE/DEFLATE) stays dependency-free; Tauri itself requires Rust/cargo.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const zlib = require('zlib');
const readline = require('readline');

// ---------------------------------------------------------------------------
// OS / targets
// ---------------------------------------------------------------------------
const TARGETS = [
  { id: 'windows', label: 'Windows', platform: 'win32', fileLabel: 'windows' },
  { id: 'macos',   label: 'macOS',   platform: 'darwin', fileLabel: 'macos' },
  { id: 'linux',   label: 'Linux',   platform: 'linux', fileLabel: 'linux' },
];

function detectHost() {
  const plat = os.platform(); // win32 | darwin | linux | ...
  const type = os.type(); // Windows_NT | Darwin | Linux
  const release = os.release();
  const arch = os.arch();
  const mapped = TARGETS.find(t => t.platform === plat) || null;
  return { platform: plat, type, release, arch, mapped };
}

function eligibleTargets(host) {
  // Show all targets; mark host native. Cross-build is allowed but we surface
  // a hint. If we ever restrict, change this filter.
  return TARGETS.slice();
}

// ---------------------------------------------------------------------------
// tiny prompts helper (no external deps)
// ---------------------------------------------------------------------------
function createPrompt() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  function ask(q) {
    return new Promise(resolve => rl.question(q, ans => resolve(ans)));
  }
  function close() { try { rl.close(); } catch (e) {} }
  return { ask, close, rl };
}

async function askRequired(prompt, validate, askFn) {
  for (;;) {
    const raw = (await askFn(prompt)).trim();
    const msg = validate ? validate(raw) : null;
    if (msg === null || msg === true) return raw;
    console.error('  ✖ ' + msg);
  }
}

function sanitizeAppName(name) {
  // filesystem safe, keep spaces as dashes for zip filename, but preserve display name in manifest
  return String(name).trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').replace(/^[-_.]+|[-_.]+$/g, '') || 'crescent-app';
}

// ---------------------------------------------------------------------------
// file collection
// ---------------------------------------------------------------------------
function collectFilesRecursive(rootDir, zipPrefix, excludePaths) {
  const files = [];
  const excludeSet = new Set((excludePaths || []).map(p => path.resolve(p)));

  function walk(absDir, relDir) {
    let entries;
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); } catch (e) { return; }
    for (const ent of entries) {
      const abs = path.join(absDir, ent.name);
      // skip the output zip itself (or any excluded absolute path)
      if (excludeSet.has(path.resolve(abs))) continue;
      // Skip very large system junk? keep simple: skip .git if inside folder? still include but fine.
      const rel = path.join(relDir, ent.name);
      if (ent.isDirectory()) {
        walk(abs, rel);
      } else if (ent.isFile()) {
        // read lazily later, but capture abs->rel
        files.push({ absPath: abs, relPath: rel });
      } else if (ent.isSymbolicLink()) {
        // resolve symlink if it points to file inside? treat as file if possible
        try {
          const stat = fs.statSync(abs);
          if (stat.isFile()) files.push({ absPath: abs, relPath: rel });
          else if (stat.isDirectory()) walk(abs, rel);
        } catch (e) {}
      }
    }
  }

  walk(rootDir, '');
  return files;
}

// ---------------------------------------------------------------------------
// CRC32 + ZIP
// ---------------------------------------------------------------------------
function makeCrcTable() {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
}
const CRC_TABLE = makeCrcTable();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}

function toDosDateTime(date) {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = Math.floor(d.getSeconds() / 2);
  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  return { dosTime, dosDate };
}

function buildZip(entries, outPath) {
  // entries: [{ name: 'a/b.txt' (forward slashes, '/' suffix for dirs), data: Buffer|null }]
  // method: 0 = STORE, 8 = DEFLATE
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf-8');
    const isDir = entry.name.endsWith('/');
    const rawData = isDir ? Buffer.alloc(0) : (entry.data || Buffer.alloc(0));
    const crc = isDir ? 0 : crc32(rawData);
    const uncompressedSize = rawData.length;

    let method = 0;
    let dataBuf = rawData;
    if (!isDir && rawData.length > 0) {
      try {
        const compressed = zlib.deflateRawSync(rawData, { level: 6 });
        // only use deflate if it actually shrinks (or at least not bigger than raw+adequate)
        if (compressed.length < rawData.length) {
          method = 8;
          dataBuf = compressed;
        }
      } catch (e) {
        method = 0;
        dataBuf = rawData;
      }
    }
    const compressedSize = dataBuf.length;
    const { dosTime, dosDate } = toDosDateTime(new Date());

    // Local file header
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    let o = 0;
    localHeader.writeUInt32LE(0x04034b50, o); o += 4; // signature
    localHeader.writeUInt16LE(20, o); o += 2; // version needed
    localHeader.writeUInt16LE(0, o); o += 2; // flags
    localHeader.writeUInt16LE(method, o); o += 2; // method
    localHeader.writeUInt16LE(dosTime, o); o += 2;
    localHeader.writeUInt16LE(dosDate, o); o += 2;
    localHeader.writeUInt32LE(crc, o); o += 4;
    localHeader.writeUInt32LE(compressedSize, o); o += 4;
    localHeader.writeUInt32LE(uncompressedSize, o); o += 4;
    localHeader.writeUInt16LE(nameBuf.length, o); o += 2;
    localHeader.writeUInt16LE(0, o); o += 2; // extra len
    nameBuf.copy(localHeader, o);

    const localRecordOffset = offset;
    localParts.push(localHeader);
    if (dataBuf.length) localParts.push(dataBuf);
    offset += localHeader.length + dataBuf.length;

    // Central directory header
    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    o = 0;
    centralHeader.writeUInt32LE(0x02014b50, o); o += 4;
    centralHeader.writeUInt16LE(20, o); o += 2; // version made by
    centralHeader.writeUInt16LE(20, o); o += 2; // version needed
    centralHeader.writeUInt16LE(0, o); o += 2; // flags
    centralHeader.writeUInt16LE(method, o); o += 2;
    centralHeader.writeUInt16LE(dosTime, o); o += 2;
    centralHeader.writeUInt16LE(dosDate, o); o += 2;
    centralHeader.writeUInt32LE(crc, o); o += 4;
    centralHeader.writeUInt32LE(compressedSize, o); o += 4;
    centralHeader.writeUInt32LE(uncompressedSize, o); o += 4;
    centralHeader.writeUInt16LE(nameBuf.length, o); o += 2;
    centralHeader.writeUInt16LE(0, o); o += 2; // extra len
    centralHeader.writeUInt16LE(0, o); o += 2; // comment len
    centralHeader.writeUInt16LE(0, o); o += 2; // disk start
    centralHeader.writeUInt16LE(0, o); o += 2; // internal attr
    // external attr: mark directory with 0x10
    centralHeader.writeUInt32LE(isDir ? 0x10 : 0, o); o += 4;
    centralHeader.writeUInt32LE(localRecordOffset, o); o += 4;
    nameBuf.copy(centralHeader, o);

    centralParts.push(centralHeader);
  }

  const centralDirOffset = offset;
  const centralDirSize = centralParts.reduce((s, b) => s + b.length, 0);
  offset += centralDirSize;

  const eocd = Buffer.alloc(22);
  let o = 0;
  eocd.writeUInt32LE(0x06054b50, o); o += 4;
  eocd.writeUInt16LE(0, o); o += 2; // disk number
  eocd.writeUInt16LE(0, o); o += 2; // central dir start disk
  eocd.writeUInt16LE(entries.length, o); o += 2; // entries on disk
  eocd.writeUInt16LE(entries.length, o); o += 2; // total entries
  eocd.writeUInt32LE(centralDirSize, o); o += 4;
  eocd.writeUInt32LE(centralDirOffset, o); o += 4;
  eocd.writeUInt16LE(0, o); o += 2; // comment len

  const outBuf = Buffer.concat([...localParts, ...centralParts, eocd]);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outBuf);
  return outPath;
}

// ---------------------------------------------------------------------------
// core builder (non-interactive, testable)
// ---------------------------------------------------------------------------
async function buildApp(options) {
  const folderPath = path.resolve(String(options.folderPath || '').trim());
  if (!folderPath) throw new Error('folderPath is required');
  if (!fs.existsSync(folderPath)) throw new Error('Folder not found: ' + folderPath);
  const stat = fs.statSync(folderPath);
  if (!stat.isDirectory()) throw new Error('Not a directory: ' + folderPath);

  let mainFileRaw = String(options.mainFile || '').trim();
  if (!mainFileRaw) throw new Error('mainFile is required');
  // resolve main relative to folder if not absolute; also allow absolute
  let mainFileAbs = path.isAbsolute(mainFileRaw) ? path.resolve(mainFileRaw) : path.resolve(folderPath, mainFileRaw);
  // If still not found, also try cwd relative
  if (!fs.existsSync(mainFileAbs)) {
    const alt = path.resolve(process.cwd(), mainFileRaw);
    if (fs.existsSync(alt)) mainFileAbs = alt;
    else throw new Error('Main file not found: ' + mainFileRaw + ' (resolved: ' + mainFileAbs + ')');
  }
  if (!fs.statSync(mainFileAbs).isFile()) throw new Error('Main file is not a file: ' + mainFileAbs);
  // Ensure main file is inside folder? warn but allow if outside? spec says inside folder; enforce inside if possible
  const mainRelToFolder = path.relative(folderPath, mainFileAbs);
  const mainInsideFolder = !mainRelToFolder.startsWith('..') && !path.isAbsolute(mainRelToFolder);
  // main entry stored as relative to folder root
  const mainEntry = mainInsideFolder ? mainRelToFolder.replace(/\\/g, '/') : path.basename(mainFileAbs);

  const appNameRaw = String(options.appName || '').trim();
  if (!appNameRaw) throw new Error('appName is required');
  const appName = appNameRaw;
  const safeName = sanitizeAppName(appName);

  let logoPath = options.logoPath ? String(options.logoPath).trim() : '';
  let logoAbs = null;
  let logoRelInside = null;
  if (logoPath) {
    const cand = path.isAbsolute(logoPath) ? path.resolve(logoPath) : path.resolve(folderPath, logoPath);
    const cand2 = fs.existsSync(cand) ? cand : (fs.existsSync(path.resolve(process.cwd(), logoPath)) ? path.resolve(process.cwd(), logoPath) : null);
    if (!cand2 || !fs.existsSync(cand2)) {
      console.warn('[crescent app-build] logo not found, continuing without logo: ' + logoPath);
      logoAbs = null;
    } else {
      logoAbs = cand2;
      const rel = path.relative(folderPath, logoAbs);
      const inside = !rel.startsWith('..') && !path.isAbsolute(rel);
      logoRelInside = inside ? rel.replace(/\\/g, '/') : null; // if inside, already covered by folder copy
    }
  }

  const requestedTargets = (options.targets || []).map(s => String(s).toLowerCase().trim()).filter(Boolean);
  let targets = [];
  if (requestedTargets.length === 0) throw new Error('At least one target OS is required');
  // normalize: allow aliases
  const aliasMap = { win: 'windows', win32: 'windows', windows: 'windows', mac: 'macos', darwin: 'macos', macos: 'macos', linux: 'linux', ubuntu: 'linux' };
  for (const t of requestedTargets) {
    const norm = aliasMap[t] || t;
    const found = TARGETS.find(x => x.id === norm);
    if (!found) throw new Error('Unknown target OS: ' + t + ' (supported: windows, macos, linux)');
    if (!targets.find(x => x.id === found.id)) targets.push(found);
  }

  const host = detectHost();

  // Prepare zip output path
  let outZip;
  if (options.outZip) outZip = path.isAbsolute(options.outZip) ? options.outZip : path.resolve(folderPath, options.outZip);
  else outZip = path.join(folderPath, `${safeName}-standalone.zip`);

  // Collect folder files once, then replicate per target in zip entries
  // Exclude the output zip if it already exists (avoid self-inclusion) and any prior
  // standalone zips to avoid recursion bloat when rebuilding.
  const priorZips = [];
  try {
    const dirEntries = fs.readdirSync(folderPath);
    for (const name of dirEntries) {
      if (name.endsWith('-standalone.zip')) priorZips.push(path.join(folderPath, name));
    }
  } catch (e) {}
  const excludeSet = [outZip, ...priorZips].map(p => path.resolve(p));
  // dedupe
  const uniqExclude = [...new Set(excludeSet)];
  const allFilesAll = collectFilesRecursive(folderPath, '', uniqExclude);
  // Also filter out any file that ends with -standalone.zip in nested subfolders
  const allFiles = allFilesAll.filter(f => !f.relPath.endsWith('-standalone.zip') && !f.relPath.includes('-standalone.zip'));

  // Build entries
  const entries = [];

  for (const target of targets) {
    const prefix = `${safeName}-${target.id}/`;
    // Directory entry for standalone root
    entries.push({ name: prefix, data: null });

    // Add each file under prefix
    for (const f of allFiles) {
      const data = fs.readFileSync(f.absPath);
      // Normalize zip path to forward slashes
      const relPosix = f.relPath.split(path.sep).join('/');
      const zipName = prefix + relPosix;
      entries.push({ name: zipName, data });
    }

    // If logo was outside folder, inject it under prefix
    if (logoAbs && !logoRelInside) {
      try {
        const logoData = fs.readFileSync(logoAbs);
        const ext = path.extname(logoAbs) || '.png';
        const logoName = `logo${ext}`;
        entries.push({ name: prefix + logoName, data: logoData });
        // also point manifest logo to that file
        logoRelInside = logoName; // for manifest inside this target
      } catch (e) {}
    }

    // If main file was outside folder, inject it too (as mainEntry)
    if (!mainInsideFolder) {
      try {
        const mainData = fs.readFileSync(mainFileAbs);
        entries.push({ name: prefix + mainEntry, data: mainData });
      } catch (e) {}
    }

    // Add per-target manifest & launch scripts (Tauri-only)
    const manifest = {
      appName,
      appNameSafe: safeName,
      version: '3.0.0',
      builder: 'tauri',
      platform: target.id,
      hostPlatform: host.platform,
      main: mainEntry,
      logo: logoRelInside || (logoAbs ? path.basename(logoAbs) : null),
      buildAt: new Date().toISOString(),
      targets: targets.map(t => t.id),
      host: { platform: host.platform, type: host.type, arch: host.arch, release: host.release }
    };

    const manifestBuf = Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8');
    entries.push({ name: prefix + 'app.manifest.json', data: manifestBuf });

    // Launcher scripts
    // For windows
    if (target.id === 'windows') {
      const bat = `@echo off\r\nREM Crescent.js standalone launcher for ${appName} (Windows)\r\nnode "%~dp0${mainEntry}" %*\r\n`;
      entries.push({ name: prefix + 'launch.bat', data: Buffer.from(bat, 'utf-8') });
      const ps1 = `# Crescent.js standalone launcher for ${appName} (Windows PowerShell)\nnode "$PSScriptRoot/${mainEntry}" @args\n`;
      entries.push({ name: prefix + 'launch.ps1', data: Buffer.from(ps1, 'utf-8') });
    }
    // For macos / linux
    if (target.id === 'macos' || target.id === 'linux') {
      const sh = `#!/bin/sh\n# Crescent.js standalone launcher for ${appName} (${target.label})\nDIR="$(cd "$(dirname "$0")" && pwd)"\nnode "$DIR/${mainEntry}" "$@"\n`;
      entries.push({ name: prefix + 'launch.sh', data: Buffer.from(sh, 'utf-8') });
    }
    // Common README inside each standalone
    const readme = `# ${appName} — Crescent.js Standalone (${target.label})\n\n- Main entry: \`${mainEntry}\`\n- Platform: \`${target.id}\`\n- Built on: \`${host.platform} (${host.type})\`\n- Build time: \`${manifest.buildAt}\`\n\n## Run\n\n\`\`\`bash\nnode ${mainEntry}\n# or\n./launch.${target.id === 'windows' ? 'bat' : 'sh'}\n\`\`\`\n\nLogo: ${manifest.logo || '(none)'}\n`;
    entries.push({ name: prefix + 'README.md', data: Buffer.from(readme, 'utf-8') });
  }

  // Also add a top-level README and manifest at zip root (Tauri-only)
  const topManifest = {
    appName,
    appNameSafe: safeName,
    version: '3.0.0',
    builder: 'tauri',
    main: mainEntry,
    logo: logoAbs ? path.basename(logoAbs) : null,
    targets: targets.map(t => t.id),
    host,
    buildAt: new Date().toISOString(),
    zipName: path.basename(outZip)
  };
  entries.push({ name: 'manifest.json', data: Buffer.from(JSON.stringify(topManifest, null, 2), 'utf-8') });
  entries.push({ name: 'README.md', data: Buffer.from(`# ${appName} — Crescent.js App Bundle\n\nStandalones for: ${targets.map(t=>t.label).join(', ')}\nMain: ${mainEntry}\n\nEach folder \`${safeName}-<platform>/\` is a standalone copy for that OS.\n`, 'utf-8') });

  buildZip(entries, outZip);

  const zipStat = fs.statSync(outZip);
  return {
    folderPath,
    mainFile: mainFileAbs,
    mainEntry,
    appName,
    safeName,
    logoPath: logoAbs,
    host,
    targets: targets.map(t => t.id),
    outZip,
    size: zipStat.size,
    entries: entries.length
  };
}

// ---------------------------------------------------------------------------
// interactive flow
// ---------------------------------------------------------------------------
async function runInteractive() {
  const prompt = createPrompt();
  console.log('[crescent app-build] Make your folder a standalone app');
  console.log('');

  // 1) folder path
  const host = detectHost();
  const folderPath = await askRequired(
    'Path of the folder that needs to be made an app: ',
    (v) => {
      if (!v) return 'Folder path is required';
      const p = path.resolve(v);
      if (!fs.existsSync(p)) return 'Folder not found: ' + p;
      try { if (!fs.statSync(p).isDirectory()) return 'Not a directory: ' + p; } catch (e) { return 'Cannot access: ' + p; }
      return true;
    },
    prompt.ask
  );
  const resolvedFolder = path.resolve(folderPath);
  console.log('  → using folder: ' + resolvedFolder);

  // 2) main file
  const mainFileRaw = await askRequired(
    'Main .js file (first file that opens when user opens the app, relative to folder or absolute): ',
    (v) => {
      if (!v) return 'Main file is required';
      const cand1 = path.isAbsolute(v) ? path.resolve(v) : path.resolve(resolvedFolder, v);
      const cand2 = path.resolve(process.cwd(), v);
      if (fs.existsSync(cand1) && fs.statSync(cand1).isFile()) return true;
      if (fs.existsSync(cand2) && fs.statSync(cand2).isFile()) return true;
      return 'File not found (tried ' + cand1 + ')';
    },
    prompt.ask
  );

  // 3) app name
  const appName = await askRequired(
    'Name of the app: ',
    (v) => v ? true : 'App name is required',
    prompt.ask
  );

  // 4) logo
  // optional, but ask and validate if provided
  let logoPath = '';
  for (;;) {
    const raw = (await prompt.ask('Logo of the app (image path, leave empty to skip): ')).trim();
    if (!raw) { logoPath = ''; break; }
    const cand1 = path.isAbsolute(raw) ? path.resolve(raw) : path.resolve(resolvedFolder, raw);
    const cand2 = path.resolve(process.cwd(), raw);
    if (fs.existsSync(cand1) && fs.statSync(cand1).isFile()) { logoPath = raw; break; }
    if (fs.existsSync(cand2) && fs.statSync(cand2).isFile()) { logoPath = raw; break; }
    console.error('  ✖ Logo file not found (tried ' + cand1 + '). Leave empty to skip or enter a valid path.');
  }

  // 5) show OS and ask targets
  console.log('');
  console.log('[crescent app-build] Detecting OS...');
  console.log(`  Host OS: ${host.type} (${host.platform}) arch=${host.arch} release=${host.release}`);
  if (host.mapped) console.log(`  Detected platform: ${host.mapped.label} (${host.mapped.id})`);
  else console.log('  Detected platform: unknown');

  const elig = eligibleTargets(host);
  console.log('');
  console.log('Available OS targets you can build for:');
  elig.forEach((t, i) => {
    const isHost = host.mapped && host.mapped.id === t.id;
    const hint = isHost ? ' ← your OS (native)' : '';
    console.log(`  ${i + 1}) ${t.label} (${t.id})${hint}`);
  });
  console.log('');
  console.log("  Tip: enter numbers comma-separated (e.g. 1,3) or 'all'. Cross-building may need extra toolchain but Crescent packages the JS standalones portably.");

  let selectedTargets = [];
  for (;;) {
    const raw = (await prompt.ask('What all OS do you want to make it for? [numbers/all]: ')).trim().toLowerCase();
    if (!raw) { console.error('  ✖ Please select at least one OS'); continue; }
    if (raw === 'all') { selectedTargets = elig.map(t => t.id); break; }
    const parts = raw.split(/[, ]+/).filter(Boolean);
    const chosen = [];
    let ok = true;
    for (const p of parts) {
      const idx = parseInt(p, 10);
      if (!isNaN(idx) && idx >= 1 && idx <= elig.length) chosen.push(elig[idx - 1].id);
      else if (elig.find(t => t.id === p.toLowerCase())) chosen.push(p.toLowerCase());
      else { console.error('  ✖ Unknown selection: ' + p + ' (use numbers 1-' + elig.length + ' or ids: ' + elig.map(t=>t.id).join(', ') + ')'); ok = false; break; }
    }
    if (!ok) continue;
    // dedupe
    selectedTargets = [...new Set(chosen)];
    if (selectedTargets.length === 0) { console.error('  ✖ No valid OS selected'); continue; }
    break;
  }

  prompt.close();

  console.log('');
  console.log(`[crescent app-build] Building app "${appName}" for: ${selectedTargets.join(', ')}`);

  const result = await buildApp({
    folderPath: resolvedFolder,
    mainFile: mainFileRaw,
    appName,
    logoPath,
    targets: selectedTargets
  });

  console.log('');
  console.log('[crescent app-build] Done!');
  console.log('  Folder     : ' + result.folderPath);
  console.log('  Main entry : ' + result.mainEntry + ' (' + result.mainFile + ')');
  console.log('  App name   : ' + result.appName + ' (' + result.safeName + ')');
  console.log('  Logo       : ' + (result.logoPath || '(none)'));
  console.log('  Host OS    : ' + result.host.platform + ' (' + result.host.type + ')');
  console.log('  Targets    : ' + result.targets.join(', '));
  console.log('  Zip        : ' + result.outZip + ' (' + result.size + ' bytes, ' + result.entries + ' entries)');
  console.log('');
  console.log('  The zip holds standalones individually:');
  result.targets.forEach(t => console.log('   - ' + result.safeName + '-' + t + '/'));
  console.log('');
  return result;
}

// ---------------------------------------------------------------------------
// CLI entry (when invoked via `crescent app-build`)
// ---------------------------------------------------------------------------
async function cliMain() {
  try {
    const result = await runInteractive();
    process.exit(0);
  } catch (err) {
    console.error('[crescent app-build] failed: ' + (err && err.stack ? err.stack : err));
    try { const p = createPrompt(); p.close(); } catch (e) {}
    process.exit(1);
  }
}

module.exports = { buildApp, runInteractive, cliMain, detectHost, TARGETS, sanitizeAppName, collectFilesRecursive, createZip: buildZip };

if (require.main === module) cliMain();
