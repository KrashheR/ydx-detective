import type { EvidenceType } from '../types';
import type { UIKey } from '../i18n/ui';

/** Glyph per evidence type — keeps artifacts visually distinct without assets. */
export const EVIDENCE_ICON: Record<EvidenceType, string> = {
  photo: '📷',
  gps: '🗺️',
  document: '📄',
  witness_statement: '🗣️',
  camera_recording: '🎥',
  usage_log: '📊',
  xray: '🩻',
  bank_statement: '🏦',
  phone_records: '📞',
  social_media: '💬',
  document_scan: '🔎',
  thermal_scan: '🌡️',
  shadow_time_check: '◷',
  seal_match: '🧩',
  surface_reveal: '🖌️',
};

/** Short mono chip-tag i18n key per evidence type (the archive label). */
export const EVIDENCE_TAG_KEY: Record<EvidenceType, UIKey> = {
  photo: 'tag_photo',
  gps: 'tag_gps',
  document: 'tag_document',
  witness_statement: 'tag_witness',
  camera_recording: 'tag_camera',
  usage_log: 'tag_log',
  xray: 'tag_xray',
  bank_statement: 'tag_bank',
  phone_records: 'tag_phone',
  social_media: 'tag_social',
  document_scan: 'tag_document',
  thermal_scan: 'tag_photo',
  shadow_time_check: 'tag_photo',
  seal_match: 'tag_document',
  surface_reveal: 'tag_photo',
};

/** Format ms remaining as HH:MM:SS for the daily-case cooldown. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
