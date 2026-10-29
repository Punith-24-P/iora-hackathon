import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Cpu, Award, Globe, Users, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { getSettings } from '@/lib/db';

export default async function AboutPage() {
  const settings = getSettings();

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
            ORGANIZING BODY & INSTITUTION
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            About AIORA & KIT Mangaluru
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Pioneering excellence at the intersection of Artificial Intelligence and modern Web Engineering.
          </p>
        </div>

        {/* 2-Column Institutional Feature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Card 1: AIORA Forum */}
          <div className="p-8 rounded-2xl glass-panel-glow border border-cyan-500/30 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/50 p-1 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                <Image
                  src="/assets/aiora_logo.png"
                  alt="AIORA Forum"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">AIORA FORUM</h2>
                <p className="text-cyan-400 font-mono text-xs font-bold tracking-wider">
                  Imagine. Build. Deploy.
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              AIORA is the official student and technical forum representing the Department of Artificial Intelligence & Machine Learning. Founded to ignite practical problem-solving and empower students with real-world technical skills, AIORA cultivates a thriving culture of hackathons, workshops, and interdisciplinary development.
            </p>

            <div className="pt-2">
              <a
                href={settings.instagram_url || 'https://instagram.com/aiora_official'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-pink-400 hover:text-pink-300 px-3 py-1.5 rounded-lg bg-pink-950/40 border border-pink-500/30 transition"
              >
                Official Instagram: @aiora_official <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Department & College */}
          <div className="p-8 rounded-2xl glass-panel border border-slate-800 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                KIT
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Karavali Institute of Technology</h2>
                <p className="text-slate-400 text-xs">Mangaluru, Karnataka, India</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              The <strong className="text-white">Department of Artificial Intelligence & Machine Learning (AI & ML)</strong> is dedicated to advancing state-of-the-art computational intelligence. Our curriculum and student initiatives emphasize practical systems architecture, machine learning engineering, and full-stack software development.
            </p>

            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Affiliated with recognized academic standards
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Dedicated laboratories with high-speed power infrastructure
              </li>
            </ul>
          </div>
        </div>

        {/* Hackathon Vision */}
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 mb-16">
          <h3 className="text-xl font-bold text-white">Why AI × Web Development?</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            In today&apos;s technological landscape, standalone AI models have limited impact without an intuitive, accessible interface. Similarly, modern web platforms require intelligent autonomy to deliver meaningful real-world solutions.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            The AIORA Hackathon bridges this gap by requiring every participating team to build a working web platform powered by at least one meaningful AI feature addressing one of two unannounced problem statements revealed at the start of the event.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            Register Your Team for 5 November 2026 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
