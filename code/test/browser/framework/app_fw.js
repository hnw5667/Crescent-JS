/**
 * Framework-layers in-browser demo app (plain JS, runs in the test page).
 * Uses window.crescent (bundled real framework modules) + window.React /
 * window.ReactDOM (UMD builds served from /vendor).
 *
 * Layers under test (ALL created through crescent.layer — no manual
 * FrameworkLayer workaround):
 *   1. react:fit      — layer_id 'react', string snippet (inert preview)
 *   2. react:hero     — layer_id 'react:hero', real React component function
 *                       mounted live via layer.mount() ("Hello from React")
 *   3. angular:fit    — layer_id 'angular', string snippet (inert, no AoT)
 *   4. react:overflow — layer_id 'react:overflow', 300px-wide React content
 *                       in an 80x40 box (MUST raise the overflow error)
 *
 * Results are collected into window.__FW_RESULT__; index.html serialises
 * them into #crescent-result for the headless runner.
 */
(function () {
  var results = {
    reactRendered: false,
    reactText: null,
    angularCodeKept: false,
    mountResults: {},
    overflowDetected: false,
    overflowMessage: null,
    assertFitsThrew: false,
    assertFitsMessage: null,
    validation: {},
    pageErrors: []
  };

  window.addEventListener('error', function (e) {
    results.pageErrors.push(String(e.message));
  });

  var crescent = window.crescent;
  var deps = { React: window.React, ReactDOM: window.ReactDOM };

  // ---- The snippets (exactly what a developer would write) ----
  var REACT_SNIPPET = [
    'function Welcome() {',
    '  return (',
    '    <div className="welcome-card">',
    '      <h1>Hello from React</h1>',
    '      <p>Rendered inside a Crescent.js layer.</p>',
    '    </div>',
    '  );',
    '}',
    'ReactDOM.createRoot(mount).render(<Welcome />);'
  ].join('\n');

  var ANGULAR_SNIPPET = [
    "@Component({",
    "  selector: 'app-welcome',",
    "  template: `",
    '    <div class="welcome-card">',
    '      <h2>Hello from Angular</h2>',
    '      <p>{{ title }} inside a Crescent.js layer.</p>',
    '    </div>',
    '  `',
    '})',
    'export class WelcomeComponent { title = "Ng"; }'
  ].join('\n');

  // Real component functions mount live; string snippets stay inert previews.
  function WelcomeComponent() {
    return window.React.createElement(
      'div', { className: 'welcome-card', style: { padding: '12px', fontFamily: 'sans-serif' } },
      window.React.createElement('h1', { style: { fontSize: '20px', margin: 0 } }, 'Hello from React'),
      window.React.createElement('p', { style: { fontSize: '13px', margin: '4px 0 0' } }, 'Rendered inside a Crescent.js layer.')
    );
  }
  function TooWideComponent() {
    return window.React.createElement(
      'div',
      { style: { width: '300px', whiteSpace: 'nowrap', fontSize: '20px', fontFamily: 'sans-serif' } },
      'This content is far too wide for its layer and must trigger the overflow error'
    );
  }

  // ---- 1. Fitting string React layer (inert without a compile hook) -----
  var reactLayer = crescent.layer({
    layer_type: 'react',
    layer_id: 'react',
    code: REACT_SNIPPET,
    size: { height: 160, width: 300 }
  });

  // ---- 2. SECOND React layer on the SAME page: real component, mounts live
  var heroLayer = crescent.layer({
    layer_type: 'react',
    layer_id: 'react:hero',
    code: WelcomeComponent,
    size: { height: 160, width: 300 }
  });

  // ---- 3. Fitting Angular layer -----------------------------------------
  var angularLayer = crescent.layer({
    layer_type: 'angular',
    layer_id: 'angular',
    code: ANGULAR_SNIPPET,
    size: { height: 120, width: 300 }
  });

  // ---- 4. Overflowing React layer, also via crescent.layer --------------
  var bigLayer = crescent.layer({
    layer_type: 'react',
    layer_id: 'react:overflow',
    code: TooWideComponent,
    size: { height: 40, width: 80 }
  });

  var card = crescent.object({ object_id: 'fw_card', size: { height: 460, width: 340 } });
  card.add_layer(reactLayer);
  card.add_layer(heroLayer);
  card.add_layer(angularLayer);
  card.set_layer_position('react', 0, 140);
  card.set_layer_position('react:hero', 0, 0);
  card.set_layer_position('angular', 0, -140);

  var page = crescent.page({ page_id: 'fw_home', page_title: 'FW Layers', size: { height: 600, width: 700 } });
  page.add_object(card);
  crescent.renderer.mount(document.getElementById('crescent-root'));
  crescent.renderer.navigate('fw_home');

  // ---- Live-mount the hero react layer through layer.mount(deps) --------
  try {
    var heroEl = heroLayer.get_element();
    var heroMount = heroEl.querySelector('[data-framework-content]');
    results.mountResults.hero = heroLayer.mount(heroMount, deps);
  } catch (e) {
    results.pageErrors.push('hero mount failed: ' + e.message);
  }

  // ---- String layers stay inert (uncompiled-source) --------------------
  try {
    var reactMount = reactLayer.get_element().querySelector('[data-framework-content]');
    results.mountResults.string = reactLayer.mount(reactMount, deps);
  } catch (e) {
    results.pageErrors.push('string layer mount failed: ' + e.message);
  }
  try {
    var angEl = angularLayer.get_element();
    var holder = angEl.querySelector('[data-framework-code]');
    var angMount = angEl.querySelector('[data-framework-content]');
    results.mountResults.angular = angularLayer.mount(angMount, deps);
    results.angularCodeKept = !!holder && holder.textContent.indexOf('app-welcome') !== -1;
    var ngPreview = angMount.querySelector('[data-framework-preview="source"]');
    results.angularInert = !!ngPreview;
  } catch (e) {
    results.pageErrors.push('angular check failed: ' + e.message);
  }

  // ---- Mount the overflow layer's real React content --------------------
  try {
    var bigMount = bigLayer.get_element().querySelector('[data-framework-content]');
    results.mountResults.overflow = bigLayer.mount(bigMount, deps);
  } catch (e) {
    results.pageErrors.push('overflow mount failed: ' + e.message);
  }

  // Give React a tick to flush, then run the overflow check explicitly.
  setTimeout(function () {
    try {
      results.reactText = (function () {
        var el = heroLayer.get_element();
        return el ? el.textContent : null;
      })();
      results.reactRendered = !!(results.mountResults.hero && results.mountResults.hero.mounted);
    } catch (e) { results.pageErrors.push('react text read failed: ' + e.message); }

    try {
      results.overflowDetected = bigLayer.check_overflow();
      var badge = bigLayer.get_element().querySelector('[data-framework-error]');
      results.overflowMessage = badge ? badge.textContent : null;
    } catch (e) { results.pageErrors.push('check_overflow failed: ' + e.message); }

    try {
      bigLayer.assert_fits({ width: 300, height: 20 });
    } catch (e) {
      results.assertFitsThrew = true;
      results.assertFitsMessage = String(e.message);
    }

    // Validation paths (must all throw with helpful messages).
    function expectThrow(name, fn) {
      try { fn(); results.validation[name] = 'DID NOT THROW'; }
      catch (e) { results.validation[name] = String(e.message); }
    }
    expectThrow('badId', function () {
      crescent.layer({ layer_type: 'react', layer_id: 'vue', code: 'x' });
    });
    expectThrow('badNamedId', function () {
      crescent.layer({ layer_type: 'react', layer_id: 'react:bad name!', code: 'x' });
    });
    expectThrow('missingCode', function () {
      crescent.layer({ layer_type: 'angular', layer_id: 'angular' });
    });
    expectThrow('mismatch', function () {
      crescent.layer({ layer_type: 'angular', layer_id: 'react', code: 'x' });
    });

    window.__FW_RESULT__ = results;
  }, 800);
})();
