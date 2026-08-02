'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    let intersectionObserver: IntersectionObserver | null = null;

    const scan = () => {
      const elements = Array.from(
        main.querySelectorAll('h2[id], h3[id]')
      ) as HTMLElement[];

      const items = elements.map((el) => ({
        id: el.id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      }));

      setHeadings((prev) =>
        prev.length === items.length && prev.every((h, i) => h.id === items[i].id)
          ? prev
          : items
      );
      setActiveId('');

      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }

      intersectionObserver = new IntersectionObserver(
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
        intersectionObserver.observe(el);
      }
    };

    scan();

    // Re-scan whenever the article content changes (e.g. client-side
    // navigation between doc pages), regardless of React commit timing.
    const mutationObserver = new MutationObserver(scan);
    mutationObserver.observe(main, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, []);

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
