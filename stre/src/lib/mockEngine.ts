import { AssessmentInputs, AssessmentResult } from './types';
import { calculateScores, calculateEvidenceCoverage } from './scoring';
import { determineFraudFlags } from './fraud';
import { generateExplanationSummary, generateOfficerNotes } from './explanation';

export function runUnderwritingAnalysis(inputs: AssessmentInputs): AssessmentResult {
  const coverage = calculateEvidenceCoverage(inputs);
  const scores = calculateScores(inputs, coverage);
  const fraudFlags = determineFraudFlags(inputs, scores, coverage);

  // Determine Confidence
  let confidenceScore = Math.round(coverage * 0.5 + ((scores.shelfDensity + scores.footfallProxy) / 2) * 0.5);
  fraudFlags.forEach(flag => {
    if (flag.severity === 'high') confidenceScore -= 20;
    if (flag.severity === 'medium') confidenceScore -= 10;
    if (flag.severity === 'low') confidenceScore -= 5;
  });
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  // Determine Recommendation
  let recommendation: AssessmentResult['recommendation'] = 'Needs Verification';
  if (confidenceScore >= 75 && fraudFlags.filter(f => f.severity === 'high').length === 0) {
    recommendation = 'Pre-Approve';
  } else if (confidenceScore < 45 || fraudFlags.filter(f => f.severity === 'high').length >= 2) {
    recommendation = 'Reject';
  }

  // Generate Financial Proxies
  const baseDaily = 1500 + (scores.shelfDensity * 20) + (scores.footfallProxy * 15);
  const dailySalesRange: [number, number] = [Math.round(baseDaily * 0.8), Math.round(baseDaily * 1.2)];
  const monthlyRevenueRange: [number, number] = [dailySalesRange[0] * 28, dailySalesRange[1] * 28];
  const margin = 0.15; // Assume 15% net margin
  const monthlyIncomeRange: [number, number] = [Math.round(monthlyRevenueRange[0] * margin), Math.round(monthlyRevenueRange[1] * margin)];
  
  const suggestedLoanBand: [number, number] = [Math.round(monthlyIncomeRange[0] * 3), Math.round(monthlyIncomeRange[1] * 5)];
  const safeEmiRange: [number, number] = [Math.round(monthlyIncomeRange[0] * 0.2), Math.round(monthlyIncomeRange[1] * 0.4)];

  const explanationSummary = generateExplanationSummary(scores, fraudFlags, recommendation);
  const creditOfficerNotes = generateOfficerNotes(recommendation, fraudFlags);

  const factorContributions = [
    { name: 'Shelf Density', score: scores.shelfDensity },
    { name: 'Location Footfall', score: scores.footfallProxy },
    { name: 'SKU Diversity', score: scores.skuDiversity },
    { name: 'Catchment', score: scores.catchmentDensity },
    { name: 'Evidence Quality', score: coverage },
  ].sort((a, b) => b.score - a.score);

  return {
    ...scores,
    evidenceCoverageScore: coverage,
    confidenceScore,
    dailySalesRange,
    monthlyRevenueRange,
    monthlyIncomeRange,
    suggestedLoanBand,
    safeEmiRange,
    recommendation,
    peerBenchmarkPercentile: Math.round(confidenceScore * 0.9), // Simplified proxy
    fraudFlags,
    explanationSummary,
    creditOfficerNotes,
    factorContributions
  };
}
