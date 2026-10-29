'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  FileText,
  UserX,
  RefreshCw,
  Send,
} from 'lucide-react';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');
  const [submissionFilter, setSubmissionFilter] = useState('ALL');

  // Selected Team Modal
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [disqualifyReason, setDisqualifyReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalMode, setModalMode] = useState<'VIEW' | 'DISQUALIFY'>('VIEW');

  const fetchTeams = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (paymentFilter !== 'ALL') params.append('paymentStatus', paymentFilter);
    if (attendanceFilter !== 'ALL') params.append('attendanceStatus', attendanceFilter);
    if (submissionFilter !== 'ALL') params.append('submissionStatus', submissionFilter);

    fetch(`/api/admin/teams?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setTeams(data.teams || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeams();
  }, [paymentFilter, attendanceFilter, submissionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeams();
  };

  const openTeamDetail = (team: any) => {
    setSelectedTeam(team);
    setAdminNotes(team.admin_notes || '');
    setDisqualifyReason('');
    setModalMode('VIEW');
  };

  const handleDisqualify = async () => {
    if (!disqualifyReason.trim()) {
      alert('Please enter a reason for disqualification.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          action: 'DISQUALIFY',
          reason: disqualifyReason.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to disqualify team');

      setSelectedTeam({
        ...selectedTeam,
        registration_status: 'DISQUALIFIED',
        disqualification_reason: disqualifyReason.trim(),
      });
      fetchTeams();
      setModalMode('VIEW');
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReinstate = async () => {
    if (!confirm('Reinstate this team to CONFIRMED status?')) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          action: 'REINSTATE',
        }),
      });

      if (!res.ok) throw new Error('Failed to reinstate team');

      setSelectedTeam({
        ...selectedTeam,
        registration_status: 'CONFIRMED',
        disqualification_reason: null,
      });
      fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          action: 'UPDATE_NOTES',
          notes: adminNotes.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to save notes');
      setSelectedTeam({ ...selectedTeam, admin_notes: adminNotes.trim() });
      fetchTeams();
      alert('Notes saved.');
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            REGISTRATION DATABASE
          </span>
          <h1 className="text-2xl font-extrabold text-white">Teams & Student Records</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, inspect USNs, filter attendance, and manage student rosters.
          </p>
        </div>

        <button
          onClick={fetchTeams}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Team Name, Leader, College, Student Name or USN..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 text-xs transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-mono">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value="ALL">All Payments</option>
              <option value="VERIFIED">Verified Paid</option>
              <option value="CLAIMED">Pending Verification</option>
              <option value="UNPAID">Unpaid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-mono">Attendance:</span>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value="ALL">All Attendance</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="LATE_ARRIVED">Late Arrived</option>
              <option value="NOT_ARRIVED">Not Arrived</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-mono">Submission:</span>
            <select
              value={submissionFilter}
              onChange={(e) => setSubmissionFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value="ALL">All Submissions</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="NOT_SUBMITTED">Not Submitted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Registration ID</th>
                <th className="py-3 px-4">Team Name</th>
                <th className="py-3 px-4">Leader & College</th>
                <th className="py-3 px-4 text-center">Members</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Submission</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 font-mono">
                    Loading team database...
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 font-mono">
                    No teams found matching the filters.
                  </td>
                </tr>
              ) : (
                teams.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {t.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {t.team_name}
                      {t.registration_status === 'DISQUALIFIED' && (
                        <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                          DISQUALIFIED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{t.leader_name}</div>
                      <div className="text-[11px] text-slate-400">{t.college_name}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {t.members?.length || 0}
                    </td>
                    <td className="py-3 px-4">
                      {t.payment_status === 'VERIFIED' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                          PAID (₹400)
                        </span>
                      ) : t.payment_status === 'CLAIMED' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                          PENDING
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-mono">
                          {t.payment_status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {t.attendance_status === 'CHECKED_IN' ? (
                        <span className="text-emerald-400 font-medium">Checked In</span>
                      ) : t.attendance_status === 'LATE_ARRIVED' ? (
                        <span className="text-amber-400 font-medium">Late Arrival</span>
                      ) : (
                        <span className="text-slate-500">Not Arrived</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {t.submission_status === 'SUBMITTED' ? (
                        <span className="text-cyan-400 font-medium">Submitted ✓</span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openTeamDetail(t)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel-glow border border-cyan-500/40 p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  TEAM ROSTER & MANAGEMENT
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedTeam.team_name}</h2>
                <p className="text-xs text-slate-400">{selectedTeam.college_name} · ID: {selectedTeam.id}</p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Members Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Registered Members ({selectedTeam.members?.length || 0} Students):
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono">
                    <tr>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">USN</th>
                      <th className="p-2.5">Branch</th>
                      <th className="p-2.5">Year</th>
                      <th className="p-2.5">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {selectedTeam.members?.map((m: any) => (
                      <tr key={m.id} className={m.is_leader ? 'bg-cyan-950/20' : ''}>
                        <td className="p-2.5 font-bold text-white">{m.full_name}</td>
                        <td className="p-2.5 font-mono text-cyan-300">{m.usn}</td>
                        <td className="p-2.5">{m.department}</td>
                        <td className="p-2.5">{m.year_semester}</td>
                        <td className="p-2.5">
                          {m.is_leader ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono font-bold">
                              LEADER
                            </span>
                          ) : 'Member'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leader Contact Details */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Leader Email</span>
                <span className="text-slate-200 font-mono">{selectedTeam.leader_email}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Leader Mobile</span>
                <span className="text-slate-200 font-mono">{selectedTeam.leader_phone}</span>
              </div>
            </div>

            {/* Disqualification / Status Controls */}
            {modalMode === 'DISQUALIFY' ? (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3">
                <h4 className="text-xs font-bold text-rose-300 uppercase font-mono">
                  Confirm Team Disqualification
                </h4>
                <textarea
                  rows={2}
                  value={disqualifyReason}
                  onChange={(e) => setDisqualifyReason(e.target.value)}
                  placeholder="Enter specific disqualification reason (e.g. Late arrival after 9:30 AM, discipline breach, plagiarism)..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-rose-500/40 text-white text-xs focus:outline-none"
                  required
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setModalMode('VIEW')}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleDisqualify}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold text-white text-xs transition"
                  >
                    Confirm Disqualification
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="text-xs">
                  {selectedTeam.registration_status === 'DISQUALIFIED' ? (
                    <span className="text-rose-400 font-bold">Currently Disqualified</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">Registration Active</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedTeam.registration_status === 'DISQUALIFIED' ? (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleReinstate}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      Reinstate Team
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setModalMode('DISQUALIFY')}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 hover:bg-rose-900 text-rose-300 text-xs font-bold transition flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" /> Disqualify Team
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase font-mono">
                Internal Administrative Notes:
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about room allocation, special assistance, or verification..."
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
