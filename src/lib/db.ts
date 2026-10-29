import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {
  EventSettings,
  Team,
  TeamMember,
  PaymentClaim,
  ProjectSubmission,
  AttendanceLog,
  AuditLog,
  AdminUser,
  DashboardStats,
  RegistrationWindowStatus,
} from './types';
import { hashPassword } from './auth';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'aiora.db');
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db: Database.Database) {
  // 1. Event Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_settings (
      id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      organizing_forum TEXT NOT NULL,
      organizing_institution TEXT NOT NULL,
      organizing_department TEXT NOT NULL,
      event_date TEXT NOT NULL,
      arrival_start TEXT NOT NULL,
      arrival_deadline TEXT NOT NULL,
      submission_deadline TEXT NOT NULL,
      timezone TEXT NOT NULL,
      registration_fee REAL NOT NULL,
      min_team_size INTEGER NOT NULL,
      max_team_size INTEGER NOT NULL,
      registrations_open INTEGER NOT NULL DEFAULT 1,
      max_student_capacity INTEGER NOT NULL DEFAULT 500,
      registration_window_hours INTEGER NOT NULL DEFAULT 96,
      registration_start_time TEXT NOT NULL DEFAULT '',
      registration_end_time TEXT NOT NULL DEFAULT '',
      payment_qr_url TEXT NOT NULL,
      payment_receiver_name TEXT NOT NULL,
      payment_upi_id TEXT NOT NULL,
      contact_email TEXT NOT NULL DEFAULT '',
      contact_phone TEXT NOT NULL DEFAULT '',
      instagram_url TEXT NOT NULL DEFAULT '',
      venue_room TEXT NOT NULL DEFAULT '',
      prize_1st TEXT NOT NULL DEFAULT 'To be announced',
      prize_2nd TEXT NOT NULL DEFAULT 'To be announced',
      prize_3rd TEXT NOT NULL DEFAULT 'To be announced',
      problem_statement_1_title TEXT NOT NULL DEFAULT '',
      problem_statement_1_desc TEXT NOT NULL DEFAULT '',
      problem_statement_2_title TEXT NOT NULL DEFAULT '',
      problem_statement_2_desc TEXT NOT NULL DEFAULT '',
      problem_statements_published INTEGER NOT NULL DEFAULT 0,
      public_website_url TEXT NOT NULL DEFAULT 'http://localhost:3000',
      usn_validation_regex TEXT NOT NULL DEFAULT '^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$|^[A-Za-z0-9_-]{5,15}$',
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Teams
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      team_name TEXT UNIQUE NOT NULL,
      college_name TEXT NOT NULL,
      department TEXT NOT NULL,
      year_semester TEXT NOT NULL,
      leader_name TEXT NOT NULL,
      leader_email TEXT NOT NULL,
      leader_phone TEXT NOT NULL,
      access_token TEXT NOT NULL,
      registration_status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
      payment_status TEXT NOT NULL DEFAULT 'UNPAID',
      attendance_status TEXT NOT NULL DEFAULT 'NOT_ARRIVED',
      submission_status TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
      disqualification_reason TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 3. Team Members
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      usn TEXT NOT NULL,
      college_name TEXT NOT NULL,
      department TEXT NOT NULL,
      year_semester TEXT NOT NULL,
      is_leader INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_team_members_usn ON team_members(usn);
    CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
  `);

  // 4. Payment Claims
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_claims (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      claimed_amount REAL NOT NULL,
      utr_reference TEXT UNIQUE NOT NULL,
      screenshot_url TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      verified_amount REAL,
      rejection_reason TEXT,
      verified_by TEXT,
      verified_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_payment_claims_utr ON payment_claims(utr_reference);
  `);

  // 5. Project Submissions
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_submissions (
      id TEXT PRIMARY KEY,
      team_id TEXT UNIQUE NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      project_name TEXT NOT NULL,
      problem_statement_chosen TEXT NOT NULL,
      project_description TEXT NOT NULL,
      real_world_problem TEXT NOT NULL,
      ai_feature_description TEXT NOT NULL,
      technologies_used TEXT NOT NULL,
      repo_url TEXT NOT NULL,
      live_demo_url TEXT,
      supporting_doc_url TEXT,
      submitted_at TEXT NOT NULL,
      is_late INTEGER NOT NULL DEFAULT 0
    );
  `);

  // 6. Attendance Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      check_in_time TEXT NOT NULL,
      status TEXT NOT NULL,
      marked_by TEXT NOT NULL,
      remarks TEXT
    );
  `);

  // 7. Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL
    );
  `);

  // 8. Admin Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
      created_at TEXT NOT NULL
    );
  `);

  // Seed default Event Settings if not exists
  const existingSettings = db.prepare('SELECT id FROM event_settings WHERE id = ?').get('default');
  if (!existingSettings) {
    db.prepare(`
      INSERT INTO event_settings (
        id, event_name, tagline, organizing_forum, organizing_institution, organizing_department,
        event_date, arrival_start, arrival_deadline, submission_deadline, timezone,
        registration_fee, min_team_size, max_team_size, registrations_open,
        payment_qr_url, payment_receiver_name, payment_upi_id,
        contact_email, contact_phone, instagram_url, venue_room,
        prize_1st, prize_2nd, prize_3rd,
        problem_statement_1_title, problem_statement_1_desc,
        problem_statement_2_title, problem_statement_2_desc,
        problem_statements_published, public_website_url, usn_validation_regex, updated_at
      ) VALUES (
        'default',
        'AIORA — AI × Web Development Hackathon',
        'Imagine. Build. Deploy.',
        'AIORA',
        'Karavali Institute of Technology, Mangaluru, Karnataka, India',
        'Department of Artificial Intelligence and Machine Learning (AI & ML)',
        '2026-11-05',
        '09:00',
        '09:30',
        '15:00',
        'Asia/Kolkata',
        400.00,
        2,
        4,
        1,
        '/assets/phonepe_qr.jpg',
        'PUNITH K K',
        'PhonePe Accepted Here',
        '',
        '',
        'https://instagram.com/aiora_official',
        'To be announced',
        'To be announced',
        'To be announced',
        'To be announced',
        '',
        '',
        '',
        '',
        0,
        'http://localhost:3000',
        '^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$|^[A-Za-z0-9_-]{5,15}$',
        datetime('now')
      )
    `).run();
  }

  // Seed default Admin User if none exists
  const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'AioraOrganizers@2026';
    const pwdHash = hashPassword(defaultPassword);
    db.prepare(`
      INSERT INTO admin_users (id, username, password_hash, full_name, role, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run('admin-root', 'admin', pwdHash, 'AIORA Chief Organizer', 'SUPER_ADMIN');
  }

  // Auto-migrations for 500-student capacity and 96-hour registration window
  try { db.exec(`ALTER TABLE event_settings ADD COLUMN max_student_capacity INTEGER NOT NULL DEFAULT 500`); } catch {}
  try { db.exec(`ALTER TABLE event_settings ADD COLUMN registration_window_hours INTEGER NOT NULL DEFAULT 96`); } catch {}
  try { db.exec(`ALTER TABLE event_settings ADD COLUMN registration_start_time TEXT NOT NULL DEFAULT ''`); } catch {}
  try { db.exec(`ALTER TABLE event_settings ADD COLUMN registration_end_time TEXT NOT NULL DEFAULT ''`); } catch {}
}

// ----------------- Helper Functions & Database Operations -----------------

export function getSettings(): EventSettings {
  const db = getDb();
  const row = db.prepare('SELECT * FROM event_settings WHERE id = ?').get('default') as EventSettings;
  return row;
}

export function updateSettings(settings: Partial<EventSettings>, performedBy: string): EventSettings {
  const db = getDb();
  const current = getSettings();
  const updated: EventSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  const stmt = db.prepare(`
    UPDATE event_settings SET
      event_name = @event_name,
      tagline = @tagline,
      organizing_forum = @organizing_forum,
      organizing_institution = @organizing_institution,
      organizing_department = @organizing_department,
      event_date = @event_date,
      arrival_start = @arrival_start,
      arrival_deadline = @arrival_deadline,
      submission_deadline = @submission_deadline,
      timezone = @timezone,
      registration_fee = @registration_fee,
      min_team_size = @min_team_size,
      max_team_size = @max_team_size,
      registrations_open = @registrations_open,
      max_student_capacity = @max_student_capacity,
      registration_window_hours = @registration_window_hours,
      registration_start_time = @registration_start_time,
      registration_end_time = @registration_end_time,
      payment_qr_url = @payment_qr_url,
      payment_receiver_name = @payment_receiver_name,
      payment_upi_id = @payment_upi_id,
      contact_email = @contact_email,
      contact_phone = @contact_phone,
      instagram_url = @instagram_url,
      venue_room = @venue_room,
      prize_1st = @prize_1st,
      prize_2nd = @prize_2nd,
      prize_3rd = @prize_3rd,
      problem_statement_1_title = @problem_statement_1_title,
      problem_statement_1_desc = @problem_statement_1_desc,
      problem_statement_2_title = @problem_statement_2_title,
      problem_statement_2_desc = @problem_statement_2_desc,
      problem_statements_published = @problem_statements_published,
      public_website_url = @public_website_url,
      usn_validation_regex = @usn_validation_regex,
      updated_at = @updated_at
    WHERE id = 'default'
  `);

  stmt.run(updated);

  addAuditLog({
    action: 'UPDATE_SETTINGS',
    entity_type: 'EVENT_SETTINGS',
    entity_id: 'default',
    performed_by: performedBy,
    details: `Updated event settings (QR: ${updated.payment_qr_url}, Fee: ₹${updated.registration_fee})`,
  });

  return updated;
}

// Register Team (Atomic Transaction)
export interface RegisterTeamInput {
  teamName: string;
  collegeName: string;
  department: string;
  yearSemester: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: {
    fullName: string;
    usn: string;
    collegeName: string;
    department: string;
    yearSemester: string;
  }[];
}

export function registerTeam(input: RegisterTeamInput): { team: Team; accessToken: string } {
  const db = getDb();
  const settings = getSettings();

  if (settings.registrations_open !== 1) {
    throw new Error('Registrations are currently closed by the organizers.');
  }

  // Enforce 96-hour window in Asia/Kolkata
  const nowTime = new Date();
  const nowMs = nowTime.getTime();

  if (settings.registration_start_time) {
    const startMs = new Date(settings.registration_start_time).getTime();
    if (nowMs < startMs) {
      const startStr = new Date(settings.registration_start_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
      throw new Error(`Registrations have not opened yet. The registration window opens on ${startStr} IST.`);
    }
  }

  if (settings.registration_end_time) {
    const endMs = new Date(settings.registration_end_time).getTime();
    if (nowMs > endMs) {
      const endStr = new Date(settings.registration_end_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
      throw new Error(`The 96-hour registration window closed on ${endStr} IST. New team registrations are closed.`);
    }
  }

  // Validate team size (must include leader + other members = total)
  // Input members array contains all members including the leader or additional members
  // Let's ensure the leader is represented as member #1
  const leaderUsnClean = input.members[0]?.usn?.trim().toUpperCase();
  if (!leaderUsnClean) {
    throw new Error('Team leader USN is required.');
  }

  const totalMembers = input.members.length;
  if (totalMembers < settings.min_team_size || totalMembers > settings.max_team_size) {
    throw new Error(`Team size must be between ${settings.min_team_size} and ${settings.max_team_size} students.`);
  }

  // Check unique USNs within the team
  const usnSet = new Set<string>();
  for (const m of input.members) {
    const cleanUsn = m.usn.trim().toUpperCase();
    if (!cleanUsn) {
      throw new Error(`Every student must provide a valid USN. Missing USN for ${m.fullName}`);
    }
    if (usnSet.has(cleanUsn)) {
      throw new Error(`Duplicate USN detected within team: ${cleanUsn}`);
    }
    usnSet.add(cleanUsn);
  }

  // Check if team name already exists
  const existingTeam = db.prepare('SELECT id FROM teams WHERE LOWER(team_name) = LOWER(?)').get(input.teamName.trim());
  if (existingTeam) {
    throw new Error(`A team with the name "${input.teamName.trim()}" is already registered. Please choose a different team name.`);
  }

  // Check if any USN is already registered in a confirmed team
  for (const cleanUsn of usnSet) {
    const existingMember = db.prepare(`
      SELECT tm.usn, t.team_name, t.registration_status
      FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE UPPER(tm.usn) = ? AND t.registration_status IN ('CONFIRMED', 'PAYMENT_SUBMITTED')
    `).get(cleanUsn) as { usn: string; team_name: string; registration_status: string } | undefined;

    if (existingMember) {
      throw new Error(`The USN "${cleanUsn}" is already registered under another active team. Each student may only participate in one team.`);
    }
  }

  // Generate unique team ID (e.g. AIORA-2026-A1B2)
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  const teamId = `AIORA-2026-${randomSuffix}`;
  const accessToken = crypto.randomBytes(16).toString('hex');
  const now = new Date().toISOString();

  const insertTransaction = db.transaction(() => {
    // 500-Student Maximum Event Capacity Check (Atomic within transaction)
    const capacityLimit = settings.max_student_capacity || 500;
    const currentStudentsRow = db.prepare(`
      SELECT COUNT(*) as count
      FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE t.registration_status != 'DISQUALIFIED'
    `).get() as { count: number };

    const currentCount = currentStudentsRow?.count || 0;
    const incomingCount = input.members.length;

    if (currentCount + incomingCount > capacityLimit) {
      const remaining = Math.max(0, capacityLimit - currentCount);
      if (remaining === 0) {
        throw new Error(`Registration capacity reached: The maximum limit of ${capacityLimit} students has been reached.`);
      }
      throw new Error(`Registration capacity exceeded: Only ${remaining} student spots remain, but your team has ${incomingCount} members.`);
    }

    // Insert Team
    db.prepare(`
      INSERT INTO teams (
        id, team_name, college_name, department, year_semester,
        leader_name, leader_email, leader_phone, access_token,
        registration_status, payment_status, attendance_status, submission_status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_PAYMENT', 'UNPAID', 'NOT_ARRIVED', 'NOT_SUBMITTED', ?, ?)
    `).run(
      teamId,
      input.teamName.trim(),
      input.collegeName.trim(),
      input.department.trim(),
      input.yearSemester.trim(),
      input.leaderName.trim(),
      input.leaderEmail.trim().toLowerCase(),
      input.leaderPhone.trim(),
      accessToken,
      now,
      now
    );

    // Insert Team Members
    const insertMemberStmt = db.prepare(`
      INSERT INTO team_members (
        id, team_id, full_name, usn, college_name, department, year_semester, is_leader, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    input.members.forEach((member, index) => {
      const memberId = `MBR-${crypto.randomBytes(4).toString('hex')}`;
      insertMemberStmt.run(
        memberId,
        teamId,
        member.fullName.trim(),
        member.usn.trim().toUpperCase(),
        member.collegeName.trim() || input.collegeName.trim(),
        member.department.trim() || input.department.trim(),
        member.yearSemester.trim() || input.yearSemester.trim(),
        index === 0 ? 1 : 0, // first member is leader
        now
      );
    });

    addAuditLog({
      action: 'TEAM_REGISTERED',
      entity_type: 'TEAM',
      entity_id: teamId,
      performed_by: input.leaderEmail.trim().toLowerCase(),
      details: `Team "${input.teamName.trim()}" registered with ${input.members.length} members by ${input.leaderName.trim()}`,
    });
  });

  insertTransaction();

  const registeredTeam = getTeamById(teamId)!;
  return { team: registeredTeam, accessToken };
}

