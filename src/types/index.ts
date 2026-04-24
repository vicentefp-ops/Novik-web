export type ToothNumberingSystem = 'FDI' | 'ADA';

export interface ToothData {
  toothNumber: number;
  missing: boolean;
  implant: boolean;
  mobility: number | null; // 0, 1, 2, 3
  furcation: {
    buccal: number | null;
    lingual: number | null;
    mesial: number | null;
    distal: number | null;
  };
  probingDepth: {
    buccal: [number | null, number | null, number | null]; // distal, mid, mesial
    lingual: [number | null, number | null, number | null];
  };
  gingivalMargin: {
    buccal: [number | null, number | null, number | null];
    lingual: [number | null, number | null, number | null];
  };
  bleeding: {
    buccal: [boolean, boolean, boolean];
    lingual: [boolean, boolean, boolean];
  };
  plaque: {
    buccal: [boolean, boolean, boolean];
    lingual: [boolean, boolean, boolean];
  };
  suppuration: {
    buccal: [boolean, boolean, boolean];
    lingual: [boolean, boolean, boolean];
  };
}

export interface Periodontogram {
  id: string;
  patientId: string;
  userId: string;
  date: string;
  visitType?: 'baseline' | 'maintenance' | 'reevaluation' | 'followup';
  teeth: Record<number, ToothData>;
  notes: string;
  report?: any;
  savedReports?: { id: string; date: string; title: string; content: string; }[];
  classification?: string;
  checkIn?: {
    smokingStatus: 'non-smoker' | 'smoker' | 'ex-smoker';
    cigarettesPerDay?: string;
    diabetesControlled?: 'yes' | 'no' | 'unknown';
    hypertensionControlled?: 'yes' | 'no' | 'unknown';
    brushingFrequency: '1' | '2' | '3+';
    interdentalHygiene: 'none' | 'floss' | 'brushes' | 'both';
    usesIrrigator: boolean;
    bleedingGums: 'never' | 'sometimes' | 'frequently';
    noticesMobility: boolean;
    lastProfessionalCleaning: '0-3-months' | '3-6-months' | '6-12-months' | '12-18-months' | '18+-months';
  };
  langDiagram?: {
    bop: number;
    pockets: number;
    toothLoss: number;
    blAge: number;
    systemic: string;
    smoking: string;
  };
  idra?: {
    history: string;
    bop: number;
    pd: number;
    blAge: number;
    susceptibility: string;
    spt: string;
    distance: string;
    prosthesis: string;
  };
}

export interface Patient {
  id: string;
  userId: string;
  clinicalRecord: string;
  ageRange: string;
  email?: string;
  notes?: string;
  createdAt: string;
  
  // New Big Data Fields
  biologicalSex?: 'male' | 'female' | 'other';
  country?: string;
  region?: string;
  educationLevel?: 'basic' | 'medium' | 'university';
  
  riskFactors?: {
    smokingStatus: 'non-smoker' | 'smoker' | 'ex-smoker';
    cigarettesPerDay?: string; // e.g., "1-5", "5-10", "10-20", "20+"
    diabetes: boolean;
    diabetesControlled?: 'yes' | 'no' | 'unknown';
    hypertension: boolean;
    hypertensionControlled?: 'yes' | 'no' | 'unknown';
  };
  
  hygieneHabits?: {
    brushType: 'manual' | 'electric';
    usesFloss: boolean;
    usesIrrigator: boolean;
    brushingFrequency: '1' | '2' | '3+';
    lastProfessionalCleaning: '0-3-months' | '3-6-months' | '6-12-months' | '12-18-months' | '18+-months';
  };
  
  perception?: {
    bleedingGums: 'never' | 'sometimes' | 'frequently';
    noticesMobility: boolean;
    believesHasPeriodontalDisease: 'yes' | 'no' | 'unknown';
  };
  savedReports?: { id: string; date: string; title: string; content: string; }[];
}

export interface ClinicInfo {
  country: string;
  region: string;
  type: 'independent' | 'franchise' | 'hospital' | 'university';
  chairs: '1-2' | '3-5' | '6-10' | '10+';
  professionals: '1' | '2-3' | '4-6' | '6+';
  protocol: 'yes' | 'no' | 'partial';
  email: string;
}

export interface UserSettings {
  language: 'es' | 'en';
  numberingSystem: ToothNumberingSystem;
  voiceLanguage: string;
  clinicInfo?: ClinicInfo;
  languageConfirmed?: boolean;
  doctorName?: string;
  termsAccepted?: boolean;
  showHealthScore?: boolean;
}
