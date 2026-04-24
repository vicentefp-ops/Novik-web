import { Periodontogram, ToothData } from '../types';

export interface NormalizedSite {
  periodontogramId: string;
  patientId: string;
  userId: string;
  date: string;
  visitType: string;
  tooth: number;
  arch: 'upper' | 'lower';
  surfaceSide: 'buccal' | 'lingual';
  sitePosition: 'distal' | 'mid' | 'mesial';
  siteCode: string;
  probingDepth: number | null;
  gingivalMargin: number | null;
  clinicalAttachmentLoss: number | null;
  bleeding: boolean;
  suppuration: boolean;
  plaque: boolean;
  furcation: number | null;
  mobility: number | null;
  recession: number | null;
  implant: boolean;
  hasData: boolean;
  hasPocketOver4mm: boolean;
  hasPocketOver6mm: boolean;
}

const POSITIONS = ['distal', 'mid', 'mesial'] as const;

function getArch(tooth: number): 'upper' | 'lower' {
  // FDI: 11-28, 51-65 are upper. 31-48, 71-85 are lower.
  // ADA: 1-16 are upper. 17-32 are lower.
  if ((tooth >= 11 && tooth <= 28) || (tooth >= 51 && tooth <= 65) || (tooth >= 1 && tooth <= 16)) {
    return 'upper';
  }
  return 'lower';
}

function getSiteCode(surface: 'buccal' | 'lingual', position: 'distal' | 'mid' | 'mesial'): string {
  const surfaceInitial = surface === 'buccal' ? 'B' : 'L';
  if (position === 'distal') return `D${surfaceInitial}`;
  if (position === 'mesial') return `M${surfaceInitial}`;
  return surfaceInitial; // 'B' or 'L'
}

export function normalizePeriodontogram(periodontogram: Periodontogram): NormalizedSite[] {
  const sites: NormalizedSite[] = [];
  const { id, patientId, userId, date, teeth, visitType } = periodontogram;
  const actualVisitType = visitType || 'baseline'; // Default to baseline if not set

  if (!teeth) return sites;

  Object.values(teeth).forEach((toothData: ToothData) => {
    const tooth = toothData.toothNumber;
    const arch = getArch(tooth);
    const implant = toothData.implant || false;
    const mobility = toothData.mobility;

    (['buccal', 'lingual'] as const).forEach(surface => {
      POSITIONS.forEach((position, index) => {
        const pd = toothData.probingDepth?.[surface]?.[index] ?? null;
        const gm = toothData.gingivalMargin?.[surface]?.[index] ?? null;
        const bop = toothData.bleeding?.[surface]?.[index] ?? false;
        const sup = toothData.suppuration?.[surface]?.[index] ?? false;
        const plq = toothData.plaque?.[surface]?.[index] ?? false;
        
        // Furcation is per surface, not per site, but we can assign it to the mid site or all sites.
        // Usually, buccal furcation is on the buccal mid site.
        let furcation: number | null = null;
        if (surface === 'buccal' && position === 'mid') {
          furcation = toothData.furcation?.buccal ?? null;
        } else if (surface === 'lingual' && position === 'mid') {
          furcation = toothData.furcation?.lingual ?? null;
        } else if (position === 'mesial') {
          furcation = toothData.furcation?.mesial ?? null;
        } else if (position === 'distal') {
          furcation = toothData.furcation?.distal ?? null;
        }

        const cal = (pd !== null && gm !== null) ? pd + gm : null;
        const hasData = pd !== null || gm !== null || bop || sup || plq || furcation !== null || mobility !== null;

        if (hasData || toothData.missing) {
          sites.push({
            periodontogramId: id,
            patientId,
            userId,
            date,
            visitType: actualVisitType,
            tooth,
            arch,
            surfaceSide: surface,
            sitePosition: position,
            siteCode: getSiteCode(surface, position),
            probingDepth: pd,
            gingivalMargin: gm,
            clinicalAttachmentLoss: cal,
            bleeding: bop,
            suppuration: sup,
            plaque: plq,
            furcation,
            mobility,
            recession: gm !== null && gm > 0 ? gm : null,
            implant,
            hasData: !toothData.missing && hasData,
            hasPocketOver4mm: pd !== null && pd >= 4,
            hasPocketOver6mm: pd !== null && pd >= 6,
          });
        }
      });
    });
  });

  return sites;
}