// Payment Claims
export function submitPaymentClaim(params: {
  teamId: string;
  utrReference: string;
  claimedAmount: number;
  screenshotUrl?: string | null;
}): PaymentClaim {
  const db = getDb();
  const cleanUtr = params.utrReference.trim().toUpperCase();

  if (!cleanUtr || cleanUtr.length < 6) {
    throw new Error('Please enter a valid UPI transaction reference number (UTR / Ref ID).');
  }

  // Check if UTR is already used in an approved or pending claim
  const existingClaim = db.prepare(`
    SELECT pc.id, pc.utr_reference, t.team_name, pc.status
    FROM payment_claims pc
    JOIN teams t ON pc.team_id = t.id
    WHERE UPPER(pc.utr_reference) = ?
  `).get(cleanUtr) as { id: string; utr_reference: string; team_name: string; status: string } | undefined;

  if (existingClaim) {
    if (existingClaim.status === 'APPROVED') {
      throw new Error(`Transaction reference "${cleanUtr}" has already been used and verified for another team.`);
    } else if (existingClaim.status === 'PENDING') {
      throw new Error(`A payment claim with reference "${cleanUtr}" is already undergoing verification.`);
    }
  }

  const claimId = `PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO payment_claims (
        id, team_id, claimed_amount, utr_reference, screenshot_url, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
    `).run(claimId, params.teamId, params.claimedAmount, cleanUtr, params.screenshotUrl || null, now);

    db.prepare(`
      UPDATE teams SET
        payment_status = 'CLAIMED',
        registration_status = 'PAYMENT_SUBMITTED',
        updated_at = ?
      WHERE id = ?
    `).run(now, params.teamId);

    addAuditLog({
      action: 'PAYMENT_CLAIM_SUBMITTED',
      entity_type: 'PAYMENT_CLAIM',
      entity_id: claimId,
      performed_by: params.teamId,
      details: `Submitted UTR ${cleanUtr} for ₹${params.claimedAmount}`,
    });
  });

  transaction();

  const claim = db.prepare('SELECT * FROM payment_claims WHERE id = ?').get(claimId) as PaymentClaim;
  return claim;
}

