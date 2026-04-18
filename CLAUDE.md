# HelloHero Scheduling

## What this is
A scheduling management tool for therapy/services providers (speech therapists, behavioral therapists, etc.) who work across multiple schools and districts. Lets admins manage providers, students, and weekly schedules visually.

## Project location
`~/Desktop/dev/hellohero-scheduling`

## How to run
```bash
cd ~/Desktop/dev/hellohero-scheduling
npm run dev
```
Then open: http://localhost:3000

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management via useSchedulingStore)
- localStorage for data persistence

---

## Complete Feature List

### Schedule View (main view)
- Visual timeline grid: 8am–4pm, one column per active provider
- Day selector: Monday through Friday
- Filter by provider (show all or one specific provider)
- Filter by school/district
- Slot types displayed on timeline:
  - **1:1 Session** — individual therapy (green when open, orange when filled)
  - **Wellness Circle (WC)** — group session (teal)
  - **Assessment** — evaluation session (yellow)
  - **Lunch** — configurable lunch block (blue)
  - **Drive** — travel time between schools (purple)
  - **Buffer** — padding time (pink)
- Assign a student to any open session slot (modal picker)
- Unassign a student from a filled slot
- Adjust lunch time per provider via modal
- See provider daily capacity (how many sessions they can fit)

### Students Management
- Full list of all students with add / edit / delete
- Student fields: name, district/school, session type, status
- Session types: 1:1 Individual, Wellness Circle, Assessment
- Student statuses: Needs Scheduling, Scheduled, Cancelled, No-Show, Make-Up
- Color-coded status badges
- Filter students by: status, session type, district
- See which students still need scheduling (highlighted alert)
- View assigned time slot per student

### Districts & Schools Management
- Add and manage districts
- Each district contains multiple schools
- Schools are referenced throughout the scheduling system

### Providers Management
- Add and manage therapy providers
- Each provider has assigned slots across the week
- Toggle providers active/inactive
- Provider capacity calculated dynamically per day

### Data & State
- All data stored in Zustand store (persisted to localStorage)
- Store manages: providers, students, slots, districts
- Slot assignment tracked with student ID reference

---

## Current Status
- App scaffolded and running
- Schedule, Students, Districts pages built
- Core slot assignment logic working
- localStorage persistence in place

## What still needs work
- [ ] Providers management page (UI for adding/editing providers)
- [ ] Reporting / export
- [ ] Print-friendly schedule view
- [ ] Authentication (currently no login)
- [ ] Backend/database (currently all localStorage)

## Project structure
```
app/
  schedule/   — Main timeline scheduling view
  students/   — Student list + management
  districts/  — Districts and schools
  dashboard/  — Overview dashboard
  settings/   — App settings
  help/       — Help page
components/
  students/   — StudentForm and student components
  ui/         — Modal and shared UI
lib/
  store.ts    — Zustand store (all app state)
  types.ts    — TypeScript types (TimeSlot, Student, Provider, etc.)
  slotGenerator.ts — Logic for generating and calculating slots
```
