# First 10 campaign cases - complete Russian source text

> Spoiler-heavy export for AI review of narrative interest, engagement, and retention. Correct decisions and contradiction flags are intentionally exposed.

## Dataset notes

- Source: current JSON case files in `src/data/cases/`.
- Order: actual standard-campaign order, sorted by required level and then case number. This is not numeric case order 001-010.
- Language: every localized source field below uses the `ru` value verbatim.
- The continuity/fan-service notes are editorial observations; story, evidence, status, and metadata fields come from the game data.
- All 10 cases have claimant portraits. None has an `investigationBudget`, so the player can open every evidence card.

## Summary

| Campaign position | ID | Level | Russian title | Claimant | Difficulty | Amount | Truth / decision | Evidence | Contradictions | Evidence types | Fan service / continuity |
|---:|---|---:|---|---|---|---:|---|---:|---:|---|---|
| 1 | `case-001` | 1 | Затопленная квартира | Игорь Семёнов, 41 год | Easy | 1200 EUR | Fraud / Reject | 2 | 2 | Photo, Document | No explicit |
| 2 | `case-009` | 1 | Пожар в доме | Хелена Брандт | Easy | 9000 EUR | Valid claim / Approve | 2 | 0 | Document, Photo | No explicit |
| 3 | `case-013` | 2 | Утонувший смартфон | Тимур Аширов, 29 лет | Medium | 1100 EUR | Fraud / Reject | 3 | 2 | Photo, Usage log, Document | No explicit |
| 4 | `case-018` | 2 | Дрон-похититель кольца | Анатолий Степанович, 71 год | Hard | 1100 EUR | Valid claim / Approve | 3 | 0 | Camera recording, GPS track, Witness statement | Yes |
| 5 | `case-019` | 3 | Газонокосилка без водителя | Анатолий Степанович, 71 год | Medium | 850 EUR | Valid claim / Approve | 3 | 0 | Document, Photo, Camera recording | Yes |
| 6 | `case-020` | 3 | Пицца-Погром | Орест Шреддеров, 48 лет | Medium | 3500 EUR | Fraud / Reject | 3 | 3 | Camera recording, Document | Yes |
| 7 | `case-021` | 3 | Канализационный Рок | Харитон Сплинтович, 69 лет | Hard | 1900 EUR | Fraud / Reject | 3 | 3 | Photo, Document | Yes |
| 8 | `case-003` | 4 | Пёс-гурман | Геннадий Бубликов, 52 года | Medium | 4000 EUR | Fraud / Reject | 4 | 3 | Photo, Document | No explicit |
| 9 | `case-004` | 4 | Корова на крыше | Айгуль Нурланова, 47 лет | Easy | 1500 EUR | Valid claim / Approve | 4 | 0 | Witness statement, Document, Photo | No explicit |
| 10 | `case-005` | 5 | Полтергейст в прямом эфире | Стас Гром, 24 года | Medium | 2200 EUR | Fraud / Reject | 4 | 2 | Camera recording, Usage log, Photo, Document | No explicit |

Totals: **6 fraud** and **4 valid** claims; **31 evidence cards**; **4 cases** form two visible recurring/fan-service mini-arcs.

## Complete case cards

## 1. Затопленная квартира (`case-001`)

