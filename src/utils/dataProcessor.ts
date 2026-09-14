import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { CorrelationMatrix, DataRow, DescriptiveStats, MissingValueInfo, MissingValueStrategy, TrendDataPoint } from '../types';

export function isNumeric(val: any): boolean {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && isFinite(num);
}

export function detectNumericColumns(rows: DataRow[]): string[] {
  if (!rows || rows.length === 0) return [];
  const sample = rows.slice(0, 100);
  const allCols = Object.keys(rows[0] || {});

  return allCols.filter(col => {
    let numericCount = 0;
    let nonNullCount = 0;

    for (const row of sample) {
      const val = row[col];
      if (val !== null && val !== undefined && val !== '') {
        nonNullCount++;
        if (isNumeric(val)) numericCount++;
      }
    }
    // If > 70% of non-null values are numeric, consider numeric
    return nonNullCount > 0 && numericCount / nonNullCount > 0.7;
  });
}

export function detectDateColumns(rows: DataRow[]): string[] {
  if (!rows || rows.length === 0) return [];
  const sample = rows.slice(0, 50);
  const allCols = Object.keys(rows[0] || {});

  return allCols.filter(col => {
    // common date naming hint
    const lower = col.toLowerCase();
    if (lower.includes('date') || lower.includes('time') || lower === 'dt') return true;

    let dateCount = 0;
    let nonNullCount = 0;
    for (const row of sample) {
      const val = row[col];
      if (val !== null && val !== undefined && val !== '') {
        nonNullCount++;
        const parsed = Date.parse(String(val));
        if (!isNaN(parsed)) dateCount++;
      }
    }
    return nonNullCount > 0 && dateCount / nonNullCount > 0.8;
  });
}

export function getMissingValueSummary(rows: DataRow[]): MissingValueInfo[] {
  if (!rows || rows.length === 0) return [];
  const columns = Object.keys(rows[0]);
  const total = rows.length;

  return columns.map(col => {
    let missing = 0;
    let hasNum = false;
    let hasStr = false;

    for (const row of rows) {
      const v = row[col];
      if (v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))) {
        missing++;
      } else {
        if (typeof v === 'number') hasNum = true;
        else hasStr = true;
      }
    }

    const dataType = hasNum && !hasStr ? 'Numeric' : hasNum && hasStr ? 'Mixed' : 'Text';

    return {
      column: col,
      missingCount: missing,
      missingPercentage: Math.round((missing / total) * 10000) / 100,
      dataType,
    };
  });
}

export interface CleanResult {
  cleanedRows: DataRow[];
  imputedCellsCount: number;
  droppedRowsCount: number;
  imputedCells: Set<string>; // "rowIndex:column"
}

