import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const casesRoot = path.join(repoRoot, 'src/data/cases');
const outputPath = path.join(repoRoot, 'EVIDENCE_REDESIGN_HANDOFF_RU.md');

const TYPE_LABELS = {
  photo: 'фотография',
  gps: 'GPS-трек',
  document: 'документ',
  witness_statement: 'показания свидетеля',
  camera_recording: 'запись камеры',
  usage_log: 'технический журнал',
  xray: 'рентген',
  bank_statement: 'банковская выписка',
  phone_records: 'телефонная детализация',
  social_media: 'социальная сеть',
  document_scan: 'интерактивное сканирование документа',
  thermal_scan: 'интерактивный тепловизор',
  shadow_time_check: 'интерактивная проверка времени по тени',
  seal_match: 'интерактивное сопоставление пломб',
  surface_reveal: 'интерактивное исследование поверхности',
};

const RELATION_LABELS = {
  supports: 'подтверждает',
  contradicts: 'противоречит',
  contextualizes: 'даёт контекст',
  reveals_season_clue: 'раскрывает сквозную улику',
};

const TIER_LABELS = {
  core: 'ключевая',
  supporting: 'поддерживающая',
  bonus: 'бонусная',
  arc: 'сюжетная/сквозная',
};

function walkJsonFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkJsonFiles(fullPath);
    return entry.name.endsWith('.json') ? [fullPath] : [];
  });
}

function ru(value) {
  if (value == null) return null;
  if (Array.isArray(value)) return value.map((item) => ru(item));
  if (typeof value === 'object' && Object.hasOwn(value, 'ru')) return value.ru;
  return value;
}

