'use client';

import { useState } from 'react';
import { Student } from '@/lib/types';
import { useSchedulingStore } from '@/lib/store';

interface Props {
  existing?: Student;
  onClose: () => void;
}

export default function StudentForm({ existing, onClose }: Props) {
  const { districts, addStudentToQueue, updateStudentInfo } = useSchedulingStore();

  const [name, setName] = useState(existing?.name ?? '');
  const [dob, setDob] = useState(existing?.dob ?? '');
  const [districtId, setDistrictId] = useState(existing?.districtId ?? '');
  const [school, setSchool] = useState(existing?.school ?? '');
  const [parentName, setParentName] = useState(existing?.parentName ?? '');
  const [parentEmail, setParentEmail] = useState(existing?.parentEmail ?? '');
  const [parentPhone, setParentPhone] = useState(existing?.parentPhone ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const selectedDistrict = districts.find(d => d.id === districtId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !districtId || !school) return;

    if (existing) {
      updateStudentInfo(existing.id, {
        name: name.trim(),
        dob: dob || undefined,
        districtId,
        school,
        parentName: parentName || undefined,
        parentEmail: parentEmail || undefined,
        parentPhone: parentPhone || undefined,
        notes: notes || undefined,
      });
    } else {
      addStudentToQueue({
        name: name.trim(),
        dob: dob || undefined,
        districtId,
        school,
        parentName: parentName || undefined,
        parentEmail: parentEmail || undefined,
        parentPhone: parentPhone || undefined,
        notes: notes || undefined,
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: 12, padding: '18px 22px' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
            Student Name <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input className="input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
              District <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select className="input" value={districtId} onChange={e => { setDistrictId(e.target.value); setSchool(''); }} required>
              <option value="">Select district…</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
              School <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select className="input" value={school} onChange={e => setSchool(e.target.value)} required disabled={!selectedDistrict}>
              <option value="">Select school…</option>
              {selectedDistrict?.schools.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Date of Birth (optional)</label>
          <input type="date" className="input" value={dob} onChange={e => setDob(e.target.value)} />
        </div>

        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Parent / Guardian (optional)
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <input className="input" placeholder="Parent name" value={parentName} onChange={e => setParentName(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input className="input" type="email" placeholder="Email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} />
              <input className="input" type="tel" placeholder="Phone" value={parentPhone} onChange={e => setParentPhone(e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Notes</label>
          <textarea className="input" rows={2} placeholder="Optional notes…" value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '10px 22px 18px', borderTop: '1px solid #F1F5F9' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">{existing ? 'Save Changes' : 'Add Student'}</button>
      </div>
    </form>
  );
}
