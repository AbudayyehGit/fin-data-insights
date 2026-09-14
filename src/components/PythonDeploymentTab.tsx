import React, { useState } from 'react';
import {
  Code2,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Github,
  Server,
  FolderGit2,
} from 'lucide-react';

const APP_PY_CONTENT = `"""
FinData Insights Engine - Enterprise Financial Data Cleansing & Analytics MVP
Production-ready Streamlit application.
"""

import streamlit as st
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
sns.set_theme(style="whitegrid")

# ==========================================
# MOCK DATA GENERATOR
# ==========================================
@st.cache_data
def generate_mock_financial_data(seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic mock banking transaction and credit risk dataset.
    Simulates:
      - Transaction dates spanning 2024-01-01 to 2026-08-01
      - Dynamic account identifiers
      - Weighted transaction types
      - Exponential transaction amounts (scale=1200)
      - Normally distributed credit scores (mean=700, std=65, clipped [300, 850])
      - Beta-distributed debt-to-income ratios (a=2, b=5)
      - Weighted risk ratings
      - Injected missing values to validate cleansing pipelines
    """
    np.random.seed(seed)
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

    df = pd.DataFrame(data)

    # Intentionally inject missing values to demonstrate automated data cleansing
    mask_amount = np.random.rand(n_rows) < 0.03
    mask_score = np.random.rand(n_rows) < 0.02
    df.loc[mask_amount, 'Transaction_Amount'] = np.nan
    df.loc[mask_score, 'Credit_Score'] = np.nan

    return df.sort_values('Transaction_Date').reset_index(drop=True)

# ==========================================
# DATA PROCESSOR UTILITIES
# ==========================================
def load_uploaded_file(uploaded_file):
    """Loads CSV or Excel files into a Pandas DataFrame."""
    try:
        if uploaded_file.name.endswith('.csv'):
            return pd.read_csv(uploaded_file)
        elif uploaded_file.name.endswith(('.xls', '.xlsx')):
            return pd.read_excel(uploaded_file)
        else:
            return None
    except Exception as e:
        raise ValueError(f"Error parsing file: {e}")

def clean_data(df: pd.DataFrame, date_col: str = None, fill_strategy: str = "Drop Missing") -> pd.DataFrame:
    """
    Automated data cleansing module:
    - Handles missing values based on user strategy (Drop, Impute Mean, Impute Median).
    - Standardizes date formatting and sorts chronologically if date column provided.
    """
    cleaned_df = df.copy()

    # Handle missing values
    if fill_strategy == "Drop Missing":
        cleaned_df = cleaned_df.dropna()
    elif fill_strategy == "Impute Mean (Numeric)":
        numeric_cols = cleaned_df.select_dtypes(include=[np.number]).columns
        cleaned_df[numeric_cols] = cleaned_df[numeric_cols].fillna(cleaned_df[numeric_cols].mean().round(2))
    elif fill_strategy == "Impute Median (Numeric)":
        numeric_cols = cleaned_df.select_dtypes(include=[np.number]).columns
        cleaned_df[numeric_cols] = cleaned_df[numeric_cols].fillna(cleaned_df[numeric_cols].median().round(2))

    # Standardize date formatting
    if date_col and date_col in cleaned_df.columns:
        cleaned_df[date_col] = pd.to_datetime(cleaned_df[date_col], errors='coerce')
        cleaned_df = cleaned_df.dropna(subset=[date_col])
        cleaned_df = cleaned_df.sort_values(by=date_col)

    return cleaned_df.reset_index(drop=True)

def get_descriptive_stats(df: pd.DataFrame) -> pd.DataFrame:
    """Generates numerical summary statistics using Pandas and NumPy."""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        return None

    stats = numeric_df.describe().T
    stats['median'] = numeric_df.median()
    stats['variance'] = numeric_df.var()

    cols = ['count', 'mean', 'std', 'median', 'variance', 'min', '25%', '50%', '75%', 'max']
    return stats[[c for c in cols if c in stats.columns]]

# ==========================================
# VISUALIZER UTILITIES
# ==========================================
def plot_financial_trend(df: pd.DataFrame, date_col: str, value_col: str):
    """Creates a time-series line plot for financial trends."""
    fig, ax = plt.subplots(figsize=(10, 5))

    # Aggregate by date if multiple records exist per day
    agg_df = df.groupby(date_col)[value_col].sum().reset_index()

    ax.plot(agg_df[date_col], agg_df[value_col], color='#10b981', linewidth=1.5, marker='o', markersize=2)
    ax.set_title(f"Financial Trend: Total {value_col} over Time", fontsize=13, fontweight='bold', pad=15)
    ax.set_xlabel("Timeline", fontsize=11)
    ax.set_ylabel(f"Sum of {value_col}", fontsize=11)
    ax.grid(True, linestyle='--', alpha=0.5)
    plt.xticks(rotation=45)
    plt.tight_layout()
    return fig

def plot_correlation_heatmap(df: pd.DataFrame):
    """Generates a correlation matrix heatmap for numeric columns."""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 2:
        return None

    fig, ax = plt.subplots(figsize=(8, 6))
    corr = numeric_df.corr()
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", cbar=True, ax=ax, linewidths=0.5)
    ax.set_title("Feature Correlation Matrix", fontsize=13, fontweight='bold', pad=15)
    plt.tight_layout()
    return fig

# ==========================================
# MAIN APPLICATION INTERFACE
# ==========================================
def main():
    st.title("📈 FinData Insights Engine")
    st.markdown("### Enterprise Financial Data Cleansing & Analytics Proof-of-Work MVP")

    # Sidebar Configuration
    st.sidebar.header("Data Source & Pipeline")
    data_source = st.sidebar.radio("Select Data Source", ["Use Built-in Mock Dataset", "Upload Custom File"])

    raw_df = None
    if data_source == "Use Built-in Mock Dataset":
        raw_df = generate_mock_financial_data()
        st.sidebar.success("Loaded Mock Banking & Credit Dataset.")
    else:
        uploaded_file = st.sidebar.file_uploader("Upload CSV or Excel", type=["csv", "xlsx"])
        if uploaded_file is not None:
            try:
                raw_df = load_uploaded_file(uploaded_file)
                st.sidebar.success("Custom file loaded successfully!")
            except Exception as e:
                st.sidebar.error(f"{e}")

    if raw_df is not None:
        # Cleansing Control Panel
        st.sidebar.subheader("Cleansing Configuration")
        fill_strategy = st.sidebar.selectbox(
            "Missing Value Strategy",
            ["Drop Missing", "Impute Mean (Numeric)", "Impute Median (Numeric)"]
        )

        columns = list(raw_df.columns)
        default_date_idx = columns.index('Transaction_Date') if 'Transaction_Date' in columns else 0
        date_col = st.sidebar.selectbox("Select Date Column", [None] + columns, index=default_date_idx + 1 if default_date_idx >= 0 else 0)

        # Execute Pipeline
        cleaned_df = clean_data(raw_df, date_col=date_col if date_col else None, fill_strategy=fill_strategy)

        # Metric Overview Cards
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Raw Rows", f"{len(raw_df):,}")
        col2.metric("Cleaned Rows", f"{len(cleaned_df):,}")
        col3.metric("Missing Values Cleaned", int(raw_df.isnull().sum().sum()))
        numeric_count = len(cleaned_df.select_dtypes(include=[np.number]).columns)
        col4.metric("Numeric Features", numeric_count)

        st.markdown("---")

        # Tabs Layout
        tab1, tab2, tab3 = st.tabs(["🧹 Data Preview & Cleansing", "📊 Statistical Profiling", "📉 Trend & Correlation Engine"])

        with tab1:
            st.subheader("Dataset Inspection")
            sub_col1, sub_col2 = st.columns(2)
            with sub_col1:
                st.markdown("**Raw Data Sample**")
                st.dataframe(raw_df.head(10), use_container_width=True)
            with sub_col2:
                st.markdown("**Cleaned Data Sample**")
                st.dataframe(cleaned_df.head(10), use_container_width=True)

            # Export Cleaned Data
            st.markdown("---")
            csv_data = cleaned_df.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Download Cleaned Dataset (CSV)",
                data=csv_data,
                file_name="cleaned_financial_data.csv",
                mime="text/csv"
            )

        with tab2:
            st.subheader("Descriptive Statistical Summary (NumPy & Pandas)")
            stats_df = get_descriptive_stats(cleaned_df)
            if stats_df is not None:
                st.dataframe(stats_df.style.format("{:.2f}"), use_container_width=True)
            else:
                st.warning("No numeric columns available for statistical profiling.")

        with tab3:
            st.subheader("Financial Trend Visualization")
            numeric_cols = list(cleaned_df.select_dtypes(include=[np.number]).columns)

            if date_col and numeric_cols:
                val_col = st.selectbox("Select Financial Metric for Trend Line", numeric_cols)
                fig_trend = plot_financial_trend(cleaned_df, date_col, val_col)
                st.pyplot(fig_trend)
            else:
                st.info("Please specify a valid date column in the sidebar to render time-series trend analysis.")

            if len(numeric_cols) >= 2:
                st.markdown("---")
                st.subheader("Feature Correlation Heatmap")
                fig_corr = plot_correlation_heatmap(cleaned_df)
                if fig_corr:
                    st.pyplot(fig_corr)
    else:
        st.info("👈 Please choose a built-in mock dataset or upload a file via the sidebar to initialize the engine.")

if __name__ == '__main__':
    main()
`;

