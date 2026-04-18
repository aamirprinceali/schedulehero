'use client';

import { useSchedulingStore } from '@/lib/store';
import { INITIAL_DISTRICTS, SAMPLE_PROVIDERS } from '@/lib/data';
import { generateAllSlots } from '@/lib/slotGenerator';
import { Trash2, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const { providers, students, slots } = useSchedulingStore();

  const handleReset = () => {
    if (confirm('This will clear ALL providers, students, and schedule data and reset to sample data. Are you sure?')) {
      // Clear localStorage and reload
      localStorage.removeItem('hellohero-scheduling');
      window.location.reload();
    }
  };

  const handleClearStudents = () => {
    if (confirm('Remove all students? This cannot be undone.')) {
      localStorage.removeItem('hellohero-scheduling');
      // Partial reset — keep providers
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">System configuration and data management</p>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-1">System Summary</h2>
          <div className="text-sm text-gray-600 space-y-1 mt-3">
            <div className="flex justify-between"><span>Active providers</span><span className="font-medium">{providers.filter(p => p.active).length}</span></div>
            <div className="flex justify-between"><span>Total students</span><span className="font-medium">{students.length}</span></div>
            <div className="flex justify-between"><span>Total slots generated</span><span className="font-medium">{slots.length}</span></div>
            <div className="flex justify-between"><span>Filled slots</span><span className="font-medium">{slots.filter(s => s.status === 'filled').length}</span></div>
          </div>
        </div>

        <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-1">Data Management</h2>
          <p className="text-xs text-gray-500 mb-4">These actions cannot be undone. Use with care.</p>
          <div className="space-y-3">
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 rounded-lg py-2 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <RefreshCw size={15} />
              Reset All Data (back to sample)
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-1">Coming Soon</h2>
          <ul className="text-sm text-gray-400 space-y-1.5 mt-3 list-disc list-inside">
            <li>Google Calendar sync</li>
            <li>Google Sheets import (students ready to schedule)</li>
            <li>User login & access control</li>
            <li>Session attendance tracking</li>
            <li>Export schedule to PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
