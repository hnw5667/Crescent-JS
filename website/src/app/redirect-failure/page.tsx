import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirect failed — Crescent.js',
  robots: { index: false },
};

/**
 * Landing URL for a failed redirect to crescent-js.vercel.app.
 *
 * The visible screen is the RedirectToVercel overlay mounted in the root
 * layout — on this path it renders directly in its failure state with the
 * clickable link, instead of auto-navigating.
 */
export default function RedirectFailurePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <p className="text-sm text-zinc-500">
        The redirect to crescent-js.vercel.app failed.
      </p>
    </main>
  );
}
