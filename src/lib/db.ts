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

import { isSupabaseConfigured, getSupabaseClient, getCleanSupabaseKey } from './supabase-client';

// Helper to resolve a guaranteed-writable directory across local development and serverless (Vercel/Lambda)
function getDataDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDir = path.join('/tmp', 'aiora-data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {
        // ignore if already created
      }
    }
    return tmpDir;
  }

  const localDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return localDir;
  } catch {
    const fallback = path.join('/tmp', 'aiora-data');
    if (!fs.existsSync(fallback)) {
      try {
        fs.mkdirSync(fallback, { recursive: true });
      } catch {
        // ignore
      }
    }
    return fallback;
  }
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbPath = path.join(getDataDir(), 'aiora.db');
    dbInstance = new Database(dbPath);
    try {
      dbInstance.pragma('journal_mode = WAL');
    } catch {
      // WAL mode is not supported on certain virtual filesystems or tmpfs
    }
    try {
      dbInstance.pragma('foreign_keys = ON');
    } catch {
      // ignore
    }
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

export async function getSettingsAsync(): Promise<EventSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('event_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (!error && data) {
          const settings: EventSettings = {
            id: 'default',
            event_name: data.event_name,
            tagline: data.tagline,
            organizing_forum: data.organizing_forum,
            organizing_institution: data.organizing_institution,
            organizing_department: data.organizing_department,
            event_date: String(data.event_date),
            arrival_start: String(data.arrival_start),
            arrival_deadline: String(data.arrival_deadline),
            submission_deadline: String(data.submission_deadline),
            timezone: data.timezone,
            registration_fee: Number(data.registration_fee) || 400,
            min_team_size: Number(data.min_team_size) || 2,
            max_team_size: Number(data.max_team_size) || 4,
            registrations_open: Number(data.registrations_open) ?? 1,
            max_student_capacity: Number(data.max_student_capacity) || 500,
            registration_window_hours: Number(data.registration_window_hours) || 96,
            registration_start_time: data.registration_start_time || '',
            registration_end_time: data.registration_end_time || '',
            payment_qr_url: data.payment_qr_url,
            payment_receiver_name: data.payment_receiver_name,
            payment_upi_id: data.payment_upi_id,
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            instagram_url: data.instagram_url || '',
            venue_room: data.venue_room || '',
            prize_1st: data.prize_1st || '',
            prize_2nd: data.prize_2nd || '',
            prize_3rd: data.prize_3rd || '',
            problem_statement_1_title: data.problem_statement_1_title || '',
            problem_statement_1_desc: data.problem_statement_1_desc || '',
            problem_statement_2_title: data.problem_statement_2_title || '',
            problem_statement_2_desc: data.problem_statement_2_desc || '',
            problem_statements_published: Number(data.problem_statements_published) || 0,
            public_website_url: data.public_website_url || 'https://iora-hackathon.vercel.app',
            usn_validation_regex: data.usn_validation_regex || '^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$|^[A-Za-z0-9_-]{5,15}$',
            updated_at: data.updated_at || new Date().toISOString(),
          };

          try {
            const db = getDb();
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
            stmt.run(settings);
          } catch {
            // cache ignore
          }

          return settings;
        }
      }
    } catch (e) {
      console.error('getSettingsAsync Supabase error:', e);
    }
  }

  return getSettings();
}

export async function updateSettingsAsync(
  settings: Partial<EventSettings>,
  performedBy: string
): Promise<EventSettings> {
  const updated = updateSettings(settings, performedBy);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from('event_settings')
          .upsert({
            ...updated,
            updated_at: new Date().toISOString(),
          });

        await supabase.from('audit_logs').insert({
          id: `AUD-${crypto.randomBytes(4).toString('hex')}`,
          action: 'UPDATE_SETTINGS',
          entity_type: 'EVENT_SETTINGS',
          entity_id: 'default',
          performed_by: performedBy,
          details: `Updated event settings (Fee: ₹${updated.registration_fee}, Open: ${updated.registrations_open})`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('updateSettingsAsync Supabase error:', e);
    }
  }

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

  // Asynchronously replicate to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getCleanSupabaseKey() ? getSupabaseClient() : null;
      if (supabase) {
        supabase.from('teams').upsert({
          id: teamId,
          team_name: registeredTeam.team_name,
          college_name: registeredTeam.college_name,
          department: registeredTeam.department,
          year_semester: registeredTeam.year_semester,
          leader_name: registeredTeam.leader_name,
          leader_email: registeredTeam.leader_email,
          leader_phone: registeredTeam.leader_phone,
          registration_status: registeredTeam.registration_status,
          payment_status: registeredTeam.payment_status,
          attendance_status: registeredTeam.attendance_status,
          submission_status: registeredTeam.submission_status,
          access_token: accessToken,
          created_at: now,
          updated_at: now,
        }).then(({ error: tErr }) => {
          if (tErr) console.error('Supabase team upsert warning:', tErr.message);
        });

        const memberRows = input.members.map((m, idx) => ({
          team_id: teamId,
          full_name: m.fullName.trim(),
          usn: m.usn.trim().toUpperCase(),
          college_name: m.collegeName.trim() || input.collegeName.trim(),
          department: m.department.trim() || input.department.trim(),
          year_semester: m.yearSemester.trim() || input.yearSemester.trim(),
          is_leader: idx === 0 ? 1 : 0,
          attendance_status: 'ABSENT',
          created_at: now,
        }));
        supabase.from('team_members').insert(memberRows).then(({ error: mErr }) => {
          if (mErr) console.error('Supabase members insert warning:', mErr.message);
        });
      }
    } catch (e) {
      console.error('Supabase replication error:', e);
    }
  }

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

  // Asynchronously replicate payment claim to Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getCleanSupabaseKey() ? getSupabaseClient() : null;
      if (supabase) {
        supabase.from('payment_claims').upsert({
          id: claimId,
          team_id: params.teamId,
          claimed_amount: params.claimedAmount,
          utr_reference: cleanUtr,
          screenshot_url: params.screenshotUrl || null,
          status: 'PENDING',
          created_at: now,
        }).then(({ error: pErr }) => {
          if (pErr) console.error('Supabase payment claim error:', pErr.message);
        });

        supabase.from('teams').update({
          payment_status: 'CLAIMED',
          registration_status: 'PAYMENT_SUBMITTED',
          updated_at: now,
        }).eq('id', params.teamId).then(({ error: tErr }) => {
          if (tErr) console.error('Supabase team payment status update error:', tErr.message);
        });
      }
    } catch (e) {
      console.error('Supabase payment claim replication error:', e);
    }
  }

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

