import { NextRequest, NextResponse } from 'next/server';
import { markAttendance, getDb } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const db = getDb();
    const logs = db.prepare(`
      SELECT al.*, t.team_name, t.leader_name
      FROM attendance_logs al
      JOIN teams t ON al.team_id = t.id
      ORDER BY al.check_in_time DESC
    `).all();

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendance logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const { teamId, status, remarks } = await req.json();

    if (!teamId || !status) {
      return NextResponse.json({ error: 'Team ID and attendance status are required.' }, { status: 400 });
    }

    markAttendance({
      teamId,
      status,
      markedBy: admin.username,
      remarks,
    });

    return NextResponse.json({
      success: true,
      message: `Team marked as ${status}.`,
    });
  } catch (error: any) {
    console.error('Attendance error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record attendance' }, { status: 400 });
  }
}
