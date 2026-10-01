import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Fraunces, Newsreader } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'EpiLog — The AI Travel Journal & Intellectual Keepsake',
  description:
    'Turn raw travel photos into interactive maps, narrative timelines, contextual daily news capsules, and reflective "What I Learned" takeaways.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to open tile servers and APIs for instant map boot */}
        <link rel="preconnect" href="https://a.tile.openstreetmap.fr" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://b.tile.openstreetmap.fr" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tile.openstreetmap.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://nominatim.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://en.wikipedia.org" />
      </head>
      <body className={`bg-sand-100 dark:bg-sand-950 text-sand-900 dark:text-sand-100 antialiased min-h-screen flex flex-col selection:bg-atelier-terracotta selection:text-white ${plusJakarta.variable} ${fraunces.variable} ${newsreader.variable}`}>
        {children}
      </body>
    </html>
  );
}
