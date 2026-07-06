# Handoff: Investigation Services & Department Progression

Часть 1 — `InvestigationServiceOrder` · Часть 2 — `DepartmentPlan`
(Особые архивы / `SpecialArchivesEntry` / `ThematicPacksModal` — **вне этого хэндоффа**, делаем позже.)

---

## Overview

Две новые UI-системы экрана дела в «Где ложь? Симулятор детектива»:

1. **`InvestigationServiceOrder`** — официальный бланк «Распоряжение на расследование». Появляется
   внутри дела **до вскрытия первой улики**. Игрок может выбрать **одну** услугу или продолжить без
   услуги. После первого вскрытия улики бланк исчезает. Услуги помогают **планировать**, но никогда
   не раскрывают вердикт.
2. **`DepartmentPlan`** — «План отдела» в правом сайдбаре. Развитие трёх отделов (Архив, Выезд/допуск,
   Лаборатория) открывает услуги, даёт скидку и бесплатные вызовы. Подача — официальное бюджетное
   планирование, не «магазин усилителей».

Тон обеих систем: спокойный, практичный, читаемый для аудитории 30–60. Никакого «power-up / RPG / booster»
языка, никакого давления.

---

## About the Design Files

Файлы в этом бандле — **дизайн-референсы, собранные в HTML** (прототип, показывающий итоговый вид и
поведение), **не продакшн-код для копирования**. Задача — **воспроизвести эти макеты в существующем
окружении проекта**: **React + TypeScript + Tailwind + Framer Motion (Vite)** — по уже принятым в репозитории
паттернам (компоненты, токены темы, утилиты). HTML-разметку прототипа переносить дословно не нужно; нужно
повторить вид, состояния и поведение средствами кодовой базы.

Главный файл-референс: **`Claim Detective - Особые архивы и Услуги.dc.html`** (вложен в бандл).
Это пан-канва с несколькими «главами». Для этого хэндоффа релевантны:

- **Глава 03 · InvestigationServiceOrder** — десктоп-бланк, мобайл, RTL и матрица из 7 состояний услуги.
- **Глава 04 · DepartmentPlan** — правый сайдбар (десктоп), состояния (макс / нехватка средств), мобайл, RTL.

Главы 01–02 (Особые архивы) в этом хэндоффе **игнорируем**.

---

## Fidelity

**High-fidelity (hifi).** Финальные цвета (палитра «Сепия 1970-х»), типографика, отступы, состояния и
копирайт. Воспроизводить **пиксель-в-пиксель** существующими компонентами и токенами кодовой базы.