- Campaign position: 1
- Required level: 1
- Data difficulty: Easy (`easy`)
- Claim amount: 1200 EUR
- Evidence count: 2
- Claimant portrait: `people/igor.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)

### Claimant

**Игорь Семёнов, 41 год**

Role (RU): Заявитель · физ. лицо

- Возраст: 41 год
- Город: Москва
- Клиент с: 2018 г.
- Полис: Имущество · ИМ-19873142-X9
- Документ: Паспорт 4521-06 №198731498-23

### Claim text (RU, verbatim)

> Лопнула труба и затопила гостиную, телевизор и техника погибли. Прошу компенсацию за повреждённую электронику.

### Evidence

#### 1. Фото места происшествия

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: filename: IMG_20260314_091402.jpg | imageUrl: evidence/case-001-ev-photo.webp

Evidence text (RU, verbatim):

На фото видна сухая, включённая электроника на полке над лужей воды — индикаторы горят, экран телевизора работает.

Status explanation (RU, verbatim): Заявленная повреждённой техника на фото сухая и включена — ущерб инсценирован.

#### 2. Объявление о продаже

- ID: `ev-listing`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**

Evidence text (RU, verbatim):

Распечатка объявления с доски: тот же телевизор выставлен на продажу как «полностью рабочий, как новый», дата публикации — через два дня после потопа.

Status explanation (RU, verbatim): Клиент продаёт «погибший» телевизор как исправный — техника не пострадала.

### Final explanation shown to player (RU, verbatim)

- На фото техника сухая и включена — ущерб инсценирован.
- Объявление показывает: тот же телевизор продаётся как рабочий.
- Заявление является мошенническим, его следует отклонить.

### Fan service, characters, and continuity

No explicit fan service or recurring character. Standalone domestic case.

## 2. Пожар в доме (`case-009`)

- Campaign position: 2
- Required level: 1
- Data difficulty: Easy (`easy`)
- Claim amount: 9000 EUR
- Evidence count: 2
- Claimant portrait: `people/helena.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)

### Claimant

**Хелена Брандт**

Role (RU): Заявитель · физ. лицо

- Возраст: 44 года
- Город: Берлин
- Клиент с: 2016 г.
- Полис: Имущество · ИМ-99034067-X7
- Документ: Паспорт DE-X9 334455668-82017

### Claim text (RU, verbatim)

> Ночью в моей кухне начался пожар из-за неисправной проводки. Огонь повредил кухню и часть гостиной; прошу возместить расходы на ремонт.

### Evidence

#### 1. Отчёт пожарной службы

- ID: `ev-firereport`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Вызов 22.05.2026 в 02:14. Очаг возгорания — кухонная розетка; причина: короткое замыкание из-за изношенной проводки. Признаков поджога не выявлено.

Status explanation (RU, verbatim): Официальный отчёт прямо подтверждает причину — неисправную проводку — и совпадает с рассказом клиента.

#### 2. Фото с места происшествия

- ID: `ev-scenephotos`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260522_021805.jpg | imageUrl: evidence/case-009-ev-scenephotos.webp

Evidence text (RU, verbatim):

Снимки: обгоревшая стена за кухонной розеткой, расплавленная вытяжка и копоть на потолке гостиной у дверного проёма.

Status explanation (RU, verbatim): Картина повреждений соответствует очагу у розетки и распространению огня к гостиной, как описано.

### Final explanation shown to player (RU, verbatim)

- Отчёт пожарных подтверждает причину — неисправную проводку, без поджога.
- Фото с места согласуются с очагом у розетки и рассказом клиента.
- Противоречий нет — выплату следует одобрить.

### Fan service, characters, and continuity

No explicit fan service or recurring character. Standalone realistic case.

## 3. Утонувший смартфон (`case-013`)

