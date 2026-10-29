import { NextRequest, NextResponse } from 'next/server';
import { getTeamById } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    const team = getTeamById(id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if admin is authenticated via cookie
    const adminCookie = req.cookies.get('aiora_admin_session')?.value;
    const isAdmin = adminCookie ? !!verifySessionToken(adminCookie) : false;

    // Check if token matches team access token
    const isOwner = token && team.access_token === token;

    if (isAdmin || isOwner) {
      // Full details authorized
      return NextResponse.json({
        id: team.id,
        teamName: team.team_name,
        collegeName: team.college_name,
        department: team.department,
        yearSemester: team.year_semester,
        leaderName: team.leader_name,
        leaderEmail: team.leader_email,
        leaderPhone: team.leader_phone,
        registrationStatus: team.registration_status,
        paymentStatus: team.payment_status,
        attendanceStatus: team.attendance_status,
        submissionStatus: team.submission_status,
        disqualificationReason: team.disqualification_reason,
        createdAt: team.created_at,
        members: team.members,
        paymentClaim: team.payment_claim,
        submission: team.submission,
        isOwner,
        isAdmin,
      });
    }

    // Public limited view: Only show status, hide USNs, phone numbers, and private details
    return NextResponse.json({
      id: team.id,
      teamName: team.team_name,
      collegeName: team.college_name,
      registrationStatus: team.registration_status,
      paymentStatus: team.payment_status,
      memberCount: team.members?.length || 0,
      createdAt: team.created_at,
      requiresAuth: true,
      message: 'Private team credentials required to view full records.',
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Failed to fetch team details' }, { status: 500 });
  }
}