// Approve Payment
export function approvePayment(params: {
  claimId: string;
  verifiedAmount: number;
  verifiedBy: string;
  adminNotes?: string;
}): void {
  const db = getDb();
  const claim = db.prepare('SELECT * FROM payment_claims WHERE id = ?').get(params.claimId) as PaymentClaim | undefined;
  if (!claim) {
    throw new Error('Payment claim not found.');
  }

  const now = new Date().toISOString();
  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE payment_claims SET
        status = 'APPROVED',
        verified_amount = ?,
        verified_by = ?,
        verified_at = ?
      WHERE id = ?
    `).run(params.verifiedAmount, params.verifiedBy, now, params.claimId);

    db.prepare(`
      UPDATE teams SET
        payment_status = 'VERIFIED',
        registration_status = 'CONFIRMED',
        admin_notes = COALESCE(admin_notes, '') || ?,
        updated_at = ?
      WHERE id = ?
    `).run(params.adminNotes ? `\n[Verified by ${params.verifiedBy}: ${params.adminNotes}]` : '', now, claim.team_id);

    addAuditLog({
      action: 'PAYMENT_APPROVED',
      entity_type: 'PAYMENT_CLAIM',
      entity_id: params.claimId,
      performed_by: params.verifiedBy,
      details: `Payment approved for team ${claim.team_id}. Verified Amount: ₹${params.verifiedAmount}, UTR: ${claim.utr_reference}`,
    });
  });

  transaction();
}

// Reject Payment
export function rejectPayment(params: {
  claimId: string;
  rejectionReason: string;
  verifiedBy: string;
}): void {
  const db = getDb();
  const claim = db.prepare('SELECT * FROM payment_claims WHERE id = ?').get(params.claimId) as PaymentClaim | undefined;
  if (!claim) {
    throw new Error('Payment claim not found.');
  }

  const now = new Date().toISOString();
  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE payment_claims SET
        status = 'REJECTED',
        rejection_reason = ?,
        verified_by = ?,
        verified_at = ?
      WHERE id = ?
    `).run(params.rejectionReason, params.verifiedBy, now, params.claimId);

    db.prepare(`
      UPDATE teams SET
        payment_status = 'REJECTED',
        registration_status = 'PENDING_PAYMENT',
        admin_notes = COALESCE(admin_notes, '') || ?,
        updated_at = ?
      WHERE id = ?
    `).run(`\n[Payment Rejected by ${params.verifiedBy}: ${params.rejectionReason}]`, now, claim.team_id);

    addAuditLog({
      action: 'PAYMENT_REJECTED',
      entity_type: 'PAYMENT_CLAIM',
      entity_id: params.claimId,
      performed_by: params.verifiedBy,
      details: `Payment rejected for team ${claim.team_id}. Reason: ${params.rejectionReason}`,
    });
  });

  transaction();
}

