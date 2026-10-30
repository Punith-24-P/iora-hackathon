import { NextRequest, NextResponse } from 'next/server';
import { submitPaymentClaimAsync, getTeamByIdAsync, getSettings } from '@/lib/db';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase-client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, accessToken, utrReference, screenshotBase64 } = body;

    if (!teamId || !utrReference) {
      return NextResponse.json({ error: 'Team ID and UPI Transaction Reference (UTR) are required.' }, { status: 400 });
    }

    const team = await getTeamByIdAsync(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team registration record not found.' }, { status: 404 });
    }

    if (accessToken && team.access_token !== accessToken) {
      return NextResponse.json({ error: 'Unauthorized team access credentials.' }, { status: 403 });
    }

    const cleanUtr = utrReference.trim().toUpperCase();
    if (cleanUtr.length < 6) {
      return NextResponse.json({ error: 'Please enter a valid 12-digit or alphanumeric UPI reference (UTR).' }, { status: 400 });
    }

    const settings = getSettings();
    const expectedAmount = settings.registration_fee || 400;

    let screenshotUrl: string | null = null;
    if (screenshotBase64 && typeof screenshotBase64 === 'string' && screenshotBase64.startsWith('data:image/')) {
      // Default to storing the full base64 data URL so the screenshot is NEVER lost
      screenshotUrl = screenshotBase64;

      // 1. If in local dev with writable directory, save file to public/uploads
      if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
        try {
          const matches = screenshotBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';

            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'screenshots');
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `payment_${teamId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
            screenshotUrl = `/uploads/screenshots/${fileName}`;
          }
        } catch (uploadErr) {
          console.error('Failed to save payment screenshot locally:', uploadErr);
        }
      }

      // 2. If Supabase is configured, also attempt to upload to Supabase Storage bucket
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const matches = screenshotBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              const mimeType = matches[1];
              const base64Data = matches[2];
              const buffer = Buffer.from(base64Data, 'base64');
              const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
              const storagePath = `receipts/${teamId}_${Date.now()}.${ext}`;

              const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('payment-screenshots')
                .upload(storagePath, buffer, {
                  contentType: mimeType,
                  upsert: true,
                });

              if (!uploadErr && uploadData) {
                const { data: publicUrlData } = supabase.storage
                  .from('payment-screenshots')
                  .getPublicUrl(storagePath);
                if (publicUrlData?.publicUrl) {
                  screenshotUrl = publicUrlData.publicUrl;
                }
              }
            }
          }
        } catch (storageErr) {
          // Non-critical: falls back to base64 data URL
          console.warn('Supabase storage upload fallback:', storageErr);
        }
      }
    }

    const claim = await submitPaymentClaimAsync({
      teamId,
      utrReference: cleanUtr,
      claimedAmount: expectedAmount,
      screenshotUrl,
    });

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      status: claim.status,
      message: 'Payment claim submitted successfully! Your payment is currently under manual organizer verification.',
    });
  } catch (error: any) {
    console.error('Payment claim error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit payment claim.' }, { status: 400 });
  }
}