function oneLine(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function bulletLines(value, prefix = '- ') {
  const localized = ru(value);
  if (localized == null) return [];
  const lines = Array.isArray(localized) ? localized : [localized];
  return lines.map((line) => `${prefix}${oneLine(line)}`);
}

function quoteLines(value) {
  const localized = ru(value);
  if (localized == null) return [];
  const lines = Array.isArray(localized) ? localized : [localized];
  return lines.map((line) => `> ${oneLine(line)}`);
}

function displayValue(value) {
  const localized = ru(value);
  if (Array.isArray(localized)) return localized.map(oneLine).join('; ');
  if (localized && typeof localized === 'object') return JSON.stringify(localized);
  return oneLine(localized);
}

function formatMeta(meta) {
  if (!meta) return [];
  return Object.entries(meta).map(([key, value]) => `  - \`${key}\`: ${displayValue(value)}`);
}

function formatInteractiveData(evidence) {
  const data = evidence.data;
  if (!data) return [];

  if (evidence.type === 'thermal_scan') {
    const zones = data.heatZones
      .map((zone) => `${zone.label} (${zone.temperature} °C${zone.isTarget ? ', цель' : ''}${zone.isContradiction ? ', противоречие' : ''})`)
      .join('; ');
    return [
      `  - Замер: ${data.observationTime}; заявленное последнее использование: ${data.claimedLastUseBefore}; прошло ${data.elapsedSinceClaimedUseMinutes} мин.; окружающая температура ${data.ambientTemperature} °C.`,
      `  - Тепловые зоны: ${zones}.`,
      `  - Условие успеха: ${data.successCondition.type}; зоны: ${data.successCondition.zoneIds.join(', ')}.`,
    ];
  }

  if (evidence.type === 'shadow_time_check') {
    const ranges = data.validTimeRanges.map((range) => `${range.from}–${range.to}`).join(', ');
    return [
      `  - Заявленное время: ${data.claimedTime}; источник ориентации: ${data.orientationSource}.`,
      `  - Игрок двигает шкалу ${data.slider.from}–${data.slider.to} с шагом ${data.slider.stepMinutes} мин.; допустимое совпадение: ${ranges}.`,
    ];
  }

  if (evidence.type === 'surface_reveal') {
    const traces = data.traces
      .map((trace) => `${trace.label} — ${trace.conclusion}${trace.isContradiction ? ' (противоречие)' : ''}`)
      .join('; ');
    const completion = data.completion.requiredTraceIds?.join(', ')
      ?? `${data.completion.requiredRevealPercent ?? '—'}%`;
    return [
      `  - Режим: ${data.mode}; покрытие: ${data.coverType}; условие завершения: ${data.completion.type} (${completion}).`,
      `  - Скрытые следы: ${traces}.`,
    ];
  }

  if (evidence.type === 'document_scan') {
    const zones = data.anomalyZones.map((zone) => `${zone.label}${zone.isContradiction ? ' (противоречие)' : ''}`).join('; ');
    return [
      `  - Режимы анализа: ${data.modes.join(', ')}; стартовый: ${data.initialMode}.`,
      `  - Зоны аномалий: ${zones}.`,
      `  - Условие успеха: ${data.successCondition.type}.`,
    ];
  }

  if (evidence.type === 'seal_match') {
    return [
      `  - Перемещаемый фрагмент: ${data.movableFragment}; вращение: ${data.allowRotation ? `да, шаг ${data.rotationStep}°` : 'нет'}; ожидаемое совпадение: ${data.expectedMatch ? 'да' : 'нет'}.`,
      `  - Маркеры сравнения: ${data.comparisonMarkers.map((marker) => marker.label).join('; ')}.`,
    ];
  }

  return [`  - Технические данные: \`${JSON.stringify(data)}\``];
}

function formatEvidence(evidence, index, statementMap) {
  const lines = [];
  const relation = evidence.statementLink?.relation;
  const linkedStatement = evidence.statementLink
    ? statementMap.get(evidence.statementLink.statementId)
    : null;

  lines.push(`#### ${index + 1}. ${oneLine(ru(evidence.title))}`);
  lines.push('');
  lines.push(`- ID: \`${evidence.id}\``);
  lines.push(`- Текущий вид: **${TYPE_LABELS[evidence.type] ?? evidence.type}** (\`${evidence.type}\`)`);
  lines.push(`- Это противоречие: **${evidence.isContradiction ? 'да' : 'нет'}**`);
  if (evidence.evidenceTier) lines.push(`- Роль в наборе: ${TIER_LABELS[evidence.evidenceTier] ?? evidence.evidenceTier} (\`${evidence.evidenceTier}\`)`);
  if (evidence.narrativeRole) lines.push(`- Драматургическая роль: \`${evidence.narrativeRole}\``);
  if (evidence.requiredForVerdict != null) lines.push(`- Обязательна для вердикта: ${evidence.requiredForVerdict ? 'да' : 'нет'}`);
  if (relation) {
    lines.push(`- Связь: **${RELATION_LABELS[relation] ?? relation}** утверждение \`${evidence.statementLink.statementId}\`${linkedStatement ? ` — «${oneLine(linkedStatement)}»` : ''}`);
  }
  if (evidence.unlocksAfterEvidenceIds?.length) lines.push(`- Открывается после: ${evidence.unlocksAfterEvidenceIds.map((id) => `\`${id}\``).join(', ')}`);
  if (evidence.revealsEvidenceIds?.length) lines.push(`- Открывает: ${evidence.revealsEvidenceIds.map((id) => `\`${id}\``).join(', ')}`);
  lines.push('');
  lines.push('**Текст улики:**');
  lines.push('');
  lines.push(...quoteLines(evidence.content));
  lines.push('');
  lines.push(`**Смысл/объяснение:** ${oneLine(ru(evidence.contradictionExplanation))}`);

  if (evidence.description || evidence.instruction || evidence.interactiveDesign) {
    lines.push('');
    lines.push('**Текущая интерактивная подача:**');
    lines.push('');
    if (evidence.description) lines.push(`- Контекст до анализа: ${oneLine(ru(evidence.description))}`);
    if (evidence.instruction) lines.push(`- Действие игрока: ${oneLine(ru(evidence.instruction))}`);
    if (evidence.interactiveDesign?.why) lines.push(`- Зачем это действие: ${oneLine(ru(evidence.interactiveDesign.why))}`);
    if (evidence.interactiveDesign?.conclusion) lines.push(`- Вывод после действия: ${oneLine(ru(evidence.interactiveDesign.conclusion))}`);
    lines.push(...formatInteractiveData(evidence));
  }

  const meta = formatMeta(evidence.meta);
  const assets = evidence.assets
    ? Object.entries(evidence.assets).map(([key, value]) => `  - \`${key}\`: ${Array.isArray(value) ? value.join(', ') : value}`)
    : [];
  if (meta.length || assets.length) {
    lines.push('');
    lines.push('**Текущие визуальные/служебные данные:**');
    lines.push('');
    lines.push(...meta, ...assets);
  }

  return lines;
}

