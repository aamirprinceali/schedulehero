'use client';

import { useState } from 'react';
import { useSchedulingStore } from '@/lib/store';
import { DayOfWeek, DAYS, TimeSlot, LUNCH_EARLIEST, LUNCH_LATEST, IndividualAssignment } from '@/lib/types';
import { minutesToTime } from '@/lib/dateUtils';
import { getProviderDayCapacity } from '@/lib/slotGenerator';
import { X, UserPlus, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

const PX_PER_MIN = 1.4;
const DAY_START_MIN = 7 * 60 + 30; // 7:30 AM
const DAY_END_MIN = 17 * 60;        // 5:00 PM
const TOTAL_MINS = DAY_END_MIN - DAY_START_MIN;
const TIMELINE_HEIGHT = TOTAL_MINS * PX_PER_MIN;

function slotTop(startMinutes: number) {
  return (startMinutes - DAY_START_MIN) * PX_PER_MIN;
}
function slotHeight(startMinutes: number, endMinutes: number) {
  return Math.max((endMinutes - startMinutes) * PX_PER_MIN, 10);
}

function slotClass(slot: TimeSlot): string {
  if (slot.type === 'lunch') return 'tslot tslot-lunch';
  if (slot.type === 'drive') return 'tslot tslot-drive';
  if (slot.type === 'buffer') return 'tslot tslot-buffer';
  if (slot.type === 'session') {
    if (slot.status === 'filled') return 'tslot tslot-filled';
    if (slot.sessionType === 'WC') return 'tslot tslot-wc';
    if (slot.sessionType === 'Assessment') return 'tslot tslot-assess';
    return 'tslot tslot-open';
  }
  return 'tslot tslot-buffer';
}

function slotLabel(slot: TimeSlot, studentName?: string): string {
  if (slot.type === 'lunch') return 'Lunch';
  if (slot.type === 'drive') return '→ Drive';
  if (slot.type === 'buffer') return '';
  if (slot.status === 'filled') return studentName ?? 'Filled';
  if (slot.sessionType === '1:1') return '1:1 Open';
  if (slot.sessionType === 'WC') return 'WC Open';
  return 'Assessment Open';
}

// Time markers every hour
const timeMarkers = Array.from({ length: 11 }, (_, i) => {
  const mins = DAY_START_MIN + i * 60;
  return { mins, label: minutesToTime(mins) };
});

export default function SchedulePage() {
  const { providers, students, slots, scheduleStudent, updateLunchTime } = useSchedulingStore();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [assigningSlot, setAssigningSlot] = useState<{ slot: TimeSlot; selectedStudentId: string } | null>(null);
  const [confirmAssign, setConfirmAssign] = useState<{ slot: TimeSlot; studentId: string } | null>(null);
  const [lunchModal, setLunchModal] = useState<{ providerId: string } | null>(null);

  const activeProviders = providers.filter(p => p.active);

  const visibleProviders = activeProviders.filter(p =>
    filterProvider === 'all' || p.id === filterProvider
  );

  const daySlots = slots.filter(s => s.day === selectedDay);
  const getStudent = (id?: string) => students.find(s => s.id === id);

  // Eligible students for a slot: Needs Scheduling, no existing individual assignment, or can be rescheduled
  const eligibleStudents = (slot: TimeSlot) =>
    students.filter(s =>
      s.status !== 'Cancelled' &&
      s.status !== 'Ended' &&
      !s.individual  // don't reassign already-scheduled students here
    );

  const moveLunch = (providerId: string, delta: number) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;
    const current = provider.schedule[selectedDay].lunchStartMinutes ?? LUNCH_EARLIEST;
    const next = Math.max(LUNCH_EARLIEST, Math.min(LUNCH_LATEST, current + delta));
    updateLunchTime(providerId, selectedDay, next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid #E2E8F0',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, color: '#0F172A', marginRight: 4 }}>
          Schedule
        </div>

        {/* Day selector */}
        <div style={{ display: 'flex', gap: 2, background: '#F1F5F9', borderRadius: 9, padding: 3 }}>
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '5px 12px',
                borderRadius: 7,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedDay === day ? 'white' : 'transparent',
                color: selectedDay === day ? '#0F172A' : '#64748B',
                boxShadow: selectedDay === day ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.12s ease',
              }}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Provider filter */}
        <select className="input input-sm" style={{ width: 180 }} value={filterProvider} onChange={e => setFilterProvider(e.target.value)}>
          <option value="all">All Providers</option>
          {activeProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {/* Legend */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#64748B', flexWrap: 'wrap' }}>
          {[
            { cls: 'tslot-open', label: '1:1 Open' },
            { cls: 'tslot-filled', label: 'Filled' },
            { cls: 'tslot-assess', label: 'Assessment' },
            { cls: 'tslot-wc', label: 'WC' },
            { cls: 'tslot-lunch', label: 'Lunch' },
            { cls: 'tslot-drive', label: 'Drive' },
          ].map(({ cls, label }) => (
            <span key={cls} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className={`tslot ${cls}`} style={{ position: 'relative', width: 14, height: 14, borderRadius: 3, display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid area */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', padding: '16px 24px' }}>
        {visibleProviders.length === 0 ? (
          <div className="empty-state">
            <h3>No providers visible</h3>
            <p>Add active providers to build the schedule.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
            {/* Time axis */}
            <div style={{ flexShrink: 0, width: 52, position: 'relative', height: TIMELINE_HEIGHT + 32, paddingTop: 44 }}>
              {timeMarkers.map(({ mins, label }) => (
                <div
                  key={mins}
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: 44 + (mins - DAY_START_MIN) * PX_PER_MIN,
                    fontSize: 10,
                    color: '#94A3B8',
                    whiteSpace: 'nowrap',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Provider columns */}
            {visibleProviders.map(provider => {
              const providerDaySlots = daySlots.filter(s => s.providerId === provider.id);
              const cap = getProviderDayCapacity(slots, provider.id, selectedDay);
              const daySchedule = provider.schedule[selectedDay];
              const isOff = daySchedule?.isOff ?? true;

              const morningSchool = daySchedule?.morning?.school ?? '';
              const afternoonSchool = daySchedule?.afternoon?.school;
              const schoolLabel = afternoonSchool && afternoonSchool !== morningSchool
                ? `${morningSchool} → ${afternoonSchool}`
                : morningSchool;

              return (
                <div key={provider.id} style={{ flex: 1, minWidth: 150, maxWidth: 220 }}>
                  {/* Provider header */}
                  <div style={{
                    borderRadius: 9,
                    padding: '9px 12px',
                    marginBottom: 8,
                    textAlign: 'center',
                    background: provider.color + '18',
                    borderBottom: `3px solid ${provider.color}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{provider.name}</div>
                    {!isOff ? (
                      <>
                        <div style={{ fontSize: 10, color: '#64748B', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{schoolLabel}</div>
                        <div style={{
                          fontSize: 10, fontWeight: 700, marginTop: 3,
                          color: cap.pctFull >= 80 ? '#DC2626' : cap.pctFull >= 70 ? '#D97706' : '#059669',
                        }}>
                          {cap.filled}/{cap.total} · {cap.pctFull}%
                          {/* Lunch adjust */}
                        </div>
                        <button
                          onClick={() => setLunchModal({ providerId: provider.id })}
                          style={{ fontSize: 9, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', marginTop: 2, textDecoration: 'underline' }}
                        >
                          adjust lunch
                        </button>
                      </>
                    ) : (
                      <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Off today</div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div style={{ position: 'relative', height: TIMELINE_HEIGHT }}>
                    {/* Hour grid lines */}
                    {timeMarkers.map(({ mins }) => (
                      <div key={mins} style={{
                        position: 'absolute',
                        top: (mins - DAY_START_MIN) * PX_PER_MIN,
                        left: 0, right: 0,
                        borderTop: '1px solid #F1F5F9',
                      }} />
                    ))}

                    {isOff ? (
                      <div style={{
                        position: 'absolute', inset: 0, background: '#F8F9FC',
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: '#94A3B8',
                      }}>
                        Off
                      </div>
                    ) : (
                      providerDaySlots.map(slot => {
                        const top = slotTop(slot.startMinutes);
                        const height = slotHeight(slot.startMinutes, slot.endMinutes);
                        const student = getStudent(slot.studentId);
                        const isClickable = slot.type === 'session' && slot.status === 'open';
                        const isFilled = slot.type === 'session' && slot.status === 'filled';

                        return (
                          <div
                            key={slot.id}
                            className={slotClass(slot)}
                            style={{ top, height }}
                            onClick={() => {
                              if (isClickable) {
                                setAssigningSlot({ slot, selectedStudentId: '' });
                              }
                            }}
                          >
                            {height > 18 && (
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {slotLabel(slot, student?.name)}
                                </span>
                                {isClickable && height > 24 && <UserPlus size={9} style={{ flexShrink: 0, opacity: 0.6 }} />}
                              </div>
                            )}
                            {height > 32 && (
                              <div style={{ fontSize: 9, opacity: 0.6, marginTop: 1 }}>
                                {minutesToTime(slot.startMinutes)}
                              </div>
                            )}
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

      {/* Assign student picker */}
      {assigningSlot && (
        <div className="modal-overlay" onClick={() => setAssigningSlot(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700 }}>Assign Student</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                {minutesToTime(assigningSlot.slot.startMinutes)} – {minutesToTime(assigningSlot.slot.endMinutes)} · {assigningSlot.slot.sessionType} · {assigningSlot.slot.school}
              </div>
            </div>
            <div style={{ padding: '14px 20px' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Select student
              </label>
              <select
                className="input"
                value={assigningSlot.selectedStudentId}
                onChange={e => setAssigningSlot(prev => prev ? { ...prev, selectedStudentId: e.target.value } : null)}
              >
                <option value="">Choose a student…</option>
                {eligibleStudents(assigningSlot.slot).map(s => (
                  <option key={s.id} value={s.id}>{s.name} — {s.school}</option>
                ))}
              </select>
              {eligibleStudents(assigningSlot.slot).length === 0 && (
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>
                  No students are currently available for scheduling.
                </div>
              )}
            </div>
            <div style={{ padding: '10px 20px 18px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setAssigningSlot(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={!assigningSlot.selectedStudentId}
                onClick={() => {
                  if (assigningSlot.selectedStudentId) {
                    setConfirmAssign({ slot: assigningSlot.slot, studentId: assigningSlot.selectedStudentId });
                    setAssigningSlot(null);
                  }
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm scheduling with start date */}
      {confirmAssign && (() => {
        const student = students.find(s => s.id === confirmAssign.studentId);
        const provider = providers.find(p => p.id === confirmAssign.slot.providerId);
        return (
          <ConfirmModal
            title="Confirm Scheduling"
            message={`Schedule ${student?.name} with ${provider?.name} on ${confirmAssign.slot.day} at ${minutesToTime(confirmAssign.slot.startMinutes)} (${confirmAssign.slot.school}).`}
            confirmLabel="Confirm & Schedule"
            showStartDate
            startDateLabel="Session Start Date"
            onCancel={() => setConfirmAssign(null)}
            onConfirm={({ startDate }) => {
              if (!startDate) return;
              const assignment: IndividualAssignment = {
                slotId: confirmAssign.slot.id,
                providerId: confirmAssign.slot.providerId,
                day: confirmAssign.slot.day as DayOfWeek,
                school: confirmAssign.slot.school ?? '',
                startDate,
              };
              scheduleStudent(confirmAssign.studentId, assignment);
              setConfirmAssign(null);
            }}
          />
        );
      })()}

      {/* Lunch adjust modal */}
      {lunchModal && (() => {
        const provider = providers.find(p => p.id === lunchModal.providerId);
        const currentLunch = provider?.schedule[selectedDay].lunchStartMinutes ?? LUNCH_EARLIEST;
        return (
          <div className="modal-overlay" onClick={() => setLunchModal(null)}>
            <div className="modal-box" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700 }}>Adjust Lunch Time</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{provider?.name} · {selectedDay}</div>
              </div>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => moveLunch(lunchModal.providerId, -15)}
                    disabled={currentLunch <= LUNCH_EARLIEST}
                  >
                    <ChevronLeft size={14} /> 15m
                  </button>
                  <div>
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 24, fontWeight: 700, color: '#1A2744' }}>
                      {minutesToTime(currentLunch)}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>Lunch start</div>
                  </div>
                  <button
                    className="btn btn-outline"
                    onClick={() => moveLunch(lunchModal.providerId, 15)}
                    disabled={currentLunch >= LUNCH_LATEST}
                  >
                    15m <ChevronRight size={14} />
                  </button>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 12 }}>
                  Allowed range: {minutesToTime(LUNCH_EARLIEST)} – {minutesToTime(LUNCH_LATEST)}
                </div>
              </div>
              <div style={{ padding: '10px 20px 18px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => setLunchModal(null)}>Done</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
