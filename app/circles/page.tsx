'use client';

import { useState } from 'react';
import { Plus, Users, MapPin, Calendar, X, UserPlus, UserMinus } from 'lucide-react';
import { useSchedulingStore } from '@/lib/store';
import { minutesToTime } from '@/lib/dateUtils';
import { WellnessCircle, DAYS, DayOfWeek, WC_MAX_STUDENTS } from '@/lib/types';
import ConfirmModal from '@/components/ui/ConfirmModal';

function AddWCModal({ onClose }: { onClose: () => void }) {
  const { providers, districts, addWellnessCircle } = useSchedulingStore();
  const [form, setForm] = useState({
    providerId: '',
    school: '',
    day: 'Monday' as DayOfWeek,
    startHour: '9',
    startMin: '00',
    label: '',
    startDate: '',
  });

  const selectedProvider = providers.find(p => p.id === form.providerId);

  // Collect all schools from districts
  const allSchools = districts.flatMap(d => d.schools);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.providerId || !form.school || !form.startDate) return;
    const startMinutes = parseInt(form.startHour) * 60 + parseInt(form.startMin);
    addWellnessCircle({
      providerId: form.providerId,
      school: form.school,
      day: form.day,
      startMinutes,
      maxStudents: 10,
      label: form.label || undefined,
      startDate: form.startDate,
      isActive: true,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 22px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700 }}>
            New Wellness Circle
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '18px 22px' }}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Provider <span style={{ color: '#EF4444' }}>*</span></label>
              <select className="input" value={form.providerId} onChange={e => setForm(f => ({ ...f, providerId: e.target.value }))} required>
                <option value="">Select provider…</option>
                {providers.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Day <span style={{ color: '#EF4444' }}>*</span></label>
                <select className="input" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value as DayOfWeek }))}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Start Time <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select className="input" value={form.startHour} onChange={e => setForm(f => ({ ...f, startHour: e.target.value }))}>
                    {Array.from({ length: 11 }, (_, i) => i + 7).map(h => (
                      <option key={h} value={h}>{h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}</option>
                    ))}
                  </select>
                  <select className="input" value={form.startMin} onChange={e => setForm(f => ({ ...f, startMin: e.target.value }))}>
                    <option value="00">:00</option>
                    <option value="15">:15</option>
                    <option value="30">:30</option>
                    <option value="45">:45</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>School <span style={{ color: '#EF4444' }}>*</span></label>
              <select className="input" value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} required>
                <option value="">Select school…</option>
                {allSchools.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Label (optional)</label>
              <input className="input" placeholder="e.g. Tuesday Morning Group" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Start Date <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="date" className="input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Wellness Circle</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EnrollModal({ wc, onClose }: { wc: WellnessCircle; onClose: () => void }) {
  const { students, providers, enrollStudentInWC } = useSchedulingStore();
  const [startDate, setStartDate] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Eligible: not already in this WC, not already in another WC, status !== Cancelled/Ended
  const eligible = students.filter(s =>
    s.status !== 'Cancelled' &&
    s.status !== 'Ended' &&
    !s.wellnessCircle &&
    !wc.studentIds.includes(s.id)
  );

  const handleEnroll = () => {
    if (!selectedStudentId || !startDate) return;
    enrollStudentInWC(selectedStudentId, wc.id, startDate);
    onClose();
  };

  const provider = providers.find(p => p.id === wc.providerId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700 }}>
            Enroll Student in Wellness Circle
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
            {provider?.name} · {wc.day} · {wc.school} · {wc.studentIds.length}/{WC_MAX_STUDENTS} enrolled
          </div>
        </div>
        <div style={{ padding: '16px 22px', display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
              Student <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select className="input" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
              <option value="">Select student…</option>
              {eligible.map(s => <option key={s.id} value={s.id}>{s.name} — {s.school}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
              Start Date <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          {eligible.length === 0 && (
            <div className="alert alert-blue" style={{ fontSize: 12 }}>
              All eligible students are already enrolled in a Wellness Circle.
            </div>
          )}
        </div>
        <div style={{ padding: '10px 22px 18px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!selectedStudentId || !startDate}
            onClick={handleEnroll}
          >
            Enroll Student
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CirclesPage() {
  const { wellnessCircles, students, providers, removeStudentFromWC, deactivateWellnessCircle } = useSchedulingStore();
  const [showAddWC, setShowAddWC] = useState(false);
  const [enrollWC, setEnrollWC] = useState<WellnessCircle | null>(null);
  const [removingStudent, setRemovingStudent] = useState<{ studentId: string; wcId: string; name: string } | null>(null);

  const activeWCs = wellnessCircles.filter(wc => wc.isActive);

  return (
    <>
      <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="page-title">Wellness Circles</h1>
              <span style={{ fontSize: 12, fontWeight: 700, background: '#7C3AED', color: 'white', borderRadius: 99, padding: '2px 9px' }}>
                {activeWCs.length}
              </span>
            </div>
            <p className="page-subtitle">Group sessions — up to 10 students per circle.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddWC(true)}>
            <Plus size={14} /> New Wellness Circle
          </button>
        </div>

        {activeWCs.length === 0 ? (
          <div className="empty-state card" style={{ padding: 52 }}>
            <h3>No Wellness Circles yet</h3>
            <p>Create your first Wellness Circle to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {activeWCs.map(wc => {
              const provider = providers.find(p => p.id === wc.providerId);
              const enrolled = students.filter(s => wc.studentIds.includes(s.id));
              const spotsLeft = WC_MAX_STUDENTS - wc.studentIds.length;
              const pctFull = Math.round((wc.studentIds.length / WC_MAX_STUDENTS) * 100);

              return (
                <div key={wc.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Card header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={16} color="#7C3AED" />
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                          {wc.label ?? `${wc.day} Group`}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, display: 'flex', gap: 10 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: provider?.color ?? '#94A3B8' }} />
                            {provider?.name}
                          </span>
                          <span>·</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Calendar size={11} /> {wc.day}
                          </span>
                          <span>·</span>
                          <span>{minutesToTime(wc.startMinutes)}</span>
                          <span>·</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={11} /> {wc.school}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontFamily: "'Geist Mono', monospace", fontWeight: 700, color: pctFull >= 80 ? '#DC2626' : pctFull >= 70 ? '#D97706' : '#0F172A' }}>
                          {wc.studentIds.length}/{WC_MAX_STUDENTS}
                        </div>
                        <div style={{ fontSize: 10, color: '#94A3B8' }}>{spotsLeft} open</div>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setEnrollWC(wc)}
                        disabled={spotsLeft === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        <UserPlus size={12} /> Enroll
                      </button>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div style={{ padding: '8px 20px', background: '#FAFBFC' }}>
                    <div className="cap-bar">
                      <div
                        className={`cap-fill ${pctFull >= 80 ? 'cap-red' : pctFull >= 70 ? 'cap-amber' : 'cap-green'}`}
                        style={{ width: `${pctFull}%` }}
                      />
                    </div>
                  </div>

                  {/* Enrolled students */}
                  {enrolled.length > 0 && (
                    <div style={{ padding: '12px 20px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8', marginBottom: 8 }}>
                        Enrolled Students
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {enrolled.map(student => (
                          <div key={student.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 10px', background: '#F8F9FC', borderRadius: 7,
                          }}>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{student.name}</span>
                              <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 8 }}>{student.school}</span>
                            </div>
                            <button
                              onClick={() => setRemovingStudent({ studentId: student.id, wcId: wc.id, name: student.name })}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}
                            >
                              <UserMinus size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {enrolled.length === 0 && (
                    <div style={{ padding: '14px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
                      No students enrolled yet.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddWC && <AddWCModal onClose={() => setShowAddWC(false)} />}
      {enrollWC && <EnrollModal wc={enrollWC} onClose={() => setEnrollWC(null)} />}
      {removingStudent && (
        <ConfirmModal
          title="Remove from Wellness Circle"
          message={`Remove ${removingStudent.name} from this Wellness Circle? They will remain in their individual session if they have one.`}
          confirmLabel="Remove"
          variant="danger"
          onCancel={() => setRemovingStudent(null)}
          onConfirm={() => {
            removeStudentFromWC(removingStudent.studentId, removingStudent.wcId);
            setRemovingStudent(null);
          }}
        />
      )}
    </>
  );
}
