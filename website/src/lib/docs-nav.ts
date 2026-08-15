export interface DocItem {
  title: string;
  description: string;
  href: string;
}

export interface DocSection {
  title: string;
  items: DocItem[];
}

export const docsNav: DocSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        title: 'Introduction',
        description: 'Install Crescent.js and build your first application.',
        href: '/docs/getting-started',
      },
    ],
  },
  {
    title: 'Guides',
    items: [
      {
        title: 'Frontend',
        description: 'Build UIs with pages, objects, layers, transitions, and triggers.',
        href: '/docs/frontend',
      },
      {
        title: 'Backend',
        description: 'Write server-side logic with functions, conditionals, loops, and APIs.',
        href: '/docs/backend',
      },
      {
        title: 'Database',
        description: 'Use the built-in CRUD database with querying and collections.',
        href: '/docs/database',
      },
      {
        title: 'Authentication',
        description: 'Add signup, login, OAuth, and session handling.',
        href: '/docs/authentication',
      },
    ],
  },
  {
    title: 'Reference',
    items: [
      {
        title: 'API Reference',
        description: 'Complete reference for every Crescent.js method.',
        href: '/docs/api-reference',
      },
      {
        title: 'Configuration',
        description: 'All configuration options for layers, objects, and pages.',
        href: '/docs/configuration',
      },
      {
        title: 'Deployment',
        description: 'Deploy your application to production.',
        href: '/docs/deployment',
      },
    ],
  },
  {
    title: 'Optimisation',
    items: [
      {
        title: 'Compression',
        description: 'Compress text and JSON packets so they open anywhere.',
        href: '/docs/compression',
      },
      {
        title: 'Encrypted Tunnels',
        description: 'Automatically encrypt outbound data with AES-256-GCM.',
        href: '/docs/encrypted-tunnels',
      },
      {
        title: 'Component Cache',
        description: 'Optimise frontend rendering by caching components.',
        href: '/docs/component-cache',
      },
    ],
  },
];

export const flatDocs = docsNav.flatMap((section) => section.items);

export function getAdjacentDocs(href: string) {
  const index = flatDocs.findIndex((item) => item.href === href);
  return {
    prev: index > 0 ? flatDocs[index - 1] : null,
    next: index < flatDocs.length - 1 ? flatDocs[index + 1] : null,
  };
}
