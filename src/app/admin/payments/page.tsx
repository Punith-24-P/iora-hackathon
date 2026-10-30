'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Eye,
  AlertTriangle,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Modal / Action state
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REVERSE' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('UTR not found in official receiver account statement.');
  const [reversalReason, setReversalReason] = useState('');
  const [verifiedAmount, setVerifiedAmount] = useState(400);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchClaims = () => {
    setLoading(true);
    fetch('/api/admin/payments')
      .then((res) => res.json())
      .then((data) => setClaims(data.claims || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const openActionModal = (claim: any, type: 'APPROVE' | 'REJECT' | 'REVERSE') => {
    setSelectedClaim(claim);
    setActionType(type);
    setVerifiedAmount(claim.claimed_amount || 400);
    setAdminNotes('');
  };

  const handleExecuteAction = async () => {
    if (!selectedClaim || !actionType) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          claimId: selectedClaim.id,
          verifiedAmount,
          rejectionReason,
          reversalReason,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment operation failed');

      alert(data.message || 'Operation successful');
      setSelectedClaim(null);
      setActionType(null);
      fetchClaims();
    } catch (err: any) {
      alert(err.message || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            MANUAL UPI VERIFICATION CENTER
          </span>
          <h1 className="text-2xl font-extrabold text-white">Payment Claims Verification</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-verify participant UTR numbers against the official PhonePe receiver statement (PUNITH K K).
          </p>
        </div>

        <button
          onClick={fetchClaims}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Claims
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs font-mono">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl border transition ${
              filter === tab
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab} ({claims.filter((c) => (tab === 'ALL' ? true : c.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Claims Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Claim ID & Team</th>
                <th className="py-3 px-4">Leader</th>
                <th className="py-3 px-4">UTR Reference</th>
                <th className="py-3 px-4">Claimed / Verified</th>
                <th className="py-3 px-4">Screenshot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-mono">
                    Loading payment claims...
                  </td>
                </tr>
              ) : filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-mono">
                    No payment claims found in this view.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{claim.team_name}</div>
                      <div className="text-[11px] font-mono text-cyan-400">{claim.team_id}</div>
                      <div className="text-[10px] text-slate-500">{new Date(claim.created_at).toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{claim.leader_name}</div>
                      <div className="text-[10px] text-slate-400">{claim.member_count} members</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-cyan-300 text-sm tracking-wider">
                        {claim.utr_reference}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-white font-bold">₹{claim.claimed_amount}</div>
                      {claim.verified_amount && (
                        <div className="text-emerald-400 text-[10px]">Verified: ₹{claim.verified_amount}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {claim.screenshot_url ? (
                        <button
                          onClick={() => setPreviewImage(claim.screenshot_url)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View Slip
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {claim.status === 'APPROVED' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono">
                          APPROVED
                        </span>
                      ) : claim.status === 'REJECTED' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-[10px] font-bold font-mono">
                          REJECTED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-bold font-mono">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {claim.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openActionModal(claim, 'APPROVE')}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(claim, 'REJECT')}
                            className="px-2 py-1 rounded bg-rose-950 border border-rose-600/40 hover:bg-rose-900 text-rose-300 text-xs transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {claim.status === 'APPROVED' && (
                        <button
                          onClick={() => openActionModal(claim, 'REVERSE')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs transition"
                        >
                          Reverse
                        </button>
                      )}
                      {claim.status === 'REJECTED' && (
                        <span className="text-slate-500 text-[11px]">
                          {claim.rejection_reason || 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal (Approve / Reject / Reverse) */}
      {selectedClaim && actionType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl glass-panel-glow border border-cyan-500/40 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {actionType === 'APPROVE' && 'Approve Payment Claim'}
                {actionType === 'REJECT' && 'Reject Payment Claim'}
                {actionType === 'REVERSE' && 'Reverse Approved Payment'}
              </h3>
              <button onClick={() => setSelectedClaim(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <div>Team: <strong className="text-white">{selectedClaim.team_name}</strong> ({selectedClaim.team_id})</div>
              <div>Submitted UTR: <strong className="text-cyan-300 font-mono">{selectedClaim.utr_reference}</strong></div>
              <div>Claimed Amount: <strong className="text-white font-mono">₹{selectedClaim.claimed_amount}</strong></div>
            </div>

            {selectedClaim.screenshot_url && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Payment Receipt Slip:</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(selectedClaim.screenshot_url)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs flex items-center gap-1.5 font-medium"
                >
                  <Eye className="w-3.5 h-3.5" /> View Uploaded Slip
                </button>
              </div>
            )}

            {actionType === 'APPROVE' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Verified Amount Received in Bank (INR)
                  </label>
                  <input
                    type="number"
                    value={verifiedAmount}
                    onChange={(e) => setVerifiedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Internal Verification Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Matched PhonePe merchant statement 14:32"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            {actionType === 'REJECT' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Rejection Reason (Displayed to participant)
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  required
                />
              </div>
            )}

            {actionType === 'REVERSE' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Reason for Reversing Approved Payment
                </label>
                <textarea
                  rows={2}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Wrong bank transaction matched or chargeback issued..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleExecuteAction}
                className={`px-5 py-2 rounded-xl font-bold text-xs text-white transition ${
                  actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {processing ? 'Processing...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="max-w-2xl max-h-[85vh] relative rounded-2xl overflow-hidden border border-slate-700">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center p-2 max-h-[85vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Payment Receipt"
                className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
