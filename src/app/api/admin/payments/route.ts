import { NextRequest, NextResponse } from 'next/server';
import {
  getAllPaymentClaimsAsync,
  approvePaymentAsync,
  rejectPaymentAsync,
  reversePaymentApprovalAsync,
} from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const claims = await getAllPaymentClaimsAsync();
    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ error: 'Failed to retrieve payment claims' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, claimId, verifiedAmount, rejectionReason, reversalReason, adminNotes } = body;

    if (!claimId || !action) {
      return NextResponse.json({ error: 'Claim ID and action are required.' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const amount = Number(verifiedAmount) || 400;
      await approvePaymentAsync({
        claimId,
        verifiedAmount: amount,
        verifiedBy: admin.username,
        adminNotes,
      });
      return NextResponse.json({ success: true, message: `Payment approved successfully for ₹${amount}.` });
    } else if (action === 'REJECT') {
      if (!rejectionReason) {
        return NextResponse.json({ error: 'Rejection reason is required.' }, { status: 400 });
      }
      await rejectPaymentAsync({
        claimId,
        rejectionReason,
        verifiedBy: admin.username,
      });
      return NextResponse.json({ success: true, message: 'Payment claim rejected.' });
    } else if (action === 'REVERSE') {
      if (!reversalReason) {
        return NextResponse.json({ error: 'Reversal reason is required.' }, { status: 400 });
      }
      await reversePaymentApprovalAsync({
        claimId,
        reversalReason,
        performedBy: admin.username,
      });
      return NextResponse.json({ success: true, message: 'Payment approval successfully reversed.' });
    }

    return NextResponse.json({ error: 'Invalid payment action' }, { status: 400 });
  } catch (error: any) {
    console.error('Payment action error:', error);
    return NextResponse.json({ error: error.message || 'Payment operation failed' }, { status: 400 });
  }
}
