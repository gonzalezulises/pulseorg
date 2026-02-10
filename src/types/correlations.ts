// Correlations Types

export interface Dimension {
  code: string;
  name: string;
  short: string;
  internal_code?: string;
}

export interface BusinessIndicator {
  code: string;
  name: string;
  unit: string;
  optimal_direction: "higher" | "lower";
}

export interface MonthlyBusinessData {
  month: string;
  rotation: number;
  absenteeism: number;
  productivity: number;
  nps: number;
}

export interface DimensionBusinessCorrelation {
  dimension: string;
  rotation: number;
  absenteeism: number;
  productivity: number;
  nps: number;
}

export interface BusinessIndicators {
  indicators: BusinessIndicator[];
  monthly_data: MonthlyBusinessData[];
  correlations_with_dimensions: DimensionBusinessCorrelation[];
}

export interface EngagementDriver {
  dimension: string;
  name: string;
  correlation: number;
  impact_rank: number;
}

export interface DimensionScores {
  dimension: string;
  scores: number[];
}

export interface ScatterData {
  dimension_scores: DimensionScores[];
  months: string[];
}

export interface CorrelationInsight {
  dim1: string;
  dim2: string;
  correlation: number;
  interpretation: string;
}

export interface TopDriverInsight {
  dimension: string;
  name: string;
  correlation: number;
  message: string;
}

export interface BusinessImpactInsight {
  dimension: string;
  correlation: number;
  message: string;
}

export interface Insights {
  top_driver: TopDriverInsight;
  strongest_correlations: CorrelationInsight[];
  business_impact: {
    highest_rotation_impact: BusinessImpactInsight;
    highest_productivity_impact: BusinessImpactInsight;
  };
}

export interface DetailedCorrelation {
  dim1: string;
  dim2: string;
  dim1_name: string;
  dim2_name: string;
  r: number;
  adjusted_r: number;
  partial_r: number;
  spearman: number;
  p_value: number;
  r_squared: number;
  ci_lower: number;
  ci_upper: number;
  effect_size: string;
  n: number;
  is_significant: boolean;
  nonlinear?: {
    is_nonlinear: boolean;
    curvature: number;
    optimal_transform: string;
    linear_r2?: number;
    quadratic_r2?: number;
  };
  segments?: {
    by_year: Record<string, { r: number; n: number; significant: boolean }>;
    by_area: Record<string, { r: number; n: number; significant: boolean }>;
  };
}

export interface CorrelationsData {
  generated_at: string;
  dimensions: Dimension[];
  correlation_matrix: number[][];
  business_indicators: BusinessIndicators;
  engagement_drivers: EngagementDriver[];
  scatter_data: ScatterData;
  insights: Insights;
  detailed_correlations?: DetailedCorrelation[];
}

// Correlation color utilities
export function getCorrelationColor(value: number): string {
  // Red (negative) to White (neutral) to Green (positive)
  if (value >= 0.7) return "#15803d"; // green-700
  if (value >= 0.5) return "#22c55e"; // green-500
  if (value >= 0.3) return "#86efac"; // green-300
  if (value >= 0.1) return "#dcfce7"; // green-100
  if (value >= -0.1) return "#f5f5f5"; // neutral
  if (value >= -0.3) return "#fecaca"; // red-200
  if (value >= -0.5) return "#f87171"; // red-400
  if (value >= -0.7) return "#ef4444"; // red-500
  return "#dc2626"; // red-600
}

export function getCorrelationTextColor(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 0.5) return "#ffffff";
  return "#1f2937"; // gray-800
}

export function getCorrelationLabel(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 0.7) return "Muy fuerte";
  if (absValue >= 0.5) return "Fuerte";
  if (absValue >= 0.3) return "Moderada";
  if (absValue >= 0.1) return "Débil";
  return "Muy débil";
}

export function getCorrelationDirection(value: number): string {
  if (value > 0.1) return "positiva";
  if (value < -0.1) return "negativa";
  return "sin correlación";
}

