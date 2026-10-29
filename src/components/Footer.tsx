'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, MapPin, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';
import InstagramIcon from './InstagramIcon';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-cyan-500/20 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Forum & Department */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-cyan-400/40 p-0.5 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                <Image
                  src="/assets/aiora_logo.png"
                  alt="AIORA Forum Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white tracking-wide">
                  AIORA FORUM
                </h3>
                <p className="text-xs text-cyan-400 font-mono">Imagine. Build. Deploy.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official technology forum hosted by the <span className="text-slate-200 font-medium">Department of Artificial Intelligence & Machine Learning</span> at <span className="text-slate-200 font-medium">Karavali Institute of Technology</span>, Mangaluru, Karnataka, India.
            </p>
            <div className="pt-1">
              <a
                href="https://instagram.com/aiora_official"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-pink-400 hover:text-pink-300 bg-pink-950/30 border border-pink-500/20 px-3 py-1.5 rounded-lg transition"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                @aiora_official on Instagram
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 2: Event Schedule & Venue */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Event Details
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Date:</strong> Thursday, 5 November 2026
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Arrival & Check-in:</strong> 9:00 AM – 9:30 AM IST (Deadline 9:30 AM)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Hackathon Programme:</strong> 9:30 AM – 3:00 PM IST sharp
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Karavali Institute of Technology, Mangaluru, Karnataka, India
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Portal Links
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/register" className="hover:text-cyan-400 transition">Team Registration</Link>
              <Link href="/rules" className="hover:text-cyan-400 transition">Official Rules</Link>
              <Link href="/instructions" className="hover:text-cyan-400 transition">Instructions</Link>
              <Link href="/schedule" className="hover:text-cyan-400 transition">Event Schedule</Link>
              <Link href="/payment-status" className="hover:text-cyan-400 transition">Track Payment</Link>
              <Link href="/submission" className="hover:text-cyan-400 transition">Project Submission</Link>
              <Link href="/posters" className="hover:text-cyan-400 transition">Official Posters</Link>
              <Link href="/faq" className="hover:text-cyan-400 transition">FAQs</Link>
              <Link href="/privacy" className="hover:text-cyan-400 transition">Privacy Notice</Link>
              <Link href="/contact" className="hover:text-cyan-400 transition">Contact Us</Link>
            </div>
          </div>

          {/* Col 4: Important Participant Notes */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Key Requirements
            </h4>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <p className="text-slate-300">
                <strong className="text-cyan-300">Registration Fee:</strong> ₹400 per team (2 to 4 members).
              </p>
              <p className="text-slate-300">
                <strong className="text-amber-400">Connectivity:</strong> Management will not provide Wi-Fi. Bring your own hotspot and fully charged laptop.
              </p>
              <p className="text-slate-400 text-[11px]">
                Snacks and water provided. No dedicated lunch break. 3:00 PM submission deadline is strict.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 AIORA Forum · Department of AI & ML, Karavali Institute of Technology, Mangaluru.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-200 transition">Privacy & Data Policy</Link>
            <span>·</span>
            <Link href="/rules" className="hover:text-slate-200 transition">Rules & Regulations</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-slate-200 transition">Organizers Contact</Link>
            <span>·</span>
            <Link href="/admin/login" className="hover:text-cyan-400 text-slate-500 transition flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
