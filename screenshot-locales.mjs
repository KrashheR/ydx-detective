/**
 * Capture 200 locale screenshots total:
 *   20 desktop + 20 mobile per locale for ru, en, kk, tr, ar.
 * Output:
 *   locale-screenshots/<lang>/desktop/
 *   locale-screenshots/<lang>/mobile/
 *
 * Shot set per case:
 *   desktop: overview -> evidence modal -> stamped modal -> result
 *   mobile:  statement -> evidence tab -> evidence modal -> result
 */

import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const BASE_URL = 'http://127.0.0.1:4173';
const DEBUG_PORT = 9333;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profileDir = path.join(ROOT, '.chrome-screens-profile-locales');
const outRoot = path.join(ROOT, 'locale-screenshots');

const LOCALES = {
  ru: {
    openCaseAction: 'Открыть дело',
    selectCasePrompt: 'ВЫБЕРИТЕ ДЕЛО ДЛЯ РАССЛЕДОВАНИЯ',
    evidenceTab: 'Улики',
    markContradiction: 'ОТМЕТИТЬ КАК ПРОТИВОРЕЧИЕ',
    reject: 'Отклонить',
    openDossier: 'Открыть досье',
    ratingNever: 'Больше не предлагать',
  },
  en: {
    openCaseAction: 'Open case',
    selectCasePrompt: 'SELECT A CASE TO INVESTIGATE',
    evidenceTab: 'Evidence',
    markContradiction: 'Mark as Contradiction',
    reject: 'Reject',
    openDossier: 'Open file',
    ratingNever: "Don't ask again",
  },
  kk: {
    openCaseAction: 'Істі ашу',
    selectCasePrompt: 'ТЕРГЕУГЕ ІС ТАҢДАҢЫЗ',
    evidenceTab: 'Дәлелдер',
    markContradiction: 'ҚАЙШЫЛЫҚ ДЕП БЕЛГІЛЕУ',
    reject: 'Қабылдамау',
    openDossier: 'Іс қағазын ашу',
    ratingNever: 'Бұдан әрі сұрама',
  },
  tr: {
    openCaseAction: 'Dosyayı aç',
    selectCasePrompt: 'SORUŞTURULACAK DOSYAYI SEÇİN',
    evidenceTab: 'Kanıtlar',
    markContradiction: 'ÇELİŞKİ OLARAK İŞARETLE',
    reject: 'Reddet',
    openDossier: 'Dosyayı aç',
    ratingNever: 'Bir daha sorma',
  },
  ar: {
    openCaseAction: 'فتح القضية',
    selectCasePrompt: 'اختر قضية للتحقيق',
    evidenceTab: 'الأدلة',
    markContradiction: 'وضع علامة تناقض',
    reject: 'رفض',
    openDossier: 'فتح الملف',
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
    } catch (error) {
      lastError = error;
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
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

async function loadCases() {
  const standardDir = path.join(ROOT, 'src', 'data', 'cases');
  const names = (await readdir(standardDir))
    .filter((name) => name.endsWith('.json') && !name.startsWith('daily'))
    .sort();
  const cases = await Promise.all(
    names.map(async (name) => {
      const raw = await readFile(path.join(standardDir, name), 'utf8');
      return JSON.parse(raw.replace(/^\uFEFF/, ''));
    }),
  );
  const config = await readFile(path.join(ROOT, 'src', 'config', 'gameConfig.ts'), 'utf8');
  const levels = new Map(
    [...config.matchAll(/'(case-\d+)':\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]),
  );
  cases.sort(
    (a, b) =>
      (levels.get(a.id) ?? 999) - (levels.get(b.id) ?? 999) ||
      Number(a.id.match(/\d+/)?.[0]) - Number(b.id.match(/\d+/)?.[0]),
  );
  return cases;
}

async function main() {
  const cases = await loadCases();
  const selectedCases = cases.slice(0, 5);
  if (selectedCases.length < 5) throw new Error('Need at least 5 standard cases for the screenshot set');

  await rm(outRoot, { recursive: true, force: true });
  await rm(profileDir, { recursive: true, force: true });
  await mkdir(outRoot, { recursive: true });

  const vite = spawn(
    process.execPath,
    [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', '4173'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true },
  );
  vite.stdout.on('data', (chunk) => process.stdout.write(chunk));
  vite.stderr.on('data', (chunk) => process.stderr.write(chunk));

  let chrome;
  let cdp;
  try {
    await waitFor(BASE_URL);
    chrome = spawn(
      CHROME,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--disable-extensions',
        '--no-first-run',
        '--no-default-browser-check',
        `--remote-debugging-port=${DEBUG_PORT}`,
        `--user-data-dir=${profileDir}`,
        '--window-size=1600,900',
        BASE_URL,
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
      const deadline = Date.now() + ms;
      while (Date.now() < deadline) {
        if (await evaluate(`Boolean(${expr})`)) return;
        await sleep(100);
      }
      throw new Error(`Timed out waiting for: ${expr}`);
    };

    const setViewport = async (w, h, mobile = false) => {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile,
        screenWidth: w,
        screenHeight: h,
      });
      await sleep(350);
    };

    const shot = async (dir, name) => {
      await evaluate('window.scrollTo(0, 0)');
      await sleep(300);
      const { data } = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
      });
      const webp = await sharp(Buffer.from(data, 'base64')).webp({ lossless: true, effort: 6 }).toBuffer();
      await writeFile(path.join(dir, `${name}.webp`), webp);
    };

    const clickButton = async (needle) => {
      const clicked = await evaluate(`(async () => {
        const needle = ${JSON.stringify(needle)}.toLowerCase();
        const deadline = Date.now() + 10000;
        while (Date.now() < deadline) {
          const btn = [...document.querySelectorAll('button')].find((b) =>
            b.textContent?.replace(/\\s+/g, ' ').trim().toLowerCase().includes(needle)
          );
          if (btn) {
            btn.click();
            return true;
          }
          await new Promise((r) => setTimeout(r, 100));
        }
        return false;
      })()`);
      if (!clicked) throw new Error(`Button not found: ${needle}`);
      await sleep(450);
    };

    const clickFirstEvidence = async (needle) => {
      const clicked = await evaluate(`(() => {
        const needle = ${JSON.stringify(needle)}.toLowerCase();
        const btn =
          document.querySelector('div.grid.grid-cols-2 button:not([disabled])') ||
          [...document.querySelectorAll('button')].find((b) =>
            b.textContent?.replace(/\\s+/g, ' ').trim().toLowerCase().includes(needle)
          );
        if (!btn) return false;
        btn.click();
        return true;
      })()`);
      if (!clicked) throw new Error('Evidence card not found');
      await waitForJs('document.querySelector(\'[role="dialog"]\')');
      await sleep(350);
    };

    const clickCaseCard = async (needle) => {
      const clicked = await evaluate(`(async () => {
        const needle = ${JSON.stringify(needle)}.toLowerCase();
        const deadline = Date.now() + 10000;
        while (Date.now() < deadline) {
          const btn = [...document.querySelectorAll('button')].find((b) =>
            b.textContent?.replace(/\\s+/g, ' ').trim().toLowerCase().includes(needle)
          );
          if (btn) {
            btn.click();
            return true;
          }
          await new Promise((r) => setTimeout(r, 100));
        }
        return false;
      })()`);
      if (!clicked) throw new Error(`Case card not found: ${needle}`);
      await sleep(500);
    };

    const openCaseById = async (caseId, completedIds = []) => {
      await evaluate(`(() => {
        const raw = localStorage.getItem('claimDetectiveSave');
        if (!raw) return false;
        const save = JSON.parse(raw);
        if (save.stats && ${JSON.stringify(completedIds)}.length) {
          const done = new Set(save.stats.completedCaseIds || []);
          ${JSON.stringify(completedIds)}.forEach(id => done.add(id));
          save.stats.completedCaseIds = [...done];
        }
        save.session = {
          caseId: ${JSON.stringify(caseId)},
          selectedEvidenceIds: [],
          viewedEvidenceIds: [],
          revealedEvidenceIds: [],
          startedAtServerMs: Date.now(),
        };
        localStorage.setItem('claimDetectiveSave', JSON.stringify(save));
        return true;
      })()`);
      try {
        await evaluate('location.reload()', false);
      } catch {
        // navigation expected
      }
      await sleep(1500);
      await waitForJs('window.__cheat');
    };

    const dismissRatingIfPresent = async (neverText) => {
      const dismissed = await evaluate(`(() => {
        const text = ${JSON.stringify(neverText)};
        const el = [...document.querySelectorAll('[role="button"]')].find(
          (item) => item.textContent?.trim() === text
        );
        if (!el) return false;
        el.click();
        return true;
      })()`);
      if (dismissed) await sleep(400);
    };

    const initLocale = async (lang) => {
      await waitForJs('window.__cheat');
      await evaluate('localStorage.clear(); location.reload()', false).catch(() => undefined);
      await sleep(1500);
      await waitForJs('window.__cheat');
      await evaluate('window.__cheat({ balance: 5000000, xp: 1000000 })');
      await sleep(300);
      await evaluate(`(() => {
        const raw = localStorage.getItem('claimDetectiveSave');
        if (!raw) return;
        const save = JSON.parse(raw);
        save.stats = { ...save.stats, language: ${JSON.stringify(lang)} };
        localStorage.setItem('claimDetectiveSave', JSON.stringify(save));
      })()`);
      try {
        await evaluate('location.reload()', false);
      } catch {
        // navigation expected
      }
      await sleep(1500);
      await waitForJs('window.__cheat');
      await waitForJs(`document.body.innerText.includes(${JSON.stringify(LOCALES[lang]?.selectCasePrompt ?? '')})`).catch(() => undefined);
    };

    for (const [lang, strings] of Object.entries(LOCALES)) {
      console.log(`\n=== Locale: ${lang} ===`);

      const desktopDir = path.join(outRoot, lang, 'desktop');
      const mobileDir = path.join(outRoot, lang, 'mobile');
      await mkdir(desktopDir, { recursive: true });
      await mkdir(mobileDir, { recursive: true });

      for (const [index, caseData] of selectedCases.entries()) {
        const title = caseData.title[lang] ?? caseData.title.ru;

        console.log(`  [${index + 1}/${selectedCases.length}] ${caseData.id}`);

        await initLocale(lang);
        const prevIds = selectedCases.slice(0, index).map(c => c.id);
        await openCaseById(caseData.id, prevIds);
        await waitForJs(`document.body.innerText.includes(${JSON.stringify(strings.selectCasePrompt)})`).catch(() => undefined);
        await clickCaseCard(title);

        // Desktop flow: overview -> modal -> stamped modal -> result
        await setViewport(1600, 900, false);
        await waitForJs(`document.body.innerText.includes(${JSON.stringify(title)})`);
        await shot(desktopDir, `${caseData.id}-01-overview`);
        await clickFirstEvidence(strings.openDossier);
        await shot(desktopDir, `${caseData.id}-02-modal`);
        await clickButton(strings.markContradiction);
        await shot(desktopDir, `${caseData.id}-03-stamped-modal`);
        await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);
        await sleep(300);
        await clickButton(strings.reject);
        await waitForJs('document.querySelector(\'[role="dialog"]\')');
        await dismissRatingIfPresent(strings.ratingNever);
        await shot(desktopDir, `${caseData.id}-04-result`);

        // Reset to the same case for the mobile flow
        await initLocale(lang);
        await openCaseById(caseData.id, prevIds);
        await waitForJs(`document.body.innerText.includes(${JSON.stringify(strings.selectCasePrompt)})`).catch(() => undefined);
        await clickCaseCard(title);
        await waitForJs(`document.body.innerText.includes(${JSON.stringify(title)})`);

        // Mobile flow: statement -> evidence tab -> modal -> result
        await setViewport(450, 800, true);
        await shot(mobileDir, `${caseData.id}-01-statement`);
        await clickButton(strings.evidenceTab);
        await shot(mobileDir, `${caseData.id}-02-evidence-tab`);
        await clickFirstEvidence(strings.openDossier);
        await shot(mobileDir, `${caseData.id}-03-modal`);
        await clickButton(strings.markContradiction);
        await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);
        await sleep(300);
        await clickButton(strings.reject);
        await waitForJs('document.querySelector(\'[role="dialog"]\')');
        await dismissRatingIfPresent(strings.ratingNever);
        await shot(mobileDir, `${caseData.id}-04-result`);
      }

      console.log(`  saved 20 desktop + 20 mobile screenshots for ${lang}`);
    }

    console.log('\nDone.');
  } finally {
    cdp?.close();
    chrome?.kill();
    vite.kill();
    await sleep(300);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
