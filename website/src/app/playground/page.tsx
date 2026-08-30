import type { Metadata } from 'next';
import Playground from '@/components/playground/Playground';

export const metadata: Metadata = {
  title: 'Playground — Crescent.js',
  description: 'Visual frontend builder, scaling lab and block-based backend — test Crescent.js in the browser and export to app.js.',
};

export default function PlaygroundPage() {
  return <Playground />;
}
