import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BASE_URL = 'http://127.0.0.1:4173';
const DEBUG_PORT = 9333;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const desktopDir = path.join(ROOT, 'screens', 'desktop');
const mobileDir = path.join(ROOT, 'screens', 'mobile');
const profileDir = path.join(ROOT, '.chrome-screens-profile');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
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
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 20_000);
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); },
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
  const dailyDir = path.join(standardDir, 'daily');
  const loadDir = async (dir) => {
    const names = (await readdir(dir)).filter((name) => name.endsWith('.json')).sort();
    return Promise.all(names.map(async (name) => JSON.parse(await readFile(path.join(dir, name), 'utf8'))));
  };
  const standard = await loadDir(standardDir);
  const config = await readFile(path.join(ROOT, 'src', 'config', 'gameConfig.ts'), 'utf8');
  const levels = new Map(
    [...config.matchAll(/'(case-\d+)':\s*(\d+)/g)].map((match) => [match[1], Number(match[2])]),
  );
  standard.sort((a, b) =>
    (levels.get(a.id) ?? 999) - (levels.get(b.id) ?? 999)
      || Number(a.id.match(/\d+/)?.[0]) - Number(b.id.match(/\d+/)?.[0]),
  );
  return { standard, daily: await loadDir(dailyDir) };
}

