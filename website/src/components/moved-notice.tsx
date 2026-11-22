import { ArrowUpRight, BookOpen } from 'lucide-react';

/**
 * The GitHub Pages site is retired: Crescent.js now lives at
 * https://crescent-js.vercel.app. This screen replaces the old site in
 * production builds — no timers, no auto-redirect, just a clear message and
 * a button people can click when they are ready.
 */

/** The new home of Crescent.js. */
const NEW_HOME = 'https://crescent-js.vercel.app';
const NEW_DOCS = 'https://crescent-js.vercel.app/docs';

/** GitHub Pages serves the build under /Crescent-JS; the new site does not. */
function basePath(): string {
  return process.env.NODE_ENV === 'production' ? '/Crescent-JS' : '';
}

export function MovedNotice() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#06060c] px-6 py-16 text-center text-[#f2efe8]">
      {/* Moonlit aurora backdrop — same palette as the new site. */}
      <div aria-hidden="true" className="moved-aurora pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8d6a3]/40 to-transparent"
      />

      <div className="relative flex w-full max-w-xl flex-col items-center">
        {/* Crescent mark inside a still gold ring */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-[#e8d6a3]/35 shadow-[0_0_36px_rgba(232,214,163,0.16)]"
          />
          <div aria-hidden="true" className="absolute inset-[3px] rounded-full bg-[#06060c]" />
          <img
            src={`${basePath()}/crescent-js-favicon.svg`}
            alt=""
            aria-hidden="true"
            className="relative h-10 w-auto"
          />
        </div>

        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.28em] text-[#e8d6a3]/80">
          New home
        </p>

        <h1 className="mt-3 font-display text-[2.15rem] leading-[1.1] tracking-tight text-[#f2efe8] sm:text-[3rem]">
          Crescent.js has moved
        </h1>

        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#9d99ab]">
          This GitHub Pages site is retired. Crescent.js now lives at its new home, with the full
          documentation, playground and examples — take a look whenever you are ready.
        </p>

        <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <a
            href={NEW_HOME}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#efece1] px-6 py-3 text-sm font-semibold text-[#0a0a10] transition-colors hover:bg-white sm:w-auto"
          >
            Visit crescent-js.vercel.app
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a
            href={NEW_DOCS}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm text-[#f2efe8] transition-colors hover:border-white/20 hover:bg-white/5 sm:w-auto"
          >
            <BookOpen className="h-4 w-4 text-[#9d99ab]" />
            Read the docs
          </a>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[12px] text-[#9d99ab]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4fd6c0]" />
          https://crescent-js.vercel.app
        </div>
      </div>
    </main>
  );
}