- Campaign position: 3
- Required level: 2
- Data difficulty: Medium (`medium`)
- Claim amount: 1100 EUR
- Evidence count: 3
- Claimant portrait: `people/timur.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)

### Claimant

**Тимур Аширов, 29 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 29 лет
- Город: Ташкент
- Клиент с: 2022 г.
- Полис: Электроника · ЭЛ-13178451-X1
- Документ: Паспорт UZ-X2 31278419-47092

### Claim text (RU, verbatim)

> В субботу утром мой телефон выскользнул из кармана и упал в озеро. Я не смог его достать, он полностью утонул и больше не включается. Прошу возместить стоимость аппарата.

### Evidence

#### 1. Фото из сервисного центра

- ID: `ev-moisture`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: IMG_20260318_145607.jpg | imageUrl: evidence/case-013-ev-moisture.webp

Evidence text (RU, verbatim):

Техник вскрыл корпус и сфотографировал внутренний индикатор влаги: он остался полностью белым.

Status explanation (RU, verbatim): Индикатор влаги краснеет при контакте с водой; белый цвет означает, что телефон никогда не намокал.

#### 2. Журнал активности оператора

- ID: `ev-usage`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: mno@telecom:~$ tail -f /var/log/subscriber.log

Evidence text (RU, verbatim):

- Сб 09:05 — заявленное падение в озеро
- Сб 11:20 — исходящий звонок, 4 мин
- Сб 14:47 — передача данных, 320 МБ
- Сб 18:13 — входящий звонок, 2 мин

Status explanation (RU, verbatim): Тот же телефон совершал звонки и передавал данные часами после заявленного утопления.

#### 3. Чек о покупке телефона

- ID: `ev-receipt`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

Подлинный кассовый чек из магазина электроники на сумму 1100 евро, выданный за год до происшествия.

Status explanation (RU, verbatim): Чек подлинный и лишь подтверждает покупку аппарата, не противореча делу.

### Final explanation shown to player (RU, verbatim)

- Индикатор влаги белый — телефон никогда не контактировал с водой.
- Оператор фиксирует звонки и трафик часами после «утопления».
- Заявление мошенническое, его следует отклонить.

### Fan service, characters, and continuity

No explicit fan service or recurring character. Standalone technology case.

## 4. Дрон-похититель кольца (`case-018`)

- Campaign position: 4
- Required level: 2
- Data difficulty: Hard (`hard`)
- Claim amount: 1100 EUR
- Evidence count: 3
- Claimant portrait: `people/anatoly.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)

### Claimant

**Анатолий Степанович, 71 год**

Role (RU): Заявитель · физ. лицо

- Возраст: 71 год
- Город: Воронеж
- Клиент с: 2012 г.
- Полис: Имущество · ИМ-18223906-X6
- Документ: Паспорт 3609-71 №172128951-83

### Claim text (RU, verbatim)

> Настоящим заявляю о хищении имущества. 22 апреля около 23 часов в открытое окно гостиной влетел высокотехнологичный беспилотный аппарат, снял с моего стола золотое обручальное кольцо и скрылся в ночном направлении. Очевидцев происшествия не имелось. Прошу возместить стоимость кольца как похищенного.

### Evidence

#### 1. Кадр с камеры соседа

- ID: `ev-camera`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **No**
- Visual/service metadata: cameraId: CAM-NB7 | cameraModel: TP-Link Tapo C520WS · 2K · H.264

Evidence text (RU, verbatim):

Чёткий высокоскоростной кадр: дрон набирает высоту, а за его аккумулятор обеими лапами уцепился енот и висит метрах в двух над балконом заявителя. На ноге дрона поблёскивает кольцо.

Status explanation (RU, verbatim): Кадр фиксирует и дрон, и кольцо, и енота — это подтверждает событие, а не опровергает.

#### 2. Полётный журнал дрона

- ID: `ev-gps`
- Type: GPS track (`gps`)
- Contradiction to stamp: **No**
- Visual/service metadata: company: АэроСлед Навигация | department: Центр мониторинга беспилотных аппаратов | requestId: ДРН-2026-0422-К · Тип: Полётный журнал | gpsFooter: © АэроСлед 2026 · GPS ACC: ±2m

Evidence text (RU, verbatim):

- 22:59:40 — Зависание над балконом, высота 4 м
- 23:00:05 — Удержание позиции, 45 сек, дрейф ±0.3 м
- 23:00:25 — Резкий рост массы +1.8 кг, набор высоты
- 23:01:12 — Снижение тяги, посадка во дворе соседа

Status explanation (RU, verbatim): Журнал показывает зависание над балконом ровно 45 секунд и внезапный привес — это вес уцепившегося енота.

#### 3. Показания соседского ребёнка

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

«Я запускал дрон с балкона. Снизу что-то блестящее упало с перил, я подлетел поймать, а оно зацепилось за шасси. Потом на дрон вдруг прыгнул енот, я испугался и посадил аппарат у себя во дворе. Кольцо так и осталось в шасси».

Status explanation (RU, verbatim): Показания ребёнка независимо объясняют, как кольцо оказалось на дроне — без злого умысла.

### Final explanation shown to player (RU, verbatim)