async function main() {
  const { standard, daily } = await loadCases();
  const onlyDaily = process.argv.includes('--only-daily');
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1];
  const sampleLimit = Number.parseInt(limitArg ?? process.env.SCREENSHOT_LIMIT ?? '', 10);
  const standardCases = onlyDaily ? [] : Number.isFinite(sampleLimit) ? standard.slice(0, sampleLimit) : standard;
  const dailyCases = Number.isFinite(sampleLimit) ? [] : daily;
  if (!onlyDaily) await rm(path.join(ROOT, 'screens'), { recursive: true, force: true });
  await mkdir(desktopDir, { recursive: true });
  await mkdir(mobileDir, { recursive: true });
  await rm(profileDir, { recursive: true, force: true });

  const vite = spawn(process.execPath, [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', '4173'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  vite.stdout.on('data', (chunk) => process.stdout.write(chunk));
  vite.stderr.on('data', (chunk) => process.stderr.write(chunk));

  let chrome;
  let cdp;
  try {
    await waitFor(BASE_URL);
    chrome = spawn(CHROME, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--disable-extensions',
      '--disable-component-extensions-with-background-pages',
      '--no-first-run',
      '--no-default-browser-check',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${profileDir}`,
      '--window-size=1600,900',
      BASE_URL,
    ], { stdio: 'ignore', windowsHide: true });

    await waitFor(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    let page;
    const targetDeadline = Date.now() + 15_000;
    while (!page && Date.now() < targetDeadline) {
      const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      page = targets.find((target) => target.type === 'page' && target.url.startsWith(BASE_URL));
      if (!page) await sleep(200);
    }
    if (!page) throw new Error('Chrome page target was not created');

    cdp = new Cdp(page.webSocketDebuggerUrl);
    await cdp.open();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');

    const evaluate = async (expression, awaitPromise = true) => {
      const result = await cdp.send('Runtime.evaluate', {
        expression,
        awaitPromise,
        returnByValue: true,
        userGesture: true,
      });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
      return result.result.value;
    };

    const waitForJs = async (expression, timeoutMs = 15_000) => {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        if (await evaluate(`Boolean(${expression})`)) return;
        await sleep(100);
      }
      throw new Error(`Timed out waiting for: ${expression}`);
    };

    const setViewport = async (width, height, mobile = false) => {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile,
        screenWidth: width,
        screenHeight: height,
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
      await writeFile(path.join(dir, `${name}.png`), Buffer.from(data, 'base64'));
    };

    const clickButton = async (needle) => {
      const clicked = await evaluate(`(() => {
        const needle = ${JSON.stringify(needle)}.toLocaleLowerCase('ru');
        const button = [...document.querySelectorAll('button')].find((item) =>
          item.textContent?.replace(/\\s+/g, ' ').trim().toLocaleLowerCase('ru').includes(needle)
        );
        if (!button) return false;
        button.click();
        return true;
      })()`);
      if (!clicked) throw new Error(`Button not found: ${needle}`);
      await sleep(450);
    };

    const clickEvidence = async (caseData, evidence) => {
      const title = evidence.title.ru;
      const clicked = await evaluate(`(() => {
        const title = ${JSON.stringify(title)};
        const button = [...document.querySelectorAll('button')].find((item) =>
          item.textContent?.includes(title)
        );
        if (!button) return false;
        button.click();
        return true;
      })()`);
      if (!clicked) throw new Error(`Evidence not found in ${caseData.id}: ${title}`);
      await waitForJs('document.querySelector(\'[role="dialog"]\')');
      await sleep(350);
    };

    const dismissRatingIfPresent = async () => {
      const dismissed = await evaluate(`(() => {
        const control = [...document.querySelectorAll('[role="button"]')].find((item) =>
          item.textContent?.trim() === 'Больше не предлагать'
        );
        if (!control) return false;
        control.click();
        return true;
      })()`);
      if (dismissed) await sleep(400);
    };

    const captureCase = async (caseData, prefix, isFirstStandard = false) => {
      console.log(`Capturing ${caseData.id}...`);
      const evidence = caseData.truth === 'fraud'
        ? caseData.evidences.find((item) => item.isContradiction) ?? caseData.evidences[0]
        : caseData.evidences[0];
      if (!evidence) throw new Error(`${caseData.id} has no evidence`);

      await waitForJs(`document.body.innerText.includes(${JSON.stringify(caseData.title.ru)})`);

      await setViewport(1600, 900, false);
      await shot(desktopDir, `${prefix}-01-case`);
      console.log(`  desktop case`);

      await setViewport(450, 800, true);
      await shot(mobileDir, `${prefix}-01-statement`);
      console.log(`  mobile statement`);
      await clickButton('УЛИКИ');
      await shot(mobileDir, `${prefix}-02-evidence`);
      console.log(`  mobile evidence`);

      await clickEvidence(caseData, evidence);
      await shot(mobileDir, `${prefix}-03-evidence-modal`);
      await setViewport(1600, 900, false);
      await shot(desktopDir, `${prefix}-02-evidence-modal`);
      console.log(`  evidence modal`);

      if (caseData.truth === 'fraud') await clickButton('ОТМЕТИТЬ КАК ПРОТИВОРЕЧИЕ');
      await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);
      await sleep(300);

      await clickButton(caseData.truth === 'fraud' ? 'ОТКЛОНИТЬ ВЫПЛАТУ' : 'ОДОБРИТЬ ВЫПЛАТУ');
      await waitForJs('document.querySelector(\'[role="dialog"]\')');
      await dismissRatingIfPresent();
      await setViewport(1600, 900, false);
      await shot(desktopDir, `${prefix}-03-result`);
      await setViewport(450, 800, true);
      await shot(mobileDir, `${prefix}-04-result`);
      console.log(`  result`);

      if (isFirstStandard) {
        // Keep one early result for the UI-state set; progression continues below.
      }
    };

    await waitForJs('window.__cheat');
    await evaluate('localStorage.clear(); location.reload()');
    await sleep(1_000);
    await waitForJs('window.__cheat');
    await evaluate('window.__cheat({ balance: 5000000, xp: 1000000 })');

    for (let index = 0; index < standardCases.length; index += 1) {
      const caseData = standardCases[index];
      const prefix = caseData.id;
      await captureCase(caseData, prefix, index === 0);
      if (index < standardCases.length - 1) await clickButton('Следующее дело');
    }

    if (standardCases.length > 0) {
      // The catalog and archive are materially different screens; capture both once.
      await clickButton('К столу');
      await waitForJs('document.body.innerText.includes("ВЫБЕРИТЕ ДЕЛО")');
      await setViewport(1600, 900, false);
      await shot(desktopDir, 'screen-01-case-catalog');
      await clickButton('Достижения');
      await shot(desktopDir, 'screen-02-achievements');
      await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);
      await setViewport(450, 800, true);
      await shot(mobileDir, 'screen-01-case-catalog');
      await clickButton('Достижения');
      await shot(mobileDir, 'screen-02-achievements');
      await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);
    }

    // Rotate server-day modulo the daily pool so every daily JSON is represented.
    for (let index = 0; index < dailyCases.length; index += 1) {
      const caseData = dailyCases[index];
      const fakeNow = index * 86_400_000 + 12 * 60 * 60 * 1000;
      await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `Date.now = () => ${fakeNow};`,
      });
      await evaluate('localStorage.clear(); location.reload()');
      await sleep(900);
      await waitForJs('window.__cheat');
      await evaluate('window.__cheat({ balance: 5000000, xp: 1000000 })');
      await waitForJs(`document.querySelectorAll('button').length > 5`);
      await clickButton('×5');
      await captureCase(caseData, caseData.id);
    }

    console.log(`Captured ${standardCases.length + dailyCases.length} cases in screens/desktop and screens/mobile.`);
  } finally {
    cdp?.close();
    chrome?.kill();
    vite.kill();
    await sleep(300);
    await rm(profileDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
