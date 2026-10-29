'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Lock, User, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator credentials.');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07090e] text-slate-100 cyber-grid px-4">
      {/* Back to Home Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to AIORA Website
        </Link>
      </div>

      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-panel-glow border border-cyan-500/40 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-cyan-400 p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.35)]">
            <Image
              src="/assets/aiora_logo.png"
              alt="AIORA Logo"
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
              RESTRICTED ACCESS
            </span>
            <h1 className="text-2xl font-black text-white">Administrator Portal</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Karavali Institute of Technology · Dept of AI & ML
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. admin)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Development Helper Box */}
        <div className="pt-4 border-t border-slate-800/80 text-center space-y-1">
          <p className="text-[11px] text-slate-500">
            Initial Provisioned Organizer Credentials:
          </p>
          <div className="text-[11px] font-mono text-cyan-300/80">
            Username: <strong className="text-cyan-300">admin</strong> · Password: <strong className="text-cyan-300">AioraOrganizers@2026</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