function formatCase(caseData, sectionNumber, label) {
  const lines = [];
  const statementMap = new Map((caseData.claimStatements ?? []).map((statement) => [statement.id, ru(statement.text)]));
  const contradictions = caseData.evidences.filter((evidence) => evidence.isContradiction).length;

  lines.push(`## ${sectionNumber}. ${oneLine(ru(caseData.title))} (\`${caseData.id}\`)`);
  lines.push('');
  lines.push(`- Раздел: ${label}`);
  if (caseData.campaignOrder) lines.push(`- Позиция кампании: ${caseData.campaignOrder}`);
  if (caseData.act) lines.push(`- Акт: ${caseData.act}${caseData.actTitle ? ` — ${oneLine(ru(caseData.actTitle))}` : ''}`);
  lines.push(`- Сложность: \`${caseData.difficulty}\`; сумма требования: ${caseData.claimAmount}`);
  lines.push(`- Истина/вердикт: **${caseData.truth === 'fraud' ? 'мошенничество, отказать' : 'страховой случай, одобрить'}**`);
  lines.push(`- Улик: ${caseData.evidences.length}; противоречий: ${contradictions}; бюджет открытия: ${caseData.investigationBudget ?? 'без ограничения'}`);
  lines.push(`- Заявитель: **${oneLine(ru(caseData.claim.person))}**`);
  if (caseData.client?.role) lines.push(`- Роль заявителя: ${oneLine(ru(caseData.client.role))}`);
  if (caseData.client?.meta?.length) {
    lines.push(`- Карточка клиента: ${caseData.client.meta.map((row) => `${oneLine(ru(row.k))} — ${oneLine(ru(row.v))}`).join('; ')}`);
  }
  if (caseData.narrative?.preBrief) lines.push(`- Вводная записка: ${oneLine(ru(caseData.narrative.preBrief))}`);
  lines.push('');
  lines.push('### Заявление');
  lines.push('');
  lines.push(...quoteLines(caseData.claim.story));

  if (caseData.claimStatements?.length) {
    lines.push('');
    lines.push('### Проверяемые утверждения заявления');
    lines.push('');
    for (const statement of caseData.claimStatements) {
      lines.push(`- \`${statement.id}\`${statement.stampable ? ' [можно штамповать]' : ''}: ${oneLine(ru(statement.text))}`);
    }
  }

  lines.push('');
  lines.push('### Улики');
  lines.push('');
  caseData.evidences
    .slice()
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .forEach((evidence, index) => {
      lines.push(...formatEvidence(evidence, index, statementMap));
      lines.push('');
    });

  lines.push('### Финальное объяснение');
  lines.push('');
  lines.push(...bulletLines(caseData.explanation));
  if (caseData.narrative?.postVerdictNote) lines.push(`- После вердикта: ${oneLine(ru(caseData.narrative.postVerdictNote))}`);
  if (caseData.narrative?.seasonClue) {
    lines.push(`- Сквозная улика: ${oneLine(ru(caseData.narrative.seasonClue.label))} — ${oneLine(ru(caseData.narrative.seasonClue.description))}`);
  }
  lines.push('');
  return lines;
}

const records = walkJsonFiles(casesRoot).map((filePath) => ({
  filePath,
  caseData: JSON.parse(fs.readFileSync(filePath, 'utf8')),
}));

const campaign = records
  .filter(({ caseData }) => Number.isInteger(caseData.campaignOrder))
  .sort((a, b) => a.caseData.campaignOrder - b.caseData.campaignOrder);
const daily = records
  .filter(({ caseData }) => caseData.type === 'daily')
  .sort((a, b) => a.caseData.id.localeCompare(b.caseData.id));

if (campaign.length !== 50) throw new Error(`Expected 50 campaign cases, found ${campaign.length}`);
if (daily.length !== 6) throw new Error(`Expected 6 daily cases, found ${daily.length}`);

