'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { useSchedulingStore } from '@/lib/store';
import { countSessionsInMonth } from '@/lib/dateUtils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function ReportsPage() {
  const { students, providers, districts, wellnessCircles } = useSchedulingStore();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const scheduled = students.filter(s => s.status === 'Scheduled' && s.individual);
  const cancelled = students.filter(s => s.status === 'Cancelled' || s.status === 'Ended');
  const activeWCs = wellnessCircles.filter(wc => wc.isActive);

  // Session counts per student for selected month
  const studentSessions = scheduled.map(s => {
    const count = countSessionsInMonth(
      s.individual!.startDate,
      s.individual!.day,
      selectedMonth,
      selectedYear
    );
    return { student: s, sessions: count };
  }).filter(s => s.sessions > 0);

  const totalSessions = studentSessions.reduce((sum, s) => sum + s.sessions, 0);

  // By district
  const byDistrict = districts.map(d => {
    const distSessions = studentSessions.filter(s => s.student.districtId === d.id);
    const sessions = distSessions.reduce((sum, s) => sum + s.sessions, 0);
    const individual = distSessions.filter(s => s.student.individual && !s.student.wellnessCircle).length;
    const both = distSessions.filter(s => s.student.individual && s.student.wellnessCircle).length;
    return { district: d, sessions, studentCount: distSessions.length, individual, both };
  }).filter(d => d.sessions > 0);

  // By provider
  const byProvider = providers.filter(p => p.active).map(p => {
    const provSessions = studentSessions.filter(s => s.student.individual?.providerId === p.id);
    const sessions = provSessions.reduce((sum, s) => sum + s.sessions, 0);
    return { provider: p, sessions, studentCount: provSessions.length };
  }).filter(p => p.sessions > 0);

  // Cancellation breakdown (all time)
  const cancelReasons: Record<string, number> = {};
  cancelled.forEach(s => {
    const reason = s.cancellationReason ?? 'Unknown';
    cancelReasons[reason] = (cancelReasons[reason] ?? 0) + 1;
  });

  // WC utilization
  const wcStats = activeWCs.map(wc => {
    const provider = providers.find(p => p.id === wc.providerId);
    return {
      wc,
      provider,
      enrolled: wc.studentIds.length,
      pct: Math.round((wc.studentIds.length / 10) * 100),
    };
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Reports</h1>
          <p className="page-subtitle">Session counts, utilization, and cancellation analytics.</p>
        </div>
        {/* Month selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="input" style={{ width: 140 }} value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select className="input" style={{ width: 90 }} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <div className="stat-card">
          <div style={{ width: 30, height: 30, borderRadius: 7, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Calendar size={14} color="#3B82F6" />
          </div>
          <div className="stat-value">{totalSessions}</div>
          <div className="stat-label">Est. Sessions in {MONTHS[selectedMonth]}</div>
        </div>
        <div className="stat-card">
          <div style={{ width: 30, height: 30, borderRadius: 7, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Users size={14} color="#10B981" />
          </div>
          <div className="stat-value">{studentSessions.length}</div>
          <div className="stat-label">Active Students This Month</div>
        </div>
        <div className="stat-card">
          <div style={{ width: 30, height: 30, borderRadius: 7, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <BarChart3 size={14} color="#7C3AED" />
          </div>
          <div className="stat-value">{activeWCs.reduce((sum, wc) => sum + wc.studentIds.length, 0)}</div>
          <div className="stat-label">WC Students Enrolled</div>
        </div>
        <div className="stat-card">
          <div style={{ width: 30, height: 30, borderRadius: 7, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <TrendingUp size={14} color="#EF4444" />
          </div>
          <div className="stat-value">{cancelled.length}</div>
          <div className="stat-label">Total Cancellations</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* By district */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
            Sessions by District — {MONTHS[selectedMonth]} {selectedYear}
          </div>
          {byDistrict.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No sessions found for this month.</div>
          ) : (
            <table className="data-table" style={{ marginTop: -4 }}>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Students</th>
                  <th>Est. Sessions</th>
                </tr>
              </thead>
              <tbody>
                {byDistrict.map(({ district, sessions, studentCount }) => (
                  <tr key={district.id}>
                    <td style={{ fontWeight: 500 }}>{district.name}</td>
                    <td>{studentCount}</td>
                    <td>
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 700, color: '#0F172A' }}>
                        {sessions}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#F8F9FC' }}>
                  <td style={{ fontWeight: 700 }}>Total</td>
                  <td style={{ fontWeight: 700 }}>{studentSessions.length}</td>
                  <td style={{ fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>{totalSessions}</td>
                </tr>
              </tbody>
            </table>
          )}
          <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8' }}>
            * Estimated based on weekly sessions from start date through end of month.
          </div>
        </div>

        {/* By provider */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
            Sessions by Provider — {MONTHS[selectedMonth]} {selectedYear}
          </div>
          {byProvider.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No sessions found for this month.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byProvider.map(({ provider, sessions, studentCount }) => {
                const maxSessions = Math.max(...byProvider.map(p => p.sessions));
                const pct = maxSessions > 0 ? Math.round((sessions / maxSessions) * 100) : 0;
                return (
                  <div key={provider.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: provider.color }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{provider.name}</span>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>{studentCount} students</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: '#0F172A' }}>
                        {sessions}
                      </span>
                    </div>
                    <div className="cap-bar">
                      <div className="cap-fill cap-green" style={{ width: `${pct}%`, background: provider.color + '99' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Cancellation reasons */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
            Cancellation Reasons (All Time)
          </div>
          {Object.keys(cancelReasons).length === 0 ? (
            <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No cancellations yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(cancelReasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                <div key={reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 12, color: '#475569' }}>{reason}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: '#EF4444' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WC utilization */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
            Wellness Circle Utilization
          </div>
          {wcStats.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No active Wellness Circles.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {wcStats.map(({ wc, provider, enrolled, pct }) => (
                <div key={wc.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#0F172A' }}>{wc.label ?? `${wc.day} Group`}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 6 }}>· {provider?.name}</span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: pct >= 80 ? '#DC2626' : pct >= 70 ? '#D97706' : '#059669',
                    }}>
                      {enrolled}/10
                    </span>
                  </div>
                  <div className="cap-bar">
                    <div className={`cap-fill ${pct >= 80 ? 'cap-red' : pct >= 70 ? 'cap-amber' : 'cap-green'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
