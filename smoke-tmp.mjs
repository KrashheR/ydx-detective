import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("console", (m) => console.log("[console]", m.type(), m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto("http://localhost:5173/");
await page.waitForTimeout(2500);

// Open the first available standard case from the desk.
const caseCard = page.locator("button, a").filter({ hasText: /дело|Дело/i }).first();
await page.screenshot({ path: "C:/Users/Nikitos/AppData/Local/Temp/claude/C--Users-Nikitos-Desktop-ydx-detective-ydx-detective/41232aad-defe-4c93-8e3d-336040de7e1b/scratchpad/01-desk.png" });

// Click first case tile in the left sidebar/grid.
const tiles = page.locator('[class*="cursor-pointer"], button').filter({ hasText: /Дело №/i });
const count = await tiles.count();
console.log("tiles found:", count);
if (count > 0) {
  await tiles.first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "C:/Users/Nikitos/AppData/Local/Temp/claude/C--Users-Nikitos-Desktop-ydx-detective-ydx-detective/41232aad-defe-4c93-8e3d-336040de7e1b/scratchpad/02-case.png" });

  const noteBtn = page.getByText("Заметка инспектора");
  if (await noteBtn.count()) {
    await noteBtn.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: "C:/Users/Nikitos/AppData/Local/Temp/claude/C--Users-Nikitos-Desktop-ydx-detective-ydx-detective/41232aad-defe-4c93-8e3d-336040de7e1b/scratchpad/03-targeting.png" });
  } else {
    console.log("note hint button not found");
  }
}

await browser.close();
