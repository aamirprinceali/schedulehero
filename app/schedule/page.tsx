'use client';

import { useState } from 'react';
import { useSchedulingStore } from '@/lib/store';
import { DayOfWeek, DAYS, TimeSlot, LUNCH_EARLIEST, LUNCH_LATEST } from '@/lib/types';
import { minutesToTime, getProviderDayCapacity } from '@/lib/slotGenerator';
import Modal from '@/components/ui/Modal';
import { UserPlus, X, School } from 'lucide-react';

// Color for each slot type
function slotBg(slot: TimeSlot): string {
  if (slot.type === 'lunch') return 'bg-blue-100 border-blue-200 text-blue-700';
  if (slot.type === 'drive') return 'bg-purple-100 border-purple-200 text-purple-700';
  if (slot.type === 'buffer') return 'bg-pink-50 border-pink-100 text-pink-400';
  if (slot.type === 'session') {
    if (slot.status === 'filled') return 'bg-orange-100 border-orange-300 text-orange-800';
    if (slot.sessionType === 'WC') return 'bg-teal-50 border-teal-200 text-teal-700';
    if (slot.sessionType === 'Assessment') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    return 'bg-green-50 border-green-200 text-green-700';
  }
  return 'bg-gray-50 border-gray-200 text-gray-500';
}

function slotLabel(slot: TimeSlot, studentName?: string): string {
  if (slot.type === 'lunch') return 'Lunch';
  if (slot.type === 'drive') return 'Drive';
  if (slot.type === 'buffer') return 'Buffer';
  if (slot.status === 'filled') return studentName ?? 'Filled';
  if (slot.sessionType === '1:1') return '1:1 Open';
  if (slot.sessionType === 'WC') return 'WC Open';
  return 'Assessment Open';
}

const PX_PER_MIN = 1.4;
const DAY_START_MIN = 8 * 60;
const TOTAL_HOURS = 8; // 8am to 4pm
const TIMELINE_HEIGHT = TOTAL_HOURS * 60 * PX_PER_MIN;

function slotTop(startMinutes: number) {
  return (startMinutes - DAY_START_MIN) * PX_PER_MIN;
}
function slotHeight(startMinutes: number, endMinutes: number) {
  return Math.max((endMinutes - startMinutes) * PX_PER_MIN, 12);
}

