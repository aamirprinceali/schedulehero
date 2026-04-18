'use client';

import { useState } from 'react';
import { RefreshCw, Database, BookOpen, AlertTriangle } from 'lucide-react';
import { useSchedulingStore } from '@/lib/store';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function SettingsPage() {
  const { providers, students, slots, wellnessCircles, tasks, resetToSampleData } = useSchedulingStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    localStorage.removeItem('schedulehero-v1');
    resetToSampleData();
    setShowResetConfirm(false);
  };

  return (
    <>
      <div style={{ padding: '28px 32px', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Data management and system information.</p>
        </div>

        {/* System summary */}
        <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Database size={15} color="#1A2744" />
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
              System Summary
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'Active providers', value: providers.filter(p => p.active).length },
              { label: 'Total students', value: students.length },
              { label: 'Scheduled students', value: students.filter(s => s.status === 'Scheduled').length },
              { label: 'Students in queue', value: students.filter(s => s.status === 'Needs Scheduling').length },
              { label: 'Cancelled / Ended students', value: students.filter(s => s.status === 'Cancelled' || s.status === 'Ended').length },
              { label: 'Total time slots generated', value: slots.length },
              { label: 'Filled slots', value: slots.filter(s => s.status === 'filled').length },
              { label: 'Active Wellness Circles', value: wellnessCircles.filter(wc => wc.isActive).length },
              { label: 'Open tasks', value: tasks.filter(t => !t.isComplete).length },
            ].map(stat => (
              <div key={stat.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid #F1F5F9',
              }}>
                <span style={{ fontSize: 13, color: '#475569' }}>{stat.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: '#0F172A' }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User guide */}
        <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <BookOpen size={15} color="#7C3AED" />
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
              User Guide
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 12 }}>
            A full walkthrough guide (GUIDE.md) is included in the project folder. It covers every feature in plain language and is safe to share with your team.
          </p>
          <div style={{ background: '#F8F9FC', borderRadius: 8, padding: '10px 12px', fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#64748B' }}>
            ~/Desktop/dev/hellohero-scheduling/GUIDE.md
          </div>
        </div>

        {/* Roadmap */}
        <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
            Coming in Future Phases
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Email generation — templates for families and schools',
              'Supabase / cloud database (shared across team)',
              'Google Calendar sync',
              'Session attendance tracking',
              'PDF schedule export',
              'User login and access control',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#CBD5E1', flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Data management */}
        <div className="card" style={{ padding: '18px 20px', border: '1px solid #FECACA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={15} color="#DC2626" />
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#DC2626' }}>
              Data Management
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 14 }}>
            This will delete all current data and restore the built-in sample dataset. Use this to reset to a clean demo state.
          </p>
          <button
            className="btn btn-danger"
            onClick={() => setShowResetConfirm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={13} /> Reset to Sample Data
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#94A3B8' }}>
          ScheduleHero v1.0 · HelloHero · Data stored locally in your browser
        </div>
      </div>

      {showResetConfirm && (
        <ConfirmModal
          title="Reset All Data"
          message="This will permanently delete all providers, students, and schedule data, and restore the built-in sample dataset. This cannot be undone."
          confirmLabel="Reset to Sample Data"
          variant="danger"
          onCancel={() => setShowResetConfirm(false)}
          onConfirm={handleReset}
        />
      )}
    </>
  );
}
