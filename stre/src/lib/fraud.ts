import { AssessmentInputs, RiskFlag } from './types';

export function determineFraudFlags(
  inputs: AssessmentInputs,
  scores: any,
  coverage: number
): RiskFlag[] {
  const flags: RiskFlag[] = [];

  if (coverage < 50) {
    flags.push({
      id: 'F1',
      label: 'Limited Evidence Coverage',
      severity: 'high',
      description: 'Insufficient evidence provided for a confident underwriting assessment.'
    });
  }

  if (scores.inventoryValueScore > 80 && scores.footfallProxy < 40) {
    flags.push({
      id: 'F2',
      label: 'Inventory-Footfall Mismatch',
      severity: 'medium',
      description: 'High inventory levels observed despite weak local footfall indicators.'
    });
  }

  if (!inputs.exteriorImage && inputs.interiorImage) {
    flags.push({
      id: 'F3',
      label: 'Weak Exterior Context',
      severity: 'medium',
      description: 'Missing storefront image limits confidence in location and access proxy.'
    });
  }

  if (scores.shelfDensity > 90 && scores.skuDiversity < 30) {
    flags.push({
      id: 'F4',
      label: 'Possible Staged Stocking',
      severity: 'low',
      description: 'High density but very low variety may indicate staged inventory.'
    });
  }

  return flags;
}
