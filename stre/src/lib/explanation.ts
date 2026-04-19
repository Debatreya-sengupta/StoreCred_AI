import { AssessmentResult, RiskFlag } from './types';

export function generateExplanationSummary(
  scores: any,
  flags: RiskFlag[],
  recommendation: string
): string {
  let summary = "";

  if (scores.shelfDensity > 75 && scores.skuDiversity > 70) {
    summary += "Dense shelf utilization and broad SKU variety suggest active inventory rotation and stronger throughput potential. ";
  } else if (scores.shelfDensity > 50) {
    summary += "Moderate inventory levels indicate stable but constrained business throughput. ";
  } else {
    summary += "Sparse inventory limits the proxy estimate for working capital and sales volume. ";
  }

  if (scores.footfallProxy > 70) {
    summary += "Location signals indicate healthy local demand and neighborhood traffic. ";
  } else {
    summary += "Location signals suggest fair but limited neighborhood demand. ";
  }

  if (flags.length > 0) {
    const highSeverityFlags = flags.filter(f => f.severity === 'high');
    if (highSeverityFlags.length > 0) {
      summary += `Confidence is significantly reduced due to: ${highSeverityFlags.map(f => f.label).join(', ')}. `;
    } else {
      summary += "Some risk flags were detected, moderating overall confidence. ";
    }
  }

  if (recommendation === 'Pre-Approve') {
    summary += "Overall, the visual and geo signals align strongly with standard risk parameters, supporting automated progression.";
  } else if (recommendation === 'Needs Verification') {
    summary += "The assessment indicates a viable small-format store, but evidence coverage or contradictions require manual verification.";
  } else {
    summary += "Key inconsistencies or lack of evidence prevent automated approval at this stage.";
  }

  return summary;
}

export function generateOfficerNotes(recommendation: string, flags: RiskFlag[]): string {
  if (recommendation === 'Pre-Approve') {
    return "Signals are strong. Recommended for fast-track processing.";
  }
  
  if (recommendation === 'Needs Verification') {
    let notes = "Manual review required. ";
    if (flags.some(f => f.id === 'F3')) notes += "Verify storefront exterior. ";
    if (flags.some(f => f.id === 'F2')) notes += "Check for artificially high inventory vs actual footfall. ";
    return notes;
  }

  return "Application flagged for rejection due to weak proxy signals or high contradictions.";
}
