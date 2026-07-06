# Leonardo — фото-улики (по одному файлу на промпт)

Каждый `NN-<case>-<evId>.txt` — **готовый промпт целиком**. Открой файл, выдели всё (Ctrl+A),
скопируй и вставь в поле **Prompt** в Leonardo. Стиль уже вшит в каждый файл — ничего дописывать
не нужно.

## Как генерировать

1. **Negative Prompt** — одинаковый для всех документальных фото: вставь из `_NEGATIVE.txt` один раз и оставь.
   Для рентгенов (`X1-`, `X2-`) — используй `_NEGATIVE_XRAY.txt`.
2. **Настройки фото-улик (01–40):**
   - Модель: **PhotoReal** или реалистичная (*Leonardo Kino XL*, *Albedo Base XL*). Иллюстративные модели — не использовать.
   - Aspect Ratio: **4:3** (горизонталь) — для всех, включая аэро/дрон (08, 22).
3. **Настройки рентгенов (X1, X2):**
   - Модель: PhotoReal или реалистичная, **guidance high** для чёрного фона.
   - Aspect Ratio: **3:4** или **4:3** — на усмотрение; рентгены, как правило, вертикальные.
4. Открой нужный файл → выдели всё → вставь в **Prompt** → Generate.
5. Сохрани результат по имени из таблицы ниже (`public/evidence/<name>.jpg`).

## Подключение к игре (когда фото готовы)

1. Положи файлы в `public/evidence/` по именам из таблицы.
2. Добавь в схему поле `Evidence.meta.image` (`src/types/index.ts` + `src/data/caseSchema.ts`).
3. Пропиши путь в нужных уликах в `src/data/cases/*.json`.
4. В `PhotoBody` / `XRayBody` (`src/components/StampModal.tsx`) при наличии `meta.image` показывай
   `<img src={asset(meta.image)}>` вместо штриховки/плейсхолдера.

Полный бриф со стилем и обоснованием — `../LEONARDO_EVIDENCE_PHOTOS.md`.

## Соответствие

