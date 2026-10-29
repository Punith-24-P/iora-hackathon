'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Settings,
  Upload,
  QrCode,
  CheckCircle2,
  RotateCcw,
  Save,
  HelpCircle,
  AlertCircle,
  FileCode,
  Sparkles,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSettings = () => {
    setLoading(true);
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setSuccessMessage('Event settings saved and updated across the live platform!');
      setSettings(data.settings);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  // Upload New Payment QR
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingQr(true);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/upload-qr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload QR');

      setSettings({ ...settings, payment_qr_url: data.paymentQrUrl });
      setSuccessMessage('New payment QR code uploaded and activated for registrations!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error uploading QR');
    } finally {
      setUploadingQr(false);
    }
  };

  // Reset to default PhonePe QR
  const handleResetDefaultQr = async () => {
    if (!confirm('Reset payment QR code to the official supplied PhonePe QR asset?')) return;

    setUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append('resetToDefault', 'true');

      const res = await fetch('/api/admin/upload-qr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error('Failed to reset QR');

      setSettings({ ...settings, payment_qr_url: data.paymentQrUrl });
      setSuccessMessage('Payment QR reset to default PhonePe QR.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error resetting QR');
    } finally {
      setUploadingQr(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-10 text-center text-slate-500 font-mono text-xs">
        Loading event configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            DYNAMIC CONFIGURATION
          </span>
          <h1 className="text-2xl font-extrabold text-white">Event Settings & Payment QR Manager</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify event details, upload new payment QR codes, publish problem statements, and update contact info without rebuilding the site.
          </p>
        </div>

        {successMessage && (
          <div className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* SECTION 1: PAYMENT QR CODE MANAGER (CRITICAL USER REQUIREMENT) */}
        <section className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-cyan-500/40 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Payment QR Code & Receiver Settings</h2>
              <p className="text-xs text-slate-400">
                You can change the payment QR code anytime by uploading a new image.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Active QR Preview */}
            <div className="md:col-span-5 text-center p-4 rounded-2xl bg-black border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block">
                Currently Active Payment QR
              </span>
              <div className="relative w-full max-w-[220px] aspect-[1/1.8] mx-auto rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                <Image
                  src={settings.payment_qr_url}
                  alt="Active Payment QR"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="text-[11px] text-slate-400 font-mono break-all">
                Path: {settings.payment_qr_url}
              </div>
            </div>

            {/* QR Upload Controls */}
            <div className="md:col-span-7 space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Upload a New Payment QR Code
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Select a new QR image file (PNG, JPG, or WEBP). Once uploaded, it will immediately display on the registration page and payment screens for all participants.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingQr ? 'Uploading QR...' : 'Upload New QR Code Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      disabled={uploadingQr}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleResetDefaultQr}
                    disabled={uploadingQr || settings.payment_qr_url === '/assets/phonepe_qr.jpg'}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore Default PhonePe QR
                  </button>
                </div>
              </div>

              {/* Receiver Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Payment Receiver Name
                  </label>
                  <input
                    type="text"
                    value={settings.payment_receiver_name}
                    onChange={(e) => handleFieldChange('payment_receiver_name', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Displays under QR: e.g. PUNITH K K
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Registration Fee (INR)
                  </label>
                  <input
                    type="number"
                    value={settings.registration_fee}
                    onChange={(e) => handleFieldChange('registration_fee', Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Controlled server-side (₹400 / team)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: PROBLEM STATEMENTS MANAGER */}
        <section className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Problem Statements Manager</h2>
              <p className="text-xs text-slate-400">
                Organizers unveil two problem statements at 9:30 AM on the day of the hackathon.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-300">Publicly Published:</span>
              <button
                type="button"
                onClick={() => handleFieldChange('problem_statements_published', settings.problem_statements_published ? 0 : 1)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition border ${
                  settings.problem_statements_published
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {settings.problem_statements_published ? 'YES (Visible to Participants)' : 'NO (Hidden in Draft)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Statement 1 */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30 font-bold">
                PROBLEM STATEMENT 1
              </span>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Title / Topic</label>
                <input
                  type="text"
                  value={settings.problem_statement_1_title}
                  onChange={(e) => handleFieldChange('problem_statement_1_title', e.target.value)}
                  placeholder="e.g. AI-Powered Healthcare Diagnostics Platform"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Detailed Description & Criteria</label>
                <textarea
                  rows={4}
                  value={settings.problem_statement_1_desc}
                  onChange={(e) => handleFieldChange('problem_statement_1_desc', e.target.value)}
                  placeholder="Describe the challenge scope, expected AI features, and user workflow..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Statement 2 */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-bold">
                PROBLEM STATEMENT 2
              </span>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Title / Topic</label>
                <input
                  type="text"
                  value={settings.problem_statement_2_title}
                  onChange={(e) => handleFieldChange('problem_statement_2_title', e.target.value)}
                  placeholder="e.g. Smart Municipal Resource Optimizer with Generative AI"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Detailed Description & Criteria</label>
                <textarea
                  rows={4}
                  value={settings.problem_statement_2_desc}
                  onChange={(e) => handleFieldChange('problem_statement_2_desc', e.target.value)}
                  placeholder="Describe the challenge scope, expected AI features, and user workflow..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: EVENT DATES & TIMINGS */}
        <section className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white pb-3 border-b border-slate-800">
            Event Schedule & Team Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Event Date (YYYY-MM-DD)</label>
              <input
                type="date"
                value={settings.event_date}
                onChange={(e) => handleFieldChange('event_date', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Arrival Window Start</label>
              <input
                type="text"
                value={settings.arrival_start}
                onChange={(e) => handleFieldChange('arrival_start', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Arrival Deadline (Sharp)</label>
              <input
                type="text"
                value={settings.arrival_deadline}
                onChange={(e) => handleFieldChange('arrival_deadline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Final Submission Deadline</label>
              <input
                type="text"
                value={settings.submission_deadline}
                onChange={(e) => handleFieldChange('submission_deadline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Minimum Team Size</label>
              <input
                type="number"
                min={2}
                max={4}
                value={settings.min_team_size}
                onChange={(e) => handleFieldChange('min_team_size', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Maximum Team Size</label>
              <input
                type="number"
                min={2}
                max={4}
                value={settings.max_team_size}
                onChange={(e) => handleFieldChange('max_team_size', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none"
                required
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: CONTACT & VENUE (CHANGEABLE WITHOUT REBUILDING) */}
        <section className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white pb-3 border-b border-slate-800">
            Contact Details & Venue Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Official Contact Email (Displayed on site)
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleFieldChange('contact_email', e.target.value)}
                placeholder="Leave blank to show 'To be announced'"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Organizer Contact Phone Number
              </label>
              <input
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => handleFieldChange('contact_phone', e.target.value)}
                placeholder="Leave blank to show 'To be announced'"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Instagram Profile URL</label>
              <input
                type="url"
                value={settings.instagram_url}
                onChange={(e) => handleFieldChange('instagram_url', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Assigned Venue Rooms</label>
              <input
                type="text"
                value={settings.venue_room}
                onChange={(e) => handleFieldChange('venue_room', e.target.value)}
                placeholder="e.g. CSE Labs 1 & 2, Seminar Hall A"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Public Website URL (For Posters & QRs)</label>
              <input
                type="text"
                value={settings.public_website_url}
                onChange={(e) => handleFieldChange('public_website_url', e.target.value)}
                placeholder="http://localhost:3000 or production domain"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">USN Validation Regex</label>
              <input
                type="text"
                value={settings.usn_validation_regex}
                onChange={(e) => handleFieldChange('usn_validation_regex', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Prize 1st Place</label>
              <input
                type="text"
                value={settings.prize_1st}
                onChange={(e) => handleFieldChange('prize_1st', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Prize 2nd Place</label>
              <input
                type="text"
                value={settings.prize_2nd}
                onChange={(e) => handleFieldChange('prize_2nd', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Prize 3rd Place</label>
              <input
                type="text"
                value={settings.prize_3rd}
                onChange={(e) => handleFieldChange('prize_3rd', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>
        </section>

        {/* Save Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
