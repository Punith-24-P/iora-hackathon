import { NextRequest, NextResponse } from 'next/server';
import { getAllTeamsAsync, getAllPaymentClaimsAsync, getAllSubmissions, getDashboardStatsAsync, getDb } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('aiora_admin_session')?.value;
  const admin = sessionCookie ? verifySessionToken(sessionCookie) : null;
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized administrator access' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'teams';

  try {
    let csvContent = '';
    let filename = `aiora_${type}_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'teams') {
      const teams = await getAllTeamsAsync();
      const headers = [
        'Registration ID',
        'Team Name',
        'College',
        'Department',
        'Year / Semester',
        'Leader Name',
        'Leader Email',
        'Leader Phone',
        'Registration Status',
        'Payment Status',
        'Attendance Status',
        'Submission Status',
        'Total Members',
        'Member Details (Name | USN | Dept | Year)',
        'Registered At',
      ];

      const rows = teams.map(t => {
        const memberDetails = (t.members || [])
          .map(m => `${m.full_name} (${m.usn}) [${m.department}, ${m.year_semester}]${m.is_leader ? ' [LEADER]' : ''}`)
          .join(' ; ');

        return [
          escapeCsv(t.id),
          escapeCsv(t.team_name),
          escapeCsv(t.college_name),
          escapeCsv(t.department),
          escapeCsv(t.year_semester),
          escapeCsv(t.leader_name),
          escapeCsv(t.leader_email),
          escapeCsv(t.leader_phone),
          escapeCsv(t.registration_status),
          escapeCsv(t.payment_status),
          escapeCsv(t.attendance_status),
          escapeCsv(t.submission_status),
          escapeCsv(t.members?.length || 0),
          escapeCsv(memberDetails),
          escapeCsv(t.created_at),
        ].join(',');
      });

      csvContent = [headers.join(','), ...rows].join('\n');
    } else if (type === 'payments') {
      const claims = await getAllPaymentClaimsAsync();
      const headers = [
        'Claim ID',
        'Team ID',
        'Team Name',
        'Leader Name',
        'Claimed Amount (INR)',
        'UTR / Transaction Reference',
        'Status',
        'Verified Amount (INR)',
        'Verified By',
        'Verified At',
        'Rejection Reason',
        'Submitted At',
      ];

      const rows = claims.map(c => [
        escapeCsv(c.id),
        escapeCsv(c.team_id),
        escapeCsv(c.team_name),
        escapeCsv(c.leader_name),
        escapeCsv(c.claimed_amount),
        escapeCsv(c.utr_reference),
        escapeCsv(c.status),
        escapeCsv(c.verified_amount || ''),
        escapeCsv(c.verified_by || ''),
        escapeCsv(c.verified_at || ''),
        escapeCsv(c.rejection_reason || ''),
        escapeCsv(c.created_at),
      ].join(','));

      csvContent = [headers.join(','), ...rows].join('\n');
    } else if (type === 'submissions') {
      const subs = getAllSubmissions();
      const headers = [
        'Submission ID',
        'Team ID',
        'Team Name',
        'Project Name',
        'Problem Statement',
        'Real World Problem Solved',
        'AI Feature Description',
        'Technologies Used',
        'Repository URL',
        'Live Demo URL',
        'Is Late Submission',
        'Submitted At',
      ];

      const rows = subs.map(s => [
        escapeCsv(s.id),
        escapeCsv(s.team_id),
        escapeCsv(s.team_name),
        escapeCsv(s.project_name),
        escapeCsv(s.problem_statement_chosen),
        escapeCsv(s.real_world_problem),
        escapeCsv(s.ai_feature_description),
        escapeCsv(s.technologies_used),
        escapeCsv(s.repo_url),
        escapeCsv(s.live_demo_url || ''),
        escapeCsv(s.is_late === 1 ? 'YES' : 'NO'),
        escapeCsv(s.submitted_at),
      ].join(','));

      csvContent = [headers.join(','), ...rows].join('\n');
    } else if (type === 'attendance') {
      const db = getDb();
      const logs = db.prepare(`
        SELECT al.*, t.team_name, t.leader_name, t.college_name
        FROM attendance_logs al
        JOIN teams t ON al.team_id = t.id
        ORDER BY al.check_in_time ASC
      `).all() as any[];

      const headers = ['Log ID', 'Team ID', 'Team Name', 'College', 'Leader', 'Status', 'Marked By', 'Remarks', 'Check-In Time'];
      const rows = logs.map(l => [
        escapeCsv(l.id),
        escapeCsv(l.team_id),
        escapeCsv(l.team_name),
        escapeCsv(l.college_name),
        escapeCsv(l.leader_name),
        escapeCsv(l.status),
        escapeCsv(l.marked_by),
        escapeCsv(l.remarks || ''),
        escapeCsv(l.check_in_time),
      ].join(','));

      csvContent = [headers.join(','), ...rows].join('\n');
    } else {
      const stats = await getDashboardStatsAsync();
      csvContent = [
        'Metric,Count / Value',
        `Total Registered Teams,${stats.totalTeams}`,
        `Total Registered Students,${stats.totalStudents}`,
        `Confirmed (Paid) Teams,${stats.confirmedTeams}`,
        `Pending Payment Claims,${stats.pendingPayments}`,
        `Rejected Payment Claims,${stats.rejectedPayments}`,
        `Teams Checked In,${stats.teamsCheckedIn}`,
        `Projects Submitted,${stats.projectsSubmitted}`,
        `Total Verified Collection (INR),₹${stats.totalVerifiedCollection}`,
      ].join('\n');
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to generate CSV export' }, { status: 500 });
  }
}