- История о дроне-воре звучит как фантастика, но улики сходятся идеально.
- На самом деле Жорик играл с кольцом на балконе и уронил его; соседский мальчишка на дроне попытался поймать блестяшку — кольцо зацепилось за шасси.
- Затем за дрон ухватился сам Жорик. Кражи не было, событие реально — заявление следует одобрить.

### Fan service, characters, and continuity

Yes. First appearance of Anatoly Stepanovich and the raccoon Zhorik. This begins a two-case recurring-character arc with case-019.

## 5. Газонокосилка без водителя (`case-019`)

- Campaign position: 5
- Required level: 3
- Data difficulty: Medium (`medium`)
- Claim amount: 850 EUR
- Evidence count: 3
- Claimant portrait: `people/anatoly.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)

### Claimant

**Анатолий Степанович, 71 год**

Role (RU): Заявитель · физ. лицо

- Возраст: 71 год
- Город: Воронеж
- Клиент с: 2012 г.
- Полис: Ответственность · ОТ-19234017-X9
- Документ: Паспорт 3609-71 №172128951-83

### Claim text (RU, verbatim)

> Настоящим уведомляю о причинении ущерба транспортному средству. В ночное время мой премиальный садовый трактор-газонокосилка самостоятельно завёлся, выехал на дорогу общего пользования и совершил наезд на мой же припаркованный автомобиль, повредив передний бампер. За рулём косилки никто не находился. Прошу возместить стоимость ремонта.

### Evidence

#### 1. Протокол ГИБДД

- ID: `ev-police`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Из протокола: «Столкновение совершено беспилотным сельскохозяйственным транспортным средством. Водитель на месте происшествия не установлен. Алкоголь и иные участники движения исключены». Время — 03:40.

Status explanation (RU, verbatim): Официальный протокол прямо фиксирует наезд беспилотной техники — это подтверждает заявление.

#### 2. Фото места ДТП

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260509_034208.jpg | imageUrl: evidence/case-019-ev-photo.jpg

Evidence text (RU, verbatim):

Газонокосилка застряла под передним бампером автомобиля. Рулевое колесо и сиденье косилки сплошь покрыты грязными отпечатками маленьких лап. Рядом — осыпавшаяся слива.

Status explanation (RU, verbatim): Следы лап на руле и слива рядом объясняют, что косилку привело в движение животное.

#### 3. Запись дворовой камеры

- ID: `ev-camera`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **No**
- Visual/service metadata: cameraId: CAM-YD2 | cameraModel: Imou Cruiser 2 · 4K · H.265

Evidence text (RU, verbatim):

Ночная запись: енот забирается на косилку под сливовым деревом, тянется к ветке и задевает рычаг передачи. Машина дёргается вперёд, енот кубарем падает, а косилка катится со двора на дорогу и упирается в бампер автомобиля.

Status explanation (RU, verbatim): Запись по кадрам показывает причину: енот случайно включил передачу. Полностью согласуется с делом.

### Final explanation shown to player (RU, verbatim)

- Самоходная газонокосилка звучит как выдумка, но протокол, фото и видео сходятся.
- На самом деле Жорик залез на косилку, чтобы дотянуться до сливы, случайно сдвинул рычаг передачи и свалился.
- Машина без водителя выкатилась на дорогу и врезалась в бампер. Противоречий нет — заявление подлинное, одобряем.

### Fan service, characters, and continuity

Yes. Anatoly Stepanovich and Zhorik return immediately after case-018, forming a recognizable comic duo.

## 6. Пицца-Погром (`case-020`)

- Campaign position: 6
- Required level: 3
- Data difficulty: Medium (`medium`)
- Claim amount: 3500 EUR
- Evidence count: 3
- Claimant portrait: `people/orest.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)

### Claimant

**Орест Шреддеров, 48 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 48 лет
- Город: Екатеринбург
- Клиент с: 2017 г.
- Полис: Имущество · ИМ-20245128-X2
- Документ: Паспорт 6515-34 №202451280-94

### Claim text (RU, verbatim)

