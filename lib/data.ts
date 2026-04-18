// ScheduleHero — Rich Sample Data
// 2 providers, 8 students (mix of statuses and nuances), 2 WCs, 3 districts

import { District, Provider, Student, WellnessCircle, Task } from './types';

// ─── Districts & Schools ─────────────────────────────────────────────────────

export const INITIAL_DISTRICTS: District[] = [
  {
    id: 'wsd',
    name: 'Wilmington School District',
    schools: ['Holmes', 'Denver', 'WMS', 'WHS'],
  },
  {
    id: 'gasd',
    name: 'Greater Albany School District',
    schools: ['North Albany Middle', 'Oak Grove Elementary', 'Oak Elementary', 'Lafayette'],
  },
  {
    id: 'scisd',
    name: 'St. Clairsville ISD',
    schools: ['St. Clairsville Elementary'],
  },
];

// ─── Provider Colors ─────────────────────────────────────────────────────────

export const PROVIDER_COLORS = [
  '#F97316', // warm orange
  '#0EA5E9', // sky blue
  '#8B5CF6', // violet
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#EC4899', // pink
];

// ─── Providers ───────────────────────────────────────────────────────────────

export const SAMPLE_PROVIDERS: Provider[] = [
  {
    id: 'provider-maria',
    name: 'Maria Santos',
    active: true,
    role: 'Clinical Provider',
    color: '#F97316',
    schedule: {
      // Denver all day — 1:1 sessions
      Monday: {
        isOff: false,
        morning: { school: 'Denver', sessionType: '1:1' },
      },
      // Holmes — 1:1 morning, WC afternoon (same school, no drive)
      Tuesday: {
        isOff: false,
        morning: { school: 'Holmes', sessionType: '1:1' },
        afternoon: { school: 'Holmes', sessionType: 'WC' },
      },
      // Split day — Denver AM, Holmes PM (drive block inserted)
      Wednesday: {
        isOff: false,
        morning: { school: 'Denver', sessionType: '1:1' },
        afternoon: { school: 'Holmes', sessionType: '1:1' },
      },
      // WMS all day — Assessments
      Thursday: {
        isOff: false,
        morning: { school: 'WMS', sessionType: 'Assessment' },
      },
      // OFF
      Friday: { isOff: true },
    },
    createdAt: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'provider-james',
    name: 'James Wright',
    active: true,
    role: 'Clinical Provider',
    color: '#0EA5E9',
    schedule: {
      // Oak Grove all day — 1:1
      Monday: {
        isOff: false,
        morning: { school: 'Oak Grove Elementary', sessionType: '1:1' },
      },
      // North Albany all day — 1:1
      Tuesday: {
        isOff: false,
        morning: { school: 'North Albany Middle', sessionType: '1:1' },
      },
      // Split — Oak Grove AM, Lafayette PM (drive block)
      Wednesday: {
        isOff: false,
        morning: { school: 'Oak Grove Elementary', sessionType: '1:1' },
        afternoon: { school: 'Lafayette', sessionType: '1:1' },
      },
      // North Albany — WC morning, 1:1 afternoon (same school, no drive)
      Thursday: {
        isOff: false,
        morning: { school: 'North Albany Middle', sessionType: 'WC' },
        afternoon: { school: 'North Albany Middle', sessionType: '1:1' },
      },
      // St. Clairsville all day — 1:1
      Friday: {
        isOff: false,
        morning: { school: 'St. Clairsville Elementary', sessionType: '1:1' },
      },
    },
    createdAt: new Date('2026-01-15').toISOString(),
  },
];

// ─── Wellness Circles ─────────────────────────────────────────────────────────

export const SAMPLE_WELLNESS_CIRCLES: WellnessCircle[] = [
  {
    id: 'wc-maria-tuesday',
    providerId: 'provider-maria',
    school: 'Holmes',
    day: 'Tuesday',
    startMinutes: 13 * 60 + 30, // 1:30 PM
    label: 'Tuesday Afternoon Group',
    maxStudents: 10,
    studentIds: ['student-marcus', 'student-sofia-wc', 'student-aisha-wc'],
    startDate: '2026-02-04',
    isActive: true,
    createdAt: new Date('2026-02-01').toISOString(),
  },
  {
    id: 'wc-james-thursday',
    providerId: 'provider-james',
    school: 'North Albany Middle',
    day: 'Thursday',
    startMinutes: 8 * 60 + 30, // 8:30 AM (matches DAY_START)
    label: 'Thursday Morning Group',
    maxStudents: 10,
    studentIds: ['student-isabella'],
    startDate: '2026-03-01',
    isActive: true,
    createdAt: new Date('2026-02-25').toISOString(),
  },
];

// ─── Students ────────────────────────────────────────────────────────────────
// 8 students: mix of scheduled, queued (one stale), cancelled, dual-enrolled

