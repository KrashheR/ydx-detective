# English Localization Report

Status: **PASS**

- Cases localized: **50/50**
- Localized string objects with paired `ru` / `en`: **1932**
- Localized array objects with paired `ru` / `en`: **101**
- English sidecars added inside interactive data: **55**
- Per-case JSON files synchronized with the aggregate: **50/50**
- WebP assets retained: **110**
- Missing English values: **0**
- Cyrillic characters inside English localization fields: **0**

## Localization conventions

- Neutral international English for browser-game audiences.
- Concise UI-friendly wording, while preserving the investigative logic and tone.
- Proper names are consistently transliterated; recurring organizations and story terms keep one canonical English name.
- Stable IDs, evidence types, codes (including 17-K, GC-17, and B-17), values, times, and asset paths are unchanged.

## Integration entry points

- Preferred aggregate: `00_MASTER/ALL_CASES_1_50_RU_EN.json`.
- Backward-compatible aggregate: `00_MASTER/ALL_CASES_1_50_RU.json` now contains the same paired localization fields.
- Individual cases: `cases/*/case.rewrite.json`.
- Interactive UI strings: `00_MASTER/INTERACTIVE_UI_STRINGS.json` already includes English.
- Raw strings nested inside interactive mechanics expose explicit `*En` sidecars documented in the root README.