export function cleanData(
  rows: DataRow[],
  dateCol: string | null = null,
  fillStrategy: MissingValueStrategy = 'Drop Missing'
): CleanResult {
  if (!rows || rows.length === 0) {
    return { cleanedRows: [], imputedCellsCount: 0, droppedRowsCount: 0, imputedCells: new Set() };
  }

  const numericCols = detectNumericColumns(rows);
  const imputedCells = new Set<string>();
  let imputedCount = 0;

  // Clone rows and convert numeric fields to numbers if string
  let workingRows: DataRow[] = rows.map(r => {
    const copy: DataRow = { ...r };
    for (const col of numericCols) {
      if (copy[col] !== null && copy[col] !== undefined && copy[col] !== '') {
        copy[col] = Number(copy[col]);
      }
    }
    return copy;
  });

  if (fillStrategy === 'Drop Missing') {
    workingRows = workingRows.filter(row => {
      for (const key of Object.keys(row)) {
        const v = row[key];
        if (v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))) {
          return false;
        }
      }
      return true;
    });
  } else if (fillStrategy === 'Impute Mean (Numeric)' || fillStrategy === 'Impute Median (Numeric)') {
    // Calculate mean or median for each numeric column
    const imputationValues: Record<string, number> = {};

    for (const col of numericCols) {
      const validNumbers: number[] = [];
      for (const row of workingRows) {
        const v = row[col];
        if (typeof v === 'number' && !isNaN(v) && isFinite(v)) {
          validNumbers.push(v);
        }
      }

      if (validNumbers.length > 0) {
        if (fillStrategy === 'Impute Mean (Numeric)') {
          const sum = validNumbers.reduce((acc, curr) => acc + curr, 0);
          imputationValues[col] = Math.round((sum / validNumbers.length) * 100) / 100;
        } else {
          validNumbers.sort((a, b) => a - b);
          const mid = Math.floor(validNumbers.length / 2);
          const median = validNumbers.length % 2 !== 0
            ? validNumbers[mid]
            : (validNumbers[mid - 1] + validNumbers[mid]) / 2;
          imputationValues[col] = Math.round(median * 100) / 100;
        }
      }
    }

    // Apply imputation
    workingRows = workingRows.map((row, rIdx) => {
      const updated = { ...row };
      for (const col of numericCols) {
        const v = updated[col];
        if (v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))) {
          if (imputationValues[col] !== undefined) {
            updated[col] = imputationValues[col];
            imputedCells.add(`${rIdx}:${col}`);
            imputedCount++;
          }
        }
      }
      return updated;
    });
  }

  // Standardize date formatting
  if (dateCol && rows[0] && dateCol in rows[0]) {
    const validDateRows: DataRow[] = [];
    for (const row of workingRows) {
      const rawDate = row[dateCol];
      if (!rawDate) continue;
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        const iso = parsed.toISOString().split('T')[0];
        validDateRows.push({ ...row, [dateCol]: iso });
      }
    }

    validDateRows.sort((a, b) => {
      const timeA = new Date(a[dateCol]).getTime();
      const timeB = new Date(b[dateCol]).getTime();
      return timeA - timeB;
    });

    workingRows = validDateRows;
  }

  return {
    cleanedRows: workingRows,
    imputedCellsCount: imputedCount,
    droppedRowsCount: rows.length - workingRows.length,
    imputedCells,
  };
}

// Descriptive statistics calculation equivalent to Pandas .describe().T + median + variance
export function getDescriptiveStats(rows: DataRow[]): DescriptiveStats[] {
  if (!rows || rows.length === 0) return [];
  const numericCols = detectNumericColumns(rows);
  if (numericCols.length === 0) return [];

  const results: DescriptiveStats[] = [];

  for (const col of numericCols) {
    const values: number[] = [];
    for (const row of rows) {
      const val = row[col];
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        values.push(val);
      }
    }

    if (values.length === 0) continue;

    values.sort((a, b) => a - b);
    const n = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Sample variance and standard deviation (ddof = 1)
    const variance = n > 1
      ? values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1)
      : 0;
    const std = Math.sqrt(variance);

    // Percentile helper (linear interpolation method like NumPy default)
    const getPercentile = (p: number): number => {
      if (n === 1) return values[0];
      const index = (n - 1) * p;
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return values[lower] * (1 - weight) + values[upper] * weight;
    };

    const min = values[0];
    const max = values[n - 1];
    const p25 = getPercentile(0.25);
    const median = getPercentile(0.50);
    const p75 = getPercentile(0.75);

    results.push({
      column: col,
      count: n,
      mean: Math.round(mean * 100) / 100,
      std: Math.round(std * 100) / 100,
      median: Math.round(median * 100) / 100,
      variance: Math.round(variance * 100) / 100,
      min: Math.round(min * 100) / 100,
      p25: Math.round(p25 * 100) / 100,
      p50: Math.round(median * 100) / 100,
      p75: Math.round(p75 * 100) / 100,
      max: Math.round(max * 100) / 100,
    });
  }

  return results;
}

