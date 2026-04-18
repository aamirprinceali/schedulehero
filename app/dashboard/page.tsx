'use client';

import { useSchedulingStore } from '@/lib/store';
import { DAYS, SessionType } from '@/lib/types';
import { getProviderDayCapacity } from '@/lib/slotGenerator';
import { AlertTriangle, CheckCircle, Users, GraduationCap, Clock, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { providers, students, slots, districts } = useSchedulingStore();
  const activeProviders = providers.filter(p => p.active);

  // Overall session counts
  const sessionSlots = slots.filter(s => s.type === 'session');
  const totalSlots = sessionSlots.length;
  const filledSlots = sessionSlots.filter(s => s.status === 'filled').length;
  const openSlots = totalSlots - filledSlots;

  // By session type
  const byType = (['1:1', 'WC', 'Assessment'] as SessionType[]).map(type => {
    const typeSlots = sessionSlots.filter(s => s.sessionType === type);
    const total = typeSlots.length;
    const filled = typeSlots.filter(s => s.status === 'filled').length;
    return { type, total, filled, open: total - filled };
  });

  // Students needing scheduling
  const needsScheduling = students.filter(s => s.status === 'Needs Scheduling');

  // Provider capacity alerts
  const providerAlerts = activeProviders.map(p => {
    const weekTotal = DAYS.reduce((sum, d) => sum + getProviderDayCapacity(slots, p.id, d).total, 0);
    const weekFilled = DAYS.reduce((sum, d) => sum + getProviderDayCapacity(slots, p.id, d).filled, 0);
    const pct = weekTotal > 0 ? Math.round((weekFilled / weekTotal) * 100) : 0;
    return { provider: p, weekTotal, weekFilled, pct };
  }).filter(x => x.pct >= 80);

  // Per-district breakdown
  const districtStats = districts.map(d => {
    const districtStudents = students.filter(s => s.districtId === d.id);
    const scheduled = districtStudents.filter(s => s.status === 'Scheduled').length;
    const needs = districtStudents.filter(s => s.status === 'Needs Scheduling').length;
    const bySchool = d.schools.map(school => ({
      school,
      total: districtStudents.filter(s => s.school === school).length,
      scheduled: districtStudents.filter(s => s.school === school && s.status === 'Scheduled').length,
    }));
    return { district: d, total: districtStudents.length, scheduled, needs, bySchool };
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Capacity Dashboard</h1>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} className="text-[#4ECDC4]" />} label="Active Providers" value={activeProviders.length} />
        <StatCard icon={<GraduationCap size={20} className="text-[#FF6B35]" />} label="Total Students" value={students.length} />
        <StatCard icon={<CheckCircle size={20} className="text-green-500" />} label="Slots Filled" value={filledSlots} sub={`of ${totalSlots} total`} />
        <StatCard icon={<Clock size={20} className="text-blue-500" />} label="Open Slots" value={openSlots} />
      </div>

      {/* Alerts */}
      {(needsScheduling.length > 0 || providerAlerts.length > 0) && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Alerts</h2>
          {needsScheduling.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-amber-500 shrink-0" />
              <span className="text-sm text-amber-800">
                <strong>{needsScheduling.length} student{needsScheduling.length !== 1 ? 's' : ''}</strong> need{needsScheduling.length === 1 ? 's' : ''} to be scheduled
              </span>
            </div>
          )}
          {providerAlerts.map(({ provider, weekFilled, weekTotal, pct }) => (
            <div key={provider.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${pct >= 100 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <AlertTriangle size={16} className={pct >= 100 ? 'text-red-500' : 'text-yellow-500'} />
              <span className={`text-sm ${pct >= 100 ? 'text-red-800' : 'text-yellow-800'}`}>
                <strong>{provider.name}</strong> is at <strong>{pct}% capacity</strong> ({weekFilled}/{weekTotal} slots filled)
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Session type breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sessions by Type</h2>
        <div className="grid grid-cols-3 gap-4">
          {byType.map(({ type, total, filled, open }) => {
            const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
            const label = type === '1:1' ? '1:1 Individual' : type === 'WC' ? 'Wellness Circle' : 'Assessment';
            const color = type === '1:1' ? '#4ECDC4' : type === 'WC' ? '#6C5CE7' : '#FDCB6E';
            return (
              <div key={type} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                  <span className="text-xs text-gray-400">{pct}% full</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{filled}<span className="text-sm font-normal text-gray-400">/{total}</span></div>
                <div className="bg-gray-100 rounded-full h-1.5 mb-2">
                  <div className="h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                </div>
                <div className="text-xs text-gray-400">{open} open slot{open !== 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provider capacity */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Provider Capacity (This Week)</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Provider</th>
                {DAYS.map(d => <th key={d} className="text-center px-2 py-3 font-semibold text-gray-600">{d.slice(0, 3)}</th>)}
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Week Total</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">% Full</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeProviders.map(provider => {
                const dayCaps = DAYS.map(d => getProviderDayCapacity(slots, provider.id, d));
                const weekTotal = dayCaps.reduce((s, c) => s + c.total, 0);
                const weekFilled = dayCaps.reduce((s, c) => s + c.filled, 0);
                const pct = weekTotal > 0 ? Math.round((weekFilled / weekTotal) * 100) : 0;
                return (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: provider.color }} />
                        <span className="font-medium text-gray-900">{provider.name}</span>
                      </div>
                    </td>
                    {dayCaps.map((cap, i) => (
                      <td key={DAYS[i]} className="text-center px-2 py-3">
                        {cap.total === 0
                          ? <span className="text-gray-300 text-xs">—</span>
                          : <span className={`text-xs font-medium ${cap.pctFull >= 100 ? 'text-red-600' : cap.pctFull >= 80 ? 'text-yellow-600' : 'text-gray-700'}`}>
                              {cap.filled}/{cap.total}
                            </span>
                        }
                      </td>
                    ))}
                    <td className="text-center px-4 py-3 font-semibold text-gray-900">{weekFilled}/{weekTotal}</td>
                    <td className="text-center px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${pct >= 100 ? 'bg-red-100 text-red-700' : pct >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* District breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Students by District</h2>
        <div className="space-y-4">
          {districtStats.map(({ district, total, scheduled, needs, bySchool }) => (
            <div key={district.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{district.name}</h3>
                <div className="flex gap-3 text-sm">
                  <span className="text-green-600 font-medium">{scheduled} scheduled</span>
                  {needs > 0 && <span className="text-amber-600 font-medium">{needs} pending</span>}
                  <span className="text-gray-400">{total} total</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {bySchool.filter(s => s.total > 0).map(({ school, total, scheduled }) => (
                  <div key={school} className="bg-gray-50 rounded-lg px-3 py-2 text-xs">
                    <div className="font-medium text-gray-700 truncate">{school}</div>
                    <div className="text-gray-500 mt-0.5">{scheduled}/{total} scheduled</div>
                  </div>
                ))}
                {bySchool.every(s => s.total === 0) && (
                  <div className="col-span-4 text-xs text-gray-400 py-2">No students in this district yet</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
      </div>
    </div>
  );
}
