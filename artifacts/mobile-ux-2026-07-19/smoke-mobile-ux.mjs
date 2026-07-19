import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const baseUrl = "http://127.0.0.1:4173";
const root = new URL("./", import.meta.url).pathname.slice(1);
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
const page = await context.newPage();
const report = {};

try {
  await page.goto(baseUrl);
  await page.waitForFunction(() => document.querySelectorAll("button").length > 5);
  await page.locator("button").filter({ hasText: "Особые архивы" }).first().evaluate((el) => el.click());
  await page.waitForFunction(() => document.body.innerText.includes("СОСТАВ ДЕЛ"));
  await writeFile(`${root}archive-buttons.json`, JSON.stringify(await page.locator("button").allTextContents(), null, 2));
  const archiveOpenClicked = await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((item) =>
      item.textContent?.includes("Сгоревший груз на лунной ферме") &&
      item.textContent?.trim().endsWith("Открыть дело"),
    );
    button?.click();
    return Boolean(button);
  });
  if (!archiveOpenClicked) throw new Error("Archive open button was not found");
  await page.waitForFunction(() => document.body.innerText.includes("Мирон Вейл"));
  await page.getByRole("button", { name: "Улики", exact: true }).click();
  await page.getByRole("button", { name: /Фото ангара/ }).click();
  await page.waitForSelector('[role="dialog"]');

  const next = page.getByRole("button", { name: "Следующая улика" });
  for (let index = 0; index < 3; index += 1) {
    await next.click();
    await page.waitForTimeout(150);
  }
  const beforeBlocked = await page.locator('[role="dialog"] [id^="stamp-modal-title-"]').innerText();
  await next.click();
  await page.waitForTimeout(250);
  const afterBlocked = await page.locator('[role="dialog"] [id^="stamp-modal-title-"]').innerText();

  report.budget = await page.evaluate(({ beforeBlocked, afterBlocked }) => ({
    beforeBlocked,
    afterBlocked,
    stayedOnCurrentEvidence: beforeBlocked === afterBlocked,
    budgetToastVisible: document.body.innerText.includes("Лимит проверок исчерпан"),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    direction: document.documentElement.dir,
  }), { beforeBlocked, afterBlocked });
  await page.screenshot({ path: `${root}07-budget-gate-ru.png` });
  await writeFile(`${root}smoke-report.json`, JSON.stringify(report, null, 2));

  const rtlContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await rtlContext.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  const rtlPage = await rtlContext.newPage();
  await rtlPage.goto(baseUrl);
  await rtlPage.waitForFunction(() => document.querySelectorAll("button").length > 5);
  await rtlPage.evaluate(() => {
    const language = [...document.querySelectorAll("button")].find(
      (button) => button.offsetParent && button.textContent?.includes("Русский"),
    );
    language?.click();
  });
  await rtlPage.getByRole("button", { name: /العربية/ }).click();
  await rtlPage.waitForFunction(() => document.documentElement.dir === "rtl");
  const nextCaseButton = rtlPage.locator("button").filter({ hasText: "1 200" }).first();
  await nextCaseButton.click();
  await rtlPage.waitForFunction(() => document.body.innerText.includes("إيغور"));

  await rtlPage.evaluate(() => {
    const panel = document.querySelector("div.overflow-hidden.md\\:hidden");
    if (!panel) throw new Error("Swipe panel was not found");
    panel.dispatchEvent(new TouchEvent("touchstart", {
      bubbles: true,
      touches: [new Touch({ identifier: 1, target: panel, clientX: 100, clientY: 300 })],
    }));
    panel.dispatchEvent(new TouchEvent("touchend", {
      bubbles: true,
      changedTouches: [new Touch({ identifier: 1, target: panel, clientX: 220, clientY: 300 })],
    }));
  });
  await rtlPage.waitForTimeout(350);
  report.rtl = await rtlPage.evaluate(() => ({
    direction: document.documentElement.dir,
    evidenceTabActive: [...document.querySelectorAll("button")].some(
      (button) => button.textContent?.trim() === "الأدلة" && button.className.includes("border-accent"),
    ),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    verdictButtons: [...document.querySelectorAll("button")].filter((button) =>
      /رفض الدفع|الموافقة على الدفع/.test(button.textContent ?? ""),
    ).length,
  }));
  await rtlPage.screenshot({ path: `${root}08-investigation-ar-rtl.png` });
  await rtlPage.getByRole("button", { name: /صورة مكان الحادث/ }).click();
  await rtlPage.waitForSelector('[role="dialog"]');
  const rtlDialog = rtlPage.getByRole("dialog");
  const rtlTitleBefore = await rtlPage.locator('[role="dialog"] [id^="stamp-modal-title-"]').innerText();
  const rtlArrowGlyphs = await rtlDialog.locator('button[aria-label]').evaluateAll((buttons) =>
    buttons.filter((button) => button.textContent?.trim()).map((button) => button.textContent?.trim()),
  );
  await rtlDialog.evaluate((panel) => {
    panel.dispatchEvent(new TouchEvent("touchstart", {
      bubbles: true,
      touches: [new Touch({ identifier: 2, target: panel, clientX: 100, clientY: 300 })],
    }));
    panel.dispatchEvent(new TouchEvent("touchend", {
      bubbles: true,
      changedTouches: [new Touch({ identifier: 2, target: panel, clientX: 220, clientY: 300 })],
    }));
  });
  await rtlPage.waitForTimeout(350);
  const rtlTitleAfter = await rtlPage.locator('[role="dialog"] [id^="stamp-modal-title-"]').innerText();
  Object.assign(report.rtl, {
    rtlArrowGlyphs,
    modalSwipeAdvanced: rtlTitleBefore !== rtlTitleAfter,
    modalTitleBefore: rtlTitleBefore,
    modalTitleAfter: rtlTitleAfter,
  });
  await rtlPage.screenshot({ path: `${root}09-evidence-sheet-ar-rtl.png` });

  const dailyContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await dailyContext.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  const dailyPage = await dailyContext.newPage();
  await dailyPage.goto(baseUrl);
  await dailyPage.waitForFunction(() => document.querySelectorAll("button").length > 5);
  await dailyPage.evaluate(() => {
    const daily = [...document.querySelectorAll("button")].find(
      (button) => button.offsetParent && button.textContent?.includes("Награда ×5"),
    );
    daily?.click();
  });
  await dailyPage.waitForFunction(() => document.body.innerText.includes("К столу"));
  const dailyVerdicts = dailyPage.getByRole("button").filter({ hasText: /ВЫПЛАТУ/ });
  report.daily = {
    verdictButtons: await dailyVerdicts.count(),
    horizontalOverflow: await dailyPage.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  };
  await dailyPage.screenshot({ path: `${root}10-daily-investigation-ru.png` });
  await dailyPage.getByRole("button", { name: /ОДОБРИТЬ ВЫПЛАТУ/ }).click();
  await dailyPage.waitForFunction(() => document.body.innerText.includes("ВАШ ГОНОРАР"));
  report.daily.resultReached = true;
  await dailyPage.screenshot({ path: `${root}11-daily-result-ru.png` });
  await writeFile(`${root}smoke-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
