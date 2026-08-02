'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAdjacentDocs } from '@/lib/docs-nav';

export function DocPagination() {
  const pathname = usePathname();
  const { prev, next } = getAdjacentDocs(pathname);

  return (
    <nav className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
        >
          <ArrowLeft className="h-5 w-5 shrink-0 text-zinc-500 transition-colors group-hover:text-purple-400" />
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">Previous</p>
            <p className="truncate font-medium text-zinc-200 transition-colors group-hover:text-white">
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
          className="group flex flex-1 items-center justify-end gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-right transition-colors hover:border-white/20 hover:bg-white/[0.05]"
        >
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">Next</p>
            <p className="truncate font-medium text-zinc-200 transition-colors group-hover:text-white">
              {next.title}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500 transition-colors group-hover:text-purple-400" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