> Заявляю о вопиющем акте вандализма и коммерческой кражи. В 02:00 группа малолетних хулиганов из подвальной секции карате «Ниндзя» разбила витрину моего премиального фреш-бара сети «КЛАН ФУТ» и похитила 40 семейных пицц пепперони, заготовленных для корпоративного банкета. Требую возмещения ущерба в полном объёме и настаиваю на закрытии этой рассадницы преступности.

### Evidence

#### 1. Запись камеры фреш-бара

- ID: `ev-cctv`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: cameraId: CAM-FC1 | cameraModel: Hikvision DS-2CD2087G2-LU · 4K · H.265

Evidence text (RU, verbatim):

- 02:04:58 · Фигура в маске-бандане ОРАНЖЕВОГО цвета у разбитой витрины
- 02:05:12 · На запястьях фигуры блестят серебряные запонки и дорогие часы
- 02:05:40 · Фигура выносит стопку коробок с пиццей и садится в чёрный внедорожник

Status explanation (RU, verbatim): Подросток из подвальной секции не носит серебряные запонки и дорогие часы — это приметы самого Шреддерова. «Взлом» инсценирован.

#### 2. Чек доставки пиццы

- ID: `ev-receipt`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: docHeader: Мега-Пицца Экспресс · электронный чек · оплата подтверждена

Evidence text (RU, verbatim):

- Мега-Пицца Экспресс · электронный чек № MP-77431
- Заказ: пицца «Пепперони», семейная — 40 шт.
- Оплачено: 01:50, личной картой (Микеле, ученик секции «Ниндзя», оранжевая маска)
- Адрес доставки: ул. Подвальная, 4 — додзё «Ниндзя» (НЕ фреш-бар «КЛАН ФУТ»)
- Статус: доставлено 02:08, получено лично

Status explanation (RU, verbatim): 40 пицц были легально куплены учеником в 01:50 и доставлены в додзё — их не похищали из бара.

#### 3. Справка приёмного отделения

- ID: `ev-medical`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**

Evidence text (RU, verbatim):

- Городская клиника · приёмное отделение
- Пациент: Микеле, 16 лет, ученик секции «Ниндзя» (маска оранжевая)
- Поступил: 02:00. Диагноз: острый гастрит, переедание (≈12 кусков пиццы)
- Под наблюдением капельницы до утра, передвижение исключено

Status explanation (RU, verbatim): Ученик в оранжевой маске с 02:00 лежит в приёмном — он физически не мог быть «грабителем» в 02:05.

### Final explanation shown to player (RU, verbatim)

- Это пародия на «Черепашек-ниндзя»: Шреддеров и его «КЛАН ФУТ» (Foot Clan) подставляют учеников Сплинтовича.
- Оранжевая маска — это Микеле, но в 01:50 он сам купил и заказал 40 пицц в додзё, а в 02:00 уже лежал в приёмном с перееданием.
- «Грабитель» на камере носит серебряные запонки Шреддерова — он инсценировал взлом сам. Это мошенничество, заявление отклоняем.

### Fan service, characters, and continuity

Yes. Explicit Teenage Mutant Ninja Turtles parody: Shredderov, KLAN FUT / Foot Clan, Splintovich, Michele, and the orange mask. Begins a paired mini-arc with case-021.

## 7. Канализационный Рок (`case-021`)

