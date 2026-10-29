import { NextRequest, NextResponse } from 'next/server';
import { getDb, addAuditLog } from '@/lib/db';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username.trim()) as {
      id: string;
      username: string;
      password_hash: string;
      full_name: string;
      role: string;
    } | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid administrator credentials.' }, { status: 401 });
    }

    const token = createSessionToken(user.username, user.role);

    addAuditLog({
      action: 'ADMIN_LOGIN',
      entity_type: 'ADMIN_USER',
      entity_id: user.id,
      performed_by: user.username,
      details: `Administrator ${user.username} logged in successfully`,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        fullName: user.full_name,
        role: user.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set('aiora_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred during authentication.' }, { status: 500 });
  }
}
