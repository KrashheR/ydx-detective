# Campaign cases 21-30 - complete Russian source text

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
| 21 | `case-023` | 11 | Карта украдена за границей | Рустам Назаров, 38 лет | Medium | 3500 EUR | Fraud / Reject | 4 | 2 | - | Standalone claimant |
| 22 | `case-024` | 11 | Лёгкое ДТП на перекрёстке | Марина Гордеева, 34 года | Medium | 2000 EUR | Valid claim / Approve | 4 | 0 | - | Standalone claimant |
| 23 | `case-025` | 12 | Пожар в кафе | Лоренцо Конти, 45 лет | Medium | 5000 EUR | Valid claim / Approve | 5 | 0 | - | Standalone claimant |
| 24 | `case-026` | 12 | Похищенные часы | Эдуард Кравец, 50 лет | Hard | 12000 EUR | Fraud / Reject | 5 | 2 | - | Standalone claimant |
| 25 | `case-027` | 13 | Затопленный склад | Болат Жумабеков, 41 год | Medium | 4000 EUR | Valid claim / Approve | 5 | 0 | - | 16, 25 |
| 26 | `case-028` | 13 | Поджог склада | Дамир Аскаров, 47 лет | Hard | 18000 EUR | Fraud / Reject | 5 | 2 | 3 | Standalone claimant |
| 27 | `case-029` | 14 | Удар молнии в дом | Хелена Краузе, 39 лет | Hard | 9000 EUR | Valid claim / Approve | 6 | 0 | - | Standalone claimant |
| 28 | `case-030` | 14 | Подстроенное ДТП | Деян Маркович, 44 года | Hard | 15000 EUR | Fraud / Reject | 6 | 3 | - | Standalone claimant |
| 29 | `case-031` | 15 | Град уничтожил теплицу | Айгуль Сапарова, 36 лет | Hard | 7000 EUR | Valid claim / Approve | 6 | 0 | - | Standalone claimant |
| 30 | `case-032` | 15 | Исчезнувший внедорожник | Тимур Расулов, 52 года | Hard | 22000 EUR | Fraud / Reject | 6 | 3 | - | Standalone claimant |

Range totals: **5 fraud**, **5 valid**, **52 evidence cards**, **1 budget-limited cases**.

## Complete case cards

## 21. Карта украдена за границей (`case-023`)

- Campaign position: 21
- Required level: 11
- Data difficulty: Medium (`medium`)
- Claim amount: 3500 EUR
- Evidence count: 4
- Claimant portrait: `people/rustam.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Рустам Назаров, 38 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 38 лет
- Город: Уфа
- Клиент с: 2021 г.
- Полис: Карта · КА-23278451-X1
- Документ: Паспорт 8019-46 №232784513-16

### Claim text (RU, verbatim)

> Я был в отпуске за границей с 10 по 17 марта. Где-то там у меня украли и, видимо, склонировали карту: с неё сняли 3500 евро, пока я отдыхал. Я ничего не снимал, дома меня не было. Прошу вернуть похищенные средства.

### Evidence

#### 1. Банковская выписка

- ID: `ev-bank`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: bankName: Расчётный отдел № 23 | accountMask: •••• •••• •••• 4471

Evidence text (RU, verbatim):

- 12.03 09:14 — Снятие наличных, банкомат «Столица-217», ул. Садовая 4 (250 м от дома): −1 500,00 €
- 12.03 09:21 — Снятие наличных, банкомат «Столица-217», ул. Садовая 4: −1 000,00 €
- 14.03 18:02 — Перевод на счёт •••• 4471 (собственный счёт держателя): −1 000,00 €
- Авторизация: чип + ПИН, подтверждено для всех операций
- Итого оспаривается: −3 500,00 €

Status explanation (RU, verbatim): Операции совершены в банкомате в 250 м от дома 12 марта, когда клиент якобы был за границей, а 1000 € переведены на его же счёт •••• 4471 — деньги не похищены, а переведены себе.

#### 2. Заявление в полицию

- ID: `ev-police`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Зарегистрированное заявление о краже банковской карты от 18 марта. Содержит описание со слов заявителя; факт хищения средств полицией не подтверждён, ведётся проверка.

Status explanation (RU, verbatim): Заявление подлинное и лишь фиксирует слова клиента; само по себе оно не доказывает ни кражу, ни мошенничество.

#### 3. Снимок зоны банкомата

- ID: `ev-atm`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260312_091418.jpg | imageUrl: evidence/case-023-ev-atm.jpg

Evidence text (RU, verbatim):

Кадр охранной камеры у банкомата «Столица-217» на ул. Садовой: видна зона выдачи купюр и спина клиента в момент операции 12 марта. Лица не разобрать, но локация и время совпадают с выпиской.

Status explanation (RU, verbatim): Снимок подлинный и подтверждает место и время операции; сам по себе он не уличает заявителя, так как лицо неразличимо.

#### 4. Письмо банка-эмитента

- ID: `ev-issuer`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**

Evidence text (RU, verbatim):

Платёжный департамент подтверждает: все оспариваемые операции выполнены физическим чипом карты с вводом корректного ПИН-кода. Признаков клонирования, скимминга или операций без чипа не выявлено. Карта в момент операций не была заблокирована.

Status explanation (RU, verbatim): Эмитент подтверждает чип + ПИН по всем операциям — карту нельзя было использовать без оригинала и кода, что опровергает версию о краже и клонировании.

### Final explanation shown to player (RU, verbatim)

- Снятия сделаны в банкомате в 250 м от дома, а 1000 € ушли на собственный счёт клиента.
- Эмитент подтвердил чип + ПИН по всем операциям — кражи и клонирования не было.
- Заявление мошенническое, его следует отклонить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 22. Лёгкое ДТП на перекрёстке (`case-024`)

- Campaign position: 22
- Required level: 11
- Data difficulty: Medium (`medium`)
- Claim amount: 2000 EUR
- Evidence count: 4
- Claimant portrait: `people/marina.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Марина Гордеева, 34 года**