export async function getTeamByIdAsync(teamId: string): Promise<Team | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: teamRow } = await supabase.from('teams').select('*').eq('id', teamId).maybeSingle();
        if (teamRow) {
          const { data: members } = await supabase.from('team_members').select('*').eq('team_id', teamId).order('is_leader', { ascending: false });
          const { data: claims } = await supabase.from('payment_claims').select('*').eq('team_id', teamId).order('created_at', { ascending: false }).limit(1);
          const { data: subs } = await supabase.from('project_submissions').select('*').eq('team_id', teamId).maybeSingle();

          const claim = claims && claims.length > 0 ? claims[0] : null;

          // Seed into local SQLite cache as best-effort
          try {
            const db = getDb();
            db.prepare(`
              INSERT OR REPLACE INTO teams (
                id, team_name, college_name, department, year_semester,
                leader_name, leader_email, leader_phone, access_token,
                registration_status, payment_status, attendance_status, submission_status,
                disqualification_reason, admin_notes, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              teamRow.id,
              teamRow.team_name,
              teamRow.college_name,
              teamRow.department,
              teamRow.year_semester,
              teamRow.leader_name,
              teamRow.leader_email,
              teamRow.leader_phone,
              teamRow.access_token || '',
              teamRow.registration_status || 'PENDING_PAYMENT',
              teamRow.payment_status || 'UNPAID',
              teamRow.attendance_status || 'NOT_ARRIVED',
              teamRow.submission_status || 'NOT_SUBMITTED',
              teamRow.disqualification_reason || null,
              teamRow.admin_notes || null,
              teamRow.created_at || new Date().toISOString(),
              teamRow.updated_at || new Date().toISOString()
            );

            if (Array.isArray(members)) {
              for (const m of members) {
                db.prepare(`
                  INSERT OR IGNORE INTO team_members (
                    id, team_id, full_name, usn, college_name, department, year_semester, is_leader, created_at
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                  m.id || `MBR-${m.usn}`,
                  teamRow.id,
                  m.full_name,
                  m.usn,
                  m.college_name || teamRow.college_name,
                  m.department || teamRow.department,
                  m.year_semester || teamRow.year_semester,
                  m.is_leader ? 1 : 0,
                  m.created_at || new Date().toISOString()
                );
              }
            }
          } catch (cacheErr) {
            // ignore cache failure
          }

          return {
            id: teamRow.id,
            team_name: teamRow.team_name,
            college_name: teamRow.college_name,
            department: teamRow.department,
            year_semester: teamRow.year_semester,
            leader_name: teamRow.leader_name,
            leader_email: teamRow.leader_email,
            leader_phone: teamRow.leader_phone,
            access_token: teamRow.access_token || '',
            registration_status: teamRow.registration_status || 'PENDING_PAYMENT',
            payment_status: teamRow.payment_status || 'UNPAID',
            attendance_status: teamRow.attendance_status || 'NOT_ARRIVED',
            submission_status: teamRow.submission_status || 'NOT_SUBMITTED',
            disqualification_reason: teamRow.disqualification_reason || null,
            admin_notes: teamRow.admin_notes || null,
            created_at: teamRow.created_at || new Date().toISOString(),
            updated_at: teamRow.updated_at || new Date().toISOString(),
            members: (members || []).map((m: any) => ({
              id: m.id || `MBR-${m.usn}`,
              team_id: teamRow.id,
              full_name: m.full_name,
              usn: m.usn,
              college_name: m.college_name || teamRow.college_name,
              department: m.department || teamRow.department,
              year_semester: m.year_semester || teamRow.year_semester,
              is_leader: m.is_leader ? 1 : 0,
              created_at: m.created_at || teamRow.created_at,
            })),
            payment_claim: claim ? {
              id: claim.id,
              team_id: teamRow.id,
              claimed_amount: Number(claim.claimed_amount) || 400,
              utr_reference: claim.utr_reference,
              screenshot_url: claim.screenshot_url || null,
              status: claim.status,
              verified_amount: claim.verified_amount ? Number(claim.verified_amount) : null,
              rejection_reason: claim.rejection_reason || null,
              verified_by: claim.verified_by || null,
              verified_at: claim.verified_at || null,
              created_at: claim.created_at,
              team_name: teamRow.team_name,
              leader_name: teamRow.leader_name,
            } : undefined,
            submission: subs ? {
              id: subs.id,
              team_id: teamRow.id,
              project_name: subs.project_name,
              problem_statement_chosen: subs.problem_statement_chosen,
              project_description: subs.project_description,
              real_world_problem: subs.real_world_problem,
              ai_feature_description: subs.ai_feature_description,
              technologies_used: subs.technologies_used,
              repo_url: subs.repo_url,
              live_demo_url: subs.live_demo_url || null,
              supporting_doc_url: subs.supporting_doc_url || null,
              submitted_at: subs.submitted_at || teamRow.created_at,
              is_late: subs.is_late ? 1 : 0,
              team_name: teamRow.team_name,
              leader_name: teamRow.leader_name,
            } : undefined,
          };
        }
      }
    } catch (e) {
      console.error('Supabase query error in getTeamByIdAsync:', e);
    }
  }

  return getTeamById(teamId);
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

// ----------------- Async Supabase-Enabled Cloud Database Operations -----------------

