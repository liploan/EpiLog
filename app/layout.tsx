import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to tile servers and APIs for instant map boot */}
        <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://b.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://c.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://nominatim.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://en.wikipedia.org" />
      </head>
      <body className="bg-stone-950 text-stone-100 antialiased min-h-screen flex flex-col selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
