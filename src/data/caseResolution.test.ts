/**
 * Case-resolution invariants — the human closing of every case.
 *
 * Zod already enforces the *shape* per case. These guard the campaign-wide
 * contract the schema cannot see: no case may ship without a closing reaction,
 * the reaction must belong to the correct verdict, and every one of the five
 * languages must actually be written (invariant 6 in CLAUDE.md).
 */
import { describe, it, expect } from 'vitest';
import { getStandardCases, getDailyCases } from './caseLoader';
import { SUPPORTED_LANGUAGES, type Case, type LocalizedString } from '../types';

const allCases: Case[] = [...getStandardCases(), ...getDailyCases()];

/** Every localized string reachable from a case's resolution block. */
function localizedStringsOf(caseData: Case): { path: string; value: LocalizedString }[] {
  const resolution = caseData.resolution;
  if (!resolution) return [];
  return [
    { path: 'speaker.displayName', value: resolution.speaker.displayName },
    { path: 'finalLine', value: resolution.finalLine },
    ...(resolution.veraLine ? [{ path: 'veraLine', value: resolution.veraLine }] : []),
    ...(resolution.arcReveal
      ? [
          { path: 'arcReveal.title', value: resolution.arcReveal.title },
          { path: 'arcReveal.text', value: resolution.arcReveal.text },
        ]
      : []),
    ...(resolution.reasoningChain ?? []).flatMap((link, index) => [
      { path: `reasoningChain[${index}].label`, value: link.label },
      { path: `reasoningChain[${index}].text`, value: link.text },
    ]),
  ];
}

describe('case resolutions', () => {
  it('ships a closing reaction for every campaign and daily case', () => {
    const missing = allCases.filter((c) => !c.resolution).map((c) => c.id);
    expect(missing).toEqual([]);
  });

  it('never contradicts the case verdict (a wrong stamp must not hear a confession)', () => {
    for (const c of allCases) {
      expect(c.resolution?.verdict, c.id).toBe(c.correctDecision);
    }
  });

  it('is translated into all five languages', () => {
    const gaps: string[] = [];
    for (const c of allCases) {
      for (const { path, value } of localizedStringsOf(c)) {
        for (const lang of SUPPORTED_LANGUAGES) {
          if (!value[lang]?.trim()) gaps.push(`${c.id} · ${path} · ${lang}`);
        }
      }
    }
    expect(gaps).toEqual([]);
  });

  it('keeps the разбор compact — at most three links, each anchored to real evidence', () => {
    for (const c of allCases) {
      const chain = c.resolution?.reasoningChain;
      if (!chain) continue;
      expect(chain.length, c.id).toBeLessThanOrEqual(3);
      const ids = new Set(c.evidences.map((e) => e.id));
      for (const link of chain) {
        expect(link.evidenceIds.length, `${c.id} chain link has no evidence`).toBeGreaterThan(0);
        for (const evidenceId of link.evidenceIds) {
          expect(ids.has(evidenceId), `${c.id} → ${evidenceId}`).toBe(true);
        }
      }
    }
  });

  it('gives recurring characters one stable identity across their cases', () => {
    const namesById = new Map<string, Set<string>>();
    for (const c of allCases) {
      const speaker = c.resolution?.speaker;
      if (!speaker) continue;
      const names = namesById.get(speaker.characterId) ?? new Set<string>();
      names.add(speaker.displayName.ru);
      namesById.set(speaker.characterId, names);
    }
    for (const [characterId, names] of namesById) {
      expect([...names], characterId).toHaveLength(1);
    }
  });
});
