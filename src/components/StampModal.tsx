import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Evidence, EvidenceMeta, InteractiveEvidenceProgress, Language } from '../types';
import { loc, t } from '../i18n/ui';
import { EVIDENCE_TAG_KEY } from './icons';
import { RTL_LANGUAGES } from '../i18n/ui';
import { tapHaptic } from '../utils/haptics';
import { asset } from '../utils/asset';
import { InteractiveEvidenceView, isInteractiveEvidence, makeInteractiveProgress } from './InteractiveEvidence';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface Props {
  evidence: Evidence | null;
  lang: Language;
  stamped: boolean;
  /** True if a paid "Inspector Note" hint revealed this card's true status. */
  revealed: boolean;
  interactiveProgress?: InteractiveEvidenceProgress;
  onInteractiveProgress: (progress: InteractiveEvidenceProgress) => void;
  onToggle: () => void;
  onClose: () => void;
  position: number;
  total: number;
  onNavigate: (direction: -1 | 1) => void;
}

/** Full-screen evidence viewer with the "Mark as Contradiction" toggle. */
export function StampModal({
  evidence,
  lang,
  stamped,
  revealed,
  interactiveProgress,
  onInteractiveProgress,
  onToggle,
  onClose,
  position,
  total,
  onNavigate,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const isOpen = evidence != null;
  const isRTL = RTL_LANGUAGES.has(lang);
  const interactive = evidence ? isInteractiveEvidence(evidence) : false;
  const analysisComplete = !interactive || interactiveProgress?.analysisCompleted === true;
  const canStamp = evidence?.statementLink?.relation === 'contradicts' && analysisComplete;
  const titleId = evidence
    ? `stamp-modal-title-${evidence.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    : undefined;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const handleTouchStart = (event: React.TouchEvent) => {
    const point = event.touches[0];
    if (point) touchStart.current = { x: point.clientX, y: point.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    const point = event.changedTouches[0];
    if (!start || !point) return;
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const forward = isRTL ? dx > 0 : dx < 0;
    onNavigate(forward ? 1 : -1);
  };

  const handleToggle = () => {
    tapHaptic();
    onToggle();
  };

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => !element.hasAttribute('disabled'));

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (!firstElement || !lastElement) return;

    if (event.shiftKey && document.activeElement === dialog) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <AnimatePresence>
      {evidence && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center bg-modal-backdrop md:items-center md:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex h-[100dvh] w-full flex-col overflow-hidden rounded-t-[16px] bg-paper shadow-modal md:h-auto md:max-h-full md:max-w-[420px] md:overflow-auto md:rounded-[9px]"
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.2, 0.9, 0.3, 1] }}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleDialogKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Dark folder-edge header */}
            <div className="flex items-center justify-between gap-2 bg-folder-edge px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="rounded bg-white/[0.18] px-1.5 py-[3px] font-mono text-[12px] md:text-[10px] font-bold uppercase tracking-wider text-white">
                  {t(EVIDENCE_TAG_KEY[evidence.type], lang)}
                </span>
                <span
                  id={titleId}
                  className="truncate text-[13px] font-semibold text-white"
                >
                  {loc(evidence.title, lang)}
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label={t('close', lang)}
                className="flex h-11 w-11 items-center justify-center text-xl leading-none text-white/85 hover:text-white focus:outline-none focus-visible:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Document body + ink stamp overlay */}
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-[18px] md:flex-none md:overflow-visible">
              {/* Inspector-note reveal: the card's true status, bought with a hint */}
              {revealed && (
                <div
                  className={`mb-3 rounded-md px-3 py-2 text-center font-mono text-xs font-semibold uppercase tracking-wide ${
                    evidence.isContradiction
                      ? 'bg-stamp/10 text-stamp'
                      : 'bg-success/10 text-success'
                  }`}
                >
                  {evidence.isContradiction
                    ? `⚠ ${t('revealedContradiction', lang)}`
                    : `✓ ${t('revealedClean', lang)}`}
                </div>
              )}

              {interactive && isInteractiveEvidence(evidence) ? (
                <InteractiveEvidenceView
                  evidence={evidence}
                  lang={lang}
                  progress={interactiveProgress ?? makeInteractiveProgress(evidence.id)}
                  onProgress={onInteractiveProgress}
                />
              ) : (
                <EvidenceBody evidence={evidence} lang={lang} />
              )}

              {stamped && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[42%]"
                  style={{ animation: 'stampIn .45s cubic-bezier(.2,1.3,.35,1)' }}
                >
                  <div
                    className="rounded-[5px] border-4 border-stamp px-[18px] py-2 text-center font-mono text-[22px] font-semibold uppercase tracking-wide text-stamp"
                    style={{
                      transform: 'translate(-50%,-50%) rotate(-13deg)',
                      opacity: 0.88,
                      background: 'rgba(255,255,255,.04)',
                    }}
                  >
                    {t('contradiction', lang)}
                    <div className="mt-0.5 text-[12px] md:text-[10px] tracking-[4px]">
                      CONTRADICTION
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mark / unmark toggle */}
            <div className="shrink-0 border-t border-border bg-paper px-[18px] pt-3" style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}>
              <div className="mb-2 grid grid-cols-[48px_1fr_48px] items-center gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => onNavigate(-1)}
                  disabled={position <= 0}
                  aria-label={t('previousEvidence', lang)}
                  className="h-11 rounded-[9px] border border-border text-2xl text-text-light disabled:opacity-30"
                >
                  {isRTL ? '›' : '‹'}
                </button>
                <span className="text-center font-mono text-[13px] font-bold text-text-muted">
                  {position + 1} / {total}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate(1)}
                  disabled={position < 0 || position >= total - 1}
                  aria-label={t('nextEvidence', lang)}
                  className="h-11 rounded-[9px] border border-border text-2xl text-text-light disabled:opacity-30"
                >
                  {isRTL ? '‹' : '›'}
                </button>
              </div>
              {evidence.statementLink?.relation === 'contradicts' ? (
                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={!canStamp}
                  className={`h-[52px] w-full rounded-[9px] border-2 border-stamp text-[15px] font-bold uppercase tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-45 ${
                    stamped ? 'bg-stamp text-white' : 'bg-transparent text-stamp'
                  }`}
                >
                  {!analysisComplete ? t('interactiveStampLocked', lang) : stamped
                    ? t('contradictionMarked', lang)
                    : t('markAsContradiction', lang)}
                </button>
              ) : (
                <div className="flex min-h-[52px] items-center justify-center rounded-[9px] border border-accent/50 bg-accent/10 px-3 text-center text-sm font-semibold text-accent">
                  {t('interactiveSupported', lang)}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Deterministic RNG helpers (no external deps)                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function strHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(33, h) ^ s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Float in [0, 1) from a seed + index pair */
function rng(seed: number, idx: number): number {
  return (strHash(`${seed}:${idx}`) % 100000) / 100000;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  EvidenceBody — one renderer per evidence type                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function EvidenceBody({ evidence, lang }: { evidence: Evidence; lang: Language }) {
  const content = loc(evidence.content, lang);
  const lines = Array.isArray(content) ? content : [content];

  const meta = evidence.meta;
  const withImage = (body: React.ReactNode) => meta?.imageUrl && evidence.type !== 'photo'
    ? <><img src={asset(meta.imageUrl)} alt="" className="mb-3 aspect-[16/10] w-full rounded-md border border-border object-cover" loading="lazy" />{body}</>
    : body;
  switch (evidence.type) {
    case 'gps':
      return withImage(<GpsBody lines={lines} meta={meta} lang={lang} />);
    case 'photo':
      return <PhotoBody lines={lines} meta={meta} />;
    case 'camera_recording':
      return withImage(<CameraBody lines={lines} meta={meta} />);
    case 'witness_statement':
      return <WitnessBody lines={lines} />;
    case 'document':
      return withImage(<DocumentBody lines={lines} meta={meta} lang={lang} />);
    case 'usage_log':
      return <UsageLogBody lines={lines} meta={meta} />;
    case 'xray':
      return withImage(<XRayBody lines={lines} meta={meta} lang={lang} />);
    case 'bank_statement':
      return <BankBody lines={lines} meta={meta} lang={lang} />;
    case 'phone_records':
      return <PhoneBody lines={lines} meta={meta} lang={lang} />;
    case 'social_media':
      return <SocialBody lines={lines} meta={meta} />;
    default:
      return <DefaultBody lines={lines} />;
  }
}

/* ── GPS ─────────────────────────────────────────────────────────────────── */

/** Build a deterministic route from GPS log lines (no real coords needed). */
function buildRoutePoints(lines: string[]): Array<{ x: number; y: number }> {
  if (lines.length === 0) return [];
  const seed = strHash(lines.join('|'));
  const n = lines.length;
  const W = 300, H = 160, PAD = 22;

  // Four diagonal directions, chosen by seed
  const dirs = [
    { sx: PAD,       sy: H - PAD,  ex: W - PAD,  ey: PAD      },
    { sx: PAD,       sy: PAD,      ex: W - PAD,  ey: H - PAD  },
    { sx: W * 0.15,  sy: H - PAD,  ex: W * 0.85, ey: PAD      },
    { sx: PAD,       sy: H * 0.45, ex: W - PAD,  ey: H * 0.25 },
  ] as const;
  const d = dirs[seed % dirs.length]!;

  return lines.map((line, i) => {
    const t = n > 1 ? i / (n - 1) : 0.5;
    const ls = strHash(line) ^ (seed + i * 7919);
    const baseX = d.sx + t * (d.ex - d.sx);
    const baseY = d.sy + t * (d.ey - d.sy);
    return {
      x: Math.max(PAD, Math.min(W - PAD, baseX + (rng(ls, 0) - 0.5) * 40)),
      y: Math.max(PAD, Math.min(H - PAD, baseY + (rng(ls, 1) - 0.5) * 30)),
    };
  });
}

function GpsBody({ lines, meta, lang }: { lines: string[]; meta?: EvidenceMeta; lang: Language }) {
  const [active, setActive] = useState<number | null>(null);

  const parsed = lines.map((l) => {
    const sep = l.indexOf(' — ');
    return sep > -1 ? { time: l.slice(0, sep), loc: l.slice(sep + 3) } : { time: '', loc: l };
  });

  const points = buildRoutePoints(lines);

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[12px] md:text-[11px] text-ink/40">▣</span>
            <span className="font-mono text-[12px] md:text-[11px] font-semibold text-ink/60">{meta?.company ? loc(meta.company, lang) : 'GeoGuard Solutions'}</span>
          </div>
          <div className="mt-0.5 font-mono text-[12px] md:text-[9px] text-ink/40">
            {meta?.department ? loc(meta.department, lang) : t('department', lang)}
          </div>
        </div>
        <span className="font-mono text-[8px] font-semibold text-stamp border border-stamp px-1.5 py-0.5 rounded">
          КОНФ.
        </span>
      </div>
      <div className="my-2.5 h-px bg-[#d1d5db]" />
      <div className="mb-2.5 font-mono text-[12px] md:text-[10px] text-ink/50">
        {meta?.requestId ? loc(meta.requestId, lang) : 'STR-2026-0314-A'}
      </div>

      {/* Map */}
      <div
        className="relative overflow-hidden rounded-t-md"
        style={{
          height: 160,
          background: '#0f172a',
          backgroundImage:
            'repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 1px,transparent 1px 26px),repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 1px,transparent 1px 30px)',
        }}
      >
        <svg
          viewBox="0 0 300 160"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.6"
            strokeDasharray="4 3"
          />
        </svg>

        {points.map((p, i) => {
          const isActive = active === i;
          return (
            <button
              key={i}
              type="button"
              title={parsed[i] ? `${parsed[i].time} — ${parsed[i].loc}` : ''}
              onClick={() => setActive(isActive ? null : i)}
              className="absolute flex items-center justify-center"
              style={{
                left: `${(p.x / 300) * 100}%`,
                top: `${(p.y / 160) * 100}%`,
                width: 20,
                height: 20,
                transform: 'translate(-50%,-50%)',
              }}
            >
              <span
                className="block rounded-full transition-all duration-200"
                style={{
                  width: isActive ? 10 : 7,
                  height: isActive ? 10 : 7,
                  background: isActive ? '#2563eb' : '#ffffff',
                  border: `2px solid ${isActive ? '#ffffff' : '#f59e0b'}`,
                  boxShadow: isActive ? '0 0 0 3px rgba(37,99,235,.7)' : 'none',
                }}
              />
            </button>
          );
        })}

        <div className="absolute bottom-1.5 left-2 font-mono text-[8px] text-white/50">
          {meta?.gpsFooter ? loc(meta.gpsFooter, lang) : '© GeoGuard 2026 · GPS ACC: ±3m'}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-b-md border border-t-0 border-black/10">
        <div
          className="grid gap-0 bg-[#e5e7eb] px-2.5 py-1.5"
          style={{ gridTemplateColumns: '62px 1fr 78px' }}
        >
          {['TIME', 'LOCATION', 'STATUS'].map((h) => (
            <span key={h} className="font-mono text-[12px] md:text-[9px] font-semibold text-ink/40">
              {h}
            </span>
          ))}
        </div>
        {parsed.map((row, i) => {
          const isActive = active === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(isActive ? null : i)}
              className="grid w-full cursor-pointer px-2.5 py-[7px] text-left transition-colors duration-200"
              style={{
                gridTemplateColumns: '62px 1fr 78px',
                background: isActive ? 'rgba(37,99,235,.1)' : i % 2 ? 'rgba(0,0,0,.02)' : '#fff',
                borderLeft: `2px solid ${isActive ? '#2563eb' : 'transparent'}`,
              }}
            >
              <span className="font-mono text-[12px] md:text-[10px] font-medium text-ink">{row.time}</span>
              <span className="font-mono text-[12px] md:text-[10px] text-ink/75">{row.loc}</span>
              <span className="font-mono text-[12px] md:text-[10px] font-medium text-success">● LOGGED</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 font-mono text-[12px] md:text-[9px] text-ink/35">
        Документ сформирован автоматически. Печать: ____/____ Подпись: __________
      </div>
    </>
  );
}

/* ── PHOTO (Polaroid flip) ───────────────────────────────────────────────── */

function PhotoBody({ lines, meta }: { lines: string[]; meta?: EvidenceMeta }) {
  const [flipped, setFlipped] = useState(false);

  // Lines after a "---EXIF---" marker are metadata; rest is caption
  const sepIdx = lines.findIndex((l) => l === '---EXIF---');
  const caption = sepIdx > -1 ? lines.slice(0, sepIdx).join(' ') : lines[0] ?? '';
  const exifRaw = sepIdx > -1 ? lines.slice(sepIdx + 1) : [];

  const defaultExif = [
    { icon: '📅', text: 'Дата съёмки: не указана' },
    { icon: '📱', text: 'Устройство: неизвестно' },
    { icon: '📍', text: 'Геолокация: не определена' },
    { icon: '💾', text: 'Формат: JPEG' },
  ];

  const exifLines =
    exifRaw.length > 0
      ? exifRaw.map((l) => {
          const icons: Record<string, string> = { '📅': '📅', '📱': '📱', '📍': '📍', '💾': '💾' };
          const icon = Object.keys(icons).find((ic) => l.startsWith(ic)) ?? '📄';
          return { icon, text: l.replace(icon, '').trim() };
        })
      : defaultExif;

  return (
    <div className="flex justify-center py-2">
      <div className="relative" style={{ width: 230, minHeight: 290, perspective: 1200 }}>
        {/* Paperclip */}
        <div
          className="absolute z-10 rounded-full border-2 border-[#9ca3af]"
          style={{ width: 22, height: 9, top: -6, left: '50%', transform: 'translateX(-50%)' }}
        />

        <div
          className="relative w-full"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(.4,.2,.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="relative w-full rounded-sm bg-white shadow-lift"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', padding: '12px 12px 32px', transform: 'rotate(-1.5deg)' }}
          >
            <div
              className="flex h-[165px] items-center justify-center rounded-sm overflow-hidden"
              style={meta?.imageUrl ? undefined : { background: 'repeating-linear-gradient(45deg,#cbd0d6 0 9px,#c0c5cc 9px 18px)' }}
            >
              {meta?.imageUrl ? (
                <img src={asset(meta.imageUrl)} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="text-3xl opacity-40">📷</span>
              )}
            </div>
            <div className="px-1 pt-2.5 font-serif text-[12px] italic text-ink/70 text-center">
              {caption}
            </div>
            <button
              type="button"
              onClick={() => setFlipped(true)}
              className="absolute bottom-2 right-3 font-mono text-[12px] md:text-[9px] text-accent"
            >
              ↩ свойства
            </button>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-sm p-4"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: '#f5f0e8',
            }}
          >
            <div className="mb-3 font-mono text-[12px] md:text-[9px] font-semibold uppercase tracking-wider text-ink/40">
              Свойства файла
            </div>
            {exifLines.map((e, i) => (
              <div key={i} className="flex gap-2 border-b border-black/10 py-1.5">
                <span>{e.icon}</span>
                <span className="font-serif text-[12px] md:text-[11px] italic text-ink/80">{e.text}</span>
              </div>
            ))}
            <div className="mt-3 font-mono text-[12px] md:text-[9px] text-ink/50">{meta?.filename ?? 'IMG_20260315_081402.jpg'}</div>
            <button
              type="button"
              onClick={() => setFlipped(false)}
              className="absolute bottom-3 right-3 font-mono text-[12px] md:text-[9px] text-accent"
            >
              ↩ назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CAMERA RECORDING ────────────────────────────────────────────────────── */

const CAM_SHADES = [
  'repeating-linear-gradient(40deg,#181c18 0 11px,#141714 11px 22px)',
  'repeating-linear-gradient(40deg,#1c1c1c 0 11px,#161616 11px 22px)',
  'repeating-linear-gradient(40deg,#15191c 0 11px,#101315 11px 22px)',
  'repeating-linear-gradient(40deg,#1a1a18 0 11px,#141412 11px 22px)',
];

function CameraBody({ lines, meta }: { lines: string[]; meta?: EvidenceMeta }) {
  const [frame, setFrame] = useState(0);
  const total = lines.length || 1;

  // Each line can be "HH:MM:SS · description" or just plain text
  const parsed = lines.map((l) => {
    const m = l.match(/^(\d{2}:\d{2}:\d{2})[·\- ]+(.+)$/);
    return m ? { clock: m[1], text: m[2] } : { clock: '', text: l };
  });

  const current = parsed[frame] ?? { clock: '00:00:00', text: '' };

  return (
    <>
      <div
        className="overflow-hidden rounded"
        style={{ background: '#1a1a1a', border: '1px solid #333', padding: 8 }}
      >
        <div style={{ border: '1px solid #444', borderRadius: 2, overflow: 'hidden' }}>
          <div
            className="relative"
            style={{
              height: 170,
              background: '#0d0d0d',
              backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,255,80,.025) 0 1px,transparent 1px 3px)',
            }}
          >
            {/* Frame content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={frame}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: CAM_SHADES[frame % CAM_SHADES.length] }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <span className="font-mono text-[12px] md:text-[10px]" style={{ color: 'rgba(74,222,128,.3)' }}>
                  📹 CCTV FEED
                </span>
              </motion.div>
            </AnimatePresence>

            {/* REC indicator */}
            <div className="absolute left-2.5 top-2 flex items-center gap-1.5">
              <span
                className="block h-2 w-2 rounded-full bg-red-500"
                style={{ animation: 'recpulse 1.4s infinite' }}
              />
              <span className="font-mono text-[12px] md:text-[9px] font-semibold text-red-500">REC</span>
            </div>
            <div className="absolute right-2.5 top-2 font-mono text-[12px] md:text-[9px]" style={{ color: 'rgba(74,222,128,.6)' }}>
              {meta?.cameraId ?? 'CAM-04'}
            </div>

            {/* Bottom bar */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2.5 py-1.5"
              style={{ background: 'rgba(0,0,0,.55)' }}
            >
              <span className="font-mono text-[12px] md:text-[11px]" style={{ color: '#4ade80' }}>
                {current.text}
              </span>
              <span className="font-mono text-[12px] md:text-[10px] font-semibold" style={{ color: 'rgba(74,222,128,.8)' }}>
                {current.clock}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-1.5 pb-1 pt-2">
          <button
            type="button"
            onClick={() => setFrame((f) => (f - 1 + total) % total)}
            className="px-2 font-mono text-[12px] font-semibold disabled:opacity-30"
            style={{ color: '#4ade80' }}
            disabled={total <= 1}
          >
            ◀◀
          </button>
          <span className="font-mono text-[12px] md:text-[9px]" style={{ color: 'rgba(74,222,128,.5)' }}>
            FRAME {String(frame + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => setFrame((f) => (f + 1) % total)}
            className="px-2 font-mono text-[12px] font-semibold disabled:opacity-30"
            style={{ color: '#4ade80' }}
            disabled={total <= 1}
          >
            ▶▶
          </button>
        </div>
      </div>
      <div className="mt-2 text-center font-mono text-[8px] text-ink/30">
        {meta?.cameraModel ?? 'HIKVISION DS-2CD2143G2-I · IP-КАМЕРА · H.264'}
      </div>
    </>
  );
}

/* ── WITNESS STATEMENT ───────────────────────────────────────────────────── */

function WitnessBody({ lines }: { lines: string[] }) {
  return (
    <>
      <div className="text-center font-mono text-[12px] md:text-[9px] font-semibold uppercase tracking-[2px] text-ink/40">
        Протокол допроса свидетеля
      </div>
      <div className="my-2.5 h-px bg-[#d1d5db]" />
      <div
        className="font-mono text-[12px] md:text-[10px] leading-[1.8] text-ink/55"
        dangerouslySetInnerHTML={{
          __html: 'Дата: ___.__.___ &nbsp; Время: ___:___ &nbsp;<br>Следователь: ст. инсп. __________________',
        }}
      />
      <div className="mt-3.5 rounded border-l-[3px] border-stamp bg-white p-3.5">
        {lines.map((l, i) => (
          <p key={i} className="mb-1.5 font-serif text-[14px] leading-[1.65] text-ink last:mb-0">
            «{l}»
          </p>
        ))}
      </div>
      <div className="mt-4 font-mono text-[12px] md:text-[10px] text-ink/50">
        Свидетель: ____________________ Подпись: _________
      </div>
    </>
  );
}

/* ── DOCUMENT ────────────────────────────────────────────────────────────── */

function DocumentBody({ lines, meta, lang }: { lines: string[]; meta?: EvidenceMeta; lang: Language }) {
  return (
    <>
      <div className="-mx-[18px] -mt-[18px] mb-4 border-t-4 border-accent" />
      <div className="mb-2.5 font-mono text-[12px] md:text-[9px] font-semibold uppercase tracking-[2px] text-ink/40">
        {meta?.docHeader ? loc(meta.docHeader, lang) : t('tag_document', lang)}
      </div>
      <div className="mb-3 border-b border-dashed border-[#c7c2b6]" />
      <div className="rounded-md border border-dashed border-[#c7c2b6] bg-white p-4 font-mono text-[12.5px] leading-relaxed text-ink">
        {lines.map((line, i) => (
          <div key={i} className="border-b border-dashed border-black/10 py-1 last:border-0">
            {line}
          </div>
        ))}
      </div>
      <div className="mt-4 text-right font-mono text-[12px] md:text-[10px] text-ink/50">
        {meta?.docFooter ? loc(meta.docFooter, lang) : '______________'}
      </div>
    </>
  );
}

/* ── USAGE LOG ───────────────────────────────────────────────────────────── */

function UsageLogBody({ lines, meta }: { lines: string[]; meta?: EvidenceMeta }) {
  const tagged = lines.map((l) => {
    const isWarn = /warn|error|ошибк|открыт|снят/i.test(l);
    return { text: l, warn: isWarn };
  });

  return (
    <div className="rounded-md p-3" style={{ background: '#0d0d0d' }}>
      <div className="mb-2 font-mono text-[12px] md:text-[9px]" style={{ color: 'rgba(74,222,128,.6)' }}>
        {meta?.logPrompt ?? 'root@alarm:~$ tail -f /var/log/security.log'}
      </div>
      {tagged.map((l, i) => (
        <div key={i} className="font-mono text-[12px] md:text-[11px] leading-[1.7]" style={{ color: '#4ade80' }}>
          <span style={{ color: l.warn ? '#fbbf24' : 'rgba(74,222,128,.55)' }}>
            {l.warn ? '[WARN]' : '[INFO]'}
          </span>{' '}
          {l.text}
        </div>
      ))}
      <div className="mt-0.5 flex items-center font-mono text-[12px] md:text-[11px]" style={{ color: '#4ade80' }}>
        _
        <span
          className="ml-0.5 inline-block h-[13px] w-[7px] align-middle"
          style={{ background: '#4ade80', animation: 'blink 1s step-end infinite' }}
        />
      </div>
    </div>
  );
}

/* ── X-RAY ───────────────────────────────────────────────────────────────── */

interface XShape {
  kind: 'rib' | 'spine' | 'round' | 'rod' | 'ring' | 'implant';
  x: number; y: number; w: number; h: number;
  rot: number; baseA: number; brightA: number;
}

/** Analyze content text → generate unique bone / foreign-object layout. */
function buildXRayShapes(lines: string[]): XShape[] {
  const text = lines.join(' ');
  const seed = strHash(text);
  const shapes: XShape[] = [];

  // 3–5 rib-like ellipses
  const numRibs = 3 + (seed % 3);
  for (let i = 0; i < numRibs; i++) {
    shapes.push({
      kind: 'rib',
      x: 10 + rng(seed, i * 7) * 90,
      y: 18 + i * (150 / numRibs),
      w: 95 + rng(seed, i * 7 + 1) * 80,
      h: 14 + rng(seed, i * 7 + 2) * 12,
      rot: -30 + rng(seed, i * 7 + 3) * 18,
      baseA: 0.11 + rng(seed, i * 7 + 4) * 0.06,
      brightA: 0.20 + rng(seed, i * 7 + 4) * 0.07,
    });
  }

  // Spine column (always present)
  shapes.push({
    kind: 'spine',
    x: 110 + rng(seed, 50) * 60,
    y: 4,
    w: 11 + rng(seed, 51) * 8,
    h: 182,
    rot: rng(seed, 52) * 9 - 4.5,
    baseA: 0.15, brightA: 0.25,
  });

  // Keyword-driven foreign objects
  const hasRound  = /мяч|шар|монет|пуговиц|таблетк|яйц|орех|кольц|линз/i.test(text);
  const hasRod    = /штифт|болт|игла|гвозд|ключ|ручк|трубк|носок|спица|скоб/i.test(text);
  const hasRing   = /кольц|браслет|обруч|гайк/i.test(text);
  const hasImplant = /протез|имплант|пластин|эндопротез/i.test(text);

  // Fallback: always show at least one object based on seed parity
  const forceRound = !hasRound && !hasRod && !hasRing && !hasImplant && seed % 3 === 0;
  const forceRod   = !hasRound && !hasRod && !hasRing && !hasImplant && seed % 3 === 1;

  if (hasRound || forceRound) {
    const sz = 20 + rng(seed, 60) * 30;
    shapes.push({ kind: 'round', x: 25 + rng(seed, 61) * 230, y: 18 + rng(seed, 62) * 140, w: sz, h: sz, rot: 0, baseA: 0.30, brightA: 0.50 });
  }
  if (hasRod || forceRod) {
    shapes.push({ kind: 'rod', x: 25 + rng(seed, 70) * 230, y: 10 + rng(seed, 71) * 130, w: 5 + rng(seed, 72) * 8, h: 38 + rng(seed, 73) * 75, rot: rng(seed, 74) * 50 - 25, baseA: 0.34, brightA: 0.54 });
  }
  if (hasRing) {
    const sz = 26 + rng(seed, 80) * 22;
    shapes.push({ kind: 'ring', x: 25 + rng(seed, 81) * 230, y: 18 + rng(seed, 82) * 130, w: sz, h: sz, rot: rng(seed, 83) * 30 - 15, baseA: 0.30, brightA: 0.48 });
  }
  if (hasImplant) {
    shapes.push({ kind: 'implant', x: 80 + rng(seed, 90) * 120, y: 18 + rng(seed, 91) * 110, w: 7 + rng(seed, 92) * 10, h: 28 + rng(seed, 93) * 45, rot: rng(seed, 94) * 22 - 11, baseA: 0.50, brightA: 0.72 });
  }

  return shapes;
}

function XRayShapeLayer({ shapes, bright }: { shapes: XShape[]; bright: boolean }) {
  return (
    <div className="absolute inset-0">
      {shapes.map((s, i) => {
        const alpha = bright ? s.brightA : s.baseA;
        const common: React.CSSProperties = {
          position: 'absolute',
          left: s.x,
          top: s.y,
          width: s.w,
          height: s.h,
          transform: `rotate(${s.rot}deg)`,
        };
        if (s.kind === 'ring') {
          return <div key={i} style={{ ...common, borderRadius: '50%', border: `6px solid rgba(255,255,255,${alpha})` }} />;
        }
        if (s.kind === 'rib' || s.kind === 'round') {
          return <div key={i} style={{ ...common, borderRadius: '50%', background: `rgba(255,255,255,${alpha})` }} />;
        }
        // spine, rod, implant → rounded rect
        return <div key={i} style={{ ...common, borderRadius: s.kind === 'implant' ? 3 : 6, background: `rgba(255,255,255,${alpha})` }} />;
      })}
    </div>
  );
}

function XRayBody({ lines, meta, lang }: { lines: string[]; meta?: EvidenceMeta; lang: Language }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 140, y: 95 });
  const shapes = buildXRayShapes(lines);

  const handleMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  const R = 42, Z = 2.6;
  const lensStyle: React.CSSProperties = {
    position: 'absolute', left: pos.x - R, top: pos.y - R,
    width: R * 2, height: R * 2, borderRadius: '50%', overflow: 'hidden',
    border: '2px solid rgba(255,255,255,.6)', boxShadow: '0 4px 14px rgba(0,0,0,.5)',
    pointerEvents: 'none', zIndex: 6,
  };
  const lensInnerStyle: React.CSSProperties = {
    position: 'absolute', left: 0, top: 0, width: '100%', height: 190,
    transformOrigin: 'top left',
    transform: `translate(${-(pos.x * Z - R)}px, ${-(pos.y * Z - R)}px) scale(${Z})`,
  };

  // Extract metadata line (last line if it looks like a date/code)
  const metaLine = lines.find((l) => /\d{2}\.\d{2}\.\d{4}|ARCH|MED|№/i.test(l)) ?? '';
  const seed = strHash(lines.join(''));
  const archNo = `ARCH-MED-${100 + (seed % 900)}`;

  return (
    <>
      <div className="rounded-lg p-3" style={{ background: '#e8eef5', border: '4px solid #c0c8d0', boxShadow: 'inset 0 0 30px rgba(180,210,255,.6)' }}>
        <div
          className="relative overflow-hidden rounded-sm"
          style={{ height: 190, background: '#11161d', cursor: 'crosshair' }}
          onMouseMove={handleMove}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          <XRayShapeLayer shapes={shapes} bright={false} />

          {show && (
            <div style={lensStyle}>
              <div style={lensInnerStyle}>
                <XRayShapeLayer shapes={shapes} bright={true} />
              </div>
            </div>
          )}

          <div className="absolute bottom-2 right-2 rounded font-mono text-[8px]" style={{ color: 'rgba(255,255,255,.5)', background: 'rgba(0,0,0,.4)', padding: '2px 6px' }}>
            {metaLine || archNo}
          </div>
        </div>
      </div>
      <div className="mt-2.5 text-center font-mono text-[12px] md:text-[10px] text-ink/60">
        {meta?.clinicName ? loc(meta.clinicName, lang) : 'MedImage'}
      </div>
    </>
  );
}

/* ── BANK STATEMENT ──────────────────────────────────────────────────────── */

function BankBody({ lines, meta, lang }: { lines: string[]; meta?: EvidenceMeta; lang: Language }) {
  // Each line: "DATE|DESC|AMT|BAL" or plain text
  const rows = lines.map((l, i) => {
    const parts = l.split('|');
    const p0 = parts[0] ?? '', p1 = parts[1] ?? '', p2 = parts[2] ?? '', p3 = parts[3] ?? '';
    if (parts.length >= 4) {
      const amt = p2.trim();
      const isNeg = amt.startsWith('-') || amt.startsWith('−');
      return {
        date: p0.trim(), desc: p1.trim(), amt, bal: p3.trim(),
        amtColor: isNeg ? 'var(--danger, #b23a2e)' : 'var(--success, #5c7a33)',
        bg: i % 2 ? 'rgba(0,0,0,.02)' : '#fff',
      };
    }
    return { date: '', desc: l, amt: '', bal: '', amtColor: 'inherit', bg: i % 2 ? 'rgba(0,0,0,.02)' : '#fff' };
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-accent">■</span>
          <span className="font-mono text-[12px] font-bold text-ink">{meta?.bankName ? loc(meta.bankName, lang) : 'FinSecure Bank'}</span>
        </div>
        <span
          className="rounded border font-mono text-[8px] font-semibold text-ink/55"
          style={{ borderColor: 'rgba(31,41,55,.4)', padding: '2px 6px' }}
        >
          ВЫПИСКА ПО СЧЁТУ
        </span>
      </div>
      <div className="mt-2 font-mono text-[12px] md:text-[11px] text-ink/55">{meta?.accountMask ?? '•••• •••• •••• 4721'}</div>

      <div className="mt-3 overflow-hidden rounded-md border border-black/10">
        <div
          className="grid bg-[#e5e7eb] px-2.5 py-1.5"
          style={{ gridTemplateColumns: '46px 1fr 72px 72px' }}
        >
          {['ДАТА', 'ОПИСАНИЕ', 'СУММА', 'БАЛАНС'].map((h) => (
            <span key={h} className="font-mono text-[8px] font-semibold text-ink/40 last:text-right">
              {h}
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid items-center px-2.5 py-[7px]"
            style={{
              gridTemplateColumns: '46px 1fr 72px 72px',
              background: r.bg,
            }}
          >
            <span className="font-mono text-[12px] md:text-[9px] text-ink/60">{r.date}</span>
            <span className="font-mono text-[12px] md:text-[9px] text-ink">{r.desc}</span>
            <span className="text-right font-mono text-[12px] md:text-[9px] font-semibold" style={{ color: r.amtColor }}>{r.amt}</span>
            <span className="text-right font-mono text-[12px] md:text-[9px] text-ink/60">{r.bal}</span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 font-mono text-[12px] md:text-[9px] text-ink/40">
        Сформирован: {new Date().toLocaleDateString('ru')} · Оператор: Система · ЭЦП: ████████████
      </div>
    </>
  );
}

/* ── PHONE RECORDS ───────────────────────────────────────────────────────── */

function PhoneBody({ lines, meta, lang }: { lines: string[]; meta?: EvidenceMeta; lang: Language }) {
  // Each line: "DATE|TIME|NUMBER|DUR|TYPE" or plain
  const rows = lines.map((l, i) => {
    const p = l.split('|');
    const p0 = p[0] ?? '', p1 = p[1] ?? '', p2 = p[2] ?? '', p3 = p[3] ?? '', p4 = p[4] ?? '';
    if (p.length >= 5) {
      return {
        date: p0.trim(), time: p1.trim(), num: p2.trim(), dur: p3.trim(), type: p4.trim(),
        typeColor: 'rgba(31,41,55,.7)',
        bg: i % 2 ? 'rgba(0,0,0,.02)' : '#fff',
      };
    }
    return { date: '', time: '', num: l, dur: '', type: '', typeColor: 'inherit', bg: i % 2 ? 'rgba(0,0,0,.02)' : '#fff' };
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-accent">◈</span>
          <span className="font-mono text-[12px] font-bold text-ink">{meta?.carrierName ? loc(meta.carrierName, lang) : 'TeleLink'}</span>
        </div>
        <span className="font-mono text-[12px] md:text-[10px] text-ink/55">{meta?.phoneMask ?? '+7 (9••) •••-••-••'}</span>
      </div>

      <div className="mt-3 overflow-hidden rounded-md border border-black/10">
        <div
          className="grid bg-[#e5e7eb] px-2.5 py-1.5"
          style={{ gridTemplateColumns: '42px 44px 1fr 44px 36px' }}
        >
          {['ДАТА', 'ВРЕМЯ', 'НОМЕР', 'ДЛИТ.', 'ТИП'].map((h) => (
            <span key={h} className="font-mono text-[8px] font-semibold text-ink/40">{h}</span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid items-center px-2.5 py-[7px]"
            style={{
              gridTemplateColumns: '42px 44px 1fr 44px 36px',
              background: r.bg,
            }}
          >
            <span className="font-mono text-[12px] md:text-[9px] text-ink/60">{r.date}</span>
            <span className="font-mono text-[12px] md:text-[9px] font-medium text-ink">{r.time}</span>
            <span className="font-mono text-[12px] md:text-[9px] text-ink/75">{r.num}</span>
            <span className="font-mono text-[12px] md:text-[9px] text-ink/60">{r.dur}</span>
            <span className="font-mono text-[12px] md:text-[9px] font-medium" style={{ color: r.typeColor }}>{r.type}</span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 font-mono text-[12px] md:text-[9px] text-ink/40">
        {meta?.carrierName ? loc(meta.carrierName, lang) : 'TeleLink'}
      </div>
    </>
  );
}

/* ── SOCIAL MEDIA ────────────────────────────────────────────────────────── */

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#2563eb,#1e40af)',
  'linear-gradient(135deg,#7c3aed,#4c1d95)',
  'linear-gradient(135deg,#059669,#064e3b)',
  'linear-gradient(135deg,#dc2626,#7f1d1d)',
  'linear-gradient(135deg,#d97706,#78350f)',
  'linear-gradient(135deg,#0891b2,#164e63)',
  'linear-gradient(135deg,#db2777,#831843)',
  'linear-gradient(135deg,#65a30d,#365314)',
];

/**
 * Content format (each line):
 *   line 0 : "Author Name · date [· time]"
 *   line 1…N-2: post body text
 *   line N-1 (optional): reactions like "👍 12 · 💬 3 · 🔁 1"
 */
function SocialBody({ lines, meta }: { lines: string[]; meta?: EvidenceMeta }) {
  if (lines.length === 0) return <DefaultBody lines={lines} />;

  // Parse header
  const header = lines[0] ?? '';
  const parts = header.split(/\s*[·•]\s*/);
  const authorName = parts[0]?.trim() || 'Пользователь';
  const postDate = parts.slice(1).join(' · ').trim();

  // Check if last line is a reactions string
  const lastLine = lines[lines.length - 1] ?? '';
  const isReactionLine = lines.length > 1 && /^[👍💬🔁🤍❤️🔥😡]/.test(lastLine);
  const bodyLines = lines.slice(1, isReactionLine ? -1 : undefined);
  const reactions = isReactionLine
    ? lastLine.split(/\s*[·•]\s*/).filter(Boolean)
    : ['👍 0', '💬 0', '🔁 0'];

  const postText = bodyLines.join(' ');

  const initials = authorName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase() || '?';

  // Unique avatar color per author name
  const avatarGrad = AVATAR_GRADIENTS[strHash(authorName) % AVATAR_GRADIENTS.length]!;

  // Unique page URL suffix per content
  const urlSuffix = (strHash(lines.join('')) % 900000) + 100000;

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
      {/* Browser-bar */}
      <div className="flex items-center gap-1.5 border-b border-[#e5e7eb] bg-[#f3f4f6] px-3 py-2">
        <span className="text-[12px] md:text-[11px]">🔒</span>
        <span className="font-mono text-[12px] md:text-[11px] text-ink/60">{meta?.socialPlatform ?? 'vk.com'}/id{urlSuffix}</span>
      </div>

      <div className="p-3.5">
        {/* Author row */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-bold text-[13px] text-white"
            style={{ background: avatarGrad }}
          >
            {initials}
          </div>
          <div>
            <div className="font-sans text-[13px] font-semibold text-ink">{authorName}</div>
            <div className="font-sans text-[12px] md:text-[11px] text-[#9ca3af]">{postDate}</div>
          </div>
        </div>

        {/* Post text */}
        <p className="mt-3 font-sans text-[14px] leading-[1.55] text-ink">
          {postText || header}
        </p>

        {/* Reactions (parsed from last line) */}
        <div className="mt-3.5 flex gap-4 border-t border-[#f3f4f6] pt-2.5">
          {reactions.map((r) => (
            <span key={r} className="font-sans text-[12px] font-medium text-[#6b7280]">{r}</span>
          ))}
        </div>
      </div>

      {/* Watermark */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <span
          className="font-mono text-[22px] font-bold tracking-[3px] text-ink/10"
          style={{ transform: 'rotate(-14deg)', whiteSpace: 'nowrap' }}
        >
          АРХИВНАЯ КОПИЯ
        </span>
      </div>
    </div>
  );
}

/* ── DEFAULT (fallback) ──────────────────────────────────────────────────── */

function DefaultBody({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-md border border-dashed border-[#c7c2b6] bg-white p-4 font-mono text-[12.5px] leading-relaxed text-ink">
      {lines.map((line, i) => (
        <div key={i} className="border-b border-dashed border-black/10 py-1 last:border-0">
          {line}
        </div>
      ))}
    </div>
  );
}
