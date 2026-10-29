'use client';

import React, { useState } from 'react';
import {
  Menu,
  X,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

/**
 * Android-app style top app bar for Admin Panel on mobile (< 768px via md:hidden)
 */
const AdminMobileHeader = ({
  activeTab,
  onOpenSidebar,
  onSignOut,
  userEmail = 'admin@macenza.com'
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="admin-mobile-header md:hidden sticky top-0 z-40 bg-gradient-to-r from-[#e0f2fe]/95 via-[#bae6fd]/95 to-[#e0f7fa]/95 backdrop-blur-md border-b border-sky-200/80 px-3.5 py-2.5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Menu Hamburger + Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-blue-50 active:text-blue-600 transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
            title="Open all admin sections"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/logo.svg"
              alt="Macenza Logo"
              className="w-7 h-7 object-contain rounded-lg p-0.5 bg-white border border-slate-200/80 shadow-2xs shrink-0"
            />
            <div className="min-w-0 flex flex-col">
              <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase leading-none">
                Admin Console
              </span>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight truncate leading-tight mt-0.5">
                {activeTab}
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Profile Avatar & Quick Actions Menu */}
        <div className="relative shrink-0 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer text-slate-800"
            aria-label="Admin Profile Menu"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              {(userEmail || 'A').charAt(0).toUpperCase()}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Profile Dropdown / Mini Sheet */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
                    <ShieldCheck className="w-3.5 h-3.5" /> Administrator
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                    {userEmail}
                  </p>
                </div>

                <a
                  href="https://macenza.sanity.studio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>📝</span> Blog Studio
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onSignOut();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors w-full text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminMobileHeader;