export default function SchedulePage() {
  const { providers, students, slots, districts, assignStudent, unassignStudent, updateLunchTime } = useSchedulingStore();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [assignModal, setAssignModal] = useState<{ slot: TimeSlot } | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [lunchModal, setLunchModal] = useState<{ slot: TimeSlot; providerId: string } | null>(null);

  const activeProviders = providers.filter(p => p.active);
  const allSchools = districts.flatMap(d => d.schools);

  // All schools that appear in slots on the selected day (dynamic)
  const schoolsOnDay = Array.from(new Set(
    slots.filter(s => s.day === selectedDay && s.school).map(s => s.school!)
  )).sort();

  // Determine which providers to show based on filters
  const visibleProviders = activeProviders.filter(p => {
    if (selectedProvider !== 'all' && p.id !== selectedProvider) return false;
    if (selectedSchool !== 'all') {
      const ds = p.schedule[selectedDay];
      if (ds.isOff) return false;
      const atSchool =
        ds.morning?.school === selectedSchool ||
        ds.afternoon?.school === selectedSchool;
      if (!atSchool) return false;
    }
    return true;
  });

  const daySlots = slots.filter(s => s.day === selectedDay);
  const getStudent = (id?: string) => students.find(s => s.id === id);

  const eligibleStudents = (slot: TimeSlot) =>
    students.filter(s =>
      s.sessionType === slot.sessionType &&
      (s.status === 'Needs Scheduling' || (s.status === 'Scheduled' && s.slotId !== slot.id))
    );

  const handleAssign = () => {
    if (!assignModal || !selectedStudentId) return;
    assignStudent(selectedStudentId, assignModal.slot.id, assignModal.slot.providerId, assignModal.slot.day);
    setAssignModal(null);
    setSelectedStudentId('');
  };

  const timeMarkers = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
    const mins = DAY_START_MIN + i * 60;
    return { mins, label: minutesToTime(mins) };
  });

  // Move lunch by 15-minute increments
  const moveLunch = (providerId: string, delta: number) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;
    const current = provider.schedule[selectedDay].lunchStartMinutes ?? LUNCH_EARLIEST;
    const next = Math.max(LUNCH_EARLIEST, Math.min(LUNCH_LATEST, current + delta));
    updateLunchTime(providerId, selectedDay, next);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-6 py-4 border-b bg-white flex flex-wrap items-center gap-3 shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Schedule</h1>

        {/* Day selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedDay === day ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Provider filter */}
        <select
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
          value={selectedProvider}
          onChange={e => { setSelectedProvider(e.target.value); setSelectedSchool('all'); }}
        >
          <option value="all">All Providers</option>
          {activeProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {/* School filter */}
        <div className="flex items-center gap-1.5">
          <School size={14} className="text-gray-400" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            value={selectedSchool}
            onChange={e => { setSelectedSchool(e.target.value); setSelectedProvider('all'); }}
          >
            <option value="all">All Schools</option>
            {schoolsOnDay.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 border border-green-300 inline-block" /> 1:1</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-teal-100 border border-teal-200 inline-block" /> WC</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200 inline-block" /> Assess</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-200 border border-orange-300 inline-block" /> Filled</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-200 inline-block" /> Lunch</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-100 border border-purple-200 inline-block" /> Drive</span>
        </div>
      </div>

      {/* Schedule grid */}
      <div className="flex-1 overflow-auto p-4">
        {visibleProviders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">
              {selectedSchool !== 'all' ? `No providers at ${selectedSchool} on ${selectedDay}` : 'No active providers'}
            </p>
            <p className="text-sm mt-1">
              {selectedSchool !== 'all' ? 'Try a different school or day.' : 'Add providers first to build the schedule'}
            </p>
          </div>
        ) : (
          <div className="flex gap-4">
            {/* Time axis */}
            <div className="shrink-0 w-16" style={{ position: 'relative', height: TIMELINE_HEIGHT + 32 }}>
              <div className="pt-8" style={{ position: 'relative', height: '100%' }}>
                {timeMarkers.map(({ mins, label }) => (
                  <div
                    key={mins}
                    className="absolute right-2 text-xs text-gray-400 whitespace-nowrap"
                    style={{ top: slotTop(mins) }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Provider columns */}
            {visibleProviders.map(provider => {
              const providerDaySlots = daySlots.filter(s => s.providerId === provider.id);
              const cap = getProviderDayCapacity(slots, provider.id, selectedDay);
              const daySchedule = provider.schedule[selectedDay];
              const isOff = daySchedule.isOff;

              // Build school label for the header
              const morningSchool = daySchedule.morning?.school ?? '';
              const afternoonSchool = daySchedule.afternoon?.school ?? '';
              const schoolLabel = daySchedule.afternoon && afternoonSchool !== morningSchool
                ? `${morningSchool} / ${afternoonSchool}`
                : morningSchool;

              return (
                <div key={provider.id} className="flex-1 min-w-[160px] max-w-[220px]">
                  {/* Provider header */}
                  <div className="mb-2 rounded-lg px-3 py-2 text-center" style={{ backgroundColor: provider.color + '20', borderBottom: `3px solid ${provider.color}` }}>
                    <div className="font-semibold text-sm text-gray-900">{provider.name}</div>
                    {!isOff && (
                      <>
                        <div className="text-xs text-gray-500 mt-0.5 truncate" title={schoolLabel}>{schoolLabel}</div>
                        <div className={`text-xs font-medium mt-1 ${cap.pctFull >= 100 ? 'text-red-600' : cap.pctFull >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {cap.filled}/{cap.total} slots · {cap.pctFull}%
                        </div>
                      </>
                    )}
                    {isOff && <div className="text-xs text-gray-400 mt-0.5">Off today</div>}
                  </div>

                  {/* Timeline */}
                  <div className="relative" style={{ height: TIMELINE_HEIGHT }}>
                    {isOff ? (
                      <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Off
                      </div>
                    ) : (
                      providerDaySlots.map(slot => {
                        const top = slotTop(slot.startMinutes);
                        const height = slotHeight(slot.startMinutes, slot.endMinutes);
                        const student = getStudent(slot.studentId);
                        const isClickable = slot.type === 'session' && slot.status === 'open';
                        const isFilled = slot.type === 'session' && slot.status === 'filled';
                        const isLunch = slot.type === 'lunch';

                        return (
                          <div
                            key={slot.id}
                            className={`absolute left-0 right-0 rounded border mx-0.5 overflow-hidden transition-all ${slotBg(slot)} ${isClickable ? 'cursor-pointer hover:opacity-90 hover:shadow-sm' : ''} ${isLunch ? 'cursor-pointer' : ''}`}
                            style={{ top, height }}
                            onClick={() => {
                              if (isClickable) {
                                setAssignModal({ slot });
                                setSelectedStudentId('');
                              }
                              if (isLunch) {
                                setLunchModal({ slot, providerId: provider.id });
                              }
                            }}
                          >
                            <div className="px-1.5 py-0.5 h-full flex flex-col justify-between">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-medium truncate leading-tight">
                                  {slotLabel(slot, student?.name)}
                                </span>
                                {isFilled && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); unassignStudent(slot.studentId!); }}
                                    className="shrink-0 text-orange-400 hover:text-orange-600"
                                    title="Remove student"
                                  >
                                    <X size={10} />
                                  </button>
                                )}
                                {isClickable && height > 20 && (
                                  <UserPlus size={10} className="shrink-0 text-green-500" />
                                )}
                              </div>
                              {height > 30 && (
                                <span className="text-xs opacity-60">{minutesToTime(slot.startMinutes)}</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign student modal */}
      {assignModal && (
        <Modal
          title={`Assign Student — ${minutesToTime(assignModal.slot.startMinutes)} ${assignModal.slot.sessionType}`}
          onClose={() => { setAssignModal(null); setSelectedStudentId(''); }}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Provider</span><span className="font-medium">{providers.find(p => p.id === assignModal.slot.providerId)?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">School</span><span className="font-medium">{assignModal.slot.school}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{minutesToTime(assignModal.slot.startMinutes)} – {minutesToTime(assignModal.slot.endMinutes)}</span></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
              >
                <option value="">— Choose a student —</option>
                {eligibleStudents(assignModal.slot).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.school} · {s.status === 'Scheduled' ? '(move)' : 'Needs scheduling'}
                  </option>
                ))}
              </select>
              {eligibleStudents(assignModal.slot).length === 0 && (
                <p className="text-xs text-gray-400 mt-1">No students with matching session type need scheduling.</p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setAssignModal(null); setSelectedStudentId(''); }} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedStudentId}
                className="flex-1 bg-[#FF6B35] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#e55a24] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Assign Student
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Move lunch modal */}
      {lunchModal && (() => {
        const provider = providers.find(p => p.id === lunchModal.providerId);
        const currentLunch = provider?.schedule[selectedDay].lunchStartMinutes ?? LUNCH_EARLIEST;
        return (
          <Modal
            title="Adjust Lunch Time"
            onClose={() => setLunchModal(null)}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Move lunch earlier or later for <strong>{provider?.name}</strong> on <strong>{selectedDay}</strong>.
                All sessions before and after will shift accordingly.
              </p>

              <div className="flex items-center justify-center gap-6 py-4">
                <button
                  onClick={() => moveLunch(lunchModal.providerId, -15)}
                  disabled={currentLunch <= LUNCH_EARLIEST}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-bold text-gray-700 disabled:opacity-30 transition-colors"
                >
                  −15 min
                </button>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{minutesToTime(currentLunch)}</div>
                  <div className="text-xs text-gray-400 mt-1">Lunch start</div>
                </div>
                <button
                  onClick={() => moveLunch(lunchModal.providerId, 15)}
                  disabled={currentLunch >= LUNCH_LATEST}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-bold text-gray-700 disabled:opacity-30 transition-colors"
                >
                  +15 min
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Lunch can be moved between {minutesToTime(LUNCH_EARLIEST)} and {minutesToTime(LUNCH_LATEST)}
              </p>

              <button
                onClick={() => setLunchModal(null)}
                className="w-full bg-[#FF6B35] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#e55a24] transition-colors"
              >
                Done
              </button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
