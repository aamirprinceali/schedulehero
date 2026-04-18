// Zustand store — manages all app state and persists to localStorage
// This is the single source of truth for providers, students, slots, and districts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Provider, Student, District, TimeSlot,
  DayOfWeek, StudentStatus
} from './types';
import { generateAllSlots } from './slotGenerator';
import { INITIAL_DISTRICTS, SAMPLE_PROVIDERS } from './data';

interface SchedulingStore {
  providers: Provider[];
  students: Student[];
  districts: District[];
  slots: TimeSlot[];

  // Provider actions
  addProvider: (provider: Omit<Provider, 'id' | 'createdAt'>) => void;
  updateProvider: (id: string, updates: Partial<Provider>) => void;
  deactivateProvider: (id: string) => void;
  regenerateSlots: () => void;
  updateLunchTime: (providerId: string, day: DayOfWeek, lunchStartMinutes: number) => void;

  // Student actions
  addStudent: (student: Omit<Student, 'id' | 'dateAdded'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  assignStudent: (studentId: string, slotId: string, providerId: string, day: DayOfWeek) => void;
  unassignStudent: (studentId: string) => void;
  removeStudent: (id: string) => void;

  // District actions
  addDistrict: (name: string) => void;
  addSchoolToDistrict: (districtId: string, schoolName: string) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const useSchedulingStore = create<SchedulingStore>()(
  persist(
    (set, get) => ({
      providers: SAMPLE_PROVIDERS,
      students: [],
      districts: INITIAL_DISTRICTS,
      slots: generateAllSlots(SAMPLE_PROVIDERS),

      // --- PROVIDER ACTIONS ---

      addProvider: (providerData) => {
        const newProvider: Provider = {
          ...providerData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        const updatedProviders = [...get().providers, newProvider];
        set({
          providers: updatedProviders,
          slots: generateAllSlots(updatedProviders.filter(p => p.active)),
        });
      },

      updateProvider: (id, updates) => {
        const updatedProviders = get().providers.map(p =>
          p.id === id ? { ...p, ...updates } : p
        );
        set({
          providers: updatedProviders,
          slots: generateAllSlots(updatedProviders.filter(p => p.active)),
        });
      },

      deactivateProvider: (id) => {
        const updatedProviders = get().providers.map(p =>
          p.id === id ? { ...p, active: false } : p
        );
        // Unassign any students assigned to this provider
        const updatedStudents = get().students.map(s =>
          s.providerId === id
            ? { ...s, providerId: undefined, day: undefined, slotId: undefined, status: 'Needs Scheduling' as StudentStatus }
            : s
        );
        set({
          providers: updatedProviders,
          students: updatedStudents,
          slots: generateAllSlots(updatedProviders.filter(p => p.active)),
        });
      },

      regenerateSlots: () => {
        const activeProviders = get().providers.filter(p => p.active);
        const newSlots = generateAllSlots(activeProviders);
        // Preserve filled status for students still assigned
        const filledSlots = get().slots.filter(s => s.status === 'filled');
        const mergedSlots = newSlots.map(slot => {
          const existingFilled = filledSlots.find(f => f.id === slot.id);
          return existingFilled || slot;
        });
        set({ slots: mergedSlots });
      },

      // Move lunch on a specific provider's day and regenerate that day's slots
      updateLunchTime: (providerId, day, lunchStartMinutes) => {
        const updatedProviders = get().providers.map(p =>
          p.id === providerId
            ? {
                ...p,
                schedule: {
                  ...p.schedule,
                  [day]: { ...p.schedule[day], lunchStartMinutes },
                },
              }
            : p
        );
        set({
          providers: updatedProviders,
          slots: generateAllSlots(updatedProviders.filter(p => p.active)),
        });
      },

      // --- STUDENT ACTIONS ---

      addStudent: (studentData) => {
        const newStudent: Student = {
          ...studentData,
          id: generateId(),
          dateAdded: new Date().toISOString(),
        };
        set({ students: [...get().students, newStudent] });
      },

      updateStudent: (id, updates) => {
        set({
          students: get().students.map(s => s.id === id ? { ...s, ...updates } : s),
        });
      },

      assignStudent: (studentId, slotId, providerId, day) => {
        const student = get().students.find(s => s.id === studentId);
        if (!student) return;

        // Validate: slot must be open
        const targetSlot = get().slots.find(s => s.id === slotId);
        if (!targetSlot || targetSlot.status !== 'open') return;

        // If student was previously assigned, free their old slot
        if (student.slotId) {
          set({
            slots: get().slots.map(s =>
              s.id === student.slotId
                ? { ...s, status: 'open', studentId: undefined }
                : s
            ),
          });
        }

        // Assign to new slot
        set({
          slots: get().slots.map(s =>
            s.id === slotId ? { ...s, status: 'filled', studentId } : s
          ),
          students: get().students.map(s =>
            s.id === studentId
              ? { ...s, providerId, day, slotId, status: 'Scheduled' as StudentStatus }
              : s
          ),
        });
      },

      unassignStudent: (studentId) => {
        const student = get().students.find(s => s.id === studentId);
        if (!student) return;

        if (student.slotId) {
          set({
            slots: get().slots.map(s =>
              s.id === student.slotId ? { ...s, status: 'open', studentId: undefined } : s
            ),
          });
        }

        set({
          students: get().students.map(s =>
            s.id === studentId
              ? { ...s, providerId: undefined, day: undefined, slotId: undefined, status: 'Needs Scheduling' as StudentStatus }
              : s
          ),
        });
      },

      removeStudent: (id) => {
        const student = get().students.find(s => s.id === id);
        if (student?.slotId) {
          set({
            slots: get().slots.map(s =>
              s.id === student.slotId ? { ...s, status: 'open', studentId: undefined } : s
            ),
          });
        }
        set({ students: get().students.filter(s => s.id !== id) });
      },

      // --- DISTRICT ACTIONS ---

      addDistrict: (name) => {
        const newDistrict: District = {
          id: generateId(),
          name,
          schools: [],
        };
        set({ districts: [...get().districts, newDistrict] });
      },

      addSchoolToDistrict: (districtId, schoolName) => {
        set({
          districts: get().districts.map(d =>
            d.id === districtId
              ? { ...d, schools: [...d.schools, schoolName] }
              : d
          ),
        });
      },
    }),
    {
      name: 'hellohero-scheduling', // localStorage key
    }
  )
);
