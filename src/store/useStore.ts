import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient, Periodontogram, UserSettings } from '../types';

interface AppState {
  user: any | null;
  userId: string | null;
  settings: UserSettings;
  patients: Patient[];
  currentPatient: Patient | null;
  periodontograms: Periodontogram[];
  currentPeriodontogram: Periodontogram | null;
  setUser: (user: any | null) => void;
  setSettings: (settings: Partial<UserSettings>) => void;
  replaceSettings: (settings: UserSettings) => void;
  setPatients: (patients: Patient[]) => void;
  setCurrentPatient: (patient: Patient | null) => void;
  setPeriodontograms: (periodontograms: Periodontogram[]) => void;
  setCurrentPeriodontogram: (periodontogram: Periodontogram | null) => void;
  updateToothData: (toothNumber: number, data: any) => void;
  updateLangDiagram: (data: any) => void;
  updateIDRA: (data: any) => void;
  clearStore: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      userId: null,
      settings: {
        language: 'en',
        numberingSystem: 'FDI',
        voiceLanguage: 'en',
      },
      patients: [],
      currentPatient: null,
      periodontograms: [],
      currentPeriodontogram: null,
      setUser: (user) => set({ user, userId: user?.uid || null }),
      setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
      replaceSettings: (settings) => set({ settings }),
      setPatients: (patients) => set({ patients }),
      setCurrentPatient: (currentPatient) => set({ currentPatient }),
      setPeriodontograms: (periodontograms) => set({ periodontograms }),
      setCurrentPeriodontogram: (currentPeriodontogram) => set({ currentPeriodontogram }),
      clearStore: () => set({
        user: null,
        userId: null,
        settings: {
          language: 'en',
          numberingSystem: 'FDI',
          voiceLanguage: 'en',
        },
        patients: [],
        currentPatient: null,
        periodontograms: [],
        currentPeriodontogram: null,
      }),
      updateToothData: (toothNumber, data) => set((state) => {
        if (!state.currentPeriodontogram) return state;
        
        const currentTeeth = state.currentPeriodontogram.teeth || {};
        const currentTooth = currentTeeth[toothNumber] || {
          toothNumber,
          missing: false,
          implant: false,
          mobility: null,
          furcation: { buccal: null, lingual: null, mesial: null, distal: null },
          probingDepth: { buccal: [null, null, null], lingual: [null, null, null] },
          gingivalMargin: { buccal: [null, null, null], lingual: [null, null, null] },
          bleeding: { buccal: [false, false, false], lingual: [false, false, false] },
          plaque: { buccal: [false, false, false], lingual: [false, false, false] },
          suppuration: { buccal: [false, false, false], lingual: [false, false, false] },
        };

        // Ensure missing and implant are mutually exclusive
        const updatedData = { ...data };
        if (updatedData.implant === true) {
          updatedData.missing = false;
        } else if (updatedData.missing === true) {
          updatedData.implant = false;
        }

        return {
          currentPeriodontogram: {
            ...state.currentPeriodontogram,
            teeth: {
              ...currentTeeth,
              [toothNumber]: { ...currentTooth, ...updatedData }
            }
          }
        };
      }),
      updateLangDiagram: (data) => set((state) => {
        if (!state.currentPeriodontogram) return state;
        return {
          currentPeriodontogram: {
            ...state.currentPeriodontogram,
            langDiagram: { ...state.currentPeriodontogram.langDiagram, ...data }
          }
        };
      }),
      updateIDRA: (data) => set((state) => {
        if (!state.currentPeriodontogram) return state;
        return {
          currentPeriodontogram: {
            ...state.currentPeriodontogram,
            idra: { ...state.currentPeriodontogram.idra, ...data }
          }
        };
      }),
    }),
    {
      name: 'periovox-storage',
      partialize: (state) => ({
        userId: state.userId,
        settings: state.settings,
        patients: state.patients,
        currentPatient: state.currentPatient,
        periodontograms: state.periodontograms,
        currentPeriodontogram: state.currentPeriodontogram,
        // Do not persist user object as it contains non-serializable Firebase data
      }),
    }
  )
);