// =====================================================
// ROBUST STATISTICAL MODEL
// =====================================================

// Extended statistics result interface
export interface CorrelationStatistics {
  // Basic correlation
  pearsonR: number;
  spearmanRho: number;

  // Sample info
  n: number;
  degreesOfFreedom: number;

  // Significance testing
  tStatistic: number;
  pValue: number;
  isSignificant: boolean; // at α = 0.05
  significanceLevel: "p<0.001" | "p<0.01" | "p<0.05" | "p≥0.05";

  // Confidence interval for r (Fisher's z-transformation)
  confidenceInterval: {
    lower: number;
    upper: number;
    level: number; // 0.95 for 95% CI
  };

  // Effect size
  effectSize: "negligible" | "small" | "medium" | "large";
  cohenD: number;
}

export interface RegressionStatistics {
  // Basic regression
  slope: number;
  intercept: number;
  rSquared: number;
  adjustedRSquared: number;

  // Standard errors
  standardErrorEstimate: number; // SEE - residual standard error
  standardErrorSlope: number;
  standardErrorIntercept: number;

  // Significance of slope
  tStatisticSlope: number;
  pValueSlope: number;
  slopeSignificant: boolean;

  // Confidence intervals for parameters
  slopeCI: { lower: number; upper: number };
  interceptCI: { lower: number; upper: number };

  // Model fit
  fStatistic: number;
  pValueModel: number;

  // Prediction intervals at mean of X
  predictionInterval: {
    lower: number;
    upper: number;
    atX: number;
  };

  // Equation
  equation: string;
}

export interface FullStatisticalAnalysis {
  correlation: CorrelationStatistics;
  regression: RegressionStatistics;
  warnings: string[];
}

// =====================================================
// STATISTICAL HELPER FUNCTIONS
// =====================================================

// T-distribution critical values (two-tailed, α = 0.05)
// For small samples, we need these. For n > 30, use 1.96
function getTCritical(df: number, alpha: number = 0.05): number {
  // Common critical values for two-tailed tests
  const tTable: Record<number, number> = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
    16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
    25: 2.060, 30: 2.042, 40: 2.021, 60: 2.000, 120: 1.980
  };

  if (df <= 0) return 1.96;
  if (tTable[df]) return tTable[df];
  if (df > 120) return 1.96;

  // Linear interpolation for missing values
  const keys = Object.keys(tTable).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (df > keys[i] && df < keys[i + 1]) {
      const t1 = tTable[keys[i]];
      const t2 = tTable[keys[i + 1]];
      return t1 + (t2 - t1) * (df - keys[i]) / (keys[i + 1] - keys[i]);
    }
  }
  return 1.96;
}

// Approximate p-value from t-statistic using Student's t-distribution
// Uses the approximation for the cumulative distribution function
function tDistributionPValue(t: number, df: number): number {
  if (df <= 0) return 1;

  const absT = Math.abs(t);

  // For very large df, use normal approximation
  if (df > 100) {
    // Standard normal CDF approximation
    const x = absT;
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    const tVal = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * tVal + a4) * tVal) + a3) * tVal + a2) * tVal + a1) * tVal * Math.exp(-absX * absX / 2);
    const cdf = 0.5 * (1.0 + sign * y);
    return 2 * (1 - cdf); // two-tailed
  }

  // Beta function approximation for t-distribution
  const x = df / (df + absT * absT);

  // Incomplete beta function approximation (simplified)
  // I_x(a,b) where a = df/2, b = 0.5
  const a = df / 2;
  const b = 0.5;

  // Use series expansion for incomplete beta
  let betaInc = 0;
  let term = 1;
  for (let k = 0; k < 100; k++) {
    if (k > 0) {
      term *= (a + k - 1) * x / k;
    }
    const addition = term / (a + k);
    betaInc += addition;
    if (Math.abs(addition) < 1e-10) break;
  }

  betaInc *= Math.pow(x, a) * Math.pow(1 - x, b);

  // Normalize using beta function B(a,b)
  const logBeta = gammaLn(a) + gammaLn(b) - gammaLn(a + b);
  const Ix = betaInc / Math.exp(logBeta);

  // Two-tailed p-value
  return Math.min(1, Math.max(0, Ix));
}

