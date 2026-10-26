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
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/60',
      icon: Briefcase,
      iconBg: 'bg-blue-500/10 text-blue-600',
      gradient: 'from-blue-500/5 to-transparent',
      borderColor: 'hover:border-blue-300',
      tab: 'Jobs'
    },
    {
      id: 'applications',
      title: 'Total Applications',
      value: totalApps,
      subValue: `${candidateToJobRatio} avg candidates / role`,
      badge: '+18% this month',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      icon: Users,
      iconBg: 'bg-indigo-500/10 text-indigo-600',
      gradient: 'from-indigo-500/5 to-transparent',
      borderColor: 'hover:border-indigo-300',
      tab: 'Applications'
    },
    {
      id: 'pending',
      title: 'Action Needed',
      value: newApps,
      subValue: 'Awaiting initial profile review',
      badge: newApps > 0 ? 'Pending review' : 'All clear',
      badgeColor: newApps > 0 ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      icon: FileText,
      iconBg: 'bg-amber-500/10 text-amber-600',
      gradient: 'from-amber-500/5 to-transparent',
      borderColor: 'hover:border-amber-300',
      tab: 'Applications'
    },
    {
      id: 'shortlisted',
      title: 'Shortlisted',
      value: shortlistedApps,
      subValue: `${shortlistRate}% qualification rate`,
      badge: `${shortlistRate}% rate`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      icon: UserCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      gradient: 'from-emerald-500/5 to-transparent',
      borderColor: 'hover:border-emerald-300',
      tab: 'Applications'
    },
    {
      id: 'interviews',
      title: 'Interviews',
      value: scheduledApps,
      subValue: 'Active screening & rounds',
      badge: 'Calendar active',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/60',
      icon: Clock,
      iconBg: 'bg-purple-500/10 text-purple-600',
      gradient: 'from-purple-500/5 to-transparent',
      borderColor: 'hover:border-purple-300',
      tab: 'Applications'
    },
    {
      id: 'placed',
      title: 'Selected / Hired',
      value: selectedApps,
      subValue: `${rejectedApps} candidates closed`,
      badge: `${hireRate}% conversion`,
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/60',
      icon: CheckCircle2,
      iconBg: 'bg-teal-500/10 text-teal-600',
      gradient: 'from-teal-500/5 to-transparent',
      borderColor: 'hover:border-teal-300',
      tab: 'Applications'
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              onClick={() => onSelectTab && onSelectTab(kpi.tab)}
              className={`group relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${kpi.borderColor}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-40 pointer-events-none`} />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${kpi.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border truncate ${kpi.badgeColor}`}>
                    {kpi.badge}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                      {kpi.value}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-600 mt-0.5 tracking-wide">
                    {kpi.title}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400 mt-1 truncate">
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