export async function getAllTeamsAsync(filters?: {
  search?: string;
  paymentStatus?: string;
  attendanceStatus?: string;
  submissionStatus?: string;
}): Promise<Team[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: teamsData, error } = await supabase
          .from('teams')
          .select(`
            *,
            members:team_members(*),
            claims:payment_claims(*),
            submission:project_submissions(*)
          `)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(teamsData)) {
          const formattedTeams: Team[] = teamsData.map((t: any) => {
            const rawMembers = Array.isArray(t.members) ? t.members : [];
            const sortedMembers = [...rawMembers].sort((a, b) => (b.is_leader ? 1 : 0) - (a.is_leader ? 1 : 0));
            const rawClaims = Array.isArray(t.claims) ? t.claims : [];
            const sortedClaims = [...rawClaims].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const latestClaim = sortedClaims[0] || null;
            const sub = Array.isArray(t.submission) ? t.submission[0] || null : (t.submission || null);

            return {
              id: t.id,
              team_name: t.team_name,
              college_name: t.college_name,
              department: t.department,
              year_semester: t.year_semester,
              leader_name: t.leader_name,
              leader_email: t.leader_email,
              leader_phone: t.leader_phone,
              access_token: t.access_token || '',
              registration_status: t.registration_status || 'PENDING_PAYMENT',
              payment_status: t.payment_status || 'UNPAID',
              attendance_status: t.attendance_status || 'NOT_ARRIVED',
              submission_status: t.submission_status || 'NOT_SUBMITTED',
              disqualification_reason: t.disqualification_reason || null,
              admin_notes: t.admin_notes || null,
              created_at: t.created_at || new Date().toISOString(),
              updated_at: t.updated_at || new Date().toISOString(),
              members: sortedMembers.map((m: any) => ({
                id: m.id || `MBR-${m.usn}`,
                team_id: t.id,
                full_name: m.full_name,
                usn: m.usn,
                college_name: m.college_name || t.college_name,
                department: m.department || t.department,
                year_semester: m.year_semester || t.year_semester,
                is_leader: m.is_leader ? 1 : 0,
                created_at: m.created_at || t.created_at,
              })),
              payment_claim: latestClaim ? {
                id: latestClaim.id,
                team_id: t.id,
                claimed_amount: Number(latestClaim.claimed_amount) || 400,
                utr_reference: latestClaim.utr_reference,
                screenshot_url: latestClaim.screenshot_url || null,
                status: latestClaim.status || 'PENDING',
                verified_amount: latestClaim.verified_amount ? Number(latestClaim.verified_amount) : null,
                rejection_reason: latestClaim.rejection_reason || null,
                verified_by: latestClaim.verified_by || null,
                verified_at: latestClaim.verified_at || null,
                created_at: latestClaim.created_at || t.created_at,
                team_name: t.team_name,
                leader_name: t.leader_name,
              } : undefined,
              submission: sub ? {
                id: sub.id,
                team_id: t.id,
                project_name: sub.project_name,
                problem_statement_chosen: sub.problem_statement_chosen,
                project_description: sub.project_description,
                real_world_problem: sub.real_world_problem,
                ai_feature_description: sub.ai_feature_description,
                technologies_used: sub.technologies_used,
                repo_url: sub.repo_url,
                live_demo_url: sub.live_demo_url || null,
                supporting_doc_url: sub.supporting_doc_url || null,
                submitted_at: sub.submitted_at || t.created_at,
                is_late: sub.is_late ? 1 : 0,
                team_name: t.team_name,
                leader_name: t.leader_name,
              } : undefined,
            };
          });

          // Sync into local SQLite cache in background/safely
          try {
            const db = getDb();
            const insertTeamStmt = db.prepare(`
              INSERT OR REPLACE INTO teams (
                id, team_name, college_name, department, year_semester,
                leader_name, leader_email, leader_phone, access_token,
                registration_status, payment_status, attendance_status, submission_status,
                disqualification_reason, admin_notes, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const insertMbrStmt = db.prepare(`
              INSERT OR REPLACE INTO team_members (
                id, team_id, full_name, usn, college_name, department, year_semester, is_leader, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const t of formattedTeams) {
              insertTeamStmt.run(
                t.id, t.team_name, t.college_name, t.department, t.year_semester,
                t.leader_name, t.leader_email, t.leader_phone, t.access_token,
                t.registration_status, t.payment_status, t.attendance_status, t.submission_status,
                t.disqualification_reason, t.admin_notes, t.created_at, t.updated_at
              );
              for (const m of (t.members || [])) {
                insertMbrStmt.run(
                  m.id, t.id, m.full_name, m.usn, m.college_name, m.department, m.year_semester, m.is_leader, m.created_at
                );
              }
            }
          } catch (syncErr) {
            // Non-critical cache warning
          }

          // Apply filters in JS for sub-millisecond evaluation
          let filtered = formattedTeams;
          if (filters?.search && filters.search.trim()) {
            const s = filters.search.trim().toLowerCase();
            filtered = filtered.filter(t =>
              t.id.toLowerCase().includes(s) ||
              t.team_name.toLowerCase().includes(s) ||
              t.leader_name.toLowerCase().includes(s) ||
              t.leader_email.toLowerCase().includes(s) ||
              t.college_name.toLowerCase().includes(s) ||
              (t.members || []).some(m => m.full_name.toLowerCase().includes(s) || m.usn.toLowerCase().includes(s))
            );
          }
          if (filters?.paymentStatus && filters.paymentStatus !== 'ALL') {
            filtered = filtered.filter(t => t.payment_status === filters.paymentStatus);
          }
          if (filters?.attendanceStatus && filters.attendanceStatus !== 'ALL') {
            filtered = filtered.filter(t => t.attendance_status === filters.attendanceStatus);
          }
          if (filters?.submissionStatus && filters.submissionStatus !== 'ALL') {
            filtered = filtered.filter(t => t.submission_status === filters.submissionStatus);
          }

          return filtered;
        }
      }
    } catch (e) {
      console.error('Supabase query error in getAllTeamsAsync:', e);
    }
  }

  return getAllTeams(filters);
}

