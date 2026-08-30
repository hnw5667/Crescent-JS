'use client';

import Link from 'next/link';
import { ArrowRight, Github, Play, Boxes, Shield, Layers, Server, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GITHUB_URL } from '@/lib/links';

const examples = [
  {
    id: 'contact-form',
    title: 'Contact Form',
    subtitle: 'name • email • contact (optional)',
    description: 'Single-page form with Crescent layers (text/shape/input), cartesian positioning, ratio-based scaling, collect + conditional validation, zero-config DB, and REST API (POST/GET/DELETE).',
    stack: ['page', 'object', 'layer', 'trigger', 'collect', 'function', 'conditional', 'db', 'api_make'],
    port: 3000,
    route: '/docs/examples#contact-form',
    href: '/docs/examples',
    highlight: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500/20',
  },
  {
    id: 'auth-system',
    title: 'Auth System',
    subtitle: 'signup / login / session / protected dashboard',
    description: 'Three pages (signup, login, dashboard) + auth.signup / auth.login / auth.cookie (PBKDF2, signed cookies, lockout) + protected API (verify_session) + DB.',
    stack: ['page (×3)', 'trigger', 'collect', 'auth.signup', 'auth.login', 'auth.cookie', 'db', 'api_make'],
    port: 3001,
    route: '/docs/examples#auth-system',
    href: '/docs/examples',
    highlight: 'from-sky-500 to-blue-500',
    border: 'border-sky-500/20',
  },
];

export default function ExamplesIndexPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(139,92,246,0.12),transparent)]" />
      </div>
      <div className="relative mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            <Boxes className="h-3 w-3" /> examples/ — two folders, pure Crescent.js
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
            Example <span className="gradient-text">apps</span>
          </h1>
          <p className="mt-3 max-w-2xl text-white/50">
            Two fully working full-stack apps: contact form (frontend + backend + DB) and auth system (frontend + backend + DB + auth). Each is a single <code className="rounded bg-white/10 px-1 py-0.5">app.js</code> — run with <code className="rounded bg-white/10 px-1 py-0.5">node app.js</code> or <code className="rounded bg-white/10 px-1 py-0.5">crescent run app.js</code>. Explore in the docs and remix in the playground.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/playground">
              <Button>
                <Play className="mr-2 h-4 w-4" /> Open Playground
              </Button>
            </Link>
            <Link href="/docs/examples">
              <Button variant="outline">Docs — Examples</Button>
            </Link>
            <a href={`${GITHUB_URL}/tree/main/examples`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Github className="mr-2 h-4 w-4" /> View on GitHub
              </Button>
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {examples.map((ex) => (
            <Card key={ex.id} className={`relative overflow-hidden ${ex.border} bg-white/[0.03] p-6`}>
              <div className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br ${ex.highlight} opacity-10 blur-3xl`} />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${ex.highlight} text-white`}>
                    {ex.id === 'contact-form' ? <Layers className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </span>
                  <div>
                    <CardTitle className="text-lg">{ex.title}</CardTitle>
                    <p className="text-xs text-white/40">{ex.subtitle}</p>
                  </div>
                </div>
                <CardDescription className="leading-relaxed">{ex.description}</CardDescription>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {ex.stack.map((s) => (
                    <span key={s} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs text-white/50">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-xs text-white/30">examples/{ex.id}/app.js • :{ex.port}</span>
                  <Link href={ex.href} className="text-xs text-violet-400 hover:underline">
                    View docs <ArrowRight className="ml-1 inline h-3 w-3" />
                  </Link>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <span className="rounded-lg border border-white/5 bg-black/20 py-2">
                    <Server className="mx-auto mb-1 h-4 w-4 text-white/40" /> API
                  </span>
                  <span className="rounded-lg border border-white/5 bg-black/20 py-2">
                    <Database className="mx-auto mb-1 h-4 w-4 text-white/40" /> DB
                  </span>
                  <span className="rounded-lg border border-white/5 bg-black/20 py-2">
                    <Layers className="mx-auto mb-1 h-4 w-4 text-white/40" /> Frontend
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-white/10 bg-black/20 p-5">
          <h3 className="mb-2 text-sm font-semibold">Run locally</h3>
          <pre className="overflow-auto rounded-lg bg-[#0f0f14] p-4 font-mono text-xs text-white/70">
{`# contact form (port 3000)
node examples/contact-form/app.js
# or: crescent run examples/contact-form/app.js 3000

# auth system (port 3001)
node examples/auth-system/app.js
# or: crescent run examples/auth-system/app.js 3001

# build unified bundle (JS+HTML)
crescent build examples/contact-form/app.js ./build`}
          </pre>
        </Card>
      </div>
    </main>
  );
}
