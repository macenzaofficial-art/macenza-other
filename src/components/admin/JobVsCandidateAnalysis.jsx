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
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-slate-700/60 text-xs min-w-[200px]">
        <p className="font-bold text-slate-100 text-sm mb-1.5">{data.jobTitle || label}</p>
        <p className="text-[11px] text-slate-400 mb-2">Dept: {data.department || 'General'}</p>
        <div className="space-y-1 border-t border-slate-700/60 pt-2">
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

  // Aggregate applications per job
  const jobStats = useMemo(() => {
    return jobs.map(job => {
      // Find matching applications by ID or title
      const jobApps = applications.filter(app => {
        if (!app.jobId) return false;
        if (typeof app.jobId === 'object') {
          return (
            app.jobId._id === job._id ||
            app.jobId.id === job._id ||
            (app.jobId.title && app.jobId.title.toLowerCase() === job.title.toLowerCase())
          );
        }
        return app.jobId === job._id || app.jobId === job.id;
      });

      const applicants = jobApps.length;
      const openings = parseInt(job.openings, 10) || 1;
      const shortlisted = jobApps.filter(a => a.status === 'Shortlisted').length;
      const hired = jobApps.filter(a => a.status === 'Selected' || a.status === 'Hired').length;
      const ratio = openings > 0 ? (applicants / openings).toFixed(1) : applicants;

      return {
        id: job._id || job.id,
        jobTitle: job.title,
        shortTitle: job.title.length > 16 ? job.title.substring(0, 14) + '…' : job.title,
        department: job.department || 'General',
        openings,
        applicants,
        shortlisted,
        hired,
        ratio: parseFloat(ratio),
        status: job.status || 'Active'
      };
    }).sort((a, b) => b.applicants - a.applicants);
  }, [jobs, applications]);

  // Aggregate stats by department
  const deptStats = useMemo(() => {
    const map = new Map();
    jobs.forEach(job => {
      const dept = job.department || 'General';
      if (!map.has(dept)) {
        map.set(dept, { department: dept, jobsCount: 0, openings: 0, applicants: 0 });
      }
      const item = map.get(dept);
      item.jobsCount += 1;
      item.openings += parseInt(job.openings, 10) || 1;
    });

    applications.forEach(app => {
      let dept = 'General';
      if (app.jobId && typeof app.jobId === 'object' && app.jobId.department) {
        dept = app.jobId.department;
      } else if (app.jobId) {
        const matchingJob = jobs.find(j => j._id === app.jobId || j.id === app.jobId);
        if (matchingJob && matchingJob.department) {
          dept = matchingJob.department;
        }
      }
      if (!map.has(dept)) {
        map.set(dept, { department: dept, jobsCount: 0, openings: 0, applicants: 0 });
      }
      map.get(dept).applicants += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.applicants - a.applicants);
  }, [jobs, applications]);

  // High-level analytical insights
  const insights = useMemo(() => {
    if (jobStats.length === 0) {
      return {
        topRole: 'N/A',
        mostCompetitive: 'N/A',
        avgApplicants: 0,
        underappliedCount: 0
      };
    }

    const topRole = jobStats[0];
    const mostCompetitive = [...jobStats].sort((a, b) => b.ratio - a.ratio)[0];
    const totalApps = jobStats.reduce((sum, j) => sum + j.applicants, 0);
    const avgApplicants = (totalApps / jobStats.length).toFixed(1);
    const underappliedCount = jobStats.filter(j => j.applicants < 3).length;

    return {
      topRole: topRole ? `${topRole.jobTitle} (${topRole.applicants})` : 'None',
      mostCompetitive: mostCompetitive ? `${mostCompetitive.jobTitle} (${mostCompetitive.ratio}x)` : 'None',
      avgApplicants,
      underappliedCount
    };
  }, [jobStats]);

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm transition-all">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Job Posts vs. Applied Candidates Analysis
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Compare candidate inflow, opening demands, and departmental talent density
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
          <button
            onClick={() => setActiveView('byJob')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'byJob'
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Applications by Role
          </button>
          <button
            onClick={() => setActiveView('openingsVsApps')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'openingsVsApps'
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Demand vs Applicants
          </button>
          <button
            onClick={() => setActiveView('byDept')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'byDept'
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Department Split
          </button>
        </div>
      </div>

      {/* Analytical KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-5 border-b border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Most Popular Role
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate mt-0.5" title={insights.topRole}>
            {insights.topRole}
          </span>
          <span className="text-[10px] text-blue-600 font-semibold mt-0.5">Highest applicant volume</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Highest Competition
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate mt-0.5" title={insights.mostCompetitive}>
            {insights.mostCompetitive}
          </span>
          <span className="text-[10px] text-purple-600 font-semibold mt-0.5">Candidates per vacancy</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Avg Candidates / Job
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
            {insights.avgApplicants} applicants
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Healthy recruitment pipeline</span>
        </div>

        <div className="flex flex-col">
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
        {activeView === 'byJob' && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Candidate Applications Received per Job Post
              </span>
              <span className="text-xs text-slate-400">
                Sorted by highest volume
              </span>
            </div>
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="shortTitle"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
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
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Job Openings (Demand) vs. Candidates Applied (Supply)
              </span>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500"></span> Applicants
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Openings
                </span>
              </div>
            </div>
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="shortTitle"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
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
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Departmental Talent Demand & Inflow
              </span>
              <span className="text-xs text-slate-400">
                Applicants grouped by department
              </span>
            </div>
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'applicants' ? 'Applicants' : 'Openings']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="applicants" name="Applicants" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="openings" name="Openings" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Sleek Role Summary Table */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Pipeline Health by Job Post
          </h4>
          <button
            onClick={() => onNavigateTab && onNavigateTab('Jobs')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Manage All Jobs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Job Title</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Openings</th>
                <th className="py-2.5 px-3">Applied</th>
                <th className="py-2.5 px-3">Shortlisted</th>
                <th className="py-2.5 px-3">Competition</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobStats.slice(0, 5).map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onNavigateTab && onNavigateTab('Jobs')}
                >
                  <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                    <span className="truncate group-hover:text-blue-600 transition-colors">
                      {job.jobTitle}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-medium">{job.department}</td>
                  <td className="py-3 px-3 text-slate-700 font-semibold">{job.openings}</td>
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/50">
                      {job.applicants}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-emerald-600">
                      {job.shortlisted}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, job.ratio * 15)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{job.ratio}:1</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        job.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
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
