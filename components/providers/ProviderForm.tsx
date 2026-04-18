'use client';

import { useState } from 'react';
import { Provider, DayOfWeek, SessionType, DAYS, DaySchedule, LUNCH_EARLIEST, LUNCH_LATEST } from '@/lib/types';
import { useSchedulingStore } from '@/lib/store';
import { PROVIDER_COLORS } from '@/lib/data';
import { minutesToTime } from '@/lib/slotGenerator';

const SESSION_TYPES: SessionType[] = ['1:1', 'WC', 'Assessment'];

// Default empty day schedule
const OFF_DAY: DaySchedule = { isOff: true };
const defaultSchedule = (): Provider['schedule'] => ({
  Monday: { isOff: true },
  Tuesday: { isOff: true },
  Wednesday: { isOff: true },
  Thursday: { isOff: true },
  Friday: { isOff: true },
});

interface Props {
  existing?: Provider;
  onClose: () => void;
}

// School input that shows suggestions from districts but allows free-typing
function SchoolInput({ value, onChange, allSchools, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  allSchools: string[];
  placeholder?: string;
}) {
  const listId = `school-list-${Math.random().toString(36).slice(2)}`;
  return (
    <>
      <input
        list={listId}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Type or select school'}
      />
      <datalist id={listId}>
        {allSchools.map(s => <option key={s} value={s} />)}
      </datalist>
    </>
  );
}

export default function ProviderForm({ existing, onClose }: Props) {
  const { districts, addProvider, updateProvider } = useSchedulingStore();

  // Flat list of all schools across all districts (for datalist suggestions)
  const allSchools = districts.flatMap(d => d.schools);

  const [name, setName] = useState(existing?.name ?? '');
  const [role, setRole] = useState(existing?.role ?? '');
  const [color, setColor] = useState(existing?.color ?? PROVIDER_COLORS[0]);
  const [schedule, setSchedule] = useState<Provider['schedule']>(
    existing?.schedule ?? defaultSchedule()
  );

  // Toggle a day on/off
  const toggleOff = (day: DayOfWeek) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].isOff
        ? { isOff: false, morning: { school: '', sessionType: '1:1' } }
        : OFF_DAY,
    }));
  };

  // Update a field on a day
  const updateDay = (day: DayOfWeek, field: keyof DaySchedule, value: unknown) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // Update morning or afternoon period field
  const updatePeriod = (day: DayOfWeek, period: 'morning' | 'afternoon', field: 'school' | 'sessionType', value: string) => {
    setSchedule(prev => {
      const existing = prev[day][period] ?? { school: '', sessionType: '1:1' as SessionType };
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [period]: { ...existing, [field]: value },
        },
      };
    });
  };

  // Add afternoon period (defaults to same as morning)
  const addAfternoon = (day: DayOfWeek) => {
    const morning = schedule[day].morning;
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        afternoon: { school: morning?.school ?? '', sessionType: morning?.sessionType ?? '1:1' },
      },
    }));
  };

  // Remove afternoon period
  const removeAfternoon = (day: DayOfWeek) => {
    setSchedule(prev => {
      const { afternoon: _, ...rest } = prev[day];
      return { ...prev, [day]: rest };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const providerData = { name: name.trim(), role, color, active: true, schedule };

    if (existing) {
      updateProvider(existing.id, providerData);
    } else {
      addProvider(providerData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Role */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name *</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Clinical Provider"
          />
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {PROVIDER_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Weekly schedule */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Schedule</label>
        <p className="text-xs text-gray-400 mb-3">
          Each working day has a morning block (8 AM–lunch) and optional afternoon block (lunch–4 PM).
          You can mix session types and schools in the same day.
        </p>
        <div className="space-y-3">
          {DAYS.map(day => {
            const ds = schedule[day];
            const isOff = ds.isOff;
            const lunchAt = ds.lunchStartMinutes ?? LUNCH_EARLIEST;

            return (
              <div key={day} className={`border rounded-lg p-3 transition-colors ${isOff ? 'border-gray-200 bg-gray-50' : 'border-[#4ECDC4]/40 bg-white'}`}>
                {/* Day header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 w-24">{day}</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-xs text-gray-500">{isOff ? 'Off' : 'Working'}</span>
                    <div
                      onClick={() => toggleOff(day)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${isOff ? 'bg-gray-300' : 'bg-[#4ECDC4]'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isOff ? 'translate-x-0.5' : 'translate-x-4'}`} />
                    </div>
                  </label>
                </div>

                {!isOff && (
                  <div className="space-y-2 mt-1">
                    {/* Morning block */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500 font-medium block mb-1">Morning School</span>
                        <SchoolInput
                          value={ds.morning?.school ?? ''}
                          onChange={v => updatePeriod(day, 'morning', 'school', v)}
                          allSchools={allSchools}
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 font-medium block mb-1">Morning Sessions</span>
                        <select
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]"
                          value={ds.morning?.sessionType ?? '1:1'}
                          onChange={e => updatePeriod(day, 'morning', 'sessionType', e.target.value)}
                        >
                          {SESSION_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Lunch time control */}
                    <div className="flex items-center gap-2 py-1 px-2 bg-blue-50 rounded border border-blue-100">
                      <span className="text-xs text-blue-600 font-medium">Lunch</span>
                      <button
                        type="button"
                        onClick={() => updateDay(day, 'lunchStartMinutes', Math.max(LUNCH_EARLIEST, lunchAt - 15))}
                        className="text-xs text-blue-500 hover:text-blue-700 px-1 font-bold"
                      >−</button>
                      <span className="text-xs text-blue-700 font-semibold w-20 text-center">{minutesToTime(lunchAt)}</span>
                      <button
                        type="button"
                        onClick={() => updateDay(day, 'lunchStartMinutes', Math.min(LUNCH_LATEST, lunchAt + 15))}
                        className="text-xs text-blue-500 hover:text-blue-700 px-1 font-bold"
                      >+</button>
                      <span className="text-xs text-blue-400 ml-auto">(30 min)</span>
                    </div>

                    {/* Afternoon block */}
                    {ds.afternoon ? (
                      <div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-xs text-gray-500 font-medium block mb-1">Afternoon School</span>
                            <SchoolInput
                              value={ds.afternoon.school}
                              onChange={v => updatePeriod(day, 'afternoon', 'school', v)}
                              allSchools={allSchools}
                            />
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 font-medium block mb-1">Afternoon Sessions</span>
                            <select
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]"
                              value={ds.afternoon.sessionType}
                              onChange={e => updatePeriod(day, 'afternoon', 'sessionType', e.target.value)}
                            >
                              {SESSION_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAfternoon(day)}
                          className="mt-1.5 text-xs text-red-400 hover:text-red-600"
                        >
                          Remove afternoon block
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addAfternoon(day)}
                        className="text-xs text-[#4ECDC4] hover:text-[#3ab8b0] font-medium"
                      >
                        + Add afternoon block (different school or session type)
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-[#FF6B35] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#e55a24] transition-colors"
        >
          {existing ? 'Save Changes' : 'Add Provider'}
        </button>
      </div>
    </form>
  );
}
