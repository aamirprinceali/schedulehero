'use client';

import { useState } from 'react';
import { Search, MapPin, User, Calendar, Layers, X } from 'lucide-react';
import { useSchedulingStore } from '@/lib/store';
import { minutesToTime } from '@/lib/dateUtils';
import { Student, CancellationReason } from '@/lib/types';
import ConfirmModal from '@/components/ui/ConfirmModal';

function StudentDetailModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const { providers, districts, cancelStudent, returnStudentToQueue } = useSchedulingStore();
  const [showCancel, setShowCancel] = useState(false);

  const provider = student.individual
    ? providers.find(p => p.id === student.individual!.providerId)
    : null;
  const district = districts.find(d => d.id === student.districtId);

  const inBoth = !!(student.individual && student.wellnessCircle);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box modal-box-wide" onClick={e => e.stopPropagation()}>
          <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {student.name}
                </h2>
                <span className="badge badge-green">Scheduled</span>
                {inBoth && (
                  <span className="badge badge-purple">1:1 + WC</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 3, display: 'flex', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{student.school}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} />{district?.name ?? student.districtId}</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: '18px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* 1:1 Assignment */}
            <div style={{ background: '#F8F9FC', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8', marginBottom: 8 }}>
                Individual Session (1:1)
              </div>
              {student.individual ? (
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{provider?.name}</div>
                  <div style={{ fontSize: 12, color: '#475569', display: 'flex', gap: 10 }}>
                    <span>{student.individual.day}</span>
                    <span>·</span>
                    <span>{student.individual.school}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Start: {student.individual.startDate}</div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#94A3B8' }}>Not assigned to an individual session.</div>
              )}
            </div>

            {/* WC Enrollment */}
            <div style={{ background: '#F8F9FC', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8', marginBottom: 8 }}>
                Wellness Circle
              </div>
              {student.wellnessCircle ? (
                <div style={{ display: 'grid', gap: 6 }}>
                  <span className="badge badge-purple" style={{ width: 'fit-content' }}>Enrolled</span>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Start: {student.wellnessCircle.startDate}</div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#94A3B8' }}>Not enrolled in a Wellness Circle.</div>
              )}
            </div>

            {/* Parent info */}
            {(student.parentName || student.parentEmail || student.parentPhone) && (
              <div style={{ background: '#F8F9FC', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8', marginBottom: 8 }}>
                  Parent / Guardian
                </div>
                {student.parentName && <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{student.parentName}</div>}
                {student.parentEmail && <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{student.parentEmail}</div>}
                {student.parentPhone && <div style={{ fontSize: 12, color: '#475569' }}>{student.parentPhone}</div>}
              </div>
            )}

            {/* Notes */}
            {student.notes && (
              <div style={{ background: '#FFFBEB', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8', marginBottom: 8 }}>Notes</div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{student.notes}</div>
              </div>
            )}
          </div>

          {/* History */}
          {student.history.length > 0 && (
            <div style={{ padding: '0 24px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8', marginBottom: 10 }}>
                History
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                {[...student.history].reverse().map(event => (
                  <div key={event.id} style={{ display: 'flex', gap: 12, fontSize: 12, padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#94A3B8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ color: '#475569', lineHeight: 1.4 }}>{event.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '12px 24px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9' }}>
            <button className="btn btn-danger btn-sm" onClick={() => setShowCancel(true)}>Cancel Services</button>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {showCancel && (
        <ConfirmModal
          title="Cancel Services"
          message={`Are you sure you want to cancel services for ${student.name}? This will remove their slot assignment.`}
          confirmLabel="Cancel Services"
          variant="danger"
          showDateField
          dateLabel="End Date"
          dateRequired
          showReasonField
          reasonLabel="Cancellation Reason"
          onCancel={() => setShowCancel(false)}
          onConfirm={({ date, reason }) => {
            if (!date || !reason) return;
            cancelStudent(student.id, date, reason as CancellationReason);
            setShowCancel(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

export default function ScheduledPage() {
  const { students, districts, providers } = useSchedulingStore();
  const [search, setSearch] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [selected, setSelected] = useState<Student | null>(null);

  const scheduled = students.filter(s => s.status === 'Scheduled');

  const filtered = scheduled.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.school.toLowerCase().includes(search.toLowerCase());
    const matchDistrict = !filterDistrict || s.districtId === filterDistrict;
    const matchProvider = !filterProvider ||
      s.individual?.providerId === filterProvider;
    return matchSearch && matchDistrict && matchProvider;
  });

  const inBothCount = scheduled.filter(s => s.individual && s.wellnessCircle).length;

  return (
    <>
      <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="page-title">Scheduled Students</h1>
              <span style={{ fontSize: 12, fontWeight: 700, background: '#10B981', color: 'white', borderRadius: 99, padding: '2px 9px' }}>
                {scheduled.length}
              </span>
            </div>
            <p className="page-subtitle">
              All active students with scheduled sessions.
              {inBothCount > 0 && (
                <span style={{ marginLeft: 8, color: '#7C3AED', fontWeight: 600 }}>
                  {inBothCount} enrolled in both 1:1 + WC.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              className="input"
              style={{ paddingLeft: 32 }}
              placeholder="Search students or schools…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input" style={{ width: 200 }} value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
            <option value="">All Districts</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="input" style={{ width: 200 }} value={filterProvider} onChange={e => setFilterProvider(e.target.value)}>
            <option value="">All Providers</option>
            {providers.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <h3>{scheduled.length === 0 ? 'No scheduled students yet' : 'No matching students'}</h3>
              <p>{scheduled.length === 0 ? 'Head to the Queue to start scheduling.' : 'Adjust your filters.'}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>School</th>
                  <th>District</th>
                  <th>Provider</th>
                  <th>Session Day</th>
                  <th>Start Date</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => {
                  const provider = providers.find(p => p.id === student.individual?.providerId);
                  const district = districts.find(d => d.id === student.districtId);
                  const inBoth = !!(student.individual && student.wellnessCircle);
                  return (
                    <tr key={student.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(student)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{student.name}</div>
                          {inBoth && <span className="badge badge-purple">1:1 + WC</span>}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: '#475569' }}>{student.school}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#64748B' }}>{district?.name ?? student.districtId}</span>
                      </td>
                      <td>
                        {provider ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: provider.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: '#0F172A' }}>{provider.name}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>WC only</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#475569' }}>{student.individual?.day ?? '—'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#475569' }}>{student.individual?.startDate ?? student.wellnessCircle?.startDate ?? '—'}</span>
                      </td>
                      <td>
                        {student.individual && <span className="badge badge-green" style={{ marginRight: 4 }}>1:1</span>}
                        {student.wellnessCircle && <span className="badge badge-purple">WC</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <StudentDetailModal student={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