// Reverse Payment Approval
export function reversePaymentApproval(params: {
  claimId: string;
  reversalReason: string;
  performedBy: string;
}): void {
  const db = getDb();
  const claim = db.prepare('SELECT * FROM payment_claims WHERE id = ?').get(params.claimId) as PaymentClaim | undefined;
  if (!claim) {
    throw new Error('Payment claim not found.');
  }

  const now = new Date().toISOString();
  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE payment_claims SET
        status = 'REJECTED',
        rejection_reason = ?,
        verified_at = ?
      WHERE id = ?
    `).run(`Reversed by ${params.performedBy}: ${params.reversalReason}`, now, params.claimId);

    db.prepare(`
      UPDATE teams SET
        payment_status = 'UNPAID',
        registration_status = 'PENDING_PAYMENT',
        admin_notes = COALESCE(admin_notes, '') || ?,
        updated_at = ?
      WHERE id = ?
    `).run(`\n[Payment Approval Reversed by ${params.performedBy}: ${params.reversalReason}]`, now, claim.team_id);

    addAuditLog({
      action: 'PAYMENT_APPROVAL_REVERSED',
      entity_type: 'PAYMENT_CLAIM',
      entity_id: params.claimId,
      performed_by: params.performedBy,
      details: `Reversed payment approval for team ${claim.team_id}. Reason: ${params.reversalReason}`,
    });
  });

  transaction();
}

// Attendance
export function markAttendance(params: {
  teamId: string;
  status: 'CHECKED_IN' | 'LATE_ARRIVED' | 'DISQUALIFIED';
  markedBy: string;
  remarks?: string;
}): void {
  const db = getDb();
  const team = db.prepare('SELECT id, team_name FROM teams WHERE id = ?').get(params.teamId) as { id: string; team_name: string } | undefined;
  if (!team) {
    throw new Error('Team not found.');
  }

  const now = new Date().toISOString();
  const logId = `ATT-${crypto.randomBytes(4).toString('hex')}`;

  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO attendance_logs (id, team_id, check_in_time, status, marked_by, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(logId, params.teamId, now, params.status, params.markedBy, params.remarks || null);

    db.prepare(`
      UPDATE teams SET
        attendance_status = ?,
        updated_at = ?
      WHERE id = ?
    `).run(params.status, now, params.teamId);

    addAuditLog({
      action: 'ATTENDANCE_MARKED',
      entity_type: 'TEAM',
      entity_id: params.teamId,
      performed_by: params.markedBy,
      details: `Marked ${params.status} for team "${team.team_name}". Remarks: ${params.remarks || 'None'}`,
    });
  });

  transaction();
}

// Disqualify / Reinstate Team
export function updateTeamDisqualification(params: {
  teamId: string;
  disqualify: boolean;
  reason: string;
  performedBy: string;
}): void {
  const db = getDb();
  const now = new Date().toISOString();

  const newStatus = params.disqualify ? 'DISQUALIFIED' : 'CONFIRMED';
  db.prepare(`
    UPDATE teams SET
      registration_status = ?,
      disqualification_reason = ?,
      updated_at = ?
    WHERE id = ?
  `).run(newStatus, params.disqualify ? params.reason : null, now, params.teamId);

  addAuditLog({
    action: params.disqualify ? 'TEAM_DISQUALIFIED' : 'TEAM_REINSTATED',
    entity_type: 'TEAM',
    entity_id: params.teamId,
    performed_by: params.performedBy,
    details: params.disqualify ? `Disqualified team: ${params.reason}` : 'Reinstated team to confirmed status',
  });
}

// Project Submissions
export function submitProject(params: {
  teamId: string;
  accessToken: string;
  projectName: string;
  problemStatementChosen: string;
  projectDescription: string;
  realWorldProblem: string;
  aiFeatureDescription: string;
  technologiesUsed: string;
  repoUrl: string;
  liveDemoUrl?: string | null;
  supportingDocUrl?: string | null;
}): ProjectSubmission {
  const db = getDb();
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(params.teamId) as Team | undefined;
  if (!team) {
    throw new Error('Team registration not found.');
  }

  if (team.access_token !== params.accessToken) {
    throw new Error('Invalid team access credentials.');
  }

  if (team.registration_status !== 'CONFIRMED') {
    throw new Error('Project submission is only allowed for verified and confirmed teams.');
  }

  // Server-side deadline check (3:00 PM IST on event date)
  const settings = getSettings();
  const deadlineStr = `${settings.event_date}T${settings.submission_deadline}:00+05:30`;
  const deadline = new Date(deadlineStr).getTime();
  const nowTime = Date.now();
  const isLate = nowTime > deadline ? 1 : 0;

  const now = new Date().toISOString();
  const submissionId = `SUB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT OR REPLACE INTO project_submissions (
        id, team_id, project_name, problem_statement_chosen, project_description,
        real_world_problem, ai_feature_description, technologies_used,
        repo_url, live_demo_url, supporting_doc_url, submitted_at, is_late
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      submissionId,
      params.teamId,
      params.projectName.trim(),
      params.problemStatementChosen.trim(),
      params.projectDescription.trim(),
      params.realWorldProblem.trim(),
      params.aiFeatureDescription.trim(),
      params.technologiesUsed.trim(),
      params.repoUrl.trim(),
      params.liveDemoUrl?.trim() || null,
      params.supportingDocUrl?.trim() || null,
      now,
      isLate
    );

    db.prepare(`
      UPDATE teams SET
        submission_status = 'SUBMITTED',
        updated_at = ?
      WHERE id = ?
    `).run(now, params.teamId);

    addAuditLog({
      action: 'PROJECT_SUBMITTED',
      entity_type: 'PROJECT_SUBMISSION',
      entity_id: submissionId,
      performed_by: params.teamId,
      details: `Project "${params.projectName.trim()}" submitted for problem statement "${params.problemStatementChosen}". Is late: ${isLate === 1 ? 'YES' : 'NO'}`,
    });
  });

  transaction();

  const sub = db.prepare('SELECT * FROM project_submissions WHERE id = ?').get(submissionId) as ProjectSubmission;
  return sub;
}

