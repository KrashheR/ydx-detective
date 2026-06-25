# Claude Design prompts for this MR

Use these prompts for Claude Design when generating the UI pass for the current MR.
They are written so they can be sent either as one full request or as separate design tasks.

## Prompt 1 - Shared product context

You are a senior product UI/UX designer for the Yandex Games project "Где ложь? Симулятор детектива" ("Where is the Lie? Detective Simulator").

The game is a calm data-driven insurance investigation experience. The player selects a case, reads the claim, opens evidence, stamps contradictions, and makes an approve/reject verdict. The audience is mostly 30-60 years old.

The core visual metaphor is an investigation folder on a detective's desk. The UI should feel like physical archival work: folders, paper sheets, card indexes, official forms, ink stamps, ledger rows, seals, file spines, tabs, and service labels.

Hard constraints:

- No neon, casino, mobile-gacha, fantasy, sci-fi, or loud arcade styling.
- No aggressive discounts, pressure timers, confetti, fireworks, or alarming red promo badges.
- Prioritize readability, calm hierarchy, large hit targets, and high contrast.
- Purchase actions must feel like convenience, not pressure.
- The free unlock path must be visible and honest.
- The design must work on desktop, mobile, and RTL Arabic.
- Do not invent a new design system.
- Use the existing React + TypeScript + Tailwind + Framer Motion implementation model.
- Use existing design tokens instead of hardcoded colors: `bg`, `surface`, `surface-2`, `border`, `paper`, `ink`, `text-light`, `text-muted`, `text-dim`, `accent`, `success`, `danger`, `gold`, `stamp`, `folder`, `folder-edge`.
- Use `font-serif` for folder/document/stamp titles, `font-sans` for normal UI, and `font-mono` for inventory numbers, statuses, service marks, and official labels.

The output should be production-ready and directly implementable in the existing React/Tailwind codebase.

## Prompt 2 - Special Archives

Design the new "Особые архивы" ("Special Archives") feature.

Feature summary:

- A persistent entry point in the desktop left sidebar.
- A compact entry point in the mobile desk menu.
- A modal/archive showcase for thematic investigation packs.
- Packs contain extra cases, desk/folder cosmetics, and a collectible stamp.
- This MR is currently a UI prototype: purchases, rewarded unlocks, product ids, and persisted ownership are not connected yet. The design must still account for future states.

Components to design:

### `SpecialArchivesEntry`

Design a compact folder or stack-of-folders entry.

Requirements:

- Desktop placement: after the daily case and before standard campaign cases.
- Mobile placement: after the daily case in the mobile menu.
- The whole entry is clickable.
- It should be visible on the first screen but should not compete with the active case or daily case.
- It must look like a physical archive object, not an ad banner.
- Suggested text:
  - "Особые архивы"
  - "Новые расследования и оформление стола"
  - "Новое"
  - "Первое дело бесплатно"
  - "Открыто 1 из 4"

### `ThematicPacksModal`

Design a modal as an archival showcase. Good metaphors: a pulled-out card-index drawer, an open archive folder with dividers, or a catalog of physical folders.

Required desktop structure:

- Header with title and close action.
- 2-3 pack cards.
- Selected pack detail area.
- Case list inside the selected pack.
- Skin/cosmetic preview list.
- Collectible stamp block.
- Purchase/rewarded/prototype action area.

Required mobile structure:

- Full-screen sheet or tall bottom sheet.
- Pack list first, details below or one pack expanded at a time.
- No small carousel cards.
- Action buttons may be sticky only if they do not cover content.
- All tap targets must be at least 44px.

Prototype packs:

1. "Архив необычных происшествий"
   - Theme: a closed academy of applied practices, laboratories, rare collections, unusually tidy explanations.
   - Visual cues: archival folder with a wax band, brass desk lamp, sealed documents.

2. "Полярный протокол"
   - Theme: remote scientific station, snow, radio communication, generator, field logs.
   - Visual cues: cold blue folder spine, station service marks, field journal.

3. "Особняк на утесе"
   - Theme: inheritance, antiques, family claims, old papers.
   - Visual cues: dark archive folder, old portrait frame, property inventory labels.

Do not copy recognizable franchises, symbols, worlds, or compositions.

States to show:

- New player, first case free.
- Free case completed, rewarded unlock available.
- Rewarded ad in progress.
- Rewarded ad successfully unlocked the next case.
- Rewarded unavailable or ad error.
- Daily rewarded unlock limit used.
- Purchase available.
- Purchase in progress.
- Purchase successful.
- Purchase restored.
- Whole pack completed.
- Skin trial active until end of day.
- Platform unavailable / prototype mode: actions disabled with calm explanation.

