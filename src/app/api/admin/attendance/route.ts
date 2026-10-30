import { NextRequest, NextResponse } from 'next/server';
import { markAttendanceAsync, getAttendanceLogsAsync } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const logs = await getAttendanceLogsAsync();
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

    await markAttendanceAsync({
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
