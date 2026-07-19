# Campaign cases 41-50 - complete Russian source text

> Spoiler-heavy export for AI review of story quality, engagement, pacing, and retention. Correct decisions and contradiction flags are intentionally exposed.

## Dataset notes

- Order: actual standard-campaign order, sorted by required level and then case number.
- Language: every localized story field uses the `ru` value verbatim.
- Includes complete claimant text, all evidence, contradiction explanations, final reveal, portrait path, and investigation budget.
- Recurring-character positions are derived from exact claimant-name matches across all 50 campaign cases.
- The source data is not edited by this export.

## Summary

| Pos. | ID | Level | Russian title | Claimant | Difficulty | Amount | Truth / decision | Evidence | Contradictions | Budget | Recurring claimant positions |
|---:|---|---:|---|---|---|---:|---|---:|---:|---:|---|
| 41 | `case-043` | 16 | Исчезнувший ученик навигатора | Мастер Илар Роун, 61 год | Hard | 17400 EUR | Fraud / Reject | 6 | 5 | 4 | Standalone claimant |
| 42 | `case-044` | 16 | Пожар в теплице редких ароматических корней | Эвелина Морн, 49 лет | Hard | 19200 EUR | Fraud / Reject | 6 | 5 | 4 | Standalone claimant |
| 43 | `case-045` | 16 | Пропавший экзаменационный кубок | Бруно Стерн, 57 лет | Hard | 23500 EUR | Valid claim / Approve | 6 | 0 | 4 | Standalone claimant |
| 44 | `case-046` | 16 | Падение с учебной башни | Ника Рейн, 18 лет | Hard | 16800 EUR | Fraud / Reject | 6 | 4 | 4 | Standalone claimant |
| 45 | `case-047` | 16 | Ночной побег из общежития | Аделия Варн, 16 лет | Hard | 14200 EUR | Valid claim / Approve | 6 | 0 | 4 | Standalone claimant |
| 46 | `case-048` | 16 | Разгром пиццерии после ночной драки | Марко Лин, 44 года | Hard | 12600 EUR | Fraud / Reject | 6 | 5 | 4 | Standalone claimant |
| 47 | `case-049` | 16 | Кража лабораторного мутагена | Герман Кросс, 46 лет | Hard | 38800 EUR | Fraud / Reject | 6 | 5 | 4 | Standalone claimant |
| 48 | `case-050` | 16 | Пожар в антикварном додзё | Харитон Сэн, 65 лет | Hard | 21400 EUR | Valid claim / Approve | 6 | 0 | 4 | Standalone claimant |
| 49 | `case-051` | 16 | Угон фургона с уличной электроникой | Роман Драй, 33 года | Hard | 19700 EUR | Fraud / Reject | 6 | 5 | 4 | Standalone claimant |
| 50 | `case-417` | 30 | Пропавший чемодан | Лукас Феррейра | Medium | 2500 EUR | Fraud / Reject | 4 | 2 | - | Standalone claimant |

Range totals: **7 fraud**, **3 valid**, **58 evidence cards**, **9 budget-limited cases**.

## Complete case cards

## 41. Исчезнувший ученик навигатора (`case-043`)

- Campaign position: 41
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 17400 EUR
- Evidence count: 6
- Claimant portrait: `people/ilar-roun.webp`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Мастер Илар Роун, 61 год**

Role (RU): Наставник навигационной академии

- Архив: Пограничный сектор
- Застрахованный риск: Пропажа стажёра
- Архивная связка: Повторяющийся след: маркировка GC-17 и серые транспортные жетоны «Серого конвоя».

### Claim text (RU, verbatim)

> Моего стажёра похитили агенты подполья. Он исчез ночью из закрытого корпуса академии, а вместе с ним пропали учебные материалы. Прошу компенсацию расходов поиска.

### Evidence

#### 1. Коридорная камера

- ID: `corridor-cam`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: cameraId: NAV-COR-12 | cameraModel: SentinelCam SC-3265 · 1080p · H.264

Evidence text (RU, verbatim):

Стажёр идёт один с сумкой, останавливается у терминала и не сопротивляется никому.

Status explanation (RU, verbatim): Запись противоречит версии насильственного похищения.

#### 2. Пропуск выхода

- ID: `exit-pass`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: gate@navacademy:~$ tail -f /var/log/exit-pass.log

Evidence text (RU, verbatim):

