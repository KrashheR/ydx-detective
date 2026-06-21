# Design brief — Layered claimant portraits (photo-ID system)

Бриф для **Claude Design**. Задача — нарисовать **библиотеку SVG-частей**, из которых
портрет каждого клиента собирается слоями по JSON-описанию. Главный принцип:
**никаких координат в JSON** — каждая часть рисуется сразу на своём месте на общем
холсте, а сборка на рантайме = простая стопка слоёв в фиксированном z-порядке.

Проект — «Где ложь? Симулятор детектива» для Yandex Games. Портрет показывается как
«фото из паспорта» в бланке заявления клиента (~58×72 px на экране).

---

## 1. Жёсткие ограничения (красные линии проекта)

Метафора всего продукта — «папка с делом на столе детектива»; портрет — «паспортное
фото в архиве». Аудитория 30–60 лет, **серьёзный тон**.

**Нельзя:** неон, мультяшность, sci-fi/игровые градиенты, объёмные тени, блёстки,
казино-эстетика.

**Стиль обычных клиентов:** плоская приглушённая заливка (как текущие
`public/people/*.svg`) — один-два тона на часть, тонкие контурные линии цветом
`#1F2937` с пониженной opacity (0.4–0.6), без градиентов и теней. Палитра — тёплый
кремовый «архив манилы».

---

## 2. Холст и сетка (ОДИНАКОВЫ для всех частей)

- `viewBox="0 0 120 120"`, width/height 120.
- Рамку фото-ID рисует код поверх — **в частях НЕ дублировать**:
  `<rect x="6" y="6" width="108" height="108" fill="none" stroke="#1f2937" stroke-opacity=".4" stroke-width="3"/>`
- Опорные зоны (лицо центрировано) — выравнивай части строго по ним:

| Часть | Зона на холсте |
| ----- | -------------- |
| Голова/лицо | круг ≈ `cx60 cy46 r24` → лицо y22–y70, x36–x84 |
| Брови | y ≈ 38–40 |
| Глаза | y ≈ 42–46, центры x ≈ 50 и x ≈ 70 |
| Нос | y ≈ 46–54, по центру x60 |
| Рот | y ≈ 56–60 |
| Борода/усы | y ≈ 48–74 (обрамляют рот и подбородок) |
| Очки | поверх глаз, y ≈ 40–48 |
| Головной убор | y ≈ 14–44 (на/над волосами) |
| Плечи/одежда | path от y ≈ 82 вниз, основание y116, ширина x20–x100 |

> Текущие референс-файлы для пропорций: `public/people/igor.svg` (база),
> `public/people/anatoly.svg` и `khariton.svg` (уже с бровями/усами/очками инлайном).

---

## 3. Z-порядок слоёв (снизу вверх)

```
bg → shoulders(одежда) → base(голова+шея+уши, несёт кожу) → hair →
brows → eyes → nose → mouth → facial(борода/усы) → glasses → headwear → accents[]
```

---

## 4. Перекраска через CSS-переменные (это множит разнообразие)

Части используют **CSS-переменные** вместо хардкод-цветов — код подставит их из
палитры дела. Одна «борода» × N оттенков `--hair` = N разных людей.

| Переменная | Что красит |
| ---------- | ---------- |
| `var(--skin)` | кожа (база головы, уши, нос, кисти) |
| `var(--hair)` | волосы И борода/усы и брови |
| `var(--cloth)` | одежда/плечи и тканевые головные уборы |
| `var(--bg)` | фон фото |
| `var(--band)` | (спец) бандана черепашек |

Контуры/линии — фикс `#1F2937` с opacity, **не переменная**. Рисуй части так, чтобы
они читались на любом разумном оттенке (не полагайся на конкретный цвет заливки).

Ориентир-пресеты палитр (для авторов дел):
- skin: `#e6c8a8 #c9a07a #a8794f #f0d8c0 #8a5a36`
- hair: `#2b2b2b #5a4632 #8a8a8a #c9a14a #d9d2c4`
- cloth/bg — приглушённые тёплые тона.

---

## 5. Формат поставки

Один спрайт-файл `public/people/parts.svg`, внутри — по одному `<symbol>` на часть:

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="base-male" viewBox="0 0 120 120"> … геометрия только этого слоя … </symbol>
  <symbol id="hair-short" viewBox="0 0 120 120"> … </symbol>
  <!-- и т.д. -->
