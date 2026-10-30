import { NextRequest, NextResponse } from 'next/server';
import { getSettingsAsync, updateSettingsAsync } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const settings = await getSettingsAsync();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await updateSettingsAsync(body, admin.username);
    return NextResponse.json({
      success: true,
      settings: updated,
      message: 'Event settings updated successfully.',
    });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 400 });
  }
}