- 01:16 — карта N-318, выход через шлюз B
- 01:17 — подтверждение биометрии
- 01:18 — дверь закрыта штатно

Status explanation (RU, verbatim): Выход активирован личной картой и биометрией.

#### 3. Тайник за скамьёй

- ID: `cache-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: IMG_20260601_082244.jpg | imageUrl: evidence/case-043-cache-photo.webp

Evidence text (RU, verbatim):

За скамьёй найдены дорожный паёк, наличные кредиты и запасная куртка, сложенные заранее.

Status explanation (RU, verbatim): Тайник указывает на подготовленный побег.

#### 4. Личное письмо

- ID: `letter`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`

Evidence text (RU, verbatim):

«Я ухожу сам. В стенах академии протоколы не вскроют. Если получится, передам копии наружу». В письме отдельно названы «протоколы Серого конвоя».

Status explanation (RU, verbatim): Письмо прямо говорит о добровольном уходе.

#### 5. Черновик экзаменационного протокола

- ID: `protocol-draft`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

В черновике отмечены исправленные оценки и подписи, не совпадающие с журналом комиссии.

Status explanation (RU, verbatim): Материал важен для хронологии, но сам по себе не опровергает заявление.

#### 6. Детализация связи

- ID: `phone-detail`
- Type: Phone records (`phone_records`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: carrierName: RelayTel Sector | phoneMask: +0 (7••) •••-••-18

Evidence text (RU, verbatim):

- 31.05 22:40 — исходящее: общественный терминал порта
- 01.06 00:58 — короткий вызов: учебный корпус
- 01.06 01:24 — входящее: пригородный шлюз

Status explanation (RU, verbatim): Звонки показывают связь с маршрутом ухода, а не с похитителями.

### Final explanation shown to player (RU, verbatim)

- Камера, пропуск и письмо показывают добровольный уход стажёра.
- Письмо превращает GC-17 из случайной метки в след «Серого конвоя».
- Похищение не подтверждено: вердикт — отказ.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 42. Пожар в теплице редких ароматических корней (`case-044`)

- Campaign position: 42
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 19200 EUR
- Evidence count: 6
- Claimant portrait: `people/evelina-morn.webp`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Эвелина Морн, 49 лет**

Role (RU): Куратор редких теплиц

- Архив: Закрытый Коллегиум
- Застрахованный риск: Утрата редких корней
- Архивная связка: Повторяющийся след: серая восковая лента; часть заявителей её имитирует, но часть дел выводит на настоящую группу.

### Claim text (RU, verbatim)

> Редкие корни вспыхнули сами: перегрев теплицы, стекло, дым, вся партия погибла за одну ночь. У меня не было причин рисковать коллекцией перед весенним смотром.

### Evidence

#### 1. Очаг у стола смешивания

- ID: `photo-44`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: IMG_20260644_081500.jpg | imageUrl: evidence/case-044-photo-44.webp

Evidence text (RU, verbatim):

Ожог начинается вокруг керамической чаши с остатками ускорителя роста, а не внутри грядки с корнями.

Status explanation (RU, verbatim): Очаг пожара не совпадает с версией о самовозгорании растений.

#### 2. Акт фитосанитарной комиссии

- ID: `document-44`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

За два дня до пожара комиссия отметила: 37% корней поражены плесенью, рыночная стоимость партии снижена.

Status explanation (RU, verbatim): Материал важен для проверки версии, но сам по себе не является противоречием.

#### 3. Ночная камера теплицы

- ID: `camera-44`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: cameraId: ARC-44 | cameraModel: SentinelCam SC-3265 - 1080p - H.264

Evidence text (RU, verbatim):

02:18: Морн заносит закрытый термобокс. Через четыре минуты камера ослеплена паром изнутри теплицы.

Status explanation (RU, verbatim): Камера показывает подготовку внутри теплицы до заявленного перегрева.

#### 4. Климатический журнал

- ID: `log-44`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: archive@log-44:~$ tail -f /var/log/archive.log

Evidence text (RU, verbatim):

- 01:52 — ручной режим: вентиляция отключена
- 02:06 — датчик влажности переведён в сервис
- 02:24 — тревога подавлена локальным ключом

Status explanation (RU, verbatim): Журнал показывает ручное подавление защитных систем.

#### 5. Покупка ускорителя

- ID: `bank-44`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: bankName: Municipal Credit | accountMask: **** **** **** 44

Evidence text (RU, verbatim):

- За сутки до пожара — покупка термогеля и ускорителя роста
- После пожара — аванс за новую партию корней

Status explanation (RU, verbatim): Покупки связывают пожар с подготовленной химической реакцией.

#### 6. Показания ночного садовника

- ID: `witness-44`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`

Evidence text (RU, verbatim):

«Перед дымом пахло не корнями, а горячим лаком. Морн велела мне не трогать вентиляционный щит». На ручке тепличного шкафа нашли серую восковую ленту, но она расплавлена только с одной стороны.

Status explanation (RU, verbatim): Свидетель подтверждает искусственный источник дыма и запрет на вентиляцию.

### Final explanation shown to player (RU, verbatim)

- Очаг и климатический журнал указывают на ручную подготовку пожара.
- Серая лента здесь выглядит подброшенной приманкой, а не следом настоящей группы.
- Самовозгорание редких корней не подтверждено: вердикт — отказ.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 43. Пропавший экзаменационный кубок (`case-045`)

- Campaign position: 43
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 23500 EUR
- Evidence count: 6
- Claimant portrait: `people/bruno-stern.webp`
- Investigation budget: 4
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Бруно Стерн, 57 лет**

Role (RU): Комендант зала наград

- Архив: Закрытый Коллегиум
- Застрахованный риск: Кража реликвии
- Архивная связка: Повторяющийся след: серая восковая лента; часть заявителей её имитирует, но часть дел выводит на настоящую группу.

### Claim text (RU, verbatim)

> Кубок забрали через верхний сервисный ход за час до церемонии. Все решили, что я опять перепутал ключи, но витрина была вскрыта снаружи. Прошу выплату за реликвию.

### Evidence

#### 1. Внешний след на петле

- ID: `photo-45`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: filename: IMG_20260645_081500.jpg | imageUrl: evidence/case-045-photo-45.webp

Evidence text (RU, verbatim):

На латунной петле видна свежая дуга резака снаружи витрины; внутренний замок не повреждён.

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 2. Опись церемониального кубка

- ID: `document-45`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

Опись подтверждает подлинность кубка, вес, гравировку и страховую сумму. Дубликаты в архиве не числятся.

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 3. Камера верхней галереи

- ID: `camera-45`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: cameraId: ARC-45 | cameraModel: SentinelCam SC-3265 - 1080p - H.264

Evidence text (RU, verbatim):

03:12: фигура в сером плаще спускается с сервисной балки и уходит с длинным свёртком. Стерн в кадре не появляется. На рукаве фигуры видна настоящая серая лента с тройной печатью.

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 4. Журнал купольного люка

- ID: `log-45`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: logPrompt: archive@log-45:~$ tail -f /var/log/archive.log

Evidence text (RU, verbatim):

- 03:09 — аварийный люк открыт внешним сервисным ключом
- 03:14 — датчик витрины: вибрация без штатного ключа
- 03:16 — люк закрыт снаружи

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 5. Проверка слуха о продаже

- ID: `bank-45`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `context`
- Visual/service metadata: bankName: Municipal Credit | accountMask: **** **** **** 45

Evidence text (RU, verbatim):

- За неделю до кражи — нет платежей от аукционных домов
- После кражи — только стандартная зарплата коменданта

Status explanation (RU, verbatim): Материал важен для проверки версии, но сам по себе не является противоречием.

#### 6. Сторож лестничной башни

- ID: `witness-45`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

«Я слышал не ключи Стерна, а верхний колокол люка. Потом кто-то пробежал по балке — шаги были выше витрины».

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

### Final explanation shown to player (RU, verbatim)

- Петля, камера и люк показывают внешний доступ сверху.
- Серая лента на записи совпадает с настоящей архивной меткой, а не с подделкой из теплицы.
- Кража реликвии подтверждена: вердикт — выплатить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 44. Падение с учебной башни (`case-046`)

- Campaign position: 44
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 16800 EUR
- Evidence count: 6
- Claimant portrait: `people/nika-rein.webp`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Ника Рейн, 18 лет**

Role (RU): Курсант навигационной башни

- Архив: Закрытый Коллегиум
- Застрахованный риск: Учебная травма
- Архивная связка: Повторяющийся след: серая восковая лента; часть заявителей её имитирует, но часть дел выводит на настоящую группу.

### Claim text (RU, verbatim)

> Защитная система учебной башни сорвалась во время зачётного прыжка. Я упала, пропустила финал отбора и прошу оплатить лечение и потерю стипендии.

### Evidence

#### 1. Пломба страховочного кольца

- ID: `photo-46`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: IMG_20260646_081500.jpg | imageUrl: evidence/case-046-photo-46.webp

Evidence text (RU, verbatim):

Пломба не сорвана нагрузкой: край ровный, как после среза тонким ножом.

Status explanation (RU, verbatim): Пломба снята вручную, а не разрушена отказом системы.

#### 2. Медицинское заключение

- ID: `document-46`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`

Evidence text (RU, verbatim):

Снимки подтверждают ушиб плеча без перелома. Давность синяка — не менее суток до заявленного падения.

Status explanation (RU, verbatim): Травма не совпадает по времени с заявленным падением.

#### 3. Камера площадки B

- ID: `camera-46`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: cameraId: ARC-46 | cameraModel: SentinelCam SC-3265 - 1080p - H.264

Evidence text (RU, verbatim):

Рейн дважды проверяет, смотрит ли инструктор вниз, затем сама отщёлкивает страховочное кольцо перед прыжком.

Status explanation (RU, verbatim): Запись показывает сознательное отключение страховки.

#### 4. Журнал страховочной линии

- ID: `log-46`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: archive@log-46:~$ tail -f /var/log/archive.log

Evidence text (RU, verbatim):

- 17:42 — личный жетон R-46: сервисный режим
- 17:43 — кольцо B-12 отключено локально
- 17:44 — падение зарегистрировано после отключения

Status explanation (RU, verbatim): Отключение выполнено личным жетоном заявительницы.

#### 5. Платёж тренеру отбора

- ID: `bank-46`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `context`
- Visual/service metadata: bankName: Municipal Credit | accountMask: **** **** **** 46

Evidence text (RU, verbatim):

- За день до падения — перевод частному тренеру за «экстренный допуск»
- После падения — запрос возврата вступительного взноса
- Платёж тренеру помечен фразой «лента откроет второй шанс» — той же, что ходит после кражи кубка.

Status explanation (RU, verbatim): Материал важен для проверки версии, но сам по себе не является противоречием.

#### 6. Показания ассистента

- ID: `witness-46`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

«Она просила никому не говорить, что боится финального прыжка. Сказала: если башня виновата, отбор перенесут».

Status explanation (RU, verbatim): Материал важен для проверки версии, но сам по себе не является противоречием.

### Final explanation shown to player (RU, verbatim)

- Пломба, камера и журнал показывают ручное отключение страховки.
- Рейн использует слух о серой ленте как прикрытие для личной инсценировки.
- Отказ башни не подтверждён: вердикт — отказ.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 45. Ночной побег из общежития (`case-047`)

- Campaign position: 45
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 14200 EUR
- Evidence count: 6
- Claimant portrait: `none`
- Investigation budget: 4
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Аделия Варн, 16 лет**

Role (RU): Воспитанница закрытого общежития

- Архив: Закрытый Коллегиум
- Застрахованный риск: Похищение из общежития
- Архивная связка: Повторяющийся след: серая восковая лента; часть заявителей её имитирует, но часть дел выводит на настоящую группу.

### Claim text (RU, verbatim)

> Мен не сбегала. Ночью в комнате погас свет, окно открылось снаружи, а потом я очнулась у старого склада. Прошу возместить вещи и расходы поиска.

### Evidence

#### 1. След инструмента на раме

- ID: `photo-47`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: filename: IMG_20260647_081500.jpg | imageUrl: evidence/case-047-photo-47.webp

Evidence text (RU, verbatim):

На внешней стороне оконной рамы есть свежая вмятина. Внутренняя защёлка погнута внутрь комнаты.

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 2. Реестр пропавших вещей

- ID: `document-47`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

Реестр совпадает с вещами, найденными позже у склада: сумка, планшет, форменная куртка. Личных продаж не зафиксировано.

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 3. Камера западного карниза

- ID: `camera-47`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: cameraId: ARC-47 | cameraModel: SentinelCam SC-3265 - 1080p - H.264

Evidence text (RU, verbatim):

00:38: две фигуры с капюшонами поднимают Аделию через окно. Она не идёт сама и не несёт сумку.

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 4. Журнал питания этажа

- ID: `log-47`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: logPrompt: archive@log-47:~$ tail -f /var/log/archive.log

Evidence text (RU, verbatim):

- 00:36 — локальное отключение света в крыле C
- 00:37 — замок комнаты 3-18: аварийный сброс
- 00:41 — сигнал тревоги заблокирован внешним реле
- Внешнее реле подписано серой лентой с тем же тройным оттиском, что на записи кубка.

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 5. Финансовая проверка

- ID: `bank-47`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `context`
- Visual/service metadata: bankName: Municipal Credit | accountMask: **** **** **** 47

Evidence text (RU, verbatim):

- За месяц — только школьные расходы и стипендия
- После исчезновения — нет переводов перевозчикам или ломбардам

Status explanation (RU, verbatim): Материал важен для проверки версии, но сам по себе не является противоречием.

#### 6. Вахтёр третьего этажа

- ID: `witness-47`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

«Я услышала короткий крик и стук по раме. Через минуту свет вернулся, а комната уже была пуста».

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

### Final explanation shown to player (RU, verbatim)

- Окно, камера и журнал показывают внешнее проникновение.
- Тройная печать серой ленты связывает похищение с кражей кубка.
- Похищение и ущерб подтверждены: вердикт — выплатить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 46. Разгром пиццерии после ночной драки (`case-048`)

- Campaign position: 46
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 12600 EUR
- Evidence count: 6
- Claimant portrait: `people/marko-lin.webp`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Марко Лин, 44 года**

Role (RU): Владелец ночной пиццерии

- Архив: Подземный Отдел
- Застрахованный риск: Разгром кухни
- Архивная связка: Повторяющийся след: East Yard — скупка, где старое оборудование и украденные модули превращают в страховые истории.

### Claim text (RU, verbatim)

> Банда в масках ворвалась после закрытия, перевернула кухню и разбила новый туннельный тепловой шкаф. Камеры как раз не работали, поэтому прошу выплату по акту.

### Evidence

#### 1. Старый износ печи

- ID: `photo-48`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: IMG_20260648_081500.jpg | imageUrl: evidence/case-048-photo-48.webp

Evidence text (RU, verbatim):

На «новом» шкафу слой старого жира под свежей сажей; заводская плёнка давно снята.

Status explanation (RU, verbatim): Фото показывает, что повреждённое оборудование не было новым.

#### 2. Счёт на тепловой шкаф

- ID: `document-48`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`

Evidence text (RU, verbatim):

Счёт выписан на демонстрационный шкаф 2019 года с пометкой «восстановленный». В заявлении он указан как новый.

Status explanation (RU, verbatim): Документы завышают стоимость повреждённого оборудования.

#### 3. Камера соседнего лифта

- ID: `camera-48`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: cameraId: ARC-48 | cameraModel: SentinelCam SC-3265 - 1080p - H.264

Evidence text (RU, verbatim):

02:03: Лин сам выносит ящики с посудой, затем возвращается с ломом. Людей в масках на входе нет.

Status explanation (RU, verbatim): Камера показывает подготовку разгрома самим владельцем.

#### 4. Журнал кассы и камер

- ID: `log-48`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: archive@log-48:~$ tail -f /var/log/archive.log

Evidence text (RU, verbatim):

- 01:48 — касса закрыта досрочно
- 01:52 — камеры кухни переведены в сервис владельцем
- 02:19 — акт разгрома создан до вызова охраны

Status explanation (RU, verbatim): Системные логи противоречат внезапному нападению.

#### 5. Покупка замены заранее

- ID: `bank-48`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: bankName: Municipal Credit | accountMask: **** **** **** 48

Evidence text (RU, verbatim):

- За два дня до инцидента — предоплата нового шкафа
- После инцидента — запрос страховой выплаты на полный новый комплект
- Получатель предоплаты — склад East Yard, который позже всплывёт в делах отдела.

Status explanation (RU, verbatim): Замена была заказана до заявленного нападения.

#### 6. Курьер ночной смены

- ID: `witness-48`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

«Я видел, как Марко просил нас уехать через задний ход: “сегодня будет шумно, но без полиции”».

Status explanation (RU, verbatim): Материал важен для проверки версии, но сам по себе не является противоречием.

### Final explanation shown to player (RU, verbatim)

- Камера, логи и фото показывают заранее подготовленный разгром.
- Предоплата East Yard делает старый шкаф частью более широкой скупочной схемы.
- Нападение банды не подтверждено: вердикт — отказ.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 47. Кража лабораторного мутагена (`case-049`)

- Campaign position: 47
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 38800 EUR
- Evidence count: 6
- Claimant portrait: `people/herman-kross.webp`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Герман Кросс, 46 лет**

Role (RU): Заведующий тоннельной лабораторией

- Архив: Подземный Отдел
- Застрахованный риск: Кража реагента
- Архивная связка: Повторяющийся след: East Yard — скупка, где старое оборудование и украденные модули превращают в страховые истории.

### Claim text (RU, verbatim)

> Контейнер с мутагеном украли из сервисного тоннеля. Вентиляция вскрыта, сторож ничего не видел, лаборатория потеряла препарат и неделю работы.

### Evidence

#### 1. Вентиляционная решётка

- ID: `photo-49`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: IMG_20260649_081500.jpg | imageUrl: evidence/case-049-photo-49.webp

Evidence text (RU, verbatim):

Винты решётки лежат внутри лаборатории, а царапины направлены изнутри наружу.

Status explanation (RU, verbatim): Взлом имитирован изнутри лаборатории.

#### 2. Журнал партии M-7

- ID: `document-49`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`

Evidence text (RU, verbatim):

Контейнер M-7 был списан как нестабильный за три дня до кражи, но в страховом заявлении указан как полноценный.

Status explanation (RU, verbatim): Документы завышают ценность утраченного реагента.

#### 3. Камера шлюза C

- ID: `camera-49`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: cameraId: ARC-49 | cameraModel: SentinelCam SC-3265 - 1080p - H.264

Evidence text (RU, verbatim):

23:41: Кросс один входит в лабораторию с пустым охлаждающим кейсом. Через семь минут выходит с кейсом тяжелее.

Status explanation (RU, verbatim): Камера связывает вынос контейнера с заявителем.

#### 4. Журнал морозильного сейфа

- ID: `log-49`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: archive@log-49:~$ tail -f /var/log/archive.log

Evidence text (RU, verbatim):

- 23:38 — доступ: KROSS-H
- 23:40 — контейнер M-7 извлечён штатно
- 23:49 — тревога о взломе создана вручную

Status explanation (RU, verbatim): Сейф открыт штатным доступом Кросса, а не ворами.

#### 5. Оплата серого брокера

- ID: `bank-49`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: bankName: Municipal Credit | accountMask: **** **** **** 49

Evidence text (RU, verbatim):

- За ночь до кражи — входящий платёж от BioSplice Transit
- Назначение: «консультация по нестабильным культурам»
- Платёж BioSplice прошёл через тот же расчётный узел East Yard.

Status explanation (RU, verbatim): Платёж указывает на скрытую сделку с реагентом.

#### 6. Техник вентиляции

- ID: `witness-49`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

«Решётку не ломали с тоннеля. Я видел, что пломба была снята аккуратно и лежала на столе Кросса».

Status explanation (RU, verbatim): Материал важен для проверки версии, но сам по себе не является противоречием.

### Final explanation shown to player (RU, verbatim)

- Вентиляция и сейф показывают инсценировку изнутри.
- BioSplice и East Yard связывают реагент с той же подпольной логистикой.
- Кража неизвестными не подтверждена: вердикт — отказ.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 48. Пожар в антикварном додзё (`case-050`)

- Campaign position: 48
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 21400 EUR
- Evidence count: 6
- Claimant portrait: `people/khariton-sen.webp`
- Investigation budget: 4
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Харитон Сэн, 65 лет**

Role (RU): Хранитель подпольного додзё-музея

- Архив: Подземный Отдел
- Застрахованный риск: Поджог музея
- Архивная связка: Повторяющийся след: East Yard — скупка, где старое оборудование и украденные модули превращают в страховые истории.

### Claim text (RU, verbatim)

> Конкуренты подожгли музей-додзё через служебный двор. Я успел вынести учеников, но старые маски и часть татами сгорели. Прошу выплату на восстановление.

### Evidence

#### 1. След фитиля у служебной двери

- ID: `photo-50`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: filename: IMG_20260650_081500.jpg | imageUrl: evidence/case-050-photo-50.webp

Evidence text (RU, verbatim):

Обугленная дорожка идёт от внешнего двора к порогу. Очаг не в подсобке, а у служебной двери.

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 2. Опись музейной коллекции

- ID: `document-50`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

Опись до пожара подтверждает маски, тренировочные свитки и татами. Повреждённые предметы были застрахованы до инцидента.

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 3. Камера переулка

- ID: `camera-50`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: cameraId: ARC-50 | cameraModel: SentinelCam SC-3265 - 1080p - H.264

Evidence text (RU, verbatim):

22:31: двое в одинаковых куртках оставляют канистру у служебной двери и бегут к тоннельному лифту. Куртки на записи имеют нашивку East Yard, но Сэн не связан с этой площадкой.

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 4. Журнал пожарной панели

- ID: `log-50`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: logPrompt: archive@log-50:~$ tail -f /var/log/archive.log

Evidence text (RU, verbatim):

- 22:32 — датчик двора: вспышка у служебной двери
- 22:33 — автоматическое закрытие ученического зала
- 22:34 — ручная эвакуация запущена ключом SEN-H

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

#### 5. Проверка закупок

- ID: `bank-50`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `context`
- Visual/service metadata: bankName: Municipal Credit | accountMask: **** **** **** 50

Evidence text (RU, verbatim):

- За месяц — только покупка огнетушителей и пропитки татами
- Нет платежей за серу, стружку или ускорители горения

Status explanation (RU, verbatim): Материал важен для проверки версии, но сам по себе не является противоречием.

#### 6. Ученик вечерней группы

- ID: `witness-50`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

«Сэн первым вывел нас к запасному выходу. Если бы он тянул время, мы бы остались в дыму».

Status explanation (RU, verbatim): Улика поддерживает заявленную версию и не требует штампа противоречия.

### Final explanation shown to player (RU, verbatim)

- Фото, камера и пожарная панель указывают на внешний поджог.
- Нашивка East Yard делает это дело реальным ударом сети, а не инсценировкой Сэна.
- Версия Сэна подтверждена: вердикт — выплатить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 49. Угон фургона с уличной электроникой (`case-051`)

- Campaign position: 49
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 19700 EUR
- Evidence count: 6
- Claimant portrait: `people/roman-dray.webp`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Роман Драй, 33 года**

Role (RU): Поставщик уличной электроники

- Архив: Подземный Отдел
- Застрахованный риск: Угон фургона
- Архивная связка: Повторяющийся след: East Yard — скупка, где старое оборудование и украденные модули превращают в страховые истории.

### Claim text (RU, verbatim)

> Организованная банда перехватила мой фургон с сенсорами для уличной электроники. Водителя вытолкнули, груз исчез, а трекер молчал почти час.

### Evidence

#### 1. Кузов без следов борьбы

- ID: `photo-51`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: IMG_20260651_081500.jpg | imageUrl: evidence/case-051-photo-51.webp

Evidence text (RU, verbatim):

Стяжки груза аккуратно сложены на полу. Нет следов резкого торможения, крови или сорванных креплений.

Status explanation (RU, verbatim): Салон выглядит разгруженным спокойно, а не после нападения.

#### 2. Накладная на сенсоры

- ID: `document-51`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

Накладная подтверждает 48 сенсорных блоков. Серийные номера совпадают с партией, позже замеченной на комиссионной площадке.

Status explanation (RU, verbatim): Материал важен для проверки версии, но сам по себе не является противоречием.

#### 3. Камера тоннельной рампы

- ID: `camera-51`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: cameraId: ARC-51 | cameraModel: SentinelCam SC-3265 - 1080p - H.264

Evidence text (RU, verbatim):

Фургон въезжает на рампу без заноса и аварийных огней. За рулём человек в куртке Драя.

Status explanation (RU, verbatim): Камера не показывает силовой перехват.

#### 4. Журнал телематики фургона

- ID: `log-51`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: archive@log-51:~$ tail -f /var/log/archive.log

Evidence text (RU, verbatim):

- 21:08 — водительский профиль: DRAY-R
- 21:11 — трекер переведён в режим приватной доставки
- 21:57 — маршрут завершён у площадки East Yard

Status explanation (RU, verbatim): Телематика показывает штатный маршрут с профилем Драя.

#### 5. Поступление от комиссионера

- ID: `bank-51`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: bankName: Municipal Credit | accountMask: **** **** **** 51

Evidence text (RU, verbatim):

- Через 40 минут после «угона» — входящий платёж от East Yard Consign
- Назначение: «электронные модули, партия 48»
- Это уже не косвенный след: East Yard платит ровно за 48 модулей из накладной.

Status explanation (RU, verbatim): Платёж совпадает с количеством заявленного груза.

#### 6. GPS-трек без остановки

- ID: `gps-51`
- Type: GPS track (`gps`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: company: Cargo Office 51 | department: Центр грузового мониторинга | requestId: TLC-2026-0612-D · Тип: маршрут | gpsFooter: © TrackLine 2026 · GPS ACC: ±7m

Evidence text (RU, verbatim):

- 21:07 — склад Драя, старт
- 21:22 — тоннель D4, скорость 42 км/ч
- 21:57 — East Yard, штатная парковка

Status explanation (RU, verbatim): Маршрут не содержит остановки или резкого отклонения для угона.

### Final explanation shown to player (RU, verbatim)

- Телематика и GPS показывают штатный маршрут до East Yard.
- Банковский платёж совпадает с партией сенсоров и закрывает цепочку отдела.
- Угон фургона не подтверждён: вердикт — отказ.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 50. Пропавший чемодан (`case-417`)

- Campaign position: 50
- Required level: 30
- Data difficulty: Medium (`medium`)
- Claim amount: 2500 EUR
- Evidence count: 4
- Claimant portrait: `people/lucas.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Лукас Феррейра**

Role (RU): Заявитель · физ. лицо

- Возраст: 35 лет
- Город: São Paulo
- Клиент с: 2021 г.
- Полис: Путешествие · ТУ-77011892-X6
- Документ: Паспорт BR-X7 223344559-08210

### Claim text (RU, verbatim)

> Авиакомпания потеряла мой сданный в багаж чемодан с дорогой электроникой и часами. Я так и не получил его и требую возмещения полной стоимости содержимого.

### Evidence

#### 1. Посадочный талон

- ID: `ev-boarding`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Рейс TP1043, Лиссабон → Берлин, 02.05.2026, место 14C, посадка подтверждена.

Status explanation (RU, verbatim): Талон подлинный и подтверждает, что пассажир действительно летел этим рейсом — это не противоречие.

#### 2. Журнал отслеживания багажа

- ID: `ev-tracking`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: logPrompt: bagtrack@hub:~$ tail -f /var/log/baggage.log

Evidence text (RU, verbatim):

- 02.05 14:12 — бирка BG884201 загружена в Лиссабоне
- 02.05 18:40 — выгружена в Берлине, выдана на ленте 3
- 03.05 11:05 — доставлена курьером по адресу клиента
- 03.05 11:07 — подпись получателя: L. Ferreira

Status explanation (RU, verbatim): Клиент утверждает, что так и не получил чемодан, но журнал показывает доставку по его адресу с его подписью на следующий день.

#### 3. Объявление о перепродаже

- ID: `ev-listing`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: filename: SCR_20260506_142301.png | imageUrl: evidence/case-417-ev-listing.webp

Evidence text (RU, verbatim):

Скриншот объявления от 06.05.2026: те же часы и ноутбук из списка содержимого выставлены клиентом на продажу как «новые, в коробке».

Status explanation (RU, verbatim): Предметы, заявленные как утраченные вместе с чемоданом, спустя дни выставлены тем же клиентом на продажу как новые.

#### 4. Заявление о пропаже

- ID: `ev-claimform`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Поданное клиентом заявление: «Багаж не доставлен, местонахождение неизвестно с момента прилёта 02.05».

Status explanation (RU, verbatim): Само заявление оформлено корректно; проблема в том, что оно опровергается журналом доставки, а не в самом бланке.

### Final explanation shown to player (RU, verbatim)

- Журнал багажа показывает доставку чемодана по адресу клиента с его подписью.
- «Утраченные» дорогие предметы выставлены клиентом на перепродажу как новые.
- Заявление о пропаже ложно — это мошенничество, в выплате отказать.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## Ready-to-use AI review prompt

```text
Answer in Russian. You are a senior narrative designer and retention specialist for detective casual games aimed at players aged 30-60.
Review campaign positions 41-50 below as a sequence, not as isolated pitches. All localized source text is Russian and all solutions are intentionally visible.

For every case, score from 1 to 10: opening hook, curiosity through the last evidence, fairness of deduction, emotional payoff, humor/memorability, clarity for ages 30-60, and urge to start the next case. Identify redundant evidence, premature reveals, weak logic, tonal repetition, reading overload, fan-service dependence, and missed opportunities for recurring-character arcs. Then identify the most likely churn point in this ten-case block. Recommend precise edits to claims, evidence order/content, final explanations, and case order. Tie every recommendation to an expected retention effect. Preserve the restrained paper-folder insurance-investigation tone; no neon, casino, sci-fi, or cartoon treatment.
```
