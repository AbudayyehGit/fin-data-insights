import React from 'react';
import { Database, Filter, CheckCircle2, Hash, ArrowDownRight, Sparkles } from 'lucide-react';

interface MetricCardsProps {
  rawCount: number;
  cleanedCount: number;
  missingCount: number;
  numericCount: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  rawCount,
  cleanedCount,
  missingCount,
  numericCount,
}) => {
  const retentionRate = rawCount > 0 ? Math.round((cleanedCount / rawCount) * 1000) / 10 : 0;
  const droppedCount = rawCount - cleanedCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Raw Rows */}
      <div
        id="card-raw-rows"
        className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs transition-all hover:border-slate-300"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Raw Rows
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Database className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {rawCount.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-400">records</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Source dataset count</span>
        </div>
      </div>

      {/* Cleaned Rows */}
      <div
        id="card-cleaned-rows"
        className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs transition-all hover:border-slate-300"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cleaned Rows
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-700 tracking-tight">
            {cleanedCount.toLocaleString()}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            {retentionRate}% kept
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          {droppedCount > 0 ? (
            <>
              <ArrowDownRight className="w-3.5 h-3.5 text-amber-500" />
              <span>{droppedCount.toLocaleString()} rows filtered</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% row preservation</span>
            </>
          )}
        </div>
      </div>

      {/* Missing Values Cleaned */}
      <div
        id="card-missing-cleaned"
        className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs transition-all hover:border-slate-300"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Missing Values Cleaned
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Filter className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {missingCount.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-400">null cells</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Resolved by pipeline</span>
        </div>
      </div>

      {/* Numeric Features */}
      <div
        id="card-numeric-features"
        className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs transition-all hover:border-slate-300"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Numeric Features
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Hash className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {numericCount}
          </span>
          <span className="text-xs font-medium text-slate-400">columns</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span>Available for profiling & trends</span>
        </div>
      </div>
    </div>
  );
};
