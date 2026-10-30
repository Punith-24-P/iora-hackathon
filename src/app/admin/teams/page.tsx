'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  Trash2,
  Copy,
  ExternalLink,
  CreditCard,
  Check,
  Calendar,
  Phone,
  Mail,
  ShieldAlert,
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
  const [modalMode, setModalMode] = useState<'VIEW' | 'DISQUALIFY' | 'DELETE'>('VIEW');

  // Delete team target
  const [teamToDelete, setTeamToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Screenshot Zoom Modal
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimestamp = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const handleDeleteTeam = async (team: any) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/teams?teamId=${encodeURIComponent(team.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete team');

      // Remove immediately from UI state
      setTeams((prev) => prev.filter((t) => t.id !== team.id));
      if (selectedTeam?.id === team.id) {
        setSelectedTeam(null);
      }
      setTeamToDelete(null);
      alert(`Team "${team.team_name}" (${team.id}) was permanently deleted.`);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setDeleteLoading(false);
    }
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

      const updated = {
        ...selectedTeam,
        registration_status: 'DISQUALIFIED',
        disqualification_reason: disqualifyReason.trim(),
      };
      setSelectedTeam(updated);
      setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
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

      const updated = {
        ...selectedTeam,
        registration_status: 'CONFIRMED',
        disqualification_reason: null,
      };
      setSelectedTeam(updated);
      setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
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
      const updated = { ...selectedTeam, admin_notes: adminNotes.trim() };
      setSelectedTeam(updated);
      setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      alert('Internal notes saved.');
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const totalRegisteredStudents = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);

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
            Complete details from registration to submission · {teams.length} teams · {totalRegisteredStudents} students registered.
          </p>
        </div>

        <button
          onClick={fetchTeams}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition hover:border-cyan-500/40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} /> Refresh Database
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
              <option value="VERIFIED">Verified Paid (₹400)</option>
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
                <th className="py-3 px-4">Registration ID & Time</th>
                <th className="py-3 px-4">Team Name & College</th>
                <th className="py-3 px-4">Student Members (USNs)</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    Fetching complete student database...
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No teams found matching current filters.
                  </td>
                </tr>
              ) : (
                teams.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-cyan-400">{t.id}</span>
                        <button
                          onClick={() => copyToClipboard(t.id, `team-${t.id}`)}
                          className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
                          title="Copy ID"
                        >
                          {copiedId === `team-${t.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatTimestamp(t.created_at)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {t.team_name}
                        {t.registration_status === 'DISQUALIFIED' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                            DISQUALIFIED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{t.college_name}</div>
                      <div className="text-[10px] text-slate-500">{t.department} · {t.year_semester}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-white font-medium text-[11px]">
                          Leader: {t.leader_name}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {t.members?.map((m: any) => (
                            <span
                              key={m.id || m.usn}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                m.is_leader
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                              title={`${m.full_name} (${m.usn})`}
                            >
                              {m.usn}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {t.payment_status === 'VERIFIED' ? (
                        <div>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                            PAID (₹400)
                          </span>
                          {t.payment_claim?.utr_reference && (
                            <div className="text-[10px] font-mono text-slate-400 mt-1">
                              UTR: {t.payment_claim.utr_reference}
                            </div>
                          )}
                        </div>
                      ) : t.payment_status === 'CLAIMED' ? (
                        <div>
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                            PENDING VERIFICATION
                          </span>
                          {t.payment_claim?.utr_reference && (
                            <div className="text-[10px] font-mono text-cyan-300 mt-1">
                              UTR: {t.payment_claim.utr_reference}
                            </div>
                          )}
                        </div>
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
                        <span className="text-cyan-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Submitted
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openTeamDetail(t)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => setTeamToDelete(t)}
                          className="p-1 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-600/30 text-rose-400 hover:text-rose-200 transition"
                          title="Delete team and student records"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {teamToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-rose-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/40">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Team?</h3>
                <p className="text-xs text-rose-300 font-mono">This action is irreversible.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 text-slate-300">
              <div>Team: <strong className="text-white">{teamToDelete.team_name}</strong></div>
              <div>ID: <span className="font-mono text-cyan-400">{teamToDelete.id}</span></div>
              <div>College: <span>{teamToDelete.college_name}</span></div>
              <div>Members ({teamToDelete.members?.length || 0}):</div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
                {teamToDelete.members?.map((m: any) => (
                  <li key={m.id || m.usn}>
                    {m.full_name} (<span className="font-mono text-cyan-300">{m.usn}</span>)
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTeamToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => handleDeleteTeam(teamToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white text-xs transition flex items-center gap-1.5"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel-glow border border-cyan-500/40 p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  COMPLETE REGISTRATION RECORD
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-xl font-bold text-white">{selectedTeam.team_name}</h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                    {selectedTeam.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedTeam.college_name} · {selectedTeam.department} · {selectedTeam.year_semester}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  Registered: {formatTimestamp(selectedTeam.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complete Student Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Student Members ({selectedTeam.members?.length || 0} Students)
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Team Size Allowed: 2–4 Students
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">USN</th>
                      <th className="p-3">Branch / Dept</th>
                      <th className="p-3">Year / Sem</th>
                      <th className="p-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {selectedTeam.members?.map((m: any) => (
                      <tr key={m.id || m.usn} className={m.is_leader ? 'bg-cyan-950/20' : ''}>
                        <td className="p-3 font-bold text-white">{m.full_name}</td>
                        <td className="p-3 font-mono text-cyan-300">{m.usn}</td>
                        <td className="p-3">{m.department || selectedTeam.department}</td>
                        <td className="p-3">{m.year_semester || selectedTeam.year_semester}</td>
                        <td className="p-3">
                          {m.is_leader ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                              LEADER
                            </span>
                          ) : (
                            <span className="text-slate-400">Member</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leader Contact Details */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Leader Name & Email</span>
                <div className="text-white font-medium">{selectedTeam.leader_name}</div>
                <a
                  href={`mailto:${selectedTeam.leader_email}`}
                  className="text-cyan-400 hover:underline font-mono text-[11px] flex items-center gap-1 mt-0.5"
                >
                  <Mail className="w-3 h-3" /> {selectedTeam.leader_email}
                </a>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Leader Mobile Contact</span>
                <a
                  href={`tel:${selectedTeam.leader_phone}`}
                  className="text-white hover:text-cyan-300 font-mono text-[13px] font-bold flex items-center gap-1 mt-1"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-400" /> {selectedTeam.leader_phone}
                </a>
                <span className="text-[10px] text-slate-500 block mt-0.5">Direct phone call available</span>
              </div>
            </div>

            {/* Payment Verification Information */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Payment & Verification Information
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    selectedTeam.payment_status === 'VERIFIED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : selectedTeam.payment_status === 'CLAIMED'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {selectedTeam.payment_status}
                </span>
              </div>

              {selectedTeam.payment_claim ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">UTR Reference Number</span>
                    <span className="font-mono font-bold text-cyan-300 text-sm">
                      {selectedTeam.payment_claim.utr_reference}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Claimed / Verified Amount</span>
                    <span className="font-mono text-white">
                      ₹{selectedTeam.payment_claim.claimed_amount || 400}
                      {selectedTeam.payment_claim.verified_amount && (
                        <span className="text-emerald-400 ml-1">
                          (Verified ₹{selectedTeam.payment_claim.verified_amount})
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Payment Screenshot</span>
                    {selectedTeam.payment_claim.screenshot_url ? (
                      <button
                        onClick={() => setPreviewScreenshot(selectedTeam.payment_claim.screenshot_url)}
                        className="mt-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium flex items-center gap-1.5"
                      >
                        <Eye className="w-3 h-3" /> View Receipt Slip
                      </button>
                    ) : (
                      <span className="text-slate-500 italic">No receipt slip attached</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Team has not submitted a UPI payment claim yet. Registration fee is ₹400.
                </div>
              )}
            </div>

            {/* Project Submission Information */}
            {selectedTeam.submission ? (
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Project Submission: {selectedTeam.submission.project_name}
                </span>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>Track: <strong className="text-white">{selectedTeam.submission.problem_statement_chosen}</strong></div>
                  <div>Submitted: <span className="font-mono text-slate-400">{formatTimestamp(selectedTeam.submission.submitted_at)}</span></div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {selectedTeam.submission.repo_url && (
                      <a
                        href={selectedTeam.submission.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" /> Code Repository
                      </a>
                    )}
                    {selectedTeam.submission.live_demo_url && (
                      <a
                        href={selectedTeam.submission.live_demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Disqualification / Action Area */}
            {modalMode === 'DISQUALIFY' ? (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
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
                  <button
                    type="button"
                    onClick={() => setTeamToDelete(selectedTeam)}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-600/40 hover:bg-rose-900 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Team Record
                  </button>

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
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" /> Disqualify Team
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Internal Admin Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase font-mono">
                Internal Administrative Notes:
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about desk allocation, verification, or logistics..."
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Zoom Modal */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl max-h-[85vh] relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2">
            <button
              onClick={() => setPreviewScreenshot(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 z-10 border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center p-2 max-h-[85vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewScreenshot}
                alt="Payment Receipt"
                className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
