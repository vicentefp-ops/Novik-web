import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToothData } from '../types';
import { useStore } from '../store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PeriodontogramChartProps {
  teeth: Record<number, ToothData>;
  onToothClick?: (toothNumber: number) => void;
  activeTooth?: number | null;
  activeSurface?: 'buccal' | 'lingual' | null;
}

export function PeriodontogramChart({ teeth, onToothClick, activeTooth, activeSurface }: PeriodontogramChartProps) {
  const { t } = useTranslation();
  const { settings } = useStore();

  const fdiUpperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const fdiUpperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const fdiLowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const fdiLowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  const adaUpperRight = [1, 2, 3, 4, 5, 6, 7, 8];
  const adaUpperLeft = [9, 10, 11, 12, 13, 14, 15, 16];
  const adaLowerLeft = [17, 18, 19, 20, 21, 22, 23, 24];
  const adaLowerRight = [32, 31, 30, 29, 28, 27, 26, 25];

  const upperRight = settings.numberingSystem === 'FDI' ? fdiUpperRight : adaUpperRight;
  const upperLeft = settings.numberingSystem === 'FDI' ? fdiUpperLeft : adaUpperLeft;
  const lowerRight = settings.numberingSystem === 'FDI' ? fdiLowerRight : adaLowerRight;
  const lowerLeft = settings.numberingSystem === 'FDI' ? fdiLowerLeft : adaLowerLeft;

  const upperArch = [...upperRight, ...upperLeft];
  const lowerArch = [...lowerRight, ...lowerLeft];

  const TOOTH_WIDTH = 55;
  const CHART_HEIGHT = 180;
  const BASE_LINE = 90; // The CEJ line
  const SCALE = 4; // 1mm = 4px

  const getPoints = (arch: number[], surface: 'buccal' | 'lingual', type: 'pd' | 'gm', isUpper: boolean) => {
    const direction = isUpper ? -1 : 1; // -1 means towards top (upper roots), 1 means towards bottom (lower roots)

    const points: { x: number, y: number }[] = [];
    arch.forEach((toothNum, toothIdx) => {
      const tooth = teeth[toothNum];
      if (tooth?.missing) {
        // Skip missing teeth or add a break? For curves, we usually skip or interpolate.
        // Let's add points at BASE_LINE for missing teeth to keep the line continuous but flat.
        for (let i = 0; i < 3; i++) {
          points.push({
            x: toothIdx * TOOTH_WIDTH + (i + 1) * (TOOTH_WIDTH / 4),
            y: BASE_LINE
          });
        }
        return;
      }

      const values = type === 'pd' 
        ? tooth?.probingDepth?.[surface] 
        : tooth?.gingivalMargin?.[surface];
      
      const gmValues = tooth?.gingivalMargin?.[surface] || [0, 0, 0];

      (values || [0, 0, 0]).forEach((val, valIdx) => {
        const x = toothIdx * TOOTH_WIDTH + (valIdx + 1) * (TOOTH_WIDTH / 4);
        let y = BASE_LINE;
        
        if (type === 'gm') {
          y = BASE_LINE + (Number(val || 0) * SCALE * direction);
        } else {
          const gm = Number(gmValues[valIdx] || 0);
          const pd = Number(val || 0);
          y = BASE_LINE + ((gm + pd) * SCALE * direction);
        }
        points.push({ x, y });
      });
    });
    return points;
  };

  const renderFilledArea = (points1: { x: number, y: number }[], points2: { x: number, y: number }[], color: string) => {
    if (points1.length === 0 || points2.length === 0) return null;
    
    // Create path for the first curve (left to right)
    const d1 = points1.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points1[i - 1];
      const cp1x = prev.x + (p.x - prev.x) / 2;
      return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
    }, '');

    // Create path for the second curve (right to left)
    const d2 = [...points2].reverse().reduce((acc, p, i) => {
      if (i === 0) return `L ${p.x} ${p.y}`;
      const prev = [...points2].reverse()[i - 1];
      const cp1x = prev.x + (p.x - prev.x) / 2;
      return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
    }, '');

    return (
      <path 
        d={`${d1} ${d2} Z`} 
        fill={color} 
        fillOpacity="0.3" 
      />
    );
  };

  const renderCurve = (points: { x: number, y: number }[], color: string) => {
    if (points.length === 0) return null;
    const d = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cp1x = prev.x + (p.x - prev.x) / 2;
      return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
    }, '');

    return (
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    );
  };

  const renderArchSection = (arch: number[], surface: 'buccal' | 'lingual', title: string) => {
    const isUpper = arch[0] < 30;
    const gmPoints = getPoints(arch, surface, 'gm', isUpper);
    const pdPoints = getPoints(arch, surface, 'pd', isUpper);

    const getToothPaths = (toothNum: number) => {
      const lastDigit = toothNum % 10;
      const isUpperTooth = toothNum < 30;
      
      let type = 'incisor';
      if (lastDigit === 3) type = 'canine';
      else if (lastDigit === 4 || lastDigit === 5) type = 'premolar';
      else if (lastDigit >= 6) type = 'molar';

      const paths = {
        incisor: {
          crown: "M -8,0 C -9,10 -7,22 -5,28 C -2,30 2,30 5,28 C 7,22 9,10 8,0 Z",
          root: "M -8,0 C -7,-15 -5,-35 0,-45 C 5,-35 7,-15 8,0 Z",
          innerRoot: "M -3,0 C -2,-15 -1,-30 0,-40 C 1,-30 2,-15 3,0 Z"
        },
        canine: {
          crown: "M -9,0 C -10,12 -7,25 0,35 C 7,25 10,12 9,0 Z",
          root: "M -9,0 C -8,-20 -6,-45 0,-52 C 6,-45 8,-20 9,0 Z",
          innerRoot: "M -3,0 C -2,-20 -1,-35 0,-45 C 1,-35 2,-20 3,0 Z"
        },
        premolar: {
          crown: "M -10,0 C -11,10 -8,20 -5,25 C -2,26 2,26 5,25 C 8,20 11,10 10,0 Z",
          root: isUpperTooth 
            ? "M -10,0 C -10,-15 -8,-30 -5,-40 C -3,-25 -1,-10 0,0 C 1,-10 3,-25 5,-40 C 8,-30 10,-15 10,0 Z"
            : "M -10,0 C -9,-15 -6,-35 0,-45 C 6,-35 9,-15 10,0 Z",
          innerRoot: isUpperTooth
            ? "M -7,0 C -6,-12 -4,-25 -3,-35 M 7,0 C 6,-12 4,-25 3,-35"
            : "M -3,0 C -2,-15 -1,-25 0,-38 C 1,-25 2,-15 3,0 Z"
        },
        molar: {
          crown: "M -14,0 C -15,8 -12,18 -8,24 C -4,26 4,26 8,24 C 12,18 15,8 14,0 Z",
          root: isUpperTooth 
            ? "M -14,0 C -14,-15 -12,-35 -8,-45 C -5,-30 -3,-15 -2,0 C -2,-15 0,-40 2,-48 C 4,-40 6,-15 6,0 C 6,-15 8,-30 12,-45 C 16,-35 14,-15 14,0 Z" 
            : "M -14,0 C -14,-15 -10,-40 -6,-48 C -3,-30 -1,-15 0,0 C 1,-15 3,-30 6,-48 C 10,-40 14,-15 14,0 Z",
          innerRoot: isUpperTooth
            ? "M -10,0 C -9,-15 -7,-25 -6,-38 M 2,0 C 2,-15 1,-30 1,-42 M 10,0 C 9,-15 7,-25 6,-38"
            : "M -10,0 C -9,-15 -7,-30 -5,-42 M 10,0 C 9,-15 7,-30 5,-42"
        }
      };
      return paths[type as keyof typeof paths];
    };

    const LABEL_WIDTH = 100;
    const TOTAL_WIDTH = LABEL_WIDTH + arch.length * TOOTH_WIDTH;

    return (
      <div 
        id={`section-${isUpper ? 'maxillary' : 'mandibular'}-${surface}`}
        className="flex flex-col bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden scroll-mt-24"
      >
        <div className="flex items-center w-full mb-6">
          <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 uppercase tracking-wider">{title}</div>
          <div className="flex-1 h-px bg-slate-100 ml-4"></div>
        </div>
        
        <div className="w-full overflow-x-auto pb-4">
          <div className="flex flex-col" style={{ minWidth: TOTAL_WIDTH }}>
            {/* SVG Container */}
            <div className="flex">
              <div style={{ width: LABEL_WIDTH, flexShrink: 0 }}></div>
              <div className="relative" style={{ width: arch.length * TOOTH_WIDTH, height: CHART_HEIGHT, flexShrink: 0 }}>
                {/* Main SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width={arch.length * TOOTH_WIDTH} height={CHART_HEIGHT} className="absolute top-0 left-0 overflow-visible z-0">
                  <defs>
                    <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#e2e8f0" />
                      <stop offset="25%" stopColor="#ffffff" />
                      <stop offset="75%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                    <linearGradient id="rootGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d4d4d8" />
                      <stop offset="25%" stopColor="#fef3c7" />
                      <stop offset="75%" stopColor="#fde68a" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                    <linearGradient id="implantGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#64748b" />
                      <stop offset="30%" stopColor="#cbd5e1" />
                      <stop offset="70%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                    <filter id="toothShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
                    </filter>
                    <filter id="innerShadow">
                      <feOffset dx="0" dy="0"/>
                      <feGaussianBlur stdDeviation="1.5" result="offset-blur"/>
                      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
                      <feFlood floodColor="black" floodOpacity="0.2" result="color"/>
                      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
                      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
                    </filter>
                  </defs>

                  {/* Grid lines */}
                  {[...Array(21)].map((_, i) => {
                    const mm = i - 10;
                    if (mm === 0) return null;
                    if (mm % 2 !== 0) return null;
                    const y = BASE_LINE + mm * SCALE;
                    return <line key={`grid-${i}`} x1="0" y1={y} x2={arch.length * TOOTH_WIDTH} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  })}
                  <line x1="0" y1={BASE_LINE} x2={arch.length * TOOTH_WIDTH} y2={BASE_LINE} stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Teeth Drawings */}
                  {arch.map((toothNum, index) => {
                    const xCenter = index * TOOTH_WIDTH + TOOTH_WIDTH / 2;
                    const tooth = teeth[toothNum];
                    const isMissing = tooth?.missing;
                    const isImplant = tooth?.implant;
                    const { crown, root, innerRoot } = getToothPaths(toothNum);

                    return (
                      <g key={`tooth-${toothNum}`} transform={`translate(${xCenter}, ${BASE_LINE}) ${!isUpper ? 'scale(1, -1)' : ''}`}>
                        {isMissing ? (
                          <path d={`${crown} ${root}`} fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3 3" />
                        ) : isImplant ? (
                          <>
                            <path d={crown} fill="url(#crownGrad)" stroke="#94a3b8" strokeWidth="1" filter="url(#toothShadow)" />
                            <path d="M -4,-2 L -4,-30 L 0,-35 L 4,-30 L 4,-2 Z" fill="url(#implantGrad)" stroke="#64748b" strokeWidth="1" filter="url(#toothShadow)" />
                            <path d="M -6,-10 L 6,-10 M -6,-15 L 6,-15 M -6,-20 L 6,-20 M -6,-25 L 6,-25" stroke="#64748b" strokeWidth="1.5" />
                          </>
                        ) : (
                          <>
                            <path d={root} fill="url(#rootGrad)" stroke="#b45309" strokeWidth="0.5" filter="url(#innerShadow)" />
                            {innerRoot && <path d={innerRoot} fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />}
                            <path d={crown} fill="url(#crownGrad)" stroke="#94a3b8" strokeWidth="0.5" filter="url(#innerShadow)" />
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* Filled Areas */}
                  {renderFilledArea(gmPoints, pdPoints, '#ef4444')}
                  
                  {/* Curves */}
                  {renderCurve(pdPoints, '#ef4444')}
                  {renderCurve(gmPoints, '#ef4444')}
                </svg>

                {/* Interaction Overlay & Numbers */}
                <div className="absolute inset-0 flex z-10">
                  {arch.map((toothNum) => (
                    <div 
                      key={`overlay-${toothNum}`}
                      className={cn(
                        "relative flex flex-col items-center group h-full",
                        onToothClick && "cursor-pointer hover:bg-slate-50/50"
                      )}
                      style={{ width: TOOTH_WIDTH }}
                      onClick={() => onToothClick?.(toothNum)}
                    >
                      <div className={cn(
                        "absolute text-xs font-bold transition-colors top-1",
                        teeth[toothNum]?.missing ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-teal-600"
                      )}>
                        {toothNum}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Table below the arch */}
            <div className="mt-0">
              <table className="border-collapse text-xs" style={{ width: TOTAL_WIDTH, tableLayout: 'fixed' }}>
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 p-1.5 text-slate-500 font-bold uppercase text-left whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: LABEL_WIDTH }}># {t('tooth')}</th>
                    {arch.map(num => {
                      const isActive = activeTooth === num && activeSurface === surface;
                      const isRightQuadrant = (num <= 18 && num >= 11) || (num <= 48 && num >= 41);
                      return (
                        <th 
                          key={num} 
                          className={cn(
                            "border border-slate-200 p-1.5 text-slate-700 font-bold text-center relative cursor-pointer hover:bg-slate-100 transition-colors",
                            isActive ? "bg-blue-100 ring-2 ring-blue-500 z-10" : ""
                          )} 
                          style={{ width: TOOTH_WIDTH }}
                          onClick={() => onToothClick?.(num)}
                        >
                          {isActive && (
                            <div className="absolute -top-5 left-0 right-0 flex justify-center items-center text-blue-600 text-[10px] font-bold whitespace-nowrap">
                              {isRightQuadrant ? 'D → M' : 'M → D'}
                            </div>
                          )}
                          {num}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* Probing Depth Row */}
                  <tr>
                    <td className="border border-slate-200 p-1.5 font-bold text-slate-600 bg-slate-50 whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: LABEL_WIDTH }}>{t('probing_depth_short')}</td>
                    {arch.map(num => {
                      const isActive = activeTooth === num && activeSurface === surface;
                      const vals = teeth[num]?.probingDepth?.[surface] || [null, null, null];
                      return (
                        <td 
                          key={num} 
                          className={cn("border border-slate-200 p-0 relative cursor-pointer hover:bg-slate-50 transition-colors", isActive ? "bg-blue-50 ring-2 ring-blue-500 z-10" : "")} 
                          style={{ width: TOOTH_WIDTH }}
                          onClick={() => onToothClick?.(num)}
                        >
                          <div className="flex divide-x divide-slate-100">
                            {vals.map((v, i) => (
                              <div key={i} className={cn(
                                "flex-1 text-center py-1.5 relative",
                                v !== null && v >= 4 ? "bg-red-50 text-red-600 font-bold" : "text-slate-700"
                              )}>
                                {v ?? '-'}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {/* Gingival Margin Row */}
                  <tr>
                    <td className="border border-slate-200 p-1.5 font-bold text-slate-600 bg-slate-50 whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: LABEL_WIDTH }}>{t('gingival_margin_short')}</td>
                    {arch.map(num => {
                      const isActive = activeTooth === num && activeSurface === surface;
                      const vals = teeth[num]?.gingivalMargin?.[surface] || [null, null, null];
                      return (
                        <td 
                          key={num} 
                          className={cn("border border-slate-200 p-0 relative cursor-pointer hover:bg-slate-50 transition-colors", isActive ? "bg-blue-50 ring-2 ring-blue-500 z-10" : "")} 
                          style={{ width: TOOTH_WIDTH }}
                          onClick={() => onToothClick?.(num)}
                        >
                          <div className="flex divide-x divide-slate-100">
                            {vals.map((v, i) => (
                              <div key={i} className="flex-1 text-center py-1.5 text-slate-500 font-medium">
                                {v ?? '0'}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {/* NIC Row (CAL) */}
                  <tr className="bg-slate-50/50">
                    <td className="border border-slate-200 p-1.5 font-bold text-slate-900 bg-slate-100/50 whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: LABEL_WIDTH }}>NIC</td>
                    {arch.map(num => {
                      const isActive = activeTooth === num && activeSurface === surface;
                      const pd = teeth[num]?.probingDepth?.[surface] || [null, null, null];
                      const gm = teeth[num]?.gingivalMargin?.[surface] || [null, null, null];
                      return (
                        <td 
                          key={num} 
                          className={cn("border border-slate-200 p-0 relative cursor-pointer hover:bg-slate-50 transition-colors", isActive ? "bg-blue-50 ring-2 ring-blue-500 z-10" : "")} 
                          style={{ width: TOOTH_WIDTH }}
                          onClick={() => onToothClick?.(num)}
                        >
                          <div className="flex divide-x divide-slate-100">
                            {pd.map((v, i) => {
                              const cal = (v !== null ? v : 0) + (gm[i] !== null ? gm[i]! : 0);
                              const hasData = v !== null || gm[i] !== null;
                              return (
                                <div key={i} className={cn(
                                  "flex-1 text-center py-1.5 font-bold",
                                  hasData && cal >= 4 ? "text-red-700" : "text-slate-900"
                                )}>
                                  {hasData ? cal : '-'}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {/* Furcation Row */}
                  <tr>
                    <td className="border border-slate-200 p-1.5 font-bold text-slate-600 bg-slate-50 whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: LABEL_WIDTH }}>{t('furcation')}</td>
                    {arch.map(num => {
                      const isActive = activeTooth === num && activeSurface === surface;
                      const furc = teeth[num]?.furcation?.[surface as 'buccal' | 'lingual'];
                      return (
                        <td 
                          key={num} 
                          className={cn("border border-slate-200 p-1.5 text-center relative cursor-pointer hover:bg-slate-50 transition-colors", isActive ? "bg-blue-50 ring-2 ring-blue-500 z-10" : "")} 
                          style={{ width: TOOTH_WIDTH }}
                          onClick={() => onToothClick?.(num)}
                        >
                          {furc ? (
                            <div className="flex justify-center">
                              <div className="w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                {furc}
                              </div>
                            </div>
                          ) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                  {/* Suppuration Row */}
                  <tr>
                    <td className="border border-slate-200 p-1.5 font-bold text-slate-600 bg-slate-50 whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: LABEL_WIDTH }}>{t('suppuration')}</td>
                    {arch.map(num => {
                      const isActive = activeTooth === num && activeSurface === surface;
                      const sup = teeth[num]?.suppuration?.[surface] || [false, false, false];
                      return (
                        <td 
                          key={num} 
                          className={cn("border border-slate-200 p-0 relative cursor-pointer hover:bg-slate-50 transition-colors", isActive ? "bg-blue-50 ring-2 ring-blue-500 z-10" : "")} 
                          style={{ width: TOOTH_WIDTH }}
                          onClick={() => onToothClick?.(num)}
                        >
                          <div className="flex divide-x divide-slate-100 h-full">
                            {sup.map((s, i) => (
                              <div key={i} className="flex-1 flex justify-center items-center py-1.5">
                                {s && (
                                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-sm animate-pulse" title={t('suppuration')} />
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {/* Bleeding Row */}
                  <tr>
                    <td className="border border-slate-200 p-1.5 font-bold text-slate-600 bg-slate-50 whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: LABEL_WIDTH }}>{t('bleeding')}</td>
                    {arch.map(num => {
                      const isActive = activeTooth === num && activeSurface === surface;
                      const bop = teeth[num]?.bleeding?.[surface] || [false, false, false];
                      return (
                        <td 
                          key={num} 
                          className={cn("border border-slate-200 p-0 relative cursor-pointer hover:bg-slate-50 transition-colors", isActive ? "bg-blue-50 ring-2 ring-blue-500 z-10" : "")} 
                          style={{ width: TOOTH_WIDTH }}
                          onClick={() => onToothClick?.(num)}
                        >
                          <div className="flex divide-x divide-slate-100 h-full">
                            {bop.map((b, i) => (
                              <div key={i} className="flex-1 flex justify-center items-center py-1.5">
                                {b && (
                                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" title={t('bleeding')} />
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {/* Plaque Row */}
                  <tr>
                    <td className="border border-slate-200 p-1.5 font-bold text-slate-600 bg-slate-50 whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: LABEL_WIDTH }}>{t('plaque')}</td>
                    {arch.map(num => {
                      const isActive = activeTooth === num && activeSurface === surface;
                      const plaque = teeth[num]?.plaque?.[surface] || [false, false, false];
                      return (
                        <td 
                          key={num} 
                          className={cn("border border-slate-200 p-0 relative cursor-pointer hover:bg-slate-50 transition-colors", isActive ? "bg-blue-50 ring-2 ring-blue-500 z-10" : "")} 
                          style={{ width: TOOTH_WIDTH }}
                          onClick={() => onToothClick?.(num)}
                        >
                          <div className="flex divide-x divide-slate-100 h-full">
                            {plaque.map((p, i) => (
                              <div key={i} className="flex-1 flex justify-center items-center py-1.5">
                                {p && (
                                  <div className="w-2.5 h-2.5 bg-slate-700 rounded-full shadow-sm" title={t('plaque')} />
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {/* Mobility Row */}
                  <tr>
                    <td className="border border-slate-200 p-1.5 font-bold text-slate-600 bg-slate-50 whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: LABEL_WIDTH }}>{t('mobility')}</td>
                    {arch.map(num => {
                      const isActive = activeTooth === num && activeSurface === surface;
                      const mobility = teeth[num]?.mobility;
                      return (
                        <td 
                          key={num} 
                          className={cn("border border-slate-200 p-1.5 text-center relative cursor-pointer hover:bg-slate-50 transition-colors", isActive ? "bg-blue-50 ring-2 ring-blue-500 z-10" : "")} 
                          style={{ width: TOOTH_WIDTH }}
                          onClick={() => onToothClick?.(num)}
                        >
                          <span className={cn(
                            "font-bold",
                            mobility && mobility > 0 ? "text-teal-600" : "text-slate-400"
                          )}>
                            {mobility ?? '0'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-12 py-4">
      <div className="space-y-8">
        <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest">{t('maxillary_arch')}</h3>
        {renderArchSection(upperArch, 'buccal', t('buccal'))}
        {renderArchSection(upperArch, 'lingual', t('lingual'))}
      </div>

      <div className="space-y-8">
        <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest">{t('mandibular_arch')}</h3>
        {renderArchSection(lowerArch, 'buccal', t('buccal'))}
        {renderArchSection(lowerArch, 'lingual', t('lingual'))}
      </div>

      <div className="flex items-center justify-center gap-8 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500"></div>
          <span className="text-xs text-slate-500">{t('gingival_margin')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-teal-600"></div>
          <span className="text-xs text-slate-500">{t('probing_depth')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs text-slate-500">{t('bleeding')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
          <span className="text-xs text-slate-500">{t('suppuration')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-700 rounded-full"></div>
          <span className="text-xs text-slate-500">{t('plaque')}</span>
        </div>
      </div>
    </div>
  );
}

