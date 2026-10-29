'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Countdown from '@/components/Countdown';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Calendar,
  Users,
  Award,
  Zap,
  Cpu,
  Globe,
  WifiOff,
  BatteryCharging,
  UtensilsCrossed,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const [settings, setSettings] = useState<any>({
    prize_1st: 'To be announced',
    prize_2nd: 'To be announced',
    prize_3rd: 'To be announced',
    maxStudentCapacity: 500,
    totalStudentsRegistered: 0,
    spotsRemaining: 500,
    registrationWindowStatus: 'OPEN',
    registrationsOpen: true,
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const windowStatus = {
    isOpen: settings.registrationsOpen ?? true,
    status: settings.registrationWindowStatus || 'OPEN',
    spotsRemaining: settings.spotsRemaining ?? 500,
    totalStudentsRegistered: settings.totalStudentsRegistered ?? 0,
    maxStudentCapacity: settings.maxStudentCapacity ?? 500,
  };

  const judgingCriteria = [
    { title: 'Innovation & Originality', marks: 20, desc: 'Novelty of the concept, unique approach to the chosen problem, and creative problem solving.' },
    { title: 'Real-world Usefulness', marks: 20, desc: 'Practical utility, target user impact, and viable application in real-world scenarios.' },
    { title: 'AI Implementation', marks: 20, desc: 'Meaningful and effective integration of machine learning, NLP, computer vision, or AI APIs.' },
    { title: 'Working Functionality', marks: 20, desc: 'Fully operational web application, absence of game-breaking bugs, and smooth user flow.' },
    { title: 'UI/UX & Web Design', marks: 10, desc: 'Aesthetic visual appeal, accessibility, mobile responsiveness, and modern interactive design.' },
    { title: 'Code Quality & Defense', marks: 10, desc: 'Clean architecture, code organization, and the entire team’s ability to clearly articulate their solution.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-cyan-500/20 cyber-radial-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Institutional Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs font-semibold text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Karavali Institute of Technology, Mangaluru
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/40 text-xs font-semibold text-purple-300">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              Dept. of Artificial Intelligence & Machine Learning (AI & ML)
            </span>
          </div>

          {/* Main Title & Tagline */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-block relative">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
                AIORA
              </h1>
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 mt-2">
                AI × Web Development Hackathon
              </span>
            </div>

            <p className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 tracking-widest uppercase">
              Imagine. Build. Deploy.
            </p>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Assemble your team of 2 to 4 visionaries. Solve real-world challenges by engineering cutting-edge web applications powered by meaningful Artificial Intelligence.
            </p>

            {/* Event Key Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <Calendar className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Event Date</div>
                <div className="text-sm font-bold text-white">5 Nov 2026</div>
                <div className="text-[10px] text-slate-400">Thursday</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Arrival Window</div>
                <div className="text-sm font-bold text-white">9:00–9:30 AM</div>
                <div className="text-[10px] text-amber-300">Deadline 9:30 AM</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Team Size</div>
                <div className="text-sm font-bold text-white">2 – 4 Students</div>
                <div className="text-[10px] text-slate-400">Incl. Leader</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Registration Fee</div>
                <div className="text-sm font-bold text-emerald-300">₹400 / Team</div>
                <div className="text-[10px] text-slate-400">One Payment per Team</div>
              </div>
            </div>

            {/* Registration Status & 500-Capacity Progress Banner */}
            <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${windowStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                  <strong className={windowStatus.isOpen ? 'text-emerald-300' : 'text-red-400'}>
                    {windowStatus.status === 'OPEN' && '96-HOUR REGISTRATION WINDOW OPEN'}
                    {windowStatus.status === 'UPCOMING' && 'REGISTRATION WINDOW UPCOMING'}
                    {windowStatus.status === 'FULL' && 'CAPACITY REACHED (500 STUDENTS FULL)'}
                    {windowStatus.status === 'CLOSED' && 'REGISTRATION WINDOW CLOSED'}
                  </strong>
                </span>
                <span className="text-slate-400 font-semibold">
                  {windowStatus.spotsRemaining} spots left
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(2, Math.min(100, Math.round((windowStatus.totalStudentsRegistered / windowStatus.maxStudentCapacity) * 100)))}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>{windowStatus.totalStudentsRegistered} of {windowStatus.maxStudentCapacity} Students Registered</span>
                <span className="text-amber-400/90 font-mono">Enforced across all 2–4 member teams</span>
              </div>
            </div>

            {/* Live Countdown */}
            <div className="pt-2">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Hackathon Kickoff Countdown (Asia/Kolkata)
              </p>
              <Countdown />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {windowStatus.isOpen ? (
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2.5 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-5 h-5" />
                  Register Your Team (₹400)
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <span className="px-6 py-3.5 rounded-xl text-sm font-bold text-red-300 bg-red-950/60 border border-red-800/80 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-red-400" />
                    {windowStatus.status === 'FULL' ? 'Registrations Full (500 Cap)' : 'Registration Window Closed'}
                  </span>
                  <Link
                    href="/check-status"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-cyan-300 hover:text-white border border-cyan-500/40 bg-slate-900/80 hover:bg-slate-900 transition flex items-center justify-center gap-2"
                  >
                    Check Existing Team Status
                  </Link>
                </div>
              )}

              <Link
                href="/rules"
                className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500/50 bg-slate-900/70 hover:bg-slate-900 transition flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5 text-cyan-400" />
                Explore Official Rules
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Important Organizer Alerts Banner */}
      <section className="bg-slate-950/90 border-b border-amber-500/20 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span><strong>Arrival Deadline:</strong> 9:30 AM IST sharp. Late arrivals will be disqualified without refund.</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-300 font-medium">
            <WifiOff className="w-4 h-4 shrink-0 text-cyan-400" />
            <span><strong>Internet:</strong> Wi-Fi not provided by management. Bring personal mobile hotspots.</span>
          </div>
          <div className="flex items-center gap-2 text-purple-300 font-medium">
            <UtensilsCrossed className="w-4 h-4 shrink-0 text-purple-400" />
            <span><strong>Food:</strong> Snacks & water provided. Lunch is not provided (no dedicated lunch break).</span>
          </div>
        </div>
      </section>

      {/* About The Event & Organizing Department */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-400">
              <Zap className="w-3.5 h-3.5" />
              INNOVATION MEETS EXECUTION
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              A High-Impact Hackathon at Karavali Institute of Technology
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              The <strong className="text-cyan-300">Department of Artificial Intelligence and Machine Learning (AI & ML)</strong> at <strong className="text-white">Karavali Institute of Technology, Mangaluru</strong>, proudly presents <strong className="text-cyan-400">AIORA</strong>.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              AIORA is designed to bring together passionate undergraduate and postgraduate engineering students to architect practical, real-world solutions. Teams will choose one of two mystery problem statements unveiled on the morning of the hackathon and create a full-stack web application featuring deep, meaningful AI integration.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <Cpu className="w-6 h-6 text-cyan-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Meaningful AI Integration</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Integrate machine learning, generative intelligence, neural networks, or predictive models into user workflows.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <Globe className="w-6 h-6 text-purple-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Real-World Web Apps</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Deliver responsive, functional web apps with clear real-world utility and practical execution.
                </p>
              </div>
            </div>
          </div>

          {/* Forum Identity Card */}
          <div className="lg:col-span-5">
            <div className="glass-panel-glow p-8 rounded-3xl border border-cyan-500/30 text-center relative overflow-hidden">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-cyan-400/50 p-1 shadow-[0_0_30px_rgba(0,240,255,0.35)]">
                <Image
                  src="/assets/aiora_logo.png"
                  alt="AIORA Forum"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-wide">
                AIORA FORUM
              </h3>
              <p className="text-cyan-400 font-mono text-sm font-semibold mt-1">
                Imagine. Build. Deploy.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                <p>Department of Artificial Intelligence & Machine Learning</p>
                <p className="text-slate-400">Karavali Institute of Technology, Mangaluru, Karnataka</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-3">
                <a
                  href="https://instagram.com/aiora_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Follow @aiora_official
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Schedule Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Programme Timeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Event Schedule & Milestones
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Thursday, 5 November 2026 · All times are in Indian Standard Time (IST, UTC+5:30)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              time: '9:00 AM – 9:30 AM',
              title: 'Arrival & Team Check-In',
              desc: 'Report to Karavali Institute of Technology. Complete badge verification and occupy assigned room. 9:30 AM is the strict deadline.',
              badge: 'MANDATORY',
              color: 'border-cyan-500/40 text-cyan-300',
            },
            {
              time: '9:30 AM Sharp',
              title: 'Problem Statements Release',
              desc: 'Organizers unveil the 2 official problem statements. Teams choose 1 statement and commence development.',
              badge: 'HACKATHON START',
              color: 'border-emerald-500/40 text-emerald-300',
            },
            {
              time: '9:30 AM – 1:00 PM',
              title: 'Core Development Sprint',
              desc: 'Intensive coding, AI model orchestration, API integration, and full-stack implementation inside assigned rooms.',
              badge: 'DEV PHASE',
              color: 'border-blue-500/40 text-blue-300',
            },
            {
              time: '1:00 PM – 2:00 PM',
              title: 'Snacks & Continuous Sprint',
              desc: 'Snacks and water bottles provided by organizers. Participants may consume personal food. The 3:00 PM deadline does not pause.',
              badge: 'NO BREAK',
              color: 'border-amber-500/40 text-amber-300',
            },
            {
              time: '2:00 PM – 3:00 PM',
              title: 'Testing, Deployment & Submission',
              desc: 'Push code to repository, deploy live URL, document AI features, and submit via the portal before 3:00 PM sharp.',
              badge: 'FINAL HOUR',
              color: 'border-rose-500/40 text-rose-300',
            },
            {
              time: '3:00 PM Sharp',
              title: 'Hard Submission Deadline',
              desc: 'Online submission portal locks at 3:00 PM IST. Judges begin evaluation and team demonstrations.',
              badge: 'STRICT CLOSE',
              color: 'border-purple-500/40 text-purple-300',
            },
          ].map((item, idx) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {item.time}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border bg-slate-950 font-semibold ${item.color}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prize Positions & Judging Criteria */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Prizes Column */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Awards & Recognition
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Prize Positions & Certificates
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Trophies, certificates, and prizes will be awarded to top-performing teams. Official prize amounts will be announced by the organizers upon configuration.
            </p>

            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/40 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-extrabold text-lg">
                  1st
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">Champion — 1st Place</h4>
                  <p className="text-xs text-amber-300/90 font-mono mt-0.5">
                    {settings.prize_1st && settings.prize_1st !== 'To be announced' ? settings.prize_1st : 'Prize to be announced'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-300/10 via-slate-900 to-slate-900 border border-slate-400/40 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-400/20 border border-slate-400/50 flex items-center justify-center text-slate-300 font-extrabold text-lg">
                  2nd
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">Runner-up — 2nd Place</h4>
                  <p className="text-xs text-slate-300/90 font-mono mt-0.5">
                    {settings.prize_2nd && settings.prize_2nd !== 'To be announced' ? settings.prize_2nd : 'Prize to be announced'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-700/10 via-slate-900 to-slate-900 border border-amber-700/40 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-700/20 border border-amber-700/50 flex items-center justify-center text-amber-600 font-extrabold text-lg">
                  3rd
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">2nd Runner-up — 3rd Place</h4>
                  <p className="text-xs text-amber-500/90 font-mono mt-0.5">
                    {settings.prize_3rd && settings.prize_3rd !== 'To be announced' ? settings.prize_3rd : 'Prize to be announced'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-sm">
                  ALL
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Participation Certificates</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official participation certificates will be awarded to every registered and attended student.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Judging Evaluation Table */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Evaluation Rubric
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Official Judging Criteria (100 Marks Total)
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every project will be comprehensively assessed by our expert panel of faculty and industry judges using standard weighted criteria.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {judgingCriteria.map((crit) => (
                <div key={crit.title} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-white text-sm">{crit.title}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold">
                      {crit.marks} Marks
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{crit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rules Summary & Checkpoints */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Participant Guidelines
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Essential Rules & Venue Requirements
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Please review these critical items before arriving on Thursday, 5 November 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-white text-base">Punctual Arrival & Attendance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arrive between 9:00 AM and 9:30 AM. The final arrival deadline is 9:30 AM sharp. Late arrivals will be disqualified and registration fees will not be refunded.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-white text-base">Personal Internet & Laptops</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Management will NOT provide Wi-Fi. Every team must arrange their own mobile hotspots or dongles. Bring fully charged laptops and power adapters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-white text-base">Food & Refreshments</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organizers will provide snacks and a water bottle. Lunch will not be provided. Participants must bring their own food if required; there is no dedicated lunch break.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              4
            </div>
            <h4 className="font-bold text-white text-base">Assigned Room Compliance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Teams must remain in their assigned rooms throughout the entire event. Moving to another room without permission or disruptive behavior may lead to disqualification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              5
            </div>
            <h4 className="font-bold text-white text-base">Strict 3:00 PM Deadline</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Final code repository and project details must be submitted before 3:00 PM IST on the website portal. The submission clock will not be extended.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              6
            </div>
            <h4 className="font-bold text-white text-base">Originality & AI Mandate</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The project must be a website incorporating at least one meaningful AI feature solving the selected problem statement. All code must be developed during the hackathon.
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/rules"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
            Read all 16 official rules and detailed regulations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Common Questions
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How many students can be in a team?',
              a: 'A team must have a minimum of 2 and maximum of 4 students, including the team leader (allowed team sizes: 2, 3, or 4). All students must have a valid University Seat Number (USN).',
            },
            {
              q: 'What is the team registration fee and how do we pay?',
              a: 'The registration fee is ₹400 per team. The team leader should scan the official PhonePe QR code on the registration page, make one payment of ₹400 for the whole team, and enter the 12-digit UPI transaction reference (UTR) on the website.',
            },
            {
              q: 'When are payments verified?',
              a: 'Payments are verified manually by the AIORA organizing team against account statements. Your status will show "Payment verification pending" until verified. Once verified, your status updates to Confirmed and your official receipt becomes downloadable.',
            },
            {
              q: 'What if we arrive after 9:30 AM?',
              a: 'All teams must check in between 9:00 AM and 9:30 AM IST. The arrival deadline is 9:30 AM sharp. Late arrivals will be disqualified and the registration fee is non-refundable.',
            },
            {
              q: 'Will Wi-Fi be provided at the college venue?',
              a: 'No. Management will not provide Wi-Fi. Each team must arrange its own internet connection or mobile hotspot. Power supply points will be provided in every room.',
            },
            {
              q: 'Are lunch and meals provided?',
              a: 'Snacks and drinking water are provided by the organizers. Lunch is NOT provided and there is no dedicated lunch break. Teams may bring their own food and eat at their convenience without stopping development.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 pl-7 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Registration Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-12">
        <div className="glass-panel-glow p-8 sm:p-12 rounded-3xl border border-cyan-500/40 text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            LIMITED SLOTS AVAILABLE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Ready to Build the Future?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Register your team today for ₹400. Bring your laptops, ignite your intelligence, and compete with the brightest minds on 5 November 2026.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl text-base font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Register Team (₹400 / Team)
            </Link>
            <Link
              href="/instructions"
              className="px-6 py-4 rounded-xl text-base font-semibold text-slate-200 border border-slate-700 bg-slate-900/60 hover:bg-slate-900 transition"
            >
              Participant Checklist
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
