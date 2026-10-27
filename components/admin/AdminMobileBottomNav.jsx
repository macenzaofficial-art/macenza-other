import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CalendarHeart
} from 'lucide-react';

/**
 * Floating Pill Mobile Bottom Navigation for Admin Panel
 * Active strictly on mobile (< 768px via md:hidden)
 * Non-end-to-end with rounded-full pill design and pure glassmorphism
 */
const AdminMobileBottomNav = ({
  activeTab,
  onSelectTab,
  applicationsCount = 0,
  upcomingBirthdaysCount = 0
}) => {
  const navItems = [
    {
      id: 'Dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'Applications',
      label: 'Applications',
      icon: ClipboardList,
      badge: applicationsCount > 0 ? applicationsCount : null
    },
    {
      id: 'Employees',
      label: 'Employees',
      icon: Users,
      badge: null
    },
    {
      id: 'Events',
      label: 'Events',
      icon: CalendarHeart,
      badge: upcomingBirthdaysCount > 0 ? upcomingBirthdaysCount : null
    }
  ];

  return (
    <div
      className="admin-bottom-nav-container md:hidden fixed left-0 right-0 z-50 pointer-events-none flex justify-center px-4"
      style={{ bottom: 'max(0.85rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <nav
        className="glass-effect-pill pointer-events-auto w-full max-w-sm rounded-full px-2.5 py-1.5 flex items-center justify-between transition-all duration-300"
        role="navigation"
        aria-label="Admin Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex items-center justify-center transition-all duration-300 select-none cursor-pointer ${isActive
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white font-bold shadow-md shadow-blue-500/35 rounded-full px-4 py-2 gap-1.5 ring-1 ring-white/40'
                : 'p-2.5 rounded-full text-slate-700 hover:text-slate-900 hover:bg-white/35'
                }`}
              style={{ minHeight: '44px' }}
              aria-label={`Go to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.9]'
                    }`}
                />

                {item.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-[9px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border shadow-xs ${isActive
                      ? 'bg-white text-blue-600 border-white'
                      : 'bg-blue-600 text-white border-white'
                      }`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Active pill label matching the reference image design */}
              {isActive && (
                <span className="text-xs font-bold tracking-tight truncate max-w-[85px] transition-all">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminMobileBottomNav;
