'use client';

import Link from 'next/link';
import { ArrowRight, Layers, Server, Database, Shield, Code2, Zap, Moon, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PrismBackground } from '@/components/prism-background';
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
                <span className="text-sm text-white/60">Now available on npm</span>
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
              <a href="https://github.com/hnw5667/crescent-js" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="group">
                  <Github className="mr-2 w-4 h-4" />
                  View on GitHub
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
            <div className="code-block inline-block text-left">
              <code className="text-purple-300">npm install crescent-js</code>
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
              <a href="https://github.com/hnw5667/crescent-js" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}