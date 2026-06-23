# Leonardo — портреты клиентов (фото-ID для бланка заявления)

ТЗ для генерации **портретов всех персонажей** в Leonardo.ai. Проект — «Где ложь? Симулятор
детектива» для Yandex Games. Портрет показывается как **«паспортное фото в архиве»** в шапке
бланка заявления клиента (`CaseFile.tsx`): на экране ≈ **58×72 px**, вертикальный кадроформат,
`object-cover`, скруглённые углы, тонкая рамка рисуется кодом поверх.

> **Архивный бриф.** Изначально в `public/people/*.svg` лежали абстрактные плейсхолдеры (серый
> силуэт в рамке). Задача была заменить каждого на **уникальный рисованный портрет** (стилизация под
> _Papers, Please_, не фото), чтобы у каждого героя было
> своё лицо. Предыдущая версия этого брифа (слоистая SVG-система из частей) **отменена** —
> идём через растровые портреты из Leonardo.

---

## 1. Референс и тон

- **Главный референс — _Papers, Please_:** казённое архивное фото-удостоверение, восточно-/
  центральноевропейская бюрократия 1970-х, человек снят анфас «на документ», без позирования.
- **Но без чернухи.** У Lucas Pope кадр мрачный, серо-зелёный, давящий. Нам нужно **теплее и
  достойнее**: тёплая сепия архивной бумаги, мягкий ровный свет, лица читаются спокойно. Не
  угнетающе, не глянцево. Аудитория 30–60, серьёзный тон «папки следователя».
- Эмоция продукта: _«я заметил ложь и разоблачил мошенника»_ — но **на самом портрете нельзя
  «играть злодея»**. Среди клиентов есть и честные, и мошенники; лицо должно быть нейтрально-
  настороженным, обычный человек на приёме у страховой. Никаких ухмылок-злодеев, подмигиваний,
  карикатуры.

**Красные линии (negative):** неон, мультяшность/аниме, 3D-рендер/CGI, sci-fi и игровые
градиенты, глянцевая бьюти-ретушь, студийный гламур, фэнтези, гипер-улыбки, зубы напоказ,
текст/подписи/водяные знаки, современный селфи-вид.

---

## 2. Единый стиль (вставляй в КАЖДЫЙ промпт дословно)

