import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AIORA — AI × Web Development Hackathon | KIT Mangaluru',
  description:
    'Official hackathon portal for AIORA — AI × Web Development Hackathon organized by the Department of Artificial Intelligence and Machine Learning (AI & ML) at Karavali Institute of Technology, Mangaluru, Karnataka, India on Thursday, 5 November 2026. Imagine. Build. Deploy.',
  keywords: [
    'AIORA',
    'Hackathon',
    'AI × Web Development',
    'Karavali Institute of Technology',
    'KIT Mangaluru',
    'Department of AI & ML',
    'Mangaluru Hackathon 2026',
    'Engineering Hackathon India',
  ],
  icons: {
    icon: '/assets/aiora_logo.png',
    apple: '/assets/aiora_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
