'use client';

import Link from 'next/link';
import { AlertTriangle, Clock, Users, CheckSquare, ChevronRight, Zap } from 'lucide-react';
import { useSchedulingStore } from '@/lib/store';
import { isStale } from '@/lib/dateUtils';
import { getProviderWeekCapacity } from '@/lib/slotGenerator';

export default function DashboardPage() {
  const { students, providers, slots, wellnessCircles, tasks, districts } = useSchedulingStore();

  const queueStudents = students.filter(s => s.status === 'Needs Scheduling');
  const scheduled = students.filter(s => s.status === 'Scheduled');
  const cancelled = students.filter(s => s.status === 'Cancelled' || s.status === 'Ended');
  const staleStudents = queueStudents.filter(s => isStale(s.queuedAt));
  const inBoth = scheduled.filter(s => s.individual && s.wellnessCircle);
  const openTasks = tasks.filter(t => !t.isComplete);
  const activeWCs = wellnessCircles.filter(wc => wc.isActive);
  const activeProviders = providers.filter(p => p.active);

  const totalWCSeats = activeWCs.reduce((sum) => sum + 10, 0);
  const usedWCSeats = activeWCs.reduce((sum, wc) => sum + wc.studentIds.length, 0);

  const districtStats = districts.map(d => {
    const distStudents = scheduled.filter(s => s.districtId === d.id);
    const individual = distStudents.filter(s => s.individual && !s.wellnessCircle).length;
    const wc = distStudents.filter(s => s.wellnessCircle && !s.individual).length;
    const both = distStudents.filter(s => s.individual && s.wellnessCircle).length;
    return { district: d, total: distStudents.length, individual, wc, both };
  }).filter(d => d.total > 0);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of scheduling activity and alerts.</p>
      </div>

      {/* Urgent alerts */}
      {staleStudents.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Link href="/queue" style={{ textDecoration: 'none' }}>
            <div className="alert alert-red" style={{ cursor: 'pointer' }}>
              <AlertTriangle size={15} />
              <div style={{ flex: 1 }}>
                <strong>{staleStudents.length} student{staleStudents.length !== 1 ? 's' : ''} stale in queue</strong>
                <span style={{ marginLeft: 6, fontWeight: 400 }}>
                  — {staleStudents.map(s => s.name).join(', ')} — over 5 days waiting.
                </span>
              </div>
              <ChevronRight size={14} />
            </div>
          </Link>
        </div>
      )}

      {/* Top stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <Link href="/queue" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={15} color="#F97316" />
              </div>
              {staleStudents.length > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#EF4444', color: 'white', borderRadius: 99, padding: '1px 7px' }}>
                  {staleStudents.length} stale
                </span>
              )}
            </div>
            <div className="stat-value">{queueStudents.length}</div>
            <div className="stat-label">In Queue</div>
          </div>
        </Link>

        <Link href="/scheduled" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Zap size={15} color="#10B981" />
            </div>
            <div className="stat-value">{scheduled.length}</div>
            <div className="stat-label">Scheduled</div>
          </div>
        </Link>

        <Link href="/circles" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Users size={15} color="#7C3AED" />
            </div>
            <div className="stat-value">{usedWCSeats}/{totalWCSeats}</div>
            <div className="stat-label">WC Seats Used</div>
          </div>
        </Link>

        <Link href="/tasks" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <CheckSquare size={15} color="#3B82F6" />
            </div>
            <div className="stat-value">{openTasks.length}</div>
            <div className="stat-label">Open Tasks</div>
          </div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Provider Capacity */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
            Provider Capacity
          </div>
          {activeProviders.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No active providers.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeProviders.map(provider => {
                const cap = getProviderWeekCapacity(slots, provider.id);
                const openHours = Math.floor(cap.openMinutes / 60);
                const openMins = cap.openMinutes % 60;
                return (
                  <div key={provider.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: provider.color }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{provider.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>
                          {openHours > 0 ? `${openHours}h ` : ''}{openMins > 0 ? `${openMins}m ` : ''}open
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cap.pctFull >= 80 ? '#DC2626' : cap.pctFull >= 70 ? '#D97706' : '#059669' }}>
                          {cap.pctFull}%
                        </span>
                      </div>
                    </div>
                    <div className="cap-bar">
                      <div
                        className={`cap-fill ${cap.pctFull >= 80 ? 'cap-red' : cap.pctFull >= 70 ? 'cap-amber' : 'cap-green'}`}
                        style={{ width: `${cap.pctFull}%` }}
                      />
                    </div>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>
                      {cap.filled} filled · {cap.remaining} open · {cap.total} total slots
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* District breakdown */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
            Students by District
          </div>
          {districtStats.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No scheduled students yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {districtStats.map(({ district, total, individual, wc, both }) => (
                <div key={district.id} style={{ padding: '10px 12px', background: '#F8F9FC', borderRadius: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{district.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{total} students</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {individual > 0 && <span className="badge badge-green">{individual} 1:1</span>}
                    {wc > 0 && <span className="badge badge-purple">{wc} WC only</span>}
                    {both > 0 && <span className="badge badge-blue">{both} both</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wellness Circles */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
              Wellness Circles
            </div>
            <Link href="/circles" style={{ fontSize: 12, color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {activeWCs.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No active circles.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeWCs.map(wc => {
                const provider = providers.find(p => p.id === wc.providerId);
                const pct = Math.round((wc.studentIds.length / 10) * 100);
                return (
                  <div key={wc.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#0F172A' }}>{wc.label ?? `${wc.day} Group`}</span>
                        <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 6 }}>· {provider?.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{wc.studentIds.length}/10</span>
                    </div>
                    <div className="cap-bar" style={{ height: 4 }}>
                      <div className={`cap-fill ${pct >= 80 ? 'cap-red' : pct >= 70 ? 'cap-amber' : 'cap-green'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick numbers */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
            Quick Numbers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'Total students in system', value: students.length },
              { label: 'Dual enrolled (1:1 + WC)', value: inBoth.length },
              { label: 'Cancelled / Ended', value: cancelled.length },
              { label: 'Active providers', value: activeProviders.length },
              { label: 'Active Wellness Circles', value: activeWCs.length },
              { label: 'WC seats still available', value: totalWCSeats - usedWCSeats },
            ].map(stat => (
              <div key={stat.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid #F1F5F9',
              }}>
                <span style={{ fontSize: 12, color: '#475569' }}>{stat.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: '#0F172A' }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
