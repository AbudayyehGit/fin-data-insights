export type MissingValueStrategy = 'Drop Missing' | 'Impute Mean (Numeric)' | 'Impute Median (Numeric)';

export interface DataRow {
  [key: string]: any;
}

export interface DescriptiveStats {
  column: string;
  count: number;
  mean: number;
  std: number;
  median: number;
  variance: number;
  min: number;
  p25: number;
  p50: number;
  p75: number;
  max: number;
}

export interface CorrelationMatrix {
  columns: string[];
  matrix: number[][];
}

export interface MissingValueInfo {
  column: string;
  missingCount: number;
  missingPercentage: number;
  dataType: string;
}

export interface TrendDataPoint {
  date: string;
  timestamp: number;
  value: number;
  count: number;
}
