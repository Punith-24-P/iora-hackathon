import { NextRequest, NextResponse } from 'next/server';
import { submitProjectAsync, getTeamByIdAsync, getSettingsAsync } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      teamId,
      accessToken,
      projectName,
      problemStatementChosen,
      projectDescription,
      realWorldProblem,
      aiFeatureDescription,
      technologiesUsed,
      repoUrl,
      liveDemoUrl,
      supportingDocUrl,
    } = body;

    if (!teamId || !accessToken) {
      return NextResponse.json({ error: 'Team ID and Access Token are required.' }, { status: 400 });
    }

    if (!projectName || !problemStatementChosen || !projectDescription || !aiFeatureDescription || !repoUrl) {
      return NextResponse.json({
        error: 'Project name, problem statement, description, AI feature details, and repository URL are required.',
      }, { status: 400 });
    }

    // Validate repository URL
    try {
      new URL(repoUrl);
    } catch {
      return NextResponse.json({ error: 'Please enter a valid Source Code Repository URL (e.g., GitHub, GitLab).' }, { status: 400 });
    }

    const team = await getTeamByIdAsync(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    if (team.access_token !== accessToken) {
      return NextResponse.json({ error: 'Invalid team access token.' }, { status: 403 });
    }

    if (team.registration_status !== 'CONFIRMED') {
      return NextResponse.json({
        error: 'Your registration must be confirmed and verified before you can submit your project.',
      }, { status: 403 });
    }

    // Verify deadline server-side
    const settings = await getSettingsAsync();
    const deadlineString = `${settings.event_date}T${settings.submission_deadline}:00+05:30`;
    const deadlineTime = new Date(deadlineString).getTime();
    const nowTime = Date.now();

    if (nowTime > deadlineTime) {
      // In hackathons, we still record with is_late = 1 or reject if strictly closed
      // Let's record as late submission with warning
    }

    const submission = await submitProjectAsync({
      teamId,
      accessToken,
      projectName,
      problemStatementChosen,
      projectDescription,
      realWorldProblem,
      aiFeatureDescription,
      technologiesUsed,
      repoUrl,
      liveDemoUrl,
      supportingDocUrl,
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      isLate: submission.is_late === 1,
      message: submission.is_late === 1
        ? 'Project submitted (recorded as LATE submission after 3:00 PM IST).'
        : 'Project submitted successfully before the 3:00 PM IST deadline!',
    });
  } catch (error: any) {
    console.error('Project submission error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit project.' }, { status: 400 });
  }
}
