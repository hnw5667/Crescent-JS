import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface DocHeaderProps {
  title: string;
  description: string;
  badge?: string;
}

export function DocHeader({ title, description, badge }: DocHeaderProps) {
  return (
    <header className="mb-14">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/35">
        <Link href="/" className="transition-colors hover:text-white/70">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/docs/getting-started" className="transition-colors hover:text-white/70">
          Docs
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white/60">{title}</span>
      </nav>

      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          Crescent.js {badge || 'Docs'}
        </span>
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-white">{title}</h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-400">
        {description}
      </p>
      <div className="mt-6 h-px w-full bg-gradient-to-r from-purple-400/40 via-white/10 to-transparent" />
    </header>
  );
}
