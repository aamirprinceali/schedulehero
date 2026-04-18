'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSchedulingStore } from '@/lib/store';
import { isStale } from '@/lib/dateUtils';
import {
  LayoutDashboard, Clock, CalendarDays, Users, CircleDot,
  XCircle, UserCog, Building2, CheckSquare, BookOpen,
  BarChart3, Settings, Zap,
} from 'lucide-react';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/queue', icon: Clock, label: 'Queue', showStale: true },
  { href: '/schedule', icon: CalendarDays, label: 'Schedule' },
  { href: '/scheduled', icon: Users, label: 'Scheduled' },
  { href: '/circles', icon: CircleDot, label: 'Wellness Circles' },
  { href: '/cancelled', icon: XCircle, label: 'Cancelled' },
];

const MANAGE_NAV = [
  { href: '/providers', icon: UserCog, label: 'Providers' },
  { href: '/districts', icon: Building2, label: 'Districts' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks', showTasks: true },
  { href: '/contacts', icon: BookOpen, label: 'Contacts' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { students, tasks } = useSchedulingStore();

  const staleCount = students.filter(s => s.status === 'Needs Scheduling' && isStale(s.queuedAt)).length;
  const queueCount = students.filter(s => s.status === 'Needs Scheduling').length;
  const openTaskCount = tasks.filter(t => !t.isComplete).length;

  return (
    <aside style={{ background: '#1A2744', width: 220, minHeight: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

      {/* Logo */}
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #F97316, #fb923c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={15} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700, color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              ScheduleHero
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1, letterSpacing: '0.03em' }}>
              HelloHero
            </div>
          </div>
        </div>
      </div>

      {/* Queue alert pill */}
      {queueCount > 0 && (
        <div style={{ padding: '10px 12px 0' }}>
          <div style={{
            background: staleCount > 0 ? 'rgba(239,68,68,0.14)' : 'rgba(249,115,22,0.10)',
            border: `1px solid ${staleCount > 0 ? 'rgba(239,68,68,0.22)' : 'rgba(249,115,22,0.18)'}`,
            borderRadius: 8, padding: '6px 10px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{queueCount} in queue</span>
            {staleCount > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#EF4444', color: 'white', borderRadius: 99, padding: '1px 6px' }}>
                {staleCount} stale
              </span>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: 10, overflowY: 'auto' }}>
        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Scheduling</div>
        {NAV.map(({ href, icon: Icon, label, showStale }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={14} strokeWidth={isActive ? 2.2 : 1.75} />
              <span style={{ flex: 1 }}>{label}</span>
              {showStale && staleCount > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#EF4444', color: 'white', borderRadius: 99, padding: '1px 5px', lineHeight: 1.6 }}>
                  {staleCount}
                </span>
              )}
              {label === 'Queue' && queueCount > 0 && !staleCount && (
                <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.32)' }}>{queueCount}</span>
              )}
            </Link>
          );
        })}

        <div className="sidebar-section-label">Manage</div>
        {MANAGE_NAV.map(({ href, icon: Icon, label, showTasks }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={14} strokeWidth={isActive ? 2.2 : 1.75} />
              <span style={{ flex: 1 }}>{label}</span>
              {showTasks && openTaskCount > 0 && (
                <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>{openTaskCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
        ScheduleHero v1.0 · HelloHero
      </div>
    </aside>
  );
}
