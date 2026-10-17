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
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/60 text-xs">
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
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/60 text-xs">
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
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm transition-all">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Applied Candidates Growth & Pipeline
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Volume of incoming talent and candidate stage progression
              </p>
            </div>
          </div>
        </div>

        {/* Time range switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
          {[
            { id: '7D', label: '7D' },
            { id: '30D', label: '30D' },
            { id: '90D', label: '90D' },
            { id: 'ALL', label: 'All' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === tab.id
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid: Trend Line + Donut Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left Side: Timeline Area Chart (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
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
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="appliedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="candidates"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#appliedGradient)"
                  dot={{ r: 3, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats Pill Row */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
            <div className="bg-slate-50 rounded-xl p-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Intake</span>
              <p className="text-base font-extrabold text-slate-800">{totalApplicationsCount}</p>
            </div>
            <div className="bg-emerald-50/60 rounded-xl p-2">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Shortlisted</span>
              <p className="text-base font-extrabold text-emerald-700">{shortlistedCount}</p>
            </div>
            <div className="bg-purple-50/60 rounded-xl p-2">
              <span className="text-[10px] uppercase font-bold text-purple-600">Interviews</span>
              <p className="text-base font-extrabold text-purple-700">{scheduledCount}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Donut / Stage Distribution (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/70 rounded-2xl p-5 border border-slate-200/60">
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
                  innerRadius={52}
                  outerRadius={78}
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
              <span className="text-2xl font-black text-slate-900 leading-none">
                {totalApplicationsCount}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Applicants
              </span>
            </div>
          </div>

          {/* Status Legend & Direct Action List */}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/60">
            {statusCounts.map((item) => (
              <div
                key={item.name}
                onClick={() => onSelectCandidateTab && onSelectCandidateTab('Applications')}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
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
