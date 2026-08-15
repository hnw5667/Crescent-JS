'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen, Boxes, Database, KeyRound, Sparkles, SlidersHorizontal, Rocket, Globe, Command, FileCode2, Settings, Upload, Zap, Shield, Archive } from 'lucide-react';
import { useState } from 'react';
import { docsNav } from '@/lib/docs-nav';
import { cn } from '@/lib/utils';

const sectionIcons: Record<string, React.ReactNode> = {
  'Getting Started': <Rocket className="h-3.5 w-3.5" />,
  Guides: <BookOpen className="h-3.5 w-3.5" />,
  Reference: <Command className="h-3.5 w-3.5" />,
  'v1.0.4 Features': <Zap className="h-3.5 w-3.5" />,
};

const itemIcons: Record<string, React.ReactNode> = {
  Introduction: <Sparkles className="h-3.5 w-3.5" />,
  Frontend: <Boxes className="h-3.5 w-3.5" />,
  Backend: <FileCode2 className="h-3.5 w-3.5" />,
  Database: <Database className="h-3.5 w-3.5" />,
  Authentication: <KeyRound className="h-3.5 w-3.5" />,
  'API Reference': <BookOpen className="h-3.5 w-3.5" />,
  Configuration: <Settings className="h-3.5 w-3.5" />,
  Deployment: <Upload className="h-3.5 w-3.5" />,
  Compression: <Archive className="h-3.5 w-3.5" />,
  'Encrypted Tunnels': <Shield className="h-3.5 w-3.5" />,
  'Component Cache': <Boxes className="h-3.5 w-3.5" />,
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
          <h3 className="mb-2 flex items-center gap-2 px-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
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
                      'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-purple-500/10 font-medium text-white'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
                    )}
                  >
                    {itemIcons[item.title] && (
                      <span
                        className={cn(
                          'shrink-0 transition-colors',
                          isActive ? 'text-purple-400' : 'text-zinc-600 group-hover:text-zinc-400',
                        )}
                      >
                        {itemIcons[item.title]}
                      </span>
                    )}
                    {item.title}
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
      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-60 shrink-0 overflow-y-auto pb-10 pr-2 lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-600/40 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-white/10 bg-[#0d0d14]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 text-xs">
                  🌙
                </span>
                Documentation
              </span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"
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
    </>
  );
}
