import React, { useRef, useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  RefreshCw,
  Sliders,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  Database
} from 'lucide-react';
import { MissingValueStrategy } from '../types';

interface SidebarProps {
  dataSource: 'mock' | 'upload';
  setDataSource: (src: 'mock' | 'upload') => void;
  fillStrategy: MissingValueStrategy;
  setFillStrategy: (s: MissingValueStrategy) => void;
  columns: string[];
  dateCol: string | null;
  setDateCol: (col: string | null) => void;
  onRegenerateMock: () => void;
  onFileUpload: (file: File) => void;
  isLoadingFile: boolean;
  fileError: string | null;
  uploadedFileName: string | null;
  mockRowCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  dataSource,
  setDataSource,
  fillStrategy,
  setFillStrategy,
  columns,
  dateCol,
  setDateCol,
  onRegenerateMock,
  onFileUpload,
  isLoadingFile,
  fileError,
  uploadedFileName,
  mockRowCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <aside
      id="fin-sidebar"
      className="w-full lg:w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col h-auto lg:h-[calc(100vh-65px)] overflow-y-auto"
    >
      <div className="p-5 space-y-6">
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Data Source & Pipeline</span>
          </div>
          <h2 className="text-base font-semibold text-slate-900">Pipeline Ingestion</h2>
        </div>

        {/* Source Radio Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700">Select Data Source</label>
          <div className="grid grid-cols-1 gap-2">
            <button
              id="source-mock-btn"
              type="button"
              onClick={() => setDataSource('mock')}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                dataSource === 'mock'
                  ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  dataSource === 'mock' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                }`}
              >
                {dataSource === 'mock' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Use Built-in Mock Dataset</div>
                <div className="text-xs text-slate-500">Banking transactions & credit risk</div>
              </div>
            </button>

            <button
              id="source-upload-btn"
              type="button"
              onClick={() => setDataSource('upload')}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                dataSource === 'upload'
                  ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  dataSource === 'upload' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                }`}
              >
                {dataSource === 'upload' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Upload Custom File</div>
                <div className="text-xs text-slate-500">CSV or Excel (.xlsx, .xls)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Source Context Panels */}
        {dataSource === 'mock' ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-600 leading-relaxed">
                Loaded Mock Banking & Credit Dataset ({mockRowCount} records, 2024–2026).
              </div>
            </div>
            <button
              id="regenerate-mock-data-btn"
              type="button"
              onClick={onRegenerateMock}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Regenerate Random Sample</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
            />
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
              }`}
            >
              <UploadCloud className="w-7 h-7 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-700">Click or drag & drop</div>
              <div className="text-[11px] text-slate-400 mt-1">CSV or Excel files up to 50MB</div>
            </div>

            {isLoadingFile && (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Parsing file contents...</span>
              </div>
            )}

            {uploadedFileName && !fileError && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-3 py-2 text-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate font-medium">{uploadedFileName}</span>
              </div>
            )}

            {fileError && (
              <div className="flex items-start gap-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg p-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{fileError}</span>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-slate-200 pt-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Cleansing Configuration</span>
          </div>

          {/* Missing value strategy */}
          <div className="space-y-1.5">
            <label htmlFor="missing-strategy-select" className="text-xs font-semibold text-slate-700">
              Missing Value Strategy
            </label>
            <select
              id="missing-strategy-select"
              value={fillStrategy}
              onChange={e => setFillStrategy(e.target.value as MissingValueStrategy)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
            >
              <option value="Drop Missing">Drop Missing (Row Deletion)</option>
              <option value="Impute Mean (Numeric)">Impute Mean (Numeric)</option>
              <option value="Impute Median (Numeric)">Impute Median (Numeric)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              {fillStrategy === 'Drop Missing'
                ? 'Removes rows containing incomplete values'
                : fillStrategy === 'Impute Mean (Numeric)'
                ? 'Fills numeric NaNs with arithmetic average'
                : 'Fills numeric NaNs with 50th percentile'}
            </p>
          </div>

          {/* Date Column Selector */}
          <div className="space-y-1.5">
            <label htmlFor="date-col-select" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Select Date Column</span>
            </label>
            <select
              id="date-col-select"
              value={dateCol ?? ''}
              onChange={e => setDateCol(e.target.value === '' ? null : e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
            >
              <option value="">None (Disable Chronological Sorting)</option>
              {columns.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Standardizes ISO dates and orders dataset chronologically.
            </p>
          </div>
        </div>

        {/* Pipeline Info Box */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[11px] text-slate-500 space-y-1.5">
          <div className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Automated Processing Rules</span>
          </div>
          <p>• Type casting & numeric coercion</p>
          <p>• Chronological timestamp ordering</p>
          <p>• Outlier bounds clipping (Credit Score)</p>
        </div>
      </div>
    </aside>
  );
};