// Log gamma function (Stirling's approximation)
function gammaLn(x: number): number {
  if (x <= 0) return 0;
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    ser += c[j] / ++y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

// Fisher's z-transformation for correlation CI
function fisherZ(r: number): number {
  // Clamp to avoid infinity
  const clampedR = Math.max(-0.9999, Math.min(0.9999, r));
  return 0.5 * Math.log((1 + clampedR) / (1 - clampedR));
}

function inverseFisherZ(z: number): number {
  return (Math.exp(2 * z) - 1) / (Math.exp(2 * z) + 1);
}

// Spearman rank correlation
function calculateSpearmanRho(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n < 2) return 0;

  // Get ranks
  const rankX = getRanks(x);
  const rankY = getRanks(y);

  // Calculate Pearson on ranks
  return calculatePearsonR(rankX, rankY);
}

function getRanks(arr: number[]): number[] {
  const sorted = arr.map((val, idx) => ({ val, idx }))
    .sort((a, b) => a.val - b.val);

  const ranks = new Array(arr.length);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    // Find ties
    while (j < sorted.length && sorted[j].val === sorted[i].val) {
      j++;
    }
    // Average rank for ties
    const avgRank = (i + j + 1) / 2;
    for (let k = i; k < j; k++) {
      ranks[sorted[k].idx] = avgRank;
    }
    i = j;
  }
  return ranks;
}

// Basic Pearson calculation (internal use)
function calculatePearsonR(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  return numerator / denominator;
}

// Cohen's d effect size
function calculateCohenD(r: number): number {
  // Convert r to d: d = 2r / sqrt(1 - r²)
  const rSquared = r * r;
  if (rSquared >= 1) return r > 0 ? Infinity : -Infinity;
  return (2 * r) / Math.sqrt(1 - rSquared);
}

function getEffectSize(r: number): "negligible" | "small" | "medium" | "large" {
  const absR = Math.abs(r);
  if (absR < 0.1) return "negligible";
  if (absR < 0.3) return "small";
  if (absR < 0.5) return "medium";
  return "large";
}

function getSignificanceLevel(pValue: number): "p<0.001" | "p<0.01" | "p<0.05" | "p≥0.05" {
  if (pValue < 0.001) return "p<0.001";
  if (pValue < 0.01) return "p<0.01";
  if (pValue < 0.05) return "p<0.05";
  return "p≥0.05";
}

// =====================================================
// MAIN STATISTICAL FUNCTIONS (EXPORTED)
// =====================================================

// Pearson correlation calculation (simple version for backward compatibility)
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  return calculatePearsonR(x, y);
}

// Full correlation statistics
export function calculateCorrelationStatistics(x: number[], y: number[]): CorrelationStatistics {
  const n = x.length;
  const df = n - 2;

  // Pearson r
  const pearsonR = calculatePearsonR(x, y);

  // Spearman rho
  const spearmanRho = calculateSpearmanRho(x, y);

  // T-statistic for correlation significance
  // t = r * sqrt(n-2) / sqrt(1 - r²)
  const rSquared = pearsonR * pearsonR;
  const tStatistic = df > 0 && rSquared < 1
    ? pearsonR * Math.sqrt(df) / Math.sqrt(1 - rSquared)
    : 0;

  // P-value (two-tailed)
  const pValue = df > 0 ? tDistributionPValue(tStatistic, df) : 1;

  // Confidence interval using Fisher's z-transformation
  const z = fisherZ(pearsonR);
  const se = n > 3 ? 1 / Math.sqrt(n - 3) : 1;
  const zCritical = 1.96; // 95% CI
  const zLower = z - zCritical * se;
  const zUpper = z + zCritical * se;

  // Cohen's d
  const cohenD = calculateCohenD(pearsonR);

  return {
    pearsonR,
    spearmanRho,
    n,
    degreesOfFreedom: df,
    tStatistic,
    pValue,
    isSignificant: pValue < 0.05,
    significanceLevel: getSignificanceLevel(pValue),
    confidenceInterval: {
      lower: inverseFisherZ(zLower),
      upper: inverseFisherZ(zUpper),
      level: 0.95
    },
    effectSize: getEffectSize(pearsonR),
    cohenD
  };
}

