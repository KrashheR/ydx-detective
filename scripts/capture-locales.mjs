/**
 * Capture desktop + mobile screenshots for en, kk, tr, ar locales.
 * Output:
 *   screens/<lang>/desktop/  — 20 desktop shots (6 cases × 3 + catalog + achievements)
 *   screens/<lang>/mobile/   — 26 mobile shots  (6 cases × 4 + catalog + achievements)
 *   screens1/<lang>/desktop/ — 1 contradiction desktop shot
 *   screens1/<lang>/mobile/  — 1 contradiction mobile shot
 */

import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BASE_URL = 'http://127.0.0.1:4173';
const DEBUG_PORT = 9333;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profileDir = path.join(ROOT, '.chrome-screens-profile-locales');

const CASE_LIMIT = 6;

const LOCALES = {
  en: {
    evidenceTab: 'Evidence',
    markContradiction: 'MARK AS CONTRADICTION',
    reject: 'Reject',
    approve: 'Approve',
    nextCase: 'Next Case',
    backToDesk: 'Back to Desk',
    achievements: 'Achievements',
    selectCasePrompt: 'SELECT A CASE',
    ratingNever: "Don't ask again",
  },
  kk: {
    evidenceTab: 'Дәлелдер',
    markContradiction: 'ҚАЙШЫЛЫҚ ДЕП БЕЛГІЛЕУ',
    reject: 'Қабылдамау',
    approve: 'Мақұлдау',
    nextCase: 'Келесі іс',
    backToDesk: 'Үстелге',
    achievements: 'Жетістіктер',
    selectCasePrompt: 'ТЕРГЕУГЕ',
    ratingNever: 'Бұдан әрі сұрама',
  },
  tr: {
    evidenceTab: 'Kanıtlar',
    markContradiction: 'ÇELİŞKİ OLARAK İŞARETLE',
    reject: 'Reddet',
    approve: 'Onayla',
    nextCase: 'Sonraki Dosya',
    backToDesk: 'Masaya Dön',
    achievements: 'Başarılar',
    selectCasePrompt: 'SORUŞTURULACAK',
    ratingNever: 'Bir daha sorma',
  },
  ar: {
    evidenceTab: 'الأدلة',
    markContradiction: 'وضع علامة تناقض',
    reject: 'رفض',
    approve: 'الموافقة',
    nextCase: 'القضية التالية',
    backToDesk: 'العودة للمكتب',
    achievements: 'الإنجازات',
    selectCasePrompt: 'اختر قضية',
    ratingNever: 'لا تسأل مرة أخرى',
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (e) {
      lastError = e;
    }
    await sleep(200);
  }
  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (!msg.id) return;
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timed out: ${method}`));
      }, 20_000);
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timer); resolve(v); },
        reject: (e) => { clearTimeout(timer); reject(e); },
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() { this.socket.close(); }
}

async function loadCases() {
  const standardDir = path.join(ROOT, 'src', 'data', 'cases');
  const names = (await readdir(standardDir))
    .filter((n) => n.endsWith('.json') && !n.startsWith('daily'))
    .sort();
  const all = await Promise.all(
    names.map(async (n) => JSON.parse(await readFile(path.join(standardDir, n), 'utf8'))),
  );
  const config = await readFile(path.join(ROOT, 'src', 'config', 'gameConfig.ts'), 'utf8');
  const levels = new Map(
    [...config.matchAll(/'(case-\d+)':\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]),
  );
  all.sort(
    (a, b) =>
      (levels.get(a.id) ?? 999) - (levels.get(b.id) ?? 999) ||
      Number(a.id.match(/\d+/)?.[0]) - Number(b.id.match(/\d+/)?.[0]),
  );
  return all.slice(0, CASE_LIMIT);
}

async function main() {
  const cases = await loadCases();

  const vite = spawn(
    process.execPath,
    [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', '4173'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true },
  );
  vite.stdout.on('data', (c) => process.stdout.write(c));
  vite.stderr.on('data', (c) => process.stderr.write(c));

  let chrome, cdp;
  try {
    await waitFor(BASE_URL);
    chrome = spawn(
      CHROME,
      [
        '--headless=new', '--disable-gpu', '--hide-scrollbars',
        '--disable-extensions', '--no-first-run', '--no-default-browser-check',
        `--remote-debugging-port=${DEBUG_PORT}`,
        `--user-data-dir=${profileDir}`,
        '--window-size=1600,900', BASE_URL,
      ],
      { stdio: 'ignore', windowsHide: true },
    );

    await waitFor(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    let page;
    const deadline = Date.now() + 15_000;
    while (!page && Date.now() < deadline) {
      const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      page = targets.find((t) => t.type === 'page' && t.url.startsWith(BASE_URL));
      if (!page) await sleep(200);
    }
    if (!page) throw new Error('No page target');

    cdp = new Cdp(page.webSocketDebuggerUrl);
    await cdp.open();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');

    const evaluate = async (expr, awaitPromise = true) => {
      const result = await cdp.send('Runtime.evaluate', {
        expression: expr,
        awaitPromise,
        returnByValue: true,
        userGesture: true,
      });
      if (result.exceptionDetails) {
        const desc = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text;
        throw new Error(desc);
      }
      return result.result.value;
    };

    const waitForJs = async (expr, ms = 15_000) => {
      const d = Date.now() + ms;
      while (Date.now() < d) {
        if (await evaluate(`Boolean(${expr})`)) return;
        await sleep(100);
      }
      throw new Error(`Timed out waiting for: ${expr}`);
    };

    const setViewport = async (w, h, mobile = false) => {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: w, height: h, deviceScaleFactor: 1, mobile,
        screenWidth: w, screenHeight: h,
      });
      await sleep(350);
    };

    const shot = async (dir, name) => {
      await evaluate('window.scrollTo(0, 0)');
      await sleep(300);
      const { data } = await cdp.send('Page.captureScreenshot', {
        format: 'png', fromSurface: true, captureBeyondViewport: false,
      });
      await writeFile(path.join(dir, `${name}.png`), Buffer.from(data, 'base64'));
    };

    const clickButton = async (needle) => {
      const clicked = await evaluate(`(() => {
        const needle = ${JSON.stringify(needle)}.toLowerCase();
        const btn = [...document.querySelectorAll('button')].find((b) =>
          b.textContent?.replace(/\\s+/g, ' ').trim().toLowerCase().includes(needle)
        );
        if (!btn) return false;
        btn.click();
        return true;
      })()`);
      if (!clicked) throw new Error(`Button not found: ${needle}`);
      await sleep(450);
    };

    const clickEvidence = async (evidenceTitle) => {
      const clicked = await evaluate(`(() => {
        const title = ${JSON.stringify(evidenceTitle)};
        const btn = [...document.querySelectorAll('button')].find((b) =>
          b.textContent?.includes(title)
        );
        if (!btn) return false;
        btn.click();
        return true;
      })()`);
      if (!clicked) throw new Error(`Evidence not found: ${evidenceTitle}`);
      await waitForJs('document.querySelector(\'[role="dialog"]\')');
      await sleep(350);
    };

    const dismissRatingIfPresent = async (neverText) => {
      const dismissed = await evaluate(`(() => {
        const text = ${JSON.stringify(neverText)};
        const el = [...document.querySelectorAll('[role="button"]')].find(
          (e) => e.textContent?.trim() === text
        );
        if (!el) return false;
        el.click();
        return true;
      })()`);
      if (dismissed) await sleep(400);
    };

    const reloadClean = async () => {
      // location.reload() destroys the JS context so CDP may throw — that's expected
      try { await evaluate('localStorage.clear(); location.reload()', false); } catch { /* navigation */ }
      await sleep(1_500);
      await waitForJs('window.__cheat');
    };

    const initLocale = async (lang) => {
      // Ensure the page is ready before touching it (critical on first locale)
      await waitForJs('window.__cheat');
      await reloadClean();
      await evaluate('window.__cheat({ balance: 5000000, xp: 1000000 })');
      await sleep(300); // let persist() flush to localStorage
      // Inject language into the persisted save
      await evaluate(`(() => {
        const raw = localStorage.getItem('claimDetectiveSave');
        if (!raw) return;
        const save = JSON.parse(raw);
        save.stats = { ...save.stats, language: ${JSON.stringify(lang)} };
        localStorage.setItem('claimDetectiveSave', JSON.stringify(save));
      })()`);
      try { await evaluate('location.reload()', false); } catch { /* navigation */ }
      await sleep(1_500);
      await waitForJs('window.__cheat');
    };

    // ─── per-locale loop ────────────────────────────────────────────────────
    for (const [lang, strings] of Object.entries(LOCALES)) {
      console.log(`\n=== Locale: ${lang} ===`);

      const desktopDir = path.join(ROOT, 'screens', lang, 'desktop');
      const mobileDir  = path.join(ROOT, 'screens', lang, 'mobile');
      const desktopDir1 = path.join(ROOT, 'screens1', lang, 'desktop');
      const mobileDir1  = path.join(ROOT, 'screens1', lang, 'mobile');
      await mkdir(desktopDir, { recursive: true });
      await mkdir(mobileDir,  { recursive: true });
      await mkdir(desktopDir1, { recursive: true });
      await mkdir(mobileDir1,  { recursive: true });

      await initLocale(lang);

      // ── 6-case run ──────────────────────────────────────────────────────
      for (let i = 0; i < cases.length; i++) {
        const caseData = cases[i];
        const title = caseData.title[lang] ?? caseData.title.ru;
        const evidence = caseData.truth === 'fraud'
          ? caseData.evidences.find((e) => e.isContradiction) ?? caseData.evidences[0]
          : caseData.evidences[0];
        const evTitle = evidence.title[lang] ?? evidence.title.ru;

        console.log(`  [${i + 1}/${cases.length}] ${caseData.id}`);
        await waitForJs(`document.body.innerText.includes(${JSON.stringify(title)})`);

        // Desktop: case overview
        await setViewport(1600, 900, false);
        await shot(desktopDir, `${caseData.id}-01-case`);

        // Mobile: statement tab
        await setViewport(450, 800, true);
        await shot(mobileDir, `${caseData.id}-01-statement`);
        // Mobile: evidence tab
        await clickButton(strings.evidenceTab);
        await shot(mobileDir, `${caseData.id}-02-evidence`);

        // Evidence modal
        await clickEvidence(evTitle);
        await shot(mobileDir, `${caseData.id}-03-evidence-modal`);
        await setViewport(1600, 900, false);
        await shot(desktopDir, `${caseData.id}-02-evidence-modal`);

        if (caseData.truth === 'fraud') await clickButton(strings.markContradiction);
        await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);
        await sleep(300);

        // Verdict
        await clickButton(caseData.truth === 'fraud' ? strings.reject : strings.approve);
        await waitForJs('document.querySelector(\'[role="dialog"]\')');
        await dismissRatingIfPresent(strings.ratingNever);

        await setViewport(1600, 900, false);
        await shot(desktopDir, `${caseData.id}-03-result`);
        await setViewport(450, 800, true);
        await shot(mobileDir, `${caseData.id}-04-result`);

        if (i < cases.length - 1) await clickButton(strings.nextCase);
      }

      // Catalog + achievements
      await clickButton(strings.backToDesk);
      await waitForJs(`document.body.innerText.includes(${JSON.stringify(strings.selectCasePrompt)})`);
      await setViewport(1600, 900, false);
      await shot(desktopDir, 'screen-01-case-catalog');
      await clickButton(strings.achievements);
      await shot(desktopDir, 'screen-02-achievements');
      await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);
      await setViewport(450, 800, true);
      await shot(mobileDir, 'screen-01-case-catalog');
      await clickButton(strings.achievements);
      await shot(mobileDir, 'screen-02-achievements');
      await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);

      console.log(`  catalog + achievements done`);

      // ── Contradiction shot ───────────────────────────────────────────────
      const fraudCase = cases.find((c) => c.truth === 'fraud');
      if (fraudCase) {
        const title = fraudCase.title[lang] ?? fraudCase.title.ru;
        const ev = fraudCase.evidences.find((e) => e.isContradiction) ?? fraudCase.evidences[0];
        const evTitle = ev.title[lang] ?? ev.title.ru;

        // Reload to first case cleanly
        await initLocale(lang);
        await waitForJs(`document.body.innerText.includes(${JSON.stringify(title)})`);

        // Mobile contradiction
        await setViewport(450, 800, true);
        await clickButton(strings.evidenceTab);
        await clickEvidence(evTitle);
        await clickButton(strings.markContradiction);
        await shot(mobileDir1, 'contradiction');

        // Close, reload clean, desktop contradiction
        await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);
        await sleep(300);
        await initLocale(lang);
        await waitForJs(`document.body.innerText.includes(${JSON.stringify(title)})`);

        await setViewport(1600, 900, false);
        await clickEvidence(evTitle);
        await clickButton(strings.markContradiction);
        await shot(desktopDir1, 'contradiction');
        await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);

        console.log(`  contradiction shot done`);
      }

      console.log(`  locale ${lang} complete — ${CASE_LIMIT * 3 + 2} desktop, ${CASE_LIMIT * 4 + 2} mobile`);
    }

    console.log('\nAll locales done.');
  } finally {
    cdp?.close();
    chrome?.kill();
    vite.kill();
    await sleep(300);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
