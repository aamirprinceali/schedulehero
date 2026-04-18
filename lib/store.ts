// ScheduleHero — Zustand Store
// Single source of truth for all app state, persisted to localStorage

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Provider, Student, District, TimeSlot, WellnessCircle, DistrictContact,
  DateOverride, Task, AuditEvent, AuditEventType, DayOfWeek, StudentStatus,
  CancellationReason, IndividualAssignment, WCEnrollment, WC_MAX_STUDENTS,
} from './types';
import { generateAllSlots } from './slotGenerator';
import { INITIAL_DISTRICTS, SAMPLE_PROVIDERS, SAMPLE_STUDENTS, SAMPLE_WELLNESS_CIRCLES, SAMPLE_TASKS } from './data';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function auditEvent(type: AuditEventType, details: string): AuditEvent {
  return { id: generateId(), type, timestamp: new Date().toISOString(), details };
}

interface SchedulingStore {
  providers: Provider[];
  students: Student[];
  districts: District[];
  districtContacts: DistrictContact[];
  slots: TimeSlot[];
  wellnessCircles: WellnessCircle[];
  dateOverrides: DateOverride[];
  tasks: Task[];

  // Provider actions
  addProvider: (p: Omit<Provider, 'id' | 'createdAt'>) => void;
  updateProvider: (id: string, updates: Partial<Provider>) => void;
  deactivateProvider: (id: string) => void;
  reactivateProvider: (id: string) => void;
  regenerateSlots: () => void;
  updateLunchTime: (providerId: string, day: DayOfWeek, lunchStartMinutes: number) => void;

  // Student actions
  addStudentToQueue: (s: Omit<Student, 'id' | 'dateAdded' | 'queuedAt' | 'status' | 'history'>) => void;
  updateStudentInfo: (id: string, updates: Partial<Pick<Student, 'name' | 'dob' | 'districtId' | 'school' | 'parentName' | 'parentEmail' | 'parentPhone' | 'notes'>>) => void;
  scheduleStudent: (studentId: string, assignment: IndividualAssignment) => void;
  rescheduleStudent: (studentId: string, newAssignment: IndividualAssignment, oldDetails: string) => void;
  cancelStudent: (studentId: string, endDate: string, reason: CancellationReason) => void;
  endStudent: (studentId: string, endDate: string, reason: CancellationReason) => void;
  returnStudentToQueue: (studentId: string) => void;
  removeStudent: (id: string) => void;

  // Wellness Circle actions
  addWellnessCircle: (wc: Omit<WellnessCircle, 'id' | 'createdAt' | 'studentIds'>) => string;
  enrollStudentInWC: (studentId: string, wcId: string, startDate: string) => void;
  removeStudentFromWC: (studentId: string, wcId: string) => void;
  updateWellnessCircle: (id: string, updates: Partial<WellnessCircle>) => void;
  deactivateWellnessCircle: (id: string) => void;

  // District actions
  addDistrict: (name: string) => void;
  addSchoolToDistrict: (districtId: string, schoolName: string) => void;
  removeSchoolFromDistrict: (districtId: string, school: string) => void;

  // District contact actions
  addDistrictContact: (c: Omit<DistrictContact, 'id' | 'createdAt'>) => void;
  updateDistrictContact: (id: string, updates: Partial<DistrictContact>) => void;
  removeDistrictContact: (id: string) => void;

  // Task actions
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => void;
  completeTask: (id: string) => void;
  removeTask: (id: string) => void;

  // Date override actions
  addDateOverride: (o: Omit<DateOverride, 'id' | 'createdAt'>) => void;
  removeDateOverride: (id: string) => void;

  // Utility
  resetToSampleData: () => void;
}

