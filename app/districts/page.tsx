'use client';

import { useState } from 'react';
import { useSchedulingStore } from '@/lib/store';
import { Plus, School } from 'lucide-react';

export default function DistrictsPage() {
  const { districts, addDistrict, addSchoolToDistrict } = useSchedulingStore();
  const [newDistrict, setNewDistrict] = useState('');
  const [newSchool, setNewSchool] = useState<Record<string, string>>({});

  const handleAddDistrict = () => {
    if (!newDistrict.trim()) return;
    addDistrict(newDistrict.trim());
    setNewDistrict('');
  };

  const handleAddSchool = (districtId: string) => {
    const name = newSchool[districtId]?.trim();
    if (!name) return;
    addSchoolToDistrict(districtId, name);
    setNewSchool(prev => ({ ...prev, [districtId]: '' }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Districts & Schools</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage districts and the schools within them</p>
        </div>
      </div>

      {/* Add district */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Add New District</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            placeholder="District name"
            value={newDistrict}
            onChange={e => setNewDistrict(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddDistrict()}
          />
          <button
            onClick={handleAddDistrict}
            className="flex items-center gap-1.5 bg-[#FF6B35] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e55a24] transition-colors"
          >
            <Plus size={15} /> Add District
          </button>
        </div>
      </div>

      {/* Districts list */}
      <div className="space-y-4">
        {districts.map(district => (
          <div key={district.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <School size={16} className="text-[#4ECDC4]" />
              <h2 className="font-semibold text-gray-900">{district.name}</h2>
              <span className="text-xs text-gray-400 ml-auto">{district.schools.length} school{district.schools.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Schools */}
            <div className="flex flex-wrap gap-2 mb-3">
              {district.schools.map(school => (
                <span key={school} className="inline-flex items-center bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1 font-medium">
                  {school}
                </span>
              ))}
              {district.schools.length === 0 && (
                <span className="text-xs text-gray-400">No schools added yet</span>
              )}
            </div>

            {/* Add school */}
            <div className="flex gap-2 mt-2">
              <input
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] bg-gray-50"
                placeholder="Add a school..."
                value={newSchool[district.id] ?? ''}
                onChange={e => setNewSchool(prev => ({ ...prev, [district.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAddSchool(district.id)}
              />
              <button
                onClick={() => handleAddSchool(district.id)}
                className="flex items-center gap-1 text-[#4ECDC4] hover:text-[#3ab8b0] text-sm font-medium px-2"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