Role (RU): Заявитель · физ. лицо

- Возраст: 34 года
- Город: Краснодар
- Клиент с: 2022 г.
- Полис: ОСАГО · ОС-24289562-X4
- Документ: Паспорт 2320-38 №242895620-27

### Claim text (RU, verbatim)

> 22 апреля около 17:40 на перекрёстке Ленина и Парковой в меня сзади въехал другой автомобиль. Удар был несильным, но помят бампер и разбит задний фонарь. Я сразу позвонила в экстренную службу со своего телефона. Прошу компенсацию ремонта.

### Evidence

#### 1. Детализация звонков

- ID: `ev-phone`
- Type: Phone records (`phone_records`)
- Contradiction to stamp: **No**
- Visual/service metadata: carrierName: Оператор связи № 24 | phoneMask: +7 (9••) •••-••-•1

Evidence text (RU, verbatim):

- 22.04 16:58 — Входящий, абонент «Работа», 02:11
- 22.04 17:42 — Исходящий, экстренная служба 112, 03:48 (вышка: Ленина/Парковая)
- 22.04 17:51 — Исходящий, абонент «Муж», 01:20 (вышка: Ленина/Парковая)
- 22.04 18:30 — Входящий, абонент «Эвакуатор», 00:54
- Все звонки 22 апреля, регион — город заявителя

Status explanation (RU, verbatim): Детализация подтверждает звонок в 112 в 17:42 от вышки на перекрёстке Ленина/Парковая — это совпадает с заявленным временем и местом ДТП.

#### 2. Протокол ГИБДД

- ID: `ev-police`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Протокол от 22 апреля, перекрёсток Ленина/Парковая, время 17:40. Зафиксировано столкновение «попутное, удар сзади»; виновником признан водитель второго автомобиля, не соблюдавший дистанцию. Повреждения автомобиля заявителя: задний бампер, левый задний фонарь.

Status explanation (RU, verbatim): Протокол совпадает с рассказом по времени, месту и характеру повреждений; вина возложена на другого водителя.

#### 3. Фото повреждений

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260422_181205.jpg | imageUrl: evidence/case-024-ev-photo.jpg

Evidence text (RU, verbatim):

Снимок задней части автомобиля при дневном свете: вмятина на бампере и расколотый левый задний фонарь. Характер повреждений типичен для несильного удара сзади.

Status explanation (RU, verbatim): Повреждения на фото соответствуют протоколу ГИБДД и заявленному характеру ДТП.

#### 4. Смета на ремонт

- ID: `ev-estimate`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Калькуляция автосервиса: замена заднего бампера и левого заднего фонаря, окраска, нормо-часы. Итоговая сумма — 2000 евро, что соответствует заявленной компенсации.

Status explanation (RU, verbatim): Перечень работ соответствует зафиксированным повреждениям, а сумма совпадает с заявленной.

### Final explanation shown to player (RU, verbatim)

- Детализация подтверждает звонок в 112 с места и в момент ДТП.
- Протокол ГИБДД, фото и смета согласованы между собой и с рассказом.
- Заявление достоверное, его следует одобрить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 23. Пожар в кафе (`case-025`)