export async function deleteTeamAsync(teamId: string, performedBy: string): Promise<boolean> {
  const db = getDb();
  const existingTeam = db.prepare('SELECT id, team_name FROM teams WHERE id = ?').get(teamId) as { id: string; team_name: string } | undefined;
  const teamLabel = existingTeam ? `"${existingTeam.team_name}" (${teamId})` : teamId;

  // 1. Delete from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Child tables (members, claims, submissions, attendance) cascade automatically via ON DELETE CASCADE
        const { error } = await supabase.from('teams').delete().eq('id', teamId);
        if (error) {
          console.error('Supabase team delete error:', error);
        }
      }
    } catch (e) {
      console.error('Supabase team delete error:', e);
    }
  }

  // 2. Delete from local SQLite
  try {
    db.prepare('DELETE FROM teams WHERE id = ?').run(teamId);
    db.prepare('DELETE FROM team_members WHERE team_id = ?').run(teamId);
    db.prepare('DELETE FROM payment_claims WHERE team_id = ?').run(teamId);
    db.prepare('DELETE FROM project_submissions WHERE team_id = ?').run(teamId);
    db.prepare('DELETE FROM attendance_logs WHERE team_id = ?').run(teamId);
  } catch (dbErr) {
    console.error('SQLite delete error:', dbErr);
  }

  // 3. Add audit log
  addAuditLog({
    action: 'TEAM_DELETED',
    entity_type: 'TEAM',
    entity_id: teamId,
    performed_by: performedBy,
    details: `Admin ${performedBy} permanently deleted team ${teamLabel} and all associated student rosters.`,
  });

  return true;
}

export async function getDashboardStatsAsync(): Promise<DashboardStats> {
  if (isSupabaseConfigured()) {
    try {
      const teams = await getAllTeamsAsync();
      const settings = getSettings();
      const maxStudentCapacity = settings.max_student_capacity || 500;

      const totalTeams = teams.length;
      const totalStudents = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);
      const confirmedTeams = teams.filter(t => t.registration_status === 'CONFIRMED').length;
      const pendingPayments = teams.filter(t => t.payment_status === 'CLAIMED').length;
      const verifiedPaidTeams = teams.filter(t => t.payment_status === 'VERIFIED').length;
      const rejectedPayments = teams.filter(t => t.payment_status === 'REJECTED').length;
      const teamsCheckedIn = teams.filter(t => t.attendance_status === 'CHECKED_IN' || t.attendance_status === 'LATE_ARRIVED').length;
      const projectsSubmitted = teams.filter(t => t.submission_status === 'SUBMITTED').length;
      const projectsMissing = Math.max(0, confirmedTeams - projectsSubmitted);
      const disqualifiedTeams = teams.filter(t => t.registration_status === 'DISQUALIFIED').length;

      const totalVerifiedCollection = teams
        .filter(t => t.payment_status === 'VERIFIED')
        .reduce((sum, t) => sum + (t.payment_claim?.verified_amount || 400), 0);

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
        totalVerifiedCollection,
        maxStudentCapacity,
        spotsRemaining,
      };
    } catch (e) {
      console.error('getDashboardStatsAsync error:', e);
    }
  }

  return getDashboardStats();
}

export async function getAllPaymentClaimsAsync(): Promise<PaymentClaim[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: claims, error } = await supabase
          .from('payment_claims')
          .select(`
            *,
            team:teams(team_name, leader_name, id)
          `)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(claims)) {
          return claims.map((c: any) => ({
            id: c.id,
            team_id: c.team_id,
            claimed_amount: Number(c.claimed_amount) || 400,
            utr_reference: c.utr_reference,
            screenshot_url: c.screenshot_url || null,
            status: c.status,
            verified_amount: c.verified_amount ? Number(c.verified_amount) : null,
            rejection_reason: c.rejection_reason || null,
            verified_by: c.verified_by || null,
            verified_at: c.verified_at || null,
            created_at: c.created_at,
            team_name: c.team?.team_name || c.team_id,
            leader_name: c.team?.leader_name || 'Team Leader',
            member_count: 0,
          }));
        }
      }
    } catch (e) {
      console.error('getAllPaymentClaimsAsync error:', e);
    }
  }

  return getAllPaymentClaims();
}

export async function registerTeamAsync(input: RegisterTeamInput): Promise<{ team: Team; accessToken: string }> {
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

  const leaderUsnClean = input.members[0]?.usn?.trim().toUpperCase();
  if (!leaderUsnClean) {
    throw new Error('Team leader USN is required.');
  }

  const totalMembers = input.members.length;
  if (totalMembers < settings.min_team_size || totalMembers > settings.max_team_size) {
    throw new Error(`Team size must be between ${settings.min_team_size} and ${settings.max_team_size} students.`);
  }

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

  // Cross-instance check against Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: dupTeams } = await supabase
          .from('teams')
          .select('id, team_name')
          .ilike('team_name', input.teamName.trim())
          .limit(1);
        if (dupTeams && dupTeams.length > 0) {
          throw new Error(`A team with the name "${input.teamName.trim()}" is already registered. Please choose a different team name.`);
        }

        for (const cleanUsn of usnSet) {
          const { data: dupUsn } = await supabase
            .from('team_members')
            .select('usn, team_id')
            .ilike('usn', cleanUsn)
            .limit(1);
          if (dupUsn && dupUsn.length > 0) {
            throw new Error(`The USN "${cleanUsn}" is already registered under another active team. Each student may only participate in one team.`);
          }
        }

        const capacityLimit = settings.max_student_capacity || 500;
        const { count } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true });
        const currentCount = count || 0;
        if (currentCount + input.members.length > capacityLimit) {
          const remaining = Math.max(0, capacityLimit - currentCount);
          if (remaining === 0) {
            throw new Error(`Registration capacity reached: The maximum limit of ${capacityLimit} students has been reached.`);
          }
          throw new Error(`Registration capacity exceeded: Only ${remaining} student spots remain, but your team has ${input.members.length} members.`);
        }
      }
    } catch (e: any) {
      if (e.message && (e.message.includes('already registered') || e.message.includes('capacity'))) {
        throw e;
      }
      console.error('Supabase pre-check warning:', e);
    }
  }

  const localResult = registerTeam(input);
  const teamId = localResult.team.id;
  const accessToken = localResult.accessToken;
  const now = new Date().toISOString();

  // AWAIT Supabase persistence
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: tErr } = await supabase.from('teams').upsert({
          id: teamId,
          team_name: localResult.team.team_name,
          college_name: localResult.team.college_name,
          department: localResult.team.department,
          year_semester: localResult.team.year_semester,
          leader_name: localResult.team.leader_name,
          leader_email: localResult.team.leader_email,
          leader_phone: localResult.team.leader_phone,
          registration_status: localResult.team.registration_status,
          payment_status: localResult.team.payment_status,
          attendance_status: localResult.team.attendance_status,
          submission_status: localResult.team.submission_status,
          access_token: accessToken,
          created_at: now,
          updated_at: now,
        });

        if (tErr) console.error('Supabase team upsert error:', tErr);

        const memberRows = input.members.map((m, idx) => ({
          id: `MBR-${crypto.randomBytes(4).toString('hex')}`,
          team_id: teamId,
          full_name: m.fullName.trim(),
          usn: m.usn.trim().toUpperCase(),
          college_name: m.collegeName.trim() || input.collegeName.trim(),
          department: m.department.trim() || input.department.trim(),
          year_semester: m.yearSemester.trim() || input.yearSemester.trim(),
          is_leader: idx === 0 ? 1 : 0,
          created_at: now,
        }));

        const { error: mErr } = await supabase.from('team_members').insert(memberRows);
        if (mErr) console.error('Supabase members insert error:', mErr);
      }
    } catch (e) {
      console.error('Supabase replication error in registerTeamAsync:', e);
    }
  }

  return localResult;
}

