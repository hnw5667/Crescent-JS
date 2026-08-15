'use client';

import { useEffect, useState } from 'react';

export interface PageHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Read the h2/h3 headings with ids from the page's <main> element.
 * Re-scans when the article content changes (client-side nav between docs).
 */
export function usePageHeadings(): PageHeading[] {
  const [headings, setHeadings] = useState<PageHeading[]>([]);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

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
    };

    scan();

    const observer = new MutationObserver(scan);
    observer.observe(main, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return headings;
}