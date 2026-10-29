import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = getSettings();
    // Return sanitized public event settings
    return NextResponse.json({
      eventName: settings.event_name,
      tagline: settings.tagline,
      organizingForum: settings.organizing_forum,
      organizingInstitution: settings.organizing_institution,
      organizingDepartment: settings.organizing_department,
      eventDate: settings.event_date,
      arrivalStart: settings.arrival_start,
      arrivalDeadline: settings.arrival_deadline,
      submissionDeadline: settings.submission_deadline,
      timezone: settings.timezone,
      registrationFee: settings.registration_fee,
      minTeamSize: settings.min_team_size,
      maxTeamSize: settings.max_team_size,
      registrationsOpen: settings.registrations_open === 1,
      paymentQrUrl: settings.payment_qr_url,
      paymentReceiverName: settings.payment_receiver_name,
      paymentUpiId: settings.payment_upi_id,
      contactEmail: settings.contact_email,
      contactPhone: settings.contact_phone,
      instagramUrl: settings.instagram_url,
      venueRoom: settings.venue_room,
      prize1st: settings.prize_1st,
      prize2nd: settings.prize_2nd,
      prize3rd: settings.prize_3rd,
      problemStatementsPublished: settings.problem_statements_published === 1,
      problemStatement1: settings.problem_statements_published === 1 ? {
        title: settings.problem_statement_1_title,
        desc: settings.problem_statement_1_desc,
      } : null,
      problemStatement2: settings.problem_statements_published === 1 ? {
        title: settings.problem_statement_2_title,
        desc: settings.problem_statement_2_desc,
      } : null,
      publicWebsiteUrl: settings.public_website_url,
      usnValidationRegex: settings.usn_validation_regex,
    });
  } catch (error) {
    console.error('Error fetching event settings:', error);
    return NextResponse.json({ error: 'Failed to load event settings' }, { status: 500 });
  }
}