export async function submitPaymentClaimAsync(params: {
  teamId: string;
  utrReference: string;
  claimedAmount: number;
  screenshotUrl?: string | null;
}): Promise<PaymentClaim> {
  const cleanUtr = params.utrReference.trim().toUpperCase();

  if (!cleanUtr || cleanUtr.length < 6) {
    throw new Error('Please enter a valid UPI transaction reference number (UTR / Ref ID).');
  }

  const claimId = `PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        // 1. Check if team exists in Supabase
        const { data: teamRow } = await supabase
          .from('teams')
          .select('id, team_name, payment_status')
          .eq('id', params.teamId)
          .maybeSingle();

        if (!teamRow) {
          try {
            const db = getDb();
            const localTeam = db.prepare('SELECT id FROM teams WHERE id = ?').get(params.teamId);
            if (!localTeam) {
              throw new Error('Team registration not found. Please register your team first.');
            }
          } catch (e: any) {
            throw new Error(e.message || 'Team registration not found.');
          }
        }

        // 2. Check if UTR is already used in an approved or pending claim
        const { data: existingClaims } = await supabase
          .from('payment_claims')
          .select('id, utr_reference, status')
          .ilike('utr_reference', cleanUtr)
          .limit(1);

        if (existingClaims && existingClaims.length > 0) {
          const ec = existingClaims[0];
          if (ec.status === 'APPROVED') {
            throw new Error(`Transaction reference "${cleanUtr}" has already been used and verified for another team.`);
          } else if (ec.status === 'PENDING') {
            throw new Error(`A payment claim with reference "${cleanUtr}" is already undergoing verification.`);
          }
        }

        // 3. Upsert payment claim into Supabase
        const { error: pErr } = await supabase.from('payment_claims').upsert({
          id: claimId,
          team_id: params.teamId,
          claimed_amount: params.claimedAmount,
          utr_reference: cleanUtr,
          screenshot_url: params.screenshotUrl || null,
          status: 'PENDING',
          created_at: now,
        });
        if (pErr) {
          console.error('Supabase claim upsert error:', pErr);
          throw new Error(`Failed to record payment claim: ${pErr.message}`);
        }

        // 4. Update team status in Supabase
        const { error: tErr } = await supabase.from('teams').update({
          payment_status: 'CLAIMED',
          registration_status: 'PAYMENT_SUBMITTED',
          updated_at: now,
        }).eq('id', params.teamId);
        if (tErr) console.error('Supabase team status update error:', tErr);

        // 5. Add audit log in Supabase
        try {
          await supabase.from('audit_logs').insert({
            id: `AUD-${crypto.randomBytes(4).toString('hex')}`,
            action: 'PAYMENT_CLAIM_SUBMITTED',
            entity_type: 'PAYMENT_CLAIM',
            entity_id: claimId,
            performed_by: params.teamId,
            details: `Submitted UTR ${cleanUtr} for ₹${params.claimedAmount}`,
            timestamp: now,
          });
        } catch {}

        // 6. Best-effort cache into local SQLite
        try {
          const db = getDb();
          db.prepare(`
            INSERT OR REPLACE INTO payment_claims (
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
        } catch {
          // ignore SQLite cache errors
        }

        return {
          id: claimId,
          team_id: params.teamId,
          claimed_amount: params.claimedAmount,
          utr_reference: cleanUtr,
          screenshot_url: params.screenshotUrl || null,
          status: 'PENDING',
          verified_amount: null,
          rejection_reason: null,
          verified_by: null,
          verified_at: null,
          created_at: now,
        };
      }
    } catch (e: any) {
      if (e.message && (e.message.includes('Transaction reference') || e.message.includes('Team registration'))) {
        throw e;
      }
      console.error('Supabase claim submit error:', e);
      throw e;
    }
  }

  return submitPaymentClaim(params);
}

