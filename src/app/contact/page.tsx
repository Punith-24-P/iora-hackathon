import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';
import InstagramIcon from '@/components/InstagramIcon';
import { getSettings } from '@/lib/db';

export default async function ContactPage() {
  const settings = getSettings();

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <Mail className="w-3.5 h-3.5" />
            COMMUNICATION & INQUIRIES
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Contact Organizers
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Have questions regarding team registration, event logistics, or payments? Reach out to the AIORA organizing team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Official Instagram Channel */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-pink-500/30 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pink-950/60 border border-pink-500/40 text-pink-400 flex items-center justify-center">
              <InstagramIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Official Instagram Forum</h3>
              <p className="text-xs text-slate-400 mt-1">
                The fastest way to receive announcements, problem statement teasers, and event updates.
              </p>
            </div>
            <a
              href={settings.instagram_url || 'https://instagram.com/aiora_official'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-pink-300 hover:text-white bg-pink-950/40 border border-pink-500/30 px-3.5 py-2 rounded-lg transition"
            >
              Visit @aiora_official on Instagram <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2: Venue Location */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Hackathon Venue</h3>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                {settings.organizing_institution}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.organizing_department}
              </p>
              <p className="text-xs text-cyan-300 mt-2 font-mono">
                Assigned Rooms: {settings.venue_room && settings.venue_room !== 'To be announced' ? settings.venue_room : 'To be announced at check-in'}
              </p>
            </div>
          </div>

          {/* Card 3: Contact Email */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Official Email Address</h3>
            {settings.contact_email ? (
              <a href={`mailto:${settings.contact_email}`} className="text-sm text-cyan-400 font-mono underline">
                {settings.contact_email}
              </a>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Contact email to be announced by the organizing faculty.
              </p>
            )}
          </div>

          {/* Card 4: Contact Phone */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Organizer Help Desk Phone</h3>
            {settings.contact_phone ? (
              <a href={`tel:${settings.contact_phone}`} className="text-sm text-emerald-400 font-mono">
                {settings.contact_phone}
              </a>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Coordinator contact numbers to be announced by the organizing faculty.
              </p>
            )}
          </div>
        </div>

        {/* Verification Notice */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <strong className="text-white text-sm block">Registration & Payment Inquiries</strong>
            <p>
              If your payment claim has been submitted and is pending verification, our team verifies transaction references periodically against our official receiver account (<span className="text-cyan-300 font-mono">{settings.payment_receiver_name}</span>). You can track your status anytime at <Link href="/payment-status" className="text-cyan-400 underline">Track Payment</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