// Queries
export function getTeamById(teamId: string): Team | null {
  const db = getDb();
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId) as Team | undefined;
  if (!team) return null;

  const members = db.prepare('SELECT * FROM team_members WHERE team_id = ? ORDER BY is_leader DESC, created_at ASC').all(teamId) as TeamMember[];
  const paymentClaim = db.prepare('SELECT * FROM payment_claims WHERE team_id = ? ORDER BY created_at DESC LIMIT 1').get(teamId) as PaymentClaim | undefined;
  const submission = db.prepare('SELECT * FROM project_submissions WHERE team_id = ?').get(teamId) as ProjectSubmission | undefined;

  return {
    ...team,
    members,
    payment_claim: paymentClaim,
    submission,
  };
}

export function getAllTeams(filters?: {
  search?: string;
  paymentStatus?: string;
  attendanceStatus?: string;
  submissionStatus?: string;
}): Team[] {
  const db = getDb();
  let query = 'SELECT * FROM teams WHERE 1=1';
  const params: unknown[] = [];

  if (filters?.search) {
    const s = `%${filters.search.toLowerCase()}%`;
    query += ` AND (
      LOWER(id) LIKE ? OR
      LOWER(team_name) LIKE ? OR
      LOWER(leader_name) LIKE ? OR
      LOWER(leader_email) LIKE ? OR
      LOWER(college_name) LIKE ? OR
      id IN (SELECT team_id FROM team_members WHERE LOWER(usn) LIKE ? OR LOWER(full_name) LIKE ?)
    )`;
    params.push(s, s, s, s, s, s, s);
  }

  if (filters?.paymentStatus && filters.paymentStatus !== 'ALL') {
    query += ' AND payment_status = ?';
    params.push(filters.paymentStatus);
  }

  if (filters?.attendanceStatus && filters.attendanceStatus !== 'ALL') {
    query += ' AND attendance_status = ?';
    params.push(filters.attendanceStatus);
  }

  if (filters?.submissionStatus && filters.submissionStatus !== 'ALL') {
    query += ' AND submission_status = ?';
    params.push(filters.submissionStatus);
  }

  query += ' ORDER BY created_at DESC';

  const teams = db.prepare(query).all(...params) as Team[];
  return teams.map(team => {
    const members = db.prepare('SELECT * FROM team_members WHERE team_id = ? ORDER BY is_leader DESC, created_at ASC').all(team.id) as TeamMember[];
    const claim = db.prepare('SELECT * FROM payment_claims WHERE team_id = ? ORDER BY created_at DESC LIMIT 1').get(team.id) as PaymentClaim | undefined;
    const sub = db.prepare('SELECT * FROM project_submissions WHERE team_id = ?').get(team.id) as ProjectSubmission | undefined;
    return {
      ...team,
      members,
      payment_claim: claim,
      submission: sub,
    };
  });
}

