'use client';

import { useState } from 'react';
import { useSchedulingStore } from '@/lib/store';
import { Student, SessionType } from '@/lib/types';
import { minutesToTime } from '@/lib/slotGenerator';
import Modal from '@/components/ui/Modal';
import StudentForm from '@/components/students/StudentForm';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const SESSION_LABEL: Record<SessionType, string> = {
  '1:1': '1:1 Individual',
  'WC': 'Wellness Circle',
  'Assessment': 'Assessment',
};

const SESSION_COLOR: Record<SessionType, string> = {
  '1:1': 'bg-blue-100 text-blue-700',
  'WC': 'bg-purple-100 text-purple-700',
  'Assessment': 'bg-yellow-100 text-yellow-700',
};

const STATUS_COLOR: Record<string, string> = {
  'Needs Scheduling': 'bg-red-100 text-red-700',
  'Scheduled': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-gray-100 text-gray-600',
  'No-Show': 'bg-orange-100 text-orange-700',
  'Make-Up': 'bg-indigo-100 text-indigo-700',
};

export default function StudentsPage() {
  const { students, providers, slots, districts, unassignStudent, removeStudent } = useSchedulingStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSession, setFilterSession] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');

  const needsScheduling = students.filter(s => s.status === 'Needs Scheduling');

  const filtered = students.filter(s => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterSession !== 'all' && s.sessionType !== filterSession) return false;
    if (filterDistrict !== 'all' && s.districtId !== filterDistrict) return false;
    return true;
  });

  const getProviderName = (id?: string) => providers.find(p => p.id === id)?.name ?? '—';
  const getSlotTime = (slotId?: string) => {
    if (!slotId) return null;
    const slot = slots.find(s => s.id === slotId);
    return slot ? minutesToTime(slot.startMinutes) : null;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5">{students.length} total · {needsScheduling.length} need scheduling</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e55a24] transition-colors"
        >
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {/* Alert banner */}
      {needsScheduling.length > 0 && (
        <div className="mb-5 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-amber-500 shrink-0" />
          <span className="text-sm text-amber-800">
            <strong>{needsScheduling.length} student{needsScheduling.length !== 1 ? 's' : ''}</strong> need{needsScheduling.length === 1 ? 's' : ''} to be scheduled.
            Go to <strong>Master Schedule</strong> to assign them.
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="Needs Scheduling">Needs Scheduling</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Cancelled">Cancelled</option>
          <option value="No-Show">No-Show</option>
          <option value="Make-Up">Make-Up</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]" value={filterSession} onChange={e => setFilterSession(e.target.value)}>
          <option value="all">All Session Types</option>
          <option value="1:1">1:1 Individual</option>
          <option value="WC">Wellness Circle</option>
          <option value="Assessment">Assessment</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]" value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
          <option value="all">All Districts</option>
          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No students found</p>
          <p className="text-sm mt-1">Add students to start scheduling</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">School</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Session</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Provider</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Day / Time</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                  <td className="px-4 py-3 text-gray-600">{student.school}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${SESSION_COLOR[student.sessionType]}`}>
                      {SESSION_LABEL[student.sessionType]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[student.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{getProviderName(student.providerId)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {student.day && getSlotTime(student.slotId)
                      ? `${student.day} ${getSlotTime(student.slotId)}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {student.slotId && (
                        <button
                          onClick={() => { if (confirm('Remove this student from their slot?')) unassignStudent(student.id); }}
                          className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
                          title="Unassign from slot"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => { setEditing(student); setShowForm(true); }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Edit student"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Remove ${student.name}?`)) removeStudent(student.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Student' : 'Add Student'} onClose={() => { setShowForm(false); setEditing(null); }} wide>
          <StudentForm existing={editing ?? undefined} onClose={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}
