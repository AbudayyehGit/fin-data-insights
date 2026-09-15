/**
 * FinData Contextual Documentation Engine (Vanilla JS + CSS Injection)
 * Production-ready client-side script for dynamic, hover-activated 4-part tooltips.
 * 
 * Target: https://findata-insights-engine.ai.studio/ & any enterprise financial dashboard.
 */

(function () {
  'use strict';

  // Prevent double-injection
  if (window.__FINDATA_TOOLTIP_ENGINE_INITIALIZED__) {
    console.warn('[FinData Tooltips] Engine is already active on this document.');
    return;
  }
  window.__FINDATA_TOOLTIP_ENGINE_INITIALIZED__ = true;

  /* ==========================================================================
     1. INLINE CSS INJECTION (Theme-Consistent, Accessible, High Contrast)
     ========================================================================== */
  const STYLES = `
    .fd-tooltip-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 360px;
      max-width: calc(100vw - 32px);
      background: #090d16;
      color: #f1f5f9;
      border: 1px solid #1e293b;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
      padding: 14px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      z-index: 999999;
      pointer-events: none;
      opacity: 0;
      transform: translateY(6px) scale(0.98);
      transition: opacity 0.16s cubic-bezier(0.16, 1, 0.3, 1), transform 0.16s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(12px);
      box-sizing: border-box;
      will-change: transform, opacity, top, left;
    }

    .fd-tooltip-container.fd-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .fd-tooltip-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-bottom: 10px;
      margin-bottom: 10px;
      border-bottom: 1px solid #1e293b;
    }

    .fd-tooltip-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.25);
    }

    .fd-tooltip-tag {
      font-size: 10px;
      color: #94a3b8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .fd-tooltip-section {
      margin-bottom: 9px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .fd-tooltip-section:last-child {
      margin-bottom: 0;
    }

    .fd-tooltip-label {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .fd-tooltip-label-what { color: #38bdf8; }       /* Sky Blue */
    .fd-tooltip-label-does { color: #facc15; }       /* Amber Gold */
    .fd-tooltip-label-why  { color: #a78bfa; }       /* Violet Purple */
    .fd-tooltip-label-means{ color: #4ade80; }       /* Emerald Green */

    .fd-tooltip-content {
      color: #cbd5e1;
      font-size: 11.5px;
      line-height: 1.45;
      padding-left: 2px;
    }

    .fd-tooltip-footer {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #64748b;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'findata-tooltip-styles';
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  /* ==========================================================================
     2. TOOLTIP DOM ELEMENT INITIALIZATION
     ========================================================================== */
  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'fd-tooltip-container';
  tooltipEl.setAttribute('role', 'tooltip');
  tooltipEl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tooltipEl);

  /* ==========================================================================
     3. SEMANTIC PATTERNS & CONTEXT INFERENCE ENGINE
     ========================================================================== */
  const PATTERNS = [
    {
      match: (el, text, id, cls) => id.includes('raw') || text.includes('Raw Rows') || text.includes('raw records'),
      what: 'Raw Ingestion Volume Metric',
      does: 'Measures total row cardinality ingested directly from source telemetry or mock generator prior to filtering.',
      why: 'Serves as the unadulterated baseline denominator for pipeline data-loss and completeness audits.',
      means: 'Indicates the gross operational batch size. Sudden declines point to upstream transmission failure or network ingestion drops.'
    },
    {
      match: (el, text, id, cls) => id.includes('cleaned') || text.includes('Cleaned Rows'),
      what: 'Scrubbed Portfolio Dataset Cardinality',
      does: 'Tracks post-pipeline row retention after applying missing value pruning, date sorting, and integrity validations.',
      why: 'Ensures downstream quantitative models only train or score against fully reconciled, non-corrupted observations.',
      means: 'The delta between Raw and Cleaned rows reveals data hygiene leakage; retention above 95% represents high operational ledger quality.'
    },
    {
      match: (el, text, id, cls) => id.includes('missing') || text.includes('Missing Values Cleaned') || text.includes('Missing Cells'),
      what: 'Data Cleansing & Remediation Tally',
      does: 'Aggregates the count of null, NaN, or non-compliant cells detected and imputed/dropped during ETL execution.',
      why: 'Quantifies operational data corruption in upstream core banking ledgers, SWIFT wire logs, or credit applications.',
      means: 'A high count signifies telemetry degradation in legacy feeds, requiring active imputation to prevent systemic model bias.'
    },
    {
      match: (el, text, id, cls) => id.includes('numeric') || text.includes('Numeric Features'),
      what: 'Quantitative Dimension Vector Count',
      does: 'Counts numerical feature vectors (e.g. amounts, DTI ratios, FICO scores) eligible for continuous statistical modeling.',
      why: 'Validates matrix rank and degrees of freedom required for covariance calculations and correlation engines.',
      means: 'Provides financial analysts with the total number of quantifiable risk drivers available for multi-factor regression.'
    },
    {
      match: (el, text, id, cls) => id.includes('strategy') || id.includes('fill') || text.includes('Missing Value Strategy'),
      what: 'Missing Value Imputation Strategy Selector',
      does: 'Allows the user to dynamically toggle between Drop Missing, Impute Mean, or Impute Median pipelines.',
      why: 'Different risk models demand different trade-offs between sample preservation and variance stabilization.',
      means: 'Drop Missing eliminates estimation bias at the expense of sample size; Median Imputation resists outlier skew; Mean preserves the arithmetic sum.'
    },
    {
      match: (el, text, id, cls) => id.includes('data-source') || text.includes('Select Data Source') || text.includes('Mock Dataset'),
      what: 'Telemetry Ingestion Source Switcher',
      does: 'Swaps the input pipeline between synthetic banking micro-transactions and user-provided CSV/Excel ledger files.',
      why: 'Enables instant zero-friction proof-of-concept testing while maintaining production-ready file parsing pipelines.',
      means: 'Switching to Mock data loads 940+ days of synthetic banking transactions with realistic exponential distribution amounts.'
    },
    {
      match: (el, text, id, cls) => id.includes('date-col') || text.includes('Select Date Column') || text.includes('Transaction_Date'),
      what: 'Temporal Index Dimension Selector',
      does: 'Designates the primary datetime timestamp column for chronological sorting and daily trend aggregation.',
      why: 'Financial time-series require strict chronological monotonicity for cumulative cash flow and moving average analysis.',
      means: 'Ensures transaction velocity is plotted across actual calendar timestamps rather than arbitrary index order.'
    },
    {
      match: (el, text, id, cls) => id.includes('tab-btn-preview') || text.includes('Data Preview & Cleansing'),
      what: 'Raw vs. Cleansed Micro-Audit Workspace',
      does: 'Renders side-by-side comparative tabular views highlighting imputed cells, null indicators, and cleaned records.',
      why: 'Satisfies regulatory transparency mandates (Basel III / BCBS 239) by maintaining an auditable data transformation lineage.',
      means: 'Enables risk officers to inspect individual row changes and verify how missing values were imputed before model ingestion.'
    },
    {
      match: (el, text, id, cls) => id.includes('tab-btn-stats') || text.includes('Statistical Profiling'),
      what: 'Descriptive Risk Statistics Profiler',
      does: 'Computes parametric (mean, std, variance) and non-parametric (quantiles, median) metrics across all numerical features.',
      why: 'Surfaces distribution skewness, volatility spikes, and fat-tail risk properties necessary for capital allocation models.',
      means: 'Reveals whether underwriting distributions conform to normal expectations or exhibit high kurtosis and extreme downside tails.'
    },
    {
      match: (el, text, id, cls) => id.includes('tab-btn-trends') || text.includes('Trend & Correlation Engine'),
      what: 'Time-Series & Cross-Feature Correlation Engine',
      does: 'Visualizes daily aggregated volume trajectories alongside an N-by-N Pearson feature correlation matrix heatmap.',
      why: 'Identifies systemic asset co-movements and potential multi-collinearity across underwriting risk indicators.',
      means: 'High positive correlation (near +1.0) indicates mutual risk concentration; negative correlation indicates natural portfolio hedging.'
    },
    {
      match: (el, text, id, cls) => id.includes('tab-btn-inspector') || text.includes('Code Inspector'),
      what: 'Multi-Perspective Code Inspection Engine',
      does: 'Presents production Python code blocks paired with side-by-side commentary in Financial, Corporate, Common, and Engineering dialects.',
      why: 'Bridges comprehension gaps between quantitative analysts, software engineers, and C-suite stakeholders.',
      means: 'Provides transparency into algorithmic mechanics, data engineering architecture, and institutional compliance justifications.'
    },
    {
      match: (el, text, id, cls) => id.includes('tab-btn-deployment') || text.includes('Python & GitHub Deployment'),
      what: 'Continuous Deployment & Repository Gateway',
      does: 'Houses app.py, requirements.txt, and step-by-step GitHub & Streamlit Community Cloud deployment instructions.',
      why: 'Facilitates seamless DevOps handover from local prototype to enterprise production hosting.',
      means: 'Enables 1-click downloads and immediate repository pushing to sync with cloud orchestration platforms.'
    },
    {
      match: (el, text, id, cls) => el.tagName === 'TH' || cls.includes('table-header') || text.includes('Transaction_Amount'),
      what: 'Financial Feature Column Header',
      does: 'Identifies the structural variable definition and data type across tabular transaction logs.',
      why: 'Establishes schema definitions necessary for continuous numeric aggregation, filtering, and indexing.',
      means: 'Clicking or reviewing headers helps trace feature distributions, unit currencies, and percentage scales.'
    },
    {
      match: (el, text, id, cls) => el.tagName === 'BUTTON' && (text.includes('Download') || text.includes('CSV')),
      what: 'Cleaned Dataset Export Trigger',
      does: 'Encodes the cleaned DataFrame into an RFC 4180-compliant CSV blob and triggers client-side browser download.',
      why: 'Allows downstream risk engines, Python notebooks, or BI dashboards (Tableau, PowerBI) to ingest sanitized data.',
      means: 'Provides immediate portability of reconciled records for external auditing or secondary pipeline processing.'
    },
    {
      match: (el, text, id, cls) => el.tagName === 'CANVAS' || el.tagName === 'SVG' || cls.includes('recharts') || cls.includes('chart'),
      what: 'Dynamic Analytical Data Visualization Canvas',
      does: 'Renders high-density vector graphics displaying time-series trajectories or bivariate correlation heatmaps.',
      why: 'Accelerates visual pattern recognition for volatility spikes, anomalies, and cyclical financial patterns.',
      means: 'Allows instant visual detection of cash flow trends, liquidity shocks, or anomalous multi-feature co-movements.'
    },
    {
      match: (el, text, id, cls) => el.tagName === 'SELECT' || el.tagName === 'INPUT' || cls.includes('input') || cls.includes('select'),
      what: 'Interactive Analytical Filter Control',
      does: 'Accepts user input parameters and triggers reactive pipeline re-computation across memory-resident DataFrames.',
      why: 'Empowers exploratory scenario analysis and dynamic sensitivity stress-testing without page reloads.',
      means: 'Adjusting this parameter alters dataset calculations in real time, updating downstream statistics and visualizations.'
    }
  ];

  /* ==========================================================================
     4. HEURISTIC ELEMENT ANALYZER (Inspects DOM tree, attributes, siblings)
     ========================================================================== */
  function analyzeElement(element) {
    if (!element || element === document.body || element === document.documentElement) {
      return null;
    }

    // Traverse upwards up to 3 ancestors to find meaningful semantic wrappers
    let current = element;
    let depth = 0;

    while (current && current !== document.body && depth < 4) {
      const id = (current.id || '').toLowerCase();
      const cls = (typeof current.className === 'string' ? current.className : '').toLowerCase();
      const text = (current.innerText || current.textContent || '').trim().slice(0, 160);
      const ariaLabel = (current.getAttribute('aria-label') || '').toLowerCase();
      const role = (current.getAttribute('role') || '').toLowerCase();
      const title = (current.getAttribute('title') || '').toLowerCase();

      const combinedText = `${text} ${ariaLabel} ${title}`;

      // Check explicit data attributes first
      if (current.dataset && current.dataset.tooltipWhat) {
        return {
          what: current.dataset.tooltipWhat,
          does: current.dataset.tooltipDoes || 'Executes contextual operations on this data point.',
          why: current.dataset.tooltipWhy || 'Enforces analytical precision in financial modeling.',
          means: current.dataset.tooltipMeans || 'Relevant state indicator for portfolio risk evaluation.',
          tag: current.tagName.toLowerCase()
        };
      }

      // Check pattern dictionary
      for (const p of PATTERNS) {
        if (p.match(current, combinedText, id, cls)) {
          return {
            what: p.what,
            does: p.does,
            why: p.why,
            means: p.means,
            tag: current.tagName.toLowerCase() + (current.id ? `#${current.id}` : '')
          };
        }
      }

      // Semantic element fallbacks
      if (current.tagName === 'BUTTON') {
        return {
          what: `Interactive Action Control: "${text.slice(0, 28) || 'Button'}"`,
          does: 'Triggers an event handler that mutates pipeline state, switches views, or executes data downloads.',
          why: 'Provides explicit user agency to manipulate analytical parameters and manage data workflows.',
          means: 'Clicking will immediately apply selected configurations across active dashboard modules.',
          tag: 'button'
        };
      }

      if (current.tagName === 'INPUT' || current.tagName === 'SELECT') {
        return {
          what: `Interactive Parameter Input: [${current.getAttribute('type') || current.tagName.toLowerCase()}]`,
          does: 'Captures dynamic configuration arguments for real-time model evaluation and data filtering.',
          why: 'Enables parametric sensitivity testing without requiring backend reconfiguration.',
          means: 'Directly impacts the calculation engine and downstream visualization representations.',
          tag: current.tagName.toLowerCase()
        };
      }

      current = current.parentElement;
      depth++;
    }

    return null;
  }

  /* ==========================================================================
     5. RENDER TOOLTIP HTML & POSITIONING ENGINE (Boundary-Safe)
     ========================================================================== */
  function renderTooltipContent(data) {
    tooltipEl.innerHTML = `
      <div class="fd-tooltip-header">
        <span class="fd-tooltip-badge">Contextual Intelligence</span>
        <span class="fd-tooltip-tag">${data.tag}</span>
      </div>

      <div class="fd-tooltip-section">
        <div class="fd-tooltip-label fd-tooltip-label-what">
          <span>●</span> 1. What It Is
        </div>
        <div class="fd-tooltip-content">${data.what}</div>
      </div>

      <div class="fd-tooltip-section">
        <div class="fd-tooltip-label fd-tooltip-label-does">
          <span>●</span> 2. What It Does
        </div>
        <div class="fd-tooltip-content">${data.does}</div>
      </div>

      <div class="fd-tooltip-section">
        <div class="fd-tooltip-label fd-tooltip-label-why">
          <span>●</span> 3. Why It Does It
        </div>
        <div class="fd-tooltip-content">${data.why}</div>
      </div>

      <div class="fd-tooltip-section">
        <div class="fd-tooltip-label fd-tooltip-label-means">
          <span>●</span> 4. What It Means
        </div>
        <div class="fd-tooltip-content">${data.means}</div>
      </div>

      <div class="fd-tooltip-footer">
        <span>FinData Insights Engine</span>
        <span>Hover Inspector Active</span>
      </div>
    `;
  }

  let mouseX = 0;
  let mouseY = 0;
  let isVisible = false;
  let currentTarget = null;
  let rafId = null;

  function updateTooltipPosition() {
    if (!isVisible) return;

    const offset = 18;
    const padding = 16;
    const tooltipWidth = tooltipEl.offsetWidth || 360;
    const tooltipHeight = tooltipEl.offsetHeight || 260;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal positioning: default to right of cursor, flip left if overflowing
    let left = mouseX + offset;
    if (left + tooltipWidth + padding > viewportWidth) {
      left = mouseX - tooltipWidth - offset;
    }
    // Clamp to viewport left boundary
    if (left < padding) {
      left = padding;
    }

    // Vertical positioning: default to below cursor, flip above if overflowing
    let top = mouseY + offset;
    if (top + tooltipHeight + padding > viewportHeight) {
      top = mouseY - tooltipHeight - offset;
    }
    // Clamp to viewport top boundary
    if (top < padding) {
      top = padding;
    }

    tooltipEl.style.left = `${Math.round(left)}px`;
    tooltipEl.style.top = `${Math.round(top)}px`;
  }

  function schedulePositionUpdate() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateTooltipPosition);
  }

  /* ==========================================================================
     6. EVENT DELEGATION (High Performance, No UI Lag)
     ========================================================================== */
  document.body.addEventListener('mousemove', function (e) {
    if (!engineActive) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (isVisible) {
      schedulePositionUpdate();
    }
  }, { passive: true });

  let hoverTimeout = null;

  document.body.addEventListener('mouseover', function (e) {
    if (!engineActive) return;
    const target = e.target;
    if (tooltipEl.contains(target) || (toggleBtn && toggleBtn.contains(target))) return;

    // Check if target or parent matches semantic entity
    const analysis = analyzeElement(target);
    if (!analysis) {
      // Gracefully hide if hovering over generic blank areas
      if (isVisible) {
        tooltipEl.classList.remove('fd-visible');
        isVisible = false;
      }
      return;
    }

    // If same element, keep visible
    if (currentTarget === target && isVisible) {
      return;
    }

    currentTarget = target;

    // Debounce slightly to prevent flicker on rapid cursor sweeps
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      if (!engineActive) return;
      renderTooltipContent(analysis);
      tooltipEl.classList.add('fd-visible');
      isVisible = true;
      schedulePositionUpdate();
    }, 40);
  }, { passive: true });

  document.body.addEventListener('mouseout', function (e) {
    const related = e.relatedTarget;
    if (!related || related === document.documentElement || related === document.body) {
      clearTimeout(hoverTimeout);
      tooltipEl.classList.remove('fd-visible');
      isVisible = false;
      currentTarget = null;
    }
  }, { passive: true });

  /* ==========================================================================
     7. FLOATING SYSTEM TOGGLE (Allows user to enable/disable on demand)
     ========================================================================== */
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'fd-tooltip-toggle';
  toggleBtn.innerHTML = `
    <span style="font-size: 13px;">💡</span>
    <span style="font-weight: 600; font-size: 11px;">4-Part Tooltips: <strong style="color: #4ade80;">ON</strong></span>
  `;
  Object.assign(toggleBtn.style, {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: '999998',
    background: '#090d16',
    color: '#e2e8f0',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '7px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transition: 'all 0.2s ease',
  });

  let engineActive = true;
  toggleBtn.addEventListener('click', () => {
    engineActive = !engineActive;
    if (engineActive) {
      toggleBtn.innerHTML = `
        <span style="font-size: 13px;">💡</span>
        <span style="font-weight: 600; font-size: 11px;">4-Part Tooltips: <strong style="color: #4ade80;">ON</strong></span>
      `;
      tooltipEl.style.display = 'block';
    } else {
      toggleBtn.innerHTML = `
        <span style="font-size: 13px;">💡</span>
        <span style="font-weight: 600; font-size: 11px;">4-Part Tooltips: <strong style="color: #94a3b8;">OFF</strong></span>
      `;
      tooltipEl.classList.remove('fd-visible');
      tooltipEl.style.display = 'none';
      isVisible = false;
    }
  });

  document.body.appendChild(toggleBtn);

  console.log('[FinData Tooltips] Injected successfully. Hover over any dashboard element.');
})();
