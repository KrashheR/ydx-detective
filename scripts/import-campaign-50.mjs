import {
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { join, relative, dirname, basename, isAbsolute, resolve } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'big-update', 'WHERE_IS_THE_LIE_CAMPAIGN_1_50_INTERACTIVE');
const sourceFile = join(sourceRoot, '00_MASTER', 'ALL_CASES_1_50_RU.json');
const casesRoot = join(root, 'src', 'data', 'cases');
const publicRoot = join(root, 'public');
const sourceCasesAssets = join(sourceRoot, 'generated-assets', 'src', 'data', 'cases');
const campaign = JSON.parse(readFileSync(sourceFile, 'utf8'));

function walk(directory, predicate = () => true) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path, predicate) : predicate(path) ? [path] : [];
  });
}

const jsonFiles = walk(casesRoot, (path) => path.endsWith('.json'));
const outputById = new Map();
for (const path of jsonFiles) {
  const raw = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
  if (raw.type === 'standard') outputById.set(raw.id, path);
}

function localized(value, fallback = '') {
  const ru = typeof value === 'string' ? value : value?.ru ?? fallback;
  const en = typeof value === 'string' ? value : value?.en ?? ru;
  return { ru, en, tr: en, ar: en, kk: ru };
}

function localizedLines(value) {
  const ru = value?.ru ?? [];
  const en = value?.en ?? ru;
  return { ru, en, tr: en, ar: en, kk: ru };
}

function publicAssetPath(caseId, path) {
  if (path.startsWith('shared/')) return path.replace(/\.webp$/i, '.svg');
  return `cases/${caseId}/${path}`;
}

function rewriteAssets(caseId, assets) {
  if (!assets) return undefined;
  return Object.fromEntries(Object.entries(assets).map(([key, value]) => [
    key,
    Array.isArray(value)
      ? value.map((item) => publicAssetPath(caseId, item))
      : publicAssetPath(caseId, value),
  ]));
}

function pathInside(base, path, label) {
  const target = resolve(base, path);
  const relativePath = relative(base, target);
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`${label} escapes its expected root: ${path}`);
  }
  return target;
}

function copyBinding(binding, label) {
  if (!binding.copyFrom || !binding.copyTo) {
    throw new Error(`${label} is missing copyFrom/copyTo`);
  }
  const source = pathInside(sourceRoot, binding.copyFrom, `${label}.copyFrom`);
  const output = pathInside(root, binding.copyTo, `${label}.copyTo`);
  if (!existsSync(source)) throw new Error(`${label} source does not exist: ${binding.copyFrom}`);
  mkdirSync(dirname(output), { recursive: true });
  copyFileSync(source, output);
}

function personImage(sourceCase) {
  const binding = sourceCase.assetBindings?.claimantPortraitBinding;
  if (!binding) throw new Error(`${sourceCase.id} is missing claimantPortraitBinding`);
  if (binding.mode === 'no_portrait') return undefined;
  if (!binding.runtimeValue) throw new Error(`${sourceCase.id} portrait binding has no runtimeValue`);
  if (binding.mode === 'replace') copyBinding(binding, `${sourceCase.id} portrait`);
  if (binding.mode === 'retain_existing') {
    const existing = pathInside(publicRoot, binding.runtimeValue, `${sourceCase.id} portrait runtimeValue`);
    if (!existsSync(existing)) {
      throw new Error(`${sourceCase.id} retained portrait does not exist: ${binding.runtimeValue}`);
    }
  }
  return binding.runtimeValue;
}

function evidenceImageBindings(sourceCase) {
  const entries = sourceCase.assetBindings?.evidence;
  if (!Array.isArray(entries)) throw new Error(`${sourceCase.id} is missing evidence asset bindings`);
  const bindings = new Map();
  for (const entry of entries) {
    if (bindings.has(entry.evidenceId)) {
      throw new Error(`${sourceCase.id} has duplicate bindings for ${entry.evidenceId}`);
    }
    bindings.set(entry.evidenceId, entry.legacyImageBinding ?? null);
  }
  return bindings;
}