export async function approvePaymentAsync(params: {
  claimId: string;
  verifiedAmount: number;
  verifiedBy: string;
  adminNotes?: string;
}): Promise<void> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      // 1. Fetch claim from Supabase
      const { data: claimRow } = await supabase
        .from('payment_claims')
        .select('*, team:teams(*)')
        .eq('id', params.claimId)
        .maybeSingle();

      let teamId = claimRow?.team_id || (claimRow?.team as any)?.id;

      if (!claimRow) {
        try {
          const db = getDb();
          const localClaim = db.prepare('SELECT * FROM payment_claims WHERE id = ?').get(params.claimId) as PaymentClaim | undefined;
          if (localClaim) {
            teamId = localClaim.team_id;
          } else {
            throw new Error('Payment claim not found.');
          }
        } catch (e: any) {
          throw new Error('Payment claim not found.');
        }
      }

      // 2. Update claim in Supabase
      const { error: claimErr } = await supabase
        .from('payment_claims')
        .update({
          status: 'APPROVED',
          verified_amount: params.verifiedAmount,
          verified_by: params.verifiedBy,
          verified_at: now,
        })
        .eq('id', params.claimId);

      if (claimErr) {
        console.error('Supabase approve payment_claims error:', claimErr);
        throw new Error(`Failed to approve payment: ${claimErr.message}`);
      }

      // 3. Update team in Supabase
      if (teamId) {
        const existingNotes = (claimRow?.team as any)?.admin_notes || '';
        const adminNotesAppend = params.adminNotes ? `\n[Verified by ${params.verifiedBy}: ${params.adminNotes}]` : '';
        const updatedNotes = existingNotes ? `${existingNotes}${adminNotesAppend}` : (params.adminNotes ? `[Verified by ${params.verifiedBy}: ${params.adminNotes}]` : null);

        const { error: teamErr } = await supabase
          .from('teams')
          .update({
            payment_status: 'VERIFIED',
            registration_status: 'CONFIRMED',
            admin_notes: updatedNotes,
            updated_at: now,
          })
          .eq('id', teamId);

        if (teamErr) console.error('Supabase update team payment status error:', teamErr);
      }

      // 4. Audit log in Supabase
      try {
        await supabase.from('audit_logs').insert({
          id: `AUD-${crypto.randomBytes(4).toString('hex')}`,
          action: 'PAYMENT_APPROVED',
          entity_type: 'PAYMENT_CLAIM',
          entity_id: params.claimId,
          performed_by: params.verifiedBy,
          details: `Payment approved for team ${teamId}. Verified Amount: ₹${params.verifiedAmount}, UTR: ${claimRow?.utr_reference || 'N/A'}${params.adminNotes ? ` (${params.adminNotes})` : ''}`,
          timestamp: now,
        });
      } catch (aErr) {
        console.error('Supabase audit log error:', aErr);
      }

      // 5. Best-effort cache into local SQLite
      try {
        const db = getDb();
        db.prepare(`
          UPDATE payment_claims SET
            status = 'APPROVED',
            verified_amount = ?,
            verified_by = ?,
            verified_at = ?
          WHERE id = ?
        `).run(params.verifiedAmount, params.verifiedBy, now, params.claimId);

        if (teamId) {
          db.prepare(`
            UPDATE teams SET
              payment_status = 'VERIFIED',
              registration_status = 'CONFIRMED',
              admin_notes = COALESCE(admin_notes, '') || ?,
              updated_at = ?
            WHERE id = ?
          `).run(params.adminNotes ? `\n[Verified by ${params.verifiedBy}: ${params.adminNotes}]` : '', now, teamId);
        }

        addAuditLog({
          action: 'PAYMENT_APPROVED',
          entity_type: 'PAYMENT_CLAIM',
          entity_id: params.claimId,
          performed_by: params.verifiedBy,
          details: `Payment approved for team ${teamId}. Verified Amount: ₹${params.verifiedAmount}`,
        });
      } catch {
        // Safe to ignore SQLite cache failure
      }

      return;
    }
  }

  approvePayment(params);
}

export async function rejectPaymentAsync(params: {
  claimId: string;
  rejectionReason: string;
  verifiedBy: string;
}): Promise<void> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: claimRow } = await supabase
        .from('payment_claims')
        .select('*, team:teams(*)')
        .eq('id', params.claimId)
        .maybeSingle();

      let teamId = claimRow?.team_id || (claimRow?.team as any)?.id;

      if (!claimRow) {
        try {
          const db = getDb();
          const localClaim = db.prepare('SELECT * FROM payment_claims WHERE id = ?').get(params.claimId) as PaymentClaim | undefined;
          if (localClaim) {
            teamId = localClaim.team_id;
          } else {
            throw new Error('Payment claim not found.');
          }
        } catch {
          throw new Error('Payment claim not found.');
        }
      }

      const { error: claimErr } = await supabase
        .from('payment_claims')
        .update({
          status: 'REJECTED',
          rejection_reason: params.rejectionReason,
          verified_by: params.verifiedBy,
          verified_at: now,
        })
        .eq('id', params.claimId);

      if (claimErr) {
        throw new Error(`Failed to reject payment: ${claimErr.message}`);
      }

      if (teamId) {
        const existingNotes = (claimRow?.team as any)?.admin_notes || '';
        const adminNotesAppend = `\n[Payment Rejected by ${params.verifiedBy}: ${params.rejectionReason}]`;
        const updatedNotes = existingNotes ? `${existingNotes}${adminNotesAppend}` : adminNotesAppend.trim();

        await supabase
          .from('teams')
          .update({
            payment_status: 'REJECTED',
            registration_status: 'PENDING_PAYMENT',
            admin_notes: updatedNotes,
            updated_at: now,
          })
          .eq('id', teamId);
      }

      try {
        await supabase.from('audit_logs').insert({
          id: `AUD-${crypto.randomBytes(4).toString('hex')}`,
          action: 'PAYMENT_REJECTED',
          entity_type: 'PAYMENT_CLAIM',
          entity_id: params.claimId,
          performed_by: params.verifiedBy,
          details: `Rejected claim for team ${teamId}. Reason: ${params.rejectionReason}`,
          timestamp: now,
        });
      } catch {}

      try {
        const db = getDb();
        db.prepare(`
          UPDATE payment_claims SET
            status = 'REJECTED',
            rejection_reason = ?,
            verified_by = ?,
            verified_at = ?
          WHERE id = ?
        `).run(params.rejectionReason, params.verifiedBy, now, params.claimId);

        if (teamId) {
          db.prepare(`
            UPDATE teams SET
              payment_status = 'REJECTED',
              registration_status = 'PENDING_PAYMENT',
              admin_notes = COALESCE(admin_notes, '') || ?,
              updated_at = ?
            WHERE id = ?
          `).run(`\n[Payment Rejected by ${params.verifiedBy}: ${params.rejectionReason}]`, now, teamId);
        }

        addAuditLog({
          action: 'PAYMENT_REJECTED',
          entity_type: 'PAYMENT_CLAIM',
          entity_id: params.claimId,
          performed_by: params.verifiedBy,
          details: `Rejected claim for team ${teamId}. Reason: ${params.rejectionReason}`,
        });
      } catch {}

      return;
    }
  }

  rejectPayment(params);
}

