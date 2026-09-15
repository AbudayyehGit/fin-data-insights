import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Database,
  BarChart3,
  Table2,
  Menu,
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { DataRow, MissingValueStrategy } from './types';
import { generateMockFinancialData } from './utils/mockGenerator';
import {
  cleanData,
  detectDateColumns,
  detectNumericColumns,
  getCorrelationMatrix,
  getDescriptiveStats,
  getMissingValueSummary,
  parseCsvFile,
  parseExcelFile,
} from './utils/dataProcessor';
import { Sidebar } from './components/Sidebar';
import { MetricCards } from './components/MetricCards';
import { DataPreviewTab } from './components/DataPreviewTab';
import { StatisticalProfilingTab } from './components/StatisticalProfilingTab';
import { TrendAndCorrelationTab } from './components/TrendAndCorrelationTab';
import { PythonDeploymentTab } from './components/PythonDeploymentTab';
import { CodeInspectorTab } from './components/CodeInspectorTab';
import { FolderGit2, Code2 } from 'lucide-react';

export default function App() {
  const [dataSource, setDataSource] = useState<'mock' | 'upload'>('mock');
  const [fillStrategy, setFillStrategy] = useState<MissingValueStrategy>('Drop Missing');
  const [seed, setSeed] = useState(42);
  const [rawRows, setRawRows] = useState<DataRow[]>([]);
  const [dateCol, setDateCol] = useState<string | null>('Transaction_Date');
  const [activeTab, setActiveTab] = useState<'preview' | 'stats' | 'trends' | 'inspector' | 'deployment'>('inspector');

  // File upload state
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Initialize mock data
  useEffect(() => {
    if (dataSource === 'mock') {
      const mock = generateMockFinancialData(seed);
      setRawRows(mock);
      setDateCol('Transaction_Date');
      setFileError(null);
    }
  }, [dataSource, seed]);

  // Handle custom file upload
  const handleFileUpload = async (file: File) => {
    setIsLoadingFile(true);
    setFileError(null);

    try {
      let parsed: DataRow[] = [];
      if (file.name.endsWith('.csv')) {
        parsed = await parseCsvFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsed = await parseExcelFile(file);
      } else {
        throw new Error('Unsupported file format. Please upload a .csv or .xlsx file.');
      }

      if (parsed.length === 0) {
        throw new Error('File contains no rows.');
      }

      setRawRows(parsed);
      setUploadedFileName(file.name);
      setDataSource('upload');

      // Auto-detect date column
      const detectedDates = detectDateColumns(parsed);
      if (detectedDates.length > 0) {
        setDateCol(detectedDates[0]);
      } else {
        setDateCol(null);
      }
    } catch (err: any) {
      setFileError(err.message || 'Failed to parse file.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleRegenerateMock = () => {
    setSeed(prev => prev + 1);
  };

  // Compute available columns
  const allColumns = useMemo(() => {
    if (rawRows.length === 0) return [];
    return Object.keys(rawRows[0]);
  }, [rawRows]);

  // Clean data pipeline execution
  const { cleanedRows, imputedCells } = useMemo(() => {
    return cleanData(rawRows, dateCol, fillStrategy);
  }, [rawRows, dateCol, fillStrategy]);

  // Missing values analysis on raw data
  const missingSummary = useMemo(() => {
    return getMissingValueSummary(rawRows);
  }, [rawRows]);

  const totalRawMissing = useMemo(() => {
    return missingSummary.reduce((acc, curr) => acc + curr.missingCount, 0);
  }, [missingSummary]);

  // Numeric features detection
  const numericCols = useMemo(() => {
    return detectNumericColumns(cleanedRows);
  }, [cleanedRows]);

  // Descriptive statistics
  const descriptiveStats = useMemo(() => {
    return getDescriptiveStats(cleanedRows);
  }, [cleanedRows]);

  // Correlation matrix
  const correlationMatrix = useMemo(() => {
    return getCorrelationMatrix(cleanedRows);
  }, [cleanedRows]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <header
        id="app-header"
        className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs"
      >
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 leading-none">
                    FinData Insights Engine
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    MVP
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  Enterprise Financial Data Cleansing & Analytics Proof-of-Work
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pipeline: Automated Cleansing Active</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>{rawRows.length.toLocaleString()} Records</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`lg:block ${mobileSidebarOpen ? 'block' : 'hidden'} z-20`}>
          <Sidebar
            dataSource={dataSource}
            setDataSource={setDataSource}
            fillStrategy={fillStrategy}
            setFillStrategy={setFillStrategy}
            columns={allColumns}
            dateCol={dateCol}
            setDateCol={setDateCol}
            onRegenerateMock={handleRegenerateMock}
            onFileUpload={handleFileUpload}
            isLoadingFile={isLoadingFile}
            fileError={fileError}
            uploadedFileName={uploadedFileName}
            mockRowCount={rawRows.length}
            isOpen={mobileSidebarOpen}
            setIsOpen={setMobileSidebarOpen}
          />
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {/* 4 Metric Cards */}
          <MetricCards
            rawCount={rawRows.length}
            cleanedCount={cleanedRows.length}
            missingCount={totalRawMissing}
            numericCount={numericCols.length}
          />

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex items-center space-x-1 sm:space-x-2 -mb-px overflow-x-auto">
              <button
                id="tab-btn-preview"
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'preview'
                    ? 'border-emerald-600 text-emerald-700 bg-white/60 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Table2 className="w-4 h-4" />
                <span>🧹 Data Preview & Cleansing</span>
              </button>

              <button
                id="tab-btn-stats"
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'stats'
                    ? 'border-emerald-600 text-emerald-700 bg-white/60 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>📊 Statistical Profiling</span>
              </button>

              <button
                id="tab-btn-trends"
                type="button"
                onClick={() => setActiveTab('trends')}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'trends'
                    ? 'border-emerald-600 text-emerald-700 bg-white/60 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>📉 Trend & Correlation Engine</span>
              </button>

              <button
                id="tab-btn-inspector"
                type="button"
                onClick={() => setActiveTab('inspector')}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'inspector'
                    ? 'border-emerald-600 text-emerald-700 bg-white/60 rounded-t-lg shadow-2xs font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Code2 className="w-4 h-4 text-emerald-600" />
                <span>🔍 Code Inspector (Multi-Jargon Commentary)</span>
              </button>

              <button
                id="tab-btn-deployment"
                type="button"
                onClick={() => setActiveTab('deployment')}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'deployment'
                    ? 'border-emerald-600 text-emerald-700 bg-white/60 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FolderGit2 className="w-4 h-4 text-emerald-600" />
                <span>🚀 Python & GitHub Deployment</span>
              </button>
            </div>
          </div>

          {/* Tab Content Panels */}
          <div>
            {activeTab === 'preview' && (
              <DataPreviewTab
                rawRows={rawRows}
                cleanedRows={cleanedRows}
                missingSummary={missingSummary}
                imputedCells={imputedCells}
                fillStrategy={fillStrategy}
              />
            )}

            {activeTab === 'stats' && (
              <StatisticalProfilingTab
                cleanedRows={cleanedRows}
                stats={descriptiveStats}
              />
            )}

            {activeTab === 'trends' && (
              <TrendAndCorrelationTab
                cleanedRows={cleanedRows}
                numericCols={numericCols}
                dateCol={dateCol}
                correlationMatrix={correlationMatrix}
              />
            )}

            {activeTab === 'inspector' && (
              <CodeInspectorTab />
            )}

            {activeTab === 'deployment' && (
              <PythonDeploymentTab />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
