/**
 * Injects the authored `resolution` block into each case JSON.
 *
 * Source of truth: `scripts/data/resolutions/*.json` — one file per act plus
 * `daily.json`, keyed by case id. Re-running is idempotent: the block is
 * replaced wholesale, so editing the authoring file and re-running is the
 * supported workflow (never hand-edit `resolution` inside a case file).
 *
 *   node scripts/apply-resolutions.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const casesDir = path.join(root, 'src/data/cases');
const authoringDir = path.join(root, 'scripts/data/resolutions');

/** Every case JSON in the campaign, the archives and the daily rotation. */
function caseFiles() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.json')) files.push(full);
    }
  };
  walk(casesDir);
  return files;
}

/**
 * Shared chain labels. Authoring files reference them by key so the same three
 * words stay identical across 56 cases and five languages.
 */
const CHAIN_LABELS = {
  truth: {
    ru: 'Что было правдой',
    en: 'What was true',
    tr: 'Doğru olan',
    ar: 'ما كان صحيحًا',
    kk: 'Не рас болды',
  },
  crack: {
    ru: 'Что не совпало',
    en: 'What did not match',
    tr: 'Uyuşmayan şey',
    ar: 'ما لم يتطابق',
    kk: 'Не сәйкес келмеді',
  },
  verdict: {
    ru: 'Почему этого достаточно',
    en: 'Why that is enough',
    tr: 'Bu neden yeterli',
    ar: 'لماذا هذا يكفي',
    kk: 'Неге бұл жеткілікті',
  },
  suspicion: {
    ru: 'Что вызывало подозрение',
    en: 'What looked suspicious',
    tr: 'Şüphe uyandıran şey',
    ar: 'ما بدا مريبًا',
    kk: 'Не күдік тудырды',
  },
  explained: {
    ru: 'Чем это объясняется',
    en: 'What explains it',
    tr: 'Bunu açıklayan şey',
    ar: 'ما يفسر ذلك',
    kk: 'Мұны не түсіндіреді',
  },
};

/** Expands `labelKey` shorthand into the full localized label. */
function expandChain(chain) {
  return chain.map((link) => {
    const { labelKey, ...rest } = link;
    if (!labelKey) return rest;
    const label = CHAIN_LABELS[labelKey];
    if (!label) throw new Error(`Unknown chain labelKey "${labelKey}"`);
    return { label, ...rest };
  });
}

const authored = new Map();
for (const file of fs.readdirSync(authoringDir).sort()) {
  if (!file.endsWith('.json')) continue;
  const batch = JSON.parse(fs.readFileSync(path.join(authoringDir, file), 'utf8'));
  for (const [caseId, resolution] of Object.entries(batch)) {
    if (authored.has(caseId)) throw new Error(`Duplicate resolution for ${caseId}`);
    authored.set(caseId, resolution);
  }
}

let written = 0;
const seen = new Set();
for (const file of caseFiles()) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const source = authored.get(raw.id);
  if (!source) continue;
  seen.add(raw.id);
  const resolution = { ...source };
  if (source.reasoningChain) resolution.reasoningChain = expandChain(source.reasoningChain);
  // `arcRevealFromSeasonClue` reuses the case's already-localized story clue
  // instead of re-translating the same discovery a second time.
  if (resolution.arcRevealFromSeasonClue) {
    delete resolution.arcRevealFromSeasonClue;
    const clue = raw.narrative?.seasonClue;
    if (!clue) throw new Error(`${raw.id}: arcRevealFromSeasonClue set but the case has no seasonClue`);
    resolution.arcReveal = { title: clue.label, text: clue.description, ...(source.arcReveal ?? {}) };
  }

  // Fail loudly rather than shipping a chain that points at nothing.
  const ids = new Set(raw.evidences.map((e) => e.id));
  const refs = [
    ...(resolution.reasoningChain ?? []).flatMap((l) => l.evidenceIds ?? []),
    ...(resolution.arcReveal?.evidenceIds ?? []),
  ];
  for (const id of refs) {
    if (!ids.has(id)) throw new Error(`${raw.id}: resolution references unknown evidence "${id}"`);
  }
  if (resolution.verdict !== raw.correctDecision) {
    throw new Error(`${raw.id}: resolution verdict "${resolution.verdict}" ≠ correctDecision "${raw.correctDecision}"`);
  }

  raw.resolution = resolution;
  fs.writeFileSync(file, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
  written += 1;
}

const missing = [...authored.keys()].filter((id) => !seen.has(id));
if (missing.length) throw new Error(`Authored resolutions with no matching case: ${missing.join(', ')}`);

console.log(`Applied ${written} resolutions.`);
