import React, { useState } from 'react';
import { Download, Search, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { DataRow, MissingValueInfo } from '../types';
import { exportToCsv } from '../utils/dataProcessor';

interface DataPreviewTabProps {
  rawRows: DataRow[];
  cleanedRows: DataRow[];
  missingSummary: MissingValueInfo[];
  imputedCells: Set<string>;
  fillStrategy: string;
}

export const DataPreviewTab: React.FC<DataPreviewTabProps> = ({
  rawRows,
  cleanedRows,
  missingSummary,
  imputedCells,
  fillStrategy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'raw' | 'cleaned'>('split');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const columns = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];

  // Filtered rows
  const filterRows = (rows: DataRow[]) => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(row =>
      columns.some(col => String(row[col] ?? '').toLowerCase().includes(term))
    );
  };

  const filteredRaw = filterRows(rawRows);
  const filteredCleaned = filterRows(cleanedRows);

  const totalRawPages = Math.max(1, Math.ceil(filteredRaw.length / rowsPerPage));
  const totalCleanedPages = Math.max(1, Math.ceil(filteredCleaned.length / rowsPerPage));
  const maxPage = Math.max(totalRawPages, totalCleanedPages);

  const rawSlice = filteredRaw.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const cleanedSlice = filteredCleaned.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const renderCell = (val: any, isMissing: boolean, isImputed: boolean) => {
    if (isMissing || val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val))) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          NaN
        </span>
      );
    }

    if (isImputed) {
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200 text-xs">
          <span>{typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 4 }) : String(val)}</span>
          <span className="text-[9px] uppercase tracking-wider bg-emerald-600 text-white px-1 py-0.2 rounded-xs">imputed</span>
        </span>
      );
    }

    if (typeof val === 'number') {
      return <span className="font-mono text-xs">{val.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>;
    }

    return <span className="text-xs text-slate-700">{String(val)}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span>Dataset Inspection</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Head sample comparison
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare unprocessed input streams directly against automated pipeline outputs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 text-slate-800"
            />
          </div>

          {/* View mode buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                viewMode === 'raw' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Only
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cleaned')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                viewMode === 'cleaned' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cleaned Only
            </button>
          </div>

          {/* Export Button */}
          <button
            id="export-cleaned-csv-btn"
            type="button"
            onClick={() => exportToCsv(cleanedRows, 'cleaned_financial_data.csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Cleaned CSV</span>
          </button>
        </div>
      </div>

      {/* Missing Value Diagnostics Strip */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Data Quality & Missingness Profiler
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Active Strategy:{' '}
            <strong className="text-slate-800 font-semibold">{fillStrategy}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {missingSummary.map(item => (
            <div
              key={item.column}
              className={`p-2.5 rounded-lg border text-xs ${
                item.missingCount > 0
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="font-semibold text-slate-800 truncate" title={item.column}>
                {item.column}
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-500">{item.dataType}</span>
                {item.missingCount > 0 ? (
                  <span className="text-amber-700 font-bold text-[11px]">
                    {item.missingCount} ({item.missingPercentage}%)
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 inline" /> Clean
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tables Container */}
      <div
        className={`grid gap-6 ${
          viewMode === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* Raw Data Table */}
        {(viewMode === 'split' || viewMode === 'raw') && (
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Raw Data Sample
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {rawRows.length.toLocaleString()} total rows
              </span>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[460px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    {columns.map(col => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawSlice.map((row, idx) => {
                    const rowGlobalIdx = (page - 1) * rowsPerPage + idx;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-2 px-3 text-[11px] font-mono text-slate-400">
                          {rowGlobalIdx + 1}
                        </td>
                        {columns.map(col => {
                          const val = row[col];
                          const isMissing =
                            val === null ||
                            val === undefined ||
                            val === '' ||
                            (typeof val === 'number' && isNaN(val));
                          return (
                            <td key={col} className="py-2 px-3 whitespace-nowrap">
                              {renderCell(val, isMissing, false)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {rawSlice.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="py-8 text-center text-xs text-slate-400">
                        No matching raw records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cleaned Data Table */}
        {(viewMode === 'split' || viewMode === 'cleaned') && (
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-emerald-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Cleaned Data Sample
                </span>
              </div>
              <span className="text-xs text-emerald-800 font-mono">
                {cleanedRows.length.toLocaleString()} verified rows
              </span>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[460px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    {columns.map(col => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cleanedSlice.map((row, idx) => {
                    const rowGlobalIdx = (page - 1) * rowsPerPage + idx;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-2 px-3 text-[11px] font-mono text-slate-400">
                          {rowGlobalIdx + 1}
                        </td>
                        {columns.map(col => {
                          const val = row[col];
                          const isImputed = imputedCells.has(`${rowGlobalIdx}:${col}`);
                          return (
                            <td key={col} className="py-2 px-3 whitespace-nowrap">
                              {renderCell(val, false, isImputed)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {cleanedSlice.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="py-8 text-center text-xs text-slate-400">
                        No matching cleaned records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 text-xs">
        <span className="text-slate-500">
          Showing page <strong className="text-slate-800">{page}</strong> of {maxPage}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={page >= maxPage}
            onClick={() => setPage(p => Math.min(maxPage, p + 1))}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
