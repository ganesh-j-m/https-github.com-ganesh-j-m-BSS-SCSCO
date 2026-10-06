# SCSCO College Digital Platform

> **Autonomous Premier Academic Operating System & Cryptographic Smart QR Attendance Platform**

---

## 1. Project Overview

**SCSCO College Digital Platform** is a full-stack academic management system engineered for modern higher education institutions. Built from the ground up with strict adherence to academic compliance (NAAC A++ standards), the platform solves the widespread challenge of proxy attendance through a **Cryptographically Secured 5-Minute Dynamic QR Attendance Engine**.

### Key System Capabilities
- **Smart QR Attendance System**: Server-authoritative 5-minute dynamic QR codes, mobile camera scanning, 12-step validation pipeline, and unique constraint duplicate protection.
- **Projector-Optimized Classroom Mode**: High-contrast, large-format classroom projection screen with live countdown timer, present/expected counters, and live student attendance list updating automatically.
- **Digital Student ID Card**: Permanent, printable digital campus identity card with separate, distinct permanent ID QR code (strictly decoupled from attendance QR).
- **Multi-Role Portals**: Dedicated, role-tailored dashboards and authorization for **Student**, **Teacher**, **HOD**, **Principal**, **Admin**, and **Parent**.
- **Admin CMS**: In-browser real-time management of notices, circulars, campus events, press news, and photo gallery without source code modifications.
- **Attendance Auditing**: Audited manual corrections requiring mandatory justifications and permanent log preservation.

---

## 2. Technology Stack

- **Framework**: React 19, TypeScript, Vite & Next.js Architecture
- **Styling & Typography**: Tailwind CSS with global **Poppins** typography
- **Data Persistence**: PostgreSQL compatible relational database with complete Prisma ORM schema (`40+ models`)
- **QR Generation & Scanning**: `qrcode` & `jsqr` with mobile camera video stream processing
- **Data Visualization**: Recharts (interactive Bar charts, Donut charts)
- **Icons & Animations**: Lucide React & Canvas Confetti
- **Deployment**: Vercel & Supabase PostgreSQL compatible

---

## 3. Demo Accounts & Institutional Roles

You can test any role instantly using the **One-Click Demo Role Switcher** in the top navigation bar, or log in manually:

| Role | Name | Email | Password | Primary Functions |
|---|---|---|---|---|
| **Student (Div A)** | Aarav Patel | `student@scsco.edu` | `password123` | Digital ID, Camera QR Scanner, Timetable, Results, Fees, Assignments |
| **Student (Div A)** | Ananya Sharma | `student2@scsco.edu` | `password123` | Second student in BCS 3rd Year Div A for attendance testing |
| **Student (Div B)** | Pooja Verma | `student4@scsco.edu` | `password123` | Used for testing Wrong Division boundary protection |
| **Student (Mech)** | Siddharth Nair | `student5@scsco.edu` | `password123` | Used for testing Wrong Class boundary protection |
| **Teacher** | Prof. Vikramaditya Joshi | `teacher@scsco.edu` | `password123` | Launch 5-min QR Attendance, Projector Screen, Coursework, Reports |
| **HOD** | Dr. Meera Deshmukh | `hod@scsco.edu` | `password123` | Department Attendance Analytics, Defaulter Students Alert (&lt;75%) |
| **Principal** | Dr. Arvind Kulkarni | `principal@scsco.edu` | `password123` | Institutional Analytics, Recharts graphs, Accreditation readiness |
| **Admin** | Dr. Rajeshwari Sharma | `admin@scsco.edu` | `password123` | Master CMS (Notices, Events, News), Student Directory, System Audit |
| **Parent** | Sunil Patel | `parent@scsco.edu` | `password123` | Ward attendance monitoring, Fee status, Contact faculty |

---

## 4. Smart QR Attendance Workflow

```text
Teacher Logs In
      ↓
Selects Class (e.g. BCS 3rd Year), Division (A), Subject (Web Technology)
      ↓
Clicks "Generate Attendance QR"
      ↓
Server creates AttendanceSession with random tokenHash
      ↓
startsAt = serverNow, expiresAt = serverNow + 5 minutes
      ↓
Classroom Projector Screen displays large QR + Live 05:00 Countdown
      ↓
Student opens "Scan Attendance QR" on mobile camera
      ↓
Server validates:
  [1] Student Authenticated?
  [2] Session Exists & ACTIVE?
  [3] Current Time < expiresAt (strictly 5 minutes)?
  [4] Student in Class?
  [5] Student in Division?
  [6] Student Enrolled in Subject?
  [7] UNIQUE(sessionId, studentId) constraint (No Duplicate)?
      ↓
Attendance Marked as PRESENT
      ↓
Teacher Screen Live Count updates automatically
      ↓
After 5 minutes: Session marked EXPIRED
```

---

## 5. Local Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/scsco-college/scsco-college-platform.git
cd scsco-college-platform

# 2. Install dependencies
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Run database migrations (requires DATABASE_URL in .env)
npx prisma migrate dev --name init_college_platform

# 5. Seed initial data
npm run seed

# 6. Start development server
npm run dev
```

---

## 6. Verification and Testing

See [`docs/TESTING.md`](docs/TESTING.md) and [`docs/QR_ATTENDANCE_TEST_PLAN.md`](docs/QR_ATTENDANCE_TEST_PLAN.md) for full execution details of all 10 verification test cases.
