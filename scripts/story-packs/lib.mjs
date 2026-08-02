/**
 * Authoring helpers for premium story packs (`type: "archive"` cases).
 *
 * The JSON under `src/data/cases/packs/` is the shipped source of truth — these
 * builders only remove the repetitive scaffolding (interactive `uiHints`,
 * mirrored `statementLink`/`contradictionTarget`, folder covers) so a pack's
 * five-language content stays readable in one file per pack.
 *
 * Run `node scripts/generate-story-packs.mjs` after editing a pack file.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const CASES_ROOT = join(ROOT, 'src', 'data', 'cases', 'packs');
const COVERS_ROOT = join(ROOT, 'public', 'covers', 'packs');

/** A string in every supported language. Order matches `SUPPORTED_LANGUAGES`. */
export const L = (ru, en, tr, ar, kk) => ({ ru, en, tr, ar, kk });

/** Bullet lines (`explanation`) in every supported language. */
export const LL = (ru, en, tr, ar, kk) => ({ ru, en, tr, ar, kk });

const INTERACTIVE_TYPES = new Set([
  'document_scan',
  'thermal_scan',
  'shadow_time_check',
  'seal_match',
  'surface_reveal',
]);

/**
 * One evidence card.
 *
 * `link` is either `{ contradicts: statementId }` — the card is a stampable
 * proof — or `{ relation, statementId }` for context / season-clue cards.
 * `reason` doubles as `contradictionExplanation`, `statementLink.reason` and
 * (for interactives) the post-analysis conclusion, exactly like the campaign
 * content does.
 */
export function ev(spec) {
  const {
    id,
    type,
    title,
    content,
    reason,
    link,
    order,
    tier,
    meta,
    // interactive-only
    description,
    instruction,
    why,
    data,
    imageAsset,
    extraAssets,
  } = spec;

  const isContradiction = Boolean(link.contradicts);
  const statementId = link.contradicts ?? link.statementId;
  const relation = link.contradicts ? 'contradicts' : link.relation;

  const base = {
    id,
    order,
    type,
    title,
    content,
    isContradiction,
    contradictionExplanation: reason,
    statementLink: { statementId, relation, reason },
    ...(isContradiction ? { contradictionTarget: { statementId, reason } } : {}),
    evidenceTier: tier ?? (isContradiction ? 'core' : 'supporting'),
    ...(isContradiction ? { requiredForVerdict: true, rewardWeight: 1 } : {}),
    ...(meta ? { meta } : {}),
  };

  if (!INTERACTIVE_TYPES.has(type)) return base;

  return {
    ...base,
    description,
    instruction,
    assets: {
      baseImage: imageAsset,
      ...(type === 'surface_reveal'
        ? {
            coverTexture: `shared/surface/${data.coverType === 'soot' ? 'soot' : data.coverType === 'frost' ? 'frost' : 'dirt'}.svg`,
            revealMasks: ['shared/surface/trace-mask.svg'],
            toolCursor: 'shared/surface/cloth-cursor.svg',
          }
        : {}),
      ...(extraAssets ?? {}),
    },
    uiHints: { showReset: true, allowZoom: type !== 'surface_reveal', highlightAfterHint: true },
    interactiveDesign: { why, playerAction: instruction, conclusion: reason },
    data,
  };
}

/** `content` body every interactive card shares — the result stays hidden. */
export const INTERACTIVE_BODY = L(
  'Материал доступен для интерактивной экспертизы. Результат не показывается до завершения анализа.',
  'This evidence is available for interactive examination. The result stays hidden until the analysis is complete.',
  'Bu kanıt interaktif inceleme için mevcuttur. Sonuç, analiz tamamlanana kadar gizli kalır.',
  'هذا الدليل متاح للفحص التفاعلي. تبقى النتيجة مخفية حتى اكتمال التحليل.',
  'Материал интерактивті сараптамаға қолжетімді. Талдау аяқталмайынша нәтиже көрсетілмейді.',
);

/** The single `surface_reveal` trace the renderer scores (its hit area is fixed). */
export function surfaceTrace({
  id,
  label,
  labelEn,
  conclusion,
  conclusionEn,
  percent = 52,
  isContradiction = true,
}) {
  return {
    id,
    label,
    labelEn,
    requiredRevealPercent: percent,
    mask: 'shared/surface/trace-mask.svg',
    shape: 'mask',
    isContradiction,
    conclusion,
    conclusionEn,
  };
}

const ACCENT_HEX = {
  garden: { paper: '#e5d8b4', folder: '#b98f4e', ink: '#3f3222', stamp: '#7c8b3f' },
  night: { paper: '#cdd4dd', folder: '#4a5a6d', ink: '#232b34', stamp: '#8f2f24' },
  seaside: { paper: '#dcd8c2', folder: '#3f7d84', ink: '#2b3330', stamp: '#9a5a2c' },
};

/** Folder cover in the same flat-SVG style as `public/covers/case-0NN.svg`. */
function coverSvg(label, accent) {
  const c = ACCENT_HEX[accent];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="${c.paper}"/><rect x="38" y="42" width="564" height="316" rx="18" fill="${c.folder}" opacity=".36"/><path d="M70 118h500v202H70z" fill="#efe3c8" opacity=".92"/><path d="M104 92h178l28 34h226v38H104z" fill="${c.folder}"/><path d="M100 178h440M100 220h380M100 262h430" stroke="${c.ink}" stroke-width="10" stroke-linecap="round" opacity=".28"/><circle cx="502" cy="282" r="48" fill="none" stroke="${c.stamp}" stroke-width="12" opacity=".55"/><text x="320" y="78" font-family="Georgia,serif" font-size="26" text-anchor="middle" fill="${c.ink}">${label}</text></svg>`;
}

/**
 * Expand one pack definition into case JSON + folder covers.
 * Returns the generated case ids in pack order.
 */
export function buildPack(pack) {
  const ids = [];
  pack.cases.forEach((spec, index) => {
    const number = String(index + 1).padStart(2, '0');
    const id = `${pack.id}-${number}`;
    const coverPath = `covers/packs/${id}.svg`;

    const caseJson = {
      id,
      type: 'archive',
      difficulty: spec.difficulty,
      claimAmount: spec.claimAmount,
      truth: 'fraud',
      title: spec.title,
      claim: { person: spec.person, story: spec.story },
      coverImage: coverPath,
      personImage: `people/packs/${pack.id}/${spec.portrait}.webp`,
      client: spec.client,
      evidences: spec.evidences,
      correctDecision: 'reject',
      explanation: spec.explanation,
      investigationBudget: spec.investigationBudget ?? 4,
      claimStatements: spec.statements,
      contentVersion: pack.contentVersion,
      narrative: spec.narrative,
      ...(spec.finalSynthesis ? { finalSynthesis: spec.finalSynthesis } : {}),
    };

    const casePath = join(CASES_ROOT, pack.id, `${id}.json`);
    mkdirSync(dirname(casePath), { recursive: true });
    writeFileSync(casePath, `${JSON.stringify(caseJson, null, 2)}\n`, 'utf8');

    mkdirSync(COVERS_ROOT, { recursive: true });
    writeFileSync(
      join(COVERS_ROOT, `${id}.svg`),
      coverSvg(`${pack.coverLabel} ${number}`, pack.accent),
      'utf8',
    );
    ids.push(id);
  });
  return ids;
}
