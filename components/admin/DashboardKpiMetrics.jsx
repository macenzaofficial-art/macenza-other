'use client';

import React from 'react';
import {
  Briefcase,
  Users,
  FileText,
  UserCheck,
  Clock,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

const DashboardKpiMetrics = ({ jobs = [], applications = [], onSelectTab }) => {
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => (j.status || '').toLowerCase() === 'active').length;
  const totalOpenings = jobs.reduce((sum, j) => sum + (parseInt(j.openings, 10) || 1), 0);

  const totalApps = applications.length;
  const newApps = applications.filter(a => !a.status || a.status === 'Applied' || a.status === 'New').length;
  const shortlistedApps = applications.filter(a => a.status === 'Shortlisted').length;
  const scheduledApps = applications.filter(a => a.status === 'Interview Scheduled').length;
  const selectedApps = applications.filter(a => a.status === 'Selected' || a.status === 'Hired').length;
  const rejectedApps = applications.filter(a => a.status === 'Rejected').length;

  const shortlistRate = totalApps > 0 ? ((shortlistedApps / totalApps) * 100).toFixed(0) : 0;
  const hireRate = totalApps > 0 ? ((selectedApps / totalApps) * 100).toFixed(0) : 0;
  const candidateToJobRatio = totalJobs > 0 ? (totalApps / totalJobs).toFixed(1) : 0;

  const kpis = [
    {
      id: 'jobs',
      title: 'Active Jobs',
      value: activeJobs,
      subValue: `${totalJobs} total (${totalOpenings} openings)`,
      badge: `${totalOpenings} Openings`,
      badgeColor: 'bg-sky-500/15 text-sky-800 border-sky-300/40',
      icon: Briefcase,
      iconGrad: 'from-blue-600 to-sky-400 shadow-blue-500/30',
      glowBorder: 'border-sky-300/50 shadow-[0_12px_32px_-6px_rgba(56,189,248,0.22)]',
      bgTint: 'from-sky-100/25 via-white/20 to-white/10',
      ambientGlow: 'bg-sky-400/20',
      watermarkType: 'bars',
      tab: 'Jobs'
    },
    {
      id: 'applications',
      title: 'Total Applications',
      value: totalApps,
      subValue: `${candidateToJobRatio} avg candidates / role`,
      badge: '+18% this month',
      badgeColor: 'bg-purple-500/15 text-purple-800 border-purple-300/40',
      icon: Users,
      iconGrad: 'from-purple-600 to-indigo-500 shadow-purple-500/30',
      glowBorder: 'border-purple-300/50 shadow-[0_12px_32px_-6px_rgba(168,85,247,0.22)]',
      bgTint: 'from-purple-100/25 via-white/20 to-white/10',
      ambientGlow: 'bg-purple-400/20',
      watermarkType: 'users',
      tab: 'Applications'
    },
    {
      id: 'pending',
      title: 'Action Needed',
      value: newApps,
      subValue: 'Awaiting initial profile review',
      badge: newApps > 0 ? 'Pending review' : 'All clear',
      badgeColor: newApps > 0 ? 'bg-amber-500/15 text-amber-900 border-amber-300/40' : 'bg-emerald-500/15 text-emerald-900 border-emerald-300/40',
      icon: FileText,
      iconGrad: 'from-amber-500 to-orange-400 shadow-amber-500/30',
      glowBorder: 'border-amber-300/50 shadow-[0_12px_32px_-6px_rgba(251,146,60,0.25)]',
      bgTint: 'from-amber-100/25 via-white/20 to-white/10',
      ambientGlow: 'bg-amber-400/20',
      watermarkType: 'file',
      tab: 'Applications'
    },
    {
      id: 'shortlisted',
      title: 'Shortlisted',
      value: shortlistedApps,
      subValue: `${shortlistRate}% qualification rate`,
      badge: `${shortlistRate}% rate`,
      badgeColor: 'bg-emerald-500/15 text-emerald-900 border-emerald-300/40',
      icon: UserCheck,
      iconGrad: 'from-emerald-500 to-teal-400 shadow-emerald-500/30',
      glowBorder: 'border-emerald-300/50 shadow-[0_12px_32px_-6px_rgba(52,211,153,0.25)]',
      bgTint: 'from-emerald-100/25 via-white/20 to-white/10',
      ambientGlow: 'bg-emerald-400/20',
      watermarkType: 'userCheck',
      tab: 'Applications'
    },
    {
      id: 'interviews',
      title: 'Interviews',
      value: scheduledApps,
      subValue: 'Active screening & rounds',
      badge: 'Calendar active',
      badgeColor: 'bg-violet-500/15 text-violet-800 border-violet-300/40',
      icon: Clock,
      iconGrad: 'from-violet-600 to-purple-400 shadow-violet-500/30',
      glowBorder: 'border-violet-300/50 shadow-[0_12px_32px_-6px_rgba(139,92,246,0.22)]',
      bgTint: 'from-violet-100/25 via-white/20 to-white/10',
      ambientGlow: 'bg-violet-400/20',
      watermarkType: 'clock',
      tab: 'Applications'
    },
    {
      id: 'placed',
      title: 'Selected / Hired',
      value: selectedApps,
      subValue: `${rejectedApps} candidates closed`,
      badge: `${hireRate}% conversion`,
      badgeColor: 'bg-teal-500/15 text-teal-900 border-teal-300/40',
      icon: CheckCircle2,
      iconGrad: 'from-teal-500 to-cyan-400 shadow-teal-500/30',
      glowBorder: 'border-teal-300/50 shadow-[0_12px_32px_-6px_rgba(45,212,191,0.25)]',
      bgTint: 'from-teal-100/25 via-white/20 to-white/10',
      ambientGlow: 'bg-teal-400/20',
      watermarkType: 'check',
      tab: 'Applications'
    }
  ];

  const renderWatermark = (type) => {
    switch (type) {
      case 'bars':
        return (
          <div className="flex items-end gap-1 opacity-25 text-sky-500">
            <div className="w-1.5 h-3.5 bg-current rounded-full" />
            <div className="w-1.5 h-6.5 bg-current rounded-full" />
            <div className="w-1.5 h-9 bg-current rounded-full" />
          </div>
        );
      case 'users':
        return <Users className="w-14 h-14 text-purple-600/20 stroke-[1.5]" />;
      case 'file':
        return <FileText className="w-14 h-14 text-amber-600/20 stroke-[1.5]" />;
      case 'userCheck':
        return <UserCheck className="w-14 h-14 text-emerald-600/20 stroke-[1.5]" />;
      case 'clock':
        return <Clock className="w-14 h-14 text-violet-600/20 stroke-[1.5]" />;
      case 'check':
        return <CheckCircle2 className="w-14 h-14 text-teal-600/20 stroke-[1.5]" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              onClick={() => onSelectTab && onSelectTab(kpi.tab)}
              className="group relative cursor-pointer select-none"
            >
              {/* Outer Ambient Glow Effect */}
              <div
                className={`absolute -inset-1 rounded-3xl opacity-35 blur-lg pointer-events-none transition-opacity duration-300 group-hover:opacity-65 ${kpi.ambientGlow}`}
              />

              {/* Single-Cut Corner Card Body with Guaranteed Transparency & Blur */}
              <div
                className={`admin-cut-card relative overflow-hidden bg-gradient-to-b ${kpi.bgTint} backdrop-blur-2xl border border-white/60 ${kpi.glowBorder} p-3.5 sm:p-4 flex flex-col justify-between h-full min-h-[155px]`}
              >
                {/* Diagonal cut corner glowing line */}
                <div className="absolute top-0 right-0 w-[34px] h-[34px] pointer-events-none overflow-hidden z-20">
                  <div className="absolute top-[16px] -right-[8px] w-[48px] h-[1.5px] bg-white/80 rotate-45 shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                </div>

                {/* Subtle Watermark in Lower Right */}
                <div className="absolute bottom-1 right-2 pointer-events-none z-0">
                  {renderWatermark(kpi.watermarkType)}
                </div>

                {/* Card Top: Icon & Badge */}
                <div className="relative z-10 flex items-center justify-between gap-2 mb-2 sm:mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br ${kpi.iconGrad} shadow-md`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-xs truncate max-w-[95px] sm:max-w-[110px] ${kpi.badgeColor}`}
                  >
                    {kpi.badge}
                  </span>
                </div>

                {/* Card Bottom: Big Number, Title, Subtitle */}
                <div className="relative z-10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                      {kpi.value}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 mt-0.5 tracking-wide truncate">
                    {kpi.title}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                    {kpi.subValue}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardKpiMetrics;