export const SAMPLE_STUDENTS: Student[] = [
  // 1. Emily Chen — Scheduled 1:1 with Maria (Denver, Monday)
  {
    id: 'student-emily',
    name: 'Emily Chen',
    dob: '2015-03-14',
    districtId: 'wsd',
    school: 'Denver',
    parentName: 'Linda Chen',
    parentEmail: 'lchen@email.com',
    parentPhone: '(614) 555-0101',
    notes: 'Very responsive family. Prefers morning sessions.',
    status: 'Scheduled',
    queuedAt: new Date('2026-02-10').toISOString(),
    individual: {
      slotId: 'provider-maria-Monday-450-session', // 7:30 AM slot
      providerId: 'provider-maria',
      day: 'Monday',
      school: 'Denver',
      startDate: '2026-03-10',
    },
    history: [
      {
        id: 'evt-1',
        type: 'queued',
        timestamp: new Date('2026-02-10').toISOString(),
        details: 'Added to Ready to Schedule queue.',
      },
      {
        id: 'evt-2',
        type: 'scheduled',
        timestamp: new Date('2026-02-14').toISOString(),
        details: 'Scheduled with Maria Santos — Monday 7:30 AM at Denver. Start date: March 10, 2026.',
      },
    ],
    dateAdded: new Date('2026-02-10').toISOString(),
  },

  // 2. Marcus Davis — In BOTH 1:1 (Maria, Tuesday) AND WC (Maria's Tuesday WC)
  {
    id: 'student-marcus',
    name: 'Marcus Davis',
    dob: '2014-07-22',
    districtId: 'wsd',
    school: 'Holmes',
    parentName: 'Denise Davis',
    parentEmail: 'ddavis@email.com',
    parentPhone: '(614) 555-0202',
    notes: 'Enrolled in both 1:1 and Wellness Circle on Tuesday — different time slots.',
    status: 'Scheduled',
    queuedAt: new Date('2026-02-01').toISOString(),
    individual: {
      slotId: 'provider-maria-Tuesday-450-session', // 7:30 AM 1:1
      providerId: 'provider-maria',
      day: 'Tuesday',
      school: 'Holmes',
      startDate: '2026-02-18',
    },
    wellnessCircle: {
      wcId: 'wc-maria-tuesday',
      startDate: '2026-02-18',
    },
    history: [
      {
        id: 'evt-3',
        type: 'queued',
        timestamp: new Date('2026-02-01').toISOString(),
        details: 'Added to Ready to Schedule queue.',
      },
      {
        id: 'evt-4',
        type: 'scheduled',
        timestamp: new Date('2026-02-10').toISOString(),
        details: 'Scheduled 1:1 with Maria Santos — Tuesday 7:30 AM at Holmes. Start date: Feb 18, 2026.',
      },
      {
        id: 'evt-5',
        type: 'wc_enrolled',
        timestamp: new Date('2026-02-10').toISOString(),
        details: 'Enrolled in Wellness Circle — Tuesday Afternoon Group with Maria Santos at Holmes.',
      },
    ],
    dateAdded: new Date('2026-02-01').toISOString(),
  },

  // 3. Sofia Ramirez — In WC only (Maria's Tuesday WC — she's the WC-only example)
  {
    id: 'student-sofia-wc',
    name: 'Sofia Ramirez',
    dob: '2016-11-05',
    districtId: 'wsd',
    school: 'Holmes',
    parentName: 'Maria Ramirez',
    parentEmail: 'mramirez@email.com',
    parentPhone: '(614) 555-0303',
    status: 'Scheduled',
    queuedAt: new Date('2026-02-15').toISOString(),
    wellnessCircle: {
      wcId: 'wc-maria-tuesday',
      startDate: '2026-03-01',
    },
    history: [
      {
        id: 'evt-6',
        type: 'queued',
        timestamp: new Date('2026-02-15').toISOString(),
        details: 'Added to Ready to Schedule queue.',
      },
      {
        id: 'evt-7',
        type: 'wc_enrolled',
        timestamp: new Date('2026-02-20').toISOString(),
        details: 'Enrolled in Wellness Circle — Tuesday Afternoon Group with Maria Santos at Holmes. Start date: March 1, 2026.',
      },
    ],
    dateAdded: new Date('2026-02-15').toISOString(),
  },

  // 4. Tyler Johnson — STALE in queue (added 8 days ago — past 5-day threshold)
  {
    id: 'student-tyler',
    name: 'Tyler Johnson',
    dob: '2015-09-30',
    districtId: 'wsd',
    school: 'Denver',
    parentName: 'Robert Johnson',
    parentEmail: 'rjohnson@email.com',
    parentPhone: '(614) 555-0404',
    notes: 'Referral from school counselor. Family has been contacted but hasn\'t confirmed availability.',
    status: 'Needs Scheduling',
    queuedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago = STALE
    history: [
      {
        id: 'evt-8',
        type: 'queued',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        details: 'Added to Ready to Schedule queue.',
      },
    ],
    dateAdded: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // 5. Aisha Williams — Fresh in queue (added 2 days ago — not stale)
  {
    id: 'student-aisha',
    name: 'Aisha Williams',
    dob: '2016-04-12',
    districtId: 'gasd',
    school: 'North Albany Middle',
    parentName: 'Tamara Williams',
    parentEmail: 'twilliams@email.com',
    parentPhone: '(740) 555-0505',
    status: 'Needs Scheduling',
    queuedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    history: [
      {
        id: 'evt-9',
        type: 'queued',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        details: 'Added to Ready to Schedule queue.',
      },
    ],
    dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // 6. Aisha in WC (different student, 3rd WC member for Maria's group)
  {
    id: 'student-aisha-wc',
    name: 'Jaylen Brooks',
    dob: '2015-06-18',
    districtId: 'wsd',
    school: 'Holmes',
    parentName: 'Marcus Brooks',
    parentEmail: 'mbrooks@email.com',
    parentPhone: '(614) 555-0606',
    status: 'Scheduled',
    queuedAt: new Date('2026-02-18').toISOString(),
    wellnessCircle: {
      wcId: 'wc-maria-tuesday',
      startDate: '2026-03-01',
    },
    history: [
      {
        id: 'evt-10',
        type: 'queued',
        timestamp: new Date('2026-02-18').toISOString(),
        details: 'Added to Ready to Schedule queue.',
      },
      {
        id: 'evt-11',
        type: 'wc_enrolled',
        timestamp: new Date('2026-02-20').toISOString(),
        details: 'Enrolled in Wellness Circle — Tuesday Afternoon Group with Maria Santos at Holmes.',
      },
    ],
    dateAdded: new Date('2026-02-18').toISOString(),
  },

  // 7. Isabella Torres — Enrolled in James's Thursday WC
  {
    id: 'student-isabella',
    name: 'Isabella Torres',
    dob: '2014-12-03',
    districtId: 'gasd',
    school: 'North Albany Middle',
    parentName: 'Carmen Torres',
    parentEmail: 'ctorres@email.com',
    parentPhone: '(740) 555-0707',
    status: 'Scheduled',
    queuedAt: new Date('2026-02-20').toISOString(),
    wellnessCircle: {
      wcId: 'wc-james-thursday',
      startDate: '2026-03-01',
    },
    history: [
      {
        id: 'evt-12',
        type: 'queued',
        timestamp: new Date('2026-02-20').toISOString(),
        details: 'Added to Ready to Schedule queue.',
      },
      {
        id: 'evt-13',
        type: 'wc_enrolled',
        timestamp: new Date('2026-02-25').toISOString(),
        details: 'Enrolled in Wellness Circle — Thursday Morning Group with James Wright at North Albany Middle.',
      },
    ],
    dateAdded: new Date('2026-02-20').toISOString(),
  },

  // 8. Liam Brown — CANCELLED with full history (shows in Cancelled page)
  {
    id: 'student-liam',
    name: 'Liam Brown',
    dob: '2015-01-20',
    districtId: 'wsd',
    school: 'Holmes',
    parentName: 'Sarah Brown',
    parentEmail: 'sbrown@email.com',
    parentPhone: '(614) 555-0808',
    notes: 'Family relocated to Columbus. May return to services in fall.',
    status: 'Cancelled',
    queuedAt: new Date('2026-01-20').toISOString(),
    cancellationReason: 'Family relocated',
    cancelledDate: '2026-03-28',
    history: [
      {
        id: 'evt-14',
        type: 'queued',
        timestamp: new Date('2026-01-20').toISOString(),
        details: 'Added to Ready to Schedule queue.',
      },
      {
        id: 'evt-15',
        type: 'scheduled',
        timestamp: new Date('2026-01-28').toISOString(),
        details: 'Scheduled 1:1 with Maria Santos — Tuesday 7:30 AM at Holmes. Start date: Feb 3, 2026.',
      },
      {
        id: 'evt-16',
        type: 'rescheduled',
        timestamp: new Date('2026-02-15').toISOString(),
        details: 'Rescheduled from Tuesday to Wednesday with Maria Santos at Holmes. New start date: Feb 19, 2026.',
      },
      {
        id: 'evt-17',
        type: 'cancelled',
        timestamp: new Date('2026-03-28').toISOString(),
        details: 'Services cancelled. Reason: Family relocated. End date: March 28, 2026.',
      },
    ],
    dateAdded: new Date('2026-01-20').toISOString(),
  },
];

// ─── Sample Tasks ─────────────────────────────────────────────────────────────

export const SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1',
    description: 'Follow up with Tyler Johnson\'s family — no response in 5+ days',
    studentId: 'student-tyler',
    isComplete: false,
    isSystemGenerated: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    description: 'Confirm WMS access for Maria Santos — Thursday Assessment schedule',
    isComplete: false,
    isSystemGenerated: false,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
