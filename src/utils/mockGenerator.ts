import { DataRow } from '../types';

// Seedable PRNG for reproducibility (Mulberry32)
function createPrng(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for standard Normal distribution
function randomNormal(prng: () => number, mean = 0, std = 1): number {
  let u1 = prng();
  let u2 = prng();
  while (u1 === 0) u1 = prng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * std;
}

// Exponential distribution
function randomExponential(prng: () => number, scale = 1200): number {
  let u = prng();
  while (u === 0 || u === 1) u = prng();
  return -Math.log(1 - u) * scale;
}

// Gamma distribution using Marsaglia and Tsang (2000) method
function randomGamma(prng: () => number, alpha: number, beta = 1): number {
  if (alpha < 1) {
    const u = prng();
    return (randomGamma(prng, alpha + 1, 1) * Math.pow(u, 1 / alpha)) / beta;
  }
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    const z = randomNormal(prng, 0, 1);
    const v = 1 + c * z;
    if (v <= 0) continue;
    const v3 = v * v * v;
    const u = prng();
    if (u < 1 - 0.0331 * z * z * z * z) return (d * v3) / beta;
    if (Math.log(u) < 0.5 * z * z + d * (1 - v3 + Math.log(v3))) return (d * v3) / beta;
  }
}

// Beta distribution from two Gamma distributions: Beta(a, b) = Gamma(a) / (Gamma(a) + Gamma(b))
function randomBeta(prng: () => number, a: number, b: number): number {
  const ga = randomGamma(prng, a, 1);
  const gb = randomGamma(prng, b, 1);
  return ga / (ga + gb);
}

// Weighted choice
function weightedChoice<T>(prng: () => number, items: T[], weights: number[]): T {
  const r = prng();
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += weights[i];
    if (r <= sum) return items[i];
  }
  return items[items.length - 1];
}

export function generateMockFinancialData(seed = 42, customCount?: number): DataRow[] {
  const prng = createPrng(seed);
  
  // Date range from 2024-01-01 to 2026-08-01 (approx 944 days)
  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2026-08-01T00:00:00Z');
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const nRows = customCount ?? totalDays;
  const dates: string[] = [];
  
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    dates.push(d.toISOString().split('T')[0]);
  }

  const transactionTypes = ['Deposit', 'Withdrawal', 'Wire Transfer', 'Loan Repayment', 'Fee'];
  const typeWeights = [0.4, 0.3, 0.1, 0.15, 0.05];

  const riskRatings = ['Low', 'Medium', 'High', 'Critical'];
  const riskWeights = [0.5, 0.3, 0.15, 0.05];

  const accountPool = Array.from({ length: 50 }, (_, idx) => `ACC-${String(100 + idx).padStart(4, '0')}`);

  const rows: DataRow[] = [];

  for (let i = 0; i < nRows; i++) {
    const randomDateIndex = Math.floor(prng() * dates.length);
    const date = dates[randomDateIndex];
    const account = accountPool[Math.floor(prng() * accountPool.length)];
    const txType = weightedChoice(prng, transactionTypes, typeWeights);
    
    // Exponential transaction amount, scale = 1200
    let amount: number | null = Math.round(randomExponential(prng, 1200) * 100) / 100;
    
    // Normal credit score, mean = 700, std = 65, clipped [300, 850]
    let rawScore = Math.round(randomNormal(prng, 700, 65));
    let creditScore: number | null = Math.max(300, Math.min(850, rawScore));

    // Beta(2, 5) debt-to-income ratio
    const dti = Math.round(randomBeta(prng, 2, 5) * 10000) / 10000;

    // Risk rating
    const risk = weightedChoice(prng, riskRatings, riskWeights);

    // Intentionally inject missing values: ~3% for amount, ~2% for score
    if (prng() < 0.03) {
      amount = null;
    }
    if (prng() < 0.02) {
      creditScore = null;
    }

    rows.push({
      Transaction_Date: date,
      Account_ID: account,
      Transaction_Type: txType,
      Transaction_Amount: amount,
      Credit_Score: creditScore,
      Debt_To_Income_Ratio: dti,
      Risk_Rating: risk,
    });
  }

  // Sort chronologically by Transaction_Date
  rows.sort((a, b) => new Date(a.Transaction_Date).getTime() - new Date(b.Transaction_Date).getTime());

  return rows;
}
