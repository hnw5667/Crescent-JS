'use client';

import Link from 'next/link';
import { ArrowRight, Layers, Server, Database, Shield, Code2, Zap, Moon, Github, Package, Play, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PrismBackground } from '@/components/prism-background';
import { DiscordIcon, NpmIcon } from '@/components/brand-icons';
import { GITHUB_URL, DISCORD_URL, NPM_URL } from '@/lib/links';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: Layers,
    title: 'Declarative UI',
    description:
      'Build interfaces with pages, objects, and layers using a cartesian coordinate system. No CSS required.',
  },
  {
    icon: Server,
    title: 'Backend Logic',
    description:
      'Write server-side functions, conditionals, loops, and create REST APIs all from one place.',
  },
  {
    icon: Database,
    title: 'Built-in Database',
    description:
      'Zero-config CRUD database with collections, querying, sorting, and pagination out of the box.',
  },
  {
    icon: Shield,
    title: 'Authentication',
    description:
      'Complete auth system with signup, login, OAuth providers, session management, and account security.',
  },
  {
    icon: Zap,
    title: 'Responsive by Default',
    description:
      'Ratio-based scaling ensures your application works across mobile, tablet, and desktop seamlessly.',
  },
  {
    icon: Package,
    title: 'App-Build (v2.5.1 — Tauri-only)',
    description:
      'Turn any folder into a Tauri app. crescent app-build → one zip with Tauri bundles (src-tauri + native binaries) per OS.',
  },
  {
    icon: Code2,
    title: 'Zero Config',
    description:
      'One framework, no setup. Install and start building immediately with sensible defaults.',
  },
];

