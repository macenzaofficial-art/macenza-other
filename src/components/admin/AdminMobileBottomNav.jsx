import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CalendarHeart
} from 'lucide-react';

/**
 * Mobile Android-style Bottom Navigation for Admin Panel
 * Active strictly on mobile (< 768px via md:hidden)
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
    <nav
      className="admin-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#e0f2fe]/95 via-[#bae6fd]/95 to-[#e0f7fa]/95 backdrop-blur-md border-t border-sky-200/80 shadow-[0_-4px_20px_rgba(2,132,199,0.12)]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      role="navigation"
      aria-label="Admin Mobile Navigation"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 select-none cursor-pointer relative group ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label={`Go to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Android M3 active pill indicator */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-100/90 text-blue-600 shadow-xs scale-105'
                    : 'text-slate-500 group-hover:bg-slate-100/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {item.badge !== null && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border border-white shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-all duration-200 truncate max-w-[76px] ${
                  isActive
                    ? 'font-bold text-blue-700'
                    : 'font-medium text-slate-500 group-hover:text-slate-700'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminMobileBottomNav;
