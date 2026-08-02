import { Metadata } from 'next';
import { Sidebar } from '@/components/sidebar';
import { TableOfContents } from '@/components/docs/table-of-contents';

export const metadata: Metadata = {
  title: {
    default: 'Documentation - Crescent.js',
    template: '%s - Crescent.js',
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(139,92,246,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_85%_10%,rgba(99,102,241,0.08),transparent)]" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto flex w-full max-w-[1400px] gap-10 px-4 py-10 sm:px-6 lg:gap-14 lg:px-8">
          <Sidebar />

          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-3xl doc-content">{children}</div>
          </main>

          <div className="sticky top-24 hidden w-56 shrink-0 xl:block">
            <TableOfContents />
          </div>
        </div>
      </div>
    </div>
  );
}
