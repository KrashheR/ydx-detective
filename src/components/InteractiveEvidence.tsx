import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type {
  DocumentScanEvidence,
  InteractiveEvidence,
  InteractiveEvidenceProgress,
  Language,
  SealMatchEvidence,
  ShadowTimeCheckEvidence,
  SurfaceRevealEvidence,
  ThermalScanEvidence,
} from '../types';
import { loc, t } from '../i18n/ui';
import { asset } from '../utils/asset';
import { tapHaptic } from '../utils/haptics';

export function makeInteractiveProgress(evidenceId: string): InteractiveEvidenceProgress {
  return {
    evidenceId,
    opened: true,
    analysisCompleted: false,
    discoveredAnomalyIds: [],
    discoveredTraceIds: [],
    revealPercentByTrace: {},
    selectedContradiction: false,
    hintLevel: 0,
    attempts: 0,
    resetCount: 0,
  };
}

interface Props<T extends InteractiveEvidence> {
  evidence: T;
  progress: InteractiveEvidenceProgress;
  lang: Language;
  onProgress: (progress: InteractiveEvidenceProgress) => void;
}

const modeKey = {
  normal: 'interactiveNormal', uv: 'interactiveUv', backlight: 'interactiveBacklight',
  side_light: 'interactiveSideLight', contrast: 'interactiveContrast', thermal: 'interactiveThermal',
} as const;

function firstImage(evidence: InteractiveEvidence): string | null {
  const values = Object.values(evidence.assets ?? {}).flat();
  return values.find((value) => value.endsWith('.webp')) ?? null;
}

function localizedSidecar(ru: string, en: string | undefined, lang: Language): string {
  return lang === 'ru' || lang === 'kk' ? ru : (en ?? ru);
}

