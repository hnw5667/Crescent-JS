import { DocHeader } from '@/components/docs/doc-header';
import { CodeBlock } from '@/components/docs/code-block';
import { Callout } from '@/components/docs/callout';
import { DocPagination } from '@/components/docs/doc-pagination';

export default function AppBuildPage() {
  return (
    <>
      <DocHeader
        title="App-Build"
        description="Turn any folder into a Tauri standalone app. One zip, one Tauri project per OS - manifests, icons and native bundles."
        badge="v2.5.1 - Tauri-only"
      />

      <h2 id="overview">Overview</h2>
      <p>
        <code>crescent app-build</code> packages <strong>any folder</strong> as a distributable
        desktop app <strong>exclusively with Tauri</strong> (Rust + WebView).
        It asks for your folder, main <code>.js</code> entry, app name, logo,
        detects your host OS, lets you pick target OS(s) (<code>windows</code> / <code>macos</code> / <code>linux</code>),
        scaffolds <code>src-tauri/tauri.conf.json</code> + icons, runs <code>tauri build</code> for each target, and writes a single <code>.zip</code> in that same folder holding one Tauri standalone per target.
        Current framework version is <strong>v2.5.1 - Tauri-only</strong>. No Electron.
      </p>
      <Callout type="info" title="Prerequisites - Tauri-only">
        Requires <code>Rust stable</code> + <code>cargo</code> and <code>@tauri/cli</code> (<code>cargo install tauri-cli</code> or <code>npm i -D @tauri/cli</code>). If missing, the builder errors with install instructions - no fallback.
      </Callout>

      <h2 id="quick-start">Quick Start - Tauri</h2>
      <CodeBlock
        language="bash"
        code={`# once
cargo --version
cargo install tauri-cli

crescent app-build
# 1) Path of the folder that needs to be made an app: ./my-app
# 2) Main .js file (WebView entry): main.js
# 3) Name of the app: My App
# 4) Logo of the app (tauri.bundle.icon): ./logo.png
# 5) Host OS: Windows_NT (win32) - pick Tauri targets: all
# -> ./my-app/My-App-standalone.zip  (Tauri projects)
#   - My-App-windows/  (src-tauri + nsis/msi)
#   - My-App-macos/    (src-tauri + app/dmg)
#   - My-App-linux/    (src-tauri + appimage/deb)`}
      />
      <p>Aliases all work: <code>crescent app_build</code>, <code>crescent app:build</code>, <code>crescent app build</code>.</p>

      <h2 id="prompts">Interactive Prompts</h2>
      <table>
        <thead><tr><th>#</th><th>Prompt</th><th>Details</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>Folder path</td><td>Absolute or relative, must be a directory</td></tr>
          <tr><td>2</td><td>Main <code>.js</code> file</td><td>Resolved relative to folder (or absolute). Becomes Tauri WebView entry (<code>main</code> in manifests + <code>tauri.conf.json</code>)</td></tr>
          <tr><td>3</td><td>App name</td><td>Display name; sanitized for zip + Tauri <code>productName</code>/<code>identifier</code>: <code>My App -&gt; My-App</code></td></tr>
          <tr><td>4</td><td>Logo path</td><td>Image inside or outside folder; becomes <code>tauri.bundle.icon</code> (<code>src-tauri/icons/</code>); empty to skip</td></tr>
          <tr><td>5</td><td>Target OS(s) - Tauri</td><td>Detects host OS, lists Tauri bundle targets <code>windows/macos/linux</code> (native marked), accepts <code>1,3</code>, ids, or <code>all</code>; requires <code>cargo</code></td></tr>
        </tbody>
      </table>

      <h2 id="output">Output Zip - Tauri Bundle</h2>
      <CodeBlock
        filename="My-App-standalone.zip"
        code={`My-App-standalone.zip
- manifest.json           # { appName, appNameSafe, version:"2.5.1", builder:"tauri", main, targets, host, buildAt }
- README.md
- My-App-windows/         # Tauri project + Windows bundle
  - <all folder files>
  - src-tauri/tauri.conf.json  # productName, identifier com.crescent.my-app, distDir, bundle.icon
  - src-tauri/icons/icon.png
  - app.manifest.json    # { version:"2.5.1", builder:"tauri", platform:"windows", main, logo }
  - bundle/My-App.exe / .msi   # from tauri build
  - launch.bat / launch.ps1
  - README.md
- My-App-macos/           # src-tauri + .app/.dmg
- My-App-linux/           # src-tauri + .AppImage/.deb`}
      />
      <Callout type="info" title="Exclusions">
        Prior <code>*-standalone.zip</code> files and the output zip itself are excluded to avoid recursive bloat. Symlinks are followed when possible.
      </Callout>

      <h2 id="launchers">Manifests & Launchers (Tauri)</h2>
      <CodeBlock
        filename="app.manifest.json"
        language="json"
        code={`{
  "appName": "My App",
  "appNameSafe": "My-App",
  "version": "2.5.1",
  "builder": "tauri",
  "platform": "windows",
  "main": "main.js",
  "logo": "logo.png",
  "buildAt": "2026-08-26T09:30:00.000Z",
  "host": { "platform":"win32","type":"Windows_NT","arch":"x64" }
}`}
      />
      <CodeBlock
        language="bash"
        code={`# Native Tauri bundles
./My-App-windows/bundle/My-App.exe
open My-App-macos/bundle/My-App.app
./My-App-linux/bundle/My-App.AppImage

# Dev fallback (no Rust yet)
node My-App-windows/main.js
./My-App-linux/launch.sh`}
      />

      <h2 id="os-targets">OS Detection - Tauri Targets</h2>
      <CodeBlock
        language="javascript"
        code={`const { detectHost, TARGETS } = require('crescent-js/src/cli/app_build');
detectHost();
// { platform:'win32', type:'Windows_NT', release:'10.0.26200', arch:'x64',
//   mapped:{ id:'windows', label:'Windows', platform:'win32' } }
// TARGETS = [{id:'windows',label:'Windows', bundle:'nsis/msi'}, {id:'macos',label:'macOS', bundle:'app/dmg'}, {id:'linux',label:'Linux', bundle:'appimage/deb'}]
// aliases: win/win32->windows, mac/darwin->macos, ubuntu->linux
// Tauri-only: each id maps to a Tauri bundle target; cross-build needs host toolchain`}
      />

      <h2 id="programmatic">Programmatic API - Tauri</h2>
      <p>No prompts - for tests/scripts. Tauri-only builder:</p>
      <CodeBlock
        language="javascript"
        code={`const { buildApp } = require('crescent-js/src/cli/app_build'); // Tauri-only

await buildApp({
  folderPath: './my-app',
  mainFile: 'main.js',           // -> Tauri window entry
  appName: 'My App',             // -> tauri.conf productName
  logoPath: './logo.png',        // -> tauri.bundle.icon
  targets: ['windows','linux'],  // Tauri bundle targets
  outZip: './my-app/My-App-standalone.zip'
});
// -> { ..., builder:"tauri", targets, outZip, size, entries }`}
      />

      <h2 id="version">Version - Tauri-only v2.5.1</h2>
      <p>
        Framework <strong>v2.5.1 - Tauri-only</strong> (<code>code/package.json</code>, <code>src/phase1/frontend/bundler.js:version</code>,
        <code>website/src/components/navbar.tsx</code>). Bundler <code>payload.version</code> is <code>"2.5.1"</code> and every manifest embeds <code>version:"2.5.1"</code> + <code>builder:"tauri"</code>.
      </p>

      <DocPagination />
    </>
  );
}
