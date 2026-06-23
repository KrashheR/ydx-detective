const { chromium } = require('playwright');
const { writeFileSync, appendFileSync } = require('fs');
const { join } = require('path');

const SCRATCHPAD = 'C:/Users/Nikitos/AppData/Local/Temp/claude/C--Users-Nikitos-Desktop-ydx-detective-ydx-detective/c069739b-1b7c-4ec9-9cec-c25340b195ef/scratchpad';

const log = (s) => { console.log(s); appendFileSync(join(SCRATCHPAD,'session3.txt'), s+'\n'); };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE ERROR] ${err.message}`));

  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // FULL page screenshot
  await page.screenshot({ path: join(SCRATCHPAD, 'ss01-fullpage.png'), fullPage: true });

  // Find the Заявление and Улики tabs by text content + click them
  log('\n=== Find tabs ===');
  const tabInfo = await page.$$eval('button', els => 
    els.filter(el => el.innerText.trim().startsWith('Заявление') || el.innerText.trim().startsWith('Улики'))
      .map(el => {
        const r = el.getBoundingClientRect();
        return { text: el.innerText.trim().slice(0,40), x: r.x, y: r.y, w: r.width, h: r.height, visible: r.width > 0 && r.height > 0 };
      })
  );
  log('Tabs: ' + JSON.stringify(tabInfo));

  // Click Улики tab by coordinates
  const ulikTab = tabInfo.find(t => t.text.startsWith('Улики'));
  if (ulikTab && ulikTab.visible) {
    await page.mouse.click(ulikTab.x + ulikTab.w/2, ulikTab.y + ulikTab.h/2);
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(SCRATCHPAD, 'ss-after-ulik-tab.png') });
    log('Clicked Улики tab');
  }

  // Click Заявление tab
  const zavTab = tabInfo.find(t => t.text.startsWith('Заявление'));
  if (zavTab && zavTab.visible) {
    await page.mouse.click(zavTab.x + zavTab.w/2, zavTab.y + zavTab.h/2);
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(SCRATCHPAD, 'ss-after-zav-tab.png') });
    log('Clicked Заявление tab');
  }

  // Open ФОТО evidence card
  log('\n=== Open ФОТО card ===');
  const photoInfo = await page.$$eval('button', els =>
    els.filter(el => el.innerText.includes('Открыть досье') && el.innerText.includes('ФОТО'))
      .map(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, vis: r.height > 0 }; })
  );
  log('Photo card buttons: ' + JSON.stringify(photoInfo));
  
  if (photoInfo[0] && photoInfo[0].vis) {
    await page.mouse.click(photoInfo[0].x + photoInfo[0].w/2, photoInfo[0].y + photoInfo[0].h/2);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(SCRATCHPAD, 'ss-photo-card-open.png'), fullPage: true });
    const bodyText = await page.evaluate(() => document.body.innerText);
    writeFileSync(join(SCRATCHPAD, 'text-photo-card.txt'), bodyText);
    log('Photo card open text:\n' + bodyText.slice(0,2000));

    // Look for stamp/contradiction button
    const stampInfo = await page.$$eval('button', els =>
      els.map(el => ({ text: el.innerText.trim().slice(0,80), disabled: el.disabled, ariaDisabled: el.getAttribute('aria-disabled') }))
        .filter(b => b.text.length > 0)
    );
    log('\nAll buttons in modal:\n' + JSON.stringify(stampInfo, null, 2));

    // Close the modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    log('Closed modal with Escape');
  }

  // ---- Test verdict buttons ----
  log('\n=== Verdict buttons ===');
  const verdictInfo = await page.$$eval('button', els =>
    els.filter(el => el.innerText.includes('ОТКЛОНИТЬ') || el.innerText.includes('ОДОБРИТЬ'))
      .map(el => {
        const r = el.getBoundingClientRect();
        return { text: el.innerText.trim().slice(0,60), disabled: el.disabled, ariaDisabled: el.getAttribute('aria-disabled'), x: r.x, y: r.y, vis: r.height > 0 };
      })
  );
  log('Verdict buttons: ' + JSON.stringify(verdictInfo, null, 2));

  if (verdictInfo[0] && verdictInfo[0].vis) {
    log('\n=== Clicking ОТКЛОНИТЬ ===');
    await page.mouse.click(verdictInfo[0].x + 50, verdictInfo[0].y + verdictInfo[0].h/2 || 10);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(SCRATCHPAD, 'ss-after-reject.png'), fullPage: true });
    const txt = await page.evaluate(() => document.body.innerText);
    writeFileSync(join(SCRATCHPAD, 'text-after-reject.txt'), txt);
    log('After reject:\n' + txt.slice(0,2000));
  }

  writeFileSync(join(SCRATCHPAD, 'console-logs-3.txt'), consoleLogs.join('\n'));
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
