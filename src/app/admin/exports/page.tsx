'use client';

import React from 'react';
import { Download, Users, CreditCard, UserCheck, Send, FileSpreadsheet } from 'lucide-react';

export default function AdminExportsPage() {
  const exportCards = [
    {
      title: 'Complete Teams & Student Rosters',
      desc: 'All registered teams, leader contact details, and full student rosters with names, USNs, colleges, and departments.',
      type: 'teams',
      icon: Users,
      color: 'border-cyan-500/40 text-cyan-400',
    },
    {
      title: 'Payment Transactions & Claims',
      desc: 'Complete payment claim logs including UTR reference numbers, verification timestamps, approver names, and approved amounts.',
      type: 'payments',
      icon: CreditCard,
      color: 'border-emerald-500/40 text-emerald-400',
    },
    {
      title: 'Venue Attendance Logs',
      desc: 'Check-in times, assigned rooms/remarks, punctuality records, and coordinator logs recorded at the desk.',
      type: 'attendance',
      icon: UserCheck,
      color: 'border-purple-500/40 text-purple-400',
    },
    {
      title: 'Project Submissions & AI Features',
      desc: 'Submitted project names, chosen problem statements, GitHub repository URLs, live demo links, and AI feature descriptions.',
      type: 'submissions',
      icon: Send,
      color: 'border-blue-500/40 text-blue-400',
    },
    {
      title: 'Executive Financial & Metrics Summary',
      desc: 'High-level summary sheet of total registered teams, total students, verified funds collected, and check-in totals.',
      type: 'summary',
      icon: FileSpreadsheet,
      color: 'border-amber-500/40 text-amber-400',
    },
  ];

  const handleDownload = (type: string) => {
    window.open(`/api/admin/export?type=${type}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
          INSTITUTIONAL RECORDKEEPING
        </span>
        <h1 className="text-2xl font-extrabold text-white">Data Export & CSV Reports</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Download authorized spreadsheets for registration passes, faculty audits, judging rounds, and university reporting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.type}
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-base font-bold text-white">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleDownload(card.type)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-cyan-300 font-bold text-xs flex items-center gap-2 transition shadow-sm"
                >
                  <Download className="w-4 h-4" /> Export CSV Spreadsheet
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
