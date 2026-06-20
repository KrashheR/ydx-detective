import type { EvidenceType } from '../types';

/** Glyph per evidence type — keeps artifacts visually distinct without assets. */
export const EVIDENCE_ICON: Record<EvidenceType, string> = {
  photo: '📷',
  gps: '🗺️',
  document: '📄',
  witness_statement: '🗣️',
  camera_recording: '🎥',
  usage_log: '📊',
};

/** Format ms remaining as HH:MM:SS for the daily-case cooldown. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
