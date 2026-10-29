'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  UserCheck,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentAuditLogs, setRecentAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setRecentAuditLogs(data.recentAuditLogs || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            LIVE DATABASE METRICS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hackathon Executive Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Event Date: Thursday, 5 November 2026 · Real-time operational data
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Teams */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Registered Teams</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats ? stats.totalTeams : '—'}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats ? `${stats.totalStudents} total students` : 'Loading...'}
          </div>
        </div>

        {/* Confirmed Teams */}
        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-2 bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold">Confirmed (Paid)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
            {stats ? stats.confirmedTeams : '—'}
          </div>
          <div className="text-[11px] text-emerald-400/80">
            Approved for participation
          </div>
        </div>

        {/* Pending Payments */}
        <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 space-y-2 bg-amber-950/10">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold">Pending Payments</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
            {stats ? stats.pendingPayments : '—'}
          </div>
          <Link href="/admin/payments" className="text-[11px] text-amber-400 hover:underline flex items-center gap-1">
            Review claims now <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Verified Collection */}
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/40 space-y-2 bg-cyan-950/10">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold">Verified Collection</span>
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
            {stats ? `₹${stats.totalVerifiedCollection.toLocaleString()}` : '—'}
          </div>
          <div className="text-[11px] text-cyan-400/80">
            Actual verified funds received
          </div>
        </div>
      </div>

      {/* Secondary Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-500">Teams Checked In</span>
          <div className="text-xl font-bold text-white mt-1 font-mono">
            {stats ? stats.teamsCheckedIn : '—'}
          </div>
          <span className="text-[10px] text-slate-400">Arrival window: 9:00–9:30 AM</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-500">Projects Submitted</span>
          <div className="text-xl font-bold text-white mt-1 font-mono">
            {stats ? stats.projectsSubmitted : '—'}
          </div>
          <span className="text-[10px] text-slate-400">Deadline: 3:00 PM IST</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-500">Pending Submissions</span>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">
            {stats ? stats.projectsMissing : '—'}
          </div>
          <span className="text-[10px] text-slate-400">Confirmed teams awaiting push</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-500">Rejected Claims</span>
          <div className="text-xl font-bold text-rose-400 mt-1 font-mono">
            {stats ? stats.rejectedPayments : '—'}
          </div>
          <span className="text-[10px] text-slate-400">Invalid UTRs / mismatch</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/payments"
          className="p-5 rounded-2xl glass-panel border border-cyan-500/30 hover:border-cyan-400 transition group space-y-2"
        >
          <CreditCard className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition" />
          <h3 className="text-base font-bold text-white">Verify Payment Claims</h3>
          <p className="text-xs text-slate-400">
            Compare claimed UTRs against bank transaction statements and confirm teams.
          </p>
        </Link>

        <Link
          href="/admin/attendance"
          className="p-5 rounded-2xl glass-panel border border-purple-500/30 hover:border-purple-400 transition group space-y-2"
        >
          <UserCheck className="w-6 h-6 text-purple-400 group-hover:scale-110 transition" />
          <h3 className="text-base font-bold text-white">Event Morning Check-In</h3>
          <p className="text-xs text-slate-400">
            Fast 1-click check-in desk for team arrival between 9:00 AM and 9:30 AM IST.
          </p>
        </Link>

        <Link
          href="/admin/settings"
          className="p-5 rounded-2xl glass-panel border border-blue-500/30 hover:border-blue-400 transition group space-y-2"
        >
          <TrendingUp className="w-6 h-6 text-blue-400 group-hover:scale-110 transition" />
          <h3 className="text-base font-bold text-white">Manage Payment QR & Settings</h3>
          <p className="text-xs text-slate-400">
            Upload new PhonePe QR image, configure contact info, and publish problem statements.
          </p>
        </Link>
      </div>

      {/* Recent Audit Logs Feed */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Recent System & Audit Trail Activity</h3>
          </div>
          <Link href="/admin/audit-logs" className="text-xs text-cyan-400 hover:underline">
            View full log →
          </Link>
        </div>

        {recentAuditLogs.length > 0 ? (
          <div className="space-y-2.5">
            {recentAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-cyan-300 border border-slate-700">
                    {log.action}
                  </span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  By {log.performed_by} · {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-2">No activity recorded yet.</p>
        )}
      </div>
    </div>
  );
}
