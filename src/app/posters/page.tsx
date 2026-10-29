import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PosterGenerator from '@/components/PosterGenerator';
import { getSettings } from '@/lib/db';
import { Image as ImageIcon, QrCode } from 'lucide-react';

export default async function PostersPage() {
  const settings = getSettings();

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <ImageIcon className="w-3.5 h-3.5" />
            OFFICIAL MARKETING ASSETS
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Promotional Event Posters
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Download and print official posters for notice boards, WhatsApp announcements, and Instagram stories. All layouts include the verified event date, ₹400 registration fee, and a dynamic website registration QR code.
          </p>
        </div>

        <PosterGenerator settings={settings} />
      </main>

      <Footer />
    </div>
  );
}
