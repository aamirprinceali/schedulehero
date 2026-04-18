'use client';

import { useState } from 'react';
import { useSchedulingStore } from '@/lib/store';
import { Provider, DAYS } from '@/lib/types';
import { getProviderDayCapacity } from '@/lib/slotGenerator';
import Modal from '@/components/ui/Modal';
import ProviderForm from '@/components/providers/ProviderForm';
import { Plus, Edit2, UserX, UserCheck } from 'lucide-react';

export default function ProvidersPage() {
  const { providers, slots, deactivateProvider, updateProvider } = useSchedulingStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);

  const active = providers.filter(p => p.active);
  const inactive = providers.filter(p => !p.active);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{active.length} active provider{active.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e55a24] transition-colors"
        >
          <Plus size={16} />
          Add Provider
        </button>
      </div>

      {/* Active Providers */}
      <div className="grid gap-4">
        {active.map(provider => {
          const weekTotal = DAYS.reduce((sum, day) => sum + getProviderDayCapacity(slots, provider.id, day).total, 0);
          const weekFilled = DAYS.reduce((sum, day) => sum + getProviderDayCapacity(slots, provider.id, day).filled, 0);
          const pct = weekTotal > 0 ? Math.round((weekFilled / weekTotal) * 100) : 0;

          return (
            <div key={provider.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Color dot */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: provider.color }}>
                    {provider.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{provider.name}</div>
                    {provider.role && <div className="text-xs text-gray-500">{provider.role}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditing(provider); setShowForm(true); }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    title="Edit provider"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => { if (confirm(`Deactivate ${provider.name}? Their students will be unscheduled.`)) deactivateProvider(provider.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Deactivate provider"
                  >
                    <UserX size={15} />
                  </button>
                </div>
              </div>

              {/* Weekly schedule summary */}
              <div className="mt-3 flex gap-1.5 flex-wrap">
                {DAYS.map(day => {
                  const ds = provider.schedule[day];
                  const cap = getProviderDayCapacity(slots, provider.id, day);
                  if (ds.isOff) {
                    return (
                      <div key={day} className="flex flex-col items-center bg-gray-100 rounded-lg px-2 py-1.5 min-w-[52px]">
                        <span className="text-xs text-gray-400 font-medium">{day.slice(0, 3)}</span>
                        <span className="text-xs text-gray-400 mt-0.5">Off</span>
                      </div>
                    );
                  }
                  // Build a short school label — show both if split schools
                  const morningSchool = ds.morning?.school?.split(' ')[0] ?? '';
                  const afternoonSchool = ds.afternoon?.school?.split(' ')[0] ?? '';
                  const schoolLabel = ds.afternoon && ds.afternoon.school !== ds.morning?.school
                    ? `${morningSchool} / ${afternoonSchool}`
                    : morningSchool;
                  const alertColor = cap.pctFull >= 100 ? 'bg-red-50 border border-red-200' : cap.pctFull >= 80 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200';
                  return (
                    <div key={day} className={`flex flex-col items-center rounded-lg px-2 py-1.5 min-w-[64px] ${alertColor}`}>
                      <span className="text-xs font-medium text-gray-700">{day.slice(0, 3)}</span>
                      <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[60px]" title={schoolLabel}>{schoolLabel}</span>
                      <span className="text-xs font-semibold text-gray-700">{cap.filled}/{cap.total}</span>
                    </div>
                  );
                })}
              </div>

              {/* Week total */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-[#4ECDC4]'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 shrink-0">{weekFilled}/{weekTotal} this week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inactive providers */}
      {inactive.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Inactive Providers</h2>
          <div className="space-y-2">
            {inactive.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 opacity-60">
                <span className="text-sm text-gray-600">{p.name}</span>
                <button
                  onClick={() => updateProvider(p.id, { active: true })}
                  className="flex items-center gap-1 text-xs text-[#4ECDC4] hover:text-[#3ab8b0] font-medium"
                >
                  <UserCheck size={13} /> Reactivate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.length === 0 && inactive.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No providers yet</p>
          <p className="text-sm mt-1">Add your first provider to start building the schedule</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <Modal title={editing ? 'Edit Provider' : 'Add Provider'} onClose={() => { setShowForm(false); setEditing(null); }} wide>
          <ProviderForm existing={editing ?? undefined} onClose={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}