- Campaign position: 23
- Required level: 12
- Data difficulty: Medium (`medium`)
- Claim amount: 5000 EUR
- Evidence count: 5
- Claimant portrait: `people/lorenzo.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Лоренцо Конти, 45 лет**

Role (RU): Заявитель · ИП

- Возраст: 45 лет
- Город: Рим
- Клиент с: 2015 г.
- Полис: Коммерч. имущество · КИ-25300673-X7
- Документ: Паспорт IT-X5 667788009-46181

### Claim text (RU, verbatim)

> Вечером 5 мая около 21:15 в моём кафе вспыхнул пожар — загорелась проводка за барной стойкой. Сгорело оборудование и часть зала. Пожарные приехали быстро, посетителей и персонал успели вывести. Прошу компенсацию ущерба.

### Evidence

#### 1. Отчёт пожарной службы

- ID: `ev-fire`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

Заключение дознавателя от 6 мая: очаг возгорания — распределительная коробка за барной стойкой, причина — короткое замыкание изношенной проводки. Время вызова — 21:18, 5 мая. Признаков поджога и горючих жидкостей не обнаружено.

Status explanation (RU, verbatim): Отчёт подтверждает электрическую причину и время, совпадающие с рассказом; поджог исключён.

#### 2. Фото ущерба

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: filename: IMG_20260506_103044.jpg | imageUrl: evidence/case-025-ev-photo.jpg

Evidence text (RU, verbatim):

Снимок зала после пожара: обугленная стена за стойкой, оплавленная кофемашина и закопчённый потолок. Видны следы тушения водой и пеной.

Status explanation (RU, verbatim): Характер повреждений соответствует электрическому пожару у барной стойки, как указано в отчёте.

#### 3. Пост прохожего

- ID: `ev-social`
- Type: Social media (`social_media`)
- Contradiction to stamp: **No**
- Authoring relation: `context`
- Visual/service metadata: socialPlatform: localfeed.local

Evidence text (RU, verbatim):

Пост в локальной социальной сети местного жителя от 5 мая, 21:22: видеоролик с горящим окном кафе и дымом над входом, подпись «На углу Морской горит кафе, уже подъезжают пожарные». Геометка и время совпадают с местом и моментом пожара. Автор — независимый прохожий, не связанный с заявителем.

Status explanation (RU, verbatim): Независимый пост с геометкой и временем 21:22 подтверждает сам факт и момент пожара, согласуясь с рассказом и отчётом.

#### 4. Показания соседа

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

«Я держу цветочную лавку рядом. Около четверти десятого вечера почувствовал гарь и увидел дым из-за стойки кафе. Помог вывести двух посетителей и вызвал пожарных. Никаких канистр или подозрительных людей не видел — всё произошло внезапно.»

Status explanation (RU, verbatim): Независимый свидетель подтверждает время и внезапность пожара и отсутствие признаков поджога.

#### 5. Книга доходов и убытков

- ID: `ev-ledger`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

Бухгалтерская ведомость кафе за полгода: стабильная выручка, перечень оборудования с датами покупки (кофемашина, холодильные витрины, мебель). Суммарная балансовая стоимость утраченного и повреждённого имущества — около 5000 евро, что соответствует заявленной сумме.

Status explanation (RU, verbatim): Балансовая стоимость утраченного имущества подтверждает заявленную сумму ущерба.

### Final explanation shown to player (RU, verbatim)

- Отчёт дознавателя устанавливает электрическую причину пожара, поджог исключён.
- Независимый пост прохожего и сосед подтверждают факт и время возгорания.
- Заявление достоверное, его следует одобрить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 24. Похищенные часы (`case-026`)

- Campaign position: 24
- Required level: 12
- Data difficulty: Hard (`hard`)
- Claim amount: 12000 EUR
- Evidence count: 5
- Claimant portrait: `people/eduard.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Эдуард Кравец, 50 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 50 лет
- Город: Киев
- Клиент с: 2013 г.
- Полис: Ценности · ЦЕ-26311784-X0
- Документ: Паспорт UA-X2 778899118-57092

### Claim text (RU, verbatim)

> 12 марта из моей квартиры похитили коллекционные швейцарские часы. Я хранил их в спальне. Это была дорогая вещь, я подал в полицию и прошу выплатить страховую стоимость — 12000 евро.

### Evidence

#### 1. Заявление в полицию

- ID: `ev-police`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Зарегистрированное 12 марта заявление о краже из квартиры. Зафиксировано со слов заявителя: пропали наручные часы. Признаков взлома дверей и окон не обнаружено.

Status explanation (RU, verbatim): Заявление в полицию подлинное — оно лишь фиксирует обращение, но само по себе не доказывает факт кражи.

#### 2. Пост в соцсети

