'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen, Boxes, Database, KeyRound, Sparkles, SlidersHorizontal, Rocket, Globe } from 'lucide-react';
import { useState } from 'react';
import { docsNav } from '@/lib/docs-nav';
import { cn } from '@/lib/utils';

const sectionIcons: Record<string, React.ReactNode> = {
  'Getting Started': <Rocket className="h-4 w-4" />,
  Guides: <BookOpen className="h-4 w-4" />,
  Reference: <SlidersHorizontal className="h-4 w-4" />,
};

const itemIcons: Record<string, React.ReactNode> = {
  Frontend: <Boxes className="h-3.5 w-3.5" />,
  Backend: <SlidersHorizontal className="h-3.5 w-3.5" />,
  Database: <Database className="h-3.5 w-3.5" />,
  Authentication: <KeyRound className="h-3.5 w-3.5" />,
  Introduction: <Sparkles className="h-3.5 w-3.5" />,
  Deployment: <Globe className="h-3.5 w-3.5" />,
};

interface SidebarContentProps {
  pathname: string;
  onNavigate?: () => void;
}

function SidebarContent({ pathname, onNavigate }: SidebarContentProps) {
  return (
    <nav className="space-y-7">
      {docsNav.map((section) => (
        <div key={section.title}>
          <h3 className="mb-2.5 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/30">
            {sectionIcons[section.title]}
            {section.title}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all',
                      isActive
                        ? 'bg-purple-500/10 text-white shadow-sm ring-1 ring-purple-400/20'
                        : 'text-white/45 hover:bg-white/5 hover:text-white/80'
                    )}
                  >
                    {itemIcons[item.title] && (
                      <span
                        className={cn(
                          'transition-colors',
                          isActive ? 'text-purple-400' : 'text-white/25 group-hover:text-white/50'
                        )}
                      >
                        {itemIcons[item.title]}
                      </span>
                    )}
                    <span className={cn(isActive && 'font-medium')}>{item.title}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-64 shrink-0 overflow-y-auto pr-6 lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30"
          aria-label="Open docs navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-[#0d0d14] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="text-lg">🌙</span> Documentation
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