const codeExample = `const crescent = require('crescent-js');

// Create a page
const page = crescent.page({
  page_id: 'home',
  page_title: 'My App'
});

// Create an object with a text layer
const hero = crescent.object({
  object_id: 'hero',
  size: { height: 200, width: 600 }
});

hero.add_layer(
  crescent.layer({
    layer_type: 'text',
    layer_id: 'heading',
    text: 'Hello, World!',
    size: 32,
    colour: '0,0,0',
    bold: true
  })
);

page.add_object(hero);
page.render();`;

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Prism Background */}
      <div className="absolute inset-0 w-full h-full">
        <PrismBackground className="opacity-80" />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/40 to-[#0a0a0f]" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#0a0a0f]/60" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className={mounted ? 'animate-fade-in' : 'opacity-0'}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse-glow" />
                <a
                  href={NPM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Now available on npm
                </a>
              </div>
            </div>

            <h1
              className={`text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 ${
                mounted ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.1s' }}
            >
              Build full-stack apps
              <br />
              <span className="gradient-text">with one framework.</span>
            </h1>

            <p
              className={`text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed ${
                mounted ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.2s' }}
            >
              Crescent.js unifies frontend rendering, backend logic, database operations, and
              authentication into a single JavaScript framework. Build faster, ship with confidence.
            </p>

            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 ${
                mounted ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.3s' }}
            >
              <Link href="/docs/getting-started">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="group">
                  <Github className="mr-2 w-4 h-4" />
                  View on GitHub
                </Button>
              </a>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="group">
                  <DiscordIcon className="mr-2 w-4 h-4" />
                  Join Discord
                </Button>
              </a>
            </div>

            {/* Code Preview */}
            <div
              className={`glass-card max-w-2xl mx-auto text-left overflow-hidden ${
                mounted ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.5s' }}
            >
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs text-white/30 font-mono">app.js</span>
              </div>
              <pre className="p-5 text-sm font-mono text-left overflow-x-auto">
                <code className="text-white/70">{codeExample}</code>
              </pre>
            </div>

            {/* Playground + Examples banner */}
            <div
              className={`mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-2 text-left ${
                mounted ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.6s' }}
            >
              <Link href="/playground" className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md hover:border-white/15 hover:bg-white/[0.06] transition-colors">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600"><Play className="h-3.5 w-3.5 text-white" /></span>
                  Playground
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50">Test scaling, build UIs visually and chain backend blocks — in the browser, export to <span className="font-mono text-white/70">app.js</span>.</p>
                <div className="mt-2 inline-flex rounded-full bg-purple-500/15 px-2 py-0.5 text-[11px] font-medium text-purple-300">Frontend scaling • Block backend • Runs on GitHub Pages</div>
              </Link>
              <Link href="/docs/examples" className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md hover:border-white/15 hover:bg-white/[0.06] transition-colors">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10"><Boxes className="h-3.5 w-3.5 text-white" /></span>
                  Examples
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50">Two complete apps — <span className="text-white/80">contact form</span> + <span className="text-white/80">auth system</span> — pure Crescent.js.</p>
                <div className="mt-2 font-mono text-[11px] text-white/40">examples/contact-form • examples/auth-system</div>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything you need to{' '}
                <span className="gradient-text">ship faster.</span>
              </h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto">
                No more juggling between libraries. Crescent handles frontend, backend, database,
                and auth out of the box.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => (
                <Card
                  key={feature.title}
                  className="group hover:border-white/15 transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
                      <feature.icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Playground + Examples Showcase */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Try it <span className="gradient-text">live</span>, ship today.
              </h2>
              <p className="text-white/40 max-w-2xl mx-auto">
                The new playground runs entirely in the browser (GitHub Pages static export). Two full-stack example apps ship in <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">examples/</code> — pure Crescent.js.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="group relative overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-6 hover:border-violet-500/30 transition-colors">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="relative">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Playground</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">
                    Build a frontend visually, test cartesian scaling at 375 / 768 / 1200px, and chain backend blocks (Validate → DB → API) like nodes. Exports Crescent code.
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/playground">
                      <Button size="sm" className="group/btn">
                        Open Playground <ArrowRight className="ml-1 h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/docs/playground">
                      <Button size="sm" variant="outline">
                        Docs
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300">Scaling slider</span>
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300">Block nodes</span>
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300">Code export</span>
                  </div>
                </div>
              </Card>
              <Card className="group relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 hover:border-emerald-500/30 transition-colors">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="relative">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600">
                    <Boxes className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Contact Form</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">
                    Collects <strong className="text-white">name</strong>, <strong className="text-white">email</strong>, <strong className="text-white">contact (optional)</strong> — frontend + <code>collect</code>/<code>conditional</code> + <code>db</code> + <code>api_make</code> REST.
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/docs/examples">
                      <Button size="sm" variant="outline" className="border-emerald-500/20 hover:bg-emerald-500/10">
                        View example
                      </Button>
                    </Link>
                    <a href="https://github.com/hnw5667/Crescent-JS/tree/main/examples/contact-form" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                        <Github className="mr-1 h-3.5 w-3.5" /> Code
                      </Button>
                    </a>
                  </div>
                  <div className="mt-4 font-mono text-xs text-white/30">examples/contact-form/app.js • :3000</div>
                </div>
              </Card>
              <Card className="group relative overflow-hidden border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-blue-500/10 p-6 hover:border-sky-500/30 transition-colors">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />
                <div className="relative">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-blue-600">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Auth System</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">
                    Signup / login / session + protected dashboard — <code>auth.signup</code>/<code>login</code>/<code>cookie</code>, PBKDF2, lockout, 3 pages + API.
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/docs/examples">
                      <Button size="sm" variant="outline" className="border-sky-500/20 hover:bg-sky-500/10">
                        View example
                      </Button>
                    </Link>
                    <a href="https://github.com/hnw5667/Crescent-JS/tree/main/examples/auth-system" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                        <Github className="mr-1 h-3.5 w-3.5" /> Code
                      </Button>
                    </a>
                  </div>
                  <div className="mt-4 font-mono text-xs text-white/30">examples/auth-system/app.js • :3001</div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center glass-card p-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to{' '}
              <span className="gradient-text">build something</span>
              ?
            </h2>
            <p className="text-white/50 mb-8 text-lg">
              Install Crescent.js and start building your next full-stack application today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={NPM_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="group">
                  <NpmIcon className="mr-2 w-4 h-4" />
                  npm install crescent-js
                </Button>
              </a>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="group">
                  Contact us
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Moon className="w-4 h-4" />
              <span>Crescent.js</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/docs/getting-started" className="text-sm text-white/40 hover:text-white transition-colors">
                Docs
              </Link>
              <Link href="/contact" className="text-sm text-white/40 hover:text-white transition-colors">
                Contact
              </Link>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1">
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1">
                <DiscordIcon className="w-4 h-4" />
                Discord
              </a>
              <a href={NPM_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1">
                <NpmIcon className="w-3 h-3" />
                npm
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}