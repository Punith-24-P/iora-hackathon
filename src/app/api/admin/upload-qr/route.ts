import { NextRequest, NextResponse } from 'next/server';
import { updateSettings, addAuditLog } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const resetToDefault = formData.get('resetToDefault') === 'true';

    if (resetToDefault) {
      const defaultQrUrl = '/assets/phonepe_qr.jpg';
      updateSettings({ payment_qr_url: defaultQrUrl }, admin.username);
      addAuditLog({
        action: 'RESET_PAYMENT_QR',
        entity_type: 'EVENT_SETTINGS',
        entity_id: 'default',
        performed_by: admin.username,
        details: 'Payment QR code reset to official PhonePe QR asset',
      });
      return NextResponse.json({
        success: true,
        paymentQrUrl: defaultQrUrl,
        message: 'Payment QR code reset to default organizer PhonePe QR.',
      });
    }

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate mime type
    const mimeType = file.type || '';
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file must be an image (PNG, JPG, WEBP).' }, { status: 400 });
    }

    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'qrcodes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `payment_qr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/qrcodes/${fileName}`;
    updateSettings({ payment_qr_url: relativeUrl }, admin.username);

    addAuditLog({
      action: 'UPDATE_PAYMENT_QR',
      entity_type: 'EVENT_SETTINGS',
      entity_id: 'default',
      performed_by: admin.username,
      details: `Administrator ${admin.username} uploaded a new payment QR code: ${relativeUrl}`,
    });

    return NextResponse.json({
      success: true,
      paymentQrUrl: relativeUrl,
      message: 'New payment QR code uploaded and activated for registrations!',
    });
  } catch (error: any) {
    console.error('Upload QR error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload QR code' }, { status: 500 });
  }
}