> ⚠️ В HTML-прототипе цвета заданы литеральными hex (так как прототип не на Tailwind). **В коде используйте
> токены темы, а не хардкод hex.** Таблица соответствия — в разделе [Design Tokens](#design-tokens).
> Несколько приглушённых серо-песочных оттенков прототипа (locked/неприменимо) в коде = `surface-2` + `border`
> + `text-dim` + пониженная непрозрачность; не вводите новых цветов.

---

## Component tree

```
CaseScreen
├─ InvestigationServiceOrder              // монтируется, пока не вскрыта первая улика
│  ├─ ServiceOrderHeader                  // баннер-шапка «Форма Р-7» + бюджет отдела
│  ├─ ServiceOrderIntro                   // инструкция + «не раскрывает вердикт»
│  ├─ ServiceRadioGroup  (role=radiogroup)
│  │  └─ ServiceRow × 3   (role=radio)    // archive_check / extra_clearance / expert_opinion
│  │     ├─ ServiceSelector               // чекбокс/радио-маркер 26px
│  │     ├─ ServiceBody                   // название (serif) + отдел (mono) + описание (sans)
│  │     ├─ ServiceStatePill              // mono-пилюля состояния
│  │     └─ ServiceCost                   // mono-стоимость
│  └─ ServiceOrderFooter                  // примечание + «Продолжить без услуги →»
│
CaseSidebarRight
└─ DepartmentPlan                         // «План отдела»
   ├─ DepartmentPlanHeader                // заголовок + бюджет компании
   └─ DepartmentCard × 3                  // archive / field / laboratory
      ├─ DepartmentHeader                 // название (serif) + «{level}/3» (mono)
      ├─ LevelSegments                    // 3 сегмента-полоски
      ├─ DepartmentSub                    // открытая/текущая услуга (mono)
      ├─ NextEffectRow                    // «ДАЛЬШЕ · <эффект следующего уровня>»
      └─ UpgradeRow                       // стоимость (mono) + UpgradeButton
```

---

## Part 1 — `InvestigationServiceOrder`

### Назначение

Бланк-распоряжение перед началом дела. Один выбор услуги (или без услуги). Услуги влияют только на
**планирование**, не на вердикт.

### Три услуги

| id                | Название (ru)            | Отдел        | Эффект                                                        |
|-------------------|--------------------------|--------------|--------------------------------------------------------------|
| `archive_check`   | Архивная проверка        | `archive`    | Показывает **только число противоречий** в деле.             |
| `extra_clearance` | Дополнительный допуск    | `field`      | **Одно** доп. вскрытие улики — **только в бюджетных делах**. |
| `expert_opinion`  | Экспертное заключение    | `laboratory` | Раскрывает **статус первой выбранной** улики.               |

### Layout

**Desktop:** карточка-бланк на бумаге (`paper`) с шапкой-баннером (`folder-edge`, текст `paper`).
Внутренние отступы 14–16px. Шапка: слева mono-капс «РАСПОРЯЖЕНИЕ НА РАССЛЕДОВАНИЕ», справа «Форма Р-7».
Под шапкой: слева инструкция (≤330px, sans), справа компактный блок «БЮДЖЕТ ОТДЕЛА · ₽ N» (mono, число `accent`).
Далее — вертикальный стек из 3 строк услуг (`gap: 9px`). Футер: hairline `paper-line` сверху, слева mono-нота
«Услуга не показывает итоговый вердикт», справа ссылка-кнопка «Продолжить без услуги →» (`accent`, подчёркнута).

**Строка услуги (`ServiceRow`):** flex, `gap: 12px`, padding 12–13px, `border: 1.5px`, `border-radius: 9px`.
Слева маркер-селектор 26×26, `border-radius: 7px`, `border: 2px`. Тело: верхняя строка — название (serif 15px/700)
слева + пилюля-состояние справа; ниже mono-капс «ОТДЕЛ · <Отдел>» (`text-muted`); ниже описание (sans 12px);
в правом нижнем углу — стоимость (mono 11px/600).

### State machine — услуги

Состояния: `locked` · `available` · `selected` · `unaffordable` · `discounted` · `free_daily` · `not_applicable`.

```
                 (отдел достигает ур.1)
   locked  ───────────────────────────►  available ──(tap)──►  selected
     ▲                                       │  ▲                  │
     │ (отдел ур.0)                   (tap)  │  └────(tap снова, снять выбор)──┘
     │                                       ▼
     └──────────────────────────────  not_applicable        (выбор другой услуги
                                       (услуга не подходит    автоматически снимает
                                        к этому делу)         предыдущую — single select)

  Модификаторы доступной/выбранной услуги (накладываются на available/selected):
    • unaffordable — баланс отдела < effectiveCost → выбрать нельзя (aria-disabled)
    • discounted   — отдел ур.2 → effectiveCost = baseCost × 0.8, пилюля «−20%»
    • free_daily   — отдел ур.3 и бесплатный вызов сегодня не использован → effectiveCost = 0

  Глобально: при первом вскрытии улики весь бланк размонтируется (visible=false).
```

Правила:
- **Только одна** услуга выбрана одновременно. Выбор другой снимает предыдущую.
- Повторный тап по выбранной — снять выбор (вернуться в `available`).
- Выбор возможен **только до** первого вскрытия улики.
- `locked` / `unaffordable` / `not_applicable` — невыбираемы.

### Token mapping по состояниям (используйте токены, не hex)

| Состояние        | Карточка (border / bg)              | Маркер                          | Пилюля                                  | Стоимость       |
|------------------|-------------------------------------|---------------------------------|-----------------------------------------|-----------------|
| `locked`         | `border` / `surface-2`, opacity .7  | `border` / `surface-2`          | контур `border`, текст `text-dim`       | `text-dim` («Ур. 1 отдела») |
| `available`      | `border` / `paper`                  | `border` / `paper`              | контур `border`, текст `text-muted`     | `text-muted`    |
| `selected`       | `accent` / `accent`@8%              | `accent` / `accent`, ✓ `paper`  | заливка `accent`, текст `paper`         | `accent`        |
| `unaffordable`   | `border` / `paper`                  | `border` / `paper`              | контур `danger`, текст `danger`         | `danger`        |
| `discounted`     | `border` / `paper`                  | `border` / `paper`              | `success`@15% / контур `success` «−20%» | `success`       |
| `free_daily`     | `success` / `success`@8%            | `success` / `paper`             | заливка `success`, текст `paper` «1/день»| `success` («Бесплатно») |
| `not_applicable` | `border` / `surface-2`, opacity .7  | `border` / `surface-2`          | контур `border`, текст `text-dim`       | `text-dim` («—»)|

### Props

```ts
type ServiceId = 'archive_check' | 'extra_clearance' | 'expert_opinion';
type DepartmentId = 'archive' | 'field' | 'laboratory';
type ServiceState =
  | 'locked' | 'available' | 'selected'
  | 'unaffordable' | 'discounted' | 'free_daily' | 'not_applicable';

interface InvestigationService {
  id: ServiceId;
  department: DepartmentId;
  state: ServiceState;
  baseCost: number;        // ₽, до скидки
  effectiveCost: number;   // ₽, после скидки / 0 при free_daily
}

interface InvestigationServiceOrderProps {
  services: InvestigationService[];        // ровно 3, в порядке У-1, У-2, У-3
  departmentBudget: number;                // показывается в шапке бланка
  selectedServiceId: ServiceId | null;
  onSelectService: (id: ServiceId) => void;// тоггл; компонент-родитель держит single-select
  onContinueWithout: () => void;
  visible: boolean;                        // false → размонтировать (первая улика вскрыта)
  locale: 'ru' | 'en' | 'tr' | 'ar' | 'kk';
  dir?: 'ltr' | 'rtl';                     // 'rtl' для ar
}
```

---

## Part 2 — `DepartmentPlan`

### Назначение

Правый сайдбар «План отдела». Развитие трёх отделов уровнями 0–3. Подача — бюджетное планирование.

### Отделы, уровни и стоимости

| Отдел (id)            | Услуга (ур.1)         | Стоимость L1 / L2 / L3        |
|-----------------------|-----------------------|-------------------------------|
| `archive` (Архив)     | Архивная проверка     | 10 000 / 30 000 / 60 000 ₽    |
| `field` (Выезд/допуск)| Дополнительный допуск | 15 000 / 40 000 / 80 000 ₽    |
| `laboratory` (Лаборатория) | Экспертное заключение | 25 000 / 60 000 / 120 000 ₽ |

Эффекты уровней (одинаковы для всех отделов):
- **Ур. 1** — открывает услугу отдела.
- **Ур. 2** — скидка **20 %** на услугу отдела.
- **Ур. 3** — **один бесплатный вызов** услуги в день (на серверный день).

### Layout

Карточка-сайдбар на `surface`, `border`, `border-radius: 12px`, padding ~15px. Шапка: «План отдела»
(serif 13px/700) + mono-капс «БЮДЖЕТ ₽ N». Короткое описание (sans 10.5px, `text-muted`). Далее стек из 3
карточек отдела (`gap: 11px`).

**`DepartmentCard`:** `border-radius: 9px`, padding 12px.
- Шапка карточки: название (serif 14px/700) слева, «{level}/3» (mono) справа.
- **`LevelSegments`** — 3 равные полоски (`flex:1; height:6px; border-radius:3px; gap:5px`):
  заполненные = `accent` (для `max` — `success`); пустые = прозрачные с рамкой `border`.
- `DepartmentSub` — mono 9px `text-muted`: открытая/текущая услуга.
- **`NextEffectRow`** — на `paper`, рамка `paper-line`, padding 7–9px: mono-капс «ДАЛЬШЕ» + sans-текст
  следующего эффекта.
- **`UpgradeRow`** — стоимость (mono 12px/600) слева + `UpgradeButton` справа (min-height 38px desktop /
  **44px mobile**).

### State machine — карточка отдела

```
   level 0 ──upgrade──► level 1 ──upgrade──► level 2 ──upgrade──► level 3 (max)
   (открыта      (скидка 20%)        (1 бесплатно/день)
    услуга)

   На каждом не-max уровне действие зависит от баланса:
     balance ≥ cost(nextLevel)  →  ready        (кнопка активна)
     balance <  cost(nextLevel) →  insufficient (кнопка disabled, стоимость в danger)
   level === 3                  →  max          (кнопка disabled «Отдел развит полностью»)
```

| Состояние      | Карточка (border / bg)        | Стоимость   | Кнопка                                         |
|----------------|-------------------------------|-------------|------------------------------------------------|
| `ready`        | `border` / `surface`          | `ink`       | заливка `accent`, текст white — «Развить отдел»|
| `insufficient` | `border` / `surface`          | `danger`    | контур `border`, текст `text-dim`, `aria-disabled` — «Недостаточно средств» |
| `max`          | `success` / `success`@10%     | «—»         | контур `success`, текст `success`, disabled — «Отдел развит полностью ✓» |

### Props

```ts
interface Department {
  id: DepartmentId;            // 'archive' | 'field' | 'laboratory'
  level: 0 | 1 | 2 | 3;
  costs: [number, number, number]; // стоимость достижения L1, L2, L3
  serviceId: ServiceId;        // услуга, открываемая на ур.1
}

interface DepartmentPlanProps {
  departments: Department[];   // ровно 3, порядок: archive, field, laboratory
  balance: number;            // бюджет компании
  onUpgrade: (id: DepartmentId) => void;
  locale: 'ru' | 'en' | 'tr' | 'ar' | 'kk';
  dir?: 'ltr' | 'rtl';
}
```

Производные (вычислять в компоненте, не передавать пропсами):
`nextCost = costs[level]` (при `level < 3`); `cardState = level===3 ? 'max' : balance >= nextCost ? 'ready' : 'insufficient'`.

---

## Interactions & Behavior

- **Выбор услуги** — тап по строке (вся строка — цель). Тоггл single-select. `locked`/`unaffordable`/
  `not_applicable` не реагируют.
- **«Продолжить без услуги»** — закрывает выбор и стартует дело без услуги.
- **Размонтирование бланка** — при первом вскрытии улики (`visible=false`).
- **Развитие отдела** — тап по `UpgradeButton`; списывает `nextCost`, `level += 1`. Disabled при
  `insufficient`/`max`.
- **Hover (только pointer-устройства)** — строка услуги / карточка отдела приподнимается `translateY(-2px)`,
  160ms; уважать `prefers-reduced-motion`.

## Motion specification (Framer Motion)

- **Появление бланка:** `opacity 0→1`, `y -8→0`, 200ms, ease-out.
- **Скрытие бланка** (первая улика): `opacity 1→0`, `y 0→-8`, 180ms, затем unmount (`AnimatePresence`).
- **Выбор услуги:** кросс-фейд border/bg 120ms; «галочка» маркера `scale 0.6→1` пружиной
  (`type:'spring', stiffness:500, damping:30`).
- **Развитие отдела (успех):** соответствующий сегмент заполняется слева-направо
  (`scaleX 0→1`, `transform-origin:left`), 240ms ease-out. Спокойно, **без конфетти/вспышек/тряски**.
- Все анимации отключаются/упрощаются при `prefers-reduced-motion: reduce`.

## Accessibility

- Бланк — **не модалка** (инлайн в экране дела): focus-trap и Esc **не требуются**.
- `ServiceRadioGroup`: `role="radiogroup"`, `aria-labelledby` = id заголовка бланка. Каждая
  `ServiceRow`: `role="radio"`, `aria-checked`, `aria-disabled` для `locked`/`unaffordable`/`not_applicable`.
  Клавиатура: ↑/↓ перемещают по группе, Space/Enter — выбор.
- `DepartmentPlan`: список карточек; `UpgradeButton` — нативный `<button>` с `aria-disabled` и `title`,
  объясняющим причину (нехватка средств / макс. уровень) для `insufficient`/`max`.
- Видимый фокус: контур 2px `accent` со смещением 2px на всех интерактивных элементах.
- Цели тапа ≥ **44px** на мобайле.
- Контраст под 30–60: все пары токенов проходят WCAG AA+ (см. палитру).

## Mobile behavior

- Бланк и план отдела — на всю ширину контентной колонки, те же состояния и копирайт.
- Все интерактивные элементы (строки услуг, кнопки развития) ≥ 44px по высоте.
- `DepartmentPlan` на мобайле выводится отдельной секцией (не в боковой колонке) — стек из 3 карточек.
- Длинный текст (tr/kk/ar) переносится; используйте `text-wrap: pretty`/`balance`, не обрезайте названия услуг.

## RTL Arabic behavior

- Контейнеры — `dir="rtl"`; внутренние flex-строки — `flex-direction: row-reverse`, текст `text-align:right`.
- Маркер-селектор и стоимость зеркалируются (селектор справа, стоимость слева).
- Шапка-баннер и пилюли зеркалируются; `border-radius` угла-вкладки бланка отражается.
- Числа — арабско-индийские цифры (١٢٣) при `locale==='ar'`.
- Логические свойства (`padding-inline`, `margin-inline`, `inset-inline`) предпочтительнее физических.
- Проверить, что длинные арабские строки не перекрывают пилюли/стоимость.

---

## Design Tokens

Палитра **«Сепия 1970-х»** — уже в `tailwind.config.js` / CSS-переменных темы. **Не вводить новых цветов,
не хардкодить hex.**

| Токен        | Hex       | Назначение                                              |
|--------------|-----------|---------------------------------------------------------|
| `bg`         | `#E3D2B0` | фон стола                                               |
| `surface`    | `#EFE2C6` | сайдбары / карточка плана отдела                        |
| `surface-2`  | `#D4C09C` | вложенные блоки / приглушённые (locked) строки          |
| `border`     | `#BFA776` | границы панелей и строк                                 |
| `paper`      | `#F6ECD6` | бумага бланка, светлый текст на заливках                |
| `paper-line` | `#E7D8B6` | hairline внутри бумаги (футер, рамка блоков)            |
| `ink`        | `#2A2014` | текст на бумаге                                         |
| `text-light` | `#3A2C16` | основной текст на хроме стола                           |
| `text-muted` | `#6E5630` | вторичный текст, mono-капс-метки                        |
| `text-dim`   | `#6E5630` | приглушённый текст (в прототипе locked ≈ `#9A8A66`)     |
| `accent`     | `#95431F` | выбор услуги, ссылки, кнопка «Развить», числа баланса   |
| `success`    | `#5E7A2E` | free_daily / скидка / макс. уровень отдела              |
| `danger`     | `#B23A2E` | нехватка средств, недоступная стоимость                 |
| `gold`       | `#C58A24` | — (в этих компонентах не используется)                  |
| `stamp`      | `#A8201C` | — (печати; здесь не используется)                       |
| `folder`     | `#CBA85E` | — (обложка папки; здесь не используется)                |
| `folder-edge`| `#876520` | шапка-баннер бланка (фон), текст = `paper`              |

**Типографика (Tailwind утилиты):**
- `font-serif` — **IBM Plex Serif** (500/600/700): названия услуг, отделов, заголовки бланка.
- `font-sans` — **Inter** (400–700): инструкции, описания, копирайт кнопок.
- `font-mono` — **IBM Plex Mono** (400–600): номера, статусы, служебные метки, суммы, уровни.

**Радиусы / тени / толщины:**
- Карточки/строки: `border-radius` 9px; бланк 9px со скруглением шапки; план отдела 12px.
- Маркер услуги: 26×26, `border-radius` 7px, `border` 2px.
- Сегменты уровня: высота 6px, `border-radius` 3px, `gap` 5px.
- Бланк-тень (desktop): `0 14px 32px rgba(40,28,10,.16)`.
- Hairline-делители: 1px `paper-line` (внутри бумаги) / 1px `border` (между панелями).

---

## Assets

Иконографических ассетов нет: маркеры, галочка ✓, сегменты, пилюли — чистый CSS/типографика.
Если в кодовой базе есть набор иконок — для галочки выбора и состояния использовать его; иначе ✓ глифом.

---

## i18n strings (ru / en / tr / ar / kk)

| key                                | ru                                   | en                                  | tr                                   | ar                              | kk                                   |
|------------------------------------|--------------------------------------|-------------------------------------|--------------------------------------|---------------------------------|--------------------------------------|
| `services.order.title`             | Распоряжение на расследование        | Investigation order                 | Soruşturma emri                      | أمر التحقيق                      | Тергеу бұйрығы                       |
| `services.order.formCode`          | Форма Р-7                            | Form R-7                            | Form R-7                            | نموذج Р-7                        | Р-7 нысаны                           |
| `services.order.instruction`       | Выберите одну услугу до вскрытия первой улики. После вскрытия бланк закрывается. | Choose one service before opening the first evidence. The sheet closes after that. | İlk delili açmadan önce bir hizmet seçin. Sonrasında form kapanır. | اختر خدمة واحدة قبل فتح أول دليل. يُغلق النموذج بعد ذلك. | Бірінші дәлелді ашқанға дейін бір қызметті таңдаңыз. Содан кейін парақ жабылады. |
| `services.order.budget`            | Бюджет отдела                        | Department budget                   | Departman bütçesi                    | ميزانية القسم                   | Бөлім бюджеті                        |
| `services.order.noVerdictNote`     | Услуга не показывает итоговый вердикт | A service never reveals the verdict | Hizmet nihai kararı göstermez        | الخدمة لا تكشف الحكم النهائي     | Қызмет түпкі шешімді көрсетпейді      |
| `services.order.continueWithout`   | Продолжить без услуги                 | Continue without a service          | Hizmetsiz devam et                   | المتابعة بدون خدمة              | Қызметсіз жалғастыру                  |
| `services.archiveCheck.name`       | Архивная проверка                    | Archive check                       | Arşiv kontrolü                       | فحص الأرشيف                      | Архивтік тексеру                     |
| `services.archiveCheck.desc`       | Покажет только число противоречий в деле. | Shows only the number of contradictions in the case. | Yalnızca dosyadaki çelişki sayısını gösterir. | يُظهر عدد التناقضات في القضية فقط. | Тек істегі қайшылықтар санын көрсетеді. |
| `services.extraClearance.name`     | Дополнительный допуск                 | Extra clearance                     | Ek erişim                            | تصريح إضافي                     | Қосымша рұқсат                       |
| `services.extraClearance.desc`     | Одно доп. вскрытие улики — только в бюджетных делах. | One extra evidence open — budgeted cases only. | Bir ek delil açma — yalnızca bütçeli dosyalarda. | فتح دليل إضافي واحد — في القضايا ذات الميزانية فقط. | Бір қосымша дәлел ашу — тек бюджеттік істерде. |
| `services.expertOpinion.name`      | Экспертное заключение                 | Expert opinion                      | Uzman görüşü                         | رأي الخبير                       | Сараптама қорытындысы                |
| `services.expertOpinion.desc`      | Раскроет статус первой выбранной улики. | Reveals the status of the first selected evidence. | Seçilen ilk delilin durumunu açıklar. | يكشف حالة أول دليل تختاره. | Таңдалған бірінші дәлелдің күйін ашады. |
| `services.state.locked`            | Заблокировано                        | Locked                              | Kilitli                              | مقفل                            | Бұғатталған                          |
| `services.state.available`         | Доступно                             | Available                           | Mevcut                               | متاح                            | Қолжетімді                           |
| `services.state.selected`          | Выбрано                              | Selected                            | Seçildi                              | مُختار                          | Таңдалды                             |
| `services.state.unaffordable`      | Не хватает                           | Not enough                          | Yetersiz                             | غير كافٍ                        | Жеткіліксіз                          |
| `services.state.notApplicable`     | Неприменимо                          | Not applicable                      | Uygulanamaz                          | غير قابل للتطبيق                | Қолданылмайды                        |
| `services.state.discounted`        | −20%                                 | −20%                                | −%20                                 | −٢٠٪                            | −20%                                 |
| `services.state.freeDaily`         | 1 бесплатно / день                   | 1 free / day                        | Günde 1 ücretsiz                     | مجاني مرة / يوم                 | Күніне 1 тегін                       |
| `services.cost.free`               | Бесплатно                            | Free                                | Ücretsiz                             | مجاني                           | Тегін                                |
| `department.plan.title`            | План отдела                          | Department plan                     | Departman planı                      | خطة القسم                       | Бөлім жоспары                        |
| `department.plan.budget`           | Бюджет                               | Budget                              | Bütçe                                | الميزانية                       | Бюджет                               |
| `department.plan.intro`            | Развитие отделов открывает услуги, скидки и бесплатные вызовы. | Developing departments unlocks services, discounts and free calls. | Departmanları geliştirmek hizmetleri, indirimleri ve ücretsiz çağrıları açar. | تطوير الأقسام يفتح الخدمات والخصومات والاستدعاءات المجانية. | Бөлімдерді дамыту қызметтерді, жеңілдіктер мен тегін шақыруларды ашады. |
| `department.next`                  | Дальше                               | Next                                | Sonraki                              | التالي                          | Келесі                               |
| `department.archive`               | Архив                                | Archive                             | Arşiv                                | الأرشيف                         | Архив                                |
| `department.field`                 | Выезд / допуск                       | Field / clearance                   | Saha / erişim                        | الميدان / التصريح              | Шығу / рұқсат                        |
| `department.laboratory`            | Лаборатория                          | Laboratory                          | Laboratuvar                          | المختبر                         | Зертхана                             |
| `department.effect.unlock`         | Открывает услугу отдела              | Unlocks the department service      | Departman hizmetini açar             | يفتح خدمة القسم                | Бөлім қызметін ашады                  |
| `department.effect.discount`       | Скидка 20% на услуги                 | 20% service discount                | Hizmette %20 indirim                 | خصم ٢٠٪ على الخدمات           | Қызметке 20% жеңілдік                 |
| `department.effect.freeDaily`      | 1 бесплатный вызов в день            | 1 free call per day                 | Günde 1 ücretsiz çağrı               | استدعاء مجاني واحد يوميًا       | Күніне 1 тегін шақыру                 |
| `department.action.upgrade`        | Развить отдел                        | Upgrade department                  | Departmanı geliştir                  | تطوير القسم                     | Бөлімді дамыту                       |
| `department.action.insufficient`   | Недостаточно средств                 | Not enough funds                    | Yetersiz bakiye                      | رصيد غير كافٍ                  | Қаражат жеткіліксіз                  |
| `department.action.max`            | Отдел развит полностью               | Fully developed                     | Tamamen geliştirildi                 | تم التطوير بالكامل             | Толық дамыған                        |
| `department.level`                 | {level}/3                            | {level}/3                           | {level}/3                            | {level}/٣                       | {level}/3                            |

> Стоимости (числа) форматировать локалью: ru/kk — пробел-разделитель тысяч и «₽»; ar — арабско-индийские
> цифры. Не хардкодить формат — через Intl.NumberFormat.

---

## Acceptance checklist

**InvestigationServiceOrder**
- [ ] Бланк выглядит как официальное «Распоряжение», а не как booster-shop.
- [ ] Понятно, что услугу выбирают **только до** первой улики; после — бланк исчезает.
- [ ] Три услуги визуально различимы; эффект каждой читается без длинного текста.
- [ ] Нигде не подразумевается, что услуга раскрывает вердикт.
- [ ] Покрыты состояния: locked, available, selected, unaffordable, not_applicable, discounted, free_daily.
- [ ] Single-select: вторая услуга снимает первую; повторный тап снимает выбор.

**DepartmentPlan**
- [ ] Работает в правом сайдбаре, не выглядит тесным.
- [ ] Видны 3 отдела: Архив, Выезд/допуск, Лаборатория.
- [ ] У каждого: уровень 0–3, следующий эффект, стоимость, действие.
- [ ] Состояния «макс. уровень» и «недостаточно средств» очевидны.
- [ ] Ощущение бюджетного планирования, не магазина усилителей.

**Общее**
- [ ] Desktop, mobile и RTL-арабский читаемы; цели тапа ≥ 44px на мобайле.
- [ ] Длинный текст ar/tr/kk не перекрывает соседние элементы.
- [ ] Используются токены темы; новых цветов/хардкод-hex нет.
- [ ] Анимации спокойные (без конфетти/тряски), уважают prefers-reduced-motion.
- [ ] Контраст подходит для 30–60 (WCAG AA+).
- [ ] i18n-ключи заведены для ru, en, tr, ar, kk.
- [ ] Реализуемо в текущем React + TypeScript + Tailwind + Framer Motion без новой библиотеки компонентов.

---

## Files

- **`Claim Detective - Особые архивы и Услуги.dc.html`** — HTML-референс. Релевантны главы **03**
  (`InvestigationServiceOrder`: десктоп-бланк, мобайл, RTL, матрица 7 состояний) и **04**
  (`DepartmentPlan`: десктоп, состояния, мобайл, RTL). Главы 01–02 (Особые архивы) — вне этого хэндоффа.
- Открыть файл можно в любом браузере (он самодостаточный, грузит шрифты с Google Fonts).
