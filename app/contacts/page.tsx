'use client';

import { useState } from 'react';
import { Plus, Phone, Mail, Building2, User, Trash2, X } from 'lucide-react';
import { useSchedulingStore } from '@/lib/store';
import { DistrictContact } from '@/lib/types';

function AddContactModal({ onClose }: { onClose: () => void }) {
  const { districts, addDistrictContact } = useSchedulingStore();
  const [form, setForm] = useState({
    districtId: '', school: '', name: '', role: '', email: '', phone: '', notes: '',
  });

  const selectedDistrict = districts.find(d => d.id === form.districtId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.districtId || !form.name) return;
    addDistrictContact({
      districtId: form.districtId,
      school: form.school || undefined,
      name: form.name,
      role: form.role || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      notes: form.notes || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700 }}>Add Contact</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '16px 22px' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>District <span style={{ color: '#EF4444' }}>*</span></label>
                <select className="input" value={form.districtId} onChange={e => setForm(f => ({ ...f, districtId: e.target.value, school: '' }))} required>
                  <option value="">Select district…</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>School (optional)</label>
                <select className="input" value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} disabled={!selectedDistrict}>
                  <option value="">District-level</option>
                  {selectedDistrict?.schools.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="input" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Role</label>
                <input className="input" placeholder="e.g. Counselor, Principal" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Email</label>
                <input className="input" type="email" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Phone</label>
                <input className="input" type="tel" placeholder="Phone number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Notes</label>
              <textarea className="input" rows={2} placeholder="Any relevant notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Contact</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const { districtContacts, districts, students, removeDistrictContact } = useSchedulingStore();
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<'district' | 'parent'>('district');
  const [filterDistrict, setFilterDistrict] = useState('');

  const filteredContacts = districtContacts.filter(c =>
    !filterDistrict || c.districtId === filterDistrict
  );

  // Parent contacts from student records
  const parentContacts = students
    .filter(s => s.parentName || s.parentEmail || s.parentPhone)
    .filter(s => !filterDistrict || s.districtId === filterDistrict);

  const tabStyle = (tab: 'district' | 'parent') => ({
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    border: 'none',
    borderRadius: 7,
    cursor: 'pointer',
    background: activeTab === tab ? '#1A2744' : 'transparent',
    color: activeTab === tab ? 'white' : '#64748B',
    transition: 'all 0.12s ease',
  });

  return (
    <>
      <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>Contacts</h1>
            <p className="page-subtitle">District contacts and parent/guardian information.</p>
          </div>
          {activeTab === 'district' && (
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add Contact
            </button>
          )}
        </div>

        {/* Tabs + filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 9, padding: 4 }}>
            <button style={tabStyle('district')} onClick={() => setActiveTab('district')}>
              District Contacts ({districtContacts.length})
            </button>
            <button style={tabStyle('parent')} onClick={() => setActiveTab('parent')}>
              Parent / Guardian ({parentContacts.length})
            </button>
          </div>
          <select className="input" style={{ width: 200 }} value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
            <option value="">All Districts</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {activeTab === 'district' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            {filteredContacts.length === 0 ? (
              <div className="empty-state">
                <h3>No contacts yet</h3>
                <p>Add district contacts to keep track of school liaisons, counselors, and administrators.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>District / School</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th style={{ width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map(contact => {
                    const district = districts.find(d => d.id === contact.districtId);
                    return (
                      <tr key={contact.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{contact.name}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: '#475569' }}>{contact.role ?? '—'}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: 12, color: '#475569' }}>{district?.name}</div>
                          {contact.school && <div style={{ fontSize: 11, color: '#94A3B8' }}>{contact.school}</div>}
                        </td>
                        <td>
                          {contact.email ? (
                            <a href={`mailto:${contact.email}`} style={{ fontSize: 12, color: '#F97316', textDecoration: 'none' }}>
                              {contact.email}
                            </a>
                          ) : <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>}
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: '#475569' }}>{contact.phone ?? '—'}</span>
                        </td>
                        <td>
                          <button
                            onClick={() => removeDistrictContact(contact.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'parent' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            {parentContacts.length === 0 ? (
              <div className="empty-state">
                <h3>No parent contacts</h3>
                <p>Parent information is pulled from student records. Add parent info when adding students.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Parent / Guardian</th>
                    <th>Student</th>
                    <th>School</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {parentContacts.map(student => (
                    <tr key={student.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{student.parentName ?? 'Not provided'}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#475569' }}>{student.name}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#475569' }}>{student.school}</span>
                      </td>
                      <td>
                        {student.parentEmail ? (
                          <a href={`mailto:${student.parentEmail}`} style={{ fontSize: 12, color: '#F97316', textDecoration: 'none' }}>
                            {student.parentEmail}
                          </a>
                        ) : <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>}
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#475569' }}>{student.parentPhone ?? '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showAdd && <AddContactModal onClose={() => setShowAdd(false)} />}
    </>
  );
}