// Pearson Correlation Matrix
export function getCorrelationMatrix(rows: DataRow[]): CorrelationMatrix | null {
  if (!rows || rows.length === 0) return null;
  const numericCols = detectNumericColumns(rows);
  if (numericCols.length < 2) return null;

  // Extract arrays for each column
  const colData: Record<string, number[]> = {};
  for (const col of numericCols) {
    colData[col] = [];
  }

  for (const row of rows) {
    // only include row if all numeric cols have valid numbers
    let allValid = true;
    for (const col of numericCols) {
      const v = row[col];
      if (typeof v !== 'number' || isNaN(v) || !isFinite(v)) {
        allValid = false;
        break;
      }
    }
    if (allValid) {
      for (const col of numericCols) {
        colData[col].push(row[col]);
      }
    }
  }

  const n = colData[numericCols[0]].length;
  if (n < 2) return null;

  // Means and standard deviations
  const means: Record<string, number> = {};
  const stds: Record<string, number> = {};

  for (const col of numericCols) {
    const vals = colData[col];
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    means[col] = mean;
    const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1);
    stds[col] = Math.sqrt(variance);
  }

  const matrix: number[][] = [];

  for (let i = 0; i < numericCols.length; i++) {
    const rowCorr: number[] = [];
    const colI = numericCols[i];
    const valsI = colData[colI];
    const meanI = means[colI];
    const stdI = stds[colI];

    for (let j = 0; j < numericCols.length; j++) {
      if (i === j) {
        rowCorr.push(1.0);
        continue;
      }
      const colJ = numericCols[j];
      const valsJ = colData[colJ];
      const meanJ = means[colJ];
      const stdJ = stds[colJ];

      if (stdI === 0 || stdJ === 0) {
        rowCorr.push(0);
        continue;
      }

      let cov = 0;
      for (let k = 0; k < n; k++) {
        cov += (valsI[k] - meanI) * (valsJ[k] - meanJ);
      }
      cov /= (n - 1);
      const r = cov / (stdI * stdJ);
      rowCorr.push(Math.round(Math.max(-1, Math.min(1, r)) * 100) / 100);
    }
    matrix.push(rowCorr);
  }

  return {
    columns: numericCols,
    matrix,
  };
}

// Financial Trend Aggregator
export function aggregateTrendData(
  rows: DataRow[],
  dateCol: string,
  valueCol: string,
  aggType: 'sum' | 'mean' = 'sum'
): TrendDataPoint[] {
  const map: Record<string, { sum: number; count: number }> = {};

  for (const row of rows) {
    const dateVal = row[dateCol];
    const numVal = row[valueCol];
    if (!dateVal || typeof numVal !== 'number' || isNaN(numVal)) continue;

    const key = String(dateVal);
    if (!map[key]) {
      map[key] = { sum: 0, count: 0 };
    }
    map[key].sum += numVal;
    map[key].count += 1;
  }

  const dates = Object.keys(map).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return dates.map(date => {
    const { sum, count } = map[date];
    const value = aggType === 'sum' ? sum : sum / count;
    return {
      date,
      timestamp: new Date(date).getTime(),
      value: Math.round(value * 100) / 100,
      count,
    };
  });
}

// Parse CSV file
export function parseCsvFile(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: results => {
        if (results.data && results.data.length > 0) {
          resolve(results.data as DataRow[]);
        } else {
          reject(new Error('Uploaded CSV file appears to be empty.'));
        }
      },
      error: error => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

// Parse Excel file (.xlsx, .xls)
export async function parseExcelFile(file: File): Promise<DataRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('No sheets found in Excel file.');
  }
  const worksheet = workbook.Sheets[firstSheetName];
  const json = XLSX.utils.sheet_to_json(worksheet, { defval: null }) as DataRow[];
  if (!json || json.length === 0) {
    throw new Error('First worksheet in Excel file contains no data.');
  }
  return json;
}

// Export data as CSV
export function exportToCsv(data: DataRow[], filename: string = 'cleaned_financial_data.csv') {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
