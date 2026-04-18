'use client';

import { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Calendar, Link as LinkIcon } from 'lucide-react';
import { useSchedulingStore } from '@/lib/store';
import { Task } from '@/lib/types';

function AddTaskModal({ onClose }: { onClose: () => void }) {
  const { students, addTask } = useSchedulingStore();
  const [form, setForm] = useState({ description: '', dueDate: '', studentId: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description) return;
    addTask({
      description: form.description,
      dueDate: form.dueDate || undefined,
      studentId: form.studentId || undefined,
      isComplete: false,
      isSystemGenerated: false,
    });
    onClose();
  };

  const activeStudents = students.filter(s => s.status !== 'Cancelled' && s.status !== 'Ended');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700 }}>New Task</div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '16px 22px' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                Task description <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                className="input"
                rows={2}
                placeholder="What needs to be done?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ resize: 'vertical' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Due date (optional)</label>
              <input type="date" className="input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Link to student (optional)</label>
              <select className="input" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
                <option value="">No student linked</option>
                {activeStudents.map(s => <option key={s.id} value={s.id}>{s.name} — {s.school}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function isDueSoon(dueDate?: string): boolean {
  if (!dueDate) return false;
  const diff = new Date(dueDate).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

export default function TasksPage() {
  const { tasks, students, completeTask, removeTask } = useSchedulingStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const open = tasks.filter(t => !t.isComplete);
  const completed = tasks.filter(t => t.isComplete);

  const systemTasks = open.filter(t => t.isSystemGenerated);
  const personalTasks = open.filter(t => !t.isSystemGenerated);

  const renderTask = (task: Task) => {
    const student = task.studentId ? students.find(s => s.id === task.studentId) : null;
    const overdue = isOverdue(task.dueDate);
    const dueSoon = isDueSoon(task.dueDate);

    return (
      <div key={task.id} style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px', borderBottom: '1px solid #F1F5F9',
        background: overdue ? '#FFF7F7' : 'white',
      }}>
        <button
          onClick={() => completeTask(task.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', marginTop: 1, flexShrink: 0 }}
        >
          {task.isComplete ? <CheckCircle2 size={16} color="#10B981" /> : <Circle size={16} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: task.isComplete ? '#94A3B8' : '#0F172A', textDecoration: task.isComplete ? 'line-through' : 'none', lineHeight: 1.4 }}>
            {task.description}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            {task.isSystemGenerated && (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#FEF3C7', color: '#92400E', borderRadius: 99, padding: '1px 6px' }}>
                System
              </span>
            )}
            {student && (
              <span style={{ fontSize: 11, color: '#7C3AED', display: 'flex', alignItems: 'center', gap: 3 }}>
                <LinkIcon size={10} /> {student.name}
              </span>
            )}
            {task.dueDate && (
              <span style={{
                fontSize: 11,
                color: overdue ? '#DC2626' : dueSoon ? '#D97706' : '#94A3B8',
                display: 'flex', alignItems: 'center', gap: 3,
                fontWeight: overdue || dueSoon ? 600 : 400,
              }}>
                <Calendar size={10} />
                {overdue ? 'Overdue — ' : dueSoon ? 'Due soon — ' : 'Due '}
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => removeTask(task.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', marginTop: 1, flexShrink: 0 }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    );
  };

  return (
    <>
      <div style={{ padding: '28px 32px', maxWidth: 720, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="page-title">Tasks</h1>
              {open.length > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, background: '#1A2744', color: 'white', borderRadius: 99, padding: '2px 9px' }}>
                  {open.length}
                </span>
              )}
            </div>
            <p className="page-subtitle">Personal and system-generated to-dos.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add Task
          </button>
        </div>

        {/* System tasks */}
        {systemTasks.length > 0 && (
          <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '10px 14px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                System Alerts
              </span>
            </div>
            {systemTasks.map(renderTask)}
          </div>
        )}

        {/* Personal tasks */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Open Tasks ({personalTasks.length})
            </span>
          </div>
          {personalTasks.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              No open tasks. Add one above.
            </div>
          ) : (
            personalTasks.map(renderTask)
          )}
        </div>

        {/* Completed */}
        {completed.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              style={{
                width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: showCompleted ? '1px solid #F1F5F9' : 'none',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Completed ({completed.length})
              </span>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>{showCompleted ? '▲' : '▼'}</span>
            </button>
            {showCompleted && completed.map(renderTask)}
          </div>
        )}
      </div>

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} />}
    </>
  );
}
