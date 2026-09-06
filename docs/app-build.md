# App-Build Guide (v2.6.0 — Tauri-only)

Turn any folder on disk into a distributable **Tauri** desktop app. One CLI command collects your app, asks for a few details, detects your OS, scaffolds a Tauri project and produces a single `.zip` that holds one Tauri standalone per target OS.

> **New in v2.6.0 — Tauri-only** — `crescent app-build` + `src/cli/app_build.js` builds exclusively with [Tauri](https://tauri.app) (Rust + WebView). No Electron/Neutralino/other wrappers. Past releases: JS-First (v1.0.6), About Webpage TXT (v1.0.7 → v1.0.8), Tabel (v1.0.9), Major tested release (v2.0.0). Current stable is **v2.6.0**.

---

## Quick Start

```bash
crescent app-build
```

**Prerequisites (Tauri-only):** `Rust` (stable) + `cargo` must be installed. The builder shells out to `cargo`/`npx tauri`. If Tauri is not found it errors with install instructions — no fallback bundler.

The CLI is interactive. It walks you through:

1. **Path of the folder that needs to be made an app** — absolute or relative. Must be a directory.
2. **Main `.js` file that opens when a user launches the app** — resolved relative to that folder (or absolute). This becomes the WebView entry (`main` in each `app.manifest.json` + `tauri.conf.json` `build.devPath`/`distDir`) and the Tauri window loads it.
3. **Name of the app** — display name (e.g. `My App`). Sanitized for filenames + Tauri `package.productName`/`identifier` (`com.crescent.my-app`): `My App` → `My-App`.
4. **Logo of the app** — image path (inside or outside the folder). Leave empty to skip. Becomes Tauri `tauri.bundle.icon` (all `icons/icon.png` etc.). If inside the folder it is already included; if outside it is copied + resized into each standalone’s `src-tauri/icons/`.
5. **OS targets** — detects your OS via `os.platform()` / `os.type()` (`win32`/`darwin`/`linux` → `Windows`/`macOS`/`Linux`), lists all buildable targets with your OS marked *native*, and asks which OS(s) to build for. Accepts numbers comma-separated (`1,3`), ids (`windows,linux`), or `all`. Only Tauri-supported targets are offered; cross-compilation still requires the host toolchain (e.g. building `macos` on `windows` needs a Mac runner).

Result (Tauri scaffold per OS):

```
<folder>/<SafeName>-standalone.zip
  ├─ manifest.json               # top-level { appName, safeName, version:"2.6.0", builder:"tauri", main, targets, host, buildAt }
  ├─ README.md
  ├─ <SafeName>-windows/         # Tauri project + bundle for Windows
  │   ├─ <your files… copied>
  │   ├─ src-tauri/
  │   │   ├─ tauri.conf.json     # productName, identifier, build.distDir, bundle.icon, windows
  │   │   ├─ Cargo.toml
  │   │   └─ icons/icon.png      # from logo (or default)
  │   ├─ app.manifest.json       # { appName, appNameSafe, version:"2.6.0", builder:"tauri", platform:"windows", main, logo, host }
  │   ├─ launch.bat / launch.ps1 # Tauri bundle launchers (or node fallback for dev)
  │   └─ README.md
  ├─ <SafeName>-macos/           # src-tauri + .app/.dmg bundle
  └─ <SafeName>-linux/           # src-tauri + .AppImage/.deb bundle
```

The zip is written **in the same folder you pointed at**. It always holds Tauri standalones individually — one Tauri project per OS, each self-contained. The actual native binaries (`src-tauri/target/release/bundle/…`) are produced by `tauri build` for the selected targets and then collected into the zip.

Alternative invocations (all identical):

```bash
crescent app-build
crescent app_build
crescent app:build
crescent app build
crescent app-build --help   # usage
```

---

## What Gets Copied / Scaffolding (Tauri)

- Every file under the folder (recursive, including dotfiles and `node_modules` if present) is copied under each `<Safe>-<os>/` prefix.
- Then a Tauri scaffold is generated per OS: `src-tauri/tauri.conf.json` (productName/identifier from app name, `build.distDir` → your folder, `bundle.icon` from logo), `src-tauri/Cargo.toml`, `src-tauri/icons/` (logo derived). No overwrite of existing `src-tauri/` — it is merged.
- Prior `*-standalone.zip` files inside the folder are excluded to avoid recursive bloat.
- The output zip itself is excluded.
- Symlinked files and directories are followed when possible.
- On `targets` that include `windows`/`macos`/`linux`, the builder runs `npx tauri build --target <os>` (or `cargo tauri build`) if `cargo` is present; the resulting native bundle (`*.exe`/`*.msi`, `*.app`/`*.dmg`, `*.AppImage`) is moved under `<Safe>-<os>/bundle/` before zipping.

---

## Manifests & Launchers

**Per-standalone `app.manifest.json`** (inside `<Safe>-windows/` etc.):

```json
{
  "appName": "My App",
  "appNameSafe": "My-App",
  "version": "2.6.0",
  "builder": "tauri",
  "platform": "windows",
  "hostPlatform": "win32",
  "main": "main.js",
  "logo": "logo.png",
  "buildAt": "2026-08-26T09:30:00.000Z",
  "targets": ["windows","macos","linux"],
  "host": { "platform":"win32","type":"Windows_NT","arch":"x64","release":"10.0.26200" }
}
```

**Top-level `manifest.json`** at zip root holds the same plus `zipName` and `builder:"tauri"`.

**Launchers (Tauri + dev fallback):**

- `launch.bat` (Windows CMD) + `launch.ps1` (PowerShell) for `windows`
- `launch.sh` (`#!/bin/sh`) for `macos`/`linux`
- When Tauri bundles exist (`bundle/`), launchers prefer the native binary (`My-App.exe`, `My-App.app`, `My-App.AppImage`); otherwise they fall back to `node <main>` for dev.

Run any with:

```bash
# Native (after tauri build)
./My-App-windows/bundle/My-App.exe
open My-App-macos/bundle/My-App.app
./My-App-linux/bundle/My-App.AppImage

# Dev fallback (no Rust/Tauri yet)
node My-App-windows/main.js
./My-App-linux/launch.sh
```

---

## OS Detection & Targets

```js
const { detectHost, TARGETS } = require('crescent-js/src/cli/app_build');
detectHost();
// { platform:'win32', type:'Windows_NT', release:'10.0.26200', arch:'x64',
//   mapped:{ id:'windows', label:'Windows', platform:'win32' } }
```

Supported ids (with aliases): `windows` (`win`,`win32`), `macos` (`mac`,`darwin`), `linux` (`ubuntu`). All three are always shown; your OS is highlighted. Tauri-only: each target maps to a Tauri bundle target (`nsis`/`msi` on Windows, `app`/`dmg` on macOS, `appimage`/`deb` on Linux). Cross-building still requires the host toolchain (e.g. building `macos` on `windows` needs a Mac), and `cargo` + `@tauri/cli` must be installed.

---

## Programmatic API

No prompt, useful for tests or scripts:

```js
const { buildApp } = require('crescent-js/src/cli/app_build'); // Tauri-only builder

await buildApp({
  folderPath: './my-app',      // required: folder
  mainFile: 'main.js',         // required: relative to folder or absolute → Tauri window entry
  appName: 'My App',           // required → tauri.conf.json productName/identifier
  logoPath: './logo.png',      // optional: '' to skip → tauri.bundle.icon
  targets: ['windows','linux'],// required: one of windows/macos/linux (aliases ok, Tauri bundle targets)
  outZip: './my-app/My-App-standalone.zip' // optional, defaults to <folder>/<Safe>-standalone.zip
});
// → { folderPath, mainFile, mainEntry, appName, safeName, logoPath, host, targets, outZip, size, entries, builder:"tauri" }
```

Validation throws if folder/main missing, appName empty, `cargo`/`tauri` missing, or unknown target. Logo missing is non-fatal (warn, continue). Tauri-only — no Electron fallback.

---

## End-to-End Example

```bash
# Tauri prerequisites (once)
cargo --version          # Rust stable required
cargo install tauri-cli  # or npm i -D @tauri/cli

mkdir my-app && cd my-app
echo 'console.log("hello");' > main.js
cp ../logo.png ./logo.png

crescent app-build
# Path of the folder …: .
# Main .js file …: main.js
# Name of the app: My App
# Logo …: logo.png
# Host OS: Windows_NT (win32)
# Available OS targets:
#   1) Windows (windows) ← your OS (Tauri nsis/msi)
#   2) macOS (macos) — Tauri app/dmg
#   3) Linux (linux) — Tauri appimage/deb
# What all OS …: all
# → ./My-App-standalone.zip  (My-App-windows/ + My-App-macos/ + My-App-linux/)
#   each runs: npx tauri build --target <os> (tauri-only)

unzip My-App-standalone.zip
cat My-App-windows/app.manifest.json   # builder:"tauri"
ls  My-App-windows/src-tauri/tauri.conf.json
# native bundles (if built): My-App-windows/bundle/, My-App-macos/bundle/, My-App-linux/bundle/
./My-App-linux/bundle/My-App.AppImage || ./My-App-linux/launch.sh  # dev fallback
```

---

## Relation to Other CLIs

| Command | Purpose |
|---|---|
| `crescent run <app.js> [port]` | Dev/run a Crescent app |
| `crescent build <app.js> [outDir]` | JS-First build-time HTML + unified bundle (v1.0.6 → v2.6.0) |
| `crescent app-build` | **v2.6.0 Tauri-only** — folder → Tauri standalone zip (this guide) |
| `crescent tabels --show/--hide/--list` | Show/hide tabel hidden folders |

---

## Version

Current framework version is **v2.6.0 Tauri-only** (`code/package.json`, `src/phase1/frontend/bundler.js:version`, `website/src/components/navbar.tsx`, `tasks/version.yaml`). The zip embeds `version:"2.6.0"` + `builder:"tauri"` in every manifest and the Bundler sets `payload.version:"2.6.0"`.
