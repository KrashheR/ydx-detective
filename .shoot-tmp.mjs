import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const OUT = process.argv[2] ?? path.resolve('shots');
const CASE_ID = 'case-001';
const CONTRA = ['ev-scene', 'ev-listing'];

const VIEWPORTS = [
  { name: '360x640', width: 360, height: 640 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1920x1080', width: 1920, height: 1080 },
];

const baseStats = (extra = {}) => ({
  balance: 30000, language: 'ru', completedCaseIds: [], results: {},
  lastDailyClaimServerMs: null, lastDailyCaseId: null, dailyAdUnlockServerDay: null,
  dailyAdCaseId: null, isBankrupt: false, interstitialsSeenTotal: 0, xp: 400,
  streakCount: 3, lastPlayedServerDay: null, perfectCaseStreakCount: 0,
  unlockedAchievementIds: [], ratingDismissals: 0,
  departmentLevels: { archive: 0, field: 0, lab: 0 }, serviceFreeUseServerDay: {},
  weeklyProgress: null, collectibleStampIds: [], archivePurchasedPackIds: [],
  noAdsPurchased: false, ownedStampTextIds: [], activeStampTextId: null,
  activeStampInkId: null, purchasedBundleIds: [], archiveUnlockedCaseIds: [],
  archiveAdUnlockServerDayByPack: {},
  interactiveEvidenceProgress: {
    'case-001/ev-scene': {
      evidenceId: 'ev-scene', opened: true, analysisCompleted: true,
      discoveredAnomalyIds: [], discoveredTraceIds: [], revealPercentByTrace: {},
      selectedContradiction: true, hintLevel: 0, attempts: 1, resetCount: 0,
    },
  },
  finalSynthesisProgress: {}, caseClueReveals: {}, metaUnlocked: true,
  firstSeenServerDay: 0, ...extra,
});

const session = (stamped) => ({
  caseId: CASE_ID,
  selectedEvidenceIds: stamped,
  stamps: stamped.map((evidenceId) => ({ caseId: CASE_ID, statementId: 'claim_main', evidenceId })),
  viewedEvidenceIds: CONTRA,
  revealedEvidenceIds: [], selectedService: null, hintsUsed: 0, extraOpens: 0,
  startedAtServerMs: 0,
});

const SCENARIOS = [
  { name: 'success', stamped: CONTRA, action: 'reject' },
  { name: 'failure', stamped: [], action: 'approve' },
  { name: 'incomplete', stamped: [CONTRA[0]], action: 'reject' },
];

const seed = (stamped, statsExtra) => ({
  version: 13, stats: baseStats(statsExtra), session: session(stamped),
});

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const scenario of SCENARIOS) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      ['claimDetectiveSave', JSON.stringify(seed(scenario.stamped))],
    );
    await page.goto(BASE, { waitUntil: 'networkidle' });

    const label = scenario.action === 'reject' ? /ОТКЛОНИТЬ ВЫПЛАТУ/i : /ОДОБРИТЬ ВЫПЛАТУ/i;
    await page.getByRole('button', { name: label }).first().click({ timeout: 20000 });
    await page.getByRole('dialog').waitFor({ timeout: 20000 });
    await page.waitForTimeout(1400);

    await page.screenshot({ path: path.join(OUT, `${scenario.name}-${vp.name}.png`) });

    // Overflow guard: the document must never scroll sideways.
    const overflow = await page.evaluate(() => ({
      docScrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    console.log(
      `${scenario.name} ${vp.name} h-overflow=${overflow.docScrollW - overflow.clientW}px errors=${errors.length}`,
      errors.slice(0, 2).join(' | '),
    );
    await context.close();
  }
}

await browser.close();
