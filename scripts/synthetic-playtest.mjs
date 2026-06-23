import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const ROOT = resolve(import.meta.dirname, "..");
const PERSONAS_PATH = resolve(ROOT, "playtest/personas.json");
const SCENARIO_PATH = resolve(ROOT, "playtest/scenario.json");
const args = parseArgs(process.argv.slice(2));

const actionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    action: { type: "string", enum: ["click", "scroll", "wait", "finish"] },
    x: { type: ["number", "null"] },
    y: { type: ["number", "null"] },
    deltaY: { type: ["number", "null"] },
    thought: { type: "string" },
    impression: { type: "string" },
    liked: { type: "array", items: { type: "string" } },
    disliked: { type: "array", items: { type: "string" } },
    taskProgress: { type: "string" }
  },
  required: ["action", "x", "y", "deltaY", "thought", "impression", "liked", "disliked", "taskProgress"]
};

const findingSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    severity: { type: "string", enum: ["blocker", "high", "medium", "low"] },
    observation: { type: "string" },
    evidenceSteps: { type: "array", items: { type: "integer" } },
    impact: { type: "string" },
    recommendation: { type: "string" },
    confidence: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["title", "severity", "observation", "evidenceSteps", "impact", "recommendation", "confidence"]
};

const reportSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    personaId: { type: "string" },
    executiveSummary: { type: "string" },
    outcome: { type: "string", enum: ["completed", "partial", "blocked"] },
    completedCases: { type: "integer" },
    comprehension: { type: "integer", minimum: 1, maximum: 5 },
    usability: { type: "integer", minimum: 1, maximum: 5 },
    enjoyment: { type: "integer", minimum: 1, maximum: 5 },
    continuationIntent: { type: "integer", minimum: 1, maximum: 5 },
    liked: { type: "array", items: { type: "string" } },
    disliked: { type: "array", items: { type: "string" } },
    findings: { type: "array", items: findingSchema },
    unansweredQuestions: { type: "array", items: { type: "string" } },
    demographicCaveat: { type: "string" }
  },
  required: ["personaId", "executiveSummary", "outcome", "completedCases", "comprehension", "usability", "enjoyment", "continuationIntent", "liked", "disliked", "findings", "unansweredQuestions", "demographicCaveat"]
};

const aggregateSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    executiveSummary: { type: "string" },
    strongestSignals: { type: "array", items: findingSchema },
    segmentDifferences: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    priorities: { type: "array", items: { type: "string" } },
    validationPlan: { type: "array", items: { type: "string" } },
    limitations: { type: "array", items: { type: "string" } }
  },
  required: ["executiveSummary", "strongestSignals", "segmentDifferences", "strengths", "priorities", "validationPlan", "limitations"]
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});

