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
      <div className="relative z-10 pt-28 pb-32">
        <div className="mx-auto flex w-full max-w-[96rem] gap-10 px-6 sm:px-8">
          <Sidebar />

          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-4xl doc-content">{children}</div>
          </main>

          <div className="sticky top-24 hidden w-60 shrink-0 xl:block">
            <TableOfContents />
          </div>
        </div>
      </div>
    </div>
  );
}
