# AIORA — AI × Web Development Hackathon Platform

Official website and event administration platform for **AIORA — AI × Web Development Hackathon**, organized by the **Department of Artificial Intelligence and Machine Learning** at **Karavali Institute of Technology, Mangaluru, Karnataka, India**.

> **Event Date:** Thursday, 5 November 2026  
> **Arrival & Check-in Window:** 9:00 AM – 9:30 AM IST (Strict arrival cutoff: 9:30 AM IST)  
> **Official Programme:** 9:30 AM – 3:00 PM IST  
> **Final Project Submission Deadline:** 3:00 PM IST sharp  
> **Registration Fee:** ₹400 per team  
> **Team Size:** 2 to 4 students (including Team Leader)  
> **Organizing Forum:** AIORA  

---

## 🚀 Live Overview & Core Features

1. **Multi-Step Team Registration (`/register`)**
   - **Step 1:** Team & Leader Contact (Name, College, Dept, Year, Email, Mobile).
   - **Step 2:** Member Roster (Dynamically add 1 to 3 additional members; validates 2–4 total count).
   - **Step 3:** Summary Review & Rule Acceptance.
   - **Step 4:** UPI Payment via official PhonePe QR code, UTR reference entry, and optional receipt upload.
   - **Protection:** Prevents duplicate USNs within teams and across registrations; atomic server validation.

2. **Official Payment System & Dynamic QR Code Manager**
   - Supplied PhonePe QR code (`receiver: PUNITH K K`) preserved with original sharpness and proportions.
   - **Dynamic QR Upload:** Organizers can easily upload a new QR code image at `/admin/settings` or revert to the default PhonePe QR at any time without redeploying code.
   - **Manual Verification Workflow:** Submitting a UTR leaves the team in `CLAIMED / PENDING VERIFICATION`. Only an authorized administrator can approve claims after cross-referencing account statements.
   - Idempotent transaction references prevent duplicate UTR claims across teams.

3. **Secure Admin Dashboard (`/admin`)**
   - Access via `/admin/login` (Admin credentials secured with salted password hashes and HTTP-only session cookies).
   - Real-time database counters: Total Teams, Total Students, Confirmed Teams, Pending Payments, Verified Collection, Checked-in Teams, and Submitted Projects.
   - **Teams Roster (`/admin/teams`):** Search, filter by status, inspect complete student rosters with USNs, disqualify/reinstate teams.
   - **Payment Queue (`/admin/payments`):** Approve, reject with reason, view payment screenshots, reverse approvals with full audit logging.
   - **Morning Check-In Desk (`/admin/attendance`):** 9:00 AM–9:30 AM arrival gate, late arrival flags, and room allocation notes.
   - **Submissions Review (`/admin/submissions`):** Inspect GitHub repos, live demo URLs, problem statement choices, and AI implementation notes.
   - **Event Settings (`/admin/settings`):** Live configuration of contact email, phone, Instagram URL, room allocations, prize amounts, problem statements, and Payment QR code image upload.
   - **CSV Data Exports (`/admin/exports`):** One-click exports of teams, member USNs, verified payments, attendance, and executive summary.

4. **Project Submission Portal (`/submission`)**
   - Locked to registered teams via Registration ID and Team Access Token.
   - Requires selecting one of the two official problem statements (published by organizers).
   - Enforces strict 3:00 PM IST server-side deadline; rejects submissions made after the cutoff.

5. **Promotional Poster Generator (`/posters`)**
   - High-resolution, branded layouts:
     - **Social Media Portrait** (1080 × 1350 px)
     - **Story Layout** (1080 × 1920 px)
     - **Printable A4 Sheet**
   - Features the official extracted AIORA Forum circular logo, event dates, fee, prize positions, and an automatically generated registration QR code pointing to the live `/register` URL.

6. **Public Event Pages**
   - `/` — Hero, countdown timer, schedule highlights, 100-mark judging rubric, FAQ, organizer contact.
   - `/about` — Department of AI & ML, Karavali Institute of Technology, AIORA Forum overview.
   - `/rules` — All 16 official hackathon rules verbatim with evaluation criteria table.
   - `/instructions` — Structured checklist (Before Event, On Event Day, After Submitting).
   - `/schedule` — Chronological programme in IST.
   - `/payment-status` — Public lookup by Registration ID to track verification status and view/print the official Team Pass.
   - `/faq` — Detailed answers to participant questions.
   - `/contact` — Configurable organizer contact details.
   - `/privacy` — Student USN and personal data protection policy.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript.
- **Styling:** Tailwind CSS v4 with bespoke Obsidian & Cyan Glassmorphism theme (`#07090e` obsidian navy, `#00f0ff` cyber cyan, `#2563eb` electric blue, `#8b5cf6` violet).
- **Icons:** Lucide Icons.
- **Database:**
  - **Local/Self-Hosted:** `better-sqlite3` persisting to `data/aiora.db` with ACID transactions, atomic schema initialization, and foreign keys enabled.
  - **Cloud/Supabase:** Complete PostgreSQL schema migration with Row Level Security (RLS) located at `supabase/migrations/20261105000000_aiora_initial_schema.sql`.
- **Assets:** Official AIORA Forum circle logo and official PhonePe QR code (`public/assets/`).

---

## 🔑 Default Administrator Credentials

To access the admin portal:
- **URL:** `http://localhost:3000/admin/login` (or `/admin/login` on your deployed domain)
- **Username:** `admin`
- **Password:** `AioraOrganizers@2026`

*(You can change this password or configure additional administrators in the database or via environment variables).*

