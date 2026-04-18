'use client';

import { useState } from 'react';
import { Student, SessionType, StudentStatus } from '@/lib/types';
import { useSchedulingStore } from '@/lib/store';

const SESSION_TYPES: SessionType[] = ['1:1', 'WC', 'Assessment'];

interface Props {
  existing?: Student;
  onClose: () => void;
}

export default function StudentForm({ existing, onClose }: Props) {
  const { districts, addStudent, updateStudent } = useSchedulingStore();
  const allSchools = districts.flatMap(d => d.schools);

  const [name, setName] = useState(existing?.name ?? '');
  const [dob, setDob] = useState(existing?.dob ?? '');
  const [districtId, setDistrictId] = useState(existing?.districtId ?? '');
  const [school, setSchool] = useState(existing?.school ?? '');
  const [sessionType, setSessionType] = useState<SessionType>(existing?.sessionType ?? '1:1');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [addedBy, setAddedBy] = useState(existing?.addedBy ?? '');

  // Schools for selected district — used for datalist suggestions
  const selectedDistrict = districts.find(d => d.id === districtId);
  const districtSchools = selectedDistrict?.schools ?? allSchools;

  const schoolListId = 'student-school-list';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only name, district, session type, and school are required
    if (!name.trim() || !districtId || !school) return;

    const studentData = {
      name: name.trim(),
      dob: dob || undefined,
      districtId,
      school,
      sessionType,
      status: (existing?.status ?? 'Needs Scheduling') as StudentStatus,
      notes,
      addedBy: addedBy || 'Staff',
      providerId: existing?.providerId,
      day: existing?.day,
      slotId: existing?.slotId,
    };

    if (existing) {
      updateStudent(existing.id, studentData);
    } else {
      addStudent(studentData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Full name"
          required
        />
      </div>

      {/* District + School */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            value={districtId}
            onChange={e => { setDistrictId(e.target.value); setSchool(''); }}
            required
          >
            <option value="">— Select district —</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
          {/* datalist allows free-typing a school not yet in the system */}
          <input
            list={schoolListId}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            value={school}
            onChange={e => setSchool(e.target.value)}
            placeholder="Type or select school"
            required
          />
          <datalist id={schoolListId}>
            {districtSchools.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>
      </div>

      {/* Session Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Session Type *</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
          value={sessionType}
          onChange={e => setSessionType(e.target.value as SessionType)}
        >
          {SESSION_TYPES.map(st => (
            <option key={st} value={st}>
              {st === '1:1' ? '1:1 (Individual)' : st === 'WC' ? 'Wellness Circle' : 'Assessment'}
            </option>
          ))}
        </select>
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            value={dob}
            onChange={e => setDob(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Added By <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            value={addedBy}
            onChange={e => setAddedBy(e.target.value)}
            placeholder="Scheduler name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] resize-none"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Optional notes"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" className="flex-1 bg-[#FF6B35] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#e55a24] transition-colors">
          {existing ? 'Save Changes' : 'Add Student'}
        </button>
      </div>
    </form>
  );
}
