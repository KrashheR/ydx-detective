# Карточка клиента (ЗАЯВЛЕНИЕ КЛИЕНТА) — обновлённый дизайн

Задача для Claude Code: переверстать блок «ID клиента» в шапке заявления и добавить новые
поля метаданных, которые приходят из JSON дела. Эталон уже свёрстан в `ClaimGame.dc.html`
(десктоп — блок внутри `isInvest`, мобайл — внутри `isTabStatement`). Перенеси этот же
паттерн в свой код.

---

## Что меняется

1. **Фото больше.** Раньше был полосатый placeholder 58×72 (desktop) / 52×64 (mobile).
   Теперь — реальный портрет, ширина **124px** (desktop) / **104px** (mobile),
   соотношение сторон `1 / 1.2` (паспортный кроп), `object-fit:cover; object-position:center top`.
2. **Убрано дублирование уровня сложности.** Сложность показывается в шапке дела/в списке,
   на карточке заявления её больше нет.
3. **Вместо двух чипов (полис / документ) — таблица метаданных** из JSON: ключ→значение,
   рендерится циклом. Любое число строк.

---

## JSON-схема дела (новые поля)

Добавь в объект дела секцию `client`:

```jsonc
{
  "id": "2026-0314",
  "difficulty": "Лёгкое",        // живёт на уровне дела, на карточке НЕ дублируется
  "client": {
    "name": "Аркадий Воронцов",
    "role": "Заявитель · физ. лицо",
    "photo": "public/people/voroncov.webp",   // путь к портрету
    "meta": [                                  // произвольный список строк
      { "k": "Возраст",  "v": "47 лет" },
      { "k": "Город",    "v": "Москва" },
      { "k": "Клиент с", "v": "2019 г." },
      { "k": "Полис",    "v": "КАСКО · ВС-884127" },
      { "k": "Документ", "v": "Паспорт 45 12 №667214" }
    ]
  },
  "claimTitle": "Возмещение по КАСКО · угон ТС",
  "claimSum": "1 850 000 ₽",
  "narrative": "14 марта около 23:30 я припарковал автомобиль…"
}
```

`meta` — массив, а не фикс-поля: можно добавлять/убирать строки на дело (стаж вождения,
кол-во прошлых обращений, регион полиса и т.д.) без правки вёрстки.

---

## Разметка (desktop, эталон)

```html
<div style="display:flex; gap:18px; align-items:flex-start;">
  <!-- фото -->
  <div style="width:124px; flex:none;">
    <div style="border-radius:4px; overflow:hidden; border:1px solid #b8b1a0;
                box-shadow:0 3px 9px rgba(0,0,0,.2); background:#d8d3c7;">
      <img src="public/people/voroncov.webp" alt=""
           style="width:100%; aspect-ratio:1/1.2; object-fit:cover;
                  object-position:center top; display:block;
                  filter:saturate(.9) contrast(.97);">
    </div>
    <div style="font:500 8px 'IBM Plex Mono'; letter-spacing:1.5px;
                color:#8a8472; text-align:center; margin-top:5px;">ФОТО · ID</div>
  </div>

  <!-- имя + мета -->
  <div style="flex:1; min-width:0;">
    <div style="font:600 20px 'IBM Plex Serif'; color:#1f2937; line-height:1.15;">{name}</div>
    <div style="font:500 12px 'Inter'; color:#6b7280; margin-top:3px;">{role}</div>

    <div style="display:grid; grid-template-columns:auto 1fr; gap:6px 16px; margin-top:14px;">
      <!-- по строке meta[]: -->
      <div style="font:500 11px 'Inter'; color:#9ca3af; white-space:nowrap;">{k}</div>
      <div style="font:600 11px 'IBM Plex Mono'; color:#374151;">{v}</div>
    </div>
  </div>
</div>
```

**Mobile-отличия:** фото `width:104px`; имя `18px`; лейбл фото `7px`; сетка меты
`gap:5px 12px`, ключ `10px`, значение `10px`.

---

## Токены (из SEPIA-1970-palette.md, не выдумывай)

| Что | Значение |
|---|---|
| Имя клиента | IBM Plex Serif 600, `#1f2937` |
| Роль / подпись | Inter 500, `#6b7280` |
| Ключ меты | Inter 500, `#9ca3af` |
| Значение меты | IBM Plex Mono 600, `#374151` |
| Рамка фото | `1px solid #b8b1a0`, фон `#d8d3c7` |
| Лейбл «ФОТО · ID» | IBM Plex Mono 500, `#8a8472`, letter-spacing 1.5px |

Фото слегка приглушаем под сепийный стол: `filter:saturate(.9) contrast(.97)`.

---

## Чек-лист

- [ ] Добавить `client.{name,role,photo,meta[]}` в данные каждого дела.
- [ ] Удалить со страницы заявления поля сложности и старые чипы полис/документ.
- [ ] Фото 124/104px, ratio 1:1.2, реальный портрет, фолбэк-фон `#d8d3c7`.
- [ ] Мета рендерится циклом по `meta[]` (grid `auto 1fr`), работает на любом числе строк.
- [ ] Портреты лежат в `public/people/<slug>.webp`, паспортный кроп (лицо в верхней трети).
