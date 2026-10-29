'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserCheck,
  Send,
  Settings,
  Download,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Menu,
  X,
  QrCode,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on /admin/login, bypass admin layout wrapping
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    setChecking(true);
    fetch('/api/admin/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setAdminUser(data.user);
        setChecking(false);
      })
      .catch(() => {
        window.location.href = '/admin/login';
      });
  }, [pathname, isLoginPage]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (err) {
      console.error(err);
      window.location.href = '/admin/login';
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-slate-100 cyber-grid">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-cyan-300">Authenticating administrator access...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Teams & Students', href: '/admin/teams', icon: Users },
    { name: 'Payment Claims', href: '/admin/payments', icon: CreditCard },
    { name: 'Attendance Desk', href: '/admin/attendance', icon: UserCheck },
    { name: 'Project Submissions', href: '/admin/submissions', icon: Send },
    { name: 'Settings & Payment QR', href: '/admin/settings', icon: Settings },
    { name: 'CSV Data Exports', href: '/admin/exports', icon: Download },
    { name: 'Audit Trail Logs', href: '/admin/audit-logs', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#07090e] text-slate-100 cyber-grid">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400 p-0.5">
            <Image src="/assets/aiora_logo.png" alt="AIORA" width={32} height={32} className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="font-bold text-sm text-white">AIORA Admin</span>
        </div>

        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside className={`w-full md:w-64 bg-slate-950/95 border-r border-cyan-500/20 p-5 flex flex-col justify-between shrink-0 ${mobileNavOpen ? 'block' : 'hidden md:flex'}`}>
        <div className="space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 p-0.5 shadow-[0_0_12px_rgba(0,240,255,0.3)] shrink-0">
              <Image src="/assets/aiora_logo.png" alt="AIORA" width={40} height={40} className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <div className="font-extrabold text-base text-white tracking-wide">AIORA CONSOLE</div>
              <div className="text-[10px] text-cyan-400 font-mono">KIT Mangaluru · AI & ML</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-white font-bold block">{adminUser?.fullName || 'Chief Organizer'}</span>
              <span className="text-[10px] text-cyan-400 font-mono">@{adminUser?.username || 'admin'} · {adminUser?.role || 'SUPER_ADMIN'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 hover:text-cyan-300 transition"
          >
            <ExternalLink className="w-3 h-3" /> View Public Website
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
