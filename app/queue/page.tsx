'use client';

import { useState } from 'react';
import { Plus, Search, AlertTriangle, Clock, MapPin, Zap, X } from 'lucide-react';
import { useSchedulingStore } from '@/lib/store';
import { isStale } from '@/lib/dateUtils';
import { Student, District } from '@/lib/types';
import QuickAssignPanel from '@/components/ui/QuickAssignPanel';

function AddStudentModal({ districts, onClose }: { districts: District[]; onClose: () => void }) {
  const { addStudentToQueue } = useSchedulingStore();
  const [form, setForm] = useState({
    name: '', districtId: '', school: '',
    parentName: '', parentEmail: '', parentPhone: '', notes: '',
  });

  const selectedDistrict = districts.find(d => d.id === form.districtId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.districtId || !form.school) return;
    addStudentToQueue({
      name: form.name,
      districtId: form.districtId,
      school: form.school,
      parentName: form.parentName || undefined,
      parentEmail: form.parentEmail || undefined,
      parentPhone: form.parentPhone || undefined,
      notes: form.notes || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 22px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
            Add Student to Queue
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Student will be added to Ready to Schedule queue.</div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '18px 22px' }}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                Student Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                className="input"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  District <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  className="input"
                  value={form.districtId}
                  onChange={e => setForm(f => ({ ...f, districtId: e.target.value, school: '' }))}
                  required
                >
                  <option value="">Select district…</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  School <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  className="input"
                  value={form.school}
                  onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                  required
                  disabled={!selectedDistrict}
                >
                  <option value="">Select school…</option>
                  {selectedDistrict?.schools.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Parent / Guardian (optional)
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <input className="input" placeholder="Parent name" value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input className="input" placeholder="Email" type="email" value={form.parentEmail} onChange={e => setForm(f => ({ ...f, parentEmail: e.target.value }))} />
                  <input className="input" placeholder="Phone" type="tel" value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} />
                </div>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Notes</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Any relevant notes…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ resize: 'vertical', minHeight: 60 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add to Queue</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function daysInQueue(queuedAt: string): number {
  return Math.floor((Date.now() - new Date(queuedAt).getTime()) / (1000 * 60 * 60 * 24));
}

export default function QueuePage() {
  const { students, districts } = useSchedulingStore();
  const [search, setSearch] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignStudent, setAssignStudent] = useState<Student | null>(null);

  const queueStudents = students.filter(s => s.status === 'Needs Scheduling');

  const filtered = queueStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.school.toLowerCase().includes(search.toLowerCase());
    const matchDistrict = !filterDistrict || s.districtId === filterDistrict;
    return matchSearch && matchDistrict;
  });

  const staleCount = queueStudents.filter(s => isStale(s.queuedAt)).length;

  return (
    <>
      <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="page-title">Ready to Schedule</h1>
              <span style={{
                fontSize: 12, fontWeight: 700,
                background: '#1A2744', color: 'white',
                borderRadius: 99, padding: '2px 9px',
              }}>
                {queueStudents.length}
              </span>
              {staleCount > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: '#EF4444', color: 'white',
                  borderRadius: 99, padding: '2px 8px',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <AlertTriangle size={10} /> {staleCount} stale
                </span>
              )}
            </div>
            <p className="page-subtitle">Students waiting to be placed into sessions.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Student
          </button>
        </div>

        {/* Stale alert */}
        {staleCount > 0 && (
          <div className="alert alert-red" style={{ marginBottom: 18 }}>
            <AlertTriangle size={15} />
            <span>
              <strong>{staleCount} student{staleCount !== 1 ? 's' : ''}</strong> {staleCount !== 1 ? 'have' : 'has'} been in the queue for more than 5 days and need immediate attention.
            </span>
          </div>
        )}

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
        </div>

        {/* Queue table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <h3>{queueStudents.length === 0 ? 'Queue is clear' : 'No matching students'}</h3>
              <p>{queueStudents.length === 0 ? 'All students are scheduled. Great work!' : 'Try adjusting your search or filters.'}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>School</th>
                  <th>District</th>
                  <th>Days in Queue</th>
                  <th>Status</th>
                  <th style={{ width: 120 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => {
                  const stale = isStale(student.queuedAt);
                  const days = daysInQueue(student.queuedAt);
                  const district = districts.find(d => d.id === student.districtId);
                  return (
                    <tr key={student.id} className={stale ? 'stale-row' : ''}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{student.name}</div>
                        {student.parentName && (
                          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{student.parentName}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#475569' }}>
                          <MapPin size={11} color="#94A3B8" />
                          {student.school}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#64748B' }}>{district?.name ?? student.districtId}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={12} color={stale ? '#EF4444' : '#94A3B8'} />
                          <span style={{
                            fontSize: 12, fontWeight: stale ? 700 : 400,
                            color: stale ? '#DC2626' : '#475569',
                          }}>
                            {days} day{days !== 1 ? 's' : ''}
                          </span>
                          {stale && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#FEE2E2', color: '#DC2626', borderRadius: 99, padding: '1px 6px' }}>
                              STALE
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-amber">Needs Scheduling</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-accent btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                          onClick={() => setAssignStudent(student)}
                        >
                          <Zap size={12} /> Schedule
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Empty queue message */}
        {queueStudents.length > 0 && filtered.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#94A3B8' }}>
            Showing {filtered.length} of {queueStudents.length} students in queue
          </div>
        )}
      </div>

      {showAddModal && (
        <AddStudentModal districts={districts} onClose={() => setShowAddModal(false)} />
      )}

      {assignStudent && (
        <QuickAssignPanel student={assignStudent} onClose={() => setAssignStudent(null)} />
      )}
    </>
  );
}
