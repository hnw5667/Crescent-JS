'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Github } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Docs', href: '/docs/getting-started' },
  { label: 'API Reference', href: '/docs/api-reference' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-sm shadow-lg shadow-purple-600/30">
            🌙
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            Crescent.js
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
            v1.0.3
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/hnw5667/Crescent-JS"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-[#0a0a0f] md:hidden">
          <div className="mx-auto max-w-[1400px] space-y-1 px-4 py-3 sm:px-6">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-white/10 font-medium text-white'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="https://github.com/hnw5667/Crescent-JS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
