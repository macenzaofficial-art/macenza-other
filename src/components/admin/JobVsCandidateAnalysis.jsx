import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import {
  Briefcase,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  BarChart2,
  TrendingUp,
  AlertCircle,
  Building2,
  PieChart as PieIcon
} from 'lucide-react';

// Custom Tooltip for Job Analysis Bar Chart
const CustomJobTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl text-white p-3.5 rounded-2xl shadow-xl border border-white/20 text-xs min-w-[200px]">
        <p className="font-bold text-slate-100 text-sm mb-1.5">{data.jobTitle || label}</p>
        <p className="text-[11px] text-slate-400 mb-2">Dept: {data.department || 'General'}</p>
        <div className="space-y-1 border-t border-white/20 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Total Applicants:
            </span>
            <span className="font-bold text-white text-sm">{data.applicants}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Open Vacancies:
            </span>
            <span className="font-bold text-emerald-400">{data.openings}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Competition Ratio:
            </span>
            <span className="font-bold text-purple-300">{data.ratio}:1</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const JobVsCandidateAnalysis = ({ jobs = [], applications = [], onSelectJob, onNavigateTab }) => {
  const [activeView, setActiveView] = useState('byJob'); // 'byJob', 'openingsVsApps', 'byDept'

  // Pre-calculate per-job candidate metrics
  const jobStats = useMemo(() => {
    return jobs.map(job => {
      const jobId = job._id || job.id;
      // Filter applications that belong to this job
      const jobApps = applications.filter(app => {
        if (!app.jobId) return false;
        if (typeof app.jobId === 'object') {
          return (app.jobId._id || app.jobId.id) === jobId;
        }
        return app.jobId === jobId;
      });

      const openings = parseInt(job.openings, 10) || 1;
      const count = jobApps.length;
      const shortlisted = jobApps.filter(a => a.status === 'Shortlisted').length;
      const ratio = openings > 0 ? (count / openings).toFixed(1) : 0;

      return {
        id: jobId,
        jobTitle: job.title || 'Untitled Role',
        shortTitle: (job.title || 'Role').length > 18 ? `${(job.title || 'Role').slice(0, 16)}…` : job.title,
        department: job.department || 'General',
        openings,
        applicants: count,
        shortlisted,
        ratio: parseFloat(ratio),
        status: job.status || 'Active'
      };
    }).sort((a, b) => b.applicants - a.applicants);
  }, [jobs, applications]);

  // Aggregate by Department
  const deptStats = useMemo(() => {
    const map = new Map();
    jobStats.forEach(job => {
      const dept = job.department || 'General';
      if (!map.has(dept)) {
        map.set(dept, { department: dept, applicants: 0, openings: 0, jobsCount: 0 });
      }
      const entry = map.get(dept);
      entry.applicants += job.applicants;
      entry.openings += job.openings;
      entry.jobsCount += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.applicants - a.applicants);
  }, [jobStats]);

  // Executive Insights Summaries
  const insights = useMemo(() => {
    if (!jobStats.length) {
      return {
        topRole: 'N/A',
        mostCompetitive: 'N/A',
        avgApplicants: 0,
        underappliedCount: 0
      };
    }

    const topRole = jobStats[0];
    const mostCompetitive = [...jobStats].sort((a, b) => b.ratio - a.ratio)[0];
    const avgApplicants = (applications.length / (jobs.length || 1)).toFixed(1);
    const underappliedCount = jobStats.filter(j => j.applicants < 3).length;

    return {
      topRole: topRole ? `${topRole.jobTitle} (${topRole.applicants})` : 'None',
      mostCompetitive: mostCompetitive ? `${mostCompetitive.jobTitle} (${mostCompetitive.ratio}x)` : 'None',
      avgApplicants,
      underappliedCount
    };
  }, [jobStats]);

  return (
    <div className="relative bg-white/25 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[0_16px_40px_-10px_rgba(56,189,248,0.12)] transition-all p-6 sm:p-8 lg:p-9">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-2 border-b border-white/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-md shadow-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Job Posts vs. Applied Candidates Analysis
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Compare candidate inflow, opening demands, and departmental talent density
            </p>
          </div>
        </div>

        {/* View Switcher with transparent frosted glass */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-white/25 backdrop-blur-xl p-1 rounded-2xl border border-white/40 shadow-xs text-xs font-semibold">
          <button
            onClick={() => setActiveView('byJob')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeView === 'byJob'
              ? 'bg-white/80 text-indigo-600 shadow-sm font-extrabold backdrop-blur-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
              }`}
          >
            Applications by Role
          </button>
          <button
            onClick={() => setActiveView('openingsVsApps')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeView === 'openingsVsApps'
              ? 'bg-white/80 text-indigo-600 shadow-sm font-extrabold backdrop-blur-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
              }`}
          >
            Demand vs Applicants
          </button>
          <button
            onClick={() => setActiveView('byDept')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeView === 'byDept'
              ? 'bg-white/80 text-indigo-600 shadow-sm font-extrabold backdrop-blur-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
              }`}
          >
            Department Split
          </button>
        </div>
      </div>

      {/* Analytical KPI Ribbon with Transparent Frosted Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-5 border-b border-white/20">
        <div className="flex flex-col bg-white/20 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/45 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Most Popular Role
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate mt-0.5" title={insights.topRole}>
            {insights.topRole}
          </span>
          <span className="text-[10px] text-blue-600 font-semibold mt-0.5">Highest applicant volume</span>
        </div>

        <div className="flex flex-col bg-white/20 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/45 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Highest Competition
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate mt-0.5" title={insights.mostCompetitive}>
            {insights.mostCompetitive}
          </span>
          <span className="text-[10px] text-purple-600 font-semibold mt-0.5">Candidates per vacancy</span>
        </div>

        <div className="flex flex-col bg-white/20 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/45 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Avg Candidates / Job
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
            {insights.avgApplicants} applicants
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Healthy recruitment pipeline</span>
        </div>

        <div className="flex flex-col bg-white/20 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/45 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Roles Needing Sourcing
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
            {insights.underappliedCount} roles
          </span>
          <span className="text-[10px] text-amber-600 font-semibold mt-0.5">&lt; 3 candidates applied</span>
        </div>
      </div>

      {/* Main Analysis Chart Area */}
      <div className="pt-6">
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/45 shadow-xs transition-all hover:bg-white/30">
          {activeView === 'byJob' && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Candidate Applications Received per Job Post
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Sorted by highest volume
                </span>
              </div>
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobStats} margin={{ top: 15, right: 15, left: 5, bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.4)" />
                    <XAxis
                      dataKey="shortTitle"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      angle={-18}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={35}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomJobTooltip />} />
                    <Bar
                      dataKey="applicants"
                      radius={[6, 6, 0, 0]}
                      fill="#3b82f6"
                    >
                      {jobStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? '#2563eb' : index === 1 ? '#4f46e5' : '#60a5fa'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeView === 'openingsVsApps' && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Job Openings (Demand) vs. Candidates Applied (Supply)
                </span>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 shadow-xs"></span> Applicants
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-xs"></span> Openings
                  </span>
                </div>
              </div>
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobStats} margin={{ top: 15, right: 15, left: 5, bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.4)" />
                    <XAxis
                      dataKey="shortTitle"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      angle={-18}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={35}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomJobTooltip />} />
                    <Bar dataKey="applicants" name="Applicants" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="openings" name="Openings" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeView === 'byDept' && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Departmental Talent Demand & Inflow
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Applicants grouped by department
                </span>
              </div>
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptStats} margin={{ top: 15, right: 15, left: 5, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.4)" />
                    <XAxis
                      dataKey="department"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={35}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value, name) => [value, name === 'applicants' ? 'Applicants' : 'Openings']}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="applicants" name="Applicants" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="openings" name="Openings" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sleek Role Summary Table */}
      <div className="mt-8 pt-6 border-t border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Pipeline Health by Job Post
          </h4>
          <button
            onClick={() => onNavigateTab && onNavigateTab('Jobs')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            Manage All Jobs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white/20 backdrop-blur-xl border border-white/45 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/20 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Openings</th>
                <th className="py-3 px-4">Applied</th>
                <th className="py-3 px-4">Shortlisted</th>
                <th className="py-3 px-4">Competition</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/15">
              {jobStats.slice(0, 5).map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-white/35 backdrop-blur-md transition-colors group cursor-pointer"
                  onClick={() => onNavigateTab && onNavigateTab('Jobs')}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-xs"></span>
                    <span className="truncate group-hover:text-blue-600 transition-colors">
                      {job.jobTitle}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">{job.department}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{job.openings}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-blue-600 bg-blue-50/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-blue-200/50 shadow-xs">
                      {job.applicants}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-emerald-600">
                      {job.shortlisted}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, job.ratio * 15)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{job.ratio}:1</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-xs ${job.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-300/40'
                        : 'bg-amber-500/20 text-amber-800 border border-amber-300/40'
                        }`}
                    >
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
              {jobStats.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-400 italic">
                    No active jobs available for analysis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobVsCandidateAnalysis;
