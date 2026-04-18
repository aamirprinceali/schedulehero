'use client';

import { useState } from 'react';
import { Search, RotateCcw, MapPin } from 'lucide-react';
import { useSchedulingStore } from '@/lib/store';
import { Student } from '@/lib/types';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function CancelledPage() {
  const { students, districts, providers, returnStudentToQueue } = useSchedulingStore();
  const [search, setSearch] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [returning, setReturning] = useState<Student | null>(null);

  const discontinued = students.filter(s => s.status === 'Cancelled' || s.status === 'Ended');

  const filtered = discontinued.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.school.toLowerCase().includes(search.toLowerCase());
    const matchReason = !filterReason || s.cancellationReason === filterReason;
    const matchDistrict = !filterDistrict || s.districtId === filterDistrict;
    return matchSearch && matchReason && matchDistrict;
  });

  // Unique cancellation reasons present in the data
  const reasons = Array.from(new Set(discontinued.map(s => s.cancellationReason).filter(Boolean)));

  return (
    <>
      <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="page-title">Cancelled & Ended</h1>
              <span style={{ fontSize: 12, fontWeight: 700, background: '#64748B', color: 'white', borderRadius: 99, padding: '2px 9px' }}>
                {discontinued.length}
              </span>
            </div>
            <p className="page-subtitle">Students whose services have been discontinued.</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              className="input"
              style={{ paddingLeft: 32 }}
              placeholder="Search students…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input" style={{ width: 220 }} value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
            <option value="">All Districts</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="input" style={{ width: 220 }} value={filterReason} onChange={e => setFilterReason(e.target.value)}>
            <option value="">All Reasons</option>
            {reasons.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <h3>{discontinued.length === 0 ? 'No discontinued students' : 'No matching results'}</h3>
              <p>{discontinued.length === 0 ? 'Cancelled and ended students will appear here.' : 'Adjust your filters.'}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>School / District</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>End Date</th>
                  <th style={{ width: 130 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => {
                  const district = districts.find(d => d.id === student.districtId);
                  return (
                    <tr key={student.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{student.name}</div>
                        {student.parentName && (
                          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{student.parentName}</div>
                        )}
                        {/* Last history entry */}
                        {student.history.length > 0 && (
                          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, fontStyle: 'italic' }}>
                            {new Date(student.history[student.history.length - 1].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} color="#94A3B8" /> {student.school}
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{district?.name ?? student.districtId}</div>
                      </td>
                      <td>
                        <span className={`badge ${student.status === 'Cancelled' ? 'badge-red' : 'badge-slate'}`}>
                          {student.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#475569' }}>{student.cancellationReason ?? '—'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#64748B' }}>{student.cancelledDate ?? '—'}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                          onClick={() => setReturning(student)}
                        >
                          <RotateCcw size={11} /> Return to Queue
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {returning && (
        <ConfirmModal
          title="Return to Queue"
          message={`Return ${returning.name} to the Ready to Schedule queue? Their cancellation history will be preserved.`}
          confirmLabel="Return to Queue"
          onCancel={() => setReturning(null)}
          onConfirm={() => {
            returnStudentToQueue(returning.id);
            setReturning(null);
          }}
        />
      )}
    </>
  );
}