export function getAllPaymentClaims(): PaymentClaim[] {
  const db = getDb();
  const claims = db.prepare(`
    SELECT pc.*, t.team_name, t.leader_name, (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
    FROM payment_claims pc
    JOIN teams t ON pc.team_id = t.id
    ORDER BY pc.created_at DESC
  `).all() as PaymentClaim[];
  return claims;
}

export function getAllSubmissions(): ProjectSubmission[] {
  const db = getDb();
  const subs = db.prepare(`
    SELECT ps.*, t.team_name, t.leader_name
    FROM project_submissions ps
    JOIN teams t ON ps.team_id = t.id
    ORDER BY ps.submitted_at DESC
  `).all() as ProjectSubmission[];
  return subs;
}

export function getDashboardStats(): DashboardStats {
  const db = getDb();

  const totalTeams = (db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number }).count;
  const totalStudents = (db.prepare('SELECT COUNT(*) as count FROM team_members').get() as { count: number }).count;
  const confirmedTeams = (db.prepare("SELECT COUNT(*) as count FROM teams WHERE registration_status = 'CONFIRMED'").get() as { count: number }).count;
  const pendingPayments = (db.prepare("SELECT COUNT(*) as count FROM payment_claims WHERE status = 'PENDING'").get() as { count: number }).count;
  const verifiedPaidTeams = (db.prepare("SELECT COUNT(*) as count FROM teams WHERE payment_status = 'VERIFIED'").get() as { count: number }).count;
  const rejectedPayments = (db.prepare("SELECT COUNT(*) as count FROM payment_claims WHERE status = 'REJECTED'").get() as { count: number }).count;
  const teamsCheckedIn = (db.prepare("SELECT COUNT(*) as count FROM teams WHERE attendance_status IN ('CHECKED_IN', 'LATE_ARRIVED')").get() as { count: number }).count;
  const projectsSubmitted = (db.prepare('SELECT COUNT(*) as count FROM project_submissions').get() as { count: number }).count;
  const projectsMissing = confirmedTeams - projectsSubmitted > 0 ? confirmedTeams - projectsSubmitted : 0;
  const disqualifiedTeams = (db.prepare("SELECT COUNT(*) as count FROM teams WHERE registration_status = 'DISQUALIFIED'").get() as { count: number }).count;

  // Real verified revenue calculation: only approved claims
  const verifiedCollectionRow = db.prepare(`
    SELECT COALESCE(SUM(verified_amount), 0) as total
    FROM payment_claims
    WHERE status = 'APPROVED'
  `).get() as { total: number };

  const settings = getSettings();
  const maxStudentCapacity = settings.max_student_capacity || 500;
  const spotsRemaining = Math.max(0, maxStudentCapacity - totalStudents);

  return {
    totalTeams,
    totalStudents,
    confirmedTeams,
    pendingPayments,
    verifiedPaidTeams,
    rejectedPayments,
    teamsCheckedIn,
    projectsSubmitted,
    projectsMissing,
    disqualifiedTeams,
    totalVerifiedCollection: verifiedCollectionRow.total,
    maxStudentCapacity,
    spotsRemaining,
  };
}

