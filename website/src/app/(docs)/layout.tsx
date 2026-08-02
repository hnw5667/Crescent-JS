import { Metadata } from 'next';
import { Sidebar } from '@/components/sidebar';
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
      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-10">
          <Sidebar />
          <main className="flex-1 min-w-0 doc-content">{children}</main>
        </div>
      </div>
    </div>
  );
}