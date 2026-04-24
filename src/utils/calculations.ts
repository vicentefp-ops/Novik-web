import { Periodontogram } from '../types';

export function calculateHealthScore(periodontogram: Periodontogram): number {
  if (!periodontogram || !periodontogram.teeth) return 100;

  let totalSites = 0;
  let bleedingSites = 0;
  let plaqueSites = 0;
  let pocketsOver4 = 0;
  let calOver4 = 0;
  let mobilityCount = 0;
  let furcationCount = 0;

  Object.values(periodontogram.teeth).forEach(tooth => {
    if (tooth.missing || tooth.implant) return;

    // Mobility
    if (tooth.mobility && tooth.mobility > 0) mobilityCount++;

    // Furcations
    if (tooth.furcation) {
      Object.values(tooth.furcation).forEach(val => {
        if (val && val > 0) furcationCount++;
      });
    }

    ['buccal', 'lingual'].forEach(surface => {
      const depths = tooth.probingDepth?.[surface as 'buccal' | 'lingual'] || [null, null, null];
      const margins = tooth.gingivalMargin?.[surface as 'buccal' | 'lingual'] || [null, null, null];
      const bleeding = tooth.bleeding?.[surface as 'buccal' | 'lingual'] || [false, false, false];
      const plaque = tooth.plaque?.[surface as 'buccal' | 'lingual'] || [false, false, false];

      for (let i = 0; i < 3; i++) {
        totalSites++; // Count 6 sites per present tooth
        if (depths[i] !== null && depths[i]! >= 4) pocketsOver4++;
        if (bleeding[i]) bleedingSites++;
        if (plaque[i]) plaqueSites++;

        // CAL = Depth + Margin (if margin is positive, it's recession)
        const depth = depths[i] || 0;
        const margin = margins[i] || 0;
        const cal = depth + margin;
        if (cal >= 4) calOver4++;
      }
    });
  });

  if (totalSites === 0) return 100;

  const bopPercentage = (bleedingSites / totalSites) * 100;
  const plaquePercentage = (plaqueSites / totalSites) * 100;
  const pocketsPercentage = (pocketsOver4 / totalSites) * 100;
  const calPercentage = (calOver4 / totalSites) * 100;
  
  let score = 100;
  // Weighting
  score -= (bopPercentage * 0.25); // Inflammation
  score -= (plaquePercentage * 0.15); // Hygiene
  score -= (pocketsPercentage * 0.3); // Infection spaces
  score -= (calPercentage * 0.2); // Support loss
  score -= (mobilityCount * 5); // Mechanical risk (penalty per tooth)
  score -= (furcationCount * 3); // Complexity risk (penalty per site)

  return Math.max(0, Math.round(score));
}
