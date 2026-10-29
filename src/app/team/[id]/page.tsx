'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Users,
  Send,
  Lock,
} from 'lucide-react';

function TeamDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const teamId = params.id as string;
  const token = searchParams.get('token') || '';

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState(token);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTeamData(token);
  }, [teamId, token]);

  const fetchTeamData = async (authToken?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/team/${encodeURIComponent(teamId)}${authToken ? `?token=${encodeURIComponent(authToken)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Team not found.');
      }
      setTeam(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load team details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToken = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeamData(tokenInput.trim());
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-cyan-300">Retrieving official team records...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:p-0 print:max-w-none">
        {error ? (
          <div className="p-8 rounded-2xl glass-panel text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Record Notice</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">{error}</p>
            <Link href="/payment-status" className="inline-block text-xs text-cyan-400 underline">
              Return to Status Lookup
            </Link>
          </div>
        ) : team ? (
          <div className="space-y-6">
            {/* Action Bar (Hidden during print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
              <Link
                href="/payment-status"
                className="text-xs text-slate-400 hover:text-cyan-300 transition"
              >
                ← Back to Status Search
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Link Copied!' : 'Copy Private Access Link'}
                </button>

                {team.paymentStatus === 'VERIFIED' && (
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 font-bold text-slate-950 text-xs flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Official Pass
                  </button>
                )}
              </div>
            </div>

            {/* If user lacks auth token for private details */}
            {team.requiresAuth && (
              <div className="p-5 rounded-xl bg-slate-900/90 border border-amber-500/30 print:hidden space-y-3">
                <div className="flex items-start gap-3 text-xs text-amber-200">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Private Data Protection:</strong> To protect student University Seat Numbers (USNs) and contact details, student records are shielded. Enter the <strong>Access Token</strong> provided at registration to view the full team roster and pass.
                  </div>
                </div>

                <form onSubmit={handleApplyToken} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste 32-character access token"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition"
                  >
                    Unlock
                  </button>
                </form>
              </div>
            )}

            {/* OFFICIAL PASS / RECEIPT CONTAINER */}
            <div className="p-6 sm:p-10 rounded-3xl glass-panel-glow border border-cyan-500/40 print:border-2 print:border-black print:bg-white print:text-black print:shadow-none space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-black">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 p-0.5 shrink-0 print:border-black">
                    <Image
                      src="/assets/aiora_logo.png"
                      alt="AIORA Forum"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold print:text-black">
                      OFFICIAL EVENT PASS & RECEIPT
                    </span>
                    <h1 className="text-2xl font-black text-white print:text-black">
                      AIORA HACKATHON 2026
                    </h1>
                    <p className="text-xs text-slate-400 print:text-gray-700">
                      Karavali Institute of Technology, Mangaluru · Dept of AI & ML
                    </p>
                  </div>
                </div>

                {/* Status Stamp */}
                <div className="text-center sm:text-right">
                  {team.paymentStatus === 'VERIFIED' ? (
                    <div className="inline-block px-4 py-2 rounded-xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 font-mono text-xs font-black tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.3)] print:border-black print:text-black print:bg-gray-100">
                      ✓ VERIFIED & CONFIRMED
                    </div>
                  ) : (
                    <div className="inline-block px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold uppercase print:border-black print:text-black">
                      VERIFICATION PENDING
                    </div>
                  )}
                  <span className="block text-[11px] text-slate-400 font-mono mt-1 print:text-gray-600">
                    ID: {team.id}
                  </span>
                </div>
              </div>

              {/* Team Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 print:text-gray-600">Team Name</span>
                  <div className="text-base font-bold text-white print:text-black">{team.teamName}</div>
                  <div className="text-slate-400 print:text-gray-700">{team.collegeName}</div>
                  {team.department && (
                    <div className="text-slate-400 print:text-gray-700">{team.department} · {team.yearSemester}</div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 print:text-gray-600">Event Date & Arrival</span>
                  <div className="text-base font-bold text-white print:text-black">Thursday, 5 November 2026</div>
                  <div className="text-amber-400 print:text-black font-semibold">
                    Arrival Window: 9:00 AM – 9:30 AM IST (Sharp)
                  </div>
                  <div className="text-slate-400 print:text-gray-600 text-[11px]">Submission Deadline: 3:00 PM IST</div>
                </div>
              </div>

              {/* Team Members Roster */}
              {team.members && team.members.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-black">
                    Registered Team Members ({team.members.length} Students):
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-800 print:border-gray-300">
                      <thead className="bg-slate-950 print:bg-gray-200 text-slate-300 print:text-black font-mono">
                        <tr>
                          <th className="py-2 px-3 border-b border-slate-800 print:border-gray-300">#</th>
                          <th className="py-2 px-3 border-b border-slate-800 print:border-gray-300">Student Name</th>
                          <th className="py-2 px-3 border-b border-slate-800 print:border-gray-300">USN</th>
                          <th className="py-2 px-3 border-b border-slate-800 print:border-gray-300">Role</th>
                          <th className="py-2 px-3 border-b border-slate-800 print:border-gray-300">Branch & Year</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 print:divide-gray-300 text-slate-200 print:text-black">
                        {team.members.map((m: any, idx: number) => (
                          <tr key={m.id} className={m.is_leader ? 'bg-cyan-950/20 print:bg-gray-50' : ''}>
                            <td className="py-2 px-3 font-mono text-slate-500 print:text-gray-600">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold">{m.full_name}</td>
                            <td className="py-2 px-3 font-mono text-cyan-300 print:text-black font-semibold">{m.usn}</td>
                            <td className="py-2 px-3">
                              {m.is_leader ? (
                                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold font-mono print:border-black print:text-black">
                                  LEADER
                                </span>
                              ) : (
                                <span className="text-slate-400 print:text-gray-600 text-[11px]">Member</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-400 print:text-gray-600">
                              {m.department} ({m.year_semester})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Receipt Details */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-white print:text-black">Payment Receipt Summary</span>
                  <span className="font-mono text-cyan-300 print:text-black font-bold">
                    Registration Fee: ₹400.00
                  </span>
                </div>
                {team.paymentClaim ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 print:border-gray-300 text-[11px] text-slate-400 print:text-gray-700">
                    <div>
                      Claimed UTR: <strong className="text-slate-200 print:text-black font-mono">{team.paymentClaim.utr_reference}</strong>
                    </div>
                    <div>
                      Status: <strong className={team.paymentClaim.status === 'APPROVED' ? 'text-emerald-400 print:text-black' : 'text-amber-400 print:text-black'}>{team.paymentClaim.status}</strong>
                    </div>
                    <div>
                      Verified At: <strong className="text-slate-200 print:text-black">{team.paymentClaim.verified_at ? new Date(team.paymentClaim.verified_at).toLocaleString() : 'Pending review'}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">
                    No payment claim submitted yet. Please complete your UPI payment.
                  </p>
                )}
              </div>

              {/* Attendance & Submission Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print:hidden">
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Attendance Status</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {team.attendanceStatus === 'CHECKED_IN' ? (
                      <span className="text-emerald-400">Checked In at Venue</span>
                    ) : team.attendanceStatus === 'LATE_ARRIVED' ? (
                      <span className="text-amber-400">Late Arrival (Flagged)</span>
                    ) : (
                      <span className="text-slate-400">Not Checked In (Arrival window: 9:00–9:30 AM)</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500">Project Submission</span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {team.submissionStatus === 'SUBMITTED' ? (
                        <span className="text-emerald-400">Project Submitted ✓</span>
                      ) : (
                        <span className="text-slate-400">Pending (Deadline: 3:00 PM)</span>
                      )}
                    </div>
                  </div>

                  {team.paymentStatus === 'VERIFIED' && (
                    <Link
                      href="/submission"
                      className="px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Submit
                    </Link>
                  )}
                </div>
              </div>

              {/* Instructions footer on pass */}
              <div className="pt-4 border-t border-slate-800 print:border-gray-400 text-[11px] text-slate-400 print:text-gray-700 space-y-1">
                <p>
                  <strong>Important Notice:</strong> Present this pass at check-in between 9:00 AM and 9:30 AM IST on Thursday, 5 November 2026. Management does not provide Wi-Fi; arrange your own personal hotspot and fully charged laptops.
                </p>
                <p className="text-[10px] text-slate-500 print:text-gray-600">
                  Organized by AIORA Forum · Department of Artificial Intelligence and Machine Learning · Karavali Institute of Technology, Mangaluru.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#07090e] text-slate-100 cyber-grid p-8">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-cyan-300">Loading team pass...</p>
          </div>
        </div>
      }
    >
      <TeamDetailContent />
    </React.Suspense>
  );
}
