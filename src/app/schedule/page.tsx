import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SchedulePage() {
  const timeline = [
    {
      time: '09:00 AM – 09:30 AM IST',
      phase: 'Reporting & Arrival Check-in',
      status: 'MANDATORY DEADLINE: 09:30 AM',
      statusColor: 'bg-rose-950 text-rose-300 border-rose-500/30',
      description: 'Participants arrive at Karavali Institute of Technology, Mangaluru. Verify team registration, receive assigned room details, and complete initial system and power checks.',
    },
    {
      time: '09:30 AM IST Sharp',
      phase: 'Inauguration & Problem Statement Release',
      status: 'HACKATHON COMMENCES',
      statusColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
      description: 'The organizing department unveils the 2 official problem statements. Teams choose 1 statement and begin architectural planning and development.',
    },
    {
      time: '09:30 AM – 01:00 PM IST',
      phase: 'Sprint Phase 1: Core System & AI Architecture',
      status: 'ACTIVE DEVELOPMENT',
      statusColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/30',
      description: 'Teams build their web frontend, backend APIs, and integrate machine learning/AI models. Faculty and mentors will conduct routine checkpoint visits in assigned rooms.',
    },
    {
      time: '01:00 PM – 02:00 PM IST',
      phase: 'Refreshments & Continuous Sprint',
      status: 'SNACKS PROVIDED · NO PAUSE',
      statusColor: 'bg-amber-950 text-amber-300 border-amber-500/30',
      description: 'Organizers distribute snacks and drinking water bottles. No formal lunch break is scheduled; development continues uninterrupted.',
    },
    {
      time: '02:00 PM – 03:00 PM IST',
      phase: 'Sprint Phase 2: Deployment & Final Verification',
      status: 'FINAL 60 MINUTES',
      statusColor: 'bg-purple-950 text-purple-300 border-purple-500/30',
      description: 'Teams finalize user interfaces, test edge cases, push production code to their Git repository, deploy web applications, and fill in submission fields on the portal.',
    },
    {
      time: '03:00 PM IST Sharp',
      phase: 'Hard Project Submission Deadline',
      status: 'PORTAL LOCKDOWN',
      statusColor: 'bg-rose-950 text-rose-300 border-rose-500/30',
      description: 'Online submission portal locks strictly at 3:00 PM IST. Any submission after this time is recorded as late or flagged for disqualification.',
    },
    {
      time: '03:15 PM – 04:30 PM IST',
      phase: 'Project Demonstrations & Evaluation',
      status: 'JUDGING ROUNDS',
      statusColor: 'bg-blue-950 text-blue-300 border-blue-500/30',
      description: 'Distinguished judges review each team\'s live demonstration, test working functionality, and assess AI implementation and code architecture in assigned rooms.',
    },
    {
      time: '04:30 PM – 05:00 PM IST',
      phase: 'Valedictory Ceremony & Awards Presentation',
      status: 'AWARDS & CLOSING',
      statusColor: 'bg-yellow-950 text-yellow-300 border-yellow-500/30',
      description: 'Announcement of winners (1st, 2nd, 3rd Place), presentation of certificates to all participants, and concluding address by the Department of AI & ML.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <Calendar className="w-3.5 h-3.5" />
            THURSDAY, 5 NOVEMBER 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Official Event Schedule
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            All times are indicated in Indian Standard Time (Asia/Kolkata). Punctuality is strictly enforced.
          </p>
        </div>

        {/* Timeline list */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800 before:hidden sm:before:block">
          {timeline.map((item, idx) => (
            <div
              key={idx}
              className="relative sm:pl-12 group"
            >
              {/* Dot for desktop */}
              <div className="hidden sm:block absolute left-3.5 top-6 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-cyan-400 group-hover:scale-125 transition -translate-x-1/2" />

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    {item.time}
                  </span>
                  <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.phase}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            Register Your Team Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
