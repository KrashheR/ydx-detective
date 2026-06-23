import { spawn } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BASE_URL = 'http://127.0.0.1:4173';
const DEBUG_PORT = 9333;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const desktopDir = path.join(ROOT, 'screens1', 'desktop');
const mobileDir = path.join(ROOT, 'screens1', 'mobile');
const profileDir = path.join(ROOT, '.chrome-screens-profile2');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (e) { lastError = e; }
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
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timed out: ${method}`)); }, 20_000);
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timer); resolve(v); },
        reject: (e) => { clearTimeout(timer); reject(e); },
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.socket.close(); }
}

async function main() {
  await mkdir(desktopDir, { recursive: true });
  await mkdir(mobileDir, { recursive: true });
  await rm(profileDir, { recursive: true, force: true });

  const caseData = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'cases', 'case-001.json'), 'utf8'));
  const evidence = caseData.evidences.find((e) => e.isContradiction) ?? caseData.evidences[0];

  const vite = spawn(process.execPath, [
    path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'),
    '--host', '127.0.0.1', '--port', '4173',
  ], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  vite.stdout.on('data', (c) => process.stdout.write(c));
  vite.stderr.on('data', (c) => process.stderr.write(c));

  let chrome, cdp;
  try {
    await waitFor(BASE_URL);
    chrome = spawn(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars',
      '--disable-extensions', '--no-first-run', '--no-default-browser-check',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${profileDir}`,
      '--window-size=1600,900', BASE_URL,
    ], { stdio: 'ignore', windowsHide: true });

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

    const evaluate = async (expr, awaitPromise = true) => {
      const result = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise, returnByValue: true, userGesture: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
      return result.result.value;
    };

    const waitForJs = async (expr, ms = 15_000) => {
      const d = Date.now() + ms;
      while (Date.now() < d) {
        if (await evaluate(`Boolean(${expr})`)) return;
        await sleep(100);
      }
      throw new Error(`Timed out: ${expr}`);
    };

    const setViewport = async (w, h, mobile = false) => {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile, screenWidth: w, screenHeight: h });
      await sleep(350);
    };

    const shot = async (dir, name) => {
      await evaluate('window.scrollTo(0, 0)');
      await sleep(300);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
      await writeFile(path.join(dir, `${name}.png`), Buffer.from(data, 'base64'));
      console.log(`  saved ${name}.png`);
    };

    const clickButton = async (needle) => {
      const clicked = await evaluate(`(() => {
        const needle = ${JSON.stringify(needle)}.toLocaleLowerCase('ru');
        const btn = [...document.querySelectorAll('button')].find((b) =>
          b.textContent?.replace(/\\s+/g, ' ').trim().toLocaleLowerCase('ru').includes(needle)
        );
        if (!btn) return false;
        btn.click();
        return true;
      })()`);
      if (!clicked) throw new Error(`Button not found: ${needle}`);
      await sleep(450);
    };

    // Init
    await waitForJs('window.__cheat');
    await evaluate('localStorage.clear(); location.reload()');
    await sleep(1_000);
    await waitForJs('window.__cheat');
    await evaluate('window.__cheat({ balance: 5000000, xp: 1000000 })');

    await waitForJs(`document.body.innerText.includes(${JSON.stringify(caseData.title.ru)})`);

    // Open evidence modal (mobile first so we can reuse the same navigation)
    const openEvidence = async () => {
      const title = evidence.title.ru;
      const clicked = await evaluate(`(() => {
        const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes(${JSON.stringify(title)}));
        if (!btn) return false;
        btn.click();
        return true;
      })()`);
      if (!clicked) throw new Error(`Evidence button not found: ${title}`);
      await waitForJs('document.querySelector(\'[role="dialog"]\')');
      await sleep(400);
    };

    // --- MOBILE ---
    await setViewport(450, 800, true);
    // Switch to evidence tab on mobile
    await clickButton('УЛИКИ');
    await openEvidence();
    await clickButton('ОТМЕТИТЬ КАК ПРОТИВОРЕЧИЕ');
    await shot(mobileDir, 'contradiction');

    // Close modal and reload clean for desktop
    await evaluate(`document.querySelector('button[aria-label="Close"]')?.click()`);
    await sleep(300);

    // --- DESKTOP ---
    await setViewport(1600, 900, false);
    await evaluate('localStorage.clear(); location.reload()');
    await sleep(1_000);
    await waitForJs('window.__cheat');
    await evaluate('window.__cheat({ balance: 5000000, xp: 1000000 })');
    await waitForJs(`document.body.innerText.includes(${JSON.stringify(caseData.title.ru)})`);
    await openEvidence();
    await clickButton('ОТМЕТИТЬ КАК ПРОТИВОРЕЧИЕ');
    await shot(desktopDir, 'contradiction');

    console.log('Done — screens1/desktop/contradiction.png + screens1/mobile/contradiction.png');
  } finally {
    cdp?.close();
    chrome?.kill();
    vite.kill();
    await sleep(300);
    await rm(profileDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
