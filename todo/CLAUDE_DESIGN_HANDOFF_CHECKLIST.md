# Claude Design handoff checklist

Use this checklist to evaluate Claude Design output before implementation.

## Product fit

- The UI still reads as an investigation folder on a detective's desk.
- The design uses archival objects: folders, forms, labels, stamps, ledgers, seals, dividers.
- The audience assumption is 30-60 years old: readable type, calm hierarchy, large targets.
- The design does not use neon, casino, gacha, fantasy, sci-fi, or arcade visual language.
- The design does not use pressure mechanics: no urgent sale timers, confetti, fireworks, flashing badges, or aggressive discounts.

## Special Archives

- `SpecialArchivesEntry` is visible in the desktop left sidebar after the daily case.
- `SpecialArchivesEntry` is visible in the mobile menu after the daily case.
- The entry looks like a physical archive object, not an ad banner.
- The modal has a clear title, close action, pack list, selected pack detail, case list, skins, stamp, and actions.
- Each pack is visually distinct without depending on long descriptions.
- The free path is clear and not visually weaker than purchase.
- Disabled prototype state is calmly explained.
- The following states are covered:
  - first case free
  - rewarded available
  - rewarded in progress
  - rewarded success
  - rewarded unavailable/error
  - daily rewarded limit used
  - purchase available
  - purchase pending
  - purchase success
  - purchase restored
  - whole pack completed
  - skin trial active
  - platform unavailable

## Investigation Services

- `InvestigationServiceOrder` feels like an official pre-investigation order sheet.
- It is clear that services can be chosen only before opening evidence.
- The three services are distinct:
  - archive check: contradiction count
  - extra clearance: one extra open in budgeted cases
  - expert opinion: status of first selected evidence
- The design does not imply that services reveal the final verdict.
- The following states are covered:
  - locked
  - available
  - selected
  - unaffordable
  - not applicable
  - discounted
  - free daily

## Department Plan

- `DepartmentPlan` works in the right sidebar without feeling cramped.
- The three departments are visible: Archive, Field/Clearance, Laboratory.
- Each department shows level 0-3, next effect, cost, and action.
- Max level and insufficient balance states are clear.
- The presentation feels like budget planning or official department development, not a booster shop.

## Layout

- Desktop layout is complete.
- Mobile layout is complete.
- Mobile tap targets are at least 44px.
- Sticky actions, if used, do not cover content.
- RTL Arabic behavior is specified for entry, modal, detail panel, and service rows.
- Long Arabic, Turkish, and Kazakh text does not overlap neighboring UI.

## Accessibility

- Modals use `role="dialog"` and `aria-modal`.
- Close buttons have accessible labels.
- Esc close behavior is specified.
- Focus trap is specified.
- Focus states are visible.
- Keyboard navigation order is logical.
- Contrast is suitable for older players.

## Implementation handoff

- Component tree is included.
- Props are specified for:
  - `SpecialArchivesEntry`
  - `ThematicPacksModal`
  - `InvestigationServiceOrder`
  - `DepartmentPlan`
- State machines are specified for archive packs and services.
- Tailwind token usage is specified; no new color system is required.
- Motion behavior is specified and remains calm.
- i18n keys are listed for all `ru`, `en`, `tr`, `ar`, `kk`.
- The design can be implemented in the current React + TypeScript + Tailwind + Framer Motion codebase.
