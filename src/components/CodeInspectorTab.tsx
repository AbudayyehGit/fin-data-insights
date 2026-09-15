import React, { useState } from 'react';
import {
  Code2,
  FileText,
  Copy,
  Check,
  Download,
  Filter,
  Eye,
  Terminal,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface CodeBlockAnnotation {
  id: string;
  title: string;
  startLine: number;
  endLine: number;
  code: string;
  financialJargon: string;
  corporateJargon: string;
  commonLanguage: string;
  softwareJargon: string;
}

const APP_PY_SECTIONS: CodeBlockAnnotation[] = [
  {
    id: 'imports-config',
    title: '1. Module Dependencies & Page Configuration',
    startLine: 1,
    endLine: 24,
    code: `import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Set page configuration
st.set_page_config(
    page_title="FinData Insights Engine",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Apply Seaborn style
sns.set_theme(style="whitegrid")`,
    financialJargon:
      '🟡 [Financial Jargon]: Bootstraps the quantitative finance stack. Configures an institutional-grade viewport for real-time risk surveillance, capital adequacy monitoring, and multi-asset time-series telemetry.',
    corporateJargon:
      '🔵 [Corporate Jargon]: Establishes a scalable, cloud-native executive command center that drives strategic alignment, maximizes C-suite visibility, and delivers mission-critical KPIs with zero enterprise friction.',
    commonLanguage:
      '🟢 [Common Language]: Loads the basic tools we need (like math helpers and chart makers) and sets up a nice wide website titled "FinData Insights Engine" with a clean white grid background.',
    softwareJargon:
      '🔴 [Software Engineering Jargon]: Imports high-performance vectorized libraries (C-backed NumPy/Pandas runtimes). Initializes the client DOM canvas layout with wide viewport constraints and global Seaborn theme mutations.',
  },
  {
    id: 'mock-generator-def',
    title: '2. Synthetic Banking & Credit Risk Data Generator',
    startLine: 26,
    endLine: 57,
    code: `@st.cache_data
def generate_mock_financial_data():
    """Generates a realistic mock banking transaction and credit risk dataset."""
    np.random.seed(42)
    dates = pd.date_range(start="2024-01-01", end="2026-08-01", freq="D")
    n_rows = len(dates)
    
    transaction_types = ['Deposit', 'Withdrawal', 'Wire Transfer', 'Loan Repayment', 'Fee']
    risk_ratings = ['Low', 'Medium', 'High', 'Critical']
    
    data = {
        'Transaction_Date': np.random.choice(dates, n_rows),
        'Account_ID': np.random.choice([f"ACC-{i:04d}" for i in range(100, 150)], n_rows),
        'Transaction_Type': np.random.choice(transaction_types, n_rows, p=[0.4, 0.3, 0.1, 0.15, 0.05]),
        'Transaction_Amount': np.random.exponential(scale=1200, size=n_rows).round(2),
        'Credit_Score': np.random.normal(loc=700, scale=65, size=n_rows).clip(300, 850).astype(int),
        'Debt_To_Income_Ratio': np.random.beta(a=2, b=5, size=n_rows).round(4),
        'Risk_Rating': np.random.choice(risk_ratings, n_rows, p=[0.5, 0.3, 0.15, 0.05])
    }
    
    df = pd.DataFrame(data)`,
    financialJargon:
      '🟡 [Financial Jargon]: Models retail and institutional liquidity exposure. Synthesizes heavy-tailed transaction amounts (exponential distribution with mean parameter $1,200), FICO-equivalent underwriting scores (Gaussian N(700, 65^2) bounded between 300 and 850), and Basel III Debt-to-Income (DTI) solvency ratios modeled via Beta(2, 5) density to simulate tail default risks.',
    corporateJargon:
      '🔵 [Corporate Jargon]: Architected a plug-and-play proof-of-work asset that simulates a $500M banking pipeline out-of-the-box, moving the needle for investor pitch decks and unblocking core stakeholder buy-in on day zero.',
    commonLanguage:
      '🟢 [Common Language]: Automatically builds fake bank records over a 2.5-year span. It invents account IDs, transaction amounts, credit scores, and risk labels so you have realistic data to play with immediately without uploading a file.',
    softwareJargon:
      '🔴 [Software Engineering Jargon]: Applies `@st.cache_data` for deterministic memoization with O(1) retrieval across Streamlit reactive rerun cycles. Executes vectorized SIMD sampling via NumPy PRNG with seeded reproducibility (seed=42) for zero runtime heap allocation thrashing.',
  },
  {
    id: 'mock-missing-values',
    title: '3. Intentional Data Degradation (Missing Value Injection)',
    startLine: 58,
    endLine: 68,
    code: `    # Intentionally inject missing values to demonstrate automated data cleansing
    mask_amount = np.random.rand(n_rows) < 0.03
    mask_score = np.random.rand(n_rows) < 0.02
    df.loc[mask_amount, 'Transaction_Amount'] = np.nan
    df.loc[mask_score, 'Credit_Score'] = np.nan
    
    return df.sort_values('Transaction_Date').reset_index(drop=True)`,
    financialJargon:
      '🟡 [Financial Jargon]: Injects stochastic telemetry packet loss into ledger inflows (~3% on principal volume, ~2% on counterparty creditworthiness scores) simulating data corruption in legacy SWIFT wire transfers and incomplete underwriting filings.',
    corporateJargon:
      '🔵 [Corporate Jargon]: Pressure-tests operational resiliency against dirty upstream data streams, proactively de-risking downstream audit liabilities and ensuring governance excellence.',
    commonLanguage:
      '🟢 [Common Language]: Randomly removes ~3% of dollar amounts and ~2% of credit scores to test if the cleaning robot actually detects and fixes missing data.',
    softwareJargon:
      '🔴 [Software Engineering Jargon]: Generates boolean bitmasks via uniform pseudorandom thresholds (`< 0.03`). Uses index-based locators (`df.loc`) to assign IEEE 754 `NaN` values in-place, followed by chronological Quicksort sorting and index re-indexing.',
  },
  {
    id: 'file-loader',
    title: '4. Ingestion Adapter (CSV & Excel Loader)',
    startLine: 70,
    endLine: 83,
    code: `def load_uploaded_file(uploaded_file):
    """Loads CSV or Excel files into a Pandas DataFrame."""
    try:
        if uploaded_file.name.endswith('.csv'):
            return pd.read_csv(uploaded_file)
        elif uploaded_file.name.endswith(('.xls', '.xlsx')):
            return pd.read_excel(uploaded_file)
        else:
            return None
    except Exception as e:
        raise ValueError(f"Error parsing file: {e}")`,
    financialJargon:
      '🟡 [Financial Jargon]: Ingests multi-format treasury logs and legacy general ledger extracts (CSV, XLS, XLSX) across clearinghouses, supporting seamless reconciliation audits.',
    corporateJargon:
      '🔵 [Corporate Jargon]: Provides friction-free omnichannel ingestion, breaking down siloed data roadblocks and enabling zero-touch client onboarding across disparate departmental formats.',
    commonLanguage:
      '🟢 [Common Language]: Reads whatever file you upload—whether it is a standard spreadsheet like Excel or a plain comma-separated text file (CSV). If it cannot open it, it tells you what went wrong.',
    softwareJargon:
      '🔴 [Software Engineering Jargon]: Implements an polymorphic file parser factory utilizing MIME-extension sniffing. Wraps low-level C parser bindings (`pd.read_csv`) and OpenPyXL XML AST iterators with defensive try/catch exception propagation.',
  },
  {
    id: 'cleansing-pipeline',
    title: '5. Automated Data Cleansing & Imputation Engine',
    startLine: 85,
    endLine: 114,
    code: `def clean_data(df, date_col=None, fill_strategy="Drop Missing"):
    """
    Automated data cleansing module:
    - Handles missing values based on user strategy.
    - Standardizes date formatting and sorts chronologically if date column provided.
    """
    cleaned_df = df.copy()
    
    # Handle missing values
    if fill_strategy == "Drop Missing":
        cleaned_df = cleaned_df.dropna()
    elif fill_strategy == "Impute Mean (Numeric)":
        numeric_cols = cleaned_df.select_dtypes(include=[np.number]).columns
        cleaned_df[numeric_cols] = cleaned_df[numeric_cols].fillna(cleaned_df[numeric_cols].mean())
    elif fill_strategy == "Impute Median (Numeric)":
        numeric_cols = cleaned_df.select_dtypes(include=[np.number]).columns
        cleaned_df[numeric_cols] = cleaned_df[numeric_cols].fillna(cleaned_df[numeric_cols].median())
        
    # Standardize date formatting
    if date_col and date_col in cleaned_df.columns:
        cleaned_df[date_col] = pd.to_datetime(cleaned_df[date_col], errors='coerce')
        cleaned_df = cleaned_df.dropna(subset=[date_col])
        cleaned_df = cleaned_df.sort_values(by=date_col)
        
    return cleaned_df.reset_index(drop=True)`,
    financialJargon:
      '🟡 [Financial Jargon]: Enforces strict data hygiene to avoid distorted credit valuation adjustments (CVA). Drop strategy protects against bad underwriting decisions, while mean/median imputation maintains portfolio variance without destroying sample size.',
    corporateJargon:
      '🔵 [Corporate Jargon]: A paradigm-shifting automated data-curation pipeline that streamlines back-office ETL, optimizes team bandwidth, and guarantees auditable data integrity.',
    commonLanguage:
      '🟢 [Common Language]: Cleans up messy records. You can choose to throw away rows with missing info, or fill in the blanks using the group average or middle value. It also turns messy dates into a neat timeline.',
    softwareJargon:
      '🔴 [Software Engineering Jargon]: Pure, idempotent functional data pipeline enforcing immutability via deep copy (`df.copy()`). Uses vectorized `.fillna()` with runtime dtype introspection (`select_dtypes`), and enforces chronological monotonicity via datetime coercion.',
  },
  {
    id: 'descriptive-stats',
    title: '6. Numerical Statistical Profiling Engine',
    startLine: 116,
    endLine: 132,
    code: `def get_descriptive_stats(df):
    """Generates numerical summary statistics using Pandas and NumPy."""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        return None
    
    stats = numeric_df.describe().T
    stats['median'] = numeric_df.median()
    stats['variance'] = numeric_df.var()
    
    cols = ['count', 'mean', 'std', 'median', 'variance', 'min', '25%', '50%', '75%', 'max']
    return stats[[c for c in cols if c in stats.columns]]`,
    financialJargon:
      '🟡 [Financial Jargon]: Generates parametric and non-parametric risk profiles. Mean and standard deviation benchmark annualized volatility and Sharpe ratio baselines, while the 25th-to-75th percentile spread (IQR) captures non-normal credit kurtosis and downside tail exposure.',
    corporateJargon:
      '🔵 [Corporate Jargon]: Delivers high-impact quantitative analytics to surface 30,000-foot enterprise trends and empower C-level stakeholders to make data-backed strategic pivots.',
    commonLanguage:
      '🟢 [Common Language]: Calculates the math stats for every number column: how many records there are, the average, the standard deviation (how spread out they are), the middle number, the lowest, and the highest.',
    softwareJargon:
      '🔴 [Software Engineering Jargon]: Matrix transposition (`.T`) on five-number summary vectors. Computes sample variance with Bessel correction (ddof=1) and linear interpolation quantiles across contiguous memory buffers in O(M * N log N) time.',
  },
  {
    id: 'visualizers',
    title: '7. Time-Series Trend & Pearson Correlation Heatmap Visualizers',
    startLine: 134,
    endLine: 167,
    code: `def plot_financial_trend(df, date_col, value_col):
    """Creates a time-series line plot for financial trends."""
    fig, ax = plt.subplots(figsize=(10, 5))
    agg_df = df.groupby(date_col)[value_col].sum().reset_index()
    ax.plot(agg_df[date_col], agg_df[value_col], color='#1f77b4', linewidth=1.5, marker='o', markersize=2)
    ax.set_title(f"Financial Trend: Total {value_col} over Time", fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel("Timeline", fontsize=11)
    ax.set_ylabel(f"Sum of {value_col}", fontsize=11)
    plt.xticks(rotation=45)
    plt.tight_layout()
    return fig

def plot_correlation_heatmap(df):
    """Generates a correlation matrix heatmap for numeric columns."""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 2:
        return None
    fig, ax = plt.subplots(figsize=(8, 6))
    corr = numeric_df.corr()
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", cbar=True, ax=ax, linewidths=0.5)
    ax.set_title("Feature Correlation Matrix", fontsize=14, fontweight='bold', pad=15)
    plt.tight_layout()
    return fig`,
    financialJargon:
      '🟡 [Financial Jargon]: Plots daily aggregated transaction liquidity velocity and evaluates systemic multi-collinearity. The Pearson correlation matrix reveals hedging relationships and asset co-movements across underwriting metrics.',
    corporateJargon:
      '🔵 [Corporate Jargon]: Translates complex raw data into intuitive visual artifacts that tell a compelling strategic narrative, breaking down complex analytics for boardroom presentations.',
    commonLanguage:
      '🟢 [Common Language]: Draws two charts: a line graph showing how daily totals change over the calendar, and a color-coded grid (heatmap) showing which numbers go up or down together.',
    softwareJargon:
      '🔴 [Software Engineering Jargon]: Aggregates time-series via hash-based GroupBy before rendering onto Matplotlib Figure canvases. Computes N-by-N symmetric Pearson correlation matrix with coolwarm colormapping and scalar cell annotations.',
  },
  {
    id: 'streamlit-ui-orchestration',
    title: '8. Streamlit Main Interface, Ingestion Controls & Tab Navigation',
    startLine: 169,
    endLine: 247,
    code: `def main():
    st.title("📈 FinData Insights Engine")
    st.markdown("### Enterprise Financial Data Cleansing & Analytics Proof-of-Work MVP")
    
    # Sidebar Configuration
    st.sidebar.header("Data Source & Pipeline")
    data_source = st.sidebar.radio("Select Data Source", ["Use Built-in Mock Dataset", "Upload Custom File"])
    
    # ... Ingestion, Cleansing & Metric Overview Cards ...
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Raw Rows", len(raw_df))
    col2.metric("Cleaned Rows", len(cleaned_df))
    col3.metric("Missing Values Cleaned", int(raw_df.isnull().sum().sum()))
    col4.metric("Numeric Features", len(cleaned_df.select_dtypes(include=[np.number]).columns))
    
    # Tabs Layout
    tab1, tab2, tab3 = st.tabs(["🧹 Data Preview & Cleansing", "📊 Statistical Profiling", "📉 Trend & Correlation Engine"])
    
    # ... Render tabs with dataframes, stats & plots ...`,
    financialJargon:
      '🟡 [Financial Jargon]: Delivers front-office treasury analysts and credit committees instant operational telemetry: raw vs. scrubbed row counts, missing cell recovery ratios, and interactive risk exposure tabs.',
    corporateJargon:
      '🔵 [Corporate Jargon]: Unifies mission-critical workflows into a cohesive single-pane-of-glass interface, driving end-user adoption and maximizing quarterly return on investment (ROI).',
    commonLanguage:
      '🟢 [Common Language]: Puts together the actual website: adds a sidebar to upload files or pick fake data, shows 4 big scorecards at the top, and gives you 3 clickable tabs to inspect, profile, and graph the data.',
    softwareJargon:
      '🔴 [Software Engineering Jargon]: Streamlit reactive execution loop. Organizes layout into responsive CSS grid columns (`st.columns`), stateful sidebar inputs, and DOM tab containers (`st.tabs`) with conditional dataframe rendering.',
  },
];

const REQUIREMENTS_ANNOTATION = {
  title: 'Dependency Manifest (requirements.txt)',
  code: `streamlit==1.38.0
pandas==2.2.0
numpy==1.26.4
matplotlib==3.8.3
seaborn==0.13.2
openpyxl==3.1.2`,
  financialJargon:
    '🟡 [Financial Jargon]: The foundational quantitative toolchain trusted across tier-1 investment banks, hedge funds, and ratings agencies for deterministic risk management and regulatory capital reporting.',
  corporateJargon:
    '🔵 [Corporate Jargon]: Enterprise-grade open-source software stack delivering immediate synergy, robust security compliance, and zero vendor lock-in.',
  commonLanguage:
    '🟢 [Common Language]: The simple shopping list of Python packages required to run this app: Streamlit for the web page, Pandas/NumPy for calculations, Matplotlib/Seaborn for charts, and openpyxl for Excel files.',
  softwareJargon:
    '🔴 [Software Engineering Jargon]: Strictly pinned semantic dependency matrix (`==`) guaranteeing deterministic reproducible build artifacts, eliminating transient package drift, and ensuring hermetic container deployment.',
};

export const CodeInspectorTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'app.py' | 'requirements.txt'>('app.py');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Filter toggles for the 4 jargons
  const [showFinancial, setShowFinancial] = useState(true);
  const [showCorporate, setShowCorporate] = useState(true);
  const [showCommon, setShowCommon] = useState(true);
  const [showSoftware, setShowSoftware] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const filteredSections = APP_PY_SECTIONS.filter(section => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(q) ||
      section.code.toLowerCase().includes(q) ||
      section.financialJargon.toLowerCase().includes(q) ||
      section.corporateJargon.toLowerCase().includes(q) ||
      section.commonLanguage.toLowerCase().includes(q) ||
      section.softwareJargon.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Interactive Legend */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-900 text-white rounded-lg">
                <Code2 className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Multi-Perspective Code Inspector
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deep-dive line-by-line inspection of <code className="text-slate-800 font-mono bg-slate-100 px-1 py-0.5 rounded">app.py</code> and <code className="text-slate-800 font-mono bg-slate-100 px-1 py-0.5 rounded">requirements.txt</code> with dedicated commentary across 4 specialized dialect viewpoints.
            </p>
          </div>

          {/* File Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setSelectedFile('app.py')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition ${
                selectedFile === 'app.py'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>app.py (Streamlit Engine)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFile('requirements.txt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition ${
                selectedFile === 'requirements.txt'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>requirements.txt</span>
            </button>
          </div>
        </div>

        {/* 4-Jargon Interactive Toggle Legend */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Jargon Commentary Filter Toggles</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Toggle perspectives to customize your inspection view
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Financial Jargon (Gold) */}
            <button
              type="button"
              onClick={() => setShowFinancial(!showFinancial)}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                showFinancial
                  ? 'bg-amber-500/10 border-amber-400 text-amber-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shadow-xs" />
                <span className="text-amber-700">Financial Jargon</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-amber-800 bg-amber-200/50 px-1.5 py-0.5 rounded">
                Gold Font
              </span>
            </button>

            {/* Corporate Jargon (Blue) */}
            <button
              type="button"
              onClick={() => setShowCorporate(!showCorporate)}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                showCorporate
                  ? 'bg-blue-500/10 border-blue-400 text-blue-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-xs" />
                <span className="text-blue-700">Corporate Jargon</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-blue-800 bg-blue-200/50 px-1.5 py-0.5 rounded">
                Blue Font
              </span>
            </button>

            {/* Common Language (Green) */}
            <button
              type="button"
              onClick={() => setShowCommon(!showCommon)}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                showCommon
                  ? 'bg-emerald-500/10 border-emerald-400 text-emerald-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                <span className="text-emerald-700">Common Language</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-800 bg-emerald-200/50 px-1.5 py-0.5 rounded">
                Green Font
              </span>
            </button>

            {/* Software Engineering Jargon (Red) */}
            <button
              type="button"
              onClick={() => setShowSoftware(!showSoftware)}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                showSoftware
                  ? 'bg-rose-500/10 border-rose-400 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
                <span className="text-rose-700">Software Jargon</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-rose-800 bg-rose-200/50 px-1.5 py-0.5 rounded">
                Red Font
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Inspection Body */}
      {selectedFile === 'app.py' ? (
        <div className="space-y-6">
          {/* Quick search input */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">
              Inspecting <strong className="text-slate-900">app.py</strong> — {filteredSections.length} logical modules
            </div>
            <input
              type="text"
              placeholder="Search code or jargon terms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="px-3 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
            />
          </div>

          {/* Render Sections */}
          {filteredSections.map(section => (
            <div
              key={section.id}
              className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-md transition-all hover:border-slate-700"
            >
              {/* Section Header */}
              <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100">
                    {section.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Lines {section.startLine}–{section.endLine}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(section.id, section.code)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                >
                  {copiedSection === section.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Block</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet (Strictly White font on pure Black background) */}
              <div className="bg-black p-4 border-b border-slate-800 overflow-x-auto">
                <pre className="font-mono text-xs text-white leading-relaxed whitespace-pre selection:bg-slate-800">
                  {section.code}
                </pre>
              </div>

              {/* Multi-Jargon Commentary Container */}
              <div className="p-4 bg-slate-950 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cross-Disciplinary Analytical Commentary</span>
                </div>

                {/* Financial Jargon in Gold Font */}
                {showFinancial && (
                  <div
                    style={{ color: '#fbbf24' }} // Bright Gold Font
                    className="p-3 rounded-lg bg-amber-950/20 border border-amber-600/30 text-xs leading-relaxed font-sans"
                  >
                    {section.financialJargon}
                  </div>
                )}

                {/* Corporate Jargon in Blue Font */}
                {showCorporate && (
                  <div
                    style={{ color: '#60a5fa' }} // Vibrant Blue Font
                    className="p-3 rounded-lg bg-blue-950/20 border border-blue-600/30 text-xs leading-relaxed font-sans"
                  >
                    {section.corporateJargon}
                  </div>
                )}

                {/* Common Language in Green Font */}
                {showCommon && (
                  <div
                    style={{ color: '#4ade80' }} // Clean Green Font
                    className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-600/30 text-xs leading-relaxed font-sans"
                  >
                    {section.commonLanguage}
                  </div>
                )}

                {/* Software Engineering Jargon in Red Font */}
                {showSoftware && (
                  <div
                    style={{ color: '#f87171' }} // Striking Red Font
                    className="p-3 rounded-lg bg-rose-950/20 border border-rose-600/30 text-xs leading-relaxed font-sans"
                  >
                    {section.softwareJargon}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No code sections matched your search term "{searchQuery}".
            </div>
          )}
        </div>
      ) : (
        /* Requirements.txt Inspection */
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-md">
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <h4 className="text-sm font-semibold text-slate-100">
                {REQUIREMENTS_ANNOTATION.title}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => handleCopyCode('req', REQUIREMENTS_ANNOTATION.code)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
            >
              {copiedSection === 'req' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy requirements.txt</span>
                </>
              )}
            </button>
          </div>

          {/* Code in White on Black */}
          <div className="bg-black p-5 border-b border-slate-800 overflow-x-auto">
            <pre className="font-mono text-xs text-white leading-relaxed">
              {REQUIREMENTS_ANNOTATION.code}
            </pre>
          </div>

          {/* Commentary */}
          <div className="p-5 bg-slate-950 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-Jargon Dependency Breakdown</span>
            </div>

            {showFinancial && (
              <div
                style={{ color: '#fbbf24' }} // Gold
                className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-600/30 text-xs leading-relaxed"
              >
                {REQUIREMENTS_ANNOTATION.financialJargon}
              </div>
            )}

            {showCorporate && (
              <div
                style={{ color: '#60a5fa' }} // Blue
                className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-600/30 text-xs leading-relaxed"
              >
                {REQUIREMENTS_ANNOTATION.corporateJargon}
              </div>
            )}

            {showCommon && (
              <div
                style={{ color: '#4ade80' }} // Green
                className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-600/30 text-xs leading-relaxed"
              >
                {REQUIREMENTS_ANNOTATION.commonLanguage}
              </div>
            )}

            {showSoftware && (
              <div
                style={{ color: '#f87171' }} // Red
                className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-600/30 text-xs leading-relaxed"
              >
                {REQUIREMENTS_ANNOTATION.softwareJargon}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