function Shell({ evidence, progress, lang, onProgress, children }: Props<InteractiveEvidence> & { children: React.ReactNode }) {
  const reset = () => onProgress({ ...makeInteractiveProgress(evidence.id), resetCount: progress.resetCount + 1 });
  const hint = () => onProgress({ ...progress, hintLevel: Math.min(3, progress.hintLevel + 1) });
  return (
    <section className="space-y-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <p className="m-0 font-serif text-sm leading-relaxed text-ink">{loc(evidence.description!, lang)}</p>
      <p className="m-0 rounded-md border border-document-dash bg-white px-3 py-2 text-sm font-semibold text-text-light">{loc(evidence.instruction!, lang)}</p>
      {children}
      {progress.hintLevel > 0 && !progress.analysisCompleted && (
        <div className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-text-light">
          {progress.hintLevel === 1 ? loc(evidence.interactiveDesign!.why, lang) : progress.hintLevel === 2 ? loc(evidence.instruction!, lang) : `◎ ${loc(evidence.interactiveDesign!.playerAction, lang)}`}
        </div>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={hint} disabled={progress.analysisCompleted || progress.hintLevel >= 3} className="min-h-11 flex-1 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-text-light disabled:opacity-40">{t('interactiveHint', lang)} {progress.hintLevel}/3</button>
        <button type="button" onClick={reset} className="min-h-11 flex-1 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-text-light">{t('interactiveReset', lang)}</button>
      </div>
      {progress.analysisCompleted && (
        <div role="status" className="rounded-md border border-accent bg-accent/10 px-3 py-3">
          <div className="font-mono text-xs font-bold uppercase tracking-wide text-accent">✓ {t('interactiveComplete', lang)}</div>
          <p className="mb-0 mt-2 text-sm leading-relaxed text-ink">{loc(evidence.interactiveDesign!.conclusion, lang)}</p>
        </div>
      )}
    </section>
  );
}

export function DocumentScanEvidence({ evidence, progress, lang, onProgress }: Props<DocumentScanEvidence>) {
  const [mode, setMode] = useState(evidence.data.initialMode);
  const selected = progress.discoveredAnomalyIds[0];
  const success = evidence.data.successCondition;
  const selectZone = (id: string) => {
    const discovered = [...new Set([...progress.discoveredAnomalyIds, id])];
    const complete = success.type === 'select_zone' && id === success.zoneId;
    onProgress({ ...progress, discoveredAnomalyIds: discovered, attempts: progress.attempts + 1, analysisCompleted: complete });
    if (complete) tapHaptic();
  };
  const compare = () => {
    const complete = selected === success.zoneId;
    onProgress({ ...progress, attempts: progress.attempts + 1, analysisCompleted: complete });
    if (complete) tapHaptic();
  };
  const image = firstImage(evidence);
  return <Shell {...{ evidence, progress, lang, onProgress }}>
    <div className="flex flex-wrap gap-2">{evidence.data.modes.map((item) => <button key={item} type="button" onClick={() => setMode(item)} className={`min-h-11 rounded-md border px-3 text-xs font-bold ${mode === item ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface text-text-light'}`}>{t(modeKey[item], lang)}</button>)}</div>
    <div className={`relative aspect-[16/11] overflow-hidden rounded-md border border-border bg-surface-2 ${mode !== 'normal' ? 'contrast-125 saturate-50' : ''}`}>
      {image && <img src={asset(image)} alt="" className="h-full w-full object-cover" />}
      {evidence.data.anomalyZones.filter((zone) => zone.mode === mode).map((zone) => <button key={zone.id} type="button" aria-label={localizedSidecar(zone.label, zone.labelEn, lang)} onClick={() => selectZone(zone.id)} className={`absolute min-h-11 min-w-11 rounded border-2 ${selected === zone.id || progress.hintLevel === 3 ? 'border-stamp bg-stamp/15' : 'border-white/70 bg-white/10'}`} style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.width}%`, height: `${zone.height}%` }} />)}
    </div>
    {success.type === 'select_then_compare' && evidence.data.referenceFields?.map((field) => <button key={field.id} type="button" onClick={compare} disabled={!selected} className="min-h-11 w-full rounded-md border border-accent bg-accent/10 px-3 text-sm font-semibold text-ink disabled:opacity-40">{t('interactiveCompare', lang)}: {localizedSidecar(field.label, field.labelEn, lang)} · {field.value}</button>)}
  </Shell>;
}

const THERMAL_SCAN_RADIUS = 20;

function heatReadoutColor(proximity: number): string {
  const p = Math.max(0, Math.min(1, proximity));
  const from = [107, 87, 51]; const to = [214, 40, 34];
  const [r, g, b] = from.map((channel, index) => Math.round(channel + (to[index]! - channel) * p));
  return `rgb(${r} ${g} ${b})`;
}

export function ThermalScanEvidence({ evidence, progress, lang, onProgress }: Props<ThermalScanEvidence>) {
  const [thermal, setThermal] = useState(false);
  const [scanPos, setScanPos] = useState<{ x: number; y: number } | null>(null);
  const selected = new Set(progress.discoveredAnomalyIds);
  const choose = (id: string) => {
    const discovered = [...new Set([...selected, id])];
    const required = evidence.data.successCondition.zoneIds;
    const complete = evidence.data.successCondition.type === 'select_any' ? required.includes(id) : required.every((zoneId) => discovered.includes(zoneId));
    onProgress({ ...progress, discoveredAnomalyIds: discovered, attempts: progress.attempts + 1, analysisCompleted: complete });
    if (complete) tapHaptic();
  };
  const scan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    setScanPos({ x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 });
  };
  useEffect(() => setScanPos(null), [progress.resetCount]);
  const image = firstImage(evidence);
  const positioned = evidence.data.heatZones.map((zone) => {
    const point = zone.points?.[0];
    const pointX = point ? ('x' in point ? point.x : point[0]) : 50;
    const pointY = point ? ('y' in point ? point.y : point[1]) : 50;
    const x = zone.x ?? pointX; const y = zone.y ?? pointY;
    const distance = scanPos ? Math.hypot(scanPos.x - x, scanPos.y - y) : Infinity;
    const proximity = Math.max(0, 1 - distance / THERMAL_SCAN_RADIUS);
    return { zone, x, y, proximity };
  });
  const dominant = positioned.reduce((best, item) => (item.proximity > best.proximity ? item : best), positioned[0]!);
  const liveTemperature = evidence.data.ambientTemperature + dominant.proximity * (dominant.zone.temperature - evidence.data.ambientTemperature);
  const readoutColor = heatReadoutColor(dominant.proximity);
  return <Shell {...{ evidence, progress, lang, onProgress }}>
    <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setThermal(false)} className={`min-h-11 rounded-md border ${!thermal ? 'border-accent bg-accent/10' : 'border-border'}`}>{t('interactiveNormal', lang)}</button><button type="button" onClick={() => setThermal(true)} className={`min-h-11 rounded-md border ${thermal ? 'border-accent bg-accent/10' : 'border-border'}`}>{t('interactiveThermal', lang)}</button></div>
    <div className="relative aspect-[16/10] touch-none overflow-hidden rounded-md border border-border bg-folder-edge" onPointerMove={thermal ? scan : undefined} onPointerLeave={() => setScanPos(null)} onPointerCancel={() => setScanPos(null)}>
      {image && <img src={asset(image)} alt="" className={`h-full w-full object-cover ${thermal ? 'grayscale contrast-125' : ''}`} />}
      {thermal && scanPos && <div className="pointer-events-none absolute rounded-full border border-white/40" style={{ left: `${scanPos.x}%`, top: `${scanPos.y}%`, width: '84px', height: '84px', transform: 'translate(-50%,-50%)' }} />}
      {thermal && scanPos && <output aria-live="polite" className="pointer-events-none absolute rounded-md border border-border bg-surface/95 px-2 py-1 font-mono text-sm font-bold tabular-nums shadow-lift transition-colors duration-150" style={{ left: `${scanPos.x}%`, top: `${scanPos.y}%`, color: readoutColor, textShadow: `0 0 ${dominant.proximity * 14}px ${readoutColor}`, transform: 'translate(48px,-52px)' }}>{liveTemperature.toFixed(1)} °C</output>}
      {thermal && positioned.map(({ zone, x, y, proximity }) => {
        const opacity = selected.has(zone.id) || progress.hintLevel === 3 ? 1 : proximity;
        return <button key={zone.id} type="button" aria-label={localizedSidecar(zone.label, zone.labelEn, lang)} onClick={() => choose(zone.id)} className={`absolute min-h-11 min-w-11 rounded-full border-2 transition-opacity duration-150 border-white/80 ${selected.has(zone.id) ? 'ring-4 ring-stamp/50' : ''}`} style={{ left: `${x}%`, top: `${y}%`, width: `${zone.width ?? 14}%`, height: `${zone.height ?? 14}%`, transform: 'translate(-50%,-50%)', opacity, background: `radial-gradient(circle, rgba(255,255,255,.95), rgba(180,35,31,${zone.intensity}), transparent 72%)` }}><span className="sr-only">{zone.temperature} °C</span></button>;
      })}
    </div>
    <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-text-muted">
      <span>{evidence.data.observationTime}</span>
      <span className="text-right">{evidence.data.elapsedSinceClaimedUseMinutes} min</span>
    </div>
  </Shell>;
}

function minutes(value: string): number { const [h = '0', m = '0'] = value.split(':'); return Number(h) * 60 + Number(m); }
function clock(value: number): string { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }

export function ShadowTimeCheckEvidence({ evidence, progress, lang, onProgress }: Props<ShadowTimeCheckEvidence>) {
  const from = minutes(evidence.data.slider.from); const to = minutes(evidence.data.slider.to);
  const [value, setValue] = useState(from);
  const verify = (next: number) => {
    setValue(next);
    const complete = evidence.data.validTimeRanges.some((range) => next >= minutes(range.from) && next <= minutes(range.to));
    onProgress({ ...progress, attempts: progress.attempts + 1, analysisCompleted: complete });
    if (complete) tapHaptic();
  };
  const sample = evidence.data.timeSamples.reduce((best, item) => Math.abs(minutes(item.time) - value) < Math.abs(minutes(best.time) - value) ? item : best);
  const image = firstImage(evidence);
  return <Shell {...{ evidence, progress, lang, onProgress }}>
    <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-border bg-surface-2">{image && <img src={asset(image)} alt="" className="h-full w-full object-cover" />}<div className="absolute h-2 origin-left rounded-full bg-ink/50" style={{ left: `${evidence.data.shadowOrigin.x}%`, top: `${evidence.data.shadowOrigin.y}%`, width: `${Math.min(42, sample.length / 4)}%`, transform: `rotate(${sample.angle}deg)` }} /></div>
    <label className="block text-sm font-semibold text-text-light">{t('interactiveClaimedTime', lang)}: {evidence.data.claimedTime}<input aria-label={t('interactiveClaimedTime', lang)} className="mt-3 w-full accent-accent" type="range" min={from} max={to} step={evidence.data.slider.stepMinutes} value={value} onChange={(event) => verify(Number(event.target.value))} /></label><div className="text-center font-mono text-lg font-bold text-ink">{clock(value)}</div>
  </Shell>;
}

export function SealMatchEvidence({ evidence, progress, lang, onProgress }: Props<SealMatchEvidence>) {
  const [transform, setTransform] = useState(evidence.data.initialTransform);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const onPointerMove = (event: ReactPointerEvent) => { if (!drag.current) return; setTransform((current) => ({ ...current, x: current.x + event.clientX - drag.current!.x, y: current.y + event.clientY - drag.current!.y })); drag.current = { x: event.clientX, y: event.clientY }; };
  const compare = () => { const target = evidence.data.targetTransform; const close = Math.hypot(transform.x - target.x, transform.y - target.y) <= evidence.data.tolerance.position && Math.abs(transform.rotation - target.rotation) <= evidence.data.tolerance.rotation; const complete = close === evidence.data.expectedMatch; onProgress({ ...progress, attempts: progress.attempts + 1, analysisCompleted: complete }); if (complete) tapHaptic(); };
  const image = firstImage(evidence);
  return <Shell {...{ evidence, progress, lang, onProgress }}>
    <div className="relative aspect-[16/10] touch-none overflow-hidden rounded-md border border-border bg-surface-2" onPointerMove={onPointerMove} onPointerUp={() => { drag.current = null; compare(); }} onPointerCancel={() => { drag.current = null; }}>{image && <img src={asset(image)} alt="" className="h-full w-full object-cover opacity-70" />}<button type="button" aria-label={t('interactiveCompare', lang)} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY }; }} className="absolute h-24 w-28 touch-none rounded-sm border-2 border-dashed border-stamp bg-paper/80 shadow-doc" style={{ left: transform.x, top: transform.y, transform: `rotate(${transform.rotation}deg)` }} /></div>
    <div className="grid grid-cols-3 gap-2"><button type="button" onClick={() => setTransform((current) => ({ ...current, rotation: current.rotation - evidence.data.rotationStep }))} className="min-h-11 rounded-md border border-border">↶ <span className="sr-only">{t('interactiveRotateLeft', lang)}</span></button><button type="button" onClick={compare} className="min-h-11 rounded-md border border-accent bg-accent/10 font-semibold">{t('interactiveCompare', lang)}</button><button type="button" onClick={() => setTransform((current) => ({ ...current, rotation: current.rotation + evidence.data.rotationStep }))} className="min-h-11 rounded-md border border-border">↷ <span className="sr-only">{t('interactiveRotateRight', lang)}</span></button></div>
  </Shell>;
}

export function SurfaceRevealEvidence({ evidence, progress, lang, onProgress }: Props<SurfaceRevealEvidence>) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const analysisRef = useRef<HTMLCanvasElement | null>(null); const serviceRef = useRef<HTMLCanvasElement | null>(null); const drawing = useRef(false); const strokes = useRef(0);
  const image = firstImage(evidence);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; ctx.fillStyle = evidence.data.coverType === 'frost' ? 'rgba(230,235,230,.9)' : evidence.data.coverType === 'soot' ? 'rgba(35,31,28,.88)' : 'rgba(92,75,52,.82)'; ctx.fillRect(0, 0, canvas.width, canvas.height); const analysis = document.createElement('canvas'); analysis.width = 128; analysis.height = 128; const service = document.createElement('canvas'); service.width = 128; service.height = 128; const sctx = service.getContext('2d'); if (sctx) { sctx.fillStyle = '#fff'; sctx.beginPath(); sctx.ellipse(78, 64, 30, 22, 0, 0, Math.PI * 2); sctx.fill(); } analysisRef.current = analysis; serviceRef.current = service; return () => { analysisRef.current = null; serviceRef.current = null; }; }, [evidence.id, evidence.data.coverType, progress.resetCount]);
  const stroke = (event: ReactPointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const canvas = canvasRef.current; const analysis = analysisRef.current; if (!canvas || !analysis) return; const rect = canvas.getBoundingClientRect(); const x = (event.clientX - rect.left) * canvas.width / rect.width; const y = (event.clientY - rect.top) * canvas.height / rect.height; for (const target of [canvas, analysis]) { const ctx = target.getContext('2d'); if (!ctx) continue; const sx = target.width / canvas.width; const sy = target.height / canvas.height; ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(x * sx, y * sy, evidence.data.brush.radius * sx, 0, Math.PI * 2); ctx.fill(); } };
  const analyze = () => { drawing.current = false; strokes.current += 1; const analysis = analysisRef.current?.getContext('2d'); const service = serviceRef.current?.getContext('2d'); if (!analysis || !service) return; const cleared = analysis.getImageData(0, 0, 128, 128).data; const mask = service.getImageData(0, 0, 128, 128).data; let total = 0, hit = 0; for (let i = 3; i < mask.length; i += 4) if (mask[i]! > 0) { total++; if (cleared[i]! === 0) hit++; } const percent = total ? Math.round(hit / total * 100) : 0; const trace = evidence.data.traces[0]!; const complete = percent >= trace.requiredRevealPercent; const ids = complete ? [...new Set([...progress.discoveredTraceIds, trace.id])] : progress.discoveredTraceIds; onProgress({ ...progress, attempts: progress.attempts + 1, analysisCompleted: complete, discoveredTraceIds: ids, revealPercentByTrace: { ...progress.revealPercentByTrace, [trace.id]: percent } }); if (complete) tapHaptic(); };
  return <Shell {...{ evidence, progress, lang, onProgress }}>
    <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-border bg-surface-2">{image && <img src={asset(image)} alt="" className="absolute inset-0 h-full w-full object-cover" />}<canvas ref={canvasRef} width={640} height={400} aria-label={t('interactiveCleanSurface', lang)} className="absolute inset-0 h-full w-full touch-none" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); drawing.current = true; stroke(event); }} onPointerMove={stroke} onPointerUp={analyze} onPointerCancel={analyze} /></div>
    <div className="flex items-center justify-between text-xs text-text-muted"><span>{t('interactiveProgress', lang)}</span><span className="font-mono">{Object.values(progress.revealPercentByTrace)[0] ?? 0}%</span></div>
  </Shell>;
}

export function isInteractiveEvidence(evidence: { type: string }): evidence is InteractiveEvidence {
  return ['document_scan', 'thermal_scan', 'shadow_time_check', 'seal_match', 'surface_reveal'].includes(evidence.type);
}

export function InteractiveEvidenceView(props: Props<InteractiveEvidence>) {
  switch (props.evidence.type) {
    case 'document_scan': return <DocumentScanEvidence {...props as Props<DocumentScanEvidence>} />;
    case 'thermal_scan': return <ThermalScanEvidence {...props as Props<ThermalScanEvidence>} />;
    case 'shadow_time_check': return <ShadowTimeCheckEvidence {...props as Props<ShadowTimeCheckEvidence>} />;
    case 'seal_match': return <SealMatchEvidence {...props as Props<SealMatchEvidence>} />;
    case 'surface_reveal': return <SurfaceRevealEvidence {...props as Props<SurfaceRevealEvidence>} />;
  }
}