// Linear regression (simple version for backward compatibility)
export function calculateLinearRegression(x: number[], y: number[]): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const stats = calculateRegressionStatistics(x, y);
  return {
    slope: stats.slope,
    intercept: stats.intercept,
    rSquared: stats.rSquared
  };
}

// Full regression statistics
export function calculateRegressionStatistics(x: number[], y: number[]): RegressionStatistics {
  const n = x.length;
  const df = n - 2;

  if (n !== y.length || n < 3) {
    return getEmptyRegressionStats();
  }

  // Means
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  // Sums of squares
  let ssXX = 0, ssYY = 0, ssXY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    ssXX += dx * dx;
    ssYY += dy * dy;
    ssXY += dx * dy;
  }

  // Slope and intercept
  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = meanY - slope * meanX;

  // Predictions and residuals
  const predictions = x.map(xi => slope * xi + intercept);
  const residuals = y.map((yi, i) => yi - predictions[i]);

  // Sum of squared residuals (SSE)
  const sse = residuals.reduce((sum, r) => sum + r * r, 0);

  // Sum of squared regression (SSR)
  const ssr = predictions.reduce((sum, pred) => sum + Math.pow(pred - meanY, 2), 0);

  // Total sum of squares (SST)
  const sst = ssYY;

  // R² and adjusted R²
  const rSquared = sst !== 0 ? 1 - sse / sst : 0;
  const adjustedRSquared = n > 2 ? 1 - (1 - rSquared) * (n - 1) / (n - 2) : rSquared;

  // Standard error of estimate (residual standard error)
  const standardErrorEstimate = df > 0 ? Math.sqrt(sse / df) : 0;

  // Standard error of slope
  const standardErrorSlope = ssXX > 0 && df > 0
    ? standardErrorEstimate / Math.sqrt(ssXX)
    : 0;

  // Standard error of intercept
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const standardErrorIntercept = df > 0 && ssXX > 0
    ? standardErrorEstimate * Math.sqrt(sumX2 / (n * ssXX))
    : 0;

  // T-statistic for slope
  const tStatisticSlope = standardErrorSlope !== 0 ? slope / standardErrorSlope : 0;
  const pValueSlope = df > 0 ? tDistributionPValue(tStatisticSlope, df) : 1;

  // Critical t-value for CI
  const tCritical = getTCritical(df);

  // Confidence intervals for parameters
  const slopeCI = {
    lower: slope - tCritical * standardErrorSlope,
    upper: slope + tCritical * standardErrorSlope
  };

  const interceptCI = {
    lower: intercept - tCritical * standardErrorIntercept,
    upper: intercept + tCritical * standardErrorIntercept
  };

  // F-statistic for model
  const msr = ssr; // df for regression = 1
  const mse = df > 0 ? sse / df : 1;
  const fStatistic = mse !== 0 ? msr / mse : 0;

  // P-value for F (using t² = F relationship for simple regression)
  const pValueModel = pValueSlope;

  // Prediction interval at mean of X
  const sePrediction = standardErrorEstimate * Math.sqrt(1 + 1/n);
  const predAtMean = slope * meanX + intercept;
  const predictionInterval = {
    lower: predAtMean - tCritical * sePrediction,
    upper: predAtMean + tCritical * sePrediction,
    atX: meanX
  };

  // Format equation
  const slopeStr = slope >= 0 ? slope.toFixed(3) : `(${slope.toFixed(3)})`;
  const interceptStr = intercept >= 0 ? `+ ${intercept.toFixed(3)}` : `- ${Math.abs(intercept).toFixed(3)}`;
  const equation = `y = ${slopeStr}x ${interceptStr}`;

  return {
    slope,
    intercept,
    rSquared,
    adjustedRSquared,
    standardErrorEstimate,
    standardErrorSlope,
    standardErrorIntercept,
    tStatisticSlope,
    pValueSlope,
    slopeSignificant: pValueSlope < 0.05,
    slopeCI,
    interceptCI,
    fStatistic,
    pValueModel,
    predictionInterval,
    equation
  };
}

