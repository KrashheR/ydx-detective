import { chromium } from 'playwright';
const OUT = 'C:/Users/Nikitos/AppData/Local/Temp/claude/C--Users-Nikitos-Desktop-ydx-detective-ydx-detective/13f1cd4a-ebbf-46c9-9b38-03bc4f7ecc14/scratchpad';
const browser = await chromium.launch();

async function run(w, h, lang, bureauRe, packRe, lockedRe, tag) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(13000);
  if (lang !== 'ru') {
    await page.evaluate((l) => window.useGameStore?.getState?.().setLanguage?.(l), lang);
    await page.waitForTimeout(600);
  }
  await page.getByRole('button', { name: bureauRe }).first().click();
  await page.waitForTimeout(800);
  await page.locator('[role=button]').filter({ hasText: packRe }).last().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${tag}-page.png`, fullPage: true });
  const locked = page.getByRole('button', { name: lockedRe });
  console.log(tag, 'locked', await locked.count());
  if (await locked.count()) {
    await locked.first().click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${tag}-modal.png` });
  }
  await page.close();
}

await run(768, 900, 'ru', /Бюро особых дел/, /Прибой/, /Королева/, 'md768');
await run(360, 640, 'ru', /Бюро особых дел/, /Прибой/, /Королева/, 'sm360');
await browser.close();
