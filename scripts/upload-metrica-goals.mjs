#!/usr/bin/env node
/**
 * Synchronize JavaScript-event goals with Yandex Metrica Management API.
 *
 * Safe by default: without --apply the script only reports missing goals.
 * Existing goals are never changed or deleted. The runtime catalog in
 * src/services/metrica.ts is checked before every run, so a newly added GOAL
 * cannot be silently omitted here.
 *
 * Local credentials (never commit this file):
 *   .env.metrica.local
 *     YANDEX_METRICA_COUNTER_ID=110041851
 *     YANDEX_OAUTH_TOKEN=...
 *
 * Commands:
 *   npm run metrika:goals          # dry-run
 *   npm run metrika:goals:publish  # create missing goals
 *   npm run metrika:goals -- --list
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API_BASE = 'https://api-metrika.yandex.net/management/v1';

/** Runtime identifier → display name in Metrica. */
const GOALS = [
  ['session_start', 'Сессия начата'],
  ['session_end', 'Сессия завершена'],
  ['active_interval', 'Интервал активной игры'],
  ['session_pause', 'Сессия приостановлена'],
  ['session_resume', 'Сессия продолжена'],
  ['case_start', 'Дело начато'],
  ['investigation_interrupt', 'Расследование прервано'],
  ['investigation_resume', 'Расследование продолжено'],
  ['evidence_view', 'Улика открыта'],
  ['evidence_stamp', 'Улика отмечена штампом'],
  ['hint_buy', 'Подсказка куплена'],
  ['verdict_submit', 'Вердикт вынесен'],
  ['reward_double', 'Награда удвоена'],
  ['funds_restore', 'Средства восстановлены'],
  ['achievement_unlock', 'Достижение получено'],
  ['rank_up', 'Ранг повышен'],
  ['bankruptcy', 'Наступило банкротство'],
  ['daily_claim', 'Ежедневное дело завершено'],
  ['daily_ad_unlock', 'Ежедневное дело открыто рекламой'],
  ['rating_action', 'Действие с рейтингом'],
  ['ad_offer', 'Реклама предложена'],
  ['ad_accept', 'Реклама запрошена'],
  ['ad_open', 'Реклама открыта'],
  ['ad_close', 'Реклама закрыта'],
  ['ad_reward', 'Награда за рекламу получена'],
  ['ad_error', 'Ошибка рекламы'],
  ['service_view', 'Услуга показана'],
  ['service_select', 'Услуга выбрана'],
  ['service_buy', 'Услуга куплена'],
  ['service_use', 'Услуга использована'],
  ['shop_view', 'Магазин открыт'],
  ['product_view', 'Товар показан'],
  ['purchase_start', 'Покупка начата'],
  ['purchase_success', 'Покупка завершена'],
  ['purchase_error', 'Ошибка покупки'],
  ['purchase_restore', 'Покупки восстановлены'],
  ['reject_blocked', 'Отклонение заблокировано без доказательств'],
  ['budget_exhausted', 'Бюджет расследования исчерпан'],
  ['locked_case_click', 'Клик по закрытому делу'],
];

function loadLocalEnv() {
  for (const fileName of [
    '.env.metrica.local',
    '.env.production.local',
    '.env.local',
  ]) {
    const filePath = resolve(ROOT, fileName);
    if (!existsSync(filePath)) continue;

    for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      process.env[key] ??= value;
    }
  }
}

function hasArg(name) {
  return process.argv.includes(name);
}

function runtimeGoalIdentifiers() {
  const source = readFileSync(resolve(ROOT, 'src/services/metrica.ts'), 'utf8');
  const catalog = source.match(/export const GOAL = \{([\s\S]*?)\}\s+as const;/)?.[1];
  if (!catalog) throw new Error('Cannot read the GOAL catalog from src/services/metrica.ts.');
  return [...catalog.matchAll(/:\s*'([a-z0-9_]+)'/g)].map((match) => match[1]);
}

function assertCatalogInSync() {
  const runtime = new Set(runtimeGoalIdentifiers());
  const configured = new Set(GOALS.map(([identifier]) => identifier));
  const missing = [...runtime].filter((identifier) => !configured.has(identifier));
  const stale = [...configured].filter((identifier) => !runtime.has(identifier));
  if (missing.length || stale.length) {
    throw new Error(
      `Metrica goal catalog is out of sync.` +
        `${missing.length ? ` Missing: ${missing.join(', ')}.` : ''}` +
        `${stale.length ? ` Stale: ${stale.join(', ')}.` : ''}`,
    );
  }
}

function counterIdFromConfig() {
  const source = readFileSync(resolve(ROOT, 'src/config/gameConfig.ts'), 'utf8');
  return source.match(/counterId:\s*(\d+)/)?.[1];
}

function getCounterId() {
  return (
    process.env.YANDEX_METRICA_COUNTER_ID ??
    process.env.VITE_YANDEX_METRICA_ID ??
    process.env.YM_COUNTER_ID ??
    counterIdFromConfig()
  );
}

function getToken() {
  return (
    process.env.YANDEX_OAUTH_TOKEN ??
    process.env.METRIKA_OAUTH_TOKEN ??
    process.env.YM_OAUTH_TOKEN
  );
}

async function requestJson(path, init, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `OAuth ${token}`,
      'Content-Type': 'application/x-yametrika+json',
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response.text();
    const hint = response.status === 403
      ? '\nПроверьте scopes metrika:read/metrika:write и доступ владельца токена к счётчику.'
      : '';
    throw new Error(
      `${init.method ?? 'GET'} ${path} failed: ${response.status} ${response.statusText}\n${body}${hint}`,
    );
  }
  return response.json();
}

async function fetchExistingIdentifiers(counterId, token) {
  const response = await requestJson(
    `/counter/${counterId}/goals`,
    { method: 'GET' },
    token,
  );
  return new Set(
    (response.goals ?? [])
      .flatMap((goal) => goal.conditions ?? [])
      .map((condition) => condition.url)
      .filter(Boolean),
  );
}

async function createGoal(counterId, token, [identifier, name]) {
  await requestJson(
    `/counter/${counterId}/goals`,
    {
      method: 'POST',
      body: JSON.stringify({
        goal: {
          name,
          type: 'action',
          conditions: [{ type: 'exact', url: identifier }],
        },
      }),
    },
    token,
  );
}

function printGoals(goals) {
  for (const [identifier, name] of goals) console.log(`${name} -> ${identifier}`);
}

async function main() {
  loadLocalEnv();
  assertCatalogInSync();

  if (hasArg('--list')) {
    printGoals(GOALS);
    return;
  }

  const apply = hasArg('--apply');
  const counterId = getCounterId();
  const token = getToken();

  if (!counterId) throw new Error('Не найден ID счётчика Метрики.');
  if (!token) {
    console.log('OAuth-токен не найден. Показываю локальный каталог целей:');
    printGoals(GOALS);
    if (apply) process.exitCode = 1;
    return;
  }

  const existing = await fetchExistingIdentifiers(counterId, token);
  const missing = GOALS.filter(([identifier]) => !existing.has(identifier));

  console.log(`Counter: ${counterId}`);
  console.log(`Already exists: ${GOALS.length - missing.length}`);
  console.log(`Missing: ${missing.length}`);

  if (!missing.length) {
    console.log('All goals already exist.');
    return;
  }
  if (!apply) {
    console.log('Dry run. Add --apply to create missing goals:');
    printGoals(missing);
    return;
  }

  for (const goal of missing) {
    await createGoal(counterId, token, goal);
    console.log(`Created: ${goal[1]} -> ${goal[0]}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
