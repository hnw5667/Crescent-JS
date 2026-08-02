'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun, ExternalLink, Github } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const navItems = [
  { label: 'Docs', href: '/docs/getting-started' },
  { label: 'API Reference', href: '/docs/api-reference' },
  { label: 'GitHub', href: 'https://github.com/hnw5667/Crescent-JS', external: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-black/60 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🌙</span>
            <span className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">
              Crescent.js
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {item.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm rounded-lg transition-colors',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5',
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white rounded-lg"
                >
                  {item.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-lg',
                    pathname === item.href
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>
      )}
    </nav>
  );
}