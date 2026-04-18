// All the core data types for the HelloHero scheduling system

export type SessionType = '1:1' | 'WC' | 'Assessment';
export type SlotStatus = 'open' | 'filled' | 'buffer' | 'lunch' | 'drive' | 'off';
export type StudentStatus = 'Scheduled' | 'Cancelled' | 'No-Show' | 'Make-Up' | 'Needs Scheduling';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Session durations in minutes
export const SESSION_DURATION: Record<SessionType, number> = {
  '1:1': 30,
  'WC': 45,
  'Assessment': 60,
};

// Buffer durations in minutes
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

export const LUNCH_DURATION = 30; // minutes
export const DRIVE_DURATION = 20; // minutes
export const DAY_START = 8 * 60; // 8:00 AM in minutes from midnight
export const DAY_END = 16 * 60; // 4:00 PM in minutes from midnight
export const LUNCH_EARLIEST = 11 * 60 + 30; // 11:30 AM default lunch start
export const LUNCH_LATEST = 13 * 60; // 1:00 PM max lunch start

// A single period (morning or afternoon) — school + what type of sessions to run
export interface DayPeriod {
  school: string;
  sessionType: SessionType;
}

// Per-day schedule for a provider
// morning = 8:00 AM → lunch, afternoon = after lunch → 4:00 PM
// If only morning is set (no afternoon), the morning config runs all day
// If morning.school !== afternoon.school, a drive block is inserted after lunch
export interface DaySchedule {
  isOff: boolean;
  morning?: DayPeriod;
  afternoon?: DayPeriod;
  lunchStartMinutes?: number; // defaults to LUNCH_EARLIEST (11:30 AM)
}

export interface Provider {
  id: string;
  name: string;
  active: boolean;
  role?: string;
  color: string; // hex color for visual identification
  schedule: Record<DayOfWeek, DaySchedule>;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  providerId: string;
  day: DayOfWeek;
  startMinutes: number; // minutes from midnight
  endMinutes: number;
  type: 'session' | 'buffer' | 'lunch' | 'drive';
  sessionType?: SessionType; // only for session slots
  school?: string;
  status: SlotStatus;
  studentId?: string; // filled when a student is assigned
}

export interface District {
  id: string;
  name: string;
  schools: string[];
}

export interface Student {
  id: string;
  name: string;
  dob?: string; // optional
  districtId: string;
  school: string;
  sessionType: SessionType;
  status: StudentStatus;
  // Scheduling assignment (null if unscheduled)
  providerId?: string;
  day?: DayOfWeek;
  slotId?: string;
  notes?: string;
  dateAdded: string;
  addedBy: string;
}

export interface AppState {
  providers: Provider[];
  students: Student[];
  districts: District[];
  slots: TimeSlot[];
}
