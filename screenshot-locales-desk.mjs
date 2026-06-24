/**
 * Capture the desk/case-selection screen for every locale.
 *
 * Output:
 *   locale-screenshots-desk/<lang>/desktop/desk.webp
 *   locale-screenshots-desk/<lang>/mobile/desk.webp
 */

import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const BASE_URL = 'http://127.0.0.1:4173';
const DEBUG_PORT = 9334;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profileDir = path.join(ROOT, '.chrome-screens-profile-desk-locales');
const outRoot = path.join(ROOT, 'locale-screenshots-desk');

const LOCALES = {
  ru: {},
  en: {},
  kk: {},
  tr: {},
  ar: {},
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
      const pending = this.pending.get(msg.id);
      if (!pending) return;
      this.pending.delete(msg.id);
      if (msg.error) pending.reject(new Error(msg.error.message));
      else pending.resolve(msg.result);
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

async function main() {
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
      page = targets.find((target) => target.type === 'page' && target.url.startsWith(BASE_URL));
      if (!page) await sleep(200);
    }
    if (!page) throw new Error('No page target');

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
      if (result.exceptionDetails) {
        const desc = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text;
        throw new Error(desc);
      }
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
      const webp = await sharp(Buffer.from(data, 'base64')).webp({ lossless: true, effort: 6 }).toBuffer();
      await writeFile(path.join(dir, `${name}.webp`), webp);
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
      await waitForJs('document.querySelectorAll("button").length > 5');
    };

    for (const lang of Object.keys(LOCALES)) {
      console.log(`\n=== Locale: ${lang} ===`);

      const desktopDir = path.join(outRoot, lang, 'desktop');
      const mobileDir = path.join(outRoot, lang, 'mobile');
      await mkdir(desktopDir, { recursive: true });
      await mkdir(mobileDir, { recursive: true });

      await initLocale(lang);
      await setViewport(1600, 900, false);
      await shot(desktopDir, 'desk');
      console.log('  desktop desk');

      await setViewport(450, 800, true);
      await sleep(500);
      await shot(mobileDir, 'desk');
      console.log('  mobile desk');
    }

    console.log('\nDone.');
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