- Campaign position: 7
- Required level: 3
- Data difficulty: Hard (`hard`)
- Claim amount: 1900 EUR
- Evidence count: 3
- Claimant portrait: `people/khariton.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)

### Claimant

**Харитон Сплинтович, 69 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 69 лет
- Город: Нижний Новгород
- Клиент с: 2008 г.
- Полис: Имущество · ИМ-21256239-X5
- Документ: Паспорт 2207-69 №212562391-05

### Claim text (RU, verbatim)

> Со смирением и скорбью извещаю о форс-мажоре. Городская канализационная труба под моим додзё самопроизвольно воспламенилась и затопила помещение, уничтожив тренировочный инвентарь, татами и исторические японские знамёна, передававшиеся из поколения в поколение. Полагаю это аварией муниципальной инфраструктуры и прошу возместить ущерб согласно полису.

### Evidence

#### 1. Фото затопленного подвала

- ID: `ev-debris`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: IMG_20260618_233117.jpg | imageUrl: evidence/case-021-ev-debris.jpg

Evidence text (RU, verbatim):

Среди размокших татами лежит огромное моторизованное колесо, выкрашенное ФИОЛЕТОВОЙ краской. Рядом — чертёж с подписью «Пати-Вагон» и фиолетовым оттиском печати. Городской трубы в кадре не видно — труба пробита изнутри.

Status explanation (RU, verbatim): Разрушения вызваны самодельным моторным «вагоном» с фиолетовой краской, а не аварией городской трубы.

#### 2. Распечатка переписки

- ID: `ev-chat`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: docHeader: Экспорт переписки из мессенджера · стр. 1/1

Evidence text (RU, verbatim):

- [22:15] Донато (фиолетовая маска): Сэнсэй, нитро-двигатель на «вагоне» нестабилен — трясёт всю трубу под нами.
- [22:18] Х. Сплинтович: Не ищи лёгких путей, сын мой. Сосредоточься на ката. И НЕ ТРОГАЙ главный вентиль.
- [22:19] Донато (фиолетовая маска): Уже тронул. Кажется, искрит…

Status explanation (RU, verbatim): Тренер знал, что самодельный двигатель трясёт трубу, и предупреждал про вентиль — это не самовозгорание городской сети, а он покрывает ученика.

#### 3. Чек хозяйственного магазина

- ID: `ev-invoice`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`

Evidence text (RU, verbatim):

- Хозмаг «Всё для мастера» · товарный чек
- Покупатель: секция карате «Ниндзя» (Х. Сплинтович)
- Дата: за 3 часа до взрыва
- Проволока сварочная промышленная — 50 м
- Баллон метан-пропеллант топливный — 4 шт.

Status explanation (RU, verbatim): Само додзё за 3 часа до взрыва купило сварочную проволоку и 4 баллона метана — это и есть газ, который взорвался. Ущерб самопричинён.

### Final explanation shown to player (RU, verbatim)

- Это отсылка к «Черепашкам-ниндзя»: Донато (фиолетовый) = Донателло, гений-механик, строил в подвале «Пати-Вагон».
- Труба не загорелась сама: ученик в фиолетовой маске пробил газовую линию самодельным нитро-картом — это подтверждают колесо, чертёж и чек на метан и проволоку.
- Из переписки видно: Сплинтович знал про двигатель и вентиль и теперь покрывает ученика, выдавая аварию за форс-мажор. Это мошенничество, отклоняем.

### Fan service, characters, and continuity

Yes. Continues the parody arc with Splintovich, Donato, the purple mask, and the Party Wagon.

## 8. Пёс-гурман (`case-003`)

