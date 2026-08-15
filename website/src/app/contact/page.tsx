'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Send, Loader2, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DISCORD_WEBHOOK_URL, DISCORD_URL, REDDIT_URL } from '@/lib/links';
import { DiscordIcon, RedditIcon } from '@/components/brand-icons';

const categories = [
  { value: 'recommendation', label: 'Recommendation' },
  { value: 'issue', label: 'Issue' },
  { value: 'others', label: 'Others' },
] as const;

type Category = (typeof categories)[number]['value'];
type Status = 'idle' | 'success' | 'error';

export default function ContactPage() {
  const [category, setCategory] = useState<Category>('recommendation');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setStatus('idle');

    const categoryLabel = categories.find((c) => c.value === category)?.label ?? 'Others';
    const payload = {
      embeds: [
        {
          title: `New contact · ${categoryLabel}`,
          color: 0x8b5cf6,
          fields: [
            { name: 'Category', value: categoryLabel, inline: true },
            { name: 'Email', value: email.trim() || 'Not provided', inline: true },
            { name: 'Description', value: description.trim() },
          ],
          footer: { text: 'Sent from crescent-js.dev' },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const res = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Webhook failed');
      setStatus('success');
      setEmail('');
      setDescription('');
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-colors focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40';

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(139,92,246,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_85%_10%,rgba(99,102,241,0.08),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
            Send us a recommendation, report an issue, or ask anything else. Messages are
            delivered straight to our team via Discord.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-zinc-300">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className={`${inputClass} appearance-none`}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#0a0a0f] text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us what's on your mind…"
                required
                minLength={5}
                rows={6}
                className={`${inputClass} resize-y`}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" disabled={isSubmitting || description.trim().length < 5}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Sending…' : 'Send message'}
              </Button>

              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                <DiscordIcon className="h-4 w-4" />
                Prefer Discord? Join our server
              </a>
              <a
                href={REDDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                <RedditIcon className="h-4 w-4" />
                r/CrescentJS
              </a>
            </div>
          </form>

          {status === 'success' && (
            <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-emerald-400/25 bg-emerald-500/[0.06] p-4 text-sm text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Thanks! Your message was sent. We&apos;ll get back to you as soon as possible.
              </span>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-red-400/25 bg-red-500/[0.06] p-4 text-sm text-red-300">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Something went wrong sending your message. Please try again, or join our Discord
                to reach us directly.
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
