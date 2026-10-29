'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Sparkles, Send, CheckCircle2 } from 'lucide-react';

function NavbarInner() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Rules', href: '/rules' },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Instructions', href: '/instructions' },
    { name: 'Track Payment', href: '/payment-status' },
    { name: 'Posters', href: '/posters' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-cyan-500/20 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400/50 p-0.5 group-hover:border-cyan-300 transition shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Image
                src="/assets/aiora_logo.png"
                alt="AIORA Forum Official Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-full"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                  AIORA
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 uppercase font-mono tracking-widest">
                  AI × WEB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                KIT Mangaluru · Dept of AI & ML
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/submission"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 bg-slate-900/60 transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              Submission
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition shadow-[0_0_18px_rgba(0,240,255,0.4)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              Register Team
            </Link>

            <Link
              href="/admin/login"
              title="Admin Portal"
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition border border-transparent hover:border-cyan-500/20"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/register"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400"
            >
              Register
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-cyan-500/20 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  active
                    ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-lg text-center font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Register Team (₹400 / Team)
            </Link>
            <Link
              href="/submission"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-lg text-center font-semibold text-slate-200 border border-slate-700 bg-slate-900 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              Project Submission Portal
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 rounded-lg text-center text-xs text-slate-400 hover:text-cyan-400 flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <React.Suspense
      fallback={
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-cyan-500/20 bg-slate-950/85 backdrop-blur-md h-20" />
      }
    >
      <NavbarInner />
    </React.Suspense>
  );
}
