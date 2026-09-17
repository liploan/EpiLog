import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EpiLog — Spatiotemporal Travel Journal & Reflection Synthesizer',
  description:
    'An intelligent travel log that extracts EXIF GPS metadata, stitches DSLR orphans, clusters stops, drafts Multimodal Gemini reflections, and exports 9:16 social cards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-stone-950 text-stone-100 antialiased min-h-screen flex flex-col selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