function mapEvidence(caseId, evidence, imageBinding) {
  const type = evidence.type === 'gps_track' ? 'gps' : evidence.type;
  const statementLink = evidence.statementLink
    ? { ...evidence.statementLink, reason: localized(evidence.statementLink.reason) }
    : undefined;
  const target = evidence.contradictionTarget
    ? { ...evidence.contradictionTarget, reason: localized(evidence.contradictionTarget.reason) }
    : null;
  const mapped = {
    id: evidence.id,
    order: evidence.order,
    type,
    title: localized(evidence.title),
    content: localized(evidence.text),
    isContradiction: evidence.isContradiction,
    contradictionExplanation: localized(evidence.statusExplanation),
    narrativeRole: evidence.narrativeRole,
    statementLink,
    contradictionTarget: target,
    evidenceTier: evidence.evidenceTier,
    unlocksAfterEvidenceIds: evidence.unlocksAfterEvidenceIds,
    revealsEvidenceIds: evidence.revealsEvidenceIds,
    requiredForVerdict: evidence.requiredForVerdict,
    rewardWeight: evidence.rewardWeight,
  };
  if (imageBinding) {
    if (!imageBinding.runtimeValue) {
      throw new Error(`${caseId}/${evidence.id} image binding has no runtimeValue`);
    }
    copyBinding(imageBinding, `${caseId}/${evidence.id} image`);
    mapped.meta = { imageUrl: imageBinding.runtimeValue };
  }
  if (evidence.description) mapped.description = localized(evidence.description);
  if (evidence.instruction) mapped.instruction = localized(evidence.instruction);
  if (evidence.previousType) mapped.previousType = evidence.previousType;
  if (evidence.assets) mapped.assets = rewriteAssets(caseId, evidence.assets);
  if (evidence.uiHints) mapped.uiHints = evidence.uiHints;
  if (evidence.interactiveDesign) {
    mapped.interactiveDesign = {
      why: localized(evidence.interactiveDesign.why),
      playerAction: localized(evidence.interactiveDesign.playerAction),
      conclusion: localized(evidence.interactiveDesign.conclusion),
    };
  }
  if (evidence.data) {
    mapped.data = structuredClone(evidence.data);
    if (type === 'surface_reveal') {
      mapped.data.traces = mapped.data.traces.map((trace) => ({
        ...trace,
        mask: trace.mask ? publicAssetPath(caseId, trace.mask) : trace.mask,
      }));
    }
  }
  return mapped;
}

function mapNarrative(narrative) {
  if (!narrative) return undefined;
  return {
    preBrief: localized(narrative.preBrief),
    postVerdictNote: localized(narrative.postVerdictNote),
    nextCaseTeaser: localized(narrative.nextCaseTeaser),
    seasonClue: narrative.seasonClue ? {
      ...narrative.seasonClue,
      label: localized(narrative.seasonClue.label),
      description: localized(narrative.seasonClue.description),
    } : null,
    epilogue: narrative.epilogue ? localized(narrative.epilogue) : null,
  };
}

function mapSynthesis(value) {
  if (!value) return undefined;
  return {
    ...value,
    title: localized(value.title),
    instruction: localized(value.instruction),
    nodes: value.nodes.map((node) => ({ ...node, label: localized(node.label) })),
    successConclusion: localized(value.successConclusion),
  };
}

function caseOutputPath(sourceCase) {
  const existing = outputById.get(sourceCase.id);
  if (existing) return existing;
  // The legacy suitcase file was named case-007.json but has stable id case-417.
  if (sourceCase.id === 'case-417') return join(casesRoot, 'case-007.json');
  return join(casesRoot, `${sourceCase.id}.json`);
}

