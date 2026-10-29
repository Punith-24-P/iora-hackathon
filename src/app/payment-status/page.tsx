'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Search, Shield, CheckCircle2, Clock, AlertTriangle, ArrowRight, FileText } from 'lucide-react';

export default function PaymentStatusPage() {
  const [query, setQuery] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTeamData(null);

    const cleanId = query.trim().toUpperCase();
    if (!cleanId) {
      setError('Please enter your Team Registration ID (e.g. AIORA-2026-XXXX).');
      return;
    }

    setLoading(true);
    try {
      const url = `/api/team/${encodeURIComponent(cleanId)}${tokenInput.trim() ? `?token=${encodeURIComponent(tokenInput.trim())}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Team registration not found.');
      }

      setTeamData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to locate registration record.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, payStatus: string) => {
    if (status === 'CONFIRMED' || payStatus === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          CONFIRMED & VERIFIED
        </span>
      );
    }
    if (status === 'PAYMENT_SUBMITTED' || payStatus === 'CLAIMED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
          <Clock className="w-3.5 h-3.5" />
          VERIFICATION PENDING
        </span>
      );
    }
    if (status === 'DISQUALIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
          DISQUALIFIED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold">
        PAYMENT PENDING
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            REGISTRATION LOOKUP
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Track Team & Payment Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Enter your Registration ID to check whether your payment claim has been verified by the organizers.
          </p>
        </div>

        {/* Search Box */}
        <div className="p-6 sm:p-8 rounded-2xl glass-panel-glow border border-cyan-500/30 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Team Registration ID <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value.toUpperCase())}
                    placeholder="e.g. AIORA-2026-A1B2"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono tracking-wider uppercase"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Access Token (Optional)
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste token for full record"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Check Registration Status'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs sm:text-sm mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Search Result */}
        {teamData && (
          <div className="p-6 sm:p-8 rounded-2xl glass-panel-glow border border-cyan-500/40 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  REGISTRATION RECORD
                </span>
                <h3 className="text-2xl font-bold text-white mt-0.5">{teamData.teamName}</h3>
                <p className="text-xs text-slate-400">{teamData.collegeName}</p>
              </div>
              <div>{getStatusBadge(teamData.registrationStatus, teamData.paymentStatus)}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Team ID</span>
                <span className="text-cyan-300 font-mono font-bold text-sm">{teamData.id}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Total Members</span>
                <span className="text-white font-bold text-sm">
                  {teamData.members ? teamData.members.length : teamData.memberCount} Students
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Payment</span>
                <span className="text-white font-bold text-sm font-mono">
                  {teamData.paymentStatus === 'VERIFIED' ? '₹400 (Paid)' : '₹400 (Pending)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Registered On</span>
                <span className="text-slate-300 text-xs">
                  {new Date(teamData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Status Information Box */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {teamData.registrationStatus === 'CONFIRMED' ? (
                <div className="space-y-1">
                  <p className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Payment Approved & Verified!
                  </p>
                  <p>
                    Your team is officially confirmed for the AIORA Hackathon on 5 November 2026. Please arrive at the college between 9:00 AM and 9:30 AM IST.
                  </p>
                </div>
              ) : teamData.registrationStatus === 'PAYMENT_SUBMITTED' ? (
                <div className="space-y-1">
                  <p className="text-amber-300 font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Payment Claim Under Verification
                  </p>
                  <p>
                    Your transaction reference is being checked by our organizers against bank statements. Once verified, this page will update automatically to Confirmed.
                  </p>
                </div>
              ) : teamData.registrationStatus === 'DISQUALIFIED' ? (
                <div className="space-y-1 text-rose-300">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Team Disqualified
                  </p>
                  <p>Reason: {teamData.disqualificationReason || 'Compliance or punctuality violation.'}</p>
                </div>
              ) : (
                <div className="space-y-1 text-amber-300">
                  <p className="font-bold">Payment Claim Required</p>
                  <p>Please complete your ₹400 PhonePe payment and submit your UTR reference.</p>
                </div>
              )}
            </div>

            {/* Direct action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {tokenInput.trim() ? (
                <Link
                  href={`/team/${teamData.id}?token=${tokenInput.trim()}`}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition text-xs flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Open Full Team Portal & Receipt
                </Link>
              ) : (
                <Link
                  href={`/team/${teamData.id}`}
                  className="px-5 py-2.5 rounded-xl font-semibold text-cyan-300 hover:text-white border border-cyan-500/40 hover:bg-slate-900 transition text-xs flex items-center gap-1.5"
                >
                  View Team Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {teamData.registrationStatus === 'CONFIRMED' && (
                <Link
                  href="/submission"
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-200 hover:text-white border border-slate-700 bg-slate-900 transition text-xs"
                >
                  Go to Project Submission
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
