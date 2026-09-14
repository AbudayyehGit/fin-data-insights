import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { Table, BarChart2, PieChart as PieIcon, Info, HelpCircle } from 'lucide-react';
import { DataRow, DescriptiveStats } from '../types';

interface StatisticalProfilingTabProps {
  cleanedRows: DataRow[];
  stats: DescriptiveStats[];
}

export const StatisticalProfilingTab: React.FC<StatisticalProfilingTabProps> = ({
  cleanedRows,
  stats,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>(stats[0]?.column || '');

  // Keep selectedMetric updated if stats change
  React.useEffect(() => {
    if (stats.length > 0 && (!selectedMetric || !stats.some(s => s.column === selectedMetric))) {
      setSelectedMetric(stats[0].column);
    }
  }, [stats, selectedMetric]);

  // Compute histogram bins for selectedMetric
  const histogramData = useMemo(() => {
    if (!selectedMetric || cleanedRows.length === 0) return [];

    const values = cleanedRows
      .map(r => r[selectedMetric])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v) && isFinite(v));

    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 15;
    const step = (max - min) / binCount || 1;

    const bins = Array.from({ length: binCount }, (_, i) => {
      const binStart = min + i * step;
      const binEnd = min + (i + 1) * step;
      const label = `${binStart >= 1000 ? Math.round(binStart) : binStart.toFixed(2)} - ${
        binEnd >= 1000 ? Math.round(binEnd) : binEnd.toFixed(2)
      }`;
      return {
        label,
        binStart,
        binEnd,
        count: 0,
      };
    });

    for (const val of values) {
      let binIndex = Math.floor((val - min) / step);
      if (binIndex >= binCount) binIndex = binCount - 1;
      if (binIndex < 0) binIndex = 0;
      bins[binIndex].count++;
    }

    return bins;
  }, [selectedMetric, cleanedRows]);

  // Find non-numeric categorical columns for categorical distribution insights
  const categoricalAnalysis = useMemo(() => {
    if (!cleanedRows || cleanedRows.length === 0) return [];
    const allCols = Object.keys(cleanedRows[0]);
    const numCols = new Set(stats.map(s => s.column));
    const catCols = allCols.filter(c => !numCols.has(c) && !c.toLowerCase().includes('date') && !c.toLowerCase().includes('id'));

    return catCols.slice(0, 2).map(col => {
      const counts: Record<string, number> = {};
      for (const row of cleanedRows) {
        const val = String(row[col] ?? 'Unknown');
        counts[val] = (counts[val] || 0) + 1;
      }

      const total = cleanedRows.length;
      const items = Object.entries(counts)
        .map(([name, value]) => ({
          name,
          value,
          pct: Math.round((value / total) * 1000) / 10,
        }))
        .sort((a, b) => b.value - a.value);

      return { column: col, items };
    });
  }, [cleanedRows, stats]);

  const selectedStat = stats.find(s => s.column === selectedMetric);

  if (stats.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
        <Info className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-amber-900">
          No Numeric Columns Available
        </h4>
        <p className="text-xs text-amber-700 mt-1">
          The active dataset does not contain enough continuous numerical columns for descriptive statistical profiling.
        </p>
      </div>
    );
  }

  const PIE_COLORS = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

  return (
    <div className="space-y-6">
      {/* Descriptive Stats Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-600" />
              <span>Descriptive Statistical Summary</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Parametric & non-parametric summary metrics computed using NumPy and Pandas formulas.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Degrees of freedom: ddof = 1
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 sticky left-0 bg-slate-50">Feature</th>
                <th className="py-3 px-3 text-right">Count</th>
                <th className="py-3 px-3 text-right">Mean</th>
                <th className="py-3 px-3 text-right">Std Dev</th>
                <th className="py-3 px-3 text-right">Median</th>
                <th className="py-3 px-3 text-right">Variance</th>
                <th className="py-3 px-3 text-right">Min</th>
                <th className="py-3 px-3 text-right">25% (Q1)</th>
                <th className="py-3 px-3 text-right">50% (Q2)</th>
                <th className="py-3 px-3 text-right">75% (Q3)</th>
                <th className="py-3 px-3 text-right">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {stats.map(row => {
                const isSelected = row.column === selectedMetric;
                return (
                  <tr
                    key={row.column}
                    onClick={() => setSelectedMetric(row.column)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 sticky left-0 bg-inherit flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      />
                      <span>{row.column}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {row.count.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">
                      {row.mean.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {row.std.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-emerald-700">
                      {row.median.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      {row.variance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {row.min.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {row.p25.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {row.p50.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {row.p75.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {row.max.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Distribution Histogram & Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Histogram */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <span>Feature Distribution Histogram</span>
              </h4>
              <p className="text-xs text-slate-500">
                Binned frequency histogram showing skewness and data density.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="metric-distribution-select" className="text-xs text-slate-500 font-medium">
                Metric:
              </label>
              <select
                id="metric-distribution-select"
                value={selectedMetric}
                onChange={e => setSelectedMetric(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500"
              >
                {stats.map(s => (
                  <option key={s.column} value={s.column}>
                    {s.column}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  angle={-30}
                  textAnchor="end"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} records`, 'Frequency']}
                  labelFormatter={label => `Range: ${label}`}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {histogramData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? '#059669' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Metric Deep Dive Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Metric Profile
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Selected
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 mt-1 truncate">
              {selectedMetric}
            </h4>

            {selectedStat && (
              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Interquartile Range (IQR):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {(selectedStat.p75 - selectedStat.p25).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Spread (Max - Min):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {(selectedStat.max - selectedStat.min).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Mean vs. Median Delta:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {(selectedStat.mean - selectedStat.median).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Std / Mean (CoV):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedStat.mean !== 0
                      ? `${((selectedStat.std / Math.abs(selectedStat.mean)) * 100).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800 block mb-0.5">Statistical Takeaway:</span>
            {selectedStat && Math.abs(selectedStat.mean - selectedStat.median) > selectedStat.std * 0.2 ? (
              <span>
                Distribution exhibits noticeable skewness (Mean: {selectedStat.mean.toFixed(1)} vs Median: {selectedStat.median.toFixed(1)}). Median is recommended for central tendency.
              </span>
            ) : (
              <span>
                Distribution is reasonably symmetric around the mean ({selectedStat?.mean.toFixed(1)}), indicating stable variance across the banking sample.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Categorical Breakdown if available */}
      {categoricalAnalysis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoricalAnalysis.map(cat => (
            <div
              key={cat.column}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs"
            >
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <span>Categorical Breakdown: {cat.column}</span>
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cat.items}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={65}
                        paddingAngle={2}
                      >
                        {cat.items.map((_, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={PIE_COLORS[idx % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`${val} records`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 w-full space-y-2 text-xs">
                  {cat.items.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        />
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <div className="font-mono text-slate-600">
                        {item.value} <span className="text-slate-400">({item.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
