/**
 * The human closing of a case — shown after a *correct* verdict and before the
 * reward sheet.
 *
 * Three layers, strictly in order (see docs/03-gameplay.md):
 *   1. what the person felt  — portrait + one closing line;
 *   2. why the verdict holds — a compact chain, opened on demand;
 *   3. what changed in the larger story — the Archive No. 17 entry.
 *
 * Rewards, XP and percentages never appear here: they belong to `ResultSheet`,
 * which follows. A wrong verdict never reaches this component, because several
 * closing lines contain an indirect confession.
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Case, Language } from '../types';
import { loc, t } from '../i18n/ui';
import { asset } from '../utils/asset';

interface Props {
  caseData: Case;
  lang: Language;
  onContinue: () => void;
}

/** Portrait framing per emotional mode — grave cases get no playful tilt. */
const MOOD_TILT: Record<string, number> = {
  relief: -1.2,
  humour: -2.4,
  bittersweet: -1,
  defeat: 1.4,
  grave: 0,
  threat: 0.8,
};

export function CaseResolutionSheet({ caseData, lang, onContinue }: Props) {
  const resolution = caseData.resolution;
  const [chainOpen, setChainOpen] = useState(false);
  const continueRef = useRef<HTMLButtonElement>(null);
  const onContinueRef = useRef(onContinue);

  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    // Escape only. Enter belongs to whatever button has focus — grabbing it here
    // would open the разбор and skip past it in the same keystroke.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onContinueRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => continueRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!resolution) return null;

  const approved = resolution.verdict === 'approve';
  const grave = resolution.emotionalMode === 'grave';
  const tilt = MOOD_TILT[resolution.emotionalMode] ?? 0;
  const accent = approved ? '#15803d' : '#b4231f';
  const titleId = `resolution-title-${caseData.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,17,.88)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-full w-full max-w-[430px] overflow-auto focus:outline-none"
        style={{ background: '#f5f1e8', borderRadius: 11, boxShadow: '0 24px 60px rgba(0,0,0,.5)' }}
        initial={{ y: 14, opacity: 0, scale: 0.99 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: grave ? 0.42 : 0.28, ease: 'easeOut' }}
      >
        {/* ── Verdict stamp ─────────────────────────────────────── */}
        <div style={{ padding: '24px 24px 4px', textAlign: 'center' }}>
          <motion.span
            id={titleId}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transform: 'rotate(-6deg)',
              border: `3px solid ${accent}`,
              borderRadius: approved ? 7 : 2,
              color: accent,
              background: approved ? 'rgba(21,128,61,.05)' : 'rgba(180,35,31,.05)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 1,
              padding: '8px 15px',
              opacity: 0.94,
            }}
            initial={{ scale: 1.9, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 0.94, rotate: -6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          >
            {/* Shape + glyph + text: never colour alone (a11y). */}
            <span aria-hidden>{approved ? '✓' : '✕'}</span>
            {t(approved ? 'resolutionStampApproved' : 'resolutionStampRejected', lang)}
          </motion.span>
        </div>

        {/* ── The person and their line ─────────────────────────── */}
        <motion.div
          style={{ display: 'flex', gap: 14, padding: '18px 24px 20px', alignItems: 'flex-start' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: grave ? 0.55 : 0.4, duration: 0.3 }}
        >
          {caseData.personImage && (
            <img
              src={asset(caseData.personImage)}
              alt=""
              style={{
                width: 96,
                height: 96,
                flexShrink: 0,
                objectFit: 'cover',
                border: '4px solid #fffdf8',
                borderRadius: 3,
                boxShadow: '0 3px 10px rgba(0,0,0,.22)',
                transform: `rotate(${tilt}deg)`,
                filter: grave ? 'saturate(.85)' : undefined,
              }}
            />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: '#3a3024',
              }}
            >
              {loc(resolution.speaker.displayName, lang)}
            </div>
            {/* Transcript card, not a cartoon speech bubble. */}
            <div
              style={{
                marginTop: 7,
                background: '#fffdf8',
                borderLeft: `3px solid ${accent}`,
                borderRadius: 4,
                padding: '11px 13px',
                fontFamily: "'IBM Plex Serif', serif",
                fontSize: 14,
                lineHeight: 1.5,
                color: '#3a3024',
              }}
            >
              «{loc(resolution.finalLine, lang)}»
            </div>
          </div>
        </motion.div>

        {/* ── Vera's one-line professional note ─────────────────── */}
        {resolution.veraLine && (
          <div style={{ padding: '0 24px 16px' }}>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                lineHeight: 1.45,
                color: '#7a6c54',
              }}
            >
              <span style={{ fontWeight: 700, color: '#5d5240' }}>
                {t('resolutionVeraLabel', lang)}:
              </span>{' '}
              {loc(resolution.veraLine, lang)}
            </div>
          </div>
        )}

        {/* ── Layer 2: the compact разбор, on demand ────────────── */}
        {resolution.reasoningChain && resolution.reasoningChain.length > 0 && (
          <div style={{ padding: '0 24px 8px' }}>
            {!chainOpen ? (
              <button
                type="button"
                onClick={() => setChainOpen(true)}
                style={{
                  width: '100%',
                  minHeight: 44,
                  border: '1.5px solid #d6c9ad',
                  borderRadius: 10,
                  background: 'transparent',
                  color: '#5d5240',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('resolutionWhy', lang)}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1.4,
                    color: '#9a8c70',
                    marginBottom: 9,
                  }}
                >
                  {t('resolutionChainTitle', lang)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {resolution.reasoningChain.map((link, index) => (
                    <div
                      key={index}
                      style={{
                        background: '#fffdf8',
                        border: '1px solid #e7ddc9',
                        borderRadius: 5,
                        padding: '10px 12px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          textTransform: 'uppercase',
                          color: accent,
                        }}
                      >
                        {index + 1}. {loc(link.label, lang)}
                      </div>
                      <div
                        style={{
                          marginTop: 3,
                          fontFamily: "'IBM Plex Serif', serif",
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: '#3a3024',
                        }}
                      >
                        {loc(link.text, lang)}
                      </div>
                      {link.evidenceIds.length > 0 && (
                        <div
                          style={{
                            marginTop: 6,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 6,
                          }}
                        >
                          {link.evidenceIds.map((evidenceId) => {
                            const ev = caseData.evidences.find((e) => e.id === evidenceId);
                            if (!ev) return null;
                            return (
                              <span
                                key={evidenceId}
                                style={{
                                  fontFamily: "'Inter', sans-serif",
                                  fontSize: 12,
                                  color: '#7a6c54',
                                  background: '#f0e9d8',
                                  borderRadius: 4,
                                  padding: '2px 7px',
                                }}
                              >
                                {loc(ev.title, lang)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ── Layer 3: the arc discovery, visually its own thing ── */}
        {resolution.arcReveal && (
          <div style={{ padding: '14px 24px 0' }}>
            <div
              style={{
                border: '1px dashed #9a8c70',
                borderRadius: 6,
                background: 'rgba(58,48,36,.05)',
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: '#7a6c54',
                }}
              >
                {t('resolutionArchiveEntry', lang)}
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#3a3024',
                }}
              >
                {loc(resolution.arcReveal.title, lang)}
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontFamily: "'IBM Plex Serif', serif",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: '#4a4030',
                }}
              >
                {loc(resolution.arcReveal.text, lang)}
              </div>
            </div>
          </div>
        )}

        {/* ── Continue ──────────────────────────────────────────── */}
        <div style={{ padding: '16px 24px 22px' }}>
          <button
            ref={continueRef}
            type="button"
            onClick={onContinue}
            style={{
              width: '100%',
              height: 50,
              border: 'none',
              borderRadius: 10,
              background: '#3a3024',
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 0.3,
              cursor: 'pointer',
            }}
          >
            {t('resolutionContinue', lang)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