---

## ⚙️ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The database `data/aiora.db` will initialize and seed default event settings automatically.

- **Total Capacity Limit:** Strictly capped at 500 students in total across all teams (2–4 students per team). Atomic server-side checks and PostgreSQL database triggers prevent race conditions.
- **Registration Window:** Configurable 96-hour window in `Asia/Kolkata` (IST) time zone. The website remains online after the window closes or capacity is reached, while new registrations are rejected on the server.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript.
- **Styling:** Tailwind CSS v4 with bespoke Obsidian & Cyan Glassmorphism theme (`#07090e` obsidian navy, `#00f0ff` cyber cyan, `#2563eb` electric blue, `#8b5cf6` violet).
- **Icons:** Lucide Icons.
- **Database:**
  - **Local/Self-Hosted:** `better-sqlite3` persisting to `data/aiora.db` with ACID transactions, atomic schema initialization, and foreign keys enabled.
  - **Cloud/Supabase:** Complete PostgreSQL schema migration with Row Level Security (RLS) located at `supabase/migrations/20261105000000_aiora_initial_schema.sql`, featuring a trigger `check_student_capacity_limit()` that enforces the 500-student cap directly inside PostgreSQL.
- **Assets:** Official AIORA Forum circle logo and official PhonePe QR code (`public/assets/`).

---

## 🔑 Default Administrator Credentials

To access the admin portal:
- **URL:** `http://localhost:3000/admin/login` (or `/admin/login` on your deployed domain)
- **Username:** `admin`
- **Password:** `AioraOrganizers@2026`

*(You can change this password at `/admin/settings` or configure additional administrators in the database or via environment variables).*

---

## ⚙️ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The database `data/aiora.db` will initialize and seed default event settings automatically.

### 4. Run Acceptance Tests
A comprehensive test suite of 48 assertions validating the registration pipeline, team-size constraints, payment approval, 96-hour window closure, 500-capacity overflow rejection, attendance check-in, CSV exports, and database stats is included:
```bash
node test_acceptance.mjs
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🌐 Complete Step-by-Step Production Deployment Guide

Follow these steps to deploy the AIORA Hackathon platform to the public internet with a persistent shared database and HTTPS URL.

### STEP 1: Push Code to GitHub
1. Create a new repository on GitHub (e.g., `aiora-hackathon`).
2. Make sure your local repository is committed:
   ```bash
   git add .
   git commit -m "feat: complete production-ready AIORA hackathon platform with 96-hr window and 500 capacity"
   ```
3. Set your remote and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/aiora-hackathon.git
   git push -u origin main
   ```

### STEP 2: Set Up Shared Online Database (Supabase PostgreSQL)
1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and name it `aiora-hackathon`. Set a strong database password and choose your region (e.g. `ap-south-1` Mumbai / India).
3. Once the project is created, open the **SQL Editor** in the left sidebar.
4. Copy the entire contents of `supabase/migrations/20261105000000_aiora_initial_schema.sql` and paste it into the SQL Editor.
5. Click **Run**. This provisions all tables, indexes, Row-Level Security (RLS) policies, and the `check_student_capacity_limit()` trigger for the 500-student cap.
6. In Supabase, go to **Project Settings** → **API**. Note down:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **anon / public key**
   - **service_role key** (secret key used by the Next.js server)

### STEP 3: Deploy to Vercel (Public HTTPS Link)
1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** → **Project**, and select your `aiora-hackathon` GitHub repository.
3. In **Environment Variables**, add the following required keys:
   | Variable Name | Description | Example / Recommended Value |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_APP_URL` | Your public production domain | `https://aiora.vercel.app` |
   | `ADMIN_USERNAME` | Administrator login username | `admin` |
   | `ADMIN_PASSWORD` | Strong production admin password | `SetYourOwnStrongPassword2026!` |
   | `ADMIN_JWT_SECRET` | 32+ character random secret | `generate_with_openssl_rand_hex_32` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase public anon key | `eyJhbGciOi...` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase server role secret | `eyJhbGciOi...` |
4. Click **Deploy**. Vercel will build the project and issue a free SSL certificate with a public HTTPS URL (e.g., `https://aiora-hackathon.vercel.app`).
5. Once deployed, update `NEXT_PUBLIC_APP_URL` in Vercel settings if you attach a custom domain (e.g. `https://aiora.karavali.edu.in`).

### STEP 4: Configure the 96-Hour Registration Window in Admin Panel
1. Navigate to `https://your-domain.vercel.app/admin/login`.
2. Sign in with your admin credentials.
3. Open **Settings** (`/admin/settings`).
4. In the **"96-Hour Registration Window & 500-Student Capacity"** section:
   - Click **"⚡ Start 96-Hour Window Now (IST)"** or set specific opening and closing timestamps.
   - Verify `Max Student Capacity` is set to `500`.
   - Toggle Registration Status to **OPEN FOR REGISTRATIONS**.
   - Click **Save Event Settings**.
5. Visit the homepage (`/`) and registration page (`/register`) to see the live green badge and remaining spots.

---

## 🔒 Security & Data Protection

- Student USNs and phone numbers are hidden from public endpoints; they are accessible only by authorized organizers in the admin portal or by the team itself via its private access token.
- UPI transaction references (UTR) must be unique across the platform.
- Project submission deadlines are enforced on the server in Asia/Kolkata time.
- All payment approval/rejection actions are permanently logged in the audit trail table.
- 500-student capacity limit and 96-hour window are strictly enforced on the server for all incoming registration requests.

