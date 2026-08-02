import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface DocHeaderProps {
  title: string;
  description: string;
  badge?: string;
}

export function DocHeader({ title, description, badge }: DocHeaderProps) {
  return (
    <header className="mb-12">
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/" className="transition-colors hover:text-white">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
        <Link
          href="/docs/getting-started"
          className="transition-colors hover:text-white"
        >
          Docs
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
        <span className="text-zinc-300">{title}</span>
      </nav>

      {badge && (
        <div className="mb-4">
          <span className="inline-flex items-center rounded-md border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300">
            {badge}
          </span>
        </div>
      )}

      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
        {description}
      </p>
      <div className="mt-8 h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
    </header>
  );
}
