import type { Metadata } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const serifFont = Playfair_Display({
  variable: '--font-serif',
  weight: ['400', '600', '700'],
  subsets: ['latin'],
});

const sansFont = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const monoFont = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SILENT SENTINELS | Lunar & Martian Relic Archive — NASA Space Apps 2026',
  description:
    'Interactive Space Museum and Telemetry Archive honoring discarded NASA spacecraft on the Moon and Mars. Abandoned but Not Forgotten.',
  keywords: [
    'NASA Space Apps Challenge 2026',
    'Moon Landers',
    'Mars Rovers',
    'Apollo 11 Eagle',
    'Opportunity Rover',
    'Spirit Rover',
    'InSight Lander',
    'Ingenuity Mars Helicopter',
    'Space Archaeology',
    'Planetary Heritage',
  ],
  authors: [{ name: 'Salamat Seitbayev - NASA Space Apps 2026' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${serifFont.variable} ${sansFont.variable} ${monoFont.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#08080A] text-[#F5F5F7] font-sans selection:bg-[#D6C7B2]/20 selection:text-[#D6C7B2]">
        {children}
      </body>
    </html>
  );
}
