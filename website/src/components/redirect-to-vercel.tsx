'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * GitHub Pages is only a fallback entry point — every visit is funneled to
 * the main site. This screen shows a "you are being redirected" interstitial,
 * sends the browser onward, and falls back to a clickable link (at
 * /redirect-failure) if the navigation never commits.
 */

/** The main site — the one and only redirect target. */
const NEW_HOME = 'https://crescent-js.vercel.app/';

/** How long the interstitial is shown before the browser is sent onward. */
const REDIRECT_DELAY_MS = 1000;
/** If the page is still alive this long after the attempt, treat it as failed. */
const FAILURE_WATCHDOG_MS = 4000;
/** Clean path the failure state lives at (on GitHub Pages). */
const FAILURE_PATH = '/redirect-failure';

/** GitHub Pages serves the build under /Crescent-JS; the new site does not. */
function basePath(): string {
  return process.env.NODE_ENV === 'production' ? '/Crescent-JS' : '';
}

export function RedirectToVercel() {
  const pathname = usePathname() || '';
  // The failure page renders straight into the failure state instead of
  // auto-navigating; every other page starts with the interstitial.
  const onFailurePage = pathname.replace(/\/+$/, '').endsWith(FAILURE_PATH);
  const [status, setStatus] = useState<'redirecting' | 'failed'>(() =>
    onFailurePage ? 'failed' : 'redirecting',
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const previousTitle = document.title;
    document.body.style.overflow = 'hidden';
    const cleanup = () => {
      document.body.style.overflow = '';
      document.title = previousTitle;
    };

    if (onFailurePage && attempt === 0) {
      document.title = 'Redirect failed — Crescent.js';
      return cleanup;
    }

    let watchdog: ReturnType<typeof setTimeout> | undefined;

    const fail = () => {
      setStatus('failed');
      document.title = 'Redirect failed — Crescent.js';
      // Park the address bar on the clean failure URL.
      try {
        window.history.replaceState(
          null,
          '',
          `${basePath()}${FAILURE_PATH}`,
        );
      } catch {
        // History tinkering is cosmetic — the failure screen still shows.
      }
    };

    const go = () => {
      document.title = 'Redirecting… — Crescent.js';
      try {
        window.location.replace(NEW_HOME);
      } catch {
        fail();
        return;
      }
      // A successful navigation unloads the page; still here means it failed.
      watchdog = setTimeout(fail, FAILURE_WATCHDOG_MS);
    };

    setStatus('redirecting');
    document.title = 'Redirecting… — Crescent.js';
    const timer = setTimeout(go, REDIRECT_DELAY_MS);

    // A restored back/forward cache entry would otherwise strand this screen.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setAttempt((value) => value + 1);
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      clearTimeout(timer);
      if (watchdog) clearTimeout(watchdog);
      window.removeEventListener('pageshow', handlePageShow);
      cleanup();
    };
  }, [attempt, onFailurePage]);

  const failed = status === 'failed';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={
        failed ? 'Redirect failed' : 'Redirecting to the new Crescent.js site'
      }
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#06060c] px-6 text-center text-[#f2efe8]"
    >
      {/* Moonlit aurora backdrop — same palette as the new site. */}
      <div
        aria-hidden="true"
        className="redirect-aurora pointer-events-none absolute inset-0"
      />

      <div className="relative flex max-w-lg flex-col items-center">
        {/* Crescent mark inside a spinning gold ring (still state when failed) */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div
            aria-hidden="true"
            className={
              failed
                ? 'absolute inset-0 rounded-full border border-[#e8d6a3]/40 shadow-[0_0_28px_rgba(232,214,163,0.14)]'
                : 'redirect-ring absolute inset-0 rounded-full'
            }
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
          {failed ? 'Redirect failed' : 'You are being redirected'}
        </h1>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#9d99ab] sm:text-[15px]">
          {failed ? (
            <>
              We couldn&apos;t take you to the new Crescent.js site
              automatically.
            </>
          ) : (
            <>Crescent.js has moved to a new home. Sending you there now…</>
          )}
        </p>

        {failed ? (
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
        ) : (
          <>
            <div
              aria-hidden="true"
              className="relative mt-7 h-[3px] w-56 overflow-hidden rounded-full bg-white/10"
            >
              <div className="redirect-progress h-full rounded-full bg-gradient-to-r from-[#e8d6a3]/50 via-[#e8d6a3] to-[#efece1]" />
            </div>

            {/* Clickable destination — also the fallback if scripts stall. */}
            <a
              href={NEW_HOME}
              className="mt-4 font-mono text-[12px] tracking-[0.12em] text-[#9d99ab] transition-colors hover:text-[#e8d6a3]"
            >
              {NEW_HOME}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
