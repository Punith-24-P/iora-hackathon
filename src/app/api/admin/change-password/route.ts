import { NextRequest, NextResponse } from 'next/server';
import { getDb, updateAdminPassword, addAuditLog } from '@/lib/db';
import { verifySessionToken, verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
    const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long.' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(admin.username) as {
      id: string;
      username: string;
      password_hash: string;
    } | undefined;

    if (!user || !verifyPassword(currentPassword, user.password_hash)) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    updateAdminPassword(admin.username, newPassword);

    addAuditLog({
      action: 'ADMIN_PASSWORD_CHANGED',
      entity_type: 'ADMIN_USER',
      entity_id: user.id,
      performed_by: admin.username,
      details: `Administrator ${admin.username} updated their password securely`,
    });

    return NextResponse.json({
      success: true,
      message: 'Administrator password changed successfully.',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to update administrator password.' }, { status: 500 });
  }
}
