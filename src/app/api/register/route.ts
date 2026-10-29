import { NextRequest, NextResponse } from 'next/server';
import { registerTeam, getSettings } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      teamName,
      collegeName,
      department,
      yearSemester,
      leaderName,
      leaderEmail,
      leaderPhone,
      members,
    } = body;

    if (!teamName || !collegeName || !department || !yearSemester) {
      return NextResponse.json({ error: 'All institution and team details are required.' }, { status: 400 });
    }

    if (!leaderName || !leaderEmail || !leaderPhone) {
      return NextResponse.json({ error: 'Team leader contact details are required.' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leaderEmail.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address for the team leader.' }, { status: 400 });
    }

    // Mobile number validation (standard 10-digit Indian mobile)
    const phoneClean = leaderPhone.trim().replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number for the team leader.' }, { status: 400 });
    }

    if (!Array.isArray(members)) {
      return NextResponse.json({ error: 'Team members list must be an array.' }, { status: 400 });
    }

    const settings = getSettings();
    const minSize = settings.min_team_size || 2;
    const maxSize = settings.max_team_size || 4;

    if (members.length < minSize || members.length > maxSize) {
      return NextResponse.json({
        error: `Team size must be between ${minSize} and ${maxSize} students (including team leader). Current: ${members.length}`,
      }, { status: 400 });
    }

    // Validate USN regex
    let usnRegex: RegExp | null = null;
    try {
      if (settings.usn_validation_regex) {
        usnRegex = new RegExp(settings.usn_validation_regex, 'i');
      }
    } catch {
      usnRegex = null;
    }

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName || !m.fullName.trim()) {
        return NextResponse.json({ error: `Full name is required for member #${i + 1}.` }, { status: 400 });
      }
      if (!m.usn || !m.usn.trim()) {
        return NextResponse.json({ error: `USN is required for ${m.fullName || `member #${i + 1}`}.` }, { status: 400 });
      }
      if (usnRegex && !usnRegex.test(m.usn.trim())) {
        return NextResponse.json({
          error: `The USN "${m.usn.trim()}" does not match the standard seat number format. Please verify your University Seat Number.`,
        }, { status: 400 });
      }
    }

    const result = registerTeam({
      teamName,
      collegeName,
      department,
      yearSemester,
      leaderName,
      leaderEmail,
      leaderPhone,
      members,
    });

    return NextResponse.json({
      success: true,
      teamId: result.team.id,
      accessToken: result.accessToken,
      team: {
        id: result.team.id,
        teamName: result.team.team_name,
        leaderName: result.team.leader_name,
        leaderEmail: result.team.leader_email,
        registrationStatus: result.team.registration_status,
        paymentStatus: result.team.payment_status,
        membersCount: result.team.members?.length || members.length,
      },
      message: 'Team registered successfully! Please proceed to complete payment verification.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during registration.' }, { status: 400 });
  }
}