Action copy:

- Primary: "Купить архив целиком"
- Secondary: "Открыть следующее дело за рекламу"
- Helper: "Дело останется открытым навсегда"
- Tertiary: "Восстановить покупки"
- Disabled/prototype helper: "Покупки и рекламная разблокировка будут подключены позже"

Acceptance criteria:

- "Особые архивы" are visible without looking like a promo banner.
- Packs are visually distinguishable without relying on long text.
- The free path is as legible as the purchase path.
- Buying reads as convenience, not pressure.
- Desktop, mobile, and RTL Arabic layouts are readable.
- All required states are represented.

## Prompt 3 - Investigation Services and Department Progression

Design the new investigation service and department progression UI.

This system has two user-facing components:

1. `InvestigationServiceOrder`
2. `DepartmentPlan`

### `InvestigationServiceOrder`

This appears inside a case before the player opens the first evidence card. It should feel like an official "Распоряжение на расследование" ("Investigation Service Order") sheet.

The player may choose one available service or continue without choosing a service. After the first evidence is opened, the sheet disappears.

Services:

- Archive check: shows only the number of contradictions in the case.
- Extra clearance: gives one additional evidence open in a budgeted case.
- Expert opinion: reveals the status of the first selected evidence.

Important behavior:

- Services help planning but must not directly reveal the verdict.
- A service can be selected only before the first evidence open.
- Only one service can be selected.
- Some services can be locked, unaffordable, discounted, free for the day, or not applicable.

Service states to design:

- Locked: department level 0.
- Available.
- Selected.
- Unaffordable: not enough balance.
- Not applicable: for example extra clearance on a non-budgeted case.
- Discounted: 20% discount at department level 2.
- Free daily: one free use per server day at department level 3.

Desired tone:

- Official, practical, and calm.
- Looks like a pre-investigation authorization form.
- No "power-up", RPG skill, or booster-shop styling.

### `DepartmentPlan`

This appears in the right sidebar as "План отдела" ("Department Plan").

Departments:

- Archive.
- Field / clearance.
- Laboratory.

Each department has levels 0-3:

- Level 1 unlocks its service.
- Level 2 gives a 20% service discount.
- Level 3 gives one free service call per server day.

Design each department row/card with:

- Department name.
- Current level: `0/3`, `1/3`, `2/3`, `3/3`.
- Next effect.
- Upgrade cost.
- Disabled state when balance is insufficient.
- Max level state.

Costs currently used by the game:

- Archive: 10,000 / 30,000 / 60,000.
- Field: 15,000 / 40,000 / 80,000.
- Laboratory: 25,000 / 60,000 / 120,000.

The component should feel like official budget planning or department development paperwork, not a monetized upgrade shop.

Acceptance criteria:

- The player understands when to choose a service.
- The player understands why a service is locked or disabled.
- The department upgrade path is readable at a glance.
- The UI remains compact enough for the right sidebar.
- No noisy game progression aesthetics.

## Prompt 4 - Developer handoff

After the design, provide an implementation handoff for React + Tailwind + Framer Motion.

Include:

- Component tree.
- Props for `SpecialArchivesEntry`.
- Props for `ThematicPacksModal`.
- Props for `InvestigationServiceOrder`.
- Props for `DepartmentPlan`.
- State machine for archive packs:
  - `preview`
  - `free_available`
  - `ad_available`
  - `ad_in_progress`
  - `ad_success`
  - `ad_error`
  - `ad_limit_used`
  - `purchase_available`
  - `purchase_pending`
  - `purchased`
  - `restored`
  - `completed`
  - `skin_trial_active`
  - `platform_unavailable`
- State machine for investigation services:
  - `locked`
  - `available`
  - `selected`
  - `unaffordable`
  - `discounted`
  - `free_daily`
  - `not_applicable`
- Mobile behavior.
- RTL Arabic behavior.
- Accessibility requirements:
  - `role="dialog"`
  - `aria-modal`
  - close button `aria-label`
  - close on Esc
  - focus trap
  - visible focus states
  - 44px minimum tap targets
  - contrast suitable for age 30-60
- Motion specification:
  - folder hover lift
  - modal fade/slide open
  - calm unlock success animation, such as a seal being removed or a file tab sliding out
  - no confetti, fireworks, shaking, or pressure effects
- List of i18n strings needed for all five languages: `ru`, `en`, `tr`, `ar`, `kk`.
- Acceptance checklist.

The handoff must be directly usable in the existing codebase. Do not require a new component library, new token system, or hardcoded hex colors.
