# ScheduleHero — CLAUDE.md

## What this is
ScheduleHero is HelloHero's internal scheduling + case management tool for therapy providers. Replaces Google Sheets with a full-featured web app. Schedulers manage student queues, provider schedules, wellness circles, contacts, tasks, and reports.

## Project location
`~/Desktop/dev/hellohero-scheduling`

## Dev Commands

```bash
# Start development server
cd ~/Desktop/dev/hellohero-scheduling
npm run dev
```
Then open: **http://localhost:3000**

```bash
# Build to check for TypeScript errors
npm run build

# Lint
npm run lint
```

## GitHub
Repo: `https://github.com/aamirprinceali/schedulehero`
Push: `git push origin main`

## Stack
- **Next.js 16** (App Router, TypeScript)
- **Zustand 5** (state management, persisted to localStorage)
- **Tailwind CSS 4** (utility styles where needed)
- **Custom CSS** (design system in `app/globals.css`)
- **Google Fonts**: Bricolage Grotesque (headings) + Plus Jakarta Sans (body)
- **Lucide React** (icons)
- **@dnd-kit** (installed, ready for playground drag-and-drop in Phase 4)
- **localStorage key**: `schedulehero-v1`

## Design System
All styles are in `app/globals.css`. Key classes:
- `.card` — standard card container
- `.btn`, `.btn-primary`, `.btn-accent`, `.btn-outline`, `.btn-ghost`, `.btn-danger`, `.btn-sm` — buttons
- `.badge`, `.badge-green/amber/red/blue/purple/slate/orange` — status badges
- `.data-table` — standard data tables
- `.input`, `.input-sm` — form inputs
- `.sidebar-nav-item` — nav links (active state: orange left bar)
- `.tslot`, `.tslot-open/filled/wc/assess/buffer/lunch/drive` — timeline slots
- `.modal-overlay`, `.modal-box`, `.modal-box-wide`, `.modal-box-xl` — modals
- `.alert`, `.alert-amber/red/green/blue` — alert banners
- `.slide-panel`, `.slide-panel-overlay` — slide-out panels
- `.stat-card`, `.stat-value`, `.stat-label` — dashboard stat cards
- `.cap-bar`, `.cap-fill`, `.cap-green/amber/red` — capacity progress bars
- `.empty-state` — empty state messages
- `.page-header`, `.page-title`, `.page-subtitle` — page layout helpers

## Navigation
```
/           → redirects to /queue
/queue      → Ready to Schedule Queue (main daily-use page)
/schedule   → Timeline calendar (Mon-Fri, per-provider columns)
/scheduled  → All active scheduled students
/circles    → Wellness Circles management
/cancelled  → Cancelled & Ended students (with Return to Queue)
/dashboard  → Overview stats, alerts, capacity
/providers  → Provider management
/districts  → Districts & Schools
/tasks      → Tasks (personal + system-generated)
/contacts   → District contacts + parent rollup
/reports    → Session counts, cancellation analytics, WC utilization
/settings   → Data reset, system summary, roadmap
```

## Key Architecture
- **Student statuses**: `Needs Scheduling | Scheduled | Cancelled | Ended`
- **Student assignments**: Two optional buckets: `individual?` (1:1/Assessment) and `wellnessCircle?` (WC enrollment) — a student can have BOTH simultaneously
- **Queue = students with status 'Needs Scheduling'** — no separate data structure
- **Stale queue threshold**: 5 days (STALE_QUEUE_DAYS in types.ts)
- **Wellness Circles**: Separate data type, up to 10 students per circle. NOT just a session type flag.
- **Slot generation**: Provider weekly template → `generateAllSlots()` → slots array in store
- **Day window**: 7:30 AM – 5:00 PM (DAY_START = 450 min, DAY_END = 1020 min)
- **Drive time**: 30 min default (DRIVE_DURATION)
- **Confirmation flow**: Every scheduling action → `ConfirmModal` → start date required → commit

## Sample Data
- **2 Providers**: Maria Santos (orange, Mon-Thu), James Wright (sky blue, Mon-Fri)
- **2 Wellness Circles**: Maria's Tuesday group (Holmes, 3 enrolled), James's Thursday group (North Albany, 1 enrolled)
- **8 Students**: Mix of scheduled, queue, stale (Tyler Johnson - 8 days old), dual-enrolled (Marcus Davis - 1:1 + WC), WC-only, and cancelled with history (Liam Brown)
- **3 Districts**: WSD (Wilmington), GASD (Greater Albany), St. Clairsville ISD

## Current Build Status (v1.0)
All Phase 1 + Phase 2 + Phase 3 pages complete:
- ✅ lib/types.ts — full type system
- ✅ lib/store.ts — full Zustand store + CRUD
- ✅ lib/slotGenerator.ts — slot generation + capacity math
- ✅ lib/data.ts — rich sample data
- ✅ lib/dateUtils.ts — date math, stale flag, session counting
- ✅ app/globals.css — full design system
- ✅ components/Sidebar.tsx — ScheduleHero branding + nav
- ✅ components/ui/ConfirmModal.tsx — confirmation + date prompt
- ✅ components/ui/QuickAssignPanel.tsx — Quick Schedule slide-out
- ✅ app/queue/page.tsx — Ready to Schedule Queue
- ✅ app/schedule/page.tsx — Timeline calendar
- ✅ app/scheduled/page.tsx — Active students master list
- ✅ app/circles/page.tsx — Wellness Circles management
- ✅ app/cancelled/page.tsx — Cancelled & Ended + Return to Queue
- ✅ app/dashboard/page.tsx — Dashboard overview
- ✅ app/tasks/page.tsx — Tasks
- ✅ app/contacts/page.tsx — District + parent contacts
- ✅ app/reports/page.tsx — Session reports + analytics
- ✅ app/settings/page.tsx — Data reset + system info
- ✅ app/providers/page.tsx — Provider management (existing, working)
- ✅ app/districts/page.tsx — Districts & Schools (existing, working)

## Still TODO (Phase 4+)
- [ ] Extend providers page with capacity thresholds (visual red/yellow/green)
- [ ] Playground mode on Schedule page (drag-and-drop @dnd-kit, clears on exit)
- [ ] GUIDE.md — user guide for Reena
- [ ] Global search bar in sidebar
- [ ] Email generation page (Phase 6 — last)
- [ ] Supabase migration (Phase 2 backend)
