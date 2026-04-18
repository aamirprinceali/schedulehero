// ScheduleHero — Slot Generator
// Auto-generates time slots for providers based on their day schedule template
// 7:30 AM – 5:00 PM window, 30-min drive default

import {
  DayOfWeek, DayPeriod, Provider, SessionType, TimeSlot,
  BLOCK_DURATION, SESSION_DURATION, DAY_START, DAY_END,
  LUNCH_DURATION, DRIVE_DURATION, LUNCH_EARLIEST, DAYS,
} from './types';

export { minutesToTime } from './dateUtils';

// Generate a unique slot ID
function slotId(providerId: string, day: DayOfWeek, startMinutes: number, type: string): string {
  return `${providerId}-${day}-${startMinutes}-${type}`;
}

// Generate sessions + buffers for a period block, stopping before stopAt
function generatePeriodSlots(
  providerId: string,
  day: DayOfWeek,
  period: DayPeriod,
  startTime: number,
  stopAt: number
): { slots: TimeSlot[]; cursor: number } {
  const slots: TimeSlot[] = [];
  let cursor = startTime;
  const { school, sessionType } = period;
  const blockSize = BLOCK_DURATION[sessionType];
  const sessionDur = SESSION_DURATION[sessionType];

  while (cursor + blockSize <= stopAt) {
    const sessionEnd = cursor + sessionDur;

    slots.push({
      id: slotId(providerId, day, cursor, 'session'),
      providerId,
      day,
      startMinutes: cursor,
      endMinutes: sessionEnd,
      type: 'session',
      sessionType,
      school,
      status: 'open',
    });

    slots.push({
      id: slotId(providerId, day, sessionEnd, 'buffer'),
      providerId,
      day,
      startMinutes: sessionEnd,
      endMinutes: cursor + blockSize,
      type: 'buffer',
      sessionType,
      school,
      status: 'buffer',
    });

    cursor += blockSize;
  }

  return { slots, cursor };
}

// Generate all slots for one provider for one day
export function generateDaySlots(provider: Provider, day: DayOfWeek): TimeSlot[] {
  const schedule = provider.schedule[day];
  if (!schedule || schedule.isOff || !schedule.morning) return [];

  const { morning, afternoon } = schedule;
  const lunchAt = schedule.lunchStartMinutes ?? LUNCH_EARLIEST;
  const lunchDur = schedule.lunchDurationMinutes ?? LUNCH_DURATION;
  const slots: TimeSlot[] = [];

  // Morning block — sessions from DAY_START until last full block fits before lunch
  const { slots: morningSlots, cursor: afterMorning } = generatePeriodSlots(
    provider.id, day, morning, DAY_START, lunchAt
  );
  slots.push(...morningSlots);

  // Snap to lunchAt
  const lunchStart = Math.max(afterMorning, lunchAt);

  // Lunch block
  slots.push({
    id: slotId(provider.id, day, lunchStart, 'lunch'),
    providerId: provider.id,
    day,
    startMinutes: lunchStart,
    endMinutes: lunchStart + lunchDur,
    type: 'lunch',
    school: morning.school,
    status: 'lunch',
  });
  let cursor = lunchStart + lunchDur;

  // Drive block (only if afternoon school differs from morning school)
  const afternoonPeriod = afternoon ?? morning;
  if (afternoon && afternoon.school !== morning.school) {
    slots.push({
      id: slotId(provider.id, day, cursor, 'drive'),
      providerId: provider.id,
      day,
      startMinutes: cursor,
      endMinutes: cursor + DRIVE_DURATION,
      type: 'drive',
      school: afternoon.school,
      status: 'drive',
    });
    cursor += DRIVE_DURATION;
  }

  // Afternoon block
  const { slots: afternoonSlots } = generatePeriodSlots(
    provider.id, day, afternoonPeriod, cursor, DAY_END
  );
  slots.push(...afternoonSlots);

  return slots;
}

// Generate ALL slots for ALL providers for ALL days
export function generateAllSlots(providers: Provider[]): TimeSlot[] {
  const allSlots: TimeSlot[] = [];
  for (const provider of providers) {
    if (!provider.active) continue;
    for (const day of DAYS) {
      allSlots.push(...generateDaySlots(provider, day));
    }
  }
  return allSlots;
}

// Get only open session slots for a provider on a day (used for Quick Assign)
export function getOpenSessionSlots(slots: TimeSlot[], providerId: string, day: DayOfWeek): TimeSlot[] {
  return slots.filter(
    s => s.providerId === providerId && s.day === day && s.type === 'session' && s.status === 'open'
  );
}

// Get open session slots for a specific session type (for Quick Assign filtering)
export function getOpenSlotsForType(slots: TimeSlot[], sessionType: SessionType, day?: DayOfWeek): TimeSlot[] {
  return slots.filter(s =>
    s.type === 'session' &&
    s.status === 'open' &&
    s.sessionType === sessionType &&
    (day ? s.day === day : true)
  );
}

// Capacity stats for a provider on a specific day
export function getProviderDayCapacity(slots: TimeSlot[], providerId: string, day: DayOfWeek) {
  const sessionSlots = slots.filter(
    s => s.providerId === providerId && s.day === day && s.type === 'session'
  );
  const total = sessionSlots.length;
  const filled = sessionSlots.filter(s => s.status === 'filled').length;
  const remaining = total - filled;
  const pctFull = total > 0 ? Math.round((filled / total) * 100) : 0;
  return { total, filled, remaining, pctFull };
}

// Week-level capacity for a provider (all 5 days combined)
export function getProviderWeekCapacity(slots: TimeSlot[], providerId: string) {
  const sessionSlots = slots.filter(s => s.providerId === providerId && s.type === 'session');
  const total = sessionSlots.length;
  const filled = sessionSlots.filter(s => s.status === 'filled').length;
  const remaining = total - filled;
  const pctFull = total > 0 ? Math.round((filled / total) * 100) : 0;
  // Open minutes remaining (using standardized block durations)
  const openMinutes = sessionSlots
    .filter(s => s.status === 'open')
    .reduce((sum, s) => sum + (s.endMinutes - s.startMinutes), 0);
  return { total, filled, remaining, pctFull, openMinutes };
}

// Utilization color class (based on spec thresholds)
export function utilizationColor(pct: number): string {
  if (pct >= 80) return 'text-red-600';
  if (pct >= 70) return 'text-amber-600';
  return 'text-emerald-600';
}

export function utilizationBg(pct: number): string {
  if (pct >= 80) return 'bg-red-100 text-red-700 border-red-200';
  if (pct >= 70) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200';
}