> **STYLE:** stylized illustrated character portrait in the art style of the video game
> *Papers, Please* — a hand-painted semi-realistic digital illustration with visible paint
> texture and soft brush strokes, simplified low-detail features, a slightly grainy retro print
> look, clearly an illustration **NOT a photograph**. Head-and-shoulders, facing the camera,
> plain flat backdrop, framed like a 1970s Eastern-European passport / insurance-archive photo-ID.
> Soft flat even lighting, no hard shadows. Muted, desaturated **warm sepia / toasted-paper
> palette**: background a flat toasted archive-paper tone (#E5D7BD–#D7C6A5), skin natural and
> slightly warm, clothing in muted earth tones — terracotta (#884A28), olive (#5C7A33), ochre
> (#C98A2E), faded slate, cream. **Warmer and softer than the original game — serious but not
> grim or oppressive.** Neutral, calm, slightly wary everyday expression — an ordinary person at
> an insurance office, not a model. Dignified, document-like.
>
> **Negative:** photorealistic, photograph, glossy photo, pixel art, neon, cartoon, anime, chibi,
> 3d render, cgi, sci-fi, glamour, beauty retouch, heavy makeup, big toothy smile, fantasy, text,
> caption, watermark, logo, frame, border, oversaturated, fisheye, oppressive dark mood.

**Параметры Leonardo (ориентир):**
- **Aspect ratio `4:5`** (вертикаль; кадрируется до 58×72). Можно `832×1040` / `768×960`.
- Стиль — **стилизованная иллюстрация в духе _Papers, Please_** (рисованный портрет, не фото).
  Иллюстративная модель (*Leonardo Phoenix* / *Illustrative*), **PhotoReal выключен**. По
  возможности — кадр из _Papers, Please_ как Image Guidance / Style Reference.
- Голова и плечи в кадре, лицо по центру верхней трети (как на документе), смотрит в объектив.
- Фон — однотонный, без сцен и предметов.

---

## 3. Имена файлов

Сохраняй как `public/people/<name>.webp`. После генерации укажи этот путь в делах:
`personImage: "people/igor.webp"` (грепни `personImage`
по `src/data/cases/`). `object-cover` сам обрежет под рамку, дополнительная вёрстка не нужна.

> **Важно — один файл = несколько дел.** Часть портретов переиспользуется в разных делах под
> разными фамилиями и возрастами (помечено ниже «↻»). Лицо должно правдоподобно подходить под
> весь диапазон возрастов — поэтому в ТЗ указан **усреднённый возраст**. Если захочешь развести
> совсем разные образы (напр. Болат 53 и 41) — заведи второй файл и поправь `personImage` в том деле.

---

## 4. Стандартная кампания

Регион/этнотип взят из имени и фамилии — он должен читаться в лице. Профессия/контекст — из
истории дела, чтобы герой выглядел «своим».

**igor** · Igor Semyonov, 41 · РФ · *затопленная квартира, погибла электроника*
> A 41-year-old Russian man, ordinary city renter, oval face, short thinning dark-brown hair,
> light stubble, tired eyes, plain grey-olive collared shirt. Slightly resigned everyday look. + STYLE

**gennady** ↻ · Gennady (Bublikov 52 / Orlov 49) · РФ · *собака съела часы / оператор пресса, травма руки*
> A ~50-year-old Russian working-class man, broad heavy face, short grey-flecked hair, bushy
> brows, deep nasolabial lines, weathered skin, plain dark-blue work shirt. Stolid, guarded. + STYLE

**aigul** ↻ · Aigul (Nurlanova 47 / Saparova 36) · Казахстан, село · *корова на крыше / град*
> A ~42-year-old Kazakh rural woman, round sun-weathered face, dark almond eyes, dark hair pulled
> back under a simple muted-ochre headscarf, no makeup, faded earth-tone blouse. Calm, plain. + STYLE

**stas** · Stas Grom, 24 · РФ · *геймер, ноутбук «разбил полтергейст»*
> A 24-year-old Russian young man, narrow face, messy mid-length dark hair, faint patchy stubble,
> dark-olive hoodie. Slightly cocky, defensive look, pale skin from indoor life. + STYLE

**eduard** ↻ · Eduard (Vinogradov 59 / Kravets 50) · РФ · *коллекция вина / краденые часы*
> A ~55-year-old affluent Russian man, well-groomed, full head of greying hair combed back,
> trimmed grey beard, thin rectangular reading glasses, terracotta-brown jacket over a shirt.
> Composed, slightly self-important. + STYLE

**lucas** · Lucas Ferreira · Бразилия/Португалия · *авиакомпания потеряла чемодан*
> A ~35-year-old Brazilian man, warm tan skin, short dark wavy hair, light stubble, easy-going
> but tired expression, plain cream short-sleeve shirt. + STYLE

**dejan** ↻ · Dejan (Kovac / Markovic 44) · Балканы (серб/хорват) · *травма спины / ДТП*
> A ~44-year-old Balkan man, square rugged jaw, short cropped dark hair greying at temples,
> stubble, heavy brow, faded olive work jacket. Stoic, slightly sceptical. + STYLE

**helena** ↻ · Helena (Brandt / Krause 39) · Германия · *пожар на кухне / удар молнии*
> A 39-year-old German woman, tidy shoulder-length light-brown hair, fair skin, light freckles,
> minimal makeup, muted slate-blue blouse. Composed, slightly anxious. + STYLE

**mateus** · Mateus Ferreira · Бразилия · *ДТП, хлыстовая травма шеи*
> A ~32-year-old Brazilian man, dark curly short hair, warm brown skin, clean-shaven round face,
> plain ochre-brown t-shirt. Mild, a bit evasive. (Visibly different from `lucas`.) + STYLE

**beatrice** · Beatrice Kohler · Германия/Швейцария · *кража ювелирки*
> A ~55-year-old elegant European woman, silver-grey hair set neatly, fine wrinkles, refined
> features, single string of pearls, cream-and-terracotta blouse. Dignified, reserved. + STYLE

**helga** · Helga Novak · Германия/Австрия · *онкология, химиотерапия (честный, сочувственный кейс)*
> A ~50-year-old European woman during chemotherapy, gentle tired face, very short thin hair or
> a soft muted headscarf, pale skin, kind sincere eyes, simple olive cardigan. Quiet dignity,
> not pitiful, treated with respect. + STYLE

**timur** ↻ · Timur (Ashirov 29 / Rasulov 52) · Татарстан/Центр. Азия · *телефон в озере / угон внедорожника*
> A ~40-year-old Central-Asian / Tatar man, oval face, straight black hair, neat short beard,
> dark almond eyes, plain dark-grey shirt. Even, businesslike. + STYLE

**bolat** ↻ · Bolat Zhumabekov (53 / 41) · Казахстан · *градобой пшеницы / затопленный склад*
> A ~47-year-old Kazakh farmer, broad sun-tanned face, high cheekbones, short black hair greying
> at sides, thick black brows, faded khaki work shirt. Weathered, straightforward. + STYLE

**rustam** ↻ · Rustam (Beketov 47 / Nazarov 38) · Центр. Азия · *затонула яхта / клонировали карту*
> A ~42-year-old Central-Asian man, lean face, black hair, full black moustache, tan skin,
> terracotta-brown casual jacket. Confident, slightly cagey. + STYLE

**leyla** · Leyla Karimova, 38 · Центр. Азия/Азербайджан · *прорвало водопровод, затопило магазин*
> A 38-year-old Central-Asian woman, long dark hair loosely tied, warm olive skin, dark
> expressive eyes, modest gold earrings, muted teal-grey blouse. Tense, businesslike (shop owner). + STYLE

**marina** ↻ · Marina (Gordeeva 34 / Vlasova 38) · РФ · *ДТП / угон авто*
> A ~36-year-old Russian woman, straight dark-blonde shoulder-length hair, fair skin, light
> makeup, muted mustard-ochre blouse, small earrings. Urban, slightly defensive. + STYLE

**lorenzo** ↻ · Lorenzo (Conti 45 / Bianchi) · Италия · *пожар в кафе / кража картины*
> A ~45-year-old Italian man, olive skin, dark hair greying at temples swept back, salt-and-pepper
> stubble, dark expressive eyes, open-collar terracotta shirt. Charismatic but watchful. + STYLE

**damir** ↻ · Damir (Askarov 47 / Saparov) · Казахстан · *сгорел склад / угнали экскаватор*
> A ~47-year-old Central-Asian man, square face, short black hair, trimmed beard, tan weathered
> skin, faded olive-green work jacket (small-business / construction). Solid, reserved. + STYLE

---

## 5. Ежедневные дела

**marina** — см. выше (`case-002-daily`, переиспользуется).

**thibault** · Thibault Ferrand · Франция · *пекарня, «полтергейст» загубил торты*
> A ~40-year-old French man, round friendly face, short brown hair, light stubble, ruddy cheeks
> (a baker), plain cream collared shirt. Earnest, a little flustered. + STYLE

**lorenzo** — см. выше (`case-103-daily`, переиспользуется).

**damir** — см. выше (`case-102-daily`, переиспользуется).

**elmira** · Elmira Jaksybekova · Казахстан, село · *молния сожгла амбар*
> A ~45-year-old Kazakh rural woman, kind weathered round face, dark hair under a soft cream-ochre
> headscarf, dark warm eyes, simple earth-tone dress. Plain, sincere. (Distinct from `aigul`.) + STYLE

**sinead** · Sinead O'Brien · Ирландия · *буря, чужой батут разбил окно*
> A ~40-year-old Irish woman, fair pale skin, wavy auburn-red hair, light freckles, green-grey
> eyes, muted moss-green blouse. Friendly but worried. + STYLE

---

## 6. Квирки-трек (лёгкие пасхалки — тот же стиль, чуть характернее)

Это намеренно эксцентричные персонажи (пародийная нотка), но **рендерим их в той же фото-ID
эстетике** — без отрыва от стиля, иначе сломают единство галереи. Характер передаём чертами,
а не сменой стилистики.

**anatoly** ↻ · Anatoly Stepanovich, 71 · РФ · *эксцентричный пенсионер: «умная» микроволновка, дрон, газонокосилка*
> A 71-year-old Russian pensioner, eccentric inventor type, thin lined face, wild grey hair,
> bushy grey moustache and eyebrows, large old-fashioned thick glasses, knitted olive cardigan.
> Earnest, slightly batty but endearing. + STYLE

**orest** · Orest Shredderov, 48 · РФ · *«вандализм и кража» на металлобазе* (отсылка к Шреддеру)
> A 48-year-old Russian man, stern intimidating scrap-yard boss, hard angular face, shaved head
> or very short hair, heavy jaw, cold grey eyes, dark slate work jacket. Severe, humourless —
> but still a plain document photo, no villain theatrics. + STYLE

**khariton** ↻ · Khariton (Splintovich 69 / Velizhanin 55) · *сэнсэй додзё / склад* (отсылка к Сплинтеру)
> A ~65-year-old wise old martial-arts sensei, narrow lined face, long wispy thin grey beard and
> moustache, calm half-closed eyes, grey topknot or bald crown, muted clay-brown kimono-style
> collar. Serene, dignified, slightly mischievous. + STYLE

---

## 7. Чек перед сдачей

1. Все портреты **в одном свете и одной сепия-палитре** — выложи 24 рядом, галерея смотрится единым архивом.
2. Везде **анфас, голова+плечи, однотонный тёплый фон**, без сцен и предметов.
3. Лица **различимы** между собой (особенно пары одного региона: `lucas`/`mateus`, `aigul`/`elmira`,
   `timur`/`rustam`/`damir`).
4. Никакого текста, рамок, водяных знаков (рамку рисует код).
5. Тон серьёзный, но **не мрачный** — теплее, чем _Papers, Please_.
6. `helga` — достоинство, не жалость.
