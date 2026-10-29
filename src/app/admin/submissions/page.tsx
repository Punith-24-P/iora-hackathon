'use client';

import React, { useState, useEffect } from 'react';
import { Send, ExternalLink, Clock, CheckCircle2, AlertCircle, RefreshCw, Code, Globe } from 'lucide-react';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = () => {
    setLoading(true);
    fetch('/api/admin/export?type=submissions')
      .then(() => {
        // Let's create an endpoint or fetch submissions from db
        return fetch('/api/admin/teams');
      })
      .then((res) => res.json())
      .then((data) => {
        // Collect submissions from teams
        const subs = (data.teams || [])
          .filter((t: any) => t.submission)
          .map((t: any) => ({
            ...t.submission,
            team_name: t.team_name,
            leader_name: t.leader_name,
            college_name: t.college_name,
          }));
        setSubmissions(subs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            EVALUATION PORTAL
          </span>
          <h1 className="text-2xl font-extrabold text-white">Project Submissions Review</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review code repositories, live deployed demos, and AI features submitted before 3:00 PM IST.
          </p>
        </div>

        <button
          onClick={fetchSubmissions}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Submissions
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-10 text-center text-slate-500 font-mono text-xs">
            Loading project submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-10 rounded-2xl glass-panel text-center text-slate-500 font-mono text-xs">
            No projects submitted yet. Projects will appear here as teams complete their submissions.
          </div>
        ) : (
          submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 hover:border-cyan-500/40 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {sub.project_name}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30 font-mono font-bold">
                      {sub.problem_statement_chosen}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Team: <strong className="text-slate-200">{sub.team_name}</strong> ({sub.college_name}) · Leader: {sub.leader_name}
                  </p>
                </div>

                <div className="text-right">
                  {sub.is_late === 1 ? (
                    <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                      LATE SUBMISSION (After 3:00 PM)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      ON TIME (Before 3:00 PM)
                    </span>
                  )}
                  <span className="block text-[10px] text-slate-500 font-mono mt-1">
                    Submitted: {new Date(sub.submitted_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Project Overview</span>
                  <p className="text-slate-300 leading-relaxed">{sub.project_description}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Real-World Problem Solved</span>
                  <p className="text-slate-300 leading-relaxed">{sub.real_world_problem}</p>
                </div>

                <div className="md:col-span-2 p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">Meaningful AI Implementation Details</span>
                  <p className="text-cyan-200/90 leading-relaxed">{sub.ai_feature_description}</p>
                </div>
              </div>

              {/* Technologies */}
              <div className="text-xs">
                <span className="text-slate-500 font-mono text-[10px] block">Tech Stack & APIs:</span>
                <span className="text-slate-300 font-medium">{sub.technologies_used}</span>
              </div>

              {/* Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
                <a
                  href={sub.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-semibold text-white flex items-center gap-1.5 transition"
                >
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  View Git Repository <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                {sub.live_demo_url && (
                  <a
                    href={sub.live_demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Live Deployed App <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {sub.supporting_doc_url && (
                  <a
                    href={sub.supporting_doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                  >
                    Slides / Presentation <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
