'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users,
  User,
  Shield,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  QrCode,
  Upload,
  Lock,
  Copy,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemberForm {
  fullName: string;
  usn: string;
  collegeName: string;
  department: string;
  yearSemester: string;
}

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings from API
  const [settings, setSettings] = useState<any>(null);

  // Step 1: Team & Leader details
  const [teamName, setTeamName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [yearSemester, setYearSemester] = useState('3rd Year / 5th Sem');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderUsn, setLeaderUsn] = useState('');

  // Step 2: Additional members (Leader is member 1, additional are 1 to 3 members -> total 2 to 4)
  const [additionalMembers, setAdditionalMembers] = useState<MemberForm[]>([
    { fullName: '', usn: '', collegeName: '', department: '', yearSemester: '3rd Year / 5th Sem' },
  ]);

  // Step 3: Terms
  const [agreedToRules, setAgreedToRules] = useState(false);

  // Step 4: Registered Team State & Payment Claim
  const [registeredTeam, setRegisteredTeam] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [utrReference, setUtrReference] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch settings
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const totalMembersCount = 1 + additionalMembers.length;

  const handleAddMember = () => {
    if (totalMembersCount >= (settings?.maxTeamSize || 4)) {
      setError(`Maximum team size is ${settings?.maxTeamSize || 4} students (including leader).`);
      return;
    }
    setError(null);
    setAdditionalMembers([
      ...additionalMembers,
      { fullName: '', usn: '', collegeName, department, yearSemester },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    if (totalMembersCount <= (settings?.minTeamSize || 2)) {
      setError(`Minimum team size is ${settings?.minTeamSize || 2} students (including leader).`);
      return;
    }
    setError(null);
    const updated = additionalMembers.filter((_, i) => i !== index);
    setAdditionalMembers(updated);
  };

  const handleMemberChange = (index: number, field: keyof MemberForm, value: string) => {
    const updated = [...additionalMembers];
    updated[index][field] = value;
    setAdditionalMembers(updated);
  };

  // Step 1 Validation
  const validateStep1 = () => {
    setError(null);
    if (!teamName.trim()) return setError('Please enter a unique Team Name.');
    if (!collegeName.trim()) return setError('Please enter your College / Institution Name.');
    if (!department.trim()) return setError('Please enter your Department / Branch.');
    if (!yearSemester.trim()) return setError('Please enter your Year / Semester.');
    if (!leaderName.trim()) return setError('Please enter the Team Leader\'s Full Name.');
    if (!leaderUsn.trim()) return setError('Please enter the Team Leader\'s USN.');
    if (!leaderEmail.trim() || !leaderEmail.includes('@')) return setError('Please enter a valid email for the Team Leader.');
    if (!leaderPhone.trim() || leaderPhone.replace(/[^0-9]/g, '').length < 10) {
      return setError('Please enter a valid 10-digit mobile number for the Team Leader.');
    }
    setStep(2);
  };

  // Step 2 Validation
  const validateStep2 = () => {
    setError(null);
    if (totalMembersCount < (settings?.minTeamSize || 2) || totalMembersCount > (settings?.maxTeamSize || 4)) {
      return setError(`Team size must be between ${settings?.minTeamSize || 2} and ${settings?.maxTeamSize || 4} students.`);
    }

    // Check duplicate USNs
    const usnSet = new Set<string>();
    usnSet.add(leaderUsn.trim().toUpperCase());

    for (let i = 0; i < additionalMembers.length; i++) {
      const m = additionalMembers[i];
      if (!m.fullName.trim()) return setError(`Please enter full name for Team Member #${i + 2}.`);
      if (!m.usn.trim()) return setError(`Please enter USN for Team Member #${i + 2}.`);

      const cleanUsn = m.usn.trim().toUpperCase();
      if (usnSet.has(cleanUsn)) {
        return setError(`Duplicate USN detected within team: "${cleanUsn}". Each student must have a unique USN.`);
      }
      usnSet.add(cleanUsn);
    }

    setStep(3);
  };

  // Step 3: Submit Registration to Database
  const handleSubmitRegistration = async () => {
    if (!agreedToRules) {
      return setError('You must review and accept the event rules and regulations.');
    }

    setError(null);
    setLoading(true);

    try {
      // Assemble members array: leader is member 0
      const allMembers = [
        {
          fullName: leaderName.trim(),
          usn: leaderUsn.trim().toUpperCase(),
          collegeName: collegeName.trim(),
          department: department.trim(),
          yearSemester: yearSemester.trim(),
        },
        ...additionalMembers.map((m) => ({
          fullName: m.fullName.trim(),
          usn: m.usn.trim().toUpperCase(),
          collegeName: m.collegeName.trim() || collegeName.trim(),
          department: m.department.trim() || department.trim(),
          yearSemester: m.yearSemester.trim() || yearSemester.trim(),
        })),
      ];

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: teamName.trim(),
          collegeName: collegeName.trim(),
          department: department.trim(),
          yearSemester: yearSemester.trim(),
          leaderName: leaderName.trim(),
          leaderEmail: leaderEmail.trim(),
          leaderPhone: leaderPhone.trim(),
          members: allMembers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit team registration.');
      }

      setRegisteredTeam(data.team);
      setAccessToken(data.accessToken);
      setStep(4);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Handle Screenshot file input
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotBase64(reader.result as string);
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Step 4: Submit Payment Claim
  const handleSubmitPaymentClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUtr = utrReference.trim().toUpperCase();
    if (!cleanUtr || cleanUtr.length < 6) {
      return setError('Please enter a valid UPI transaction reference number (UTR / Ref ID).');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payment-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: registeredTeam.id,
          accessToken,
          utrReference: cleanUtr,
          screenshotBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment claim.');
      }

      setClaimSubmitted(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment claim.');
    } finally {
      setLoading(false);
    }
  };

  const copyPrivateLink = () => {
    if (!registeredTeam) return;
    const url = `${window.location.origin}/team/${registeredTeam.id}?token=${accessToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Step Indicator Header */}
        <div className="mb-8">
          <div className="text-center space-y-2 mb-6">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              OFFICIAL TEAM REGISTRATION
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              AIORA Hackathon 2026 Registration
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Registration fee: <strong className="text-cyan-300">₹400 per team</strong> · Team size: <strong className="text-cyan-300">2 to 4 students</strong>
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono font-bold">
            <div className={`p-2 rounded-lg border ${step >= 1 ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              1. Team Info
            </div>
            <div className={`p-2 rounded-lg border ${step >= 2 ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              2. Members
            </div>
            <div className={`p-2 rounded-lg border ${step >= 3 ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              3. Review
            </div>
            <div className={`p-2 rounded-lg border ${step >= 4 ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              4. Payment QR
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* STEP 1: TEAM & LEADER DETAILS */}
        {step === 1 && (
          <div className="p-6 sm:p-8 rounded-2xl glass-panel-glow border border-cyan-500/30 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Users className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Step A: Team & Leader Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Team Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. NeuralKnights, ByteBrigade"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  College / Institution Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. Karavali Institute of Technology, Mangaluru"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Department / Branch <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. AI & ML, CSE, ISE, ECE"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Year / Semester <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={yearSemester}
                  onChange={(e) => setYearSemester(e.target.value)}
                  placeholder="e.g. 3rd Year / 5th Sem"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  required
                />
              </div>

              <div className="sm:col-span-2 pt-2 pb-1 border-t border-slate-800">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                  Team Leader Information (Member 1)
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Leader Full Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Leader full name as on college ID"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Leader University Seat Number (USN) <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={leaderUsn}
                  onChange={(e) => setLeaderUsn(e.target.value.toUpperCase())}
                  placeholder="e.g. 4KA23AI001"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm uppercase font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Leader Email Address <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="email"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Leader Mobile Number <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="tel"
                  value={leaderPhone}
                  onChange={(e) => setLeaderPhone(e.target.value)}
                  placeholder="10-digit WhatsApp/calling number"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={validateStep1}
                className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition flex items-center gap-2"
              >
                Next: Add Team Members <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TEAM MEMBERS (2 TO 4 STUDENTS TOTAL) */}
        {step === 2 && (
          <div className="p-6 sm:p-8 rounded-2xl glass-panel-glow border border-cyan-500/30 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Step B: Team Members</h2>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                Total Team Members: {totalMembersCount} (Allowed: 2 to 4)
              </span>
            </div>

            {/* Member 1: Leader (Readonly summary) */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  MEMBER #1 — TEAM LEADER
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Primary Contact
                </span>
              </div>
              <p className="text-sm font-bold text-white">{leaderName} ({leaderUsn})</p>
              <p className="text-xs text-slate-400">{collegeName} · {department} · {yearSemester}</p>
            </div>

            {/* Additional Members List */}
            <div className="space-y-4">
              {additionalMembers.map((member, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 font-mono">
                      MEMBER #{index + 2}
                    </span>
                    {additionalMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1"
                        title="Remove Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">
                        Full Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={member.fullName}
                        onChange={(e) => handleMemberChange(index, 'fullName', e.target.value)}
                        placeholder="Member full name"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">
                        University Seat Number (USN) <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={member.usn}
                        onChange={(e) => handleMemberChange(index, 'usn', e.target.value.toUpperCase())}
                        placeholder="e.g. 4KA23AI002"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">
                        Department / Branch
                      </label>
                      <input
                        type="text"
                        value={member.department}
                        onChange={(e) => handleMemberChange(index, 'department', e.target.value)}
                        placeholder="e.g. AI & ML"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">
                        Year / Semester
                      </label>
                      <input
                        type="text"
                        value={member.yearSemester}
                        onChange={(e) => handleMemberChange(index, 'yearSemester', e.target.value)}
                        placeholder="e.g. 3rd Year / 5th Sem"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add member button if below 4 */}
            {totalMembersCount < (settings?.maxTeamSize || 4) && (
              <button
                type="button"
                onClick={handleAddMember}
                className="w-full py-3 rounded-xl border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Member #{totalMembersCount + 1} (Up to 4 students max)
              </button>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-900 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Team Info
              </button>

              <button
                type="button"
                onClick={validateStep2}
                className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition flex items-center gap-2"
              >
                Next: Review Registration <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & ACCEPTANCE */}
        {step === 3 && (
          <div className="p-6 sm:p-8 rounded-2xl glass-panel-glow border border-cyan-500/30 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Step C: Review & Terms Confirmation</h2>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-white">{teamName}</h3>
                  <p className="text-xs text-slate-400">{collegeName} · {department} · {yearSemester}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Registration Fee</span>
                  <span className="text-lg font-extrabold text-cyan-300 font-mono">₹400.00</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider mb-2">
                  Confirmed Members ({totalMembersCount} Students):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{leaderName}</span>
                      <span className="block text-[10px] text-cyan-400 font-mono">USN: {leaderUsn}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                      Leader
                    </span>
                  </div>

                  {additionalMembers.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{m.fullName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">USN: {m.usn}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Member #{idx + 2}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkbox agreement */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 border-slate-700 bg-slate-950 focus:ring-cyan-400 mt-1"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I, <strong className="text-white">{leaderName}</strong>, confirm that all student names and USNs are accurate. I acknowledge that the team must arrive before <strong className="text-amber-300">9:30 AM sharp</strong> on 5 November 2026, bring our own mobile internet hotspot and laptops, and that the ₹400 registration fee is non-refundable.
                </span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-900 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Edit Members
              </button>

              <button
                type="button"
                disabled={loading || !agreedToRules}
                onClick={handleSubmitRegistration}
                className="px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Record...' : 'Confirm & Proceed to Payment'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT QR & UTR CLAIM */}
        {step === 4 && registeredTeam && (
          <div className="p-6 sm:p-8 rounded-2xl glass-panel-glow border border-cyan-500/40 space-y-6">
            {/* Success Registration Notice */}
            <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">
                  REGISTRATION RECORD CREATED
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  Team ID: {registeredTeam.id}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Team: <strong>{registeredTeam.teamName}</strong> · Status: <span className="text-amber-400 font-semibold">Payment Verification Pending</span>
                </p>
              </div>

              <button
                type="button"
                onClick={copyPrivateLink}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 flex items-center gap-1.5 transition"
                title="Copy Private Team Link"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedLink ? 'Copied!' : 'Copy Team Link'}
              </button>
            </div>

            {/* If claim already submitted */}
            {claimSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Payment Claim Submitted!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your UPI transaction reference has been successfully logged. The organizing committee will verify your payment against bank records.
                </p>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-sm mx-auto text-xs text-slate-400 space-y-1">
                  <div>Registration ID: <strong className="text-white font-mono">{registeredTeam.id}</strong></div>
                  <div>Submitted UTR: <strong className="text-cyan-300 font-mono">{utrReference}</strong></div>
                  <div>Current Status: <strong className="text-amber-400">Payment verification pending</strong></div>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/team/${registeredTeam.id}?token=${accessToken}`}
                    className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition flex items-center gap-2"
                  >
                    View Team Dashboard & Receipt <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Payment QR & UTR Submission Form */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Official PhonePe QR Image Display */}
                <div className="md:col-span-5 text-center p-4 rounded-2xl bg-black border border-cyan-500/30 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    Official Payment QR Code
                  </div>
                  <div className="relative w-full max-w-[240px] aspect-[1/1.8] mx-auto rounded-xl overflow-hidden border border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                    <Image
                      src={settings?.paymentQrUrl || '/assets/phonepe_qr.jpg'}
                      alt="Official PhonePe Payment QR"
                      fill
                      className="object-contain"
                      priority
                      unoptimized
                    />
                  </div>
                  <div className="text-xs text-slate-300">
                    <div>Receiver: <strong className="text-cyan-300">{settings?.paymentReceiverName || 'PUNITH K K'}</strong></div>
                    <div className="text-[11px] text-slate-400">Scan using PhonePe / GPay / Paytm</div>
                  </div>
                </div>

                {/* Instructions & Claim Form */}
                <div className="md:col-span-7 space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">How to Complete Payment:</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
                      <li>Open your preferred UPI app (PhonePe, Google Pay, Paytm, BHIM, etc.).</li>
                      <li>Scan the QR code shown on the left.</li>
                      <li>
                        Confirm the receiving name: <strong className="text-cyan-300">{settings?.paymentReceiverName || 'PUNITH K K'}</strong>.
                      </li>
                      <li>
                        Enter exactly <strong className="text-white font-mono">₹400</strong> as the total team fee and complete the payment.
                      </li>
                      <li>Note down the <strong>12-digit UPI Reference Number / UTR</strong> from your payment receipt.</li>
                    </ol>
                  </div>

                  <form onSubmit={handleSubmitPaymentClaim} className="space-y-4 pt-2 border-t border-slate-800">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200">
                        UPI Transaction Reference Number (UTR / Ref ID) <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={utrReference}
                        onChange={(e) => setUtrReference(e.target.value.toUpperCase())}
                        placeholder="e.g. 430512345678"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono tracking-wider uppercase"
                        required
                      />
                      <span className="text-[11px] text-slate-400 block">
                        Found in your payment app transaction details.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200">
                        Optional Payment Screenshot
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-300 hover:file:bg-slate-700 cursor-pointer"
                      />
                      {screenshotPreview && (
                        <div className="mt-2 w-24 h-24 relative rounded-lg overflow-hidden border border-slate-700">
                          <Image src={screenshotPreview} alt="Screenshot preview" fill className="object-cover" />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !utrReference.trim()}
                      className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? 'Submitting Claim...' : 'Submit Payment for Verification'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
