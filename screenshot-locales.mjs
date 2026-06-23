import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'locale-screenshots');

const locales = ['en', 'tr', 'kk', 'ar'];

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

for (const lang of locales) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // Load app and inject the language into localStorage before React mounts
  await page.goto('http://127.0.0.1:5202');
  await page.evaluate((l) => {
    try {
      // Try to find and set the persisted state
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        try {
          const val = JSON.parse(localStorage.getItem(k));
          if (val && typeof val === 'object' && 'lang' in val) {
            val.lang = l;
            localStorage.setItem(k, JSON.stringify(val));
            return;
          }
        } catch {}
      }
      // Fallback: write a minimal state with the lang
      localStorage.setItem('ydx-detective-state', JSON.stringify({ lang: l }));
    } catch {}
  }, lang);

  // Reload so the app picks up the language
  await page.goto('http://127.0.0.1:5202', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Try to open the first available case if on the desk screen
  const openCaseBtn = page.locator('[data-testid="case-open-btn"], button').filter({ hasText: /РѕС‚РєСЂС‹С‚СЊ|open|aГ§|Р°С€Сѓ/i }).first();
  const hasCaseOpen = await openCaseBtn.count();
  if (hasCaseOpen > 0) {
    await openCaseBtn.click();
    await page.waitForTimeout(800);
  } else {
    // Click any case card
    const caseCard = page.locator('.cursor-pointer, [role="button"]').first();
    if (await caseCard.count()) {
      await caseCard.click();
      await page.waitForTimeout(800);
    }
  }

  // Scroll to show the client meta section
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const outPath = path.join(outDir, `locale-${lang}.png`);
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`Saved: ${outPath}`);
  await ctx.close();
}

await browser.close();
console.log('Done.');

