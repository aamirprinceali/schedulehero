// ScheduleHero — Full Type Definitions
// All core data types for the scheduling + CRM system

// ─── Session & Time Constants ───────────────────────────────────────────────

export type SessionType = '1:1' | 'WC' | 'Assessment';
export type SlotStatus = 'open' | 'filled' | 'buffer' | 'lunch' | 'drive' | 'off';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Session durations in minutes
export const SESSION_DURATION: Record<SessionType, number> = {
  '1:1': 30,
  'WC': 45,
  'Assessment': 60,
};

// Standardized buffers (used for capacity math only)
export const BUFFER_DURATION: Record<SessionType, number> = {
  '1:1': 15,
  'WC': 20,
  'Assessment': 15,
};

// Total block size = session + buffer
export const BLOCK_DURATION: Record<SessionType, number> = {
  '1:1': 45,
  'WC': 65,
  'Assessment': 75,
};

export const LUNCH_DURATION = 30;         // minutes, default
export const DRIVE_DURATION = 30;         // minutes, default (spec: 30 min)
export const DAY_START = 7 * 60 + 30;     // 7:30 AM (spec requirement)
export const DAY_END = 17 * 60;           // 5:00 PM (spec requirement)
export const LUNCH_EARLIEST = 11 * 60 + 30;
export const LUNCH_LATEST = 13 * 60;

// Max students per Wellness Circle
export const WC_MAX_STUDENTS = 10;

// Stale queue threshold in days
export const STALE_QUEUE_DAYS = 5;

// Utilization thresholds (for provider capacity coloring)
export const UTIL_GREEN_MAX = 69;   // 0-69% = green
export const UTIL_YELLOW_MAX = 79;  // 70-79% = yellow
// 80%+ = red

// ─── Provider ───────────────────────────────────────────────────────────────

export interface DayPeriod {
  school: string;
  sessionType: SessionType;
}

// Per-day schedule for a provider (recurring weekly template)
export interface DaySchedule {
  isOff: boolean;
  morning?: DayPeriod;
  afternoon?: DayPeriod;       // if undefined, morning runs all day
  lunchStartMinutes?: number;  // defaults to LUNCH_EARLIEST
  lunchDurationMinutes?: number; // defaults to LUNCH_DURATION
}

export interface Provider {
  id: string;
  name: string;
  active: boolean;
  role?: string;
  color: string;
  schedule: Record<DayOfWeek, DaySchedule>;
  createdAt: string;
}

// ─── Time Slot ──────────────────────────────────────────────────────────────

export interface TimeSlot {
  id: string;
  providerId: string;
  day: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  type: 'session' | 'buffer' | 'lunch' | 'drive';
  sessionType?: SessionType;
  school?: string;
  status: SlotStatus;
  studentId?: string;  // filled 1:1 / Assessment assignments
}

// ─── Student & Lifecycle ─────────────────────────────────────────────────────

export type StudentStatus = 'Needs Scheduling' | 'Scheduled' | 'Cancelled' | 'Ended';

export type CancellationReason =
  | 'Family relocated'
  | 'Services no longer needed'
  | 'Family declined services'
  | 'Provider left'
  | 'School year ended'
  | 'Scheduling conflict'
  | 'Other';

export const CANCELLATION_REASONS: CancellationReason[] = [
  'Family relocated',
  'Services no longer needed',
  'Family declined services',
  'Provider left',
  'School year ended',
  'Scheduling conflict',
  'Other',
];

// Individual 1:1 or Assessment assignment
export interface IndividualAssignment {
  slotId: string;
  providerId: string;
  day: DayOfWeek;
  school: string;
  startDate: string;   // YYYY-MM-DD — required when scheduling
  endDate?: string;    // YYYY-MM-DD — set when cancelled/ended
}

// Wellness Circle enrollment
export interface WCEnrollment {
  wcId: string;
  startDate: string;   // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD
}

// Audit event logged on every status change
export type AuditEventType =
  | 'queued'
  | 'scheduled'
  | 'rescheduled'
  | 'wc_enrolled'
  | 'wc_removed'
  | 'cancelled'
  | 'ended'
  | 'returned_to_queue';

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  timestamp: string;   // ISO string
  details: string;     // Human-readable description
}

export interface Student {
  id: string;
  name: string;
  dob?: string;                 // YYYY-MM-DD
  districtId: string;
  school: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  notes?: string;
  status: StudentStatus;
  queuedAt: string;             // ISO string — when first added to queue (stale flag)

  // Current scheduling assignments (a student can have both simultaneously)
  individual?: IndividualAssignment;      // 1:1 or Assessment
  wellnessCircle?: WCEnrollment;          // WC enrollment

  // For cancelled/ended students
  cancellationReason?: CancellationReason;
  cancelledDate?: string;       // YYYY-MM-DD

  // Full audit trail
  history: AuditEvent[];

  dateAdded: string;            // ISO string
  addedBy?: string;
}

// ─── Wellness Circle ─────────────────────────────────────────────────────────

export interface WellnessCircle {
  id: string;
  providerId: string;
  school: string;
  day: DayOfWeek;
  startMinutes: number;        // minutes from midnight
  label?: string;              // optional name, e.g. "Tuesday Morning Group"
  maxStudents: 10;             // always 10, per spec
  studentIds: string[];        // up to 10 enrolled student IDs
  startDate: string;           // when this WC was established
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── District ────────────────────────────────────────────────────────────────

export interface District {
  id: string;
  name: string;
  schools: string[];
}

// ─── District Contact ────────────────────────────────────────────────────────

export interface DistrictContact {
  id: string;
  districtId: string;
  school?: string;             // null = district-level contact
  name: string;
  role?: string;               // e.g. "Counselor", "Principal"
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

// ─── Date Override ───────────────────────────────────────────────────────────

export type DateOverrideType = 'holiday' | 'school_closure' | 'provider_pto' | 'other';

export interface DateOverride {
  id: string;
  date: string;                // YYYY-MM-DD
  reason: string;
  type: DateOverrideType;
  providerId?: string;         // null = applies to all providers (district-wide)
  createdAt: string;
}

// ─── Task ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  description: string;
  dueDate?: string;            // YYYY-MM-DD
  studentId?: string;          // optional link to student
  isComplete: boolean;
  isSystemGenerated: boolean;  // true = created by the system (stale queue, etc.)
  createdAt: string;
}

// ─── Full App State ──────────────────────────────────────────────────────────

export interface AppState {
  providers: Provider[];
  students: Student[];
  districts: District[];
  districtContacts: DistrictContact[];
  slots: TimeSlot[];
  wellnessCircles: WellnessCircle[];
  dateOverrides: DateOverride[];
  tasks: Task[];
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

// Provider colors — rotate through these
export const PROVIDER_COLORS = [
  '#F97316', // warm orange
  '#0EA5E9', // sky blue
  '#8B5CF6', // violet
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#84CC16', // lime
  '#6366F1', // indigo
];

// Session type display labels
export const SESSION_LABELS: Record<SessionType, string> = {
  '1:1': '1:1 Individual',
  'WC': 'Wellness Circle',
  'Assessment': 'Assessment',
};

// Student status display colors (Tailwind classes)
export const STATUS_COLORS: Record<StudentStatus, string> = {
  'Needs Scheduling': 'bg-amber-100 text-amber-800 border-amber-200',
  'Scheduled': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Cancelled': 'bg-slate-100 text-slate-600 border-slate-200',
  'Ended': 'bg-slate-100 text-slate-600 border-slate-200',
};