const REQUIREMENTS_TXT = `streamlit==1.38.0
pandas==2.2.0
numpy==1.26.4
matplotlib==3.8.3
seaborn==0.13.2
openpyxl==3.1.2
`;

export const PythonDeploymentTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'app.py' | 'requirements.txt' | 'git'>('app.py');
  const [copied, setCopied] = useState(false);

  const currentContent = selectedFile === 'app.py' ? APP_PY_CONTENT : selectedFile === 'requirements.txt' ? REQUIREMENTS_TXT : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                <FolderGit2 className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Python Streamlit & GitHub Repository Deployment
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              The project repository has been initialized with <code className="text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.5 rounded">app.py</code> and <code className="text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.5 rounded">requirements.txt</code> ready for direct deployment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload('app.py', APP_PY_CONTENT)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download app.py</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownload('requirements.txt', REQUIREMENTS_TXT)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download requirements.txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* File Selector & Code Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Repository Files
          </div>
          <button
            type="button"
            onClick={() => setSelectedFile('app.py')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition ${
              selectedFile === 'app.py'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1 truncate">
              <div>app.py</div>
              <div className="text-[10px] text-slate-400 font-normal">Streamlit entrypoint (220+ lines)</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFile('requirements.txt')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition ${
              selectedFile === 'requirements.txt'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="flex-1 truncate">
              <div>requirements.txt</div>
              <div className="text-[10px] text-slate-400 font-normal">Pandas, NumPy, Seaborn, openpyxl</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFile('git')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition ${
              selectedFile === 'git'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4 text-slate-700 shrink-0" />
            <div className="flex-1 truncate">
              <div>GitHub & Deployment Guide</div>
              <div className="text-[10px] text-slate-400 font-normal">Git commands & Streamlit Cloud</div>
            </div>
          </button>

          {/* Quick Info Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1 mt-4">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Git Repository Ready</span>
            </div>
            <p>Branch: <strong className="font-mono text-slate-700">main</strong></p>
            <p>Remote Target: <strong className="font-mono text-slate-700">FinData-Insights-Engine</strong></p>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col">
          {selectedFile === 'git' ? (
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Github className="w-5 h-5 text-slate-900" />
                  <span>Syncing with GitHub & Streamlit Community Cloud</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Follow these steps to connect your initialized repository to GitHub and launch on Streamlit Community Cloud.
                </p>
              </div>

              {/* Step 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Create a new repository on GitHub named 'FinData-Insights-Engine'</span>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
                  git remote add origin https://github.com/&lt;your-username&gt;/FinData-Insights-Engine.git<br />
                  git branch -M main<br />
                  git push -u origin main
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Local Python Execution</span>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-200 overflow-x-auto">
                  <span className="text-slate-400"># 1. Create and activate virtualenv</span><br />
                  python3 -m venv venv<br />
                  source venv/bin/activate  <span className="text-slate-500"># or venv\Scripts\activate on Windows</span><br /><br />
                  <span className="text-slate-400"># 2. Install dependencies</span><br />
                  pip install -r requirements.txt<br /><br />
                  <span className="text-slate-400"># 3. Launch Streamlit</span><br />
                  streamlit run app.py
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Deploy to Streamlit Community Cloud</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1 leading-relaxed">
                  <p>1. Go to <strong className="underline">share.streamlit.io</strong>.</p>
                  <p>2. Choose repository: <strong className="font-mono">FinData-Insights-Engine</strong>.</p>
                  <p>3. Set Main file path: <strong className="font-mono">app.py</strong>.</p>
                  <p>4. Click <strong>Deploy!</strong> — Your application runs instantly with mock data generator and file upload capabilities.</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-700 font-semibold">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{selectedFile}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded transition shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedFile, currentContent)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <div className="bg-slate-950 p-4 overflow-auto max-h-[550px] font-mono text-xs leading-relaxed text-slate-200">
                <pre>{currentContent}</pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
