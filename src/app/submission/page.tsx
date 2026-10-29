'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Send, Lock, Clock, CheckCircle2, AlertCircle, ExternalLink, Sparkles, FileCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SubmissionPage() {
  const [teamId, setTeamId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [projectName, setProjectName] = useState('');
  const [problemStatementChosen, setProblemStatementChosen] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [realWorldProblem, setRealWorldProblem] = useState('');
  const [aiFeatureDescription, setAiFeatureDescription] = useState('');
  const [technologiesUsed, setTechnologiesUsed] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [supportingDocUrl, setSupportingDocUrl] = useState('');

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        if (data.problemStatementsPublished && data.problemStatement1) {
          setProblemStatementChosen(data.problemStatement1.title);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!teamId.trim() || !accessToken.trim()) {
      return setError('Team Registration ID and Access Token are required.');
    }

    if (!projectName.trim() || !problemStatementChosen.trim() || !projectDescription.trim() || !aiFeatureDescription.trim() || !repoUrl.trim()) {
      return setError('Project Name, Problem Statement, Description, AI feature details, and Git Repository URL are required.');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: teamId.trim().toUpperCase(),
          accessToken: accessToken.trim(),
          projectName: projectName.trim(),
          problemStatementChosen: problemStatementChosen.trim(),
          projectDescription: projectDescription.trim(),
          realWorldProblem: realWorldProblem.trim(),
          aiFeatureDescription: aiFeatureDescription.trim(),
          technologiesUsed: technologiesUsed.trim(),
          repoUrl: repoUrl.trim(),
          liveDemoUrl: liveDemoUrl.trim() || null,
          supportingDocUrl: supportingDocUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit project.');
      }

      setSuccess(data);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch (err: any) {
      setError(err.message || 'Failed to submit project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            PROJECT PORTAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Final Project Submission
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Deadline: <strong className="text-rose-400">3:00 PM IST sharp</strong> on Thursday, 5 November 2026. Only verified and confirmed teams can submit.
          </p>
        </div>

        {/* Success Screen */}
        {success ? (
          <div className="p-8 rounded-3xl glass-panel-glow border border-emerald-500/40 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Submission Recorded Successfully!</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {success.message}
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 max-w-sm mx-auto text-xs text-slate-400">
              Submission ID: <strong className="text-cyan-300 font-mono">{success.submissionId}</strong>
            </div>
            <div className="pt-3">
              <Link
                href={`/team/${teamId}?token=${accessToken}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition text-xs"
              >
                Return to Team Portal
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-10 rounded-3xl glass-panel-glow border border-cyan-500/30 space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* Problem Statements Section */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  OFFICIAL HACKATHON PROBLEM STATEMENTS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                  {settings?.problemStatementsPublished ? 'ANNOUNCED' : 'AWAITING 9:30 AM LAUNCH'}
                </span>
              </div>

              {settings?.problemStatementsPublished ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30 font-bold">
                      STATEMENT 1
                    </span>
                    <h4 className="text-sm font-bold text-white">{settings.problemStatement1?.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{settings.problemStatement1?.desc}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-bold">
                      STATEMENT 2
                    </span>
                    <h4 className="text-sm font-bold text-white">{settings.problemStatement2?.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{settings.problemStatement2?.desc}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 italic">
                  The organizers will announce the two problem statements at the beginning of the hackathon (9:30 AM IST sharp). Teams will select one and develop a web application addressing it.
                </div>
              )}
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Team Registration ID <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value.toUpperCase())}
                    placeholder="e.g. AIORA-2026-A1B2"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono tracking-wider uppercase"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Team Access Token <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Secret 32-character access token"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Given upon team registration. Found on your team pass link.
                  </span>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Project Name / Title <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. NeuroVision, PulseAI Web"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Problem Statement Chosen <span className="text-cyan-400">*</span>
                    </label>
                    {settings?.problemStatementsPublished ? (
                      <select
                        value={problemStatementChosen}
                        onChange={(e) => setProblemStatementChosen(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm"
                        required
                      >
                        <option value={settings.problemStatement1?.title || 'Problem Statement 1'}>
                          {settings.problemStatement1?.title || 'Problem Statement 1'}
                        </option>
                        <option value={settings.problemStatement2?.title || 'Problem Statement 2'}>
                          {settings.problemStatement2?.title || 'Problem Statement 2'}
                        </option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={problemStatementChosen}
                        onChange={(e) => setProblemStatementChosen(e.target.value)}
                        placeholder="e.g. Problem Statement 1 or Title"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Project Overview / Summary <span className="text-cyan-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Briefly describe what your web application does and how users interact with it."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Real-World Problem Being Solved <span className="text-cyan-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={realWorldProblem}
                    onChange={(e) => setRealWorldProblem(e.target.value)}
                    placeholder="What tangible problem does this address for society, business, or education?"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Meaningful AI Feature Description <span className="text-cyan-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={aiFeatureDescription}
                    onChange={(e) => setAiFeatureDescription(e.target.value)}
                    placeholder="Detail the AI/ML model, algorithm, computer vision, NLP, or API used and how it creates value."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Technologies, Frameworks & APIs Used <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={technologiesUsed}
                    onChange={(e) => setTechnologiesUsed(e.target.value)}
                    placeholder="e.g. Next.js, Python FastAPI, PyTorch, Tailwind CSS, Supabase, HuggingFace"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Source Code Repository URL <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Working Deployed Website URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={liveDemoUrl}
                      onChange={(e) => setLiveDemoUrl(e.target.value)}
                      placeholder="https://your-app.vercel.app"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Supporting Presentation / Slides URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={supportingDocUrl}
                    onChange={(e) => setSupportingDocUrl(e.target.value)}
                    placeholder="Google Slides / Drive public view link"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition shadow-[0_0_25px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                >
                  <Send className="w-5 h-5" />
                  {loading ? 'Submitting Project...' : 'Submit Completed Project (Deadline: 3:00 PM IST)'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
