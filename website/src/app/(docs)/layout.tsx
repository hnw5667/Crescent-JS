import { Metadata } from 'next';
import { Sidebar } from '@/components/sidebar';
import { TableOfContents } from '@/components/docs/table-of-contents';
import { StarsBackground } from '@/components/stars-background';

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
    <div className="relative min-h-screen">
      <StarsBackground />
      <div className="relative z-10 pt-20 pb-24">
        <div className="mx-auto flex max-w-7xl gap-8 px-4 sm:px-6">
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