export function addAuditLog(entry: {
  action: string;
  entity_type: string;
  entity_id: string;
  performed_by: string;
  details: string;
}): void {
  const db = getDb();
  const logId = `AUD-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO audit_logs (id, action, entity_type, entity_id, performed_by, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(logId, entry.action, entry.entity_type, entry.entity_id, entry.performed_by, entry.details, now);
}

export function getAuditLogs(limit: number = 50): AuditLog[] {
  const db = getDb();
  return db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?').all(limit) as AuditLog[];
}

export function updateAdminPassword(username: string, newPassword: string): void {
  const db = getDb();
  const pwdHash = hashPassword(newPassword);
  db.prepare(`
    UPDATE admin_users
    SET password_hash = ?
    WHERE username = ?
  `).run(pwdHash, username);
}

export function getRegistrationStatusHelper(): {
  status: RegistrationWindowStatus;
  statusMessage: string;
  totalStudentsRegistered: number;
  maxStudentCapacity: number;
  spotsRemaining: number;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
} {
  const db = getDb();
  const settings = getSettings();

  const totalStudentsRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    WHERE t.registration_status != 'DISQUALIFIED'
  `).get() as { count: number };

  const totalStudentsRegistered = totalStudentsRow ? totalStudentsRow.count : 0;
  const maxStudentCapacity = settings.max_student_capacity || 500;
  const spotsRemaining = Math.max(0, maxStudentCapacity - totalStudentsRegistered);

  const now = new Date();
  const nowMs = now.getTime();
  let status: RegistrationWindowStatus = 'OPEN';
  let statusMessage = 'Registration is live (96-hour window active).';
  let isOpen = true;

  if (spotsRemaining <= 0) {
    status = 'FULL';
    statusMessage = `Registration limit reached (${maxStudentCapacity} students capacity full).`;
    isOpen = false;
  } else if (settings.registrations_open !== 1) {
    status = 'CLOSED';
    statusMessage = 'Registrations are currently closed by the organizers.';
    isOpen = false;
  } else {
    if (settings.registration_start_time) {
      const startMs = new Date(settings.registration_start_time).getTime();
      if (nowMs < startMs) {
        status = 'UPCOMING';
        const startStr = new Date(settings.registration_start_time).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short',
        });
        statusMessage = `Registration opens on ${startStr} IST.`;
        isOpen = false;
      }
    }
    if (settings.registration_end_time) {
      const endMs = new Date(settings.registration_end_time).getTime();
      if (nowMs > endMs) {
        status = 'CLOSED';
        const endStr = new Date(settings.registration_end_time).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short',
        });
        statusMessage = `The 96-hour registration window closed on ${endStr} IST.`;
        isOpen = false;
      }
    }
  }

  return {
    status,
    statusMessage,
    totalStudentsRegistered,
    maxStudentCapacity,
    spotsRemaining,
    isOpen,
    startTime: settings.registration_start_time || null,
    endTime: settings.registration_end_time || null,
  };
}

