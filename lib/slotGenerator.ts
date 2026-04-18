// Automatically generates time slots for a provider based on their day schedule
// Schedulers fill these slots — they do not create them manually

import {
  DayOfWeek,
  DayPeriod,
  Provider,
  SessionType,
  TimeSlot,
  BLOCK_DURATION,
  SESSION_DURATION,
  DAY_START,
  DAY_END,
  LUNCH_DURATION,
  DRIVE_DURATION,
  LUNCH_EARLIEST,
  DAYS,
} from './types';

// Convert minutes-from-midnight to "8:30 AM" format
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

// Generate a unique slot ID
function slotId(providerId: string, day: DayOfWeek, startMinutes: number, type: string): string {
  return `${providerId}-${day}-${startMinutes}-${type}`;
}

// Generate a block of sessions + buffers for a period, stopping before stopAt
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
  const slots: TimeSlot[] = [];

  // --- MORNING BLOCK ---
  // Generate sessions from DAY_START up until we can no longer fit a full block before lunch
  const { slots: morningSlots, cursor: afterMorning } = generatePeriodSlots(
    provider.id, day, morning, DAY_START, lunchAt
  );
  slots.push(...morningSlots);

  // Snap cursor to lunchAt (may have a gap if last block ended before lunch)
  const lunchStart = Math.max(afterMorning, lunchAt);

  // --- LUNCH BLOCK ---
  slots.push({
    id: slotId(provider.id, day, lunchStart, 'lunch'),
    providerId: provider.id,
    day,
    startMinutes: lunchStart,
    endMinutes: lunchStart + LUNCH_DURATION,
    type: 'lunch',
    school: morning.school,
    status: 'lunch',
  });
  let cursor = lunchStart + LUNCH_DURATION;

  // --- DRIVE BLOCK (only if afternoon school differs from morning school) ---
  const afternoonPeriod = afternoon ?? morning; // if no afternoon set, continue morning type all day
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

  // --- AFTERNOON BLOCK ---
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
      const daySlots = generateDaySlots(provider, day);
      allSlots.push(...daySlots);
    }
  }
  return allSlots;
}

// Get only the open session slots for a provider on a day
export function getOpenSessionSlots(slots: TimeSlot[], providerId: string, day: DayOfWeek): TimeSlot[] {
  return slots.filter(
    s => s.providerId === providerId && s.day === day && s.type === 'session' && s.status === 'open'
  );
}

// Count session slots for a provider on a day
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
