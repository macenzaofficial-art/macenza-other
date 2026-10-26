import React from 'react';
import {
  Users,
  ArrowRight,
  Sparkles,
  Plus,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const RecentActivityAndActions = ({
  applications = [],
  jobs = [],
  onSelectCandidate,
  onOpenCreateJob,
  onNavigateTab
}) => {
  const recentApps = applications.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      {/* Left: Recent Candidate Submissions List (8 cols) with Transparent Frosted Glass */}
      <div className="lg:col-span-8 bg-white/25 backdrop-blur-2xl rounded-3xl border border-white/50 p-5 sm:p-7 shadow-[0_16px_40px_-10px_rgba(56,189,248,0.12)] transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-white/30">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Recent Candidate Submissions
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Latest talent applying to open career opportunities
            </p>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('Applications')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer transition-colors"
          >
            View All ({applications.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-white/20 mt-2">
          {recentApps.map((app) => {
            const jobTitle = app.jobId
              ? (typeof app.jobId === 'object' ? app.jobId.title : 'Position')
              : 'General Placement';

            const appliedDate = app.createdAt
              ? new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Recent';

            return (
              <div
                key={app._id || app.id}
                onClick={() => onSelectCandidate && onSelectCandidate(app)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/35 backdrop-blur-md px-3 rounded-2xl border border-transparent hover:border-white/45 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                    {(app.candidateName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {app.candidateName}
                    </h5>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <span>{jobTitle}</span>
                      <span>&bull;</span>
                      <span className="text-slate-400">{appliedDate}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${app.status === 'Shortlisted'
                        ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-300/40'
                        : app.status === 'Interview Scheduled'
                          ? 'bg-purple-500/20 text-purple-800 border border-purple-300/40'
                          : app.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-800 border border-rose-300/40'
                            : 'bg-blue-500/20 text-blue-800 border border-blue-300/40'
                      }`}
                  >
                    {app.status || 'Applied'}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Review <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}

          {recentApps.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-sm italic">
              No candidate submissions recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Hiring Actions (4 cols) with Transparent Dark Glass */}
      <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-6 text-white flex flex-col justify-between shadow-[0_16px_40px_-10px_rgba(15,23,42,0.25)] border border-white/20">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Fast Actions
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight mb-2">
            Recruitment Command
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            Quickly publish career roles, review candidate resumes, and manage recruitment pipeline velocity.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => onOpenCreateJob && onOpenCreateJob()}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-600/80 hover:bg-blue-500/90 backdrop-blur-md rounded-2xl text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 active:scale-98 cursor-pointer ring-1 ring-white/25"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create New Job Posting
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-100" />
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('Applications')}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 rounded-2xl text-slate-100 text-xs font-bold transition-all active:scale-98 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-300" /> Review All Applications
              </span>
              <span className="bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                {applications.length}
              </span>
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('Resume Manager')}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 rounded-2xl text-slate-100 text-xs font-bold transition-all active:scale-98 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-300" /> Resume Evaluator
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300 font-medium">
          <span>Active Pipeline: {jobs.length} Roles</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> System Operational
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityAndActions;