export const useSchedulingStore = create<SchedulingStore>()(
  persist(
    (set, get) => ({
      providers: SAMPLE_PROVIDERS,
      students: SAMPLE_STUDENTS,
      districts: INITIAL_DISTRICTS,
      districtContacts: [],
      slots: generateAllSlots(SAMPLE_PROVIDERS),
      wellnessCircles: SAMPLE_WELLNESS_CIRCLES,
      dateOverrides: [],
      tasks: SAMPLE_TASKS,

      // ── PROVIDER ACTIONS ──────────────────────────────────────────────────

      addProvider: (providerData) => {
        const newProvider: Provider = {
          ...providerData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        const updatedProviders = [...get().providers, newProvider];
        set({ providers: updatedProviders, slots: generateAllSlots(updatedProviders.filter(p => p.active)) });
      },

      updateProvider: (id, updates) => {
        const updatedProviders = get().providers.map(p => p.id === id ? { ...p, ...updates } : p);
        set({ providers: updatedProviders, slots: generateAllSlots(updatedProviders.filter(p => p.active)) });
      },

      deactivateProvider: (id) => {
        // Unassign any students scheduled with this provider
        const updatedStudents = get().students.map(s => {
          if (s.individual?.providerId === id) {
            return {
              ...s,
              individual: undefined,
              status: (s.wellnessCircle ? 'Scheduled' : 'Needs Scheduling') as StudentStatus,
              history: [...s.history, auditEvent('returned_to_queue', `Provider deactivated — individual session removed. ${s.wellnessCircle ? 'Still enrolled in Wellness Circle.' : 'Returned to queue.'}`)],
            };
          }
          return s;
        });
        const updatedProviders = get().providers.map(p => p.id === id ? { ...p, active: false } : p);
        set({
          providers: updatedProviders,
          students: updatedStudents,
          slots: generateAllSlots(updatedProviders.filter(p => p.active)),
        });
      },

      reactivateProvider: (id) => {
        const updatedProviders = get().providers.map(p => p.id === id ? { ...p, active: true } : p);
        set({ providers: updatedProviders, slots: generateAllSlots(updatedProviders.filter(p => p.active)) });
      },

      regenerateSlots: () => {
        const activeProviders = get().providers.filter(p => p.active);
        const newSlots = generateAllSlots(activeProviders);
        // Preserve filled slots for existing assignments
        const studentAssignments = get().students.filter(s => s.individual?.slotId);
        const mergedSlots = newSlots.map(slot => {
          const isAssigned = studentAssignments.find(s => s.individual?.slotId === slot.id);
          if (isAssigned) {
            return { ...slot, status: 'filled' as const, studentId: isAssigned.id };
          }
          return slot;
        });
        set({ slots: mergedSlots });
      },

      updateLunchTime: (providerId, day, lunchStartMinutes) => {
        const updatedProviders = get().providers.map(p =>
          p.id === providerId
            ? { ...p, schedule: { ...p.schedule, [day]: { ...p.schedule[day], lunchStartMinutes } } }
            : p
        );
        set({ providers: updatedProviders, slots: generateAllSlots(updatedProviders.filter(p => p.active)) });
      },

      // ── STUDENT ACTIONS ──────────────────────────────────────────────────

      addStudentToQueue: (studentData) => {
        const now = new Date().toISOString();
        const newStudent: Student = {
          ...studentData,
          id: generateId(),
          status: 'Needs Scheduling',
          queuedAt: now,
          dateAdded: now,
          history: [auditEvent('queued', 'Added to Ready to Schedule queue.')],
        };
        set({ students: [...get().students, newStudent] });
      },

      updateStudentInfo: (id, updates) => {
        set({ students: get().students.map(s => s.id === id ? { ...s, ...updates } : s) });
      },

      scheduleStudent: (studentId, assignment) => {
        const student = get().students.find(s => s.id === studentId);
        if (!student) return;

        // Mark the slot as filled
        const updatedSlots = get().slots.map(s =>
          s.id === assignment.slotId ? { ...s, status: 'filled' as const, studentId } : s
        );

        const provider = get().providers.find(p => p.id === assignment.providerId);
        const details = `Scheduled 1:1 with ${provider?.name ?? 'Provider'} — ${assignment.day} at ${assignment.school}. Start date: ${assignment.startDate}.`;

        set({
          slots: updatedSlots,
          students: get().students.map(s =>
            s.id === studentId
              ? {
                  ...s,
                  individual: assignment,
                  status: 'Scheduled' as StudentStatus,
                  history: [...s.history, auditEvent('scheduled', details)],
                }
              : s
          ),
        });
      },

      rescheduleStudent: (studentId, newAssignment, oldDetails) => {
        const student = get().students.find(s => s.id === studentId);
        if (!student) return;

        let updatedSlots = get().slots;

        // Free old slot
        if (student.individual?.slotId) {
          updatedSlots = updatedSlots.map(s =>
            s.id === student.individual!.slotId ? { ...s, status: 'open' as const, studentId: undefined } : s
          );
        }

        // Fill new slot
        updatedSlots = updatedSlots.map(s =>
          s.id === newAssignment.slotId ? { ...s, status: 'filled' as const, studentId } : s
        );

        const provider = get().providers.find(p => p.id === newAssignment.providerId);
        const details = `Rescheduled. Previously: ${oldDetails}. Now: ${newAssignment.day} with ${provider?.name ?? 'Provider'} at ${newAssignment.school}. New start date: ${newAssignment.startDate}.`;

        set({
          slots: updatedSlots,
          students: get().students.map(s =>
            s.id === studentId
              ? {
                  ...s,
                  individual: newAssignment,
                  status: 'Scheduled' as StudentStatus,
                  history: [...s.history, auditEvent('rescheduled', details)],
                }
              : s
          ),
        });
      },

      cancelStudent: (studentId, endDate, reason) => {
        const student = get().students.find(s => s.id === studentId);
        if (!student) return;

        let updatedSlots = get().slots;
        if (student.individual?.slotId) {
          updatedSlots = updatedSlots.map(s =>
            s.id === student.individual!.slotId ? { ...s, status: 'open' as const, studentId: undefined } : s
          );
        }

        // Remove from WC if enrolled
        let updatedWCs = get().wellnessCircles;
        if (student.wellnessCircle?.wcId) {
          updatedWCs = updatedWCs.map(wc =>
            wc.id === student.wellnessCircle!.wcId
              ? { ...wc, studentIds: wc.studentIds.filter(id => id !== studentId) }
              : wc
          );
        }

        const details = `Services cancelled. Reason: ${reason}. End date: ${endDate}.`;

        set({
          slots: updatedSlots,
          wellnessCircles: updatedWCs,
          students: get().students.map(s =>
            s.id === studentId
              ? {
                  ...s,
                  status: 'Cancelled' as StudentStatus,
                  individual: undefined,
                  wellnessCircle: undefined,
                  cancellationReason: reason,
                  cancelledDate: endDate,
                  history: [...s.history, auditEvent('cancelled', details)],
                }
              : s
          ),
        });
      },

      endStudent: (studentId, endDate, reason) => {
        // Same as cancel but status = Ended
        const student = get().students.find(s => s.id === studentId);
        if (!student) return;

        let updatedSlots = get().slots;
        if (student.individual?.slotId) {
          updatedSlots = updatedSlots.map(s =>
            s.id === student.individual!.slotId ? { ...s, status: 'open' as const, studentId: undefined } : s
          );
        }

        let updatedWCs = get().wellnessCircles;
        if (student.wellnessCircle?.wcId) {
          updatedWCs = updatedWCs.map(wc =>
            wc.id === student.wellnessCircle!.wcId
              ? { ...wc, studentIds: wc.studentIds.filter(id => id !== studentId) }
              : wc
          );
        }

        const details = `Services ended. Reason: ${reason}. End date: ${endDate}.`;

        set({
          slots: updatedSlots,
          wellnessCircles: updatedWCs,
          students: get().students.map(s =>
            s.id === studentId
              ? {
                  ...s,
                  status: 'Ended' as StudentStatus,
                  individual: undefined,
                  wellnessCircle: undefined,
                  cancellationReason: reason,
                  cancelledDate: endDate,
                  history: [...s.history, auditEvent('ended', details)],
                }
              : s
          ),
        });
      },

      returnStudentToQueue: (studentId) => {
        set({
          students: get().students.map(s =>
            s.id === studentId
              ? {
                  ...s,
                  status: 'Needs Scheduling' as StudentStatus,
                  queuedAt: new Date().toISOString(),
                  individual: undefined,
                  wellnessCircle: undefined,
                  cancellationReason: undefined,
                  cancelledDate: undefined,
                  history: [...s.history, auditEvent('returned_to_queue', 'Returned to Ready to Schedule queue.')],
                }
              : s
          ),
        });
      },

      removeStudent: (id) => {
        const student = get().students.find(s => s.id === id);
        let updatedSlots = get().slots;
        if (student?.individual?.slotId) {
          updatedSlots = updatedSlots.map(s =>
            s.id === student.individual!.slotId ? { ...s, status: 'open' as const, studentId: undefined } : s
          );
        }
        let updatedWCs = get().wellnessCircles;
        if (student?.wellnessCircle?.wcId) {
          updatedWCs = updatedWCs.map(wc =>
            wc.id === student.wellnessCircle!.wcId
              ? { ...wc, studentIds: wc.studentIds.filter(sid => sid !== id) }
              : wc
          );
        }
        set({
          students: get().students.filter(s => s.id !== id),
          slots: updatedSlots,
          wellnessCircles: updatedWCs,
        });
      },

      // ── WELLNESS CIRCLE ACTIONS ──────────────────────────────────────────

      addWellnessCircle: (wcData) => {
        const id = generateId();
        const newWC: WellnessCircle = {
          ...wcData,
          id,
          studentIds: [],
          createdAt: new Date().toISOString(),
        };
        set({ wellnessCircles: [...get().wellnessCircles, newWC] });
        return id;
      },

      enrollStudentInWC: (studentId, wcId, startDate) => {
        const wc = get().wellnessCircles.find(w => w.id === wcId);
        if (!wc) return;
        if (wc.studentIds.length >= WC_MAX_STUDENTS) return; // hard block

        const student = get().students.find(s => s.id === studentId);
        if (!student) return;

        const provider = get().providers.find(p => p.id === wc.providerId);
        const details = `Enrolled in Wellness Circle — ${wc.label ?? `${wc.day} Group`} with ${provider?.name ?? 'Provider'} at ${wc.school}. Start date: ${startDate}.`;

        set({
          wellnessCircles: get().wellnessCircles.map(w =>
            w.id === wcId ? { ...w, studentIds: [...w.studentIds, studentId] } : w
          ),
          students: get().students.map(s =>
            s.id === studentId
              ? {
                  ...s,
                  wellnessCircle: { wcId, startDate } as WCEnrollment,
                  status: 'Scheduled' as StudentStatus,
                  history: [...s.history, auditEvent('wc_enrolled', details)],
                }
              : s
          ),
        });
      },

      removeStudentFromWC: (studentId, wcId) => {
        const student = get().students.find(s => s.id === studentId);
        const wc = get().wellnessCircles.find(w => w.id === wcId);
        const details = `Removed from Wellness Circle — ${wc?.label ?? 'group'}.`;

        set({
          wellnessCircles: get().wellnessCircles.map(w =>
            w.id === wcId ? { ...w, studentIds: w.studentIds.filter(id => id !== studentId) } : w
          ),
          students: get().students.map(s =>
            s.id === studentId
              ? {
                  ...s,
                  wellnessCircle: undefined,
                  status: (s.individual ? 'Scheduled' : 'Needs Scheduling') as StudentStatus,
                  history: [...s.history, auditEvent('wc_removed', details)],
                }
              : s
          ),
        });
      },

      updateWellnessCircle: (id, updates) => {
        set({ wellnessCircles: get().wellnessCircles.map(wc => wc.id === id ? { ...wc, ...updates } : wc) });
      },

      deactivateWellnessCircle: (id) => {
        set({ wellnessCircles: get().wellnessCircles.map(wc => wc.id === id ? { ...wc, isActive: false } : wc) });
      },

      // ── DISTRICT ACTIONS ─────────────────────────────────────────────────

      addDistrict: (name) => {
        const newDistrict: District = { id: generateId(), name, schools: [] };
        set({ districts: [...get().districts, newDistrict] });
      },

      addSchoolToDistrict: (districtId, schoolName) => {
        set({
          districts: get().districts.map(d =>
            d.id === districtId ? { ...d, schools: [...d.schools, schoolName] } : d
          ),
        });
      },

      removeSchoolFromDistrict: (districtId, school) => {
        set({
          districts: get().districts.map(d =>
            d.id === districtId ? { ...d, schools: d.schools.filter(s => s !== school) } : d
          ),
        });
      },

      // ── DISTRICT CONTACTS ────────────────────────────────────────────────

      addDistrictContact: (contactData) => {
        const newContact: DistrictContact = {
          ...contactData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set({ districtContacts: [...get().districtContacts, newContact] });
      },

      updateDistrictContact: (id, updates) => {
        set({ districtContacts: get().districtContacts.map(c => c.id === id ? { ...c, ...updates } : c) });
      },

      removeDistrictContact: (id) => {
        set({ districtContacts: get().districtContacts.filter(c => c.id !== id) });
      },

      // ── TASK ACTIONS ─────────────────────────────────────────────────────

      addTask: (taskData) => {
        const newTask: Task = { ...taskData, id: generateId(), createdAt: new Date().toISOString() };
        set({ tasks: [...get().tasks, newTask] });
      },

      completeTask: (id) => {
        set({ tasks: get().tasks.map(t => t.id === id ? { ...t, isComplete: true } : t) });
      },

      removeTask: (id) => {
        set({ tasks: get().tasks.filter(t => t.id !== id) });
      },

      // ── DATE OVERRIDES ───────────────────────────────────────────────────

      addDateOverride: (overrideData) => {
        const newOverride: DateOverride = {
          ...overrideData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set({ dateOverrides: [...get().dateOverrides, newOverride] });
      },

      removeDateOverride: (id) => {
        set({ dateOverrides: get().dateOverrides.filter(o => o.id !== id) });
      },

      // ── RESET ────────────────────────────────────────────────────────────

      resetToSampleData: () => {
        set({
          providers: SAMPLE_PROVIDERS,
          students: SAMPLE_STUDENTS,
          districts: INITIAL_DISTRICTS,
          districtContacts: [],
          slots: generateAllSlots(SAMPLE_PROVIDERS),
          wellnessCircles: SAMPLE_WELLNESS_CIRCLES,
          dateOverrides: [],
          tasks: SAMPLE_TASKS,
        });
      },
    }),
    {
      name: 'schedulehero-v1', // localStorage key
    }
  )
);