async function main() {
  const personas = JSON.parse(await readFile(PERSONAS_PATH, "utf8"));
  const scenario = JSON.parse(await readFile(SCENARIO_PATH, "utf8"));
  validateConfig(personas, scenario);

  if (args.validate) {
    console.log(`Playtest config is valid: ${personas.length} personas, scenario ${scenario.id}.`);
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.PLAYTEST_MODEL;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required.");
  if (!model) throw new Error("PLAYTEST_MODEL is required so model choice and cost stay explicit.");

  const selected = args.agent ? personas.filter((persona) => persona.id === args.agent) : personas;
  if (!selected.length) throw new Error(`Unknown agent: ${args.agent}`);

  const runId = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const runDir = resolve(ROOT, "artifacts/playtests", runId);
  await mkdir(runDir, { recursive: true });
  await writeJson(resolve(runDir, "manifest.json"), {
    runId,
    createdAt: new Date().toISOString(),
    url: args.url,
    model,
    scenarioId: scenario.id,
    personaIds: selected.map(({ id }) => id)
  });

  const browser = await chromium.launch({ headless: !args.headed });
  let reports;
  try {
    reports = await runPool(selected, args.parallel, (persona) =>
      runPersona({ browser, persona, scenario, runDir, apiKey, model })
    );
  } finally {
    await browser.close();
  }

  const aggregate = await callStructured({
    apiKey,
    model,
    name: "aggregate_playtest_report",
    schema: aggregateSchema,
    instructions: "Ты ведущий UX-исследователь. Обобщай только подтвержденные наблюдения. Не считай синтетические сессии статистикой реальных пользователей. Отвечай по-русски.",
    content: `Сценарий:\n${JSON.stringify(scenario)}\n\nОтчеты:\n${JSON.stringify(reports)}`
  });
  await writeJson(resolve(runDir, "aggregate.json"), aggregate);
  await writeFile(resolve(runDir, "aggregate.md"), renderAggregate(aggregate), "utf8");
  console.log(`Playtest complete: ${runDir}`);
}

async function runPersona({ browser, persona, scenario, runDir, apiKey, model }) {
  const personaDir = resolve(runDir, persona.id);
  const screenshotDir = resolve(personaDir, "screenshots");
  const eventsPath = resolve(personaDir, "events.jsonl");
  await mkdir(screenshotDir, { recursive: true });

  const context = await browser.newContext({
    viewport: persona.device.viewport,
    locale: localeFor(persona.locale),
    isMobile: persona.device.kind === "mobile",
    hasTouch: persona.device.kind !== "desktop"
  });
  const page = await context.newPage();
  const events = [];
  const startedAt = Date.now();
  let unchanged = 0;
  let previousHash = "";

  try {
    await page.goto(args.url, { waitUntil: "networkidle", timeout: 30_000 });
    if (persona.device.zoom) {
      await page.evaluate((zoom) => { document.documentElement.style.zoom = String(zoom); }, persona.device.zoom);
    }

    for (let step = 1; step <= scenario.maxSteps; step += 1) {
      if (Date.now() - startedAt > scenario.maxMinutes * 60_000) break;
      const screenshotPath = resolve(screenshotDir, `${String(step).padStart(3, "0")}.png`);
      const bytes = await page.screenshot({ path: screenshotPath, fullPage: false });
      const hash = createHash("sha1").update(bytes).digest("hex");
      unchanged = hash === previousHash ? unchanged + 1 : 0;
      previousHash = hash;
      if (unchanged >= 3) break;

      const action = await callStructured({
        apiKey,
        model,
        name: "playtest_action",
        schema: actionSchema,
        instructions: agentInstructions(persona, scenario),
        content: [
          { type: "input_text", text: `Шаг ${step}. Последние действия:\n${JSON.stringify(events.slice(-8))}` },
          { type: "input_image", image_url: `data:image/png;base64,${bytes.toString("base64")}` }
        ]
      });

      const event = { step, atMs: Date.now() - startedAt, url: page.url(), ...action };
      events.push(event);
      await appendFile(eventsPath, `${JSON.stringify(event)}\n`, "utf8");
      if (action.action === "finish") break;
      await executeAction(page, action, persona.device.viewport);
      await page.waitForTimeout(600);
    }
  } finally {
    await context.close();
  }

  const report = await callStructured({
    apiKey,
    model,
    name: "persona_playtest_report",
    schema: reportSchema,
    instructions: "Ты UX-исследователь. Составь лаконичный отчет на русском. Каждая проблема должна ссылаться на реальные номера шагов. Не объясняй поведение возрастом без наблюдаемого подтверждения; такие выводы явно называй гипотезами.",
    content: `Персона:\n${JSON.stringify(persona)}\n\nСценарий:\n${JSON.stringify(scenario)}\n\nЖурнал:\n${JSON.stringify(events)}`
  });
  report.personaId = persona.id;
  await writeJson(resolve(personaDir, "report.json"), report);
  await writeFile(resolve(personaDir, "report.md"), renderPersona(persona, report), "utf8");
  return report;
}

async function executeAction(page, action, viewport) {
  if (action.action === "click") {
    if (!Number.isFinite(action.x) || !Number.isFinite(action.y)) throw new Error("Click requires finite x/y.");
    const x = Math.max(0, Math.min(viewport.width - 1, action.x));
    const y = Math.max(0, Math.min(viewport.height - 1, action.y));
    await page.mouse.click(x, y);
  } else if (action.action === "scroll") {
    await page.mouse.wheel(0, Number.isFinite(action.deltaY) ? action.deltaY : 500);
  } else if (action.action === "wait") {
    await page.waitForTimeout(1000);
  }
}

async function callStructured({ apiKey, model, name, schema, instructions, content }) {
  const inputContent = typeof content === "string" ? [{ type: "input_text", text: content }] : content;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions,
      input: [{ role: "user", content: inputContent }],
      text: { format: { type: "json_schema", name, strict: true, schema } }
    })
  });
  if (!response.ok) throw new Error(`OpenAI API ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  const outputText = payload.output_text ?? payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
  if (!outputText) throw new Error("OpenAI response did not contain output_text.");
  return JSON.parse(outputText);
}

function agentInstructions(persona, scenario) {
  return `Ты синтетический участник UX-теста. Последовательно играй роль персоны, но не карикатурно.\nПерсона: ${JSON.stringify(persona)}\nСценарий: ${JSON.stringify(scenario)}\nУправляй только видимым UI. Не используй знания о коде или правильных ответах. Для click верни координаты в viewport, для scroll — deltaY. На каждом шаге кратко фиксируй непосредственное впечатление, понравившееся и раздражающее. finish выбирай при выполнении цели или устойчивой блокировке. Отвечай по-русски.`;
}

function validateConfig(personas, scenario) {
  if (!Array.isArray(personas) || personas.length !== 10) throw new Error("personas.json must contain exactly 10 personas.");
  const ids = new Set();
  for (const persona of personas) {
    if (!persona.id || ids.has(persona.id)) throw new Error(`Invalid or duplicate persona id: ${persona.id}`);
    ids.add(persona.id);
    if (!Number.isInteger(persona.age) || persona.age < 16 || persona.age > 90) throw new Error(`Invalid age for ${persona.id}`);
    if (!persona.device?.viewport?.width || !persona.device?.viewport?.height) throw new Error(`Missing viewport for ${persona.id}`);
    for (const key of ["motivations", "behavior", "researchFocus", "accessibility"]) {
      if (!Array.isArray(persona[key])) throw new Error(`${persona.id}.${key} must be an array.`);
    }
  }
  if (Math.min(...personas.map(({ age }) => age)) > 20 || Math.max(...personas.map(({ age }) => age)) < 70) {
    throw new Error("Personas must cover edge age groups from <=20 through >=70.");
  }
  if (!scenario.id || !scenario.goal || !Number.isInteger(scenario.maxSteps) || !Array.isArray(scenario.tasks)) {
    throw new Error("scenario.json is incomplete.");
  }
}

function parseArgs(values) {
  const result = { url: "http://127.0.0.1:5173", parallel: 1, agent: "", headed: false, validate: false };
  for (const value of values) {
    if (value === "--validate") result.validate = true;
    else if (value === "--headed") result.headed = true;
    else if (value.startsWith("--url=")) result.url = value.slice(6);
    else if (value.startsWith("--agent=")) result.agent = value.slice(8);
    else if (value.startsWith("--parallel=")) result.parallel = Math.max(1, Number.parseInt(value.slice(11), 10) || 1);
    else throw new Error(`Unknown argument: ${value}`);
  }
  return result;
}

async function runPool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function consume() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, consume));
  return results;
}

function localeFor(locale) {
  return ({ ru: "ru-RU", en: "en-US", tr: "tr-TR", ar: "ar-SA", kk: "kk-KZ" })[locale] ?? "ru-RU";
}

function renderPersona(persona, report) {
  const findings = report.findings.map((finding) => `### [${finding.severity}] ${finding.title}\n\n${finding.observation}\n\nШаги: ${finding.evidenceSteps.join(", ")}. Влияние: ${finding.impact}\n\nРекомендация: ${finding.recommendation} (уверенность: ${finding.confidence})`).join("\n\n");
  return `# ${persona.name}, ${persona.age}\n\n${report.executiveSummary}\n\n- Результат: ${report.outcome}\n- Завершено дел: ${report.completedCases}\n- Понимание: ${report.comprehension}/5\n- Удобство: ${report.usability}/5\n- Удовольствие: ${report.enjoyment}/5\n- Намерение продолжить: ${report.continuationIntent}/5\n\n## Понравилось\n\n${report.liked.map((item) => `- ${item}`).join("\n") || "- Нет подтвержденных наблюдений"}\n\n## Не понравилось\n\n${report.disliked.map((item) => `- ${item}`).join("\n") || "- Нет подтвержденных наблюдений"}\n\n## Наблюдения\n\n${findings || "Подтвержденных проблем не выявлено."}\n\n## Ограничение\n\n${report.demographicCaveat}\n`;
}

function renderAggregate(report) {
  const findings = report.strongestSignals.map((finding) => `### [${finding.severity}] ${finding.title}\n\n${finding.observation}\n\nВлияние: ${finding.impact}\n\nРекомендация: ${finding.recommendation}`).join("\n\n");
  const section = (title, items) => `## ${title}\n\n${items.map((item) => `- ${item}`).join("\n") || "- Нет подтвержденных данных"}`;
  return `# Сводный синтетический плейтест\n\n${report.executiveSummary}\n\n## Ключевые сигналы\n\n${findings}\n\n${section("Сильные стороны", report.strengths)}\n\n${section("Различия сегментов", report.segmentDifferences)}\n\n${section("Приоритеты", report.priorities)}\n\n${section("План проверки", report.validationPlan)}\n\n${section("Ограничения", report.limitations)}\n`;
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
