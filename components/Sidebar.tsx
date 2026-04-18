'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays, Users, GraduationCap, LayoutDashboard,
  Building2, HelpCircle, Settings, Heart
} from 'lucide-react';

const navItems = [
  { label: 'Master Schedule', href: '/schedule', icon: CalendarDays },
  { label: 'Student Queue', href: '/students', icon: GraduationCap },
  { label: 'Providers', href: '/providers', icon: Users },
  { label: 'Districts', href: '/districts', icon: Building2 },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help & Rules', href: '/help', icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[#2C3E50] text-white flex flex-col shrink-0 h-full">
      {/* Logo / Brand */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Heart className="text-[#FF6B35]" size={22} fill="#FF6B35" />
          <div>
            <div className="font-bold text-base leading-tight">HelloHero</div>
            <div className="text-xs text-white/50 leading-tight">Scheduling</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#FF6B35] text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/30">
        HelloHero Scheduling v1.0
      </div>
    </aside>
  );
}
