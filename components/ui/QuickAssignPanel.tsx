'use client';

import { useState } from 'react';
import { X, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';
import { useSchedulingStore } from '@/lib/store';
import { Student, DayOfWeek, DAYS, IndividualAssignment, SessionType } from '@/lib/types';
import { minutesToTime } from '@/lib/dateUtils';
import ConfirmModal from './ConfirmModal';

interface QuickAssignPanelProps {
  student: Student;
  onClose: () => void;
}

export default function QuickAssignPanel({ student, onClose }: QuickAssignPanelProps) {
  const { slots, providers, scheduleStudent } = useSchedulingStore();
  const [filterDay, setFilterDay] = useState<DayOfWeek | 'All'>('All');
  const [filterType, setFilterType] = useState<SessionType | 'All'>('All');
  const [confirming, setConfirming] = useState<{ slot: typeof slots[0]; provider: typeof providers[0] } | null>(null);

  // Get all open session slots
  const openSlots = slots.filter(s =>
    s.type === 'session' &&
    s.status === 'open' &&
    (filterDay === 'All' || s.day === filterDay) &&
    (filterType === 'All' || s.sessionType === filterType)
  );

  // Group by provider
  const byProvider: Record<string, typeof openSlots> = {};
  for (const slot of openSlots) {
    if (!byProvider[slot.providerId]) byProvider[slot.providerId] = [];
    byProvider[slot.providerId].push(slot);
  }

  const sessionTypeColors: Record<SessionType, string> = {
    '1:1': 'badge-green',
    'WC': 'badge-purple',
    'Assessment': 'badge-amber',
  };

  return (
    <>
      <div className="slide-panel-overlay" onClick={onClose} />
      <div className="slide-panel">
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
              Quick Schedule
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
              <X size={15} />
            </button>
          </div>
          <div style={{ background: '#F8F9FC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{student.name}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, display: 'flex', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} /> {student.school}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={11} /> {student.districtId}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Day</label>
            <select
              value={filterDay}
              onChange={e => setFilterDay(e.target.value as DayOfWeek | 'All')}
              className="input input-sm"
            >
              <option value="All">All Days</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as SessionType | 'All')}
              className="input input-sm"
            >
              <option value="All">All Types</option>
              <option value="1:1">1:1 Individual</option>
              <option value="Assessment">Assessment</option>
            </select>
          </div>
        </div>

        {/* Slots list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {openSlots.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 40 }}>
              <h3>No open slots</h3>
              <p>Adjust filters or check provider schedules.</p>
            </div>
          ) : (
            Object.entries(byProvider).map(([providerId, providerSlots]) => {
              const provider = providers.find(p => p.id === providerId);
              if (!provider) return null;
              return (
                <div key={providerId} style={{ marginBottom: 16 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, fontWeight: 700, color: '#475569',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    marginBottom: 6,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: provider.color, flexShrink: 0 }} />
                    {provider.name}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {providerSlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setConfirming({ slot, provider })}
                        style={{
                          background: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          padding: '8px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          textAlign: 'left',
                          transition: 'all 0.1s ease',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = provider.color;
                          (e.currentTarget as HTMLElement).style.background = '#FAFBFC';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
                          (e.currentTarget as HTMLElement).style.background = 'white';
                        }}
                      >
                        <div style={{ flexShrink: 0 }}>
                          <Clock size={13} color={provider.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>
                            {slot.day} · {minutesToTime(slot.startMinutes)}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{slot.school}</div>
                        </div>
                        <span className={`badge ${sessionTypeColors[slot.sessionType as SessionType]}`}>
                          {slot.sessionType}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirm scheduling */}
      {confirming && (
        <ConfirmModal
          title="Confirm Scheduling"
          message={`Schedule ${student.name} with ${confirming.provider.name} on ${confirming.slot.day} at ${minutesToTime(confirming.slot.startMinutes)} (${confirming.slot.school}).`}
          confirmLabel="Schedule Student"
          showStartDate
          startDateLabel="Session Start Date"
          onCancel={() => setConfirming(null)}
          onConfirm={({ startDate }) => {
            if (!startDate) return;
            const assignment: IndividualAssignment = {
              slotId: confirming.slot.id,
              providerId: confirming.provider.id,
              day: confirming.slot.day as DayOfWeek,
              school: confirming.slot.school ?? '',
              startDate,
            };
            scheduleStudent(student.id, assignment);
            setConfirming(null);
            onClose();
          }}
        />
      )}
    </>
  );
}
