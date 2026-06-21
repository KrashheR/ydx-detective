#!/usr/bin/env node
/**
 * Bulk-create Yandex Metrica goals via the Management API.
 *
 * There is no "import goals from a file" button in the Metrica UI, but the
 * Management API lets us create them in one batch. This script registers a
 * JavaScript-event ("action") goal for every entry in the GOAL catalog so the
 * identifiers match exactly what the game sends via `ym(id, 'reachGoal', …)`
 * (see src/services/metrica.ts). Existing goals with the same identifier are
 * skipped — safe to re-run.
 *
 * Requires Node 18+ (global fetch).
 *
 * Usage:
 *   YM_OAUTH_TOKEN=xxxx node scripts/upload-metrica-goals.mjs            # create
 *   YM_OAUTH_TOKEN=xxxx node scripts/upload-metrica-goals.mjs --dry-run  # preview
 *   YM_OAUTH_TOKEN=xxxx YM_COUNTER_ID=12345 node scripts/upload-metrica-goals.mjs
 *
 * Getting an OAuth token (one-off, do NOT paste it into any chat):
 *   1. Create an app at https://oauth.yandex.ru with the "Яндекс Метрика" →
 *      "Запись" (edit) permission (scope: metrika:write).
 *   2. Grab the token via the implicit flow:
 *      https://oauth.yandex.ru/authorize?response_type=token&client_id=<APP_ID>
 *   3. Export it as YM_OAUTH_TOKEN for this command only.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = 'https://api-metrika.yandex.net/management/v1';

/**
 * Goal identifier (must equal the reachGoal name) → human-friendly display name
 * shown in the Metrica reports. Keep the identifiers in lockstep with the GOAL
 * map in src/services/metrica.ts.
 */
const GOALS = [
  ['case_start', 'Дело начато'],
  ['evidence_view', 'Улика открыта'],
  ['evidence_stamp', 'Улика отмечена штампом'],
  ['hint_buy', 'Покупка подсказки'],
  ['verdict_submit', 'Вердикт вынесен'],
  ['reward_double', 'Удвоение награды'],
  ['funds_restore', 'Восстановление средств'],
  ['achievement_unlock', 'Достижение получено'],
  ['rank_up', 'Повышение уровня'],
  ['bankruptcy', 'Банкротство'],
  ['daily_claim', 'Ежедневное дело'],
  ['rating_action', 'Действие с рейтингом'],
];

const DRY_RUN = process.argv.includes('--dry-run');

const token = process.env.YM_OAUTH_TOKEN;
if (!token) {
  console.error('✗ YM_OAUTH_TOKEN is not set. See the header of this file.');
  process.exit(1);
}

/** Counter id: env override, else parsed from src/config/gameConfig.ts. */
function resolveCounterId() {
  if (process.env.YM_COUNTER_ID) return Number(process.env.YM_COUNTER_ID);
  const cfg = readFileSync(
    resolve(__dirname, '../src/config/gameConfig.ts'),
    'utf8',
  );
  const m = cfg.match(/counterId:\s*(\d+)/);
  return m ? Number(m[1]) : 0;
}

const counterId = resolveCounterId();
if (!counterId) {
  console.error(
    '✗ No counter id. Set YM_COUNTER_ID or fill GAME_CONFIG.analytics.counterId.',
  );
  process.exit(1);
}

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `OAuth ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${JSON.stringify(body)}`);
  }
  return body;
}

/** Identifiers of already-existing JS-event goals (to skip duplicates). */
async function existingActionGoals() {
  const { goals = [] } = await api(`/counter/${counterId}/goals`);
  const ids = new Set();
  for (const g of goals) {
    for (const c of g.conditions ?? []) {
      if (c.url) ids.add(c.url);
    }
  }
  return ids;
}

async function createGoal(identifier, name) {
  return api(`/counter/${counterId}/goals`, {
    method: 'POST',
    body: JSON.stringify({
      goal: {
        name,
        type: 'action', // JavaScript-event goal (reachGoal)
        conditions: [{ type: 'exact', url: identifier }],
      },
    }),
  });
}

async function main() {
  console.log(
    `Counter ${counterId} — ${GOALS.length} goals${DRY_RUN ? ' (dry-run)' : ''}\n`,
  );
  const existing = await existingActionGoals();
  let created = 0;
  let skipped = 0;
  for (const [identifier, name] of GOALS) {
    if (existing.has(identifier)) {
      console.log(`• skip   ${identifier} (already exists)`);
      skipped++;
      continue;
    }
    if (DRY_RUN) {
      console.log(`+ would create  ${identifier} → "${name}"`);
      created++;
      continue;
    }
    try {
      await createGoal(identifier, name);
      console.log(`✓ created ${identifier} → "${name}"`);
      created++;
    } catch (e) {
      console.error(`✗ failed  ${identifier}: ${e.message}`);
    }
  }
  console.log(
    `\nDone. ${DRY_RUN ? 'Would create' : 'Created'}: ${created}, skipped: ${skipped}.`,
  );
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
