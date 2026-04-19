import { AssessmentInputs } from './types';

// Simple seeded random to keep variations bounded but slightly different per run
let seed = 1234;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randRange(min: number, max: number) {
  return min + random() * (max - min);
}

export function calculateEvidenceCoverage(inputs: AssessmentInputs): number {
  let score = 0;
  if (inputs.interiorImage) score += 25;
  if (inputs.counterImage) score += 20;
  if (inputs.exteriorImage) score += 25;
  if (inputs.locationPincode) score += 15;
  if (inputs.video) score += 5;
  if (inputs.shopSizeSqFt) score += 5;
  if (inputs.monthlyRent) score += 5;
  return score;
}

export function calculateScores(inputs: AssessmentInputs, coverage: number) {
  // Use inputs and coverage to deterministically derive scores
  // but add some variation to make it feel real.
  
  // Re-seed based on pincode or simple fixed string if empty
  seed = inputs.locationPincode ? inputs.locationPincode.charCodeAt(0) + (inputs.shopSizeSqFt as number || 100) : 1234;

  const baseMultiplier = coverage / 100;

  return {
    shelfDensity: Math.round(randRange(60, 95) * (inputs.interiorImage ? 1 : 0.4)),
    skuDiversity: Math.round(randRange(50, 90) * (inputs.interiorImage ? 1 : 0.5)),
    inventoryValueScore: Math.round(randRange(40, 85) * (inputs.interiorImage ? 1 : 0.3)),
    refillSignal: Math.round(randRange(30, 80)),
    storeSizeProxy: Math.round(randRange(50, 100)),
    
    catchmentDensity: Math.round(randRange(60, 95) * (inputs.locationPincode ? 1 : 0.6)),
    footfallProxy: Math.round(randRange(50, 95) * (inputs.exteriorImage ? 1 : 0.5)),
    competitionDensity: Math.round(randRange(40, 90)),
    poiAccessScore: Math.round(randRange(50, 95)),
    roadVisibilityScore: Math.round(randRange(50, 100) * (inputs.exteriorImage ? 1 : 0.3)),
  };
}
