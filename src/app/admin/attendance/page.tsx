'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, Search, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminAttendancePage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [remarksMap, setRemarksMap] = useState<{ [key: string]: string }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAttendance = () => {
    setLoading(true);
    fetch('/api/admin/teams')
      .then((res) => res.json())
      .then((data) => setTeams(data.teams || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMarkAttendance = async (teamId: string, status: 'CHECKED_IN' | 'LATE_ARRIVED' | 'DISQUALIFIED') => {
    setProcessingId(teamId);
    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          status,
          remarks: remarksMap[teamId] || '',
        }),
      });

      if (!res.ok) throw new Error('Failed to record attendance');
      fetchAttendance();
    } catch (err: any) {
      alert(err.message || 'Error marking attendance');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTeams = teams.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.team_name.toLowerCase().includes(q) ||
      t.leader_name.toLowerCase().includes(q) ||
      t.college_name.toLowerCase().includes(q)
    );
  });

  const checkedInCount = teams.filter((t) => t.attendance_status === 'CHECKED_IN' || t.attendance_status === 'LATE_ARRIVED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            VENUE OPERATIONS
          </span>
          <h1 className="text-2xl font-extrabold text-white">Event Morning Check-In Desk</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Arrival Window: 9:00 AM – 9:30 AM IST · Final Arrival Deadline: 9:30 AM Sharp
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-mono text-cyan-300 font-bold">
            Checked In: {checkedInCount} / {teams.length} Teams
          </div>
          <button
            onClick={fetchAttendance}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Quick search by Team ID, Team Name, Leader, or College..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Team & ID</th>
                <th className="py-3 px-4">Leader & College</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Current Attendance</th>
                <th className="py-3 px-4">Room / Remarks</th>
                <th className="py-3 px-4 text-right">Check-in Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-mono">
                    Loading attendance roster...
                  </td>
                </tr>
              ) : filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-mono">
                    No teams found matching search.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{team.team_name}</div>
                      <div className="text-[11px] font-mono text-cyan-400">{team.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">{team.leader_name}</div>
                      <div className="text-[11px] text-slate-400">{team.college_name}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {team.payment_status === 'VERIFIED' ? (
                        <span className="text-emerald-400 font-bold">PAID</span>
                      ) : (
                        <span className="text-amber-400">{team.payment_status}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {team.attendance_status === 'CHECKED_IN' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                          CHECKED IN
                        </span>
                      ) : team.attendance_status === 'LATE_ARRIVED' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                          LATE ARRIVAL
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Not Arrived</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="e.g. Lab 3, Desk 12"
                        value={remarksMap[team.id] ?? ''}
                        onChange={(e) => setRemarksMap({ ...remarksMap, [team.id]: e.target.value })}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-[11px] w-36 focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={processingId === team.id || team.attendance_status === 'CHECKED_IN'}
                          onClick={() => handleMarkAttendance(team.id, 'CHECKED_IN')}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-40"
                        >
                          Check In
                        </button>
                        <button
                          disabled={processingId === team.id || team.attendance_status === 'LATE_ARRIVED'}
                          onClick={() => handleMarkAttendance(team.id, 'LATE_ARRIVED')}
                          className="px-2 py-1 rounded bg-amber-950 border border-amber-500/40 text-amber-300 hover:bg-amber-900 text-xs font-semibold transition disabled:opacity-40"
                          title="Mark Late Arrival after 9:30 AM"
                        >
                          Late
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
    </div>
  );
}
