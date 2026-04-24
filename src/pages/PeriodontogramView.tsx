import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Mic, MicOff, FileText, Activity, X, AlertTriangle, CheckCircle, Info, Stethoscope, ListTodo, Droplets, ShieldAlert, Download } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { PeriodontogramChart } from '../components/PeriodontogramChart';
import { LangDiagram } from '../components/LangDiagram';
import { IDRAAssessment } from '../components/IDRAAssessment';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { normalizePeriodontogram } from '../utils/normalization';
import { downloadCSV } from '../utils/export';
import { motion, AnimatePresence, Variants } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function PeriodontogramView() {
  const { id, patientId } = useParams<{ id: string, patientId: string }>();
  const { t, i18n } = useTranslation();
  const { user, currentPeriodontogram, setCurrentPeriodontogram, updateToothData, settings, periodontograms } = useStore();

  const scrollToSection = (toothNumber: number, surface: 'buccal' | 'lingual') => {
    const isUpper = settings.numberingSystem === 'ADA' ? toothNumber <= 16 : toothNumber < 30;
    const sectionId = `section-${isUpper ? 'maxillary' : 'mandibular'}-${surface}`;
    console.log(`Scrolling to section: ${sectionId} for tooth ${toothNumber} surface ${surface}`);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.warn(`Section element not found: ${sectionId}`);
    }
  };

  const [loading, setLoading] = useState(!periodontograms.find(p => p.id === id));
  const [isRecording, setIsRecording] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingChartPDF, setIsExportingChartPDF] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [activeTooth, setActiveTooth] = useState<number | null>(null);
  const [activeSurface, setActiveSurface] = useState<'buccal' | 'lingual' | null>(null);
  const [activeTab, setActiveTab] = useState<'periodontogram' | 'lang' | 'idra'>('periodontogram');
  const [hasGivenWarning, setHasGivenWarning] = useState(false);

  useEffect(() => {
    if (selectedTooth !== null) {
      // When a tooth is selected (modal opens), scroll to its buccal section by default
      // This ensures the chart background matches the tooth being edited
      scrollToSection(selectedTooth, 'buccal');
    }
  }, [selectedTooth]);
  
  const aiRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<any[]>([]);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeTab !== 'periodontogram' && isRecording) {
      stopRecording();
    }
  }, [activeTab, isRecording]);

  useEffect(() => {
    if (currentPeriodontogram?.report && !report) {
      setReport(currentPeriodontogram.report);
    }
  }, [currentPeriodontogram, report]);

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      console.log("Voice input disconnected due to inactivity.");
      stopRecording();
    }, 30000); // 30 seconds timeout
  };

  const debouncedSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 1500); // Save 1.5s after last change
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (currentPeriodontogram) {
      debouncedSave();
    }
  }, [currentPeriodontogram]);

  useEffect(() => {
    if (!user || !db || !id) return;
    
    // Optimistic load: check if periodontogram is already in the global store
    const existingPerio = periodontograms.find(p => p.id === id);
    if (existingPerio) {
      setCurrentPeriodontogram(existingPerio);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const fetchPeriodontogram = async () => {
      try {
        if (!existingPerio) {
          const docRef = doc(db, 'periodontograms', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCurrentPeriodontogram({ id: docSnap.id, ...docSnap.data() } as any);
          }
        }
      } catch (error) {
        console.error("Error fetching periodontogram:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodontogram();
    
    return () => {
      stopRecording();
    };
  }, [id, user]);

  const handleSave = async () => {
    const dataToSave = useStore.getState().currentPeriodontogram;
    if (!db || !id || !dataToSave) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'periodontograms', id);
      
      await updateDoc(docRef, {
        teeth: dataToSave.teeth,
        notes: dataToSave.notes || '',
        ...(dataToSave.report ? { report: dataToSave.report } : {}),
        ...(dataToSave.classification ? { classification: dataToSave.classification } : {}),
        ...(dataToSave.langDiagram ? { langDiagram: dataToSave.langDiagram } : {}),
        ...(dataToSave.idra ? { idra: dataToSave.idra } : {})
      });
      
      setSaving(false);
    } catch (error) {
      console.error("Error in handleSave:", error);
      setSaving(false);
      alert(t('save_error') + ": " + (error as Error).message);
    }
  };

  const startRecording = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert(t('api_key_missing'));
      return;
    }
    
    // Create a new instance for each session to ensure clean state
    aiRef.current = new GoogleGenAI({ apiKey });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      mediaStreamRef.current = stream;
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      // Ensure audio context is running
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      audioContext.onstatechange = () => {
        if (audioContext.state === 'suspended' && processorRef.current) {
          console.log("AudioContext suspended, attempting to resume...");
          audioContext.resume().catch(err => console.error("Failed to resume AudioContext:", err));
        }
      };
      
      const source = audioContext.createMediaStreamSource(stream);
      const currentProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = currentProcessor;
      
      source.connect(currentProcessor);
      currentProcessor.connect(audioContext.destination);

      const updateToothDataDeclaration = {
        name: "updateToothData",
        description: "Updates the periodontal data for a specific tooth based on the dentist's voice input. Can update probing depths, bleeding, plaque, mobility, furcation, missing status, or implant status.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            toothNumber: { type: Type.INTEGER, description: "The tooth number (FDI or ADA format)." },
            surface: { type: Type.STRING, enum: ["buccal", "lingual"], description: "The surface: 'buccal' (vestibular) or 'lingual' (palatal/lingual). If the user doesn't specify, default to 'buccal'." },
            depths: { type: Type.ARRAY, items: { type: Type.INTEGER }, description: "Array of exactly 3 probing depths. The order MUST match the visual left-to-right order of the tooth on screen. For right quadrants (18-11, 48-41), the visual order is [distal, mid, mesial]. For left quadrants (21-28, 31-38), the visual order is [mesial, mid, distal]. Use null for unmeasured sites." },
            recessions: { type: Type.ARRAY, items: { type: Type.INTEGER }, description: "Array of exactly 3 gingival margins/recessions. Order MUST match visual left-to-right order. Right quadrants: [distal, mid, mesial]. Left quadrants: [mesial, mid, distal]. Use null for unmeasured sites." },
            bleeding: { type: Type.ARRAY, items: { type: Type.BOOLEAN }, description: "Array of exactly 3 booleans for bleeding. Order MUST match visual left-to-right order. Right quadrants: [distal, mid, mesial]. Left quadrants: [mesial, mid, distal]." },
            plaque: { type: Type.ARRAY, items: { type: Type.BOOLEAN }, description: "Array of exactly 3 booleans for plaque. Order MUST match visual left-to-right order. Right quadrants: [distal, mid, mesial]. Left quadrants: [mesial, mid, distal]." },
            mobility: { type: Type.INTEGER, description: "Tooth mobility grade (0-3)." },
            furcationBuccal: { type: Type.INTEGER, description: "Buccal furcation grade (1-3)." },
            furcationLingual: { type: Type.INTEGER, description: "Lingual furcation grade (1-3)." },
            furcationMesial: { type: Type.INTEGER, description: "Mesial furcation grade (1-3)." },
            furcationDistal: { type: Type.INTEGER, description: "Distal furcation grade (1-3)." },
            missing: { type: Type.BOOLEAN, description: "Whether the tooth is missing." },
            implant: { type: Type.BOOLEAN, description: "Whether the tooth is an implant." },
            suppuration: { type: Type.ARRAY, items: { type: Type.BOOLEAN }, description: "Array of exactly 3 booleans for suppuration. Order MUST match visual left-to-right order. Right quadrants: [distal, mid, mesial]. Left quadrants: [mesial, mid, distal]." }
          },
          required: ["toothNumber", "surface"]
        }
      };

      const getToothDataDeclaration = {
        name: "getToothData",
        description: "Retrieves the current periodontal data for a specific tooth to answer the dentist's questions.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            toothNumber: { type: Type.INTEGER, description: "The tooth number (FDI or ADA format)." }
          },
          required: ["toothNumber"]
        }
      };

      const getPatientInfoDeclaration = {
        name: "getPatientInfo",
        description: "Retrieves the general information and medical history of the current patient."
      };

      const stopDictationDeclaration = {
        name: "stopDictation",
        description: "Stops the voice dictation session. Call this when the dentist says they are finished, done, or want to take a pause."
      };

      const focusToothDeclaration = {
        name: "focusTooth",
        description: "Scrolls the UI to a specific tooth. Call this when the user mentions a tooth number to start working on it, even before providing measurements (e.g., 'vamos al 46', 'seguimos con el 18').",
        parameters: {
          type: Type.OBJECT,
          properties: {
            toothNumber: { type: Type.INTEGER, description: "The tooth number to focus on." },
            surface: { type: Type.STRING, enum: ["buccal", "lingual"], description: "Optional surface: 'buccal' (vestibular) or 'lingual' (palatal/lingual). Defaults to 'buccal' if not specified." }
          },
          required: ["toothNumber"]
        }
      };

      const scrollToSectionDeclaration = {
        name: "scrollToSection",
        description: "Scrolls the UI to a specific section of the periodontogram. Call this when the user explicitly says they are moving to a new section or arch (e.g., 'pasamos a palatino', 'vamos a la arcada inferior') OR when you, the assistant, guide the user to a new section.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            arch: { type: Type.STRING, enum: ["maxillary", "mandibular"], description: "The arch to scroll to: 'maxillary' (upper) or 'mandibular' (lower)." },
            surface: { type: Type.STRING, enum: ["buccal", "lingual"], description: "The surface to scroll to: 'buccal' (vestibular) or 'lingual' (palatal/lingual)." }
          },
          required: ["arch", "surface"]
        }
      };

      const generateReportDeclaration = {
        name: "generateReport",
        description: "Stop dictation and generate the periodontal report immediately.",
        parameters: { type: Type.OBJECT, properties: {} }
      };

      const sessionPromise = aiRef.current.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are PerioVoxAI, a highly efficient, direct, and proactive dental assistant. 
          Your goal is to record periodontal data as fast and accurately as possible.

          INTERACTION RULES:
          1. SILENT DICTATION: DO NOT SPEAK to confirm data entry. Remain completely silent when recording data successfully. The dentist is dictating fast and does not want to be interrupted.
          2. ONLY SPEAK IF THERE IS AN ERROR: Only speak if there is an impossible value (like depth > 15), if you didn't hear the tooth number, or if the user asks a direct question.
          3. NO ACKNOWLEDGMENTS: Never say "Ok", "Got it", "Next", or "Ready". Just call the 'updateToothData' function silently.
          4. PROBING SEQUENCE GUIDANCE: You must guide the dentist through the following sequence. Speak ONLY to announce the next section:
             - START: Begin at 18 Vestibular.
             - VESTIBULAR ARCH: Continue from 18 to 28 Vestibular without interruption.
             - TRANSITION: When 28 Vestibular is completed, say: "Pasamos a la pieza 18 palatino. Recuerde registrar la recesión." AND call the 'scrollToSection' function with arch='maxillary' and surface='lingual'.
             - LINGUAL ARCH: Continue from 18 to 28 Palatino/Lingual without interruption.
             - LOWER ARCH: Apply the same logic (48 to 38 Vestibular, then 48 to 38 Lingual). When 38 Vestibular is completed, say: "Pasamos a la pieza 48 lingual." AND call the 'scrollToSection' function with arch='mandibular' and surface='lingual'.
             - This ensures the dentist follows the continuous probing protocol.
          5. SILENT DATA ENTRY: Apart from the sequence announcements above, remain SILENT when recording numbers. Do not confirm every value.
          6. DEFAULT INTERPRETATION: When the user provides numerical measurements, interpret them as "probing depths" (bolsas periodontales) by default, unless the user explicitly mentions "gingival margin" (margen gingival) or "recession" (recesión).
          7. BIDIRECTIONAL: You are a partner. You can answer questions like "What was the depth for 16?" or "Does the patient have allergies?".
          8. Use the 'updateToothData' function for every value mentioned. You MUST provide arrays of exactly 3 values for depths, recessions, bleeding, plaque, and suppuration. The order of these arrays MUST ALWAYS match the visual left-to-right order of the tooth on the screen:
             - For right quadrants (18-11, 48-41), the visual left-to-right order is [distal, mid, mesial].
             - For left quadrants (21-28, 31-38), the visual left-to-right order is [mesial, mid, distal].
             If the user dictates 3 numbers without specifying surfaces (e.g., "3 2 3"), assume they are dictating in the standard Distal-to-Mesial order, and map them to the correct visual array based on the quadrant. If a specific site is not measured, use null in that position (e.g., [null, 4, null]). If the user says "bleeding" or "suppuration" without specifying a site, set all 3 values for that surface to true (e.g., [true, true, true]).
          9. LANGUAGE BEHAVIOR: Always respond in the EXACT SAME LANGUAGE that the user is speaking. If the user speaks Spanish, respond in Spanish. If the user speaks English, respond in English. Do NOT default to ${settings.voiceLanguage} unless the user speaks it.
          10. Numbering system: ${settings.numberingSystem}.
          11. STOP DICTATION: If the user says they are done, finished, want to pause, or have finished the periodontogram, call the 'stopDictation' function immediately.
          12. SCROLLING: If the user explicitly says they are moving to a new section (e.g., "pasamos a palatino", "vamos a la arcada inferior"), call the 'scrollToSection' function to update the UI.
          13. MEDICAL DISCLAIMER: NEVER mention that you are not a medical device during dictation. Only say it if explicitly asked or if instructed at the start of the session.
          14. FOCUS TOOTH: If the user mentions a tooth number (e.g., "vamos al 46", "seguimos con la pieza 18"), call the 'focusTooth' function immediately to scroll the UI to that tooth, even if they haven't provided measurements yet.
          15. PERSONALITY & ACCENT: Use a professional, direct, and helpful tone. When speaking Spanish, you MUST ALWAYS use a clear 'castellano de Madrid' (Castilian Spanish from Madrid) accent and vocabulary (e.g., use 'vosotros' instead of 'ustedes', 'c' and 'z' as /θ/, etc.). This is a mandatory requirement for all Spanish interactions, unless the user explicitly speaks another dialect. For other languages, adapt to the user's accent.
          16. GENERATE REPORT COMMAND: If the user says "Genera el informe", "Haz el reporte", "Generate report", or any equivalent command to finish and analyze, call the 'generateReport' function immediately. This will also stop the dictation.
          17. STATE TRACKING & CONTINUOUS PROBING: You MUST keep track of the current tooth and surface. 
              - The exact continuous sequence for the Upper Arch is: 18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28.
              - The exact continuous sequence for the Lower Arch is: 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38.
              - If the user dictates measurements consecutively without saying the tooth number (e.g., "3 2 3, 4 3 4"), you MUST apply the first set to the current tooth, and the next set to the NEXT adjacent tooth in the sequence. DO NOT skip teeth.
              - If the user doesn't specify the surface, you MUST apply it to the CURRENT surface they are working on (defaulting to 'buccal' at the start).`,
          tools: [{ functionDeclarations: [updateToothDataDeclaration, getToothDataDeclaration, getPatientInfoDeclaration, stopDictationDeclaration, scrollToSectionDeclaration, focusToothDeclaration, generateReportDeclaration] }],
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          }
        },
        callbacks: {
          onopen: () => {
            if (processorRef.current !== currentProcessor) return;
            setIsRecording(true);
            setAiStatus('listening');
            resetInactivityTimer();

            // Send initial message to greet the user
            sessionPromise.then((session: any) => {
              if (processorRef.current !== currentProcessor) return;
              
              const language = i18n.language.startsWith('es') ? 'Spanish' : 'English';
              const readyMessage = t('ai_ready_to_receive');
              const warningMessage = t('ai_medical_disclaimer');

              const fullMessage = hasGivenWarning 
                ? readyMessage 
                : `${readyMessage} ${warningMessage}`;

              try {
                session.sendRealtimeInput({
                  text: `The session has started. Please say exactly this to the user in ${language}: "${fullMessage}". Then wait for their dictation.`
                });
              } catch (err) {
                console.error("Error sending initial message:", err);
              }
              
              if (!hasGivenWarning) {
                setHasGivenWarning(true);
              }
            }).catch((err: any) => console.error("Session promise error:", err));
            
            currentProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              const buffer = new ArrayBuffer(pcm16.length * 2);
              const view = new DataView(buffer);
              for (let i = 0; i < pcm16.length; i++) {
                view.setInt16(i * 2, pcm16[i], true);
              }
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
              
              sessionPromise.then((session: any) => {
                if (processorRef.current !== currentProcessor) return; // Check if we are still recording
                
                try {
                  session.sendRealtimeInput({
                    audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                  });
                } catch (err) {
                  console.error("Error sending audio to Live API:", err);
                }
              }).catch((err: any) => console.error("Session promise error:", err));
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            if (processorRef.current !== currentProcessor) return;
            resetInactivityTimer();
            // Update status based on message
            if (message.serverContent?.modelTurn) {
              setAiStatus('speaking');
            } else if (message.toolCall) {
              setAiStatus('thinking');
            } else {
              setAiStatus('listening');
            }

            // Handle audio output
            let base64Audio = null;
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData && part.inlineData.data) {
                  base64Audio = part.inlineData.data;
                  break;
                }
              }
            }
            if (base64Audio) {
              const binaryString = atob(base64Audio);
              const pcm16 = new Int16Array(binaryString.length / 2);
              for (let i = 0; i < pcm16.length; i++) {
                const byte1 = binaryString.charCodeAt(i * 2);
                const byte2 = binaryString.charCodeAt(i * 2 + 1);
                pcm16[i] = (byte2 << 8) | byte1;
              }
              
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768.0;
              }
              
              const audioContext = audioContextRef.current;
              if (audioContext) {
                const audioBuffer = audioContext.createBuffer(1, float32.length, 24000);
                audioBuffer.getChannelData(0).set(float32);
                
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                
                const currentTime = audioContext.currentTime;
                if (nextPlayTimeRef.current < currentTime) {
                  nextPlayTimeRef.current = currentTime;
                }
                
                source.start(nextPlayTimeRef.current);
                nextPlayTimeRef.current += audioBuffer.duration;
                
                // Keep track of active sources for interruption
                if (!activeSourcesRef.current) activeSourcesRef.current = [];
                activeSourcesRef.current.push(source);
                source.onended = () => {
                  if (activeSourcesRef.current) {
                    activeSourcesRef.current = activeSourcesRef.current.filter((s: any) => s !== source);
                  }
                };
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              nextPlayTimeRef.current = 0;
              if (activeSourcesRef.current) {
                activeSourcesRef.current.forEach((source: any) => {
                  try {
                    source.stop();
                  } catch (e) {}
                });
                activeSourcesRef.current = [];
              }
            }

            // Handle function calls
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls) {
                const functionResponses: any[] = [];

                for (const call of functionCalls) {
                  try {
                    if (call.name === 'updateToothData') {
                      const args = call.args || {} as any;
                      if (!args.toothNumber) {
                        throw new Error("Missing toothNumber");
                      }
                      
                      const validTeeth = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
                      if (!validTeeth.includes(args.toothNumber)) {
                        console.warn(`AI attempted to update invalid tooth number: ${args.toothNumber}`);
                        continue; // Skip invalid teeth
                      }
                      
                      // Get current tooth data or default
                      const currentTeeth = useStore.getState().currentPeriodontogram?.teeth || {};
                      const currentTooth = (currentTeeth[args.toothNumber] || {
                        probingDepth: { buccal: [null, null, null], lingual: [null, null, null] },
                        gingivalMargin: { buccal: [null, null, null], lingual: [null, null, null] },
                        bleeding: { buccal: [false, false, false], lingual: [false, false, false] },
                        plaque: { buccal: [false, false, false], lingual: [false, false, false] },
                        suppuration: { buccal: [false, false, false], lingual: [false, false, false] }
                      }) as any;

                      const updates: any = {};

                      if (args.surface) {
                        let surface = args.surface as 'buccal' | 'lingual';
                        if (surface as string === 'vestibular') surface = 'buccal';
                        if (surface as string === 'palatal' || surface as string === 'palatino') surface = 'lingual';
                        
                        if (args.depths && Array.isArray(args.depths)) {
                          const newProbingDepth = currentTooth.probingDepth ? JSON.parse(JSON.stringify(currentTooth.probingDepth)) : { buccal: [null, null, null], lingual: [null, null, null] };
                          args.depths.forEach((val: any, idx: number) => {
                            if (idx < 3 && val !== null && val !== undefined) {
                              newProbingDepth[surface][idx] = val;
                            }
                          });
                          updates.probingDepth = newProbingDepth;
                        }

                        if (args.recessions && Array.isArray(args.recessions)) {
                          const newGingivalMargin = currentTooth.gingivalMargin ? JSON.parse(JSON.stringify(currentTooth.gingivalMargin)) : { buccal: [null, null, null], lingual: [null, null, null] };
                          args.recessions.forEach((val: any, idx: number) => {
                            if (idx < 3 && val !== null && val !== undefined) {
                              newGingivalMargin[surface][idx] = val;
                            }
                          });
                          updates.gingivalMargin = newGingivalMargin;
                        }

                        if (args.bleeding && Array.isArray(args.bleeding)) {
                          const newBleeding = currentTooth.bleeding ? JSON.parse(JSON.stringify(currentTooth.bleeding)) : { buccal: [false, false, false], lingual: [false, false, false] };
                          args.bleeding.forEach((val: any, idx: number) => {
                            if (idx < 3 && val !== null && val !== undefined) {
                              newBleeding[surface][idx] = val;
                            }
                          });
                          updates.bleeding = newBleeding;
                        }

                        if (args.plaque && Array.isArray(args.plaque)) {
                          const newPlaque = currentTooth.plaque ? JSON.parse(JSON.stringify(currentTooth.plaque)) : { buccal: [false, false, false], lingual: [false, false, false] };
                          args.plaque.forEach((val: any, idx: number) => {
                            if (idx < 3 && val !== null && val !== undefined) {
                              newPlaque[surface][idx] = val;
                            }
                          });
                          updates.plaque = newPlaque;
                        }

                        if (args.suppuration && Array.isArray(args.suppuration)) {
                          const newSuppuration = (currentTooth.suppuration && typeof currentTooth.suppuration === 'object') ? JSON.parse(JSON.stringify(currentTooth.suppuration)) : { buccal: [false, false, false], lingual: [false, false, false] };
                          args.suppuration.forEach((val: any, idx: number) => {
                            if (idx < 3 && val !== null && val !== undefined) {
                              newSuppuration[surface][idx] = val;
                            }
                          });
                          updates.suppuration = newSuppuration;
                        }
                      }

                      if (args.mobility !== undefined) updates.mobility = args.mobility;
                      if (args.missing !== undefined) updates.missing = args.missing;
                      if (args.implant !== undefined) updates.implant = args.implant;

                      const furcationUpdates: any = {};
                      if (args.furcationBuccal !== undefined) furcationUpdates.buccal = args.furcationBuccal;
                      if (args.furcationLingual !== undefined) furcationUpdates.lingual = args.furcationLingual;
                      if (args.furcationMesial !== undefined) furcationUpdates.mesial = args.furcationMesial;
                      if (args.furcationDistal !== undefined) furcationUpdates.distal = args.furcationDistal;
                      
                      if (Object.keys(furcationUpdates).length > 0) {
                        updates.furcation = { ...(currentTooth.furcation || {}), ...furcationUpdates };
                      }

                      if (Object.keys(updates).length > 0) {
                        updateToothData(args.toothNumber, updates);
                        setActiveTooth(args.toothNumber);
                        if (args.surface) {
                          let scrollSurface = args.surface as 'buccal' | 'lingual';
                          if (scrollSurface as string === 'vestibular') scrollSurface = 'buccal';
                          if (scrollSurface as string === 'palatal' || scrollSurface as string === 'palatino') scrollSurface = 'lingual';
                          setActiveSurface(scrollSurface);
                        }
                        debouncedSave();
                        
                        // Scroll to the relevant section if surface is specified
                        if (args.surface) {
                          let scrollSurface = args.surface as 'buccal' | 'lingual';
                          if (scrollSurface as string === 'vestibular') scrollSurface = 'buccal';
                          if (scrollSurface as string === 'palatal' || scrollSurface as string === 'palatino') scrollSurface = 'lingual';
                          scrollToSection(args.toothNumber, scrollSurface);
                        }
                        
                        let hasActualChanges = false;
                        if (args.depths && args.depths.some((v: any) => v !== null && v !== undefined)) hasActualChanges = true;
                        if (args.recessions && args.recessions.some((v: any) => v !== null && v !== undefined)) hasActualChanges = true;
                        if (args.bleeding && args.bleeding.some((v: any) => v !== null && v !== undefined)) hasActualChanges = true;
                        if (args.plaque && args.plaque.some((v: any) => v !== null && v !== undefined)) hasActualChanges = true;
                        if (args.suppuration && args.suppuration.some((v: any) => v !== null && v !== undefined)) hasActualChanges = true;
                        if (args.mobility !== undefined) hasActualChanges = true;
                        if (args.missing !== undefined) hasActualChanges = true;
                        if (args.implant !== undefined) hasActualChanges = true;
                        if (args.furcationBuccal !== undefined || args.furcationLingual !== undefined || args.furcationMesial !== undefined || args.furcationDistal !== undefined) hasActualChanges = true;

                        // Play a clear "pop" sound for feedback
                        if (hasActualChanges) {
                          try {
                            const ctx = audioContextRef.current;
                            if (ctx && ctx.state === 'running') {
                              const osc = ctx.createOscillator();
                              const gainNode = ctx.createGain();
                              osc.type = 'sine';
                              osc.frequency.setValueAtTime(800, ctx.currentTime);
                              osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
                              gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                              gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                              osc.connect(gainNode);
                              gainNode.connect(ctx.destination);
                              osc.start();
                              osc.stop(ctx.currentTime + 0.1);
                            }
                          } catch (e) {
                            // Ignore audio errors
                          }
                        }
                      }

                      functionResponses.push({
                        id: call.id,
                        name: call.name,
                        response: { result: "success" }
                      });
                    } else if (call.name === 'getToothData') {
                      const args = call.args || {} as any;
                      if (!args.toothNumber) {
                        throw new Error("Missing toothNumber");
                      }
                      const currentTeeth = useStore.getState().currentPeriodontogram?.teeth || {};
                      const currentTooth = currentTeeth[args.toothNumber];
                      functionResponses.push({
                        id: call.id,
                        name: call.name,
                        response: { result: currentTooth || "No data recorded for this tooth yet." }
                      });
                    } else if (call.name === 'getPatientInfo') {
                      const currentPatient = useStore.getState().currentPatient;
                      functionResponses.push({
                        id: call.id,
                        name: call.name,
                        response: { result: currentPatient || "No patient data available." }
                      });
                    } else if (call.name === 'scrollToSection') {
                      const args = call.args || {} as any;
                      if (args.arch && args.surface) {
                        let scrollSurface = args.surface as 'buccal' | 'lingual';
                        if (scrollSurface as string === 'vestibular') scrollSurface = 'buccal';
                        if (scrollSurface as string === 'palatal' || scrollSurface as string === 'palatino') scrollSurface = 'lingual';
                        
                        const sectionId = `section-${args.arch}-${scrollSurface}`;
                        console.log(`AI requested scroll to: ${sectionId}`);
                        const element = document.getElementById(sectionId);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                          console.warn(`Section element not found: ${sectionId}`);
                        }
                      }
                      functionResponses.push({
                        id: call.id,
                        name: call.name,
                        response: { result: "Scrolled successfully." }
                      });
                    } else if (call.name === 'focusTooth') {
                      const args = call.args || {} as any;
                      if (args.toothNumber) {
                        let scrollSurface = (args.surface || 'buccal') as 'buccal' | 'lingual';
                        if (scrollSurface as string === 'vestibular') scrollSurface = 'buccal';
                        if (scrollSurface as string === 'palatal' || scrollSurface as string === 'palatino') scrollSurface = 'lingual';
                        setActiveTooth(args.toothNumber);
                        setActiveSurface(scrollSurface);
                        scrollToSection(args.toothNumber, scrollSurface);
                      }
                      functionResponses.push({
                        id: call.id,
                        name: call.name,
                        response: { result: "Focused on tooth." }
                      });
                    } else if (call.name === 'stopDictation') {
                      functionResponses.push({
                        id: call.id,
                        name: call.name,
                        response: { result: "Stopping dictation." }
                      });
                      // Stop recording after processing all function calls
                      setTimeout(() => stopRecording(), 500);
                    } else if (call.name === 'generateReport') {
                      functionResponses.push({
                        id: call.id,
                        name: call.name,
                        response: { result: "Generating report and stopping dictation." }
                      });
                      // Generate report and stop recording
                      setTimeout(() => {
                        stopRecording();
                        generateReport();
                      }, 500);
                    } else {
                      functionResponses.push({
                        id: call.id,
                        name: call.name,
                        response: { error: "Unknown function call" }
                      });
                    }
                  } catch (err: any) {
                    functionResponses.push({
                      id: call.id,
                      name: call.name,
                      response: { error: err.message || "Error executing function" }
                    });
                  }
                }
                
                // Send response back
                sessionPromise.then((session: any) => {
                   if (processorRef.current !== currentProcessor) return;
                   try {
                     session.sendToolResponse({
                       functionResponses
                     });
                   } catch (err) {
                     console.error("Error sending tool response:", err);
                   }
                }).catch((err: any) => console.error("Session promise error:", err));
              }
            }
          },
          onerror: (err: any) => console.error("Live API Error:", err),
          onclose: () => {
            if (processorRef.current === currentProcessor) {
              stopRecording();
            }
          }
        }
      });
      
      const session = await sessionPromise;
      if (processorRef.current !== currentProcessor) {
        session.close();
      } else {
        sessionRef.current = session;
      }

    } catch (error) {
      console.error("Error starting recording:", error);
      alert(t('mic_access_error'));
    }
  };

  const stopRecording = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    nextPlayTimeRef.current = 0;
    setAiStatus('idle');
    setIsRecording(false);
  };

  const generateReport = async () => {
    if (!currentPeriodontogram) return;
    
    let ai = aiRef.current;
    if (!ai) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        alert(t('api_key_missing'));
        return;
      }
      ai = new GoogleGenAI({ apiKey });
      aiRef.current = ai;
    }

    setGeneratingReport(true);
    try {
      const historyContext = periodontograms
        .filter(p => p.patientId === currentPeriodontogram.patientId && p.id !== currentPeriodontogram.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3) // Get up to 3 most recent past periodontograms
        .map(p => `
          Past Date: ${p.date}
          Classification: ${p.classification || 'None'}
          Data: ${JSON.stringify(p.teeth)}
        `).join('\n');

      const isSpanish = i18n.language.startsWith('es');
      const prompt = `
        Analyze the following periodontogram data and provide a clinical report, prognosis, and treatment plan.
        You MUST write the entire response in ${isSpanish ? 'Spanish' : 'English'}. ${isSpanish ? `Use Spanish clinical terminology (e.g., "${t('probing_depth_long')}" instead of "Probing Depths", "${t('mobility_long')}" instead of "Mobility", "${t('suppuration_long')}" instead of "Suppuration", "${t('tooth_long')}" instead of "Tooth").` : ''}
        
        IMPORTANT: Propose a "Classification Suggestion" based on the following criteria. Provide ONLY the Stage and Grade (e.g., "${isSpanish ? t('estadio_iv_grado_c') : t('stage_iv_grade_c')}").
        
        Staging:
        - ${isSpanish ? t('stage_i') : 'Stage I'}: CAL 1-2mm, Bone loss <15% (coronal third), PD <= 4mm, horizontal bone loss.
        - ${isSpanish ? t('stage_ii') : 'Stage II'}: CAL 3-4mm, Bone loss 15-33% (coronal third), PD <= 5mm, horizontal bone loss.
        - ${isSpanish ? t('stage_iii') : 'Stage III'}: CAL >= 5mm, Bone loss to middle/apical third, PD >= 6mm, vertical bone loss >= 3mm, furcation II/III, moderate ridge defect.
        - ${isSpanish ? t('stage_iv') : 'Stage IV'}: CAL >= 5mm, Bone loss to middle/apical third, PD >= 6mm, >= 5 teeth lost due to perio, complex rehab needed, masticatory dysfunction, occlusal trauma, advanced ridge defect.
        
        Grading:
        - ${isSpanish ? t('grade_a') : 'Grade A'}: No bone/CAL loss in 5 years, bone loss/age < 0.25, heavy biofilm/low destruction, non-smoker, no diabetes.
        - ${isSpanish ? t('grade_b') : 'Grade B'}: Bone loss < 2mm in 5 years, bone loss/age 0.25-1.0, destruction proportional to biofilm, < 10 cig/day, HbA1c < 7 with diabetes.
        - ${isSpanish ? t('grade_c') : 'Grade C'}: Bone loss >= 2mm in 5 years, bone loss/age > 1.0, rapid progression, early onset, >= 10 cig/day, HbA1c >= 7 with diabetes.

        Patient ID: ${currentPeriodontogram.patientId}
        Date (Current): ${currentPeriodontogram.date}
        Notes: ${currentPeriodontogram.notes || 'None'}
        
        ${historyContext ? `
        HISTORICAL CONTEXT (Past Periodontograms for Comparison):
        When determining if the patient has improved or worsened, refer to this historical data. 
        Important: Staging in periodontitis generally relies on maximum clinical attachment loss (severity). Even if probing depths or bleeding improve after treatment, the "Stage" usually does not downgrade, because the maximum bone loss and CAL that already occurred cannot be reversed. Describe improvement as "stable" or "reduced probing depths" rather than reducing the Stage, unless the previous stage was incorrectly diagnosed.
        ${historyContext}
        ` : ''}
        
        ${currentPeriodontogram.langDiagram ? `
        Periodontal Risk Assessment (Lang Diagram):
        - BOP: ${currentPeriodontogram.langDiagram.bop}%
        - Pockets >= 5mm: ${currentPeriodontogram.langDiagram.pockets}
        - Teeth Lost: ${currentPeriodontogram.langDiagram.toothLoss}
        - Bone Loss / Age: ${currentPeriodontogram.langDiagram.blAge}
        - Systemic/Genetic: ${currentPeriodontogram.langDiagram.systemic}
        - Smoking: ${currentPeriodontogram.langDiagram.smoking}
        ` : ''}

        ${currentPeriodontogram.idra ? `
        Implant Disease Risk Assessment (IDRA):
        - History of Periodontitis: ${currentPeriodontogram.idra.history}
        - BOP: ${currentPeriodontogram.idra.bop}%
        - PD >= 5mm: ${currentPeriodontogram.idra.pd}
        - Bone Loss / Age: ${currentPeriodontogram.idra.blAge}
        - Periodontal Susceptibility: ${currentPeriodontogram.idra.susceptibility}
        - Maintenance Compliance: ${currentPeriodontogram.idra.spt}
        - Bone to Margin Distance: ${currentPeriodontogram.idra.distance}
        - Prosthesis Fit/Cleaning: ${currentPeriodontogram.idra.prosthesis}
        ` : ''}

        Data: ${JSON.stringify(currentPeriodontogram.teeth)}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classification: { type: Type.STRING, description: "Suggested periodontitis classification by stage and grade (e.g. Stage III, Grade B)." },
              summary: { type: Type.STRING, description: "A brief executive summary of the patient's periodontal health." },
              keyMetrics: {
                type: Type.OBJECT,
                properties: {
                  teethWithPockets: { type: Type.INTEGER, description: "Number of teeth with probing depth >= 4mm" },
                  bleedingSites: { type: Type.INTEGER, description: "Total number of sites with bleeding on probing" },
                  plaqueSites: { type: Type.INTEGER, description: "Total number of sites with plaque" },
                  missingTeeth: { type: Type.INTEGER, description: "Total number of missing teeth" },
                  implants: { type: Type.INTEGER, description: "Total number of implants" },
                },
                required: ["teethWithPockets", "bleedingSites", "plaqueSites", "missingTeeth", "implants"]
              },
              prognosis: {
                type: Type.OBJECT,
                properties: {
                  overall: { type: Type.STRING, description: isSpanish ? `'${t('bueno')}', '${t('regular')}', '${t('pobre')}', '${t('cuestionable')}', o '${t('desesperanzador')}'` : "'Good', 'Fair', 'Poor', 'Questionable', or 'Hopeless'" },
                  details: { type: Type.STRING, description: t('analysis_details') }
                },
                required: ["overall", "details"]
              },
              treatmentPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING, description: t('phase_example') },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING }, description: t('phase_actions') }
                  },
                  required: ["phase", "actions"]
                }
              }
            },
            required: ["classification", "summary", "keyMetrics", "prognosis", "treatmentPlan"]
          }
        }
      });

      const jsonStr = response.text.trim();
      const cleanJsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      const reportData = JSON.parse(cleanJsonStr);
      setReport(reportData);
      setCurrentPeriodontogram({ ...currentPeriodontogram, report: reportData, classification: reportData.classification });
      
      // Auto-save when report is generated
      debouncedSave();
    } catch (error) {
      console.error("Error generating report:", error);
      alert(t('error_generating_report'));
    } finally {
      setGeneratingReport(false);
    }
  };

  const reportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    
    setIsExportingPDF(true);
    
    // Allow UI to update before heavy processing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      // Save original styles
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      const originalMargin = element.style.margin;
      
      // Force width for consistent PDF rendering
      element.style.width = '896px';
      element.style.maxWidth = 'none';
      element.style.margin = '0';
      
      element.classList.add('printing-pdf');
      
      // Temporarily show print headers
      const printHeaders = element.querySelectorAll('.print\\:block');
      printHeaders.forEach(header => {
        header.classList.remove('hidden');
        header.classList.add('block');
      });
      
      // Ensure the logo image is loaded before capturing
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = '/logo_texto.png';
      });
      
      const canvas = await toCanvas(element, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 896
      });
      
      // Restore original styles
      printHeaders.forEach(header => {
        header.classList.remove('block');
        header.classList.add('hidden');
      });
      
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.margin = originalMargin;
      element.classList.remove('printing-pdf');
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const margin = 10;
      const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = pdfHeight;
      let position = margin;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
      heightLeft -= (pageHeight - margin * 2);
      
      // Add subsequent pages if content is longer than one page
      while (heightLeft > 0) {
        position -= (pageHeight - margin * 2);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
        heightLeft -= (pageHeight - margin * 2);
      }
      
      pdf.save(`Periodontal_Report_${currentPeriodontogram?.date}.pdf`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`${t('failed_to_generate_pdf')}: ${error.message || error}`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportChartPDF = async () => {
    const element = chartRef.current;
    if (!element) return;
    
    setIsExportingChartPDF(true);
    
    // Allow UI to update before heavy processing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      // Temporarily show the print header
      const printHeader = element.querySelector('.print\\:block');
      if (printHeader) {
        printHeader.classList.remove('hidden');
        printHeader.classList.add('block');
      }
      
      // Ensure the logo image is loaded before capturing
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = '/logo_texto.png';
      });
      
      // Temporarily remove overflow from parent to ensure full capture
      const parent = element.parentElement;
      const originalOverflow = parent ? parent.style.overflowX : '';
      if (parent) {
        parent.style.overflowX = 'visible';
      }
      
      const canvas = await toCanvas(element, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });
      
      // Restore original state
      if (parent) {
        parent.style.overflowX = originalOverflow;
      }
      if (printHeader) {
        printHeader.classList.remove('block');
        printHeader.classList.add('hidden');
      }
      
      const imgData = canvas.toDataURL('image/png');
      
      if (!canvas.width || !canvas.height) {
        throw new Error(`Invalid canvas dimensions: ${canvas.width}x${canvas.height}`);
      }

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scale to fit within page (both width and height)
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      
      // Center the image
      const xPos = (pageWidth - imgWidth) / 2;
      const yPos = (pageHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
      pdf.save(`Periodontogram_${currentPeriodontogram?.date}.pdf`);
    } catch (error: any) {
      console.error('Error generating chart PDF:', error);
      alert(`${t('failed_to_generate_pdf')}: ${error.message || error}`);
    } finally {
      setIsExportingChartPDF(false);
    }
  };

  const handleExportCSV = () => {
    if (!currentPeriodontogram) return;
    const sites = normalizePeriodontogram(currentPeriodontogram);
    downloadCSV(sites, `periovox_sites_${currentPeriodontogram.id}_${currentPeriodontogram.date}`, t('not_enough_data_to_compare'));
  };

  if (loading) return <div className="p-6 text-center text-slate-500">{t('loading')}</div>;
  if (!currentPeriodontogram) return <div className="p-6 text-center text-slate-500">{t('not_found')}</div>;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link to={`/patients/${patientId}`} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
              <button
                onClick={() => setActiveTab('periodontogram')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                  activeTab === 'periodontogram' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                {t('periodontogram')} - {new Date(currentPeriodontogram.date).toLocaleDateString()}
              </button>
              <button
                onClick={() => setActiveTab('lang')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                  activeTab === 'lang' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                {t('lang_diagram')}
              </button>
              <button
                onClick={() => setActiveTab('idra')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                  activeTab === 'idra' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                {t('idra')}
              </button>
            </div>
            {saving && (
              <span className="text-sm font-medium text-slate-400 flex items-center bg-slate-100 px-2 py-1 rounded-md">
                <div className="w-3 h-3 mr-1.5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                {t('saving')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'periodontogram' && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-colors ${
                isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {isRecording ? (
                <><MicOff className="w-4 h-4 mr-2" /> {t('stop_voice')}</>
              ) : (
                <><Mic className="w-4 h-4 mr-2" /> {t('start_voice')}</>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {isRecording && activeTab === 'periodontogram' && (
        <motion.div 
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5 items-end h-6">
              <div className={`w-1.5 bg-indigo-500 rounded-full ${aiStatus === 'listening' ? 'animate-[bounce_1s_infinite_0ms]' : 'h-2'}`} style={{ height: aiStatus === 'listening' ? '100%' : '8px' }} />
              <div className={`w-1.5 bg-indigo-600 rounded-full ${aiStatus === 'listening' ? 'animate-[bounce_1s_infinite_150ms]' : 'h-3'}`} style={{ height: aiStatus === 'listening' ? '100%' : '12px' }} />
              <div className={`w-1.5 bg-indigo-500 rounded-full ${aiStatus === 'listening' ? 'animate-[bounce_1s_infinite_300ms]' : 'h-2'}`} style={{ height: aiStatus === 'listening' ? '100%' : '8px' }} />
            </div>
            <div>
              <p className="text-indigo-900 font-bold text-sm uppercase tracking-wider">
                {aiStatus === 'listening' && t('ai_status_listening')}
                {aiStatus === 'thinking' && t('ai_status_thinking')}
                {aiStatus === 'speaking' && t('ai_status_speaking')}
              </p>
              <p className="text-xs text-indigo-600 mt-0.5">
                {aiStatus === 'listening' && t('ai_status_listening_desc')}
                {aiStatus === 'thinking' && t('ai_status_thinking_desc')}
                {aiStatus === 'speaking' && t('ai_status_speaking_desc')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-indigo-100 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${aiStatus === 'listening' ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-bold text-indigo-400 uppercase">Live API v3.1</span>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'periodontogram' && (
          <motion.div
            key="periodontogram"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Periodontogram Chart Component */}
            <div className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 overflow-x-auto relative">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors"
            title={t('export_csv')}
          >
            <Download className="w-4 h-4 mr-1.5" />
            {t('export_csv')}
          </button>
          <button
            onClick={handleExportChartPDF}
            disabled={isExportingChartPDF}
            className="inline-flex items-center px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors disabled:opacity-50"
            title={t('export_pdf')}
          >
            {isExportingChartPDF ? (
              <div className="w-4 h-4 mr-1.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-1.5" />
            )}
            {t('export_pdf')}
          </button>
        </div>
        <div ref={chartRef} className="p-4 bg-white">
          <div className="print:block hidden mb-8">
            <div className="flex items-center justify-between">
              <img src="/logo_texto.png" alt="PerioVox" className="h-12 w-auto object-contain" />
              <div className="text-right">
                <h2 className="text-2xl font-bold text-slate-900">{t('periodontogram')}</h2>
                <p className="text-slate-500">{new Date(currentPeriodontogram.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <PeriodontogramChart 
            teeth={currentPeriodontogram.teeth} 
            onToothClick={(toothNumber) => setSelectedTooth(toothNumber)} 
            activeTooth={activeTooth}
            activeSurface={activeSurface}
          />
        </div>
      </div>

      {/* Tooth Details Modal */}
      <AnimatePresence>
        {selectedTooth !== null && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 transition-opacity" 
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-slate-500 opacity-75" onClick={() => setSelectedTooth(null)}></div>
              </motion.div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-slate-900">{t('tooth')} {selectedTooth}</h3>
                  <button onClick={() => setSelectedTooth(null)} className="text-slate-400 hover:text-slate-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-6 pb-4 border-b border-slate-100">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPeriodontogram.teeth[selectedTooth]?.missing || false}
                        onChange={(e) => updateToothData(selectedTooth, { missing: e.target.checked })}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
                      />
                      <span className="ml-2 text-sm font-medium text-slate-700">{t('missing')}</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPeriodontogram.teeth[selectedTooth]?.implant || false}
                        onChange={(e) => updateToothData(selectedTooth, { implant: e.target.checked })}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
                      />
                      <span className="ml-2 text-sm font-medium text-slate-700">{t('implant')}</span>
                    </label>
                  </div>

                  <div className={`space-y-6 ${currentPeriodontogram.teeth[selectedTooth]?.missing ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Probing Depth & Gingival Margin (Recession) */}
                    <div className="grid grid-cols-2 gap-6">
                      {['buccal', 'lingual'].map((surface) => (
                        <div key={surface} className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t(surface)}</h4>
                          
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">{t('probing_depth')}</label>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((idx) => (
                                <input
                                  key={`pd-${surface}-${idx}`}
                                  type="number"
                                  min="0"
                                  max="15"
                                  value={currentPeriodontogram.teeth[selectedTooth]?.probingDepth?.[surface as 'buccal' | 'lingual']?.[idx] ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                    const currentPD = currentPeriodontogram.teeth[selectedTooth]?.probingDepth || { buccal: [null, null, null], lingual: [null, null, null] };
                                    const newPD = [...currentPD[surface as 'buccal' | 'lingual']];
                                    newPD[idx] = val;
                                    updateToothData(selectedTooth, { probingDepth: { ...currentPD, [surface]: newPD } });
                                  }}
                                  className="w-full text-center py-1 text-sm border-slate-200 focus:ring-teal-600 focus:border-teal-600 rounded-lg border"
                                  placeholder="-"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">{t('recession')}</label>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((idx) => (
                                <input
                                  key={`gm-${surface}-${idx}`}
                                  type="number"
                                  min="-10"
                                  max="15"
                                  value={currentPeriodontogram.teeth[selectedTooth]?.gingivalMargin?.[surface as 'buccal' | 'lingual']?.[idx] ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                    const currentGM = currentPeriodontogram.teeth[selectedTooth]?.gingivalMargin || { buccal: [null, null, null], lingual: [null, null, null] };
                                    const newGM = [...currentGM[surface as 'buccal' | 'lingual']];
                                    newGM[idx] = val;
                                    updateToothData(selectedTooth, { gingivalMargin: { ...currentGM, [surface]: newGM } });
                                  }}
                                  className="w-full text-center py-1 text-sm border-slate-200 focus:ring-teal-600 focus:border-teal-600 rounded-lg border"
                                  placeholder="0"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t('bleeding')}</label>
                              <div className="flex gap-1 justify-between">
                                {[0, 1, 2].map((idx) => (
                                  <button
                                    key={`bop-${surface}-${idx}`}
                                    onClick={() => {
                                      const currentBOP = currentPeriodontogram.teeth[selectedTooth]?.bleeding || { buccal: [false, false, false], lingual: [false, false, false] };
                                      const newBOP = [...currentBOP[surface as 'buccal' | 'lingual']];
                                      newBOP[idx] = !newBOP[idx];
                                      updateToothData(selectedTooth, { bleeding: { ...currentBOP, [surface]: newBOP } });
                                    }}
                                    className={cn(
                                      "w-full h-6 rounded-md border transition-colors",
                                      currentPeriodontogram.teeth[selectedTooth]?.bleeding?.[surface as 'buccal' | 'lingual']?.[idx]
                                        ? "bg-red-500 border-red-600"
                                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t('suppuration')}</label>
                              <div className="flex gap-1 justify-between">
                                {[0, 1, 2].map((idx) => (
                                  <button
                                    key={`sup-${surface}-${idx}`}
                                    onClick={() => {
                                      const existingSup = currentPeriodontogram.teeth[selectedTooth]?.suppuration;
                                      const currentSup = (existingSup && typeof existingSup === 'object') ? existingSup : { buccal: [false, false, false], lingual: [false, false, false] };
                                      const newSup = [...currentSup[surface as 'buccal' | 'lingual']];
                                      newSup[idx] = !newSup[idx];
                                      updateToothData(selectedTooth, { suppuration: { ...currentSup, [surface]: newSup } });
                                    }}
                                    className={cn(
                                      "w-full h-6 rounded-md border transition-colors",
                                      currentPeriodontogram.teeth[selectedTooth]?.suppuration?.[surface as 'buccal' | 'lingual']?.[idx]
                                        ? "bg-yellow-400 border-yellow-500"
                                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t('plaque')}</label>
                            <div className="flex gap-1 justify-between">
                              {[0, 1, 2].map((idx) => (
                                <button
                                  key={`plaque-${surface}-${idx}`}
                                  onClick={() => {
                                    const currentPlaque = currentPeriodontogram.teeth[selectedTooth]?.plaque || { buccal: [false, false, false], lingual: [false, false, false] };
                                    const newPlaque = [...currentPlaque[surface as 'buccal' | 'lingual']];
                                    newPlaque[idx] = !newPlaque[idx];
                                    updateToothData(selectedTooth, { plaque: { ...currentPlaque, [surface]: newPlaque } });
                                  }}
                                  className={cn(
                                    "w-full h-6 rounded-md border transition-colors",
                                    currentPeriodontogram.teeth[selectedTooth]?.plaque?.[surface as 'buccal' | 'lingual']?.[idx]
                                      ? "bg-slate-800 border-slate-900"
                                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('mobility')}</label>                          <select
                          value={currentPeriodontogram.teeth[selectedTooth]?.mobility ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : Number(e.target.value);
                            updateToothData(selectedTooth, { mobility: val });
                          }}
                          className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-600 focus:border-teal-600 sm:text-sm rounded-xl border"
                        >
                          <option value="">{t('none')}</option>
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('furcation')}</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['buccal', 'lingual'].map(surface => (
                            <div key={surface}>
                              <select
                                value={currentPeriodontogram.teeth[selectedTooth]?.furcation?.[surface as 'buccal' | 'lingual'] ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : Number(e.target.value);
                                  const currentFurcation = currentPeriodontogram.teeth[selectedTooth]?.furcation || { buccal: null, lingual: null, mesial: null, distal: null };
                                  updateToothData(selectedTooth, { furcation: { ...currentFurcation, [surface]: val } });
                                }}
                                className="block w-full pl-2 pr-8 py-1.5 text-xs border-slate-300 focus:outline-none focus:ring-teal-600 focus:border-teal-600 rounded-lg border"
                              >
                                <option value="">{t(surface)}</option>
                                <option value="1">I</option>
                                <option value="2">II</option>
                                <option value="3">III</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedTooth(null)}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  {t('done')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      </AnimatePresence>

      {/* AI Report Section */}
      <div className="bg-white shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-teal-600" />
            {t('ai_analysis')}
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={generateReport}
              disabled={generatingReport}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              {generatingReport ? t('analyzing') : t('generate_report')}
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {report ? (
            <motion.div 
              key="report-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 bg-slate-50"
            >
              <div ref={reportRef} id="ai-report-content" className="max-w-4xl mx-auto bg-white shadow-sm border border-slate-200 rounded-2xl p-8 md:p-12">
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-100">
                <div>
                  <div className="print:block hidden mb-6">
                    <img src="/logo_texto.png" alt="PerioVox" className="h-12 w-auto object-contain" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{t('report')}</h2>
                  {report.classification && (
                    <div className="mt-6 p-4 bg-teal-50 border border-teal-100 rounded-xl">
                      <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wide">{t('suggested_classification')}</h3>
                      <p className="text-lg text-teal-900 font-medium mt-1">{report.classification.match(/(Estadio\s+[IV]+,\s*Grado\s+[A-C]|Stage\s+[IV]+,\s*Grade\s+[A-C])/i)?.[1] || report.classification}</p>
                    </div>
                  )}
                  <p className="text-sm text-slate-500">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="h-12 w-12 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <div className="space-y-10">
                {/* Summary Section */}
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100/50">
                  <div className="flex items-start gap-4">
                    <div className="bg-teal-600 p-3 rounded-xl shadow-sm">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-teal-900 mb-2">{t('executive_summary')}</h3>
                      <p className="text-teal-800 leading-relaxed">{report.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('key_metrics')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-light text-slate-800 mb-1">{report.keyMetrics?.teethWithPockets || 0}</div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('probing_depth_4mm')}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-light text-red-500 mb-1 flex items-center gap-1">
                        {report.keyMetrics?.bleedingSites || 0}
                      </div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('bleeding_sites')}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-light text-amber-500 mb-1">{report.keyMetrics?.plaqueSites || 0}</div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('plaque_sites')}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-light text-slate-800 mb-1">{report.keyMetrics?.missingTeeth || 0}</div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('missing_teeth_count')}</div>
                    </div>
                  </div>
                </div>

                {/* Prognosis */}
                <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('prognosis')}</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide",
                      report.prognosis?.overall?.toLowerCase() === 'good' || report.prognosis?.overall?.toLowerCase() === 'bueno' ? "bg-emerald-500/20 text-emerald-400" :
                      report.prognosis?.overall?.toLowerCase() === 'fair' || report.prognosis?.overall?.toLowerCase() === 'regular' ? "bg-blue-500/20 text-blue-400" :
                      report.prognosis?.overall?.toLowerCase() === 'poor' || report.prognosis?.overall?.toLowerCase() === 'pobre' ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    )}>
                      {report.prognosis?.overall}
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {report.prognosis?.details}
                  </p>
                </div>

                {/* Treatment Plan */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ListTodo className="w-4 h-4" />
                    {t('treatment_plan')}
                  </h3>
                  <div className="space-y-4">
                    {report.treatmentPlan?.map((plan: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <h4 className="text-base font-bold text-teal-700 mb-3">{plan.phase}</h4>
                        <ul className="space-y-2">
                          {plan.actions?.map((action: string, actIdx: number) => (
                            <li key={actIdx} className="flex items-start gap-3 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 italic">
                  {t('ai_powered_analysis')}
                </p>
              </div>
            </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        {!report && !generatingReport && (
          <div className="p-12 text-center text-slate-500">
            {t('ai_prompt_msg')}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg leading-6 font-medium text-slate-900 flex items-center capitalize">
            {t('comments') || 'Comments'}
          </h3>
        </div>
        <div className="p-6">
          <textarea
            value={currentPeriodontogram.notes || ''}
            onChange={(e) => {
              setCurrentPeriodontogram({ ...currentPeriodontogram, notes: e.target.value });
              debouncedSave();
            }}
            placeholder={t('add_comments_placeholder') || 'Add comments...'}
            className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 focus:border-teal-600 focus:ring-0 transition-all text-sm min-h-[120px] resize-y"
          />
        </div>
      </div>
          </motion.div>
        )}

        {activeTab === 'lang' && (
          <motion.div
            key="lang"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <LangDiagram />
          </motion.div>
        )}

        {activeTab === 'idra' && (
          <motion.div
            key="idra"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <IDRAAssessment />
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'periodontogram' && (
        <>
          {/* Fixed Bottom Action Bar */}
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:pl-64 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
        <div className="w-full sm:w-auto">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white transition-colors ${
              isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isRecording ? (
              <><MicOff className="w-5 h-5 mr-2" /> {t('stop_voice')}</>
            ) : (
              <><Mic className="w-5 h-5 mr-2" /> {t('start_voice')}</>
            )}
          </button>
        </div>
        <div className="flex items-center justify-end gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={handleExportCSV}
            className="whitespace-nowrap inline-flex items-center px-4 py-3 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('export_csv')}
          </button>
          
          <button
            onClick={handleExportChartPDF}
            disabled={isExportingChartPDF}
            className="whitespace-nowrap inline-flex items-center px-4 py-3 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors disabled:opacity-50"
          >
            {isExportingChartPDF ? (
              <div className="w-4 h-4 mr-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {t('export_pdf')}
          </button>
          
          {report && (
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="whitespace-nowrap inline-flex items-center px-4 py-3 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors disabled:opacity-50"
            >
              {isExportingPDF ? (
                <div className="w-4 h-4 mr-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              {t('report')} PDF
            </button>
          )}
        </div>
      </motion.div>
      </>
      )}
    </motion.div>
  );
}
