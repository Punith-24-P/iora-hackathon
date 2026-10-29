import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckSquare, Clock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function InstructionsPage() {
  const beforeEvent = [
    'Complete online team registration at the official website.',
    'Ensure your team has between 2 and 4 students (including the team leader).',
    'Make sure every student\'s full name and University Seat Number (USN) are entered accurately.',
    'Pay the ₹400 team registration fee via the official PhonePe QR code.',
    'Retain the UPI transaction reference number (UTR) and payment screenshot.',
    'Bring a fully charged laptop and laptop charger for every team member.',
    'Arrange a personal mobile hotspot or dongle for internet connectivity (Management will not provide Wi-Fi).',
    'Bring lunch and personal meals if required (Lunch is not provided, and there is no dedicated lunch break).',
  ];

  const onEventDay = [
    'Check in at the registration desk between 9:00 AM and 9:30 AM IST sharp (Arrival deadline is 9:30 AM).',
    'Remain in your assigned room throughout the hackathon.',
    'Review the two problem statements announced by the organizers at 9:30 AM and select one.',
    'Build a website or web application that incorporates at least one meaningful AI feature.',
    'Manage your time carefully so your final submission occurs before 3:00 PM IST sharp.',
    'Be prepared to explain the problem, your solution, AI feature, technology choices, and demonstrate working functionality.',
  ];

  const afterSubmitting = [
    'Keep your project deployed and code repository accessible for judge evaluation.',
    'Follow all instructions announced by the organizing faculty and student coordinators.',
    'Stay inside your assigned room until instructed otherwise by the organizers.',
    'Attend the evaluation and valedictory awards ceremony.',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <CheckSquare className="w-3.5 h-3.5" />
            PARTICIPANT READINESS CHECKLIST
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Participant Instructions
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Follow this clear step-by-step checklist to ensure your team is 100% prepared for AIORA on Thursday, 5 November 2026.
          </p>
        </div>

        {/* Highlight Note */}
        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 mb-10 flex items-start gap-3 text-xs sm:text-sm text-cyan-200">
          <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong>Important Provision Notice:</strong> Snacks and a water bottle are provided by the organizers. Lunch is <strong>not provided</strong>, and there will be no dedicated lunch break. Teams may bring their own food and eat at their convenience without stopping development.
          </div>
        </div>

        {/* Phase 1: Before The Event */}
        <section className="mb-10 p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center text-sm border border-blue-500/40">
              01
            </span>
            <h2 className="text-xl font-bold text-white">Before the Event</h2>
          </div>
          <ul className="space-y-3 pt-2">
            {beforeEvent.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Phase 2: On The Event Day */}
        <section className="mb-10 p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-sm border border-amber-500/40">
              02
            </span>
            <h2 className="text-xl font-bold text-white">On the Event Day (5 Nov 2026)</h2>
          </div>
          <ul className="space-y-3 pt-2">
            {onEventDay.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Phase 3: After Submitting */}
        <section className="mb-10 p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm border border-emerald-500/40">
              03
            </span>
            <h2 className="text-xl font-bold text-white">After Submitting (3:00 PM onwards)</h2>
          </div>
          <ul className="space-y-3 pt-2">
            {afterSubmitting.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Action Button */}
        <div className="text-center pt-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            Start Team Registration <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