- Campaign position: 8
- Required level: 4
- Data difficulty: Medium (`medium`)
- Claim amount: 4000 EUR
- Evidence count: 4
- Claimant portrait: `people/gennady.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)

### Claimant

**Геннадий Бубликов, 52 года**

Role (RU): Заявитель · физ. лицо

- Возраст: 52 года
- Город: Саратов
- Клиент с: 2015 г.
- Полис: Дом. животные · ЖИ-33071249-X2
- Документ: Паспорт 6311-87 №330712849-31

### Claim text (RU, verbatim)

> Мой французский бульдог Барон проглотил мои швейцарские часы за 4000 €. Ветеринар сделал снимок. Прошу компенсацию за бесценную семейную реликвию.

### Evidence

#### 1. Рентген собаки

- ID: `ev-xray`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: filename: IMG_20260320_113015.jpg | imageUrl: evidence/case-003-ev-xray.webp

Evidence text (RU, verbatim):

На снимке в желудке пса видны теннисный мяч и один носок. Часов нет.

Status explanation (RU, verbatim): Если бы пёс съел часы, они были бы видны на снимке — но их там нет.

#### 2. Объявление о продаже

- ID: `ev-listing`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**

Evidence text (RU, verbatim):

Объявление о продаже точно таких же часов от продавца «Хозяин Барона», размещено через два дня после «происшествия».

Status explanation (RU, verbatim): Часы, якобы съеденные собакой, выставлены на продажу самим заявителем.

#### 3. Чек на часы

- ID: `ev-receipt`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**

Evidence text (RU, verbatim):

Чек показывает, что «швейцарские часы» — это сувенирная реплика за 29 € из пляжного киоска.

Status explanation (RU, verbatim): Заявленная стоимость 4000 € не соответствует чеку на 29 €.

#### 4. Счёт ветеринара

- ID: `ev-vetbill`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Официальный счёт за осмотр собаки. Барон здоров, аппетит отличный.

Status explanation (RU, verbatim): Счёт подлинный, пёс действительно был на осмотре — противоречия нет.

### Final explanation shown to player (RU, verbatim)

- На рентгене часов в собаке нет.
- Те же часы заявитель выставил на продажу.
- Это сувенир за 29 €, а не реликвия за 4000 €. Заявление мошенническое — отклонить.

### Fan service, characters, and continuity

No explicit pop-culture fan service or recurring arc. The bulldog Baron is a memorable one-case character.

## 9. Корова на крыше (`case-004`)

- Campaign position: 9
- Required level: 4
- Data difficulty: Easy (`easy`)
- Claim amount: 1500 EUR
- Evidence count: 4
- Claimant portrait: `people/aigul.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)

### Claimant

**Айгуль Нурланова, 47 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 47 лет
- Город: Алматы
- Клиент с: 2019 г.
- Полис: Имущество · ИМ-44028173-X5
- Документ: Паспорт 0314-52 №440281739-07

### Claim text (RU, verbatim)

> Воздушный шар низко прошёл над фермой и напугал мою корову. Она в панике залезла на сеновал, провалилась сквозь крышу и рухнула прямо в теплицу. Прошу компенсацию за разбитую теплицу.

### Evidence

#### 1. Показания организатора

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Организатор фестиваля шаров подтверждает: один шар совершил аварийное снижение над фермой в то утро.

Status explanation (RU, verbatim): Показания подтверждают версию заявителя.

#### 2. Заключение ветеринара

- ID: `ev-vet`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Корова лечится от растяжения копыта. На крыше сеновала найдены отпечатки копыт.

Status explanation (RU, verbatim): Травма и следы согласуются с падением коровы с крыши.

#### 3. Фото теплицы

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260418_084532.jpg | imageUrl: evidence/case-004-ev-photo.webp

Evidence text (RU, verbatim):

В крыше теплицы дыра в форме коровы, среди помидоров стоит весьма растерянная корова.

Status explanation (RU, verbatim): Фото наглядно подтверждает ущерб и его причину.

#### 4. Смета на ремонт

- ID: `ev-invoice`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Смета от местного подрядчика на восстановление теплицы. Сумма соразмерна ущербу.

Status explanation (RU, verbatim): Смета достоверна и соответствует масштабу повреждений.

### Final explanation shown to player (RU, verbatim)

- История звучит абсурдно, но каждое доказательство её подтверждает.
- Шар, травма коровы, следы на крыше и фото согласованы между собой.
- Противоречий нет — заявление подлинное, его следует одобрить.

### Fan service, characters, and continuity

No explicit pop-culture fan service or recurring arc. The hook is an absurd but true incident.

## 10. Полтергейст в прямом эфире (`case-005`)