export async function reversePaymentApprovalAsync(params: {
  claimId: string;
  reversalReason: string;
  performedBy: string;
}): Promise<void> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: claimRow } = await supabase
        .from('payment_claims')
        .select('*, team:teams(*)')
        .eq('id', params.claimId)
        .maybeSingle();

      let teamId = claimRow?.team_id || (claimRow?.team as any)?.id;

      if (!claimRow) {
        try {
          const db = getDb();
          const localClaim = db.prepare('SELECT * FROM payment_claims WHERE id = ?').get(params.claimId) as PaymentClaim | undefined;
          if (localClaim) {
            teamId = localClaim.team_id;
          } else {
            throw new Error('Payment claim not found.');
          }
        } catch {
          throw new Error('Payment claim not found.');
        }
      }

      const reversalText = `Reversed by ${params.performedBy}: ${params.reversalReason}`;
      const { error: claimErr } = await supabase
        .from('payment_claims')
        .update({
          status: 'REJECTED',
          rejection_reason: reversalText,
          verified_at: now,
        })
        .eq('id', params.claimId);

      if (claimErr) {
        throw new Error(`Failed to reverse payment approval: ${claimErr.message}`);
      }

      if (teamId) {
        const existingNotes = (claimRow?.team as any)?.admin_notes || '';
        const adminNotesAppend = `\n[Payment Approval Reversed by ${params.performedBy}: ${params.reversalReason}]`;
        const updatedNotes = existingNotes ? `${existingNotes}${adminNotesAppend}` : adminNotesAppend.trim();

        await supabase
          .from('teams')
          .update({
            payment_status: 'UNPAID',
            registration_status: 'PENDING_PAYMENT',
            admin_notes: updatedNotes,
            updated_at: now,
          })
          .eq('id', teamId);
      }

      try {
        await supabase.from('audit_logs').insert({
          id: `AUD-${crypto.randomBytes(4).toString('hex')}`,
          action: 'PAYMENT_APPROVAL_REVERSED',
          entity_type: 'PAYMENT_CLAIM',
          entity_id: params.claimId,
          performed_by: params.performedBy,
          details: `Reversed approval for team ${teamId}. Reason: ${params.reversalReason}`,
          timestamp: now,
        });
      } catch {}

      try {
        const db = getDb();
        db.prepare(`
          UPDATE payment_claims SET
            status = 'REJECTED',
            rejection_reason = ?,
            verified_at = ?
          WHERE id = ?
        `).run(reversalText, now, params.claimId);

        if (teamId) {
          db.prepare(`
            UPDATE teams SET
              payment_status = 'UNPAID',
              registration_status = 'PENDING_PAYMENT',
              admin_notes = COALESCE(admin_notes, '') || ?,
              updated_at = ?
            WHERE id = ?
          `).run(`\n[Payment Approval Reversed by ${params.performedBy}: ${params.reversalReason}]`, now, teamId);
        }

        addAuditLog({
          action: 'PAYMENT_APPROVAL_REVERSED',
          entity_type: 'PAYMENT_CLAIM',
          entity_id: params.claimId,
          performed_by: params.performedBy,
          details: `Reversed approval for team ${teamId}. Reason: ${params.reversalReason}`,
        });
      } catch {}

      return;
    }
  }

  reversePaymentApproval(params);
}

