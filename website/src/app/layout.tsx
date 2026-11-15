import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { RedirectToVercel } from '@/components/redirect-to-vercel';

export const metadata: Metadata = {
  title: 'Crescent.js - Full-Stack JavaScript Framework',
  description:
    'A full-stack JavaScript framework with integrated frontend rendering, backend logic, database, and authentication.',
  icons: {
    icon: [
      {
        url: `${
          process.env.NODE_ENV === 'production' ? '/Crescent-JS' : ''
        }/crescent-js-favicon.svg`,
        type: 'image/svg+xml',
        sizes: 'any',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] antialiased">
        <Navbar />
        {children}
        <RedirectToVercel />
      </body>
    </html>
  );
}