- Campaign position: 10
- Required level: 5
- Data difficulty: Medium (`medium`)
- Claim amount: 2200 EUR
- Evidence count: 4
- Claimant portrait: `people/stas.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)

### Claimant

**Стас Гром, 24 года**

Role (RU): Заявитель · физ. лицо

- Возраст: 24 года
- Город: Москва
- Клиент с: 2023 г.
- Полис: Имущество · ИМ-55093461-X8
- Документ: Паспорт 4521-99 №550934613-44

### Claim text (RU, verbatim)

> Во время паранормального явления полтергейст сбросил со стола мой игровой ноутбук и монитор. Прошу компенсацию за сверхъестественный ущерб технике.

### Evidence

#### 1. Запись стрима

- ID: `ev-stream`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: cameraId: LIVE-CH | cameraModel: Logitech C922 · 1080p · H.264

Evidence text (RU, verbatim):

Его собственный стрим: проиграв матч, он вскакивает и швыряет ноутбук через всю комнату.

Status explanation (RU, verbatim): Технику разбил сам заявитель, а не полтергейст — это на видео.

#### 2. Лог умного дома

- ID: `ev-sensor`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: logPrompt: smartd@hive:~$ tail -f /var/log/sensors.log

Evidence text (RU, verbatim):

- 23:46 — в квартире зафиксирован один человек
- 23:47 — сильный удар по столу
- 23:47 — иных аномалий нет

Status explanation (RU, verbatim): В квартире был только он, и датчик зафиксировал удар, а не паранормальную активность.

#### 3. Фото с места

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260408_233102.jpg | imageUrl: evidence/case-005-ev-photo.webp

Evidence text (RU, verbatim):

Ноутбук с трещиной на полу рядом с пролитым энергетиком и геймпадом.

Status explanation (RU, verbatim): Фото подтверждает повреждение, но само по себе не указывает на причину.

#### 4. Чек на ноутбук

- ID: `ev-receipt`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Подлинный чек на покупку игрового ноутбука. Сумма соответствует заявленной.

Status explanation (RU, verbatim): Чек подлинный — техника действительно существует и стоила столько.

### Final explanation shown to player (RU, verbatim)

- Стрим заявителя показывает, как он сам швыряет ноутбук.
- Лог умного дома: в квартире был только он, зафиксирован удар, а не «полтергейст».
- Ущерб умышленный — заявление мошенническое, отклонить.

### Fan service, characters, and continuity

No explicit recurring character or named reference. Uses the familiar angry-streamer archetype.

## Retention-analysis observations

- Onboarding starts with two short two-evidence cases: obvious fraud first, then a valid claim. This teaches quickly that the player must not reject every unusual story.
- The third case adds a third evidence card and a technical deduction. Cases 4-5 then introduce the recurring Anatoly and Zhorik duo.
- Cases 6-7 immediately follow with a connected parody mini-arc. Positions 4-7 therefore form a dense block of absurd humor and recurring characters.
- Cases 8-10 return to standalone plots and increase to four evidence cards, raising reading volume and adding contextual/non-contradictory evidence.
- Outcome balance is 6 fraud versus 4 valid. Two consecutive absurd-but-valid cases (018-019) deliberately break the shortcut “strange story means fraud.”
- There is no scarce-information mechanic in these ten cases. Tension depends on writing, humor, contradiction recognition, and verdict choice.
- Cases 020-021 contain the strongest external pop-culture reference, explicitly named in the final explanation. Review whether recognition adds delight or makes the payoff too dependent on prior knowledge.

## Ready-to-use AI validation prompt

```text
Answer in Russian. You are a senior narrative designer and retention specialist for detective casual games aimed at players aged 30-60. Below is the complete content of the first 10 cases in actual campaign order.

Analyze these exact texts and their sequence. Score each case from 1 to 10 for:
1) opening hook; 2) curiosity until the last evidence; 3) fair deduction;
4) emotional payoff; 5) humor and memorability; 6) urge to start the next case;
7) clarity for ages 30-60; 8) risk of boredom, predictability, or overload.

Then identify where the answer is revealed too early, where evidence is redundant, and where pacing or outcome ordering weakens retention. Evaluate the Anatoly + Zhorik mini-series and the cases 020-021 parody arc. Check whether the fan service works without knowing the source material. Identify the most likely churn point and explain why. Recommend precise text/evidence/order changes that would most improve D1 retention and the desire to finish all ten cases. Also propose three restrained meta-hooks between cases that fit a paper-folder detective aesthetic, with no neon, casino, sci-fi, or cartoon treatment.

Be critical. Support each issue with a concrete quote or evidence structure from the material, and connect every recommendation to an expected retention effect.
```