</svg>
```

Код рендерит части как `<use href="parts.svg#hair-short"/>`. В каждом `<symbol>` —
**только геометрия своего слоя, на своём месте**, без фона и рамки.

**Id — финальные.** Их использует и JSON дел, и код. Добавлять части можно, молча
переименовывать — нельзя.

---

## 6. Состав библиотеки v1 (расширенный, ~70+ частей)

- **base** (форма головы+шея+уши, тон `--skin`):
  `base-male`, `base-female`, `base-male-round`, `base-female-round`, `base-male-narrow` — (5)
- **hair** (`--hair`):
  `hair-none`, `hair-short`, `hair-side-part`, `hair-buzz`, `hair-bald-fringe`,
  `hair-long`, `hair-bun`, `hair-ponytail`, `hair-curly`, `hair-receding` — (10)
- **brows** (`--hair`): `brows-neutral`, `brows-thick`, `brows-thin`, `brows-raised` — (4)
- **eyes**: `eyes-open`, `eyes-narrow`, `eyes-tired`, `eyes-wide` — (4)
- **nose** (`--skin`): `nose-straight`, `nose-wide`, `nose-small` — (3)
- **mouth**: `mouth-neutral`, `mouth-smile`, `mouth-frown`, `mouth-pressed` — (4)
- **facial** (`--hair`):
  `facial-none`, `facial-stubble`, `facial-mustache`, `facial-goatee`,
  `facial-beard-short`, `facial-beard-full`, `facial-mutton` — (7)
- **glasses**: `glasses-none`, `glasses-round`, `glasses-rect`, `glasses-reading`, `glasses-sun` — (5)
- **headwear** (`--cloth`):
  `headwear-none`, `headwear-flatcap`, `headwear-beanie`, `headwear-fedora`,
  `headwear-hardhat`, `headwear-headscarf`, `headwear-ushanka` — (7)
- **cloth/плечи** (`--cloth`):
  `cloth-tshirt`, `cloth-suit`, `cloth-hoodie`, `cloth-coat`, `cloth-uniform`,
  `cloth-blouse`, `cloth-overalls` — (7)
- **accents** (массив, поверх всего):
  `accent-mole-left`, `accent-scar-brow`, `accent-earring`, `accent-bandage`, `accent-freckles` — (5)

Итого ~61 + добавь по вкусу вариаций hair/cloth и 2–3 этнических тона кожи до 70+.

---

## 7. Спец-трек — отдельные «несерьёзные» дела (TMNT / Шреддер / Анатолий)

**Решение по проекту:** обычные клиенты — строго в фото-ID стиле; а дела с TMNT и
Шреддером оформляются как **явно несерьёзные отдельные дела с собственным ярким
визуалом** — им разрешено отступление от красных линий как намеренной пасхалке.

Поставка — отдельный спрайт `public/people/special.svg`, собирается тем же слоистым
движком (чтобы переиспользовать код):

- **base**: `base-turtle`, `base-shredder`, `base-anatoly`.
- Черепашки различаются только **цветом банданы** `--band` + accent-оружием:
  `accent-katana`, `accent-sai`, `accent-bo`, `accent-nunchaku` (Лео/Раф/Донни/Микки).
- Shredder: шлем-база + лезвия (headwear/accents).
- Палитры спец-дел могут уходить от кремовой (яркая бандана и т.п.) — это сознательно.

---

## 8. Чек выравнивания перед сдачей (главная причина брака)

Собери 5–6 тестовых лиц и проверь, что слои **совпадают по сетке**:
1. мужское лицо: `base-male` + `hair-short` + `glasses-round` + `facial-beard-full` + `headwear-flatcap` + `cloth-suit`;
2. женское: `base-female` + `hair-long` + `accent-earring` + `cloth-blouse`;
3. лысое: `base-male-round` + `hair-bald-fringe` + `facial-mustache`;
4. черепашка: `base-turtle` + бандана `--band` + `accent-katana`;
5. Шреддер.

Очки должны лежать на глазах, борода — вокруг рта, шапка — на макушке, плечи — не
залезать на лицо. Проверь читаемость каждой части на 2–3 разных оттенках её
CSS-переменной.

---

## Приложение — пример JSON-описания портрета в деле

Для справки (так это будет задаваться в `src/data/cases/*.json`):

```jsonc
"portrait": {
  "palette": { "skin": "#c9a07a", "hair": "#3a3024", "cloth": "#445566", "bg": "#d8d2c4" },
  "base": "male",
  "hair": "short",
  "brows": "thick",
  "eyes": "open",
  "nose": "straight",
  "mouth": "neutral",
  "facial": "beard-full",
  "glasses": "round",
  "headwear": "flatcap",
  "accents": ["mole-left"]
}
```
