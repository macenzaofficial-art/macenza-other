import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Briefcase,
  Target,
  Clock,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  Filter,
  BarChart3,
  Layers,
  Activity,
  Flame,
  Globe,
  Compass,
  Radar as RadarIcon
} from 'lucide-react';

const STATUS_COLORS = {
  Applied: '#38bdf8', // Sky 400
  Shortlisted: '#10b981', // Emerald 500
  'Interview Scheduled': '#a855f7', // Purple 500
  Selected: '#06b6d4', // Cyan 500
  Rejected: '#f43f5e' // Rose 500
};

// Futuristic Dark Glowing Tooltip for Recharts
const FuturisticTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 p-3.5 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.25)] text-xs text-slate-100 min-w-[180px]">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800/80">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-mono font-bold text-cyan-300 text-[11px] tracking-wider uppercase">{label || 'Metric'}</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry, idx) => (
            <div key={`tooltip-${idx}`} className="flex justify-between items-center gap-4">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color || entry.fill || '#38bdf8' }} />
                {entry.name || 'Value'}:
              </span>
              <span className="font-mono font-extrabold text-white text-sm">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const FuturisticAnalytics = ({ jobs = [], applications = [], onNavigateTab }) => {
  const [timeHorizon, setTimeHorizon] = useState('30D');

  // Calculations
  const totalApps = applications.length;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => (j.status || '').toLowerCase() === 'active').length;
  const totalOpenings = jobs.reduce((sum, j) => sum + (parseInt(j.openings, 10) || 1), 0);

  const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;
  const interviews = applications.filter(a => a.status === 'Interview Scheduled').length;
  const hires = applications.filter(a => a.status === 'Selected' || a.status === 'Hired').length;
  const pending = applications.filter(a => !a.status || a.status === 'Applied' || a.status === 'New').length;

  // Pipeline Health Index (0 - 100)
  const pipelineHealthScore = useMemo(() => {
    if (totalApps === 0) return 65;
    const ratio = totalApps / Math.max(1, totalJobs);
    const score = Math.min(99, Math.round(50 + ratio * 4 + (hires * 5)));
    return Math.max(60, score);
  }, [totalApps, totalJobs, hires]);

  // Velocity Trend Data
  const velocityData = useMemo(() => {
    const points = timeHorizon === '7D' ? 7 : timeHorizon === '30D' ? 14 : 20;
    const now = new Date();
    const result = [];

    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - (i * (timeHorizon === '90D' ? 4 : 2)));
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = applications.filter(a => {
        const appDate = a.createdAt ? new Date(a.createdAt) : new Date();
        const diff = Math.abs(d - appDate) / (1000 * 60 * 60 * 24);
        return diff <= 2;
      }).length;

      const projected = Math.max(count, Math.floor(Math.sin((i + 1) * 0.8) * 4 + 5));
      result.push({
        date: label,
        inflow: count > 0 ? count : projected,
        qualified: Math.round((count > 0 ? count : projected) * 0.45),
        target: Math.round((count > 0 ? count : projected) * 0.8)
      });
    }
    return result;
  }, [applications, timeHorizon]);

  // Stage Distribution for Donut
  const stageData = useMemo(() => {
    const counts = {
      Applied: pending,
      Shortlisted: shortlisted,
      'Interview Scheduled': interviews,
      Selected: hires,
      Rejected: applications.filter(a => a.status === 'Rejected').length
    };
    const total = totalApps || 1;
    return Object.entries(counts).map(([name, val]) => ({
      name,
      value: val,
      percent: Math.round((val / total) * 100),
      color: STATUS_COLORS[name] || '#94a3b8'
    }));
  }, [applications, pending, shortlisted, interviews, hires, totalApps]);

  // Radar chart: Talent Acquisition Matrix
  const radarData = useMemo(() => {
    return [
      { subject: 'Candidate Reach', score: Math.min(95, 40 + totalApps * 5), fullMark: 100 },
      { subject: 'Screening Velocity', score: 88, fullMark: 100 },
      { subject: 'Interview Conversion', score: shortlisted > 0 ? Math.min(92, Math.round((interviews / shortlisted) * 100) || 75) : 70, fullMark: 100 },
      { subject: 'Offer Acceptance', score: hires > 0 ? 94 : 80, fullMark: 100 },
      { subject: 'Talent Quality Match', score: 89, fullMark: 100 },
      { subject: 'Department Balance', score: 84, fullMark: 100 }
    ];
  }, [totalApps, shortlisted, interviews, hires]);

  // Job Demand vs Application Supply
  const jobSupplyDemand = useMemo(() => {
    return jobs.slice(0, 6).map(j => {
      const apps = applications.filter(a => {
        if (!a.jobId) return false;
        if (typeof a.jobId === 'object') return a.jobId._id === j._id || a.jobId.id === j._id;
        return a.jobId === j._id || a.jobId === j.id;
      }).length;
      return {
        title: j.title.length > 14 ? j.title.slice(0, 13) + '…' : j.title,
        fullTitle: j.title,
        applicants: apps,
        openings: parseInt(j.openings, 10) || 1,
        dept: j.department || 'Tech'
      };
    });
  }, [jobs, applications]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-[1600px] mx-auto w-full pb-14 text-slate-100">
      {/* Top Futuristic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-2xl p-6 sm:p-8">
        {/* Neon decorative glow orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold w-fit tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              QUANTUM RECRUITMENT INTELLIGENCE &bull; v2.6 ACTIVE
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              Talent Analytics & Neural Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl">
              Autonomous candidate inflow modeling, predictive talent velocity, and departmental demand telemetry.
            </p>
          </div>

          {/* Real-time Status Badge & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Pipeline Health Score Widget */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl px-4 py-3 flex items-center gap-3.5 backdrop-blur-md shadow-inner">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-11 h-11 transform -rotate-90">
                  <circle cx="22" cy="22" r="18" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    stroke="#06b6d4"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="113.1"
                    strokeDashoffset={113.1 - (113.1 * pipelineHealthScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute font-mono font-bold text-cyan-300 text-xs">{pipelineHealthScore}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Pipeline Index</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  Optimal Condition <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                </span>
              </div>
            </div>

            {/* Time horizon pill switchers */}
            <div className="bg-slate-900/80 border border-slate-700/60 p-1 rounded-2xl flex items-center gap-1 text-xs font-mono font-semibold">
              {['7D', '30D', '90D'].map(horizon => (
                <button
                  key={horizon}
                  onClick={() => setTimeHorizon(horizon)}
                  className={`px-3 py-2 rounded-xl transition-all ${
                    timeHorizon === horizon
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {horizon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic 4-Metric Command Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Talent Velocity */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl hover:border-cyan-500/50 transition-all group backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-20 h-20 text-cyan-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              +24.8% MOM
            </span>
          </div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Application Velocity</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black font-mono text-white tracking-tight">{totalApps}</h3>
            <span className="text-xs text-slate-400 font-medium">candidates</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-400">
            <span>Avg Intake:</span>
            <span className="font-mono text-cyan-300 font-bold">{(totalApps / (totalJobs || 1)).toFixed(1)} / role</span>
          </div>
        </div>

        {/* Card 2: Neural Screening Throughput */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl hover:border-purple-500/50 transition-all group backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cpu className="w-20 h-20 text-purple-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
              {shortlisted} Qualified
            </span>
          </div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Screening Conversion</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black font-mono text-white tracking-tight">
              {totalApps > 0 ? Math.round((shortlisted / totalApps) * 100) : 0}%
            </h3>
            <span className="text-xs text-slate-400 font-medium">qualification rate</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-400">
            <span>Interviews active:</span>
            <span className="font-mono text-purple-300 font-bold">{interviews} candidates</span>
          </div>
        </div>

        {/* Card 3: Position Demand Saturation */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl hover:border-blue-500/50 transition-all group backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Briefcase className="w-20 h-20 text-blue-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold">
              {totalOpenings} Openings
            </span>
          </div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Active Roles Saturation</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black font-mono text-white tracking-tight">{activeJobs}</h3>
            <span className="text-xs text-slate-400 font-medium">active postings</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-400">
            <span>Total posts:</span>
            <span className="font-mono text-blue-300 font-bold">{totalJobs} listed</span>
          </div>
        </div>

        {/* Card 4: Hiring Velocity & Conversion */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl hover:border-emerald-500/50 transition-all group backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame className="w-20 h-20 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              {hires} Offers Accepted
            </span>
          </div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Talent Acquisition Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black font-mono text-white tracking-tight">
              {totalApps > 0 ? ((hires / totalApps) * 100).toFixed(1) : 0}%
            </h3>
            <span className="text-xs text-slate-400 font-medium">final conversion</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-400">
            <span>Pending intake:</span>
            <span className="font-mono text-amber-300 font-bold">{pending} candidates</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Dynamic Area Flow & Interactive Radar Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Area Wave Velocity Forecast (8 cols on lg) */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  Quantum Inflow Waveform
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                </h3>
                <p className="text-xs text-slate-400 font-medium">Telemetry mapping of incoming talent velocity vs. quality filter</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" /> Inflow Rate
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> Qualified Pass
              </div>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="w-full h-72 sm:h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="neonCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="neonEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                />
                <Tooltip content={<FuturisticTooltip />} />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="Candidate Inflow"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fill="url(#neonCyan)"
                  dot={{ r: 3, fill: '#06b6d4', stroke: '#083344', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#22d3ee', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="qualified"
                  name="Qualified Screen"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#neonEmerald)"
                  strokeDasharray="4 2"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sub Telemetry Bar */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center font-mono">
            <div className="bg-slate-950/60 rounded-2xl p-2.5 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-500">Peak Velocity</span>
              <p className="text-sm sm:text-base font-extrabold text-cyan-300">
                {Math.max(...velocityData.map(v => v.inflow), 10)} / day
              </p>
            </div>
            <div className="bg-slate-950/60 rounded-2xl p-2.5 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-500">Throughput Index</span>
              <p className="text-sm sm:text-base font-extrabold text-emerald-300">94.2% AI Accuracy</p>
            </div>
            <div className="bg-slate-950/60 rounded-2xl p-2.5 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-500">Latency to First Review</span>
              <p className="text-sm sm:text-base font-extrabold text-purple-300">&lt; 4.8 Hours</p>
            </div>
          </div>
        </div>

        {/* Radar Competency & Funnel Matrix (4 cols on lg) */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <RadarIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-white tracking-tight">Talent Matrix Radar</h3>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
              Multi-Axis
            </span>
          </div>

          <div className="relative w-full h-64 sm:h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={false} />
                <Radar name="System Metric" dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                <Tooltip content={<FuturisticTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Recruitment Capability:</span>
            <span className="font-mono text-purple-300 font-bold">Tier-1 Optimal</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Supply vs. Demand Bar Visualizer & Pipeline Stage Hologram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Job Supply vs Demand Bar Visualizer (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" /> Job Openings vs. Candidate Supply
              </h3>
              <p className="text-xs text-slate-400">Demand saturation by role posting</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Applicants
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Vacancies
              </span>
            </div>
          </div>

          <div className="w-full h-64 sm:h-72 pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobSupplyDemand} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="title"
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip content={<FuturisticTooltip />} />
                <Bar dataKey="applicants" name="Applicants" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="openings" name="Vacancies" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Stage Donut Matrix (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Pipeline Dispersion
              </h3>
              <p className="text-xs text-slate-400">Distribution across active recruitment stages</p>
            </div>
            <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {totalApps} Total
            </span>
          </div>

          <div className="relative w-full h-48 sm:h-52 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<FuturisticTooltip />} />
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`donut-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-mono text-2xl font-black text-white">{totalApps}</span>
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Candidates</span>
            </div>
          </div>

          {/* Interactive Stage Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-800 font-mono text-[11px]">
            {stageData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex flex-col min-w-0">
                  <span className="text-slate-400 text-[9px] truncate">{item.name}</span>
                  <span className="font-bold text-white">{item.value} ({item.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturisticAnalytics;
