import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, Grid, Info, Calendar, Sliders, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CorrelationMatrix, DataRow } from '../types';
import { aggregateTrendData } from '../utils/dataProcessor';

interface TrendAndCorrelationTabProps {
  cleanedRows: DataRow[];
  numericCols: string[];
  dateCol: string | null;
  correlationMatrix: CorrelationMatrix | null;
}

export const TrendAndCorrelationTab: React.FC<TrendAndCorrelationTabProps> = ({
  cleanedRows,
  numericCols,
  dateCol,
  correlationMatrix,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>(numericCols[0] || 'Transaction_Amount');
  const [aggType, setAggType] = useState<'sum' | 'mean'>('sum');
  const [dateFilter, setDateFilter] = useState<'ALL' | '1Y' | '6M' | '3M'>('ALL');
  const [hoveredCorr, setHoveredCorr] = useState<{ col1: string; col2: string; val: number } | null>(null);

  // Sync selected metric if numeric cols change
  React.useEffect(() => {
    if (numericCols.length > 0 && !numericCols.includes(selectedMetric)) {
      setSelectedMetric(numericCols[0]);
    }
  }, [numericCols, selectedMetric]);

  // Aggregate time series
  const rawTrendData = useMemo(() => {
    if (!dateCol || !selectedMetric || cleanedRows.length === 0) return [];
    return aggregateTrendData(cleanedRows, dateCol, selectedMetric, aggType);
  }, [cleanedRows, dateCol, selectedMetric, aggType]);

  // Apply date range filter
  const trendData = useMemo(() => {
    if (rawTrendData.length === 0 || dateFilter === 'ALL') return rawTrendData;

    const lastTimestamp = rawTrendData[rawTrendData.length - 1].timestamp;
    const msInDay = 24 * 60 * 60 * 1000;
    let daysToSubtract = 365;

    if (dateFilter === '6M') daysToSubtract = 180;
    else if (dateFilter === '3M') daysToSubtract = 90;

    const cutoff = lastTimestamp - daysToSubtract * msInDay;
    return rawTrendData.filter(d => d.timestamp >= cutoff);
  }, [rawTrendData, dateFilter]);

  // Summary statistics for trend
  const trendSummary = useMemo(() => {
    if (trendData.length === 0) return null;
    const values = trendData.map(d => d.value);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    const firstVal = values[0];
    const lastVal = values[values.length - 1];
    const growth = firstVal !== 0 ? Math.round(((lastVal - firstVal) / firstVal) * 1000) / 10 : 0;

    return { total, avg, max, min, growth };
  }, [trendData]);

  // Helper for coolwarm color interpolation (-1.0 to +1.0)
  // -1.0 is blue (#2563eb), 0 is neutral white/gray (#f8fafc), +1.0 is red (#dc2626)
  const getCoolWarmColor = (val: number) => {
    if (val === 1) return '#e11d48'; // self correlation
    const clamped = Math.max(-1, Math.min(1, val));
    if (clamped >= 0) {
      // White to Red
      const r = Math.round(255 - (255 - 225) * clamped);
      const g = Math.round(255 - (255 - 29) * clamped);
      const b = Math.round(255 - (255 - 72) * clamped);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // White to Blue
      const c = Math.abs(clamped);
      const r = Math.round(255 - (255 - 37) * c);
      const g = Math.round(255 - (255 - 99) * c);
      const b = Math.round(255 - (255 - 235) * c);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const getTextColor = (val: number) => {
    return Math.abs(val) > 0.45 ? '#ffffff' : '#1e293b';
  };

  return (
    <div className="space-y-8">
      {/* 1. Financial Trend Visualization */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Financial Trend Visualization</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Time-series line plot with chronological day-level aggregation.
            </p>
          </div>

          {dateCol && numericCols.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Metric Selector */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="trend-metric-select" className="text-xs font-medium text-slate-600">
                  Metric:
                </label>
                <select
                  id="trend-metric-select"
                  value={selectedMetric}
                  onChange={e => setSelectedMetric(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-1 focus:ring-emerald-500"
                >
                  {numericCols.map(col => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aggregation Mode (Sum vs Mean) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setAggType('sum')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    aggType === 'sum' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  Sum
                </button>
                <button
                  type="button"
                  onClick={() => setAggType('mean')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    aggType === 'mean' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  Daily Mean
                </button>
              </div>

              {/* Time Range Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                {(['ALL', '1Y', '6M', '3M'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setDateFilter(f)}
                    className={`px-2 py-1 rounded font-medium transition ${
                      dateFilter === f ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* If no date col selected */}
        {!dateCol ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">
              No Date Column Specified
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Please specify a valid date column in the sidebar (e.g., Transaction_Date) to render time-series trend analysis.
            </p>
          </div>
        ) : trendData.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No time-series data available for the chosen filters.</p>
          </div>
        ) : (
          <div>
            {/* Quick Metrics Bar */}
            {trendSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    {aggType === 'sum' ? 'Cumulative Sum' : 'Average Per Day'}
                  </div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {trendSummary.total >= 1000
                      ? trendSummary.total.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : trendSummary.total.toFixed(2)}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Daily Average
                  </div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {trendSummary.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Peak Single Day
                  </div>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">
                    {trendSummary.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Window Net Change
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className={`text-lg font-bold ${
                        trendSummary.growth >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {trendSummary.growth > 0 ? `+${trendSummary.growth}%` : `${trendSummary.growth}%`}
                    </span>
                    {trendSummary.growth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Time Series Area Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="financialTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    minTickGap={40}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={val => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [
                      `${Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                      `${aggType === 'sum' ? 'Sum of' : 'Mean of'} ${selectedMetric}`,
                    ]}
                    labelFormatter={label => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#financialTrendGrad)"
                    dot={{ r: 2, fill: '#059669' }}
                    activeDot={{ r: 5, fill: '#047857' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 2. Feature Correlation Heatmap */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Grid className="w-4 h-4 text-indigo-600" />
              <span>Feature Correlation Heatmap</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pearson correlation matrix with coolwarm colormap (-1.00 to +1.00).
            </p>
          </div>

          {/* Colorbar legend */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-blue-700 font-semibold font-mono">-1.0 (Inv)</span>
            <div className="w-28 h-3 rounded-full bg-gradient-to-r from-blue-600 via-slate-100 to-rose-600 border border-slate-200" />
            <span className="text-rose-700 font-semibold font-mono">+1.0 (Dir)</span>
          </div>
        </div>

        {correlationMatrix && correlationMatrix.columns.length >= 2 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Heatmap Grid */}
            <div className="lg:col-span-2 overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Column Headers */}
                <div className="flex">
                  <div className="w-36 shrink-0" />
                  {correlationMatrix.columns.map(col => (
                    <div
                      key={col}
                      className="w-24 shrink-0 px-2 py-2 text-center text-xs font-semibold text-slate-700 truncate"
                      title={col}
                    >
                      {col.replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>

                {/* Heatmap Rows */}
                {correlationMatrix.columns.map((rowCol, rIdx) => (
                  <div key={rowCol} className="flex items-center">
                    <div
                      className="w-36 shrink-0 pr-3 py-3 text-right text-xs font-semibold text-slate-700 truncate"
                      title={rowCol}
                    >
                      {rowCol.replace(/_/g, ' ')}
                    </div>
                    {correlationMatrix.columns.map((colCol, cIdx) => {
                      const val = correlationMatrix.matrix[rIdx][cIdx];
                      const bg = getCoolWarmColor(val);
                      const textColor = getTextColor(val);
                      const isHovered =
                        hoveredCorr?.col1 === rowCol && hoveredCorr?.col2 === colCol;

                      return (
                        <div
                          key={colCol}
                          onMouseEnter={() =>
                            setHoveredCorr({ col1: rowCol, col2: colCol, val })
                          }
                          onMouseLeave={() => setHoveredCorr(null)}
                          style={{ backgroundColor: bg, color: textColor }}
                          className={`w-24 h-14 shrink-0 flex items-center justify-center font-mono font-bold text-xs m-0.5 rounded transition-transform cursor-pointer select-none ${
                            isHovered ? 'scale-105 shadow-md ring-2 ring-slate-900 z-10' : ''
                          }`}
                        >
                          {val.toFixed(2)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Hovered Cell Detail / Insights Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-3">
              <div className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Correlation Inspector</span>
                <span className="text-slate-400 font-normal">Hover cell</span>
              </div>

              {hoveredCorr ? (
                <div className="space-y-2">
                  <div className="text-slate-600">
                    Pair: <strong className="text-slate-900">{hoveredCorr.col1}</strong> ×{' '}
                    <strong className="text-slate-900">{hoveredCorr.col2}</strong>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {hoveredCorr.val.toFixed(2)}
                    </span>
                    <span
                      className={`font-semibold ${
                        Math.abs(hoveredCorr.val) >= 0.7
                          ? 'text-rose-700'
                          : Math.abs(hoveredCorr.val) >= 0.3
                          ? 'text-amber-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {hoveredCorr.col1 === hoveredCorr.col2
                        ? 'Perfect Identity'
                        : Math.abs(hoveredCorr.val) >= 0.7
                        ? 'Strong Correlation'
                        : Math.abs(hoveredCorr.val) >= 0.3
                        ? 'Moderate Correlation'
                        : 'Weak or No Correlation'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {hoveredCorr.col1 === hoveredCorr.col2
                      ? 'Every feature has a correlation of 1.00 with itself.'
                      : hoveredCorr.val > 0.3
                      ? `As ${hoveredCorr.col1} increases, ${hoveredCorr.col2} tends to increase simultaneously.`
                      : hoveredCorr.val < -0.3
                      ? `As ${hoveredCorr.col1} increases, ${hoveredCorr.col2} tends to decrease systematically.`
                      : 'Little to no linear association detected between these two features.'}
                  </p>
                </div>
              ) : (
                <div className="text-slate-500 space-y-2 py-4 text-center">
                  <Info className="w-5 h-5 text-slate-400 mx-auto" />
                  <p>Hover over any cell in the correlation matrix to inspect the pair coefficient and relationship strength.</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700">Financial Insights:</div>
                <p>• DTI and Credit Score typically demonstrate an inverse relationship in underwriting.</p>
                <p>• Transaction size variability reflects diverse customer segments.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">
              Need at least 2 numerical features to construct a Pearson correlation matrix.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
