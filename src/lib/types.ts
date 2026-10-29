export type RegistrationStatus = 'PENDING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'CONFIRMED' | 'DISQUALIFIED';
export type PaymentStatus = 'UNPAID' | 'CLAIMED' | 'VERIFIED' | 'REJECTED';
export type AttendanceStatus = 'NOT_ARRIVED' | 'CHECKED_IN' | 'LATE_ARRIVED' | 'ABSENT';
export type SubmissionStatus = 'NOT_SUBMITTED' | 'SUBMITTED';

export interface EventSettings {
  id: string;
  event_name: string;
  tagline: string;
  organizing_forum: string;
  organizing_institution: string;
  organizing_department: string;
  event_date: string; // YYYY-MM-DD
  arrival_start: string; // HH:MM
  arrival_deadline: string; // HH:MM
  submission_deadline: string; // HH:MM
  timezone: string;
  registration_fee: number;
  min_team_size: number;
  max_team_size: number;
  registrations_open: number; // 1 or 0
  payment_qr_url: string;
  payment_receiver_name: string;
  payment_upi_id: string;
  contact_email: string;
  contact_phone: string;
  instagram_url: string;
  venue_room: string;
  prize_1st: string;
  prize_2nd: string;
  prize_3rd: string;
  problem_statement_1_title: string;
  problem_statement_1_desc: string;
  problem_statement_2_title: string;
  problem_statement_2_desc: string;
  problem_statements_published: number; // 1 or 0
  public_website_url: string;
  usn_validation_regex: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  full_name: string;
  usn: string;
  college_name: string;
  department: string;
  year_semester: string;
  is_leader: number; // 1 or 0
  created_at: string;
}

export interface Team {
  id: string;
  team_name: string;
  college_name: string;
  department: string;
  year_semester: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  access_token: string;
  registration_status: RegistrationStatus;
  payment_status: PaymentStatus;
  attendance_status: AttendanceStatus;
  submission_status: SubmissionStatus;
  disqualification_reason: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
  payment_claim?: PaymentClaim;
  submission?: ProjectSubmission;
}

export interface PaymentClaim {
  id: string;
  team_id: string;
  claimed_amount: number;
  utr_reference: string;
  screenshot_url: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verified_amount: number | null;
  rejection_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  team_name?: string;
  leader_name?: string;
  member_count?: number;
}

export interface ProjectSubmission {
  id: string;
  team_id: string;
  project_name: string;
  problem_statement_chosen: string;
  project_description: string;
  real_world_problem: string;
  ai_feature_description: string;
  technologies_used: string;
  repo_url: string;
  live_demo_url: string | null;
  supporting_doc_url: string | null;
  submitted_at: string;
  is_late: number; // 1 or 0
  team_name?: string;
  leader_name?: string;
}

export interface AttendanceLog {
  id: string;
  team_id: string;
  check_in_time: string;
  status: 'CHECKED_IN' | 'LATE_ARRIVED' | 'DISQUALIFIED';
  marked_by: string;
  remarks: string | null;
  team_name?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  performed_by: string;
  details: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  role: 'SUPER_ADMIN' | 'ORGANIZER' | 'JUDGE';
  created_at: string;
}

export interface DashboardStats {
  totalTeams: number;
  totalStudents: number;
  confirmedTeams: number;
  pendingPayments: number;
  verifiedPaidTeams: number;
  rejectedPayments: number;
  teamsCheckedIn: number;
  projectsSubmitted: number;
  projectsMissing: number;
  disqualifiedTeams: number;
  totalVerifiedCollection: number;
}