for (const sourceCase of campaign) {
  const portrait = personImage(sourceCase);
  const imageBindings = evidenceImageBindings(sourceCase);
  const evidenceIds = new Set(sourceCase.evidence.map((evidence) => evidence.id));
  for (const evidenceId of imageBindings.keys()) {
    if (!evidenceIds.has(evidenceId)) {
      throw new Error(`${sourceCase.id} has an image binding for unknown evidence ${evidenceId}`);
    }
  }
  const mapped = {
    id: sourceCase.id,
    type: 'standard',
    campaignOrder: sourceCase.campaignOrder,
    requiredLevel: Math.min(sourceCase.requiredLevel, 16),
    act: sourceCase.act,
    actTitle: localized(sourceCase.actTitle),
    difficulty: sourceCase.difficulty,
    claimAmount: Number(sourceCase.claimAmount?.value ?? sourceCase.claimAmount),
    truth: sourceCase.groundTruth,
    title: localized(sourceCase.title),
    claim: { person: localized(sourceCase.claimant.name), story: localized(sourceCase.claimText) },
    client: {
      role: localized({ ru: 'Заявитель · страховое дело', en: 'Claimant · insurance file' }),
      meta: [
        { k: localized({ ru: 'Акт', en: 'Act' }), v: localized(String(sourceCase.act)) },
        { k: localized({ ru: 'Порядок', en: 'Campaign order' }), v: localized(String(sourceCase.campaignOrder)) },
      ],
    },
    coverImage: sourceCase.id === 'case-417' ? 'covers/case-007.svg' : `covers/${sourceCase.id}.svg`,
    ...(portrait ? { personImage: portrait } : {}),
    evidences: sourceCase.evidence.map((evidence) => (
      mapEvidence(sourceCase.id, evidence, imageBindings.get(evidence.id))
    )),
    correctDecision: sourceCase.correctDecision,
    explanation: localizedLines(sourceCase.finalExplanation),
    investigationBudget: sourceCase.investigationBudget,
    claimStatements: sourceCase.claimStatements.map((statement) => ({
      ...statement,
      text: localized(statement.text),
    })),
    contentVersion: 'archive17_full_v1',
    schemaVersion: 2,
    revisionVersion: sourceCase.revisionVersion,
    narrative: mapNarrative(sourceCase.narrative),
    ...(sourceCase.onboarding ? {
      onboarding: {
        phase: sourceCase.onboarding.phase,
        targetDurationSeconds: sourceCase.onboarding.targetDurationSeconds,
        teaches: sourceCase.onboarding.teaches,
        menuUnlockAfterVerdict: sourceCase.onboarding.menuUnlockAfterVerdict,
        ...(sourceCase.onboarding.unlocks ? { unlocks: sourceCase.onboarding.unlocks } : {}),
        successEmotion: localized({ ru: sourceCase.onboarding.successEmotion, en: sourceCase.onboarding.successEmotionEn }),
      },
    } : {}),
    ...(sourceCase.finalSynthesis ? { finalSynthesis: mapSynthesis(sourceCase.finalSynthesis) } : {}),
  };
  const output = caseOutputPath(sourceCase);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(mapped, null, 2)}\n`, 'utf8');
}

// Interactive evidence uses public/cases/... runtime URLs. Keep that public
// mirror synchronized with every generated WebP shipped by the archive.
for (const source of walk(sourceCasesAssets, (path) => path.endsWith('.webp'))) {
  const output = pathInside(publicRoot, join('cases', relative(sourceCasesAssets, source)), 'generated WebP');
  mkdirSync(dirname(output), { recursive: true });
  copyFileSync(source, output);
}

// Frontend-owned overlays are deterministic placeholders: the runtime draws the
// real zones, shadows and masks from JSON/Canvas, while these files keep every
// authored asset reference resolvable for offline hosting.
const referenced = campaign.flatMap((entry) => entry.evidence.flatMap((evidence) => {
  const assets = evidence.assets ? Object.values(evidence.assets).flat() : [];
  const masks = evidence.data?.traces?.map((trace) => trace.mask).filter(Boolean) ?? [];
  return [...assets, ...masks].map((path) => ({ caseId: entry.id, path }));
}));
for (const { caseId, path } of referenced) {
  if (path.endsWith('.webp')) continue;
  const output = join(publicRoot, publicAssetPath(caseId, path));
  mkdirSync(dirname(output), { recursive: true });
  if (path.endsWith('.json')) writeFileSync(output, '{}\n', 'utf8');
  else if (path.endsWith('.svg')) writeFileSync(output, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M8 62 C28 34 59 76 92 38" fill="none" stroke="white" stroke-width="14" stroke-linecap="round"/></svg>\n', 'utf8');
}
for (const name of ['dirt', 'soot', 'frost']) {
  const output = join(publicRoot, 'shared', 'surface', `${name}.svg`);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><filter id="n"><feTurbulence baseFrequency=".18" numOctaves="3"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity=".62"/></svg>\n`, 'utf8');
}

console.log(`Imported ${campaign.length} campaign cases into ${relative(root, casesRoot)}.`);
