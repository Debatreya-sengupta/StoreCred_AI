export interface AssessmentInputs {
  // Required
  interiorImage: string | null;
  counterImage: string | null;
  exteriorImage: string | null;
  locationPincode: string;
  // Optional
  video: string | null;
  shopSizeSqFt: number | '';
  monthlyRent: number | '';
  yearsInOperation: number | '';
  storeType: string;
  ownershipType: string;
}

export interface RiskFlag {
  id: string;
  label: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface FactorContribution {
  name: string;
  score: number;
}

export interface AssessmentResult {
  // Base Scores
  shelfDensity: number; // 0-100
  skuDiversity: number; // 0-100
  inventoryValueScore: number; // 0-100
  refillSignal: number; // 0-100
  storeSizeProxy: number; // 0-100
  catchmentDensity: number; // 0-100
  footfallProxy: number; // 0-100
  competitionDensity: number; // 0-100
  poiAccessScore: number; // 0-100
  roadVisibilityScore: number; // 0-100
  evidenceCoverageScore: number; // 0-100
  confidenceScore: number; // 0-100
  
  // Derived Outputs
  dailySalesRange: [number, number];
  monthlyRevenueRange: [number, number];
  monthlyIncomeRange: [number, number];
  suggestedLoanBand: [number, number];
  safeEmiRange: [number, number];
  
  recommendation: 'Pre-Approve' | 'Needs Verification' | 'Reject';
  peerBenchmarkPercentile: number;
  fraudFlags: RiskFlag[];
  explanationSummary: string;
  creditOfficerNotes: string;
  
  factorContributions: FactorContribution[];
}
