'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Download, Calendar, Clock, Users, Award, Sparkles, Printer } from 'lucide-react';

interface PosterProps {
  settings: any;
}

export default function PosterGenerator({ settings }: PosterProps) {
  const [activeTab, setActiveTab] = useState<'portrait' | 'story' | 'a4'>('portrait');
  const [registrationQrUrl, setRegistrationQrUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const websiteUrl = settings?.publicWebsiteUrl || 'http://localhost:3000';
  const registrationUrl = `${websiteUrl}/register`;

  useEffect(() => {
    // Generate actual Website Registration QR (NOT PhonePe payment QR)
    QRCode.toDataURL(registrationUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setRegistrationQrUrl(url))
      .catch((err) => console.error('Failed to generate registration QR:', err));
  }, [registrationUrl]);

  const handlePrintA4 = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('portrait')}
          className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition ${
            activeTab === 'portrait'
              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          Portrait Feed (1080 × 1350)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('story')}
          className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition ${
            activeTab === 'story'
              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          Story / Vertical (1080 × 1920)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('a4')}
          className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition ${
            activeTab === 'a4'
              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          Printable A4 Sheet
        </button>
      </div>

      {/* Poster Display Box */}
      <div className="flex justify-center">
        {/* PORTRAIT POSTER (1080x1350 aspect: 4/5) */}
        {activeTab === 'portrait' && (
          <div
            ref={posterRef}
            className="w-full max-w-[500px] aspect-[4/5] bg-gradient-to-b from-[#060a14] via-[#091124] to-[#04060d] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.15)]"
          >
            {/* Ambient circuit glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar: Institution & Department */}
            <div className="text-center space-y-1 relative z-10">
              <span className="text-[10px] tracking-widest text-cyan-300 font-mono uppercase block font-semibold">
                Karavali Institute of Technology, Mangaluru
              </span>
              <span className="text-[11px] text-slate-300 font-medium block">
                Department of Artificial Intelligence & Machine Learning
              </span>
              <span className="text-[10px] text-purple-300 font-mono tracking-widest uppercase block">
                Organized by the AIORA Forum
              </span>
            </div>

            {/* Center Brand & Event Title */}
            <div className="text-center space-y-3 relative z-10 my-auto">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-cyan-400 p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                <Image
                  src="/assets/aiora_logo.png"
                  alt="AIORA Logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
                  AIORA
                </h2>
                <div className="text-sm sm:text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 mt-1 uppercase tracking-wide">
                  AI × Web Development Hackathon
                </div>
                <div className="text-xs font-mono font-bold text-cyan-400 tracking-widest mt-1">
                  Imagine. Build. Deploy.
                </div>
              </div>

              {/* Event Date & Timings */}
              <div className="inline-block px-4 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs space-y-0.5">
                <div className="font-bold text-amber-300">Thursday, 5 November 2026</div>
                <div className="text-[11px] text-slate-300">
                  Check-in: 9:00 AM–9:30 AM · Hackathon: 9:30 AM–3:00 PM
                </div>
                <div className="text-[10px] text-rose-300 font-mono">Submission closes at 3:00 PM sharp</div>
              </div>
            </div>

            {/* Bottom Bar: Key Rules & Website Registration QR */}
            <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <div className="space-y-1 text-left">
                <div className="text-[11px] font-bold text-emerald-300">Fee: ₹400 per team</div>
                <div className="text-[10px] text-slate-300">Team Size: 2–4 Students</div>
                <div className="text-[10px] text-purple-300">Prizes: 1st, 2nd, 3rd + Certificates</div>
                <div className="text-[9px] text-slate-400">Bring personal mobile hotspot & laptops</div>
              </div>

              {/* Dynamic Registration QR */}
              <div className="flex flex-col items-center p-1.5 rounded-xl bg-white text-black shadow-md shrink-0">
                {registrationQrUrl ? (
                  <div className="w-16 h-16 relative">
                    <Image src={registrationQrUrl} alt="Website Registration QR" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-[10px]">QR Code</div>
                )}
                <span className="text-[7px] font-black tracking-tight uppercase text-slate-900 mt-0.5">
                  Scan to Register
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STORY POSTER (1080x1920 aspect: 9/16) */}
        {activeTab === 'story' && (
          <div
            ref={posterRef}
            className="w-full max-w-[420px] aspect-[9/16] bg-gradient-to-b from-[#060a14] via-[#091124] to-[#04060d] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.15)]"
          >
            {/* Top Bar */}
            <div className="text-center space-y-1">
              <span className="text-[11px] tracking-widest text-cyan-300 font-mono uppercase font-bold block">
                Karavali Institute of Technology, Mangaluru
              </span>
              <span className="text-[11px] text-slate-300 block">
                Department of AI & ML · AIORA Forum
              </span>
            </div>

            {/* Center Content */}
            <div className="text-center space-y-4 my-auto">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-cyan-400 p-1 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                <Image
                  src="/assets/aiora_logo.png"
                  alt="AIORA Logo"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="space-y-1">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  AIORA
                </h2>
                <div className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase">
                  AI × Web Development Hackathon
                </div>
                <div className="text-xs font-mono font-bold text-cyan-400 tracking-widest">
                  Imagine. Build. Deploy.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-1.5 text-xs">
                <div className="font-extrabold text-amber-300 text-sm">Thursday, 5 November 2026</div>
                <div className="text-slate-300">Check-in: 9:00 AM – 9:30 AM IST</div>
                <div className="text-slate-300">Hackathon Sprint: 9:30 AM – 3:00 PM</div>
                <div className="text-rose-400 font-bold font-mono text-[11px]">Submission Closes at 3:00 PM Sharp</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Team Size</div>
                  <div className="font-bold text-white">2–4 Students</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Registration Fee</div>
                  <div className="font-bold text-emerald-400">₹400 / Team</div>
                </div>
              </div>
            </div>

            {/* Bottom: QR & Venue */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <div className="text-left space-y-1 text-xs">
                <div className="font-bold text-white">Prize Positions 1st, 2nd & 3rd</div>
                <div className="text-[11px] text-slate-400">Certificates for all participants</div>
                <div className="text-[10px] text-cyan-300 font-mono">
                  {settings?.publicWebsiteUrl ? settings.publicWebsiteUrl.replace('http://', '') : 'aiora.hackathon'}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white text-black shadow-md flex flex-col items-center">
                {registrationQrUrl ? (
                  <div className="w-16 h-16 relative">
                    <Image src={registrationQrUrl} alt="Website Registration QR" fill className="object-contain" />
                  </div>
                ) : null}
                <span className="text-[7px] font-black uppercase tracking-tight text-slate-900 mt-0.5">
                  Scan to Register
                </span>
              </div>
            </div>
          </div>
        )}

        {/* A4 PRINTABLE POSTER */}
        {activeTab === 'a4' && (
          <div
            ref={posterRef}
            className="w-full max-w-[550px] aspect-[1/1.414] bg-white text-black border-2 border-black rounded-xl p-8 flex flex-col justify-between shadow-2xl print:border-none print:shadow-none print:p-0"
          >
            {/* Top */}
            <div className="text-center pb-4 border-b-2 border-black space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-800">
                Karavali Institute of Technology, Mangaluru, Karnataka
              </h4>
              <p className="text-xs text-gray-700 font-semibold">
                Department of Artificial Intelligence & Machine Learning (AI & ML)
              </p>
              <p className="text-[11px] text-gray-600 font-mono">
                Organized by the AIORA Forum
              </p>
            </div>

            {/* Main */}
            <div className="text-center space-y-4 my-auto">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-black p-0.5">
                <Image
                  src="/assets/aiora_logo.png"
                  alt="AIORA Logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">AIORA</h1>
                <h2 className="text-sm sm:text-base font-extrabold tracking-wide uppercase mt-1">
                  AI × Web Development Hackathon
                </h2>
                <p className="text-xs font-mono font-bold tracking-widest mt-0.5">
                  Imagine. Build. Deploy.
                </p>
              </div>

              <div className="p-3 border-2 border-black rounded-lg text-xs space-y-1 font-medium bg-gray-50">
                <div className="font-extrabold text-sm">Thursday, 5 November 2026</div>
                <div>Check-in: 9:00 AM – 9:30 AM IST (Deadline 9:30 AM sharp)</div>
                <div>Hackathon Sprint: 9:30 AM – 3:00 PM IST</div>
                <div className="font-bold">Final Project Submission Closes at 3:00 PM Sharp</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <div className="p-2 border border-black rounded">
                  Registration Fee: ₹400 / Team
                </div>
                <div className="p-2 border border-black rounded">
                  Team Size: 2 to 4 Students
                </div>
              </div>
            </div>

            {/* Bottom with Registration QR */}
            <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-4">
              <div className="text-left text-xs space-y-1">
                <div className="font-bold">Prize Positions: 1st, 2nd and 3rd</div>
                <div className="text-[11px] text-gray-700">Participation certificates for all attendees</div>
                <div className="text-[10px] text-gray-600 font-mono">
                  Venue: KIT Mangaluru Campus
                </div>
              </div>

              <div className="p-1 border border-black rounded flex flex-col items-center">
                {registrationQrUrl && (
                  <div className="w-20 h-20 relative">
                    <Image src={registrationQrUrl} alt="Website Registration QR" fill className="object-contain" />
                  </div>
                )}
                <span className="text-[8px] font-bold uppercase mt-0.5">Scan to Register</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        {activeTab === 'a4' ? (
          <button
            type="button"
            onClick={handlePrintA4}
            className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        ) : (
          <button
            type="button"
            onClick={() => window.print()}
            className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            <Download className="w-4 h-4" /> Download / Print Poster
          </button>
        )}
      </div>
    </div>
  );
}