const allCases = [...campaign, ...daily];
const typeCounts = new Map();
let totalEvidence = 0;
for (const { caseData } of allCases) {
  totalEvidence += caseData.evidences.length;
  for (const evidence of caseData.evidences) {
    typeCounts.set(evidence.type, (typeCounts.get(evidence.type) ?? 0) + 1);
  }
}

const output = [];
output.push('# Передача нейросети: все дела и улики игры');
output.push('');
output.push('> Актуальная русскоязычная выгрузка непосредственно из `src/data/cases/**/*.json`. Документ содержит спойлеры: правильные вердикты и смысл каждой улики раскрыты намеренно.');
output.push('');
output.push('## Задача для нейросети');
output.push('');
output.push('Проанализируй приведённые ниже 50 дел кампании и 6 ежедневных дел. Предложи, как сделать **виды и способы предъявления улик разнообразнее и интереснее**, не меняя факты, причинно-следственные связи, правильные вердикты и тексты заявлений. Нужен не новый сюжет, а система выразительных, повторно используемых форматов улик.');
output.push('');
output.push('Требования к результату:');
output.push('');
output.push('- Сначала выдели повторяющиеся смысловые паттерны: хронология, сравнение двух источников, финансовая аномалия, географическое несоответствие, физический след, алиби, подделка, цифровой журнал и т. п.');
output.push('- Предложи каталог переиспользуемых визуальных подвидов внутри текущих технических типов. Например, `document` не должен всегда выглядеть одной и той же текстовой бумагой: это могут быть акт, накладная, лабораторный бланк, пропуск, схема, чек, реестр, служебная записка.');
output.push('- Для каждой улики укажи рекомендуемый подвид, композицию карточки, одно понятное действие игрока (если оно действительно усиливает дедукцию), момент раскрытия вывода и необходимые данные/ассеты.');
output.push('- Не превращай каждую карточку в мини-игру. Интерактивность нужна там, где игрок сам замечает противоречие: сопоставляет, проявляет, сортирует, двигает временную шкалу, выбирает участок или накладывает два источника.');
output.push('- Решения должны работать на мобильном экране, иметь крупные зоны нажатия, высокую читаемость и доступный нецветовой сигнал результата.');
output.push('- Визуальный язык: папка расследования на столе, физическая бумага, официальные формы, фотографии, чернила, штампы, архивные вкладыши. Запрещены неон, sci-fi, казино, мультяшность и игровые градиенты.');
output.push('- Не предлагай условия вида «если ID дела такой-то». Формат должен определяться структурированными данными и переиспользоваться в разных делах.');
output.push('- В финале дай: (1) каталог форматов, (2) таблицу соответствия всех улик новым форматам, (3) приоритет внедрения по охвату и эффекту, (4) необходимые дополнения к схеме данных.');
output.push('');
output.push('## Состав выгрузки');
output.push('');
output.push(`- Дел: **${allCases.length}** — кампания: ${campaign.length}, ежедневные: ${daily.length}.`);
output.push(`- Улик: **${totalEvidence}**.`);
output.push('- Язык: русские значения полей приведены дословно; технические ID и типы сохранены.');
output.push('- Для каждой улики указаны текущий тип, роль, связь с утверждением, текст, объяснение и доступные визуальные/интерактивные данные.');
output.push('');
output.push('### Частота текущих типов');
output.push('');
output.push('| Технический тип | Текущий смысл | Количество |');
output.push('|---|---|---:|');
for (const [type, count] of [...typeCounts].sort((a, b) => b[1] - a[1])) {
  output.push(`| \`${type}\` | ${TYPE_LABELS[type] ?? type} | ${count} |`);
}
output.push('');
output.push('# Кампания: дела 1–50');
output.push('');
campaign.forEach(({ caseData }, index) => output.push(...formatCase(caseData, index + 1, 'основная кампания')));
output.push('# Ежедневные дела');
output.push('');
daily.forEach(({ caseData }, index) => output.push(...formatCase(caseData, index + 1, 'ежедневное дело')));

fs.writeFileSync(outputPath, `${output.join('\n')}\n`);
console.log(`Wrote ${path.relative(repoRoot, outputPath)}: ${allCases.length} cases, ${totalEvidence} evidences.`);