| Промпт | Сохранить как | Дело · улика | Пометка |
| ------ | ------------- | ------------ | ------- |
| `01-case001-ev-photo.txt` | `public/evidence/case-001-ev-photo.jpg` | case-001 · ev-photo | ⚠️ противоречие |
| `02-case004-ev-photo.txt` | `public/evidence/case-004-ev-photo.jpg` | case-004 · ev-photo | |
| `03-case005-ev-photo.txt` | `public/evidence/case-005-ev-photo.jpg` | case-005 · ev-photo | |
| `04-case007-ev-listing.txt` | `public/evidence/case-007-ev-listing.jpg` | case-007 · ev-listing | ⚠️ противоречие |
| `05-case008-ev-marathon.txt` | `public/evidence/case-008-ev-marathon.jpg` | case-008 · ev-marathon | ⚠️ противоречие |
| `06-case009-ev-scenephotos.txt` | `public/evidence/case-009-ev-scenephotos.jpg` | case-009 · ev-scenephotos | |
| `07-case013-ev-moisture.txt` | `public/evidence/case-013-ev-moisture.jpg` | case-013 · ev-moisture | ⚠️ противоречие |
| `08-case014-ev-aerial.txt` | `public/evidence/case-014-ev-aerial.jpg` | case-014 · ev-aerial | дрон 4:3 |
| `09-case016-ev-photos.txt` | `public/evidence/case-016-ev-photos.jpg` | case-016 · ev-photos | |
| `10-case017-ev-photo.txt` | `public/evidence/case-017-ev-photo.jpg` | case-017 · ev-photo | |
| `11-case019-ev-photo.txt` | `public/evidence/case-019-ev-photo.jpg` | case-019 · ev-photo | |
| `12-case021-ev-debris.txt` | `public/evidence/case-021-ev-debris.jpg` | case-021 · ev-debris | ⚠️ противоречие |
| `13-case022-ev-photo.txt` | `public/evidence/case-022-ev-photo.jpg` | case-022 · ev-photo | |
| `14-case023-ev-atm.txt` | `public/evidence/case-023-ev-atm.jpg` | case-023 · ev-atm | |
| `15-case024-ev-photo.txt` | `public/evidence/case-024-ev-photo.jpg` | case-024 · ev-photo | |
| `16-case025-ev-photo.txt` | `public/evidence/case-025-ev-photo.jpg` | case-025 · ev-photo | |
| `17-case026-ev-photo.txt` | `public/evidence/case-026-ev-photo.jpg` | case-026 · ev-photo | ⚠️ противоречие |
| `18-case027-ev-photo.txt` | `public/evidence/case-027-ev-photo.jpg` | case-027 · ev-photo | |
| `19-case028-ev-photo.txt` | `public/evidence/case-028-ev-photo.jpg` | case-028 · ev-photo | |
| `20-case029-ev-photo.txt` | `public/evidence/case-029-ev-photo.jpg` | case-029 · ev-photo | |
| `21-case030-ev-photo.txt` | `public/evidence/case-030-ev-photo.jpg` | case-030 · ev-photo | |
| `22-case031-ev-photo.txt` | `public/evidence/case-031-ev-photo.jpg` | case-031 · ev-photo | дрон 4:3 |
| `23-case032-ev-photo.txt` | `public/evidence/case-032-ev-photo.jpg` | case-032 · ev-photo | |
| `24-case033-ev-photo.txt` | `public/evidence/case-033-ev-photo.jpg` | case-033 · ev-photo | |
| `25-case104daily-ev-photos.txt` | `public/evidence/case-104-daily-ev-photos.jpg` | case-104-daily · ev-photos | |
| `26-case105daily-ev-photo.txt` | `public/evidence/case-105-daily-ev-photo.jpg` | case-105-daily · ev-photo | |
| `29-case040-photo-hangar.txt` | `public/evidence/case-040-photo-hangar.jpg` | case-040 · photo-hangar | архив |
| `30-case041-crash-photo.txt` | `public/evidence/case-041-crash-photo.jpg` | case-041 · crash-photo | архив |
| `31-case042-display-photo.txt` | `public/evidence/case-042-display-photo.jpg` | case-042 · display-photo | архив |
| `32-case043-cache-photo.txt` | `public/evidence/case-043-cache-photo.jpg` | case-043 · cache-photo | архив |
| `33-case044-photo-44.txt` | `public/evidence/case-044-photo-44.jpg` | case-044 · photo-44 | архив ⚠️ противоречие |
| `34-case045-photo-45.txt` | `public/evidence/case-045-photo-45.jpg` | case-045 · photo-45 | архив ⚠️ противоречие |
| `35-case046-photo-46.txt` | `public/evidence/case-046-photo-46.jpg` | case-046 · photo-46 | архив ⚠️ противоречие |
| `36-case047-photo-47.txt` | `public/evidence/case-047-photo-47.jpg` | case-047 · photo-47 | архив ⚠️ противоречие |
| `37-case048-photo-48.txt` | `public/evidence/case-048-photo-48.jpg` | case-048 · photo-48 | архив ⚠️ противоречие |
| `38-case049-photo-49.txt` | `public/evidence/case-049-photo-49.jpg` | case-049 · photo-49 | архив ⚠️ противоречие |
| `39-case050-photo-50.txt` | `public/evidence/case-050-photo-50.jpg` | case-050 · photo-50 | архив ⚠️ противоречие |
| `40-case051-photo-51.txt` | `public/evidence/case-051-photo-51.jpg` | case-051 · photo-51 | архив ⚠️ противоречие |
| `X1-case003-ev-xray.txt` | `public/evidence/case-003-ev-xray.jpg` | case-003 · ev-xray | рентген ⚠️ противоречие |
| `X2-case033-ev-xray.txt` | `public/evidence/case-033-ev-xray.jpg` | case-033 · ev-xray | рентген |