function getEmptyRegressionStats(): RegressionStatistics {
  return {
    slope: 0,
    intercept: 0,
    rSquared: 0,
    adjustedRSquared: 0,
    standardErrorEstimate: 0,
    standardErrorSlope: 0,
    standardErrorIntercept: 0,
    tStatisticSlope: 0,
    pValueSlope: 1,
    slopeSignificant: false,
    slopeCI: { lower: 0, upper: 0 },
    interceptCI: { lower: 0, upper: 0 },
    fStatistic: 0,
    pValueModel: 1,
    predictionInterval: { lower: 0, upper: 0, atX: 0 },
    equation: "y = 0x + 0"
  };
}

// Full statistical analysis combining correlation and regression
export function calculateFullStatistics(x: number[], y: number[]): FullStatisticalAnalysis {
  const correlation = calculateCorrelationStatistics(x, y);
  const regression = calculateRegressionStatistics(x, y);

  const warnings: string[] = [];

  // Add warnings for potential issues
  if (x.length < 10) {
    warnings.push(`Muestra pequeña (n=${x.length}). Interpretar con precaución.`);
  }

  if (x.length < 5) {
    warnings.push("Muestra muy pequeña. Resultados estadísticos poco confiables.");
  }

  if (!correlation.isSignificant) {
    warnings.push("La correlación no es estadísticamente significativa (p ≥ 0.05).");
  }

  if (Math.abs(correlation.spearmanRho - correlation.pearsonR) > 0.15) {
    warnings.push("Diferencia notable entre Pearson y Spearman. Posible relación no lineal.");
  }

  return { correlation, regression, warnings };
}

// Generate prediction bands for scatter plot
export function generatePredictionBands(
  x: number[],
  regression: RegressionStatistics,
  numPoints: number = 50
): { x: number; predicted: number; upperCI: number; lowerCI: number; upperPI: number; lowerPI: number }[] {
  if (x.length < 3) return [];

  const n = x.length;
  const df = n - 2;
  const tCritical = getTCritical(df);

  const xMin = Math.min(...x);
  const xMax = Math.max(...x);
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const ssXX = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);

  const step = (xMax - xMin) / (numPoints - 1);
  const bands: { x: number; predicted: number; upperCI: number; lowerCI: number; upperPI: number; lowerPI: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const xi = xMin + i * step;
    const predicted = regression.slope * xi + regression.intercept;

    // Standard error for confidence interval (mean response)
    const seCI = regression.standardErrorEstimate * Math.sqrt(1/n + Math.pow(xi - meanX, 2) / ssXX);

    // Standard error for prediction interval (individual response)
    const sePI = regression.standardErrorEstimate * Math.sqrt(1 + 1/n + Math.pow(xi - meanX, 2) / ssXX);

    bands.push({
      x: xi,
      predicted,
      upperCI: predicted + tCritical * seCI,
      lowerCI: predicted - tCritical * seCI,
      upperPI: predicted + tCritical * sePI,
      lowerPI: predicted - tCritical * sePI
    });
  }

  return bands;
}