- ID: `ev-social`
- Type: Social media (`social_media`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: socialPlatform: photofeed.local

Evidence text (RU, verbatim):

Опубликовано 19 марта (через неделю после кражи). На фото Эдуард на ужине, на запястье отчётливо видны те самые коллекционные часы. Подпись: «Вечер удался». Часы те же, что в заявлении.

Status explanation (RU, verbatim): Часы заявлены украденными 12 марта, но на снимке от 19 марта Эдуард носит их на руке — значит, они не были похищены.

#### 3. Фото квартиры

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260312_103015.jpg | imageUrl: evidence/case-026-ev-photo.jpg

Evidence text (RU, verbatim):

Общий снимок спальни заявителя: аккуратно заправленная кровать, прикроватная тумба, шкатулка для аксессуаров. Обстановка не нарушена, следов беспорядка нет.

Status explanation (RU, verbatim): Это нейтральное фото обстановки спальни; оно не противоречит заявлению и ничего не доказывает.

#### 4. Банковская выписка

- ID: `ev-bank`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: bankName: ВестаКредит | accountMask: •••• •••• •••• 9120

Evidence text (RU, verbatim):

- 10 мар · Кофейня «Аромат» · -8,40 €
- 11 мар · Заправка АЗС-7 · -54,00 €
- 12 мар · Аптека «Здоровье» · -12,30 €
- 18 мар · Входящий перевод · «Продажа часов, частное лицо» · +9 800,00 €
- 20 мар · Ресторан «Вечер» · -76,50 €
- За весь период покупки часов на счёте не значится.

Status explanation (RU, verbatim): По счёту никогда не проходила покупка дорогих часов, зато 18 марта пришёл крупный перевод с пометкой «продажа часов» — заявитель сам продал вещь, а не лишился её.

#### 5. Сертификат оценки

- ID: `ev-appraisal`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Сертификат независимого оценщика подтверждает рыночную стоимость коллекционных часов на уровне около 12000 евро. Документ описывает модель и состояние, но не указывает дату приобретения и владельца.

Status explanation (RU, verbatim): Сертификат лишь подтверждает стоимость такого типа часов и подлинен; он не свидетельствует ни о краже, ни о владении.

### Final explanation shown to player (RU, verbatim)

- Пост от 19 марта показывает Эдуарда с «украденными» часами на руке.
- Выписка не содержит покупки часов, но фиксирует их продажу 18 марта.
- Заявление мошенническое и должно быть отклонено.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 25. Затопленный склад (`case-027`)

- Campaign position: 25
- Required level: 13
- Data difficulty: Medium (`medium`)
- Claim amount: 4000 EUR
- Evidence count: 5
- Claimant portrait: `people/bolat.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: Yes; campaign positions 16, 25

### Claimant

**Болат Жумабеков, 41 год**

Role (RU): Заявитель · ИП

- Возраст: 41 год
- Город: Алматы
- Клиент с: 2019 г.
- Полис: Коммерч. имущество · КИ-27322895-X3
- Документ: Паспорт KZ-X8 002786431-581034

### Claim text (RU, verbatim)

> Ночью 5 июня на район обрушился сильнейший ливень. Вода прорвалась в мой складской бокс и затопила нижние стеллажи с товаром. Я понёс убытки и прошу компенсацию в 4000 евро.

### Evidence

#### 1. Метеорологическая справка

- ID: `ev-meteo`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Гидрометцентр подтверждает: в ночь с 5 на 6 июня в районе выпало 78 мм осадков за три часа — экстремальный ливень. Зафиксированы локальные подтопления и переполнение ливневой канализации.

Status explanation (RU, verbatim): Справка официальная и подтверждает экстремальный ливень в заявленную ночь — полностью согласуется с историей.

#### 2. Фото затопления

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260606_071240.jpg | imageUrl: evidence/case-027-ev-photo.webp

Evidence text (RU, verbatim):

На снимке — стоячая вода по щиколотку в проходе склада, размокшие картонные коробки на нижних полках и тёмная линия подтопления на стене. Верхние стеллажи остались сухими.

Status explanation (RU, verbatim): Фото показывает реальное подтопление нижних полок, что согласуется с заявлением о затоплении товара.

#### 3. Лог датчика подтопления

- ID: `ev-sensor`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Visual/service metadata: logPrompt: iot@depot:~$ tail -f /var/log/flood-sensor.log

Evidence text (RU, verbatim):

- 05.06 23:58 — Уровень воды: 0 мм · норма
- 06.06 00:41 — Уровень воды: 12 мм · ВНИМАНИЕ
- 06.06 00:53 — Уровень воды: 47 мм · ТРЕВОГА
- 06.06 01:10 — Уровень воды: 86 мм · ТРЕВОГА · сработала сирена
- 06.06 02:35 — Уровень воды: 90 мм · пик
- 06.06 05:20 — Уровень воды: 31 мм · спад

Status explanation (RU, verbatim): Лог датчика фиксирует резкий подъём воды именно в ночь ливня — это объективно подтверждает затопление склада.

#### 4. Показания охранника

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

«Я дежурил той ночью. После полуночи ливень был такой, что вода пошла под ворота боксов. Я слышал сирену датчика в боксе Болата и видел, как вода стоит на полу до утра. Откачивать начали только на рассвете».

Status explanation (RU, verbatim): Показания охранника независимо подтверждают факт затопления бокса в заявленную ночь.

#### 5. Счёт за восстановление

- ID: `ev-invoice`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Счёт от клининговой и ремонтной компании: откачка воды, сушка помещения, утилизация испорченного товара и замена нижних стеллажей. Итоговая сумма — 3 980 евро, что соответствует заявленным убыткам.

Status explanation (RU, verbatim): Счёт на восстановление соответствует характеру ущерба и заявленной сумме; противоречий нет.

### Final explanation shown to player (RU, verbatim)

- Метеосправка и лог датчика подтверждают ливень и резкий подъём воды.
- Фото и показания охранника независимо доказывают затопление склада.
- Заявление достоверное — его следует одобрить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 26. Поджог склада (`case-028`)

- Campaign position: 26
- Required level: 13
- Data difficulty: Hard (`hard`)
- Claim amount: 18000 EUR
- Evidence count: 5
- Claimant portrait: `people/damir.webp`
- Investigation budget: 3
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Дамир Аскаров, 47 лет**

Role (RU): Заявитель · ИП

- Возраст: 47 лет
- Город: Новосибирск
- Клиент с: 2014 г.
- Полис: Коммерч. имущество · КИ-28333906-X6
- Документ: Паспорт 5412-93 №283339060-68

### Claim text (RU, verbatim)

> В ночь на 14 апреля мой склад сгорел дотла. Я был дома и узнал о пожаре только утром от пожарных. Сигнализация почему-то не сработала. Прошу выплатить страховку за здание и товар — 18000 евро.

### Evidence

#### 1. Запись CCTV

- ID: `ev-cam`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: cameraId: CAM-W7 | cameraModel: SentinelCam SC-2387 · 4K · H.265

Evidence text (RU, verbatim):

Запись наружной камеры от 14 апреля, 02:38. В кадре Дамир один подходит к складу, открывает дверь своим ключом и заходит внутрь. Через девять минут он выходит и быстро уезжает. В 02:54 из окон виден отблеск пламени.

Status explanation (RU, verbatim): Дамир утверждал, что был дома, но камера показывает, как он сам заходит на склад за минуты до возгорания.

#### 2. Лог охранной сигнализации

- ID: `ev-alarm`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: logPrompt: alarmsys@unit:~$ tail -f /var/log/intrusion.log

Evidence text (RU, verbatim):

- 14.04 02:37 — Система ВЗВЕДЕНА · режим «Ночь»
- 14.04 02:39 — СНЯТИЕ С ОХРАНЫ · код пользователя U-01 (владелец: Д. Аскаров)
- 14.04 02:39 — Зона «Главный вход»: открыта
- 14.04 02:48 — Движение в зоне «Склад» · детекторы заглушены вручную
- 14.04 02:49 — Дверь закрыта · постановка пропущена
- 14.04 02:56 — Датчик дыма: СБОЙ ПИТАНИЯ

Status explanation (RU, verbatim): Сигнализация не «не сработала» сама — её сняли с охраны личным кодом владельца за минуты до пожара, а детекторы заглушили вручную.

#### 3. Отчёт пожарной службы

- ID: `ev-fire`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Дознаватель установил, что очаг возгорания находился в центре складского помещения. В пробах обнаружены следы горючей жидкости (ускорителя), что указывает на умышленный поджог. Конкретное лицо в отчёте не названо.

Status explanation (RU, verbatim): Отчёт подлинный и указывает на поджог, но сам по себе не называет виновного — он лишь подтверждает умышленный характер пожара.

#### 4. Фото пожарища

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260414_093150.jpg | imageUrl: evidence/case-028-ev-photo.webp

Evidence text (RU, verbatim):

Снимок внутри сгоревшего склада: обугленные стены и потолок, прогоревшие стеллажи, копоть по всей площади. Помещение полностью выгорело.

Status explanation (RU, verbatim): Фото лишь документирует масштаб пожара и не противоречит заявлению; оно не указывает на причину или виновного.

#### 5. Опись товара

- ID: `ev-inventory`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Складская опись с перечнем хранившегося товара и его заявленной стоимостью на общую сумму около 18000 евро. Документ оформлен заявителем и отражает остатки на дату до пожара.

Status explanation (RU, verbatim): Опись только перечисляет товар и его стоимость; она не противоречит заявлению и не свидетельствует о поджоге.

### Final explanation shown to player (RU, verbatim)

- CCTV фиксирует, как сам владелец заходит на склад за минуты до возгорания.
- Сигнализацию сняли личным кодом владельца и заглушили датчики вручную.
- Это поджог ради страховки — заявление следует отклонить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 27. Удар молнии в дом (`case-029`)

- Campaign position: 27
- Required level: 14
- Data difficulty: Hard (`hard`)
- Claim amount: 9000 EUR
- Evidence count: 6
- Claimant portrait: `people/helena.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Хелена Краузе, 39 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 39 лет
- Город: Гамбург
- Клиент с: 2018 г.
- Полис: Имущество · ИМ-29344017-X9
- Документ: Паспорт DE-X3 889900229-79813

### Claim text (RU, verbatim)

> Во время вечерней грозы молния ударила прямо в мой дом. Раздался оглушительный треск, и почти вся электроника сгорела — телевизор, роутер, холодильник. Прошу компенсацию за повреждённую технику.

### Evidence

#### 1. Метеорологическая справка

- ID: `ev-meteo`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

Гидрометцентр подтверждает: в районе адреса заявителя 18 июня в 21:30 зафиксирована сильная грозовая активность. Датчик грозопеленгации зарегистрировал прямой разряд «облако-земля» в радиусе 40 метров от строения.

Status explanation (RU, verbatim): Справка независимо подтверждает удар молнии в заявленное время и место.

#### 2. Фото повреждений

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: filename: IMG_20260618_214507.jpg | imageUrl: evidence/case-029-ev-photo.webp

Evidence text (RU, verbatim):

Обугленная стенная розетка с чёрными подпалинами, рядом — телевизор с потрескавшейся матрицей и оплавленным сетевым разъёмом. Виден характерный след перегрева на проводке.

Status explanation (RU, verbatim): Характер повреждений соответствует электрическому перенапряжению от удара молнии.

#### 3. Лог умного счётчика

- ID: `ev-surge`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: logPrompt: meter@grid:~$ tail -f /var/log/surge.log

Evidence text (RU, verbatim):

- 21:28:50 — Напряжение: 231 В (норма)
- 21:30:11 — ПРЕДУПРЕЖДЕНИЕ: скачок 231 В → 4180 В
- 21:30:11 — Сработала защита от перенапряжения
- 21:30:12 — Нагрузка отключена: КЗ на линии L2
- 21:30:14 — Потеря связи со счётчиком
- 21:46:03 — Питание восстановлено: 229 В

Status explanation (RU, verbatim): Лог фиксирует резкий скачок напряжения ровно в момент удара молнии — это и есть причина повреждений.

#### 4. Показания соседа

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

«Я как раз закрывал ставни, когда грохнуло так, что заложило уши. Вспышка была прямо над домом Хелены, и сразу у неё в окнах погас свет. У нас тоже на минуту моргнула лампа.»

Status explanation (RU, verbatim): Очевидец независимо подтверждает удар молнии и мгновенное отключение электричества.

#### 5. Заключение электрика

- ID: `ev-electrician`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

Сертифицированный электрик осмотрел проводку и приборы. Вывод: причина выхода из строя техники — импульсное перенапряжение в сети, типичное для грозового разряда. Сетевые фильтры выгорели первыми, что подтверждает внешний источник скачка.

Status explanation (RU, verbatim): Экспертное заключение прямо связывает поломку с грозовым перенапряжением.

#### 6. Банковская выписка

- ID: `ev-bank`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `context`
- Visual/service metadata: bankName: Расчётный отдел № 29 | accountMask: •••• •••• •••• 3357

Evidence text (RU, verbatim):

- 12.02.2026 — «ТехноМаркет», покупка телевизора — 2 990,00 €
- 12.02.2026 — Гарантийная регистрация устройства — 0,00 €
- 03.03.2026 — Оплата ЖКХ — 142,30 €
- 19.06.2026 — Вызов электрика (осмотр) — 80,00 €

Status explanation (RU, verbatim): Выписка доказывает, что заявитель действительно купила повреждённый телевизор за несколько месяцев до происшествия.

### Final explanation shown to player (RU, verbatim)

- Метеосправка и показания соседа подтверждают удар молнии.
- Лог счётчика и заключение электрика доказывают перенапряжение как причину поломки.
- Заявление обоснованно — его следует одобрить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 28. Подстроенное ДТП (`case-030`)

- Campaign position: 28
- Required level: 14
- Data difficulty: Hard (`hard`)
- Claim amount: 15000 EUR
- Evidence count: 6
- Claimant portrait: `people/dejan.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Деян Маркович, 44 года**

Role (RU): Заявитель · физ. лицо

- Возраст: 44 года
- Город: Белград
- Клиент с: 2017 г.
- Полис: КАСКО · КС-30355128-X2
- Документ: Паспорт RS-X7 990011334-80924

### Claim text (RU, verbatim)

> Я ехал по своей полосе, когда впереди идущая машина внезапно затормозила без всякой причины. Я не успел остановиться и въехал в неё. Это полностью вина другого водителя. Прошу возместить ремонт моего автомобиля.

### Evidence

#### 1. Запись видеорегистратора

- ID: `ev-cam`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: cameraId: DVR-2 | cameraModel: RoadLog RL-67 · 1440p · H.264

Evidence text (RU, verbatim):

На записи самого Деяна видно, как передняя машина заранее включает аварийку и плавно сбрасывает скорость на пустой дороге. В тот же момент Деян, вместо торможения, заметно прибавляет газ и направленно въезжает в задний бампер. Тормозных огней его машины почти не видно.

Status explanation (RU, verbatim): Запись опровергает версию: Деян не тормозил, а ускорился и сам въехал в заранее замедлившуюся машину.

#### 2. Детализация звонков

- ID: `ev-phone`
- Type: Phone records (`phone_records`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: carrierName: Оператор связи № 30 | phoneMask: +7 (9••) •••-••-•2

Evidence text (RU, verbatim):

- 16:02 — Входящий, номер «Гараж» — 1 мин 12 с
- 16:48 — Исходящий, «А. (другой водитель)» — 3 мин 41 с
- 16:59 — ДТП (по протоколу)
- 17:05 — Исходящий, страховая линия — 6 мин 20 с
- 18:20 — Исходящий, «А. (другой водитель)» — 2 мин 08 с

Status explanation (RU, verbatim): За 11 минут до «случайного» ДТП Деян звонил «другому водителю» — они были знакомы и заранее общались.

#### 3. Протокол ГИБДД

- ID: `ev-police`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Инспектор зафиксировал столкновение в 16:59 на участке без камер. Повреждения: задний бампер передней машины и передняя часть автомобиля Деяна. Вина в протоколе не установлена — стороны дали противоречивые объяснения, дело оставлено для разбирательства страховой.

Status explanation (RU, verbatim): Протокол лишь фиксирует факт ДТП и не определяет виновного — сам по себе он не уличает заявителя.

#### 4. Фото повреждений

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260530_171522.jpg | imageUrl: evidence/case-030-ev-photo.webp

Evidence text (RU, verbatim):

Снимок передней части автомобиля Деяна: смята решётка радиатора, разбита левая фара, на бампере следы краски второй машины. Повреждения умеренные, соответствуют невысокой скорости.

Status explanation (RU, verbatim): Фото лишь подтверждает наличие повреждений; оно не показывает, кто виноват.

#### 5. Банковская выписка

- ID: `ev-bank`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: bankName: Расчётный отдел № 30 | accountMask: •••• •••• •••• 8806

Evidence text (RU, verbatim):

- 30.05.2026 — Заправка, АЗС «Орбита» — 54,00 €
- 31.05.2026 — Перевод «А. Войнич» (другой водитель) — 1 500,00 €
- 31.05.2026 — Комментарий к переводу: «за помощь»
- 02.06.2026 — Магазин автозапчастей — 210,40 €

Status explanation (RU, verbatim): На следующий день после ДТП Деян перевёл «другому водителю» 1500 € с пометкой «за помощь» — оплата за участие в инсценировке.

#### 6. Показания прохожего

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

«Я шёл по тротуару и услышал глухой удар. Обернулся — две машины стоят, передняя помята сзади. Кто был виноват, не знаю, я увидел уже после столкновения. Водители вышли спокойно, без криков.»

Status explanation (RU, verbatim): Свидетель видел лишь последствия и не противоречит заявлению — его показания нейтральны.

### Final explanation shown to player (RU, verbatim)

- Видеорегистратор показывает, что Деян сам ускорился и въехал в заранее затормозившую машину.
- Звонок «другому водителю» до ДТП и перевод 1500 € после доказывают сговор.
- Заявление мошенническое — его следует отклонить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 29. Град уничтожил теплицу (`case-031`)

- Campaign position: 29
- Required level: 15
- Data difficulty: Hard (`hard`)
- Claim amount: 7000 EUR
- Evidence count: 6
- Claimant portrait: `people/aigul.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Айгуль Сапарова, 36 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 36 лет
- Город: Семей
- Клиент с: 2021 г.
- Полис: Агро · АГ-31366239-X5
- Документ: Паспорт KZ-X4 005123456-791035

### Claim text (RU, verbatim)

> Днём налетел сильнейший град — куски льда размером с грецкий орех. За двадцать минут он пробил поликарбонатную крышу моей теплицы и побил весь урожай томатов и огурцов. Прошу возместить погибшую продукцию и ремонт теплицы.

### Evidence

#### 1. Метеорологическая справка

- ID: `ev-meteo`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Метеослужба подтверждает: 15 июня в 14:10–14:35 в районе хозяйства прошёл сильный град с диаметром градин до 28 мм при шквалистом ветре до 19 м/с. Объявлялось штормовое предупреждение второго уровня.

Status explanation (RU, verbatim): Справка независимо подтверждает сильный град в заявленное время и месте.

#### 2. Аэрофото теплицы

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: DJI_20260615_150218.jpg | imageUrl: evidence/case-031-ev-photo.webp

Evidence text (RU, verbatim):

Снимок с дрона сверху: крыша теплицы испещрена сотнями пробоин, листы поликарбоната проломлены и провисли внутрь. На грядках видны побитые, переломанные растения и слой нерастаявших градин на земле.

Status explanation (RU, verbatim): Картина повреждений сверху полностью соответствует ударам града по крыше.

#### 3. Посты соседей

- ID: `ev-social`
- Type: Social media (`social_media`)
- Contradiction to stamp: **No**
- Visual/service metadata: socialPlatform: circlefeed.local

Evidence text (RU, verbatim):

В сельской группе несколько односельчан выложили фото и видео того же града: лёд на капотах машин, побитые огороды, разбитые парники. Записи отмечены 15 июня, 14:20–14:30, тот же населённый пункт. Десятки комментариев жалуются на ущерб.

Status explanation (RU, verbatim): Независимые посты других жителей подтверждают тот же град в то же время и в том же месте.

#### 4. Показания работника

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

«Я был во дворе, когда небо потемнело и посыпался град — крупный, как орехи, бил больно. Мы с Айгуль еле успели забежать под навес. Сквозь крышу теплицы было слышно, как лёд пробивает поликарбонат. Когда стихло, всё внутри было разбито.»

Status explanation (RU, verbatim): Очевидец подтверждает силу града и разрушение теплицы изнутри хозяйства.

#### 5. Лог климат-датчика теплицы

- ID: `ev-sensor`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Visual/service metadata: logPrompt: greenhouse@farm:~$ tail -f /var/log/climate2.log

Evidence text (RU, verbatim):

- 14:08:30 — Темп: +29.4°C, влажность 61%, кровля: целостность OK
- 14:11:02 — Внешний шум: резкий рост (удары по кровле)
- 14:12:47 — ТРЕВОГА: датчик кровли — нарушение целостности секции C
- 14:13:10 — Темп: +24.1°C (резкое падение), влажность 88%
- 14:18:55 — Темп: +18.7°C, открытый контур: разгерметизация
- 14:36:20 — Шум стих, темп +17.9°C, кровля: 6 секций повреждены

Status explanation (RU, verbatim): Лог фиксирует удары по кровле, пробой секции и резкое падение температуры ровно во время града.

#### 6. Заключение агронома

- ID: `ev-agro`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Сертифицированный агроном обследовал хозяйство. Подтверждена гибель около 90% посадок томатов и огурцов от механических повреждений градом на стадии плодоношения. Оценка потерь урожая и стоимости восстановления кровли соответствует заявленной сумме.

Status explanation (RU, verbatim): Экспертная оценка подтверждает объём ущерба и обоснованность заявленной суммы.

### Final explanation shown to player (RU, verbatim)

- Метеосправка, посты соседей и показания работника подтверждают сильный град.
- Аэрофото, лог датчика и заключение агронома доказывают разрушение теплицы и гибель урожая.
- Заявление обоснованно — его следует одобрить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 30. Исчезнувший внедорожник (`case-032`)

- Campaign position: 30
- Required level: 15
- Data difficulty: Hard (`hard`)
- Claim amount: 22000 EUR
- Evidence count: 6
- Claimant portrait: `people/timur.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Тимур Расулов, 52 года**

Role (RU): Заявитель · физ. лицо

- Возраст: 52 года
- Город: Ростов-на-Дону
- Клиент с: 2015 г.
- Полис: КАСКО · КС-32377340-X8
- Документ: Паспорт 6013-57 №323773401-91

### Claim text (RU, verbatim)

> В ночь на 12 июля у меня угнали внедорожник прямо от гаража. Утром парковочное место было пустым. Я сразу обратился в полицию. Прошу полную страховую выплату за машину.

### Evidence

#### 1. Трекер автомобиля

- ID: `ev-gps`
- Type: GPS track (`gps`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: company: Автослужба маршрутов | department: Отдел мониторинга автопарка | requestId: АВТ-2026-0712-Д · Тип: Полный трек | gpsFooter: © ГеоТрек 2026 · GPS ACC: ±4m

Evidence text (RU, verbatim):

- 11.07 22:48 — Гараж, ул. Садовая (паркинг)
- 12.07 00:15 — Гараж, ул. Садовая (двигатель заглушен)
- 12.07 03:30 — Гараж, ул. Садовая (без движения)
- 12.07 06:02 — Гараж, ул. Садовая (без движения)
- 12.07 08:40 — Гараж, ул. Садовая (без движения)

Status explanation (RU, verbatim): Штатный трекер показывает, что машина всю ночь простояла у гаража и ни разу не сдвинулась — никакого угона не было.

#### 2. Запись уличной камеры

- ID: `ev-cam`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: cameraId: CAM-S5 | cameraModel: VaultCam VC-893 · 4K · H.265

Evidence text (RU, verbatim):

14 июля в 17:22 камера на перекрёстке у рынка фиксирует тот же внедорожник с теми же номерами. За рулём — Тимур, он спокойно проезжает перекрёсток через два дня после «угона».

Status explanation (RU, verbatim): Спустя два дня после заявленного угона Тимур сам управляет «угнанной» машиной — заявление ложное.

#### 3. Заявление об угоне

- ID: `ev-police`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Официальное заявление об угоне, поданное в отдел полиции 12 июля. Указаны марка, цвет и государственный номер автомобиля, время обнаружения пропажи — около 08:40.

Status explanation (RU, verbatim): Заявление в полицию подано по форме и само по себе ничего не доказывает — подача заявления не подтверждает факт угона.

#### 4. Детализация звонков

- ID: `ev-phone`
- Type: Phone records (`phone_records`)
- Contradiction to stamp: **No**
- Visual/service metadata: carrierName: Оператор связи № 32 | phoneMask: +7 (9••) •••-••-•3

Evidence text (RU, verbatim):

- 11.07 20:14 — Исходящий, жена, 4 мин
- 12.07 08:51 — Исходящий, 102 (полиция), 6 мин
- 12.07 11:30 — Входящий, страховая, 9 мин
- 13.07 18:05 — Исходящий, СТО, 3 мин

Status explanation (RU, verbatim): Звонки обычные — жена, полиция, страховая, автосервис. Ничего подозрительного в детализации нет.

#### 5. Банковская выписка

- ID: `ev-bank`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: bankName: АкваФинанс | accountMask: •••• •••• •••• 6643

Evidence text (RU, verbatim):

- 15.07 — Входящий перевод, +180 000 ₽, назначение: «Продажа двигателя и КПП»
- 16.07 — Входящий перевод, +95 000 ₽, назначение: «Колёса, диски, оптика»
- 18.07 — Входящий перевод, +120 000 ₽, назначение: «Кузовные детали, авторазбор»
- 19.07 — Перевод физлицу «Авторазбор СВ», +60 000 ₽

Status explanation (RU, verbatim): После «угона» на счёт поступают деньги за продажу двигателя, колёс и кузовных деталей — машину разобрали и продали по частям.

#### 6. Фото пустого паркоместа

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260712_084112.jpg | imageUrl: evidence/case-032-ev-photo.webp

Evidence text (RU, verbatim):

Снимок пустого парковочного места у гаража, сделанный утром 12 июля. Видны лишь масляные пятна на асфальте и закрытые ворота гаража.

Status explanation (RU, verbatim): Фото лишь показывает пустое место и само по себе не доказывает угон — машина могла отсутствовать по любой причине.

### Final explanation shown to player (RU, verbatim)

- Трекер фиксирует машину у гаража всю ночь — угона не было.
- Камера снимает Тимура за рулём «угнанного» авто через два дня, а на счёт поступают деньги за проданные запчасти.
- Заявление мошенническое и подлежит отклонению.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## Ready-to-use AI review prompt

```text
Answer in Russian. You are a senior narrative designer and retention specialist for detective casual games aimed at players aged 30-60.
Review campaign positions 21-30 below as a sequence, not as isolated pitches. All localized source text is Russian and all solutions are intentionally visible.

For every case, score from 1 to 10: opening hook, curiosity through the last evidence, fairness of deduction, emotional payoff, humor/memorability, clarity for ages 30-60, and urge to start the next case. Identify redundant evidence, premature reveals, weak logic, tonal repetition, reading overload, fan-service dependence, and missed opportunities for recurring-character arcs. Then identify the most likely churn point in this ten-case block. Recommend precise edits to claims, evidence order/content, final explanations, and case order. Tie every recommendation to an expected retention effect. Preserve the restrained paper-folder insurance-investigation tone; no neon, casino, sci-fi, or cartoon treatment.
```
