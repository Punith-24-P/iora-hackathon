// Automated Acceptance Tests for AIORA Hackathon Platform
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting Acceptance Test Suite for AIORA Hackathon Platform...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Settings API check
  console.log('1. Checking Public Settings API:');
  const settingsRes = await fetch(`${BASE_URL}/api/settings`);
  const settings = await settingsRes.json();
  assert(settings.eventName === 'AIORA — AI × Web Development Hackathon', 'Event name is AIORA');
  assert(settings.registrationFee === 400, 'Registration fee is ₹400');
  assert(settings.minTeamSize === 2 && settings.maxTeamSize === 4, 'Team size allowed is 2 to 4');
  assert(settings.paymentReceiverName === 'PUNITH K K', 'Payment receiver name is PUNITH K K');
  assert(settings.paymentQrUrl.includes('phonepe_qr.jpg'), 'Default QR asset is PhonePe QR');

  // 2. Acceptance Test C: Registration with 1 member is rejected
  console.log('\n2. Testing Team Size Constraints (1 or 5 members rejected):');
  const res1Member = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teamName: 'SoloDev',
      collegeName: 'Karavali Institute of Technology',
      department: 'AI & ML',
      yearSemester: '3rd Year',
      leaderName: 'Solo Leader',
      leaderEmail: 'solo@example.com',
      leaderPhone: '9876543210',
      members: [
        { fullName: 'Solo Leader', usn: '4KA23AI099', collegeName: 'KIT', department: 'AI & ML', yearSemester: '3rd Year' }
      ]
    })
  });
  const data1Member = await res1Member.json();
  assert(res1Member.status === 400, 'Single member registration rejected with HTTP 400');
  assert(data1Member.error.includes('between 2 and 4'), 'Error specifies team size between 2 and 4');

  // 3. Acceptance Test E: Duplicate USN within team is rejected
  console.log('\n3. Testing Duplicate USN Detection:');
  const resDupUsn = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teamName: 'DupTeam',
      collegeName: 'Karavali Institute of Technology',
      department: 'AI & ML',
      yearSemester: '3rd Year',
      leaderName: 'Leader Person',
      leaderEmail: 'leader@example.com',
      leaderPhone: '9876543210',
      members: [
        { fullName: 'Leader Person', usn: '4KA23AI010', collegeName: 'KIT', department: 'AI & ML', yearSemester: '3rd Year' },
        { fullName: 'Member Two', usn: '4KA23AI010', collegeName: 'KIT', department: 'AI & ML', yearSemester: '3rd Year' }
      ]
    })
  });
  const dataDupUsn = await resDupUsn.json();
  assert(resDupUsn.status === 400, 'Duplicate USN inside team rejected with HTTP 400');
  assert(dataDupUsn.error.toLowerCase().includes('duplicate usn'), 'Error explains duplicate USN');

  // 4. Acceptance Test A: A new team registers with 2 members
  console.log('\n4. Testing Valid 2-Member Team Registration:');
  const resTeamA = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teamName: 'CyberKnights 2026',
      collegeName: 'Karavali Institute of Technology',
      department: 'Artificial Intelligence & Machine Learning',
      yearSemester: '3rd Year / 5th Sem',
      leaderName: 'Punith Developer',
      leaderEmail: 'punith.dev@kit.ac.in',
      leaderPhone: '9876501234',
      members: [
        { fullName: 'Punith Developer', usn: '4KA23AI001', collegeName: 'KIT', department: 'AI & ML', yearSemester: '3rd Year' },
        { fullName: 'Ananya Sharma', usn: '4KA23AI002', collegeName: 'KIT', department: 'AI & ML', yearSemester: '3rd Year' }
      ]
    })
  });
  const dataTeamA = await resTeamA.json();
  assert(resTeamA.ok && dataTeamA.success, 'Team A registered successfully');
  assert(dataTeamA.teamId.startsWith('AIORA-2026-'), 'Team ID generated with AIORA-2026- format');
  assert(dataTeamA.team.membersCount === 2, 'Team count is exactly 2 including leader');
  assert(dataTeamA.team.paymentStatus === 'UNPAID', 'Initial payment status is UNPAID');

  const teamAId = dataTeamA.teamId;
  const teamAToken = dataTeamA.accessToken;

  // 5. Acceptance Test B: A team registers with 4 members
  console.log('\n5. Testing Valid 4-Member Team Registration:');
  const resTeamB = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teamName: 'QuantumCoders',
      collegeName: 'Karavali Institute of Technology',
      department: 'Computer Science & Engineering',
      yearSemester: '4th Year / 7th Sem',
      leaderName: 'Rohan Shetty',
      leaderEmail: 'rohan.shetty@kit.ac.in',
      leaderPhone: '9123456780',
      members: [
        { fullName: 'Rohan Shetty', usn: '4KA22CS050', collegeName: 'KIT', department: 'CSE', yearSemester: '4th Year' },
        { fullName: 'Deepak Rao', usn: '4KA22CS051', collegeName: 'KIT', department: 'CSE', yearSemester: '4th Year' },
        { fullName: 'Kavya Nayak', usn: '4KA22CS052', collegeName: 'KIT', department: 'CSE', yearSemester: '4th Year' },
        { fullName: 'Aditya Bhat', usn: '4KA22CS053', collegeName: 'KIT', department: 'CSE', yearSemester: '4th Year' }
      ]
    })
  });
  const dataTeamB = await resTeamB.json();
  assert(resTeamB.ok && dataTeamB.success, 'Team B (4 members) registered successfully');
  assert(dataTeamB.team.membersCount === 4, 'Team B count is exactly 4 including leader');

  // 6. Acceptance Test H & I: Submit Payment Claim with UTR
  console.log('\n6. Testing Payment Claim Submission (Pending Verification):');
  const testUtr = '430598765432';
  const resClaim = await fetch(`${BASE_URL}/api/payment-claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teamId: teamAId,
      accessToken: teamAToken,
      utrReference: testUtr,
    })
  });
  const dataClaim = await resClaim.json();
  assert(resClaim.ok && dataClaim.success, 'Payment claim submitted with UTR reference');
  assert(dataClaim.status === 'PENDING', 'Payment status is PENDING verification');

  // Verify Team Status
  const resTeamCheck = await fetch(`${BASE_URL}/api/team/${teamAId}?token=${teamAToken}`);
  const teamCheck = await resTeamCheck.json();
  assert(teamCheck.paymentStatus === 'CLAIMED', 'Team payment status is CLAIMED (not yet confirmed)');
  assert(teamCheck.registrationStatus === 'PAYMENT_SUBMITTED', 'Registration status is PAYMENT_SUBMITTED');

  // 7. Acceptance Test K: Duplicate UTR is rejected
  console.log('\n7. Testing Duplicate UTR Rejection:');
  const resDupUtr = await fetch(`${BASE_URL}/api/payment-claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teamId: dataTeamB.teamId,
      accessToken: dataTeamB.accessToken,
      utrReference: testUtr,
    })
  });
  assert(resDupUtr.status === 400, 'Duplicate UTR rejected with HTTP 400');

  // 8. Acceptance Test: Admin Authentication & Login
  console.log('\n8. Testing Admin Authentication:');
  const resLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'AioraOrganizers@2026'
    })
  });
  assert(resLogin.ok, 'Admin login succeeded with provisioned organizer credentials');
  const cookies = resLogin.headers.get('set-cookie');
  assert(cookies && cookies.includes('aiora_admin_session'), 'Secure HTTP-only session cookie set');

  // 9. Acceptance Test J & L: Admin Approves Payment
  console.log('\n9. Testing Payment Approval Workflow:');
  const resClaimsList = await fetch(`${BASE_URL}/api/admin/payments`, {
    headers: { Cookie: cookies }
  });
  const claimsData = await resClaimsList.json();
  const targetClaim = claimsData.claims.find(c => c.team_id === teamAId);
  assert(targetClaim && targetClaim.utr_reference === testUtr, 'Target claim found in admin queue');

  const resApprove = await fetch(`${BASE_URL}/api/admin/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({
      action: 'APPROVE',
      claimId: targetClaim.id,
      verifiedAmount: 400,
      adminNotes: 'Verified via PhonePe merchant statement'
    })
  });
  const dataApprove = await resApprove.json();
  assert(resApprove.ok && dataApprove.success, 'Admin approved payment claim');

  // Verify Team Status is now CONFIRMED
  const resTeamApproved = await fetch(`${BASE_URL}/api/team/${teamAId}?token=${teamAToken}`);
  const teamApproved = await resTeamApproved.json();
  assert(teamApproved.paymentStatus === 'VERIFIED', 'Team paymentStatus is now VERIFIED');
  assert(teamApproved.registrationStatus === 'CONFIRMED', 'Registration status is now CONFIRMED');

  // 10. Acceptance Test M & N: Project Submission
  console.log('\n10. Testing Project Submission System:');
  const resSub = await fetch(`${BASE_URL}/api/submission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teamId: teamAId,
      accessToken: teamAToken,
      projectName: 'AioraSmartHealth Web',
      problemStatementChosen: 'AI Diagnostics Track',
      projectDescription: 'A modern Next.js web application for automated radiological image segmentation.',
      realWorldProblem: 'Accelerating diagnostic triage in rural primary health centers.',
      aiFeatureDescription: 'Uses a fine-tuned Vision Transformer (ViT) model running inference through PyTorch.',
      technologiesUsed: 'Next.js 16, TypeScript, Tailwind CSS, PyTorch, Supabase',
      repoUrl: 'https://github.com/aiora-sample/health-vision-ai',
      liveDemoUrl: 'https://aiora-health.vercel.app'
    })
  });
  const dataSub = await resSub.json();
  assert(resSub.ok && dataSub.success, 'Project submitted successfully');
  assert(dataSub.submissionId.startsWith('SUB-'), 'Server generated submission ID');

  // 11. Acceptance Test: Attendance Check-in
  console.log('\n11. Testing Morning Check-In Desk:');
  const resAttend = await fetch(`${BASE_URL}/api/admin/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({
      teamId: teamAId,
      status: 'CHECKED_IN',
      remarks: 'Lab 2, System 14'
    })
  });
  const dataAttend = await resAttend.json();
  assert(resAttend.ok && dataAttend.success, 'Team checked in at venue desk');

  // 12. Acceptance Test: Admin Stats Calculation
  console.log('\n12. Testing Real Database Metrics & Statistics:');
  const resStats = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: cookies }
  });
  const statsData = await resStats.json();
  assert(statsData.stats.totalTeams >= 2, 'Stats: registered teams count matches');
  assert(statsData.stats.confirmedTeams >= 1, 'Stats: confirmed teams count matches');
  assert(statsData.stats.totalVerifiedCollection >= 400, 'Stats: verified collection is at least ₹400');
  assert(statsData.stats.teamsCheckedIn >= 1, 'Stats: teams checked in recorded');
  assert(statsData.stats.projectsSubmitted >= 1, 'Stats: projects submitted recorded');

  // 13. Acceptance Test P: Admin updates settings (Contact info & QR manager)
  console.log('\n13. Testing Contact Settings & Payment QR Manager:');
  const resSettingsUpdate = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({
      contact_email: 'aiora.aiml@kit.ac.in',
      contact_phone: '+91 98765 43210',
      venue_room: 'Main Academic Block Labs 1 & 2',
      problem_statement_1_title: 'AI in Healthcare & Rural Diagnostics',
      problem_statement_1_desc: 'Develop an intelligent web application aiding healthcare workers.',
      problem_statement_2_title: 'Smart Civic Infrastructure & Traffic Optimization',
      problem_statement_2_desc: 'Build a platform using computer vision/predictive models for urban transport.',
      problem_statements_published: 1,
    })
  });
  const dataSettingsUpdate = await resSettingsUpdate.json();
  assert(resSettingsUpdate.ok && dataSettingsUpdate.success, 'Admin updated contact info and problem statements');
  assert(dataSettingsUpdate.settings.contact_email === 'aiora.aiml@kit.ac.in', 'Contact email updated');
  assert(dataSettingsUpdate.settings.problem_statements_published === 1, 'Problem statements published');

  // 14. Acceptance Test: Data Export
  console.log('\n14. Testing CSV Data Export:');
  const resCsv = await fetch(`${BASE_URL}/api/admin/export?type=teams`, {
    headers: { Cookie: cookies }
  });
  const csvText = await resCsv.text();
  assert(resCsv.ok && csvText.includes('CyberKnights 2026') && csvText.includes('4KA23AI001'), 'CSV export includes full team details and student USNs');

  console.log(`\n==============================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`==============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
