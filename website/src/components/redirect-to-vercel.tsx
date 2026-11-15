'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * GitHub Pages is only a fallback entry point: visitors are redirected to
 * the main site immediately, with no interstitial. The screen below is shown
 * only if the redirect is still hanging after 10 seconds (or on the explicit
 * /redirect-failure page), pointing people at the new URL directly.
 */

/** The main site — the one and only redirect target. */
const NEW_HOME = 'https://crescent-js.vercel.app/';

/** Show the screen only if the redirect hasn't committed after this long. */
const STALL_TIMEOUT_MS = 10000;
/** Clean path the screen lives at (on GitHub Pages). */
const FAILURE_PATH = '/redirect-failure';

/** GitHub Pages serves the build under /Crescent-JS; the new site does not. */
function basePath(): string {
  return process.env.NODE_ENV === 'production' ? '/Crescent-JS' : '';
}

type Reason = 'stalled' | 'failed';

export function RedirectToVercel() {
  const pathname = usePathname() || '';
  const onFailurePage = pathname.replace(/\/+$/, '').endsWith(FAILURE_PATH);

  // Normal pages render nothing — visitors are redirected straight away.
  // /redirect-failure prerenders straight into the screen (reason: failed).
  const [visible, setVisible] = useState(onFailurePage);
  const [reason, setReason] = useState<Reason>('failed');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // The failure page is terminal: keep the screen, don't auto-navigate.
    if (onFailurePage && attempt === 0) {
      return () => {
        document.body.style.overflow = '';
      };
    }

    let stallTimer: ReturnType<typeof setTimeout> | undefined;

    const show = (why: Reason) => {
      setVisible(true);
      setReason(why);
      document.title =
        why === 'failed' ? 'Redirect failed — Crescent.js' : 'Crescent.js has moved';
      // Park the address bar on the clean failure URL.
      try {
        window.history.replaceState(null, '', `${basePath()}${FAILURE_PATH}`);
      } catch {
        // History tinkering is cosmetic — the screen still shows.
      }
    };

    const go = () => {
      try {
        window.location.replace(NEW_HOME);
      } catch {
        show('failed');
        return;
      }
      // Still here after this long means the redirect is hanging.
      stallTimer = setTimeout(() => show('stalled'), STALL_TIMEOUT_MS);
    };

    // Redirect right away — no interstitial, no deliberate delay.
    const timer = setTimeout(go, 0);

    // A restored back/forward cache entry would otherwise strand this page.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setAttempt((value) => value + 1);
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      clearTimeout(timer);
      if (stallTimer) clearTimeout(stallTimer);
      window.removeEventListener('pageshow', handlePageShow);
      document.body.style.overflow = '';
    };
  }, [attempt, onFailurePage]);

  if (!visible) return null;

  const stalled = reason === 'stalled';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={stalled ? 'Crescent.js has moved' : 'Redirect failed'}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#06060c] px-6 text-center text-[#f2efe8]"
    >
      {/* Moonlit aurora backdrop — same palette as the new site. */}
      <div
        aria-hidden="true"
        className="redirect-aurora pointer-events-none absolute inset-0"
      />

      <div className="relative flex max-w-lg flex-col items-center">
        {/* Crescent mark inside a still gold ring */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-[#e8d6a3]/40 shadow-[0_0_28px_rgba(232,214,163,0.14)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[3px] rounded-full bg-[#06060c]"
          />
          <img
            src={`${basePath()}/crescent-js-favicon.svg`}
            alt=""
            aria-hidden="true"
            className="relative h-10 w-auto"
          />
        </div>

        <h1 className="mt-7 font-display text-[2rem] leading-tight tracking-tight text-[#f2efe8] sm:text-[2.5rem]">
          {stalled ? 'Crescent.js has moved' : 'Redirect failed'}
        </h1>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#9d99ab] sm:text-[15px]">
          {stalled
            ? 'Crescent.js is now deployed at a new URL. The automatic redirect is taking longer than expected — you can head there directly:'
            : 'We couldn’t take you automatically. Crescent.js is deployed at a new URL — go there directly:'}
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href={NEW_HOME}
            className="rounded-lg bg-[#efece1] px-5 py-2.5 font-mono text-[13px] font-medium text-[#0a0a10] transition-colors hover:bg-white"
          >
            Go to {NEW_HOME}
          </a>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-[#f2efe8] transition-colors hover:bg-white/5"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
