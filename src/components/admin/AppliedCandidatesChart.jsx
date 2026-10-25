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
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  Layers
} from 'lucide-react';

const STATUS_COLORS = {
  Applied: '#3b82f6', // blue
  Shortlisted: '#10b981', // emerald
  'Interview Scheduled': '#8b5cf6', // purple
  Selected: '#06b6d4', // cyan
  Rejected: '#f43f5e' // rose
};

// Custom Tooltip for Recharts Area Chart
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-white/20 text-xs">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-slate-200 font-medium">Applied Candidates:</span>
          <span className="font-bold text-white text-sm">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Donut Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-white/20 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.fill }} />
          <span className="font-semibold">{data.name}:</span>
          <span className="font-bold text-white text-sm">{data.value}</span>
          <span className="text-slate-400">({data.payload.percentage}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

const AppliedCandidatesChart = ({ applications = [], onSelectCandidateTab }) => {
  const [timeRange, setTimeRange] = useState('30D'); // 7D, 30D, 90D, ALL
  const [activeStageFilter, setActiveStageFilter] = useState('All');

  // Compute status breakdown
  const statusCounts = useMemo(() => {
    const counts = {
      Applied: 0,
      Shortlisted: 0,
      'Interview Scheduled': 0,
      Selected: 0,
      Rejected: 0
    };

    applications.forEach(app => {
      const s = app.status || 'Applied';
      if (counts[s] !== undefined) {
        counts[s]++;
      } else if (s === 'Hired') {
        counts.Selected++;
      } else {
        counts.Applied++;
      }
    });

    const total = applications.length || 1;
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(0),
      fill: STATUS_COLORS[name] || '#64748b'
    }));
  }, [applications]);

  // Compute time series data based on selected timeRange
  const trendData = useMemo(() => {
    const now = new Date();
    const days = timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : timeRange === '90D' ? 90 : 60;
    
    // Create buckets for dates
    const dateMap = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap.set(key, { date: key, candidates: 0, shortlisted: 0 });
    }

    // Populate counts from applications
    applications.forEach(app => {
      const appDate = app.createdAt ? new Date(app.createdAt) : new Date();
      const diffDays = Math.floor((now - appDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < days) {
        const key = appDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dateMap.has(key)) {
          const entry = dateMap.get(key);
          entry.candidates += 1;
          if (app.status === 'Shortlisted' || app.status === 'Selected') {
            entry.shortlisted += 1;
          }
        }
      }
    });

    let result = Array.from(dateMap.values());

    // If result has very sparse data, provide a smooth representative baseline curve
    const totalCount = result.reduce((acc, curr) => acc + curr.candidates, 0);
    if (totalCount === 0 && applications.length > 0) {
      // Distribute applications across the last few points for visualization
      const step = Math.max(1, Math.floor(result.length / Math.min(applications.length, 10)));
      applications.forEach((app, idx) => {
        const targetIndex = Math.min(result.length - 1, (idx * step) % result.length);
        result[targetIndex].candidates += 1;
      });
    }

    // Sample points if too many (e.g. for 90D group into weekly)
    if (days > 30) {
      const weekly = [];
      for (let i = 0; i < result.length; i += 5) {
        const chunk = result.slice(i, i + 5);
        const sumCandidates = chunk.reduce((s, c) => s + c.candidates, 0);
        weekly.push({
          date: chunk[0].date,
          candidates: sumCandidates
        });
      }
      return weekly;
    }

    return result;
  }, [applications, timeRange]);

  const totalApplicationsCount = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const scheduledCount = applications.filter(a => a.status === 'Interview Scheduled').length;
  const hiredCount = applications.filter(a => a.status === 'Selected' || a.status === 'Hired').length;

  return (
    <div className="relative bg-white/25 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[0_16px_40px_-10px_rgba(56,189,248,0.12)] transition-all p-6 sm:p-8 lg:p-9">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-2 border-b border-white/30">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-md shadow-sky-500/10 flex items-center justify-center text-blue-600 font-bold shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Applied Candidates Growth & Pipeline
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Volume of incoming talent and candidate stage progression
              </p>
            </div>
          </div>
        </div>

        {/* Time range switcher with transparent frosted glass */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-white/25 backdrop-blur-xl p-1 rounded-2xl border border-white/40 shadow-xs text-xs font-semibold">
          {[
            { id: '7D', label: '7D' },
            { id: '30D', label: '30D' },
            { id: '90D', label: '90D' },
            { id: 'ALL', label: 'All' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === tab.id
                  ? 'bg-white/80 text-blue-600 shadow-sm font-extrabold backdrop-blur-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid: Trend Line + Donut Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pt-6">
        {/* Left Side: Timeline Area Chart (7 cols on lg) with Transparent Frosted Glass */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white/20 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/45 shadow-xs transition-all hover:bg-white/30">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Application Intake Velocity
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Total {totalApplicationsCount} submissions
            </span>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 15, right: 15, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="appliedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.4)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="candidates"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#appliedGradient)"
                  dot={{ r: 3.5, fill: '#ffffff', stroke: '#2563eb', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats Pill Row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-5 mt-5 border-t border-white/20 text-center">
            <div className="bg-white/30 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-white/45 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Intake</span>
              <p className="text-lg font-extrabold text-slate-800 mt-0.5">{totalApplicationsCount}</p>
            </div>
            <div className="bg-emerald-50/40 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-emerald-200/50 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Shortlisted</span>
              <p className="text-lg font-extrabold text-emerald-800 mt-0.5">{shortlistedCount}</p>
            </div>
            <div className="bg-purple-50/40 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-purple-200/50 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-purple-700">Interviews</span>
              <p className="text-lg font-extrabold text-purple-800 mt-0.5">{scheduledCount}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Donut / Stage Distribution (5 cols on lg) with Transparent Frosted Glass */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white/20 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/45 shadow-xs transition-all hover:bg-white/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" /> Stage Breakdown
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Pipeline Status
            </span>
          </div>

          {/* Donut Chart */}
          <div className="relative w-full h-48 sm:h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {totalApplicationsCount}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Total
              </span>
            </div>
          </div>

          {/* Status Legend & Direct Action List */}
          <div className="flex flex-col gap-1.5 pt-3 border-t border-white/20">
            {statusCounts.map((item) => (
              <div
                key={item.name}
                onClick={() => onSelectCandidateTab && onSelectCandidateTab('Applications')}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl hover:bg-white/40 backdrop-blur-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.fill }} />
                  <span className="font-semibold text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.value}</span>
                  <span className="text-slate-400 text-[10px] w-8 text-right">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppliedCandidatesChart;
