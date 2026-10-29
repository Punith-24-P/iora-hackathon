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

### 4. Run Acceptance Tests
A comprehensive test suite of 38 assertions validating the registration pipeline, team-size constraints, payment approval, attendance check-in, CSV exports, and database stats is included:
```bash
node test_acceptance.mjs
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## ☁️ Deployment Instructions

### Option A: Vercel with Supabase PostgreSQL (Recommended for Serverless)
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL migration in `supabase/migrations/20261105000000_aiora_initial_schema.sql` inside your Supabase SQL Editor.
3. In your Vercel Project Settings, add the environment variables:
   - `NEXT_PUBLIC_SITE_URL`: Your production URL (e.g. `https://aiora.example.com`).
   - `ADMIN_SESSION_SECRET`: A strong random string for signing admin session tokens.
4. Deploy the repository to Vercel.

### Option B: Node.js VM / Docker / VPS (Self-Hosted with SQLite)
1. Clone the repository onto your server (e.g. Ubuntu EC2, DigitalOcean Droplet, Railway).
2. Install dependencies: `npm ci`.
3. Build the application: `npm run build`.
4. Run using PM2 or Docker:
   ```bash
   pm2 start npm --name "aiora-hackathon" -- start
   ```
The persistent SQLite database will be stored safely in `data/aiora.db`.

---

## 🖼️ Uploading a New Payment QR Code

Organizers can update the payment QR code anytime without changing any code:
1. Log in to `/admin/login`.
2. Go to **Settings** (`/admin/settings`).
3. Under **Payment QR Code Manager**, click **"Upload New QR Image"** and choose your PNG/JPG file.
4. The new QR code will instantly appear on the `/register` payment step and payment instructions pages.
5. To revert to the original organizer PhonePe QR, click **"Reset to Default PhonePe QR"**.

---

## 📋 Event Rules Summary (Judging Criteria)

| Criterion | Marks |
| :--- | :--- |
| **Innovation & Originality** | 20 marks |
| **Real-World Usefulness** | 20 marks |
| **AI Implementation** | 20 marks |
| **Working Functionality** | 20 marks |
| **UI/UX & Web Design** | 10 marks |
| **Code Quality & Explanation** | 10 marks |
| **Total** | **100 marks** |

---

## 🔒 Security & Data Protection

- Student USNs and phone numbers are hidden from public endpoints; they are accessible only by authorized organizers in the admin portal or by the team itself via its private access token.
- UPI transaction references (UTR) must be unique across the platform.
- Project submission deadlines are enforced on the server in Asia/Kolkata time.
- All payment approval/rejection actions are permanently logged in the audit trail table.

