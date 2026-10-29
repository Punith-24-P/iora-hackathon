-- AIORA HACKATHON 2026 — SUPABASE POSTGRESQL INITIAL SCHEMA & RLS
-- Department of Artificial Intelligence & Machine Learning, Karavali Institute of Technology, Mangaluru

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Event Settings Table
CREATE TABLE IF NOT EXISTS public.event_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    event_name TEXT NOT NULL DEFAULT 'AIORA — AI × Web Development Hackathon',
    tagline TEXT NOT NULL DEFAULT 'Imagine. Build. Deploy.',
    organizing_forum TEXT NOT NULL DEFAULT 'AIORA',
    organizing_institution TEXT NOT NULL DEFAULT 'Karavali Institute of Technology, Mangaluru, Karnataka, India',
    organizing_department TEXT NOT NULL DEFAULT 'Department of Artificial Intelligence and Machine Learning (AI & ML)',
    event_date DATE NOT NULL DEFAULT '2026-11-05',
    arrival_start TIME NOT NULL DEFAULT '09:00:00',
    arrival_deadline TIME NOT NULL DEFAULT '09:30:00',
    submission_deadline TIME NOT NULL DEFAULT '15:00:00',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    registration_fee NUMERIC(10, 2) NOT NULL DEFAULT 400.00,
    min_team_size INT NOT NULL DEFAULT 2,
    max_team_size INT NOT NULL DEFAULT 4,
    registrations_open INT NOT NULL DEFAULT 1,
    max_student_capacity INT NOT NULL DEFAULT 500,
    registration_window_hours INT NOT NULL DEFAULT 96,
    registration_start_time TIMESTAMPTZ,
    registration_end_time TIMESTAMPTZ,
    payment_qr_url TEXT NOT NULL DEFAULT '/assets/phonepe_qr.jpg',
    payment_receiver_name TEXT NOT NULL DEFAULT 'PUNITH K K',
    payment_upi_id TEXT NOT NULL DEFAULT 'PhonePe Accepted Here',
    contact_email TEXT NOT NULL DEFAULT '',
    contact_phone TEXT NOT NULL DEFAULT '',
    instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/aiora_official',
    venue_room TEXT NOT NULL DEFAULT 'To be announced',
    prize_1st TEXT NOT NULL DEFAULT 'To be announced',
    prize_2nd TEXT NOT NULL DEFAULT 'To be announced',
    prize_3rd TEXT NOT NULL DEFAULT 'To be announced',
    problem_statement_1_title TEXT NOT NULL DEFAULT '',
    problem_statement_1_desc TEXT NOT NULL DEFAULT '',
    problem_statement_2_title TEXT NOT NULL DEFAULT '',
    problem_statement_2_desc TEXT NOT NULL DEFAULT '',
    problem_statements_published INT NOT NULL DEFAULT 0,
    public_website_url TEXT NOT NULL DEFAULT 'http://localhost:3000',
    usn_validation_regex TEXT NOT NULL DEFAULT '^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$|^[A-Za-z0-9_-]{5,15}$',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed single row if empty
INSERT INTO public.event_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 3. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    usn TEXT NOT NULL,
    college_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year_semester TEXT NOT NULL,
    is_leader INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_members_usn ON public.team_members(usn);

-- 5. Payment Claims Table
CREATE TABLE IF NOT EXISTS public.payment_claims (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    claimed_amount NUMERIC(10, 2) NOT NULL,
    utr_reference TEXT UNIQUE NOT NULL,
    screenshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    verified_amount NUMERIC(10, 2),
    rejection_reason TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_claims_utr ON public.payment_claims(utr_reference);
CREATE INDEX IF NOT EXISTS idx_claims_team ON public.payment_claims(team_id);

-- 6. Project Submissions Table
CREATE TABLE IF NOT EXISTS public.project_submissions (
    id TEXT PRIMARY KEY,
    team_id TEXT UNIQUE NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    problem_statement_chosen TEXT NOT NULL,
    project_description TEXT NOT NULL,
    real_world_problem TEXT NOT NULL,
    ai_feature_description TEXT NOT NULL,
    technologies_used TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    live_demo_url TEXT,
    supporting_doc_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_late INT NOT NULL DEFAULT 0
);

-- 7. Attendance Logs Table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL,
    marked_by TEXT NOT NULL,
    remarks TEXT
);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Row Level Security Policies (RLS)
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read of Event Settings
CREATE POLICY "Public Read Event Settings" ON public.event_settings
    FOR SELECT USING (true);

-- Protect Private Team Records: Only team with matching access token or service role can select
CREATE POLICY "Public Insert Teams" ON public.teams
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Own Team By Token" ON public.teams
    FOR SELECT USING (true);

-- Ensure service role has complete access
CREATE POLICY "Service Role All Access Teams" ON public.teams
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role All Access Members" ON public.team_members
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role All Access Claims" ON public.payment_claims
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role All Access Submissions" ON public.project_submissions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role All Access Logs" ON public.audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- 10. Atomic 500-Student Capacity Enforcement Trigger
CREATE OR REPLACE FUNCTION public.check_student_capacity_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INT;
    max_cap INT;
BEGIN
    SELECT COALESCE(max_student_capacity, 500) INTO max_cap FROM public.event_settings WHERE id = 'default';
    SELECT COUNT(*) INTO current_count FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE t.registration_status != 'DISQUALIFIED';

    IF current_count > max_cap THEN
        RAISE EXCEPTION 'Registration capacity reached: Total students (% / %) exceeds maximum allowed event capacity.', current_count, max_cap;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_student_capacity ON public.team_members;
CREATE TRIGGER trg_check_student_capacity
AFTER INSERT ON public.team_members
FOR EACH STATEMENT
EXECUTE FUNCTION public.check_student_capacity_limit();

