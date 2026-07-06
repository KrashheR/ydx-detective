# Leonardo — портреты клиентов (по одному файлу на промпт)

Каждый `NN-<имя>.txt` — **готовый промпт целиком**. Открой файл, выдели всё (Cmd+A),
скопируй и вставь в поле **Prompt** в Leonardo. Стиль уже вшит в каждый файл — ничего
дописывать не нужно.

## Как генерировать

1. **Negative Prompt** (одинаковый для всех) — один раз вставь из `_NEGATIVE.txt` и оставь.
2. Настройки: **Aspect Ratio 4:5** (вертикаль). Стиль — **стилизованная иллюстрация в духе
   _Papers, Please_** (рисованный портрет, не фото). Бери иллюстративную модель (*Leonardo
   Phoenix* / *Illustrative* / *Anime XL* с низким стилем), **PhotoReal выключи**. Можно
   приложить кадр из Papers, Please как Image Guidance / Style Reference для попадания в стиль.
3. Открой нужный `NN-<имя>.txt` → выдели всё → вставь в **Prompt** → Generate.
4. Сохрани результат под именем из колонки «Файл» (напр. `public/people/igor.jpg`).

## Подключение к игре

После генерации сохрани портрет как `public/people/<имя>.webp`: грепни `personImage` по
`src/data/cases/` и укажи соответствующий путь (например, `people/igor.webp`).
`object-cover` в `CaseFile.tsx` сам обрежет фото под рамку — больше ничего не нужно.

**Статус.** Подключены (`.webp`): igor, gennady, aigul, stas, eduard, lucas, dejan, mateus,
beatrice, helga. Остальные пока на `.svg`-заглушках (ближайший — **helena**, промпт `08-helena.txt`).

> **↻ Один файл — несколько дел.** Где в колонке «Дела» больше одной записи, портрет
> переиспользуется под разными фамилиями/возрастами; возраст в промпте взят усреднённый.
> Хочешь развести образы — сгенерируй второй файл и поправь `personImage` в нужном деле.

Полный бриф со стилем и обоснованием — `../DESIGN_PROMPT_PORTRAITS.md`.

## Соответствие

| Промпт | Файл (сохранить как) | Дела |
| ------ | -------------------- | ---- |
| `01-igor.txt` | `public/people/igor.jpg` | case-001 |
| `02-gennady.txt` | `public/people/gennady.jpg` | case-003, case-033 |
| `03-aigul.txt` | `public/people/aigul.jpg` | case-004, case-031 |
| `04-stas.txt` | `public/people/stas.jpg` | case-005 |
| `05-eduard.txt` | `public/people/eduard.jpg` | case-006, case-026 |
| `06-lucas.txt` | `public/people/lucas.jpg` | case-007 |
| `07-dejan.txt` | `public/people/dejan.jpg` | case-008, case-030 |
| `08-helena.txt` | `public/people/helena.jpg` | case-009, case-029 |
| `09-mateus.txt` | `public/people/mateus.jpg` | case-010 |
| `10-beatrice.txt` | `public/people/beatrice.jpg` | case-011 |
| `11-helga.txt` | `public/people/helga.jpg` | case-012 |
| `12-timur.txt` | `public/people/timur.jpg` | case-013, case-032 |
| `13-bolat.txt` | `public/people/bolat.jpg` | case-014, case-027 |
| `14-rustam.txt` | `public/people/rustam.jpg` | case-015, case-023 |
| `15-leyla.txt` | `public/people/leyla.jpg` | case-016 |
| `16-marina.txt` | `public/people/marina.jpg` | case-024, case-002-daily |
| `17-lorenzo.txt` | `public/people/lorenzo.jpg` | case-025, case-103-daily |
| `18-damir.txt` | `public/people/damir.jpg` | case-028, case-102-daily |
| `19-thibault.txt` | `public/people/thibault.jpg` | case-101-daily |
| `20-elmira.txt` | `public/people/elmira.jpg` | case-104-daily |
| `21-sinead.txt` | `public/people/sinead.jpg` | case-105-daily |
| `22-anatoly.txt` | `public/people/anatoly.jpg` | case-017, case-018, case-019 |
| `23-orest.txt` | `public/people/orest.jpg` | case-020 |
| `24-khariton.txt` | `public/people/khariton.jpg` | case-021, case-022, case-034 |
| `31-miron-veil.txt` | `public/people/miron-veil.webp` | case-040 |
| `32-elian-kord.txt` | `public/people/elian-kord.webp` | case-041 |
| `33-selena-orvik.txt` | `public/people/selena-orvik.webp` | case-042 |
| `34-ilar-roun.txt` | `public/people/ilar-roun.webp` | case-043 |
| `35-evelina-morn.txt` | `public/people/evelina-morn.webp` | case-044 |
| `36-bruno-stern.txt` | `public/people/bruno-stern.webp` | case-045 |
| `37-nika-rein.txt` | `public/people/nika-rein.webp` | case-046 |
| `38-adelia-varn.txt` | `public/people/adelia-varn.webp` | case-047 |
| `39-marko-lin.txt` | `public/people/marko-lin.webp` | case-048 |
| `40-herman-kross.txt` | `public/people/herman-kross.webp` | case-049 |
| `41-khariton-sen.txt` | `public/people/khariton-sen.webp` | case-050 |
| `42-roman-dray.txt` | `public/people/roman-dray.webp` | case-051 |
