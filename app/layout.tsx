import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_Bengali, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

const bengali = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'Onyo Alap Studio',
  description:
    'Visual DNA reverse-engineering, Next.js/React/Remotion paper-craft illustration engine, autonomous AI director, and storyboard-gated video production studio.',
  openGraph: {
    title: 'Onyo Alap Studio',
    description:
      'Visual DNA reverse-engineering, Next.js/React/Remotion paper-craft illustration engine, autonomous AI director, and storyboard-gated video production studio.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onyo Alap Studio',
    description:
      'Visual DNA reverse-engineering, Next.js/React/Remotion paper-craft illustration engine, autonomous AI director, and storyboard-gated video production studio.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${bengali.variable} ${jetbrains.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen bg-[#F8F9FA] text-slate-900">
        {children}
      </body>
    </html>
  );
}
