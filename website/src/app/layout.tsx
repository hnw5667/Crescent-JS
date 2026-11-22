import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { MovedNotice } from '@/components/moved-notice';

/**
 * Production builds are the retired GitHub Pages site: every route renders
 * the same "Crescent.js has moved" screen. `npm run dev` still shows the full
 * site so the pages remain easy to work on locally.
 */
const isProduction = process.env.NODE_ENV === 'production';

export const metadata: Metadata = {
  title: isProduction
    ? 'Crescent.js has moved'
    : 'Crescent.js - Full-Stack JavaScript Framework',
  description: isProduction
    ? 'Crescent.js now lives at https://crescent-js.vercel.app — documentation, playground and examples.'
    : 'A full-stack JavaScript framework with integrated frontend rendering, backend logic, database, and authentication.',
  ...(isProduction ? { robots: { index: false, follow: true } } : {}),
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
        {isProduction ? (
          <MovedNotice />
        ) : (
          <>
            <Navbar />
            {children}
          </>
        )}
      </body>
    </html>
  );
}
