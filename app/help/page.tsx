export default function HelpPage() {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Help & Scheduling Rules</h1>
      <p className="text-sm text-gray-500 mb-8">This page explains how the HelloHero scheduling system works. It updates as new rules and configurations are added.</p>

      <div className="space-y-8">

        <Section title="How Slots Work">
          <p>Slots are <strong>automatically generated</strong> — schedulers fill them, they do not create them. When you add a provider and set their weekly availability, the system builds all their time blocks for the week automatically.</p>
          <p className="mt-2">Each slot is one of four types:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600">
            <li><strong>Session</strong> — a bookable time for a student (green = open, orange = filled)</li>
            <li><strong>Buffer</strong> — protected time after each session (pink, not bookable)</li>
            <li><strong>Lunch</strong> — 30-minute provider lunch break (blue)</li>
            <li><strong>Drive</strong> — 20-minute drive between schools on split days (purple)</li>
          </ul>
        </Section>

        <Section title="Session Types & Block Sizes">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Session Type</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Session</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Buffer</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Total Block</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-4 py-2">1:1 (Individual)</td><td className="px-4 py-2">30 min</td><td className="px-4 py-2">15 min</td><td className="px-4 py-2 font-semibold">45 min</td></tr>
              <tr><td className="px-4 py-2">Wellness Circle (WC)</td><td className="px-4 py-2">45 min</td><td className="px-4 py-2">20 min</td><td className="px-4 py-2 font-semibold">65 min</td></tr>
              <tr><td className="px-4 py-2">Assessment</td><td className="px-4 py-2">60 min</td><td className="px-4 py-2">15 min</td><td className="px-4 py-2 font-semibold">75 min</td></tr>
            </tbody>
          </table>
        </Section>

        <Section title="Day Types">
          <ul className="space-y-2 text-sm text-gray-600">
            <li><strong>1:1 Only</strong> — all slots on this day are 1:1 sessions. Provider visits one school.</li>
            <li><strong>WC Only</strong> — all slots are Wellness Circle sessions. Provider visits one school.</li>
            <li><strong>Assessment Only</strong> — all slots are assessments. Provider visits one school.</li>
            <li><strong>Split Day</strong> — morning at School A (one session type), lunch + 20-min drive, afternoon at School B. Morning and afternoon can be different session types. Max 2 schools per day.</li>
            <li><strong>Off</strong> — provider does not work. No slots generated.</li>
          </ul>
        </Section>

        <Section title="Scheduling a Student">
          <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
            <li>Add the student in the <strong>Student Queue</strong> tab — fill in their name, DOB, district, school, and session type.</li>
            <li>Go to <strong>Master Schedule</strong> — select the day you want to schedule them.</li>
            <li>Click any <strong>green open slot</strong> — a window will pop up to choose which student to assign.</li>
            <li>Only students with a matching session type will appear in the dropdown.</li>
            <li>To <strong>move</strong> a student, click their current slot's X button to unassign them, then assign them to a new slot.</li>
          </ol>
        </Section>

        <Section title="Conflict Rules (Enforced Automatically)">
          <ul className="space-y-1.5 text-sm text-gray-600 list-disc list-inside">
            <li>A student's session type must match the day type of the slot (e.g., can't put a WC student in a 1:1 slot).</li>
            <li>A slot already filled cannot be assigned to a second student.</li>
            <li>Buffer, lunch, and drive slots are never bookable.</li>
            <li>A provider marked Off has no slots generated for that day.</li>
            <li>Deactivating a provider automatically unschedules all their students.</li>
          </ul>
        </Section>

        <Section title="Capacity Alerts">
          <ul className="space-y-1.5 text-sm text-gray-600 list-disc list-inside">
            <li><strong>Yellow alert</strong> — provider is at 80% capacity for the week.</li>
            <li><strong>Red alert</strong> — provider is at 100% capacity (fully booked).</li>
            <li><strong>Student alert</strong> — shown when students have been added but not yet assigned to a slot.</li>
          </ul>
          <p className="mt-2 text-sm text-gray-600">All alerts are visible on the <strong>Capacity Dashboard</strong>.</p>
        </Section>

        <Section title="Adding Providers">
          <p className="text-sm text-gray-600">Go to <strong>Providers</strong> and click Add Provider. Set their name, color, and weekly availability — which days they work, which school they visit each day, and what session type. For split days, set the morning school/type and afternoon school/type separately. Slots are generated automatically when you save.</p>
        </Section>

        <Section title="Adding Districts & Schools">
          <p className="text-sm text-gray-600">Go to <strong>Districts</strong> to add new districts or add schools to existing districts. School dropdowns throughout the app automatically update when you add schools here.</p>
        </Section>

        <Section title="Color Legend">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { color: 'bg-green-100 border-green-300', label: 'Open session slot' },
              { color: 'bg-orange-100 border-orange-300', label: 'Filled slot (student assigned)' },
              { color: 'bg-pink-100 border-pink-200', label: 'Buffer time (not bookable)' },
              { color: 'bg-blue-100 border-blue-200', label: 'Lunch break' },
              { color: 'bg-purple-100 border-purple-200', label: 'Drive time (split days)' },
              { color: 'bg-yellow-100 border-yellow-200', label: 'Assessment open slot' },
              { color: 'bg-gray-100 border-gray-200', label: 'Provider off / unavailable' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${color} shrink-0`} />
                <span className="text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[#2C3E50] mb-3 pb-2 border-b border-gray-200">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}
