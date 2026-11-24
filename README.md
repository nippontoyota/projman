# Incheon Mobility – River Projects Master Platform

> Executive Project Management, Visual Gantt Timeline, and Milestone Tracker for River EV Showroom Launches across Kerala.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.4-f43f5e?logo=framer)

---

## 📌 Executive Overview

**Incheon Mobility** (Nippon Toyota Group) is expanding the dealership and service network for **River EV** (River Indie) across Kerala. Opening each dealership requires tracking multiple sequential phases—from initial site identification and River OEM technical approvals, through lease agreements and BOQ sanctions, to civil execution, Trade Certificate (TC) clearance, and commercial launch.

This platform provides executive visibility into:
1. **Bottleneck Radar**: Real-time identification of where projects are stalled (landlord negotiations, River OEM drawings, municipal regularisation, contractor execution).
2. **Visual Gantt Timeline**: 19-month horizontal span (Sep 2025 to Mar 2027) with schedule health indicators.
3. **Target Tracking**: Countdown to the fixed completion deadline of **31 March 2027**.
4. **Empirical Benchmarks**: Stage-wise historical SLAs tracking delays against portfolio averages.

---

## 🚀 Key Features

* **Visual Gantt Timeline (Main View):** Full 19-month visual timeline mapping all 15 active tracks across Kerala with color-coded schedule health (*Commissioned*, *On Track*, *Watchlist*, *Delayed >30d*, *Action Needed*).
* **Executive Dashboard:** Live KPI cards, portfolio distribution breakdown, stage benchmarks, and critical bottleneck alerts.
* **21-Milestone Matrix:** Comprehensive 4-phase tracking grid with inline status markers and completion dates.
* **Role-Based Access Control (RBAC):**
  * **Admin:** Create new projects (prompts Brand, Location, Facility Type), edit target dates, update master parameters, delete projects.
  * **User / Site Engineer:** Update milestone status, log completion dates, record remarks, and flag blockers.
* **Bottlenecks Radar:** Log, categorize, track, and resolve site impediments with severity tagging.
* **One-Click Excel Export:** Instant export of projects and dashboard metrics to formatted `.xlsx` workbooks.
* **Master Reset Capability:** One-click restoration of the pristine 15-project baseline dataset.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js (App Router) + React 19 |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 (Dark Automotive Clean-Tech Theme) |
| **Animations** | Framer Motion (Tab sliders, drawer transitions, staggered cards) |
| **Database & ORM** | Prisma ORM with SQLite (`dev.db`) locally; zero-config PostgreSQL swappable |
| **Spreadsheet Engine** | SheetJS (`xlsx`) for Excel import/export |
| **Icons** | Lucide React |

---

## 📂 Project Structure

```
projman/
├── docs/
│   ├── ARCHITECTURE.md     # Domain models & 21-milestone lifecycle specification
│   └── API.md              # REST API reference and payload schemas
├── prisma/
│   ├── schema.prisma       # Relational Prisma schema (Brand, Location, Project, etc.)
│   └── seed.ts             # Master seed script with all 15 Incheon Mobility tracks
├── src/
│   ├── app/
│   │   ├── api/            # REST API route handlers
│   │   │   ├── blockers/   # Blocker logging & resolution
│   │   │   ├── milestones/ # Checkpoint date & status updates
│   │   │   ├── projects/   # Project CRUD operations
│   │   │   ├── seed/       # Master dataset reset
│   │   │   └── stats/      # Executive KPIs & stage benchmarks
│   │   ├── globals.css     # Dark automotive theme & scrollbars
│   │   ├── layout.tsx      # Root HTML shell & metadata
│   │   └── page.tsx        # Main application state & tab manager
│   ├── components/
│   │   ├── Header.tsx                # Navigation & role switcher
│   │   ├── GanttChart.tsx            # 19-month visual timeline
│   │   ├── ExecutiveDashboard.tsx    # KPI metrics & benchmark tables
│   │   ├── ProjectTracker.tsx        # 21-milestone matrix grid
│   │   ├── BlockerManager.tsx        # Bottleneck escalation radar
│   │   ├── CreateProjectModal.tsx    # Admin project creation modal
│   │   └── ProjectDetailDrawer.tsx   # Milestone drill-down & audit trail
│   ├── lib/
│   │   ├── prisma.ts       # Singleton PrismaClient instance
│   │   └── excelExport.ts  # Spreadsheet workbook generator
│   └── types/
│       └── index.ts        # Shared TypeScript domain interfaces
├── Dockerfile              # Multi-stage production container
├── docker-compose.yml      # Container orchestration
└── package.json            # Project dependencies & scripts
```

---

## ⚡ Quick Start

### 1. Prerequisites
* Node.js v20+ or v25+
* npm v10+

### 2. Installation
```bash
git clone <repo-url>
cd projman
npm install
```

### 3. Database Initialization & Seeding
```bash
npx prisma db push
npm run seed
```

### 4. Start Development Server
```bash
npm run dev -- -p 3001
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.

---

## 🚢 Production Deployment

### Docker Deployment
```bash
docker compose up -d --build
```

### Standalone Node Build
```bash
npm run build
npm run start -- -p 3000
```

---

## 📄 License
Internal proprietary operational system developed for **Incheon Mobility**.
