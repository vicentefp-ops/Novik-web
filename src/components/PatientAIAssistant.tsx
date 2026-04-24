import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Send, FileDown, Sparkles, Loader2, BarChart3 } from 'lucide-react';
import { Patient, Periodontogram } from '../types';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface PatientAIAssistantProps {
  patient: Patient;
  periodontograms: Periodontogram[];
  onSaveReport?: (content: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  chartData?: any;
}

export function PatientAIAssistant({ patient, periodontograms, onSaveReport }: PatientAIAssistantProps) {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((messages.length > 0 || isThinking) && reportRef.current) {
      reportRef.current.scrollTop = reportRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const recognitionRef = useRef<any>(null);
  const initialInputRef = useRef<string>('');

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = i18n.language.startsWith('es') ? 'es-ES' : 'en-US';

      let finalTranscript = '';

      let silenceTimer: any;

      const resetSilenceTimer = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
          }
        }, 5000); // 5 seconds
      };

      recognitionRef.current.onresult = (event: any) => {
        resetSilenceTimer();
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setInput(() => {
          const initial = initialInputRef.current;
          const prefix = initial && !initial.endsWith(' ') ? initial + ' ' : initial;
          return prefix + finalTranscript + interimTranscript;
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        finalTranscript = '';
      };
    }
  }, [i18n.language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        try {
          initialInputRef.current = input;
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error("Could not start speech recognition", e);
          setIsListening(false);
        }
      } else {
        alert(t('speech_not_supported') || "Speech recognition is not supported in this browser.");
      }
    }
  };

  const handleSend = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if (!input.trim() || isThinking) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      // Prepare context
      const context = {
        patient: {
          clinicalRecord: patient.clinicalRecord,
          ageRange: patient.ageRange,
          riskFactors: patient.riskFactors,
          hygieneHabits: patient.hygieneHabits,
          perception: patient.perception
        },
        periodontograms: periodontograms.map(p => ({
          date: p.date,
          checkIn: p.checkIn,
          langDiagram: p.langDiagram,
          idra: p.idra,
          summary: Object.values(p.teeth).map(t => ({
            tooth: t.toothNumber,
            pd: t.probingDepth,
            bop: t.bleeding,
            sup: t.suppuration,
            plaque: t.plaque,
            mobility: t.mobility
          }))
        }))
      };

      const systemInstruction = `You are an expert Periodontist AI Assistant. 
      Analyze the provided patient data and periodontograms.
      Provide detailed, clinical, and helpful responses.
      If the user asks for a comparison or evolution, analyze the changes over time.
      
      IMPORTANT: Take into account the "Periodontal Risk Assessment" (Lang Diagram/PRA) and "Implant Disease Risk Assessment" (IDRA) data if provided in the context. Use these metrics to provide a more accurate prognosis and risk assessment.
      
      IMPORTANT: When the user provides numerical measurements, interpret them as "probing depths" (bolsas periodontales) by default, unless the user explicitly mentions "gingival margin" (margen gingival) or "recession" (recesión).
      
      IMPORTANT: At the beginning of every report, you MUST provide a "${t('classification_suggestion')}" based on the following criteria:
      
      ${t('stage')}:
      - Stage I: CAL 1-2mm, Bone loss <15% (coronal third), PD <= 4mm, horizontal bone loss.
      - Stage II: CAL 3-4mm, Bone loss 15-33% (coronal third), PD <= 5mm, horizontal bone loss.
      - Stage III: CAL >= 5mm, Bone loss to middle/apical third, PD >= 6mm, vertical bone loss >= 3mm, furcation II/III, moderate ridge defect.
      - Stage IV: CAL >= 5mm, Bone loss to middle/apical third, PD >= 6mm, >= 5 teeth lost due to perio, complex rehab needed, masticatory dysfunction, occlusal trauma, advanced ridge defect.
      
      ${t('grade')}:
      - Grade A: No bone/CAL loss in 5 years, bone loss/age < 0.25, heavy biofilm/low destruction, non-smoker, no diabetes.
      - Grade B: Bone loss < 2mm in 5 years, bone loss/age 0.25-1.0, destruction proportional to biofilm, < 10 cig/day, HbA1c < 7 with diabetes.
      - Grade C: Bone loss >= 2mm in 5 years, bone loss/age > 1.0, rapid progression, early onset, >= 10 cig/day, HbA1c >= 7 with diabetes.
      
      IMPORTANT: If you want to include a chart, append a JSON block at the end of your response in this format:
      \`\`\`json
      {
        "chart": {
          "type": "line" | "bar",
          "title": "Chart Title",
          "data": [
            { "label": "Date/Category", "value1": 10, "value2": 20 }
          ],
          "keys": ["value1", "value2"]
        }
      }
      \`\`\`
      Use "line" for evolution over time and "bar" for comparisons.
      ${t('ai_response_language')}
      
      IMPORTANT: When speaking Spanish, use a clear 'castellano de Madrid' (Castilian Spanish from Madrid) accent and vocabulary (e.g., use 'vosotros' instead of 'ustedes', 'c' and 'z' as /θ/, etc.).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: [
          { role: 'user', parts: [{ text: `Context: ${JSON.stringify(context)}` }] },
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const text = response.text || '';
      
      // Extract chart data if present
      let chartData = undefined;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let cleanText = text;
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.chart) {
            // Sanitize data values to be numbers
            if (parsed.chart.data && Array.isArray(parsed.chart.data)) {
              parsed.chart.data = parsed.chart.data.map((item: any) => {
                const newItem = { ...item };
                if (parsed.chart.keys && Array.isArray(parsed.chart.keys)) {
                  parsed.chart.keys.forEach((key: string) => {
                    if (typeof newItem[key] === 'string') {
                      const numStr = newItem[key].replace(/[^0-9.]/g, '');
                      newItem[key] = parseFloat(numStr) || 0;
                    }
                  });
                }
                return newItem;
              });
            }
            chartData = parsed.chart;
            cleanText = text.replace(jsonMatch[0], '').trim();
          }
        } catch (e) {
          console.error("Failed to parse chart JSON", e);
        }
      } else {
        console.log("No chart JSON match found in text:", text);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: cleanText, chartData }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('ai_error') }]);
    } finally {
      setIsThinking(false);
    }
  };

  const downloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    
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
      
      const canvas = await toCanvas(element, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 896
      });
      
      // Restore original styles
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
      
      pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
      heightLeft -= (pageHeight - margin * 2);
      
      while (heightLeft > 0) {
        position -= (pageHeight - margin * 2);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
        heightLeft -= (pageHeight - margin * 2);
      }
      
      pdf.save(`Patient_Analysis_${patient.clinicalRecord}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(t('failed_to_generate_pdf'));
    }
  };

  const renderChart = (chart: any) => {
    if (!chart) return null;

    return (
      <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-teal-600" />
          {chart.title}
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === 'line' ? (
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" fontSize={10} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={10} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                {chart.keys.map((key: string, idx: number) => (
                  <Line 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={idx === 0 ? '#0ea5e9' : '#10b981'} 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" fontSize={10} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={10} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                {chart.keys.map((key: string, idx: number) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    fill={idx === 0 ? '#0ea5e9' : '#10b981'} 
                    radius={[4, 4, 0, 0]} 
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t('ai_assistant')}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('ai_assistant_desc')}</p>
          </div>
        </div>
        {messages.some(m => m.role === 'assistant') && (
          <button 
            onClick={downloadPDF}
            className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">{t('download_pdf')}</span>
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={reportRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              {t('ask_ai')}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'bg-white border border-slate-100 text-slate-800 shadow-sm'
            }`}>
              <div className={`prose prose-sm prose-slate max-w-none ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                <Markdown>
                  {msg.content}
                </Markdown>
              </div>
              {msg.chartData && renderChart(msg.chartData)}
              {msg.role === 'assistant' && onSaveReport && (
                <button
                  onClick={() => {
                    console.log("Saving report...");
                    onSaveReport(msg.content);
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                >
                  <FileDown className="w-4 h-4" />
                  {t('action_save_report')}
                </button>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
              <span className="text-sm text-slate-500 italic">{t('ai_thinking')}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <button
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all ${
              isListening 
                ? 'bg-red-50 text-red-600 animate-pulse' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
            title={isListening ? t('stop_voice_query') : t('voice_query')}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('ask_ai')}
            className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-all shadow-lg shadow-teal-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
