// ScheduleHero — Date Utility Functions

import { DayOfWeek, DAYS, STALE_QUEUE_DAYS } from './types';

// Convert "Monday" → JS day number (0=Sun, 1=Mon ... 6=Sat)
const DAY_TO_JS: Record<DayOfWeek, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5,
};

// Format a Date as YYYY-MM-DD
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Today as YYYY-MM-DD
export function today(): string {
  return toDateString(new Date());
}

// Parse a YYYY-MM-DD string into a local Date (noon to avoid TZ issues)
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

// Format YYYY-MM-DD as "Mon, Apr 21"
export function formatDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

// Format YYYY-MM-DD as "April 21, 2026"
export function formatDateLong(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

// Get Monday of the week containing the given date
export function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // if Sun, go back 6; else go back (day-1)
  d.setDate(d.getDate() + diff);
  d.setHours(12, 0, 0, 0);
  return d;
}

// Get the actual calendar date for a given DayOfWeek within a week
// weekMonday: the Monday date of the week (Date object)
export function getDateForDay(weekMonday: Date, day: DayOfWeek): Date {
  const offset = DAY_TO_JS[day] - 1; // Monday=0 offset
  const d = new Date(weekMonday);
  d.setDate(d.getDate() + offset);
  return d;
}

// Format Date as "Mon Apr 21"
export function formatWeekDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Format week range as "Apr 21 – Apr 25, 2026"
export function formatWeekRange(weekMonday: Date): string {
  const friday = new Date(weekMonday);
  friday.setDate(friday.getDate() + 4);
  const monStr = weekMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const friStr = friday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${monStr} – ${friStr}`;
}

// Is a student's queue entry stale? (queuedAt was > STALE_QUEUE_DAYS days ago)
export function isStale(queuedAt: string): boolean {
  const queued = parseDate(queuedAt.split('T')[0]);
  const now = new Date();
  const diffMs = now.getTime() - queued.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > STALE_QUEUE_DAYS;
}

// Count sessions completed in a month for a student on a given day of week
// startDate: when services began (YYYY-MM-DD)
// dayOfWeek: which day their session falls on
// month: 0-indexed (0=Jan ... 11=Dec)
// year: full year
export function countSessionsInMonth(
  startDate: string,
  dayOfWeek: DayOfWeek,
  month: number,
  year: number
): number {
  const jsDay = DAY_TO_JS[dayOfWeek];
  const firstOfMonth = new Date(year, month, 1, 12, 0, 0);
  const lastOfMonth = new Date(year, month + 1, 0, 12, 0, 0);
  const serviceStart = parseDate(startDate);

  // Use the later of firstOfMonth or serviceStart
  const rangeStart = serviceStart > firstOfMonth ? serviceStart : firstOfMonth;

  let count = 0;
  const cursor = new Date(rangeStart);

  // Advance cursor to the first occurrence of jsDay within the range
  while (cursor.getDay() !== jsDay) {
    cursor.setDate(cursor.getDate() + 1);
  }

  // Count every weekly occurrence up to end of month
  while (cursor <= lastOfMonth) {
    count++;
    cursor.setDate(cursor.getDate() + 7);
  }

  return count;
}

// Get current month label: "April 2026"
export function currentMonthLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Get array of { month, year, label } for the past N months (for reporting filters)
export function getMonthOptions(count = 6): { month: number; year: number; label: string }[] {
  const options = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
  }
  return options;
}

// Format minutes-from-midnight as "8:30 AM"
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

// Parse "8:30 AM" → minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(' ');
  const [h, m] = time.split(':').map(Number);
  let hours = h;
  if (period === 'PM' && h !== 12) hours += 12;
  if (period === 'AM' && h === 12) hours = 0;
  return hours * 60 + m;
}