export async function markAttendanceAsync(params: {
  teamId: string;
  status: 'CHECKED_IN' | 'LATE_ARRIVED' | 'DISQUALIFIED';
  markedBy: string;
  remarks?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const logId = `ATT-${crypto.randomBytes(4).toString('hex')}`;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('teams').update({
          attendance_status: params.status,
          updated_at: now,
        }).eq('id', params.teamId);

        await supabase.from('attendance_logs').insert({
          id: logId,
          team_id: params.teamId,
          check_in_time: now,
          status: params.status,
          marked_by: params.markedBy,
          remarks: params.remarks || null,
        });

        await supabase.from('audit_logs').insert({
          id: `AUD-${crypto.randomBytes(4).toString('hex')}`,
          action: 'ATTENDANCE_MARKED',
          entity_type: 'TEAM',
          entity_id: params.teamId,
          performed_by: params.markedBy,
          details: `Marked ${params.status} for team ${params.teamId}. Remarks: ${params.remarks || 'None'}`,
          timestamp: now,
        });

        try {
          const db = getDb();
          db.prepare(`
            UPDATE teams SET attendance_status = ?, updated_at = ? WHERE id = ?
          `).run(params.status, now, params.teamId);
          db.prepare(`
            INSERT INTO attendance_logs (id, team_id, check_in_time, status, marked_by, remarks)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(logId, params.teamId, now, params.status, params.markedBy, params.remarks || null);
        } catch {}

        return;
      }
    } catch (e) {
      console.error('Supabase markAttendanceAsync error:', e);
    }
  }

  markAttendance(params);
}

export async function getAttendanceLogsAsync(): Promise<AttendanceLog[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('attendance_logs')
          .select(`
            *,
            team:teams(team_name, leader_name, college_name)
          `)
          .order('check_in_time', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map((l: any) => ({
            id: l.id,
            team_id: l.team_id,
            check_in_time: l.check_in_time,
            status: l.status,
            marked_by: l.marked_by,
            remarks: l.remarks || null,
            team_name: l.team?.team_name || l.team_id,
            leader_name: l.team?.leader_name || 'Leader',
            college_name: l.team?.college_name || '',
          }));
        }
      }
    } catch (e) {
      console.error('getAttendanceLogsAsync error:', e);
    }
  }

  const db = getDb();
  return db.prepare(`
    SELECT al.*, t.team_name, t.leader_name, t.college_name
    FROM attendance_logs al
    LEFT JOIN teams t ON al.team_id = t.id
    ORDER BY al.check_in_time DESC
  `).all() as any[];
}

export async function updateTeamDisqualificationAsync(params: {
  teamId: string;
  disqualify: boolean;
  reason: string;
  performedBy: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const newStatus = params.disqualify ? 'DISQUALIFIED' : 'CONFIRMED';

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('teams').update({
          registration_status: newStatus,
          disqualification_reason: params.disqualify ? params.reason : null,
          updated_at: now,
        }).eq('id', params.teamId);

        await supabase.from('audit_logs').insert({
          id: `AUD-${crypto.randomBytes(4).toString('hex')}`,
          action: params.disqualify ? 'TEAM_DISQUALIFIED' : 'TEAM_REINSTATED',
          entity_type: 'TEAM',
          entity_id: params.teamId,
          performed_by: params.performedBy,
          details: params.disqualify ? `Disqualified team: ${params.reason}` : 'Reinstated team to confirmed status',
          timestamp: now,
        });

        try {
          const db = getDb();
          db.prepare(`
            UPDATE teams SET
              registration_status = ?,
              disqualification_reason = ?,
              updated_at = ?
            WHERE id = ?
          `).run(newStatus, params.disqualify ? params.reason : null, now, params.teamId);
        } catch {}

        return;
      }
    } catch (e) {
      console.error('Supabase updateTeamDisqualificationAsync error:', e);
    }
  }

  updateTeamDisqualification(params);
}

export async function submitProjectAsync(params: {
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
}): Promise<ProjectSubmission> {
  const team = await getTeamByIdAsync(params.teamId);
  if (!team) {
    throw new Error('Team registration not found.');
  }

  if (team.access_token !== params.accessToken) {
    throw new Error('Invalid team access credentials.');
  }

  if (team.registration_status !== 'CONFIRMED') {
    throw new Error('Project submission is only allowed for verified and confirmed teams.');
  }

  const settings = await getSettingsAsync();
  const deadlineStr = `${settings.event_date}T${settings.submission_deadline}:00+05:30`;
  const deadline = new Date(deadlineStr).getTime();
  const nowTime = Date.now();
  const isLate = nowTime > deadline ? 1 : 0;

  const now = new Date().toISOString();
  const submissionId = `SUB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: subErr } = await supabase.from('project_submissions').upsert({
          id: submissionId,
          team_id: params.teamId,
          project_name: params.projectName.trim(),
          problem_statement_chosen: params.problemStatementChosen.trim(),
          project_description: params.projectDescription.trim(),
          real_world_problem: params.realWorldProblem.trim(),
          ai_feature_description: params.aiFeatureDescription.trim(),
          technologies_used: params.technologiesUsed.trim(),
          repo_url: params.repoUrl.trim(),
          live_demo_url: params.liveDemoUrl?.trim() || null,
          supporting_doc_url: params.supportingDocUrl?.trim() || null,
          submitted_at: now,
          is_late: isLate,
        });

        if (subErr) {
          console.error('Supabase submitProject error:', subErr);
          throw new Error(`Failed to save project submission: ${subErr.message}`);
        }

        await supabase.from('teams').update({
          submission_status: 'SUBMITTED',
          updated_at: now,
        }).eq('id', params.teamId);

        try {
          const db = getDb();
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
        } catch {}

        return {
          id: submissionId,
          team_id: params.teamId,
          project_name: params.projectName.trim(),
          problem_statement_chosen: params.problemStatementChosen.trim(),
          project_description: params.projectDescription.trim(),
          real_world_problem: params.realWorldProblem.trim(),
          ai_feature_description: params.aiFeatureDescription.trim(),
          technologies_used: params.technologiesUsed.trim(),
          repo_url: params.repoUrl.trim(),
          live_demo_url: params.liveDemoUrl?.trim() || null,
          supporting_doc_url: params.supportingDocUrl?.trim() || null,
          submitted_at: now,
          is_late: isLate,
        };
      }
    } catch (e: any) {
      if (e.message && e.message.includes('Project submission')) {
        throw e;
      }
      console.error('Supabase project submission error:', e);
    }
  }

  return submitProject(params);
}

export async function getAllSubmissionsAsync(): Promise<ProjectSubmission[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: subs, error } = await supabase
          .from('project_submissions')
          .select(`
            *,
            team:teams(team_name, leader_name, id)
          `)
          .order('submitted_at', { ascending: false });

        if (!error && Array.isArray(subs)) {
          return subs.map((s: any) => ({
            id: s.id,
            team_id: s.team_id,
            project_name: s.project_name,
            problem_statement_chosen: s.problem_statement_chosen,
            project_description: s.project_description,
            real_world_problem: s.real_world_problem,
            ai_feature_description: s.ai_feature_description,
            technologies_used: s.technologies_used,
            repo_url: s.repo_url,
            live_demo_url: s.live_demo_url || null,
            supporting_doc_url: s.supporting_doc_url || null,
            submitted_at: s.submitted_at,
            is_late: s.is_late ? 1 : 0,
            team_name: s.team?.team_name || s.team_id,
            leader_name: s.team?.leader_name || 'Team Leader',
          }));
        }
      }
    } catch (e) {
      console.error('getAllSubmissionsAsync error:', e);
    }
  }

  return getAllSubmissions();
}

export async function getAuditLogsAsync(limit: number = 50): Promise<AuditLog[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(limit);

        if (!error && Array.isArray(data)) {
          return data.map((a: any) => ({
            id: a.id,
            action: a.action,
            entity_type: a.entity_type,
            entity_id: a.entity_id,
            performed_by: a.performed_by,
            details: a.details,
            timestamp: a.timestamp,
          }));
        }
      }
    } catch (e) {
      console.error('getAuditLogsAsync error:', e);
    }
  }

  return getAuditLogs(limit);
}

export async function getRegistrationStatusHelperAsync(): Promise<{
  status: RegistrationWindowStatus;
  statusMessage: string;
  totalStudentsRegistered: number;
  maxStudentCapacity: number;
  spotsRemaining: number;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
}> {
  const localStatus = getRegistrationStatusHelper();

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { count, error } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true });

        if (!error && typeof count === 'number') {
          const settings = await getSettingsAsync();
          const maxStudentCapacity = settings.max_student_capacity || 500;
          const totalStudentsRegistered = count;
          const spotsRemaining = Math.max(0, maxStudentCapacity - totalStudentsRegistered);

          let status = localStatus.status;
          let statusMessage = localStatus.statusMessage;
          let isOpen = localStatus.isOpen;

          if (spotsRemaining <= 0) {
            status = 'FULL';
            statusMessage = `Registration limit reached (${maxStudentCapacity} students capacity full).`;
            isOpen = false;
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
      }
    } catch (e) {
      console.error('Supabase count error in getRegistrationStatusHelperAsync:', e);
    }
  }

  return localStatus;
}


