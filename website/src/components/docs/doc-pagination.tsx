'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAdjacentDocs } from '@/lib/docs-nav';

export function DocPagination() {
  const pathname = usePathname();
  const { prev, next } = getAdjacentDocs(pathname);

  return (
    <nav className="mt-14 flex flex-col gap-4 border-t border-white/5 pt-8 sm:flex-row">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-purple-400/30 hover:bg-purple-500/5"
        >
          <ArrowLeft className="h-5 w-5 shrink-0 text-white/30 transition-colors group-hover:text-purple-400" />
          <div className="min-w-0">
            <p className="text-xs text-white/30">Previous</p>
            <p className="truncate font-medium text-white/80 transition-colors group-hover:text-white">
              {prev.title}
            </p>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-right transition-all hover:border-purple-400/30 hover:bg-purple-500/5"
        >
          <div className="min-w-0">
            <p className="text-xs text-white/30">Next</p>
            <p className="truncate font-medium text-white/80 transition-colors group-hover:text-white">
              {next.title}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-white/30 transition-colors group-hover:text-purple-400" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
