import Link from 'next/link';

const docSections = [
  {
    title: 'Getting Started',
    items: [{ label: 'Overview', href: '/docs/getting-started' }],
  },
  {
    title: 'Core Concepts',
    items: [
      { label: 'Frontend', href: '/docs/frontend' },
      { label: 'Backend', href: '/docs/backend' },
      { label: 'Database', href: '/docs/database' },
      { label: 'Authentication', href: '/docs/authentication' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'API Reference', href: '/docs/api-reference' },
      { label: 'Configuration', href: '/docs/configuration' },
      { label: 'Deployment', href: '/docs/deployment' },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <nav className="sticky top-24 space-y-8 pr-6">
        {docSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3 py-1.5 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}