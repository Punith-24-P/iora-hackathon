import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <Lock className="w-3.5 h-3.5" />
            DATA INTEGRITY & PRIVACY NOTICE
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Privacy Policy & Data Notice
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            How participant data, University Seat Numbers (USNs), payment claims, and project records are secured.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              1. Information We Collect
            </h2>
            <p>
              When a team registers for the AIORA Hackathon, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-400">
              <li>Team Name, Institution Name, Department, and Academic Year/Semester.</li>
              <li>Team Leader contact details (Full Name, verified Email Address, Mobile Number).</li>
              <li>Participating Members: Full Name, University Seat Number (USN), and Branch/Year.</li>
              <li>Payment Verification: UPI Transaction Reference (UTR) and optional payment screenshot.</li>
              <li>Project Submissions: Code repository URLs, demonstration links, and AI technical summaries.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-purple-400" />
              2. Protection of Student USNs & Contact Details
            </h2>
            <p>
              Student University Seat Numbers (USNs), phone numbers, and payment screenshots are considered private administrative records.
            </p>
            <p className="text-xs text-slate-400">
              Public routes on this website do not expose student phone numbers, email addresses, or USNs. Access to complete team records is restricted to authorized faculty and student coordinators via password-protected, encrypted administrator sessions.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              3. Payment Security & UPI Credentials
            </h2>
            <p>
              The AIORA Hackathon uses manual UPI QR verification. We <strong>never</strong> collect, request, or store your UPI PIN, banking passwords, debit/credit card numbers, or OTPs. All financial authorizations occur exclusively inside your trusted banking/UPI application (PhonePe, Google Pay, Paytm, etc.).
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              4. Record Retention & Deletion
            </h2>
            <p>
              Registration, attendance, and payment records are retained by the Department of Artificial Intelligence and Machine Learning at Karavali Institute of Technology solely for legitimate institutional verification, certificate issuance, and financial audit compliance.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
