import { NextRequest, NextResponse } from 'next/server';
import { getAllTeamsAsync, deleteTeamAsync, updateTeamDisqualificationAsync, getDb, addAuditLog } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const attendanceStatus = searchParams.get('attendanceStatus') || undefined;
    const submissionStatus = searchParams.get('submissionStatus') || undefined;

    const teams = await getAllTeamsAsync({
      search,
      paymentStatus,
      attendanceStatus,
      submissionStatus,
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to retrieve teams' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let teamId = searchParams.get('teamId');

    if (!teamId) {
      try {
        const body = await req.json();
        teamId = body.teamId;
      } catch {
        // ignore if empty body
      }
    }

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required to perform deletion.' }, { status: 400 });
    }

    await deleteTeamAsync(teamId, admin.username);

    return NextResponse.json({
      success: true,
      message: `Team ${teamId} and all associated student rosters have been permanently deleted.`,
    });
  } catch (error: any) {
    console.error('Team deletion error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete team record' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { teamId, action, reason, notes } = body;

    if (!teamId || !action) {
      return NextResponse.json({ error: 'Team ID and action are required.' }, { status: 400 });
    }

    if (action === 'DISQUALIFY') {
      if (!reason) {
        return NextResponse.json({ error: 'Disqualification reason is required.' }, { status: 400 });
      }
      await updateTeamDisqualificationAsync({
        teamId,
        disqualify: true,
        reason,
        performedBy: admin.username,
      });
      return NextResponse.json({ success: true, message: 'Team has been marked as disqualified.' });
    } else if (action === 'REINSTATE') {
      await updateTeamDisqualificationAsync({
        teamId,
        disqualify: false,
        reason: '',
        performedBy: admin.username,
      });
      return NextResponse.json({ success: true, message: 'Team has been reinstated to confirmed status.' });
    } else if (action === 'UPDATE_NOTES') {
      const db = getDb();
      db.prepare('UPDATE teams SET admin_notes = ?, updated_at = datetime("now") WHERE id = ?').run(notes || null, teamId);
      addAuditLog({
        action: 'UPDATE_TEAM_NOTES',
        entity_type: 'TEAM',
        entity_id: teamId,
        performed_by: admin.username,
        details: `Updated notes for team ${teamId}`,
      });
      return NextResponse.json({ success: true, message: 'Notes updated.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Team action error:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 400 });
  }
}
