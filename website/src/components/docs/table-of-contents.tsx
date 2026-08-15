'use client';

import { useEffect, useState } from 'react';
import { usePageHeadings } from '@/lib/use-page-headings';

export function TableOfContents() {
  const headings = usePageHeadings();
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    const elements = Array.from(
      main.querySelectorAll('h2[id], h3[id]')
    ) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="max-h-[calc(100vh-7rem)] overflow-y-auto">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-white/10">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block border-l-2 py-1.5 text-sm leading-snug transition-colors ${
                heading.level === 2 ? 'pl-4' : 'pl-7'
              } ${
                activeId === heading.id
                  ? '-ml-px border-purple-500 font-medium text-white'
                  : 'border-transparent text-zinc-500 hover:border-white/20 hover:text-zinc-300'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
