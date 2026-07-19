# Campaign cases 11-20 - complete Russian source text

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
| 11 | `case-006` | 5 | Винный погреб | Эдуард Виноградов, 59 лет | Hard | 15000 EUR | Fraud / Reject | 4 | 2 | 3 | Standalone claimant |
| 12 | `case-008` | 6 | Травма спины | Деян Ковач | Medium | 6000 EUR | Fraud / Reject | 4 | 2 | - | Standalone claimant |
| 13 | `case-010` | 7 | Удар сзади на светофоре | Матеус Феррейра | Medium | 3500 EUR | Valid claim / Approve | 4 | 0 | - | Standalone claimant |
| 14 | `case-011` | 7 | Кража драгоценностей в доме | Беатрис Колер | Hard | 8000 EUR | Fraud / Reject | 4 | 2 | - | Standalone claimant |
| 15 | `case-012` | 8 | Выплата по критическому заболеванию | Хельга Новак | Medium | 20000 EUR | Valid claim / Approve | 4 | 0 | - | Standalone claimant |
| 16 | `case-014` | 8 | Град на пшеничном поле | Болат Жумабеков, 53 года | Medium | 13000 EUR | Valid claim / Approve | 4 | 0 | - | 16, 25 |
| 17 | `case-015` | 9 | Затонувшая яхта | Рустам Бекетов, 47 лет | Hard | 18000 EUR | Fraud / Reject | 4 | 3 | - | Standalone claimant |
| 18 | `case-016` | 9 | Потоп в магазине | Лейла Каримова, 38 лет | Medium | 7000 EUR | Valid claim / Approve | 4 | 0 | - | Standalone claimant |
| 19 | `case-017` | 10 | Микроволновка-поджигатель | Анатолий Степанович, 71 год | Hard | 2400 EUR | Valid claim / Approve | 4 | 0 | - | 4, 5, 19 |
| 20 | `case-022` | 10 | Кодекс Бусидо | Михаил Тернов, 69 лет | Medium | 2200 EUR | Valid claim / Approve | 4 | 0 | - | 7, 20 |

Range totals: **4 fraud**, **6 valid**, **40 evidence cards**, **1 budget-limited cases**.

## Complete case cards

## 11. Винный погреб (`case-006`)

- Campaign position: 11
- Required level: 5
- Data difficulty: Hard (`hard`)
- Claim amount: 15000 EUR
- Evidence count: 4
- Claimant portrait: `people/eduard.webp`
- Investigation budget: 3
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Эдуард Виноградов, 59 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 59 лет
- Город: Санкт-Петербург
- Клиент с: 2010 г.
- Полис: Ценности · ЦЕ-66102784-X3
- Документ: Паспорт 4008-61 №661027844-52

### Claim text (RU, verbatim)

> Трёхдневное отключение электричества вырубило охлаждение в моём погребе, и моя коллекция марочного вина за 15 000 € погибла. Прошу полную выплату.

### Evidence

#### 1. Справка энергокомпании

- ID: `ev-utility`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Энергокомпания подтверждает отключение электричества на три дня в указанные даты.

Status explanation (RU, verbatim): Отключение действительно было — этот факт подлинный.

#### 2. Лог температуры погреба

- ID: `ev-temp`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: logPrompt: vinotemp@cellar:~$ tail -f /var/log/climate.log

Evidence text (RU, verbatim):

- День 1 — 13 °C
- День 2 — 13 °C
- День 3 — 13 °C

Status explanation (RU, verbatim): Температура в погребе всё время оставалась идеальной — вино не могло испортиться от жары.

#### 3. Показания соседа

- ID: `ev-neighbor`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **Yes**

Evidence text (RU, verbatim):

«Свет вырубили, но Эдуард все выходные гонял генератор без остановки».

Status explanation (RU, verbatim): У заявителя было резервное питание, поэтому охлаждение не прекращалось.

#### 4. Оценка коллекции

- ID: `ev-appraisal`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Независимая оценка стоимости коллекции в 15 000 €. Документ подлинный.

Status explanation (RU, verbatim): Оценка подлинная — коллекция действительно столько стоит. Спор не о цене, а об ущербе.

### Final explanation shown to player (RU, verbatim)

- Отключение и оценка коллекции — подлинные, и они отвлекают внимание.
- Но лог показывает: в погребе всё время держалось 13 °C, а сосед видел работающий генератор.
- Вино не пострадало — ущерба нет. Заявление мошенническое, отклонить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 12. Травма спины (`case-008`)

- Campaign position: 12
- Required level: 6
- Data difficulty: Medium (`medium`)
- Claim amount: 6000 EUR
- Evidence count: 4
- Claimant portrait: `people/dejan.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Деян Ковач**

Role (RU): Заявитель · физ. лицо

- Возраст: 38 лет
- Город: Загреб
- Клиент с: 2019 г.
- Полис: ДМС · МС-88022951-X4
- Документ: Паспорт HR-X3 112233440-59182

### Claim text (RU, verbatim)

> Из-за тяжёлой травмы спины я не могу работать и почти не встаю с постели. Прошу выплату по защите дохода за три месяца нетрудоспособности.

### Evidence

#### 1. Справка из приёмного покоя

- ID: `ev-ernote`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

10.03.2026: жалобы на боль в пояснице, рентген без перелома. Рекомендованы покой 5–7 дней и обезболивающее.

Status explanation (RU, verbatim): Справка подлинная, но описывает лёгкую травму с покоем на неделю — она не подтверждает трёхмесячную нетрудоспособность.

#### 2. Журнал доступа в спортзал

- ID: `ev-gym`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: logPrompt: access@gymnet:~$ tail -f /var/log/entry.log

Evidence text (RU, verbatim):

- 18.03 07:02 — вход, зона свободных весов (62 мин)
- 25.03 06:58 — вход, зона свободных весов (71 мин)
- 01.04 07:10 — вход, становая тяга, личный рекорд 140 кг
- 09.04 06:55 — вход, зона свободных весов (68 мин)

Status explanation (RU, verbatim): Клиент заявляет, что прикован к постели, но карта доступа фиксирует регулярные тяжёлые тренировки в период больничного.

#### 3. Фото с марафона

- ID: `ev-marathon`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: filename: IMG_20260412_103842.jpg | imageUrl: evidence/case-008-ev-marathon.webp

Evidence text (RU, verbatim):

Снимок из соцсети с датой 12.04.2026: клиент пересекает финиш городского марафона с медалью и временем 3:48.

Status explanation (RU, verbatim): Завершение марафона физически несовместимо с заявленной трёхмесячной прикованностью к постели из-за травмы спины.

#### 4. Письмо работодателя

- ID: `ev-employer`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Отдел кадров подтверждает, что сотрудник находится на оплачиваемом больничном с 11.03.2026 и за этот период не выходил на работу.

Status explanation (RU, verbatim): Письмо лишь подтверждает факт больничного и не противоречит истории — противоречие создают тренировки и марафон.

### Final explanation shown to player (RU, verbatim)

- Карта доступа фиксирует регулярные тяжёлые тренировки во время больничного.
- Датированное фото показывает завершённый марафон после травмы.
- Заявление о прикованности к постели ложно — это мошенничество, отказать.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 13. Удар сзади на светофоре (`case-010`)

- Campaign position: 13
- Required level: 7
- Data difficulty: Medium (`medium`)
- Claim amount: 3500 EUR
- Evidence count: 4
- Claimant portrait: `people/mateus.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Матеус Феррейра**

Role (RU): Заявитель · физ. лицо

- Возраст: 31 год
- Город: Лиссабон
- Клиент с: 2022 г.
- Полис: КАСКО · КС-10145182-X2
- Документ: Паспорт PT-X4 445566779-13048

### Claim text (RU, verbatim)

> Я стоял на красный свет, когда в мою машину сзади въехал другой автомобиль. У меня диагностировали хлыстовую травму шеи, и бампер пришлось чинить. Прошу компенсацию лечения и ремонта.

### Evidence

#### 1. Запись видеорегистратора

- ID: `ev-dashcam`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **No**
- Visual/service metadata: cameraId: DVR-F | cameraModel: RoadEye RX-900 · 4K · H.265

Evidence text (RU, verbatim):

- 14:02:09 — автомобиль остановлен у стоп-линии, сигнал светофора красный
- 14:02:21 — в зеркале заднего вида приближается седан, не снижая скорости
- 14:02:23 — удар сзади, камера резко дёргается вперёд
- 14:02:40 — водитель второго авто выходит и признаёт вину

Status explanation (RU, verbatim): Запись подтверждает версию: машина стояла на красный и получила удар сзади.

#### 2. Выписка из приёмного покоя

- ID: `ev-er`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Пациент поступил в 15:10 в день ДТП с болью в шее и ограничением подвижности. Диагноз: хлыстовая травма шейного отдела (растяжение связок). Назначены обезболивающие и физиотерапия.

Status explanation (RU, verbatim): Время и характер травмы соответствуют ДТП, зафиксированному на видео.

#### 3. Протокол ДТП

- ID: `ev-police`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Зарегистрировано столкновение на перекрёстке Авенида-Сентраль в 14:05. Вина возложена на водителя заднего автомобиля за несоблюдение дистанции. Заявитель указан как пострадавшая сторона.

Status explanation (RU, verbatim): Официальный протокол подтверждает место, время и виновника, совпадая с показаниями.

#### 4. Смета автосервиса

- ID: `ev-estimate`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Повреждения задней части: деформирован бампер, кронштейн и фонарь. Оценка ремонта — 2 100 €. Характер деформации соответствует удару сзади.

Status explanation (RU, verbatim): Сумма и тип повреждений логично вытекают из зафиксированного столкновения.

### Final explanation shown to player (RU, verbatim)

- Видеорегистратор показывает удар сзади на красный свет.
- Медицинская выписка и протокол ДТП совпадают по времени и фактам.
- Повреждения и смета соответствуют столкновению — претензия обоснована.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 14. Кража драгоценностей в доме (`case-011`)

- Campaign position: 14
- Required level: 7
- Data difficulty: Hard (`hard`)
- Claim amount: 8000 EUR
- Evidence count: 4
- Claimant portrait: `people/beatrice.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Беатрис Колер**

Role (RU): Заявитель · физ. лицо

- Возраст: 52 года
- Город: Цюрих
- Клиент с: 2012 г.
- Полис: Ценности · ЦЕ-11156293-X5
- Документ: Паспорт CH-X1 556677882-24059

### Claim text (RU, verbatim)

> Пока меня не было дома в ночь на 8 мая, кто-то проник внутрь и украл все мои украшения из спальни. Сигнализация почему-то не сработала. Прошу выплату по описи драгоценностей.

### Evidence

#### 1. Заключение слесаря-криминалиста

- ID: `ev-forensic`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**

Evidence text (RU, verbatim):

Осмотр дверей и окон: следов взлома, отжима или повреждения замков нет. Журнал сигнализации показывает, что система была снята с охраны в 23:14 корректным кодом владельца, а не отключена силой.

Status explanation (RU, verbatim): Нет следов взлома, а сигнализация снята личным кодом владелицы — это противоречит версии о проникновении чужого.

#### 2. Журнал умного дверного звонка

- ID: `ev-doorbell`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: cameraId: BELL-1 | cameraModel: EntryCam EC-202 · 1080p · H.264

Evidence text (RU, verbatim):

- 7 мая, 22:48 — владелица выносит две закрытые коробки к багажнику автомобиля
- 7 мая, 22:53 — возвращается, выносит ещё одну коробку и сумку
- 7 мая, 23:10 — машина выезжает с подъездной дорожки
- 8 мая — за весь день у двери не зафиксировано посторонних

Status explanation (RU, verbatim): Владелица сама вывезла коробки за день до «кражи», и посторонних у двери не было — это опровергает версию о грабителе.

#### 3. Полицейское заявление

- ID: `ev-police`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

8 мая в 09:20 заявительница официально подала заявление о краже со взломом, перечислив пропавшие украшения. Дело зарегистрировано под номером, открыто расследование.

Status explanation (RU, verbatim): Само заявление в полицию реально, но лишь фиксирует слова заявительницы и не подтверждает факт взлома.

#### 4. Оценка драгоценностей

- ID: `ev-appraisal`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Сертифицированный геммолог оценил перечисленные изделия в феврале того же года в 7 800 €. Документ подлинный, описания соответствуют заявленному списку.

Status explanation (RU, verbatim): Оценка подлинная и подтверждает стоимость, но не говорит ничего о том, как именно вещи исчезли.

### Final explanation shown to player (RU, verbatim)

- Нет следов взлома, а сигнализация снята личным кодом владелицы.
- Камера показывает, что она сама вывезла коробки за день до «кражи».
- Заявление и оценка подлинны, но не доказывают факт ограбления — это инсценировка.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 15. Выплата по критическому заболеванию (`case-012`)

- Campaign position: 15
- Required level: 8
- Data difficulty: Medium (`medium`)
- Claim amount: 20000 EUR
- Evidence count: 4
- Claimant portrait: `people/helga.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Хельга Новак**

Role (RU): Заявитель · физ. лицо

- Возраст: 49 лет
- Город: Вена
- Клиент с: 2014 г.
- Полис: ДМС · МС-12167340-X8
- Документ: Паспорт AT-X6 667788993-35160

### Claim text (RU, verbatim)

> В марте мне диагностировали рак молочной железы, я прошла операцию и сейчас на химиотерапии. Это заболевание входит в мой полис критических заболеваний. Прошу единовременную выплату.

### Evidence

#### 1. Больничный диагноз

- ID: `ev-diagnosis`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Биопсия от 12 марта подтвердила инвазивную карциному молочной железы, стадия II. Гистология и протокол операции от 28 марта приложены к карте пациента.

Status explanation (RU, verbatim): Официальный диагноз с биопсией прямо подтверждает заявленное заболевание.

#### 2. Письмо онколога

- ID: `ev-oncologist`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Лечащий онколог подтверждает диагноз злокачественного новообразования молочной железы и проводимый курс химиотерапии. Состояние соответствует определению покрываемого заболевания в полисе.

Status explanation (RU, verbatim): Специалист прямо указывает, что состояние подпадает под покрытие полиса.

#### 3. Журнал выдачи лекарств

- ID: `ev-pharmacy`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Visual/service metadata: logPrompt: pharma@rxsys:~$ tail -f /var/log/dispensary.log

Evidence text (RU, verbatim):

- 2 апреля — выдан препарат для химиотерапии (цикл 1)
- 23 апреля — выдан противорвотный препарат и цикл 2
- 14 мая — цикл 3, сопроводительная терапия
- Все назначения подписаны лечащим онкологом

Status explanation (RU, verbatim): Регулярная выдача химиопрепаратов соответствует заявленному лечению и срокам.

#### 4. Полис критических заболеваний

- ID: `ev-policy`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Полис действует с прошлого года, взносы уплачены. В перечне покрываемых состояний прямо указан рак, требующий хирургии или химиотерапии. Период ожидания пройден.

Status explanation (RU, verbatim): Полис активен, период ожидания пройден, и заболевание прямо входит в покрытие.

### Final explanation shown to player (RU, verbatim)

- Биопсия и операция подтверждают рак молочной железы II стадии.
- Письмо онколога и журнал аптеки соответствуют курсу химиотерапии.
- Полис активен и прямо покрывает это заболевание — выплата обоснована.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 16. Град на пшеничном поле (`case-014`)

- Campaign position: 16
- Required level: 8
- Data difficulty: Medium (`medium`)
- Claim amount: 13000 EUR
- Evidence count: 4
- Claimant portrait: `people/bolat.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: Yes; campaign positions 16, 25

### Claimant

**Болат Жумабеков, 53 года**

Role (RU): Заявитель · физ. лицо

- Возраст: 53 года
- Город: Астана
- Клиент с: 2009 г.
- Полис: Агро · АГ-14189562-X4
- Документ: Паспорт KZ-X8 002786431-581034

### Claim text (RU, verbatim)

> В июле над моими полями прошёл сильный град. Колосья пшеницы полностью полегли и были выбиты. Прошу компенсацию за погибший урожай.

### Evidence

#### 1. Метеорологическая сводка

- ID: `ev-meteo`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Гидрометцентр подтверждает сильный град диаметром до 3 см над районом 12 июля, в день, указанный в заявлении.

Status explanation (RU, verbatim): Сводка совпадает с датой и местом происшествия и подтверждает рассказ фермера.

#### 2. Снимки поля с дрона

- ID: `ev-aerial`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: DJI_20260712_143221.jpg | imageUrl: evidence/case-014-ev-aerial.webp

Evidence text (RU, verbatim):

Аэрофотоснимки показывают полегшую пшеницу с характерным рисунком повреждений от града по всей площади поля.

Status explanation (RU, verbatim): Картина повреждений соответствует граду и масштабу заявленного ущерба.

#### 3. Заключение агронома

- ID: `ev-agronomist`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Независимый агроном оценил потерю урожая на участке в 85% и стоимость ущерба около 13 000 евро.

Status explanation (RU, verbatim): Независимая оценка совпадает с заявленной суммой и подтверждает масштаб потерь.

#### 4. Договор поставки урожая

- ID: `ev-contract`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Заключённый ещё весной договор с зернотрейдером на поставку ожидаемого урожая с этого поля по согласованной цене.

Status explanation (RU, verbatim): Договор подтверждает ожидаемую урожайность и обоснованность размера убытка.

### Final explanation shown to player (RU, verbatim)

- Метеосводка подтверждает сильный град в день и место заявления.
- Снимки и оценка агронома сходятся с масштабом потерь.
- Заявление достоверно, его следует одобрить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 17. Затонувшая яхта (`case-015`)

- Campaign position: 17
- Required level: 9
- Data difficulty: Hard (`hard`)
- Claim amount: 18000 EUR
- Evidence count: 4
- Claimant portrait: `people/rustam.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Рустам Бекетов, 47 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 47 лет
- Город: Сочи
- Клиент с: 2016 г.
- Полис: КАСКО · ВТ-15190673-X7
- Документ: Паспорт 2314-88 №917206753-61

### Claim text (RU, verbatim)

> В субботу я вышел в море на своей моторной яхте. В открытом море нас застал шторм, судно дало течь и затонуло. Я едва спасся. Прошу выплату за погибшую яхту.

### Evidence

#### 1. Журнал швартовки и CCTV гавани

- ID: `ev-cctv`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: cameraId: CAM-B7 | cameraModel: SentinelCam SC-1448 · 4K · H.265

Evidence text (RU, verbatim):

- Пт 18:00 — яхта пришвартована, причал B-7
- Сб 09:30 — судно у причала, камера 3
- Сб 16:10 — судно у причала, камера 3
- Вс 08:00 — судно у причала, камера 3

Status explanation (RU, verbatim): Камеры показывают яхту у причала всю субботу — в день, когда она якобы затонула в море.

#### 2. Данные AIS-транспондера

- ID: `ev-ais`
- Type: GPS track (`gps`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: company: Морская служба контроля | department: Служба мониторинга судоходства | requestId: МОР-2026-0522-В · Тип: AIS-транспондер | gpsFooter: © Морская служба контроля 2026 · AIS ACC: ±10m

Evidence text (RU, verbatim):

Последняя зафиксированная позиция транспондера судна — координаты причала B-7 в марине; выходов в открытое море за выходные не зарегистрировано.

Status explanation (RU, verbatim): Транспондер фиксирует судно только у причала, а не в открытом море, где оно якобы затонуло.

#### 3. Метеосводка по акватории

- ID: `ev-weather`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**

Evidence text (RU, verbatim):

Морская метеослужба сообщает о штиле в субботу: волнение 1 балл, ветер 3 м/с, штормовых предупреждений не было.

Status explanation (RU, verbatim): В заявленный день стояла штилевая погода — шторм, на который ссылается клиент, не существовал.

#### 4. Оценка и регистрация судна

- ID: `ev-valuation`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Подлинное регистрационное свидетельство и оценка судна на сумму около 18 000 евро.

Status explanation (RU, verbatim): Документ подлинный и лишь подтверждает стоимость судна, не противореча делу.

### Final explanation shown to player (RU, verbatim)

- CCTV и AIS показывают яхту у причала весь день предполагаемой гибели.
- Метеосводка фиксирует штиль — заявленного шторма не было.
- Заявление мошенническое, его следует отклонить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 18. Потоп в магазине (`case-016`)

- Campaign position: 18
- Required level: 9
- Data difficulty: Medium (`medium`)
- Claim amount: 7000 EUR
- Evidence count: 4
- Claimant portrait: `people/leyla.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Лейла Каримова, 38 лет**

Role (RU): Заявитель · ИП

- Возраст: 38 лет
- Город: Казань
- Клиент с: 2018 г.
- Полис: Коммерч. имущество · КИ-16201784-X0
- Документ: Паспорт 9216-43 №162017840-72

### Claim text (RU, verbatim)

> На нашей улице прорвало водопровод, и мой магазин затопило. Товар испорчен, я не могла работать несколько дней. Прошу возместить ущерб и потерю дохода.

### Evidence

#### 1. Справка городской службы

- ID: `ev-municipal`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Городской водоканал подтверждает аварийный прорыв магистрали на этой улице 3 апреля и аварийные работы в тот же день.

Status explanation (RU, verbatim): Официальная справка подтверждает причину и дату потопа из рассказа клиента.

#### 2. Фото затопленного магазина

- ID: `ev-photos`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260403_091218.jpg | imageUrl: evidence/case-016-ev-photos.webp

Evidence text (RU, verbatim):

Фотографии показывают залитый водой пол магазина и испорченный товар на нижних полках.

Status explanation (RU, verbatim): Снимки соответствуют затоплению с уровня пола, как при прорыве водопровода.

#### 3. Книга учёта дохода

- ID: `ev-ledger`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Бухгалтер приложил выписку, показывающую обычную дневную выручку и нулевые продажи в четыре дня закрытия после аварии.

Status explanation (RU, verbatim): Учётные данные подтверждают потерю дохода именно за дни вынужденного закрытия.

#### 4. Счёт компании по восстановлению

- ID: `ev-restoration`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Счёт от клининговой компании за откачку воды, сушку и восстановление помещения после потопа.

Status explanation (RU, verbatim): Счёт согласуется с характером и масштабом заявленного ущерба от воды.

### Final explanation shown to player (RU, verbatim)

- Городская служба подтверждает прорыв водопровода на улице в нужный день.
- Фото, бухгалтерия и счёт согласуются с ущербом и потерей дохода.
- Заявление достоверно, его следует одобрить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 19. Микроволновка-поджигатель (`case-017`)

- Campaign position: 19
- Required level: 10
- Data difficulty: Hard (`hard`)
- Claim amount: 2400 EUR
- Evidence count: 4
- Claimant portrait: `people/anatoly.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: Yes; campaign positions 4, 5, 19

### Claimant

**Анатолий Степанович, 71 год**

Role (RU): Заявитель · физ. лицо

- Возраст: 71 год
- Город: Воронеж
- Клиент с: 2012 г.
- Полис: Имущество · ИМ-17212895-X3
- Документ: Паспорт 3609-71 №172128951-83

### Claim text (RU, verbatim)

> Настоящим довожу до вашего сведения о внештатном происшествии. В ночь на 14 марта моя умная микроволновая печь самопроизвольно открыла дверцу, поместила внутрь один кожаный ботинок и запекла его на мощности 800 Вт. Впоследствии голосовой помощник оформил заказ на 20 кг отборных грецких орехов, после чего произошло короткое замыкание и возгорание кухни. Прошу возместить причинённый ущерб согласно полису.

### Evidence

#### 1. Счёт ветеринарной клиники

- ID: `ev-vet`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Енот по кличке Жорик доставлен ночью 14 марта с опалёнными усами и лёгким ожогом задней части. От шерсти исходит запах жжёного грецкого ореха и палёной кожи.

Status explanation (RU, verbatim): Травмы енота совпадают с описанным возгоранием и не противоречат делу.

#### 2. Фото места возгорания

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260314_021903.jpg | imageUrl: evidence/case-017-ev-photo.jpg

Evidence text (RU, verbatim):

Внутри оплавленной микроволновой печи лежит обугленный кожаный ботинок. Дверца распахнута, стекло закопчено, на корпусе следы маленьких лап.

Status explanation (RU, verbatim): Фото наглядно подтверждает запечённый ботинок и оплавленную печь.

#### 3. Журнал умной колонки

- ID: `ev-speaker`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Visual/service metadata: logPrompt: smarthome@kitchen:~$ tail -f /var/log/voice.log

Evidence text (RU, verbatim):

- 02:13:47 — Кнопка быстрого старта: запуск печи, мощность 800 Вт
- 02:14:09 — Распознана голосовая команда: «Крррр-цок-щёлк»
- 02:14:11 — Оформлен заказ: грецкий орех отборный, 20 кг
- 02:16:32 — Скачок тока: короткое замыкание, линия обесточена

Status explanation (RU, verbatim): Журнал колонки по секундам подтверждает запуск печи, заказ орехов и замыкание — ровно как в заявлении.

#### 4. Заключение дознавателя

- ID: `ev-fire`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Очаг возгорания — микроволновая печь. Внутри обнаружен кожаный предмет, запекавшийся на максимальной мощности. Причина короткого замыкания — перегрузка линии. Следов поджога и горючих жидкостей не выявлено.

Status explanation (RU, verbatim): Официальное заключение полностью совпадает с версией заявителя.

### Final explanation shown to player (RU, verbatim)

- История звучит абсурдно, но каждая улика её подтверждает.
- На самом деле Жорик прятал краденый ботинок в микроволновке и своим пышным задом нажал кнопку быстрого старта.
- Его болтовня «крррр-цок-щёлк» сработала как голосовая команда колонке. Противоречий нет — заявление подлинное, одобряем.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 20. Кодекс Бусидо (`case-022`)

- Campaign position: 20
- Required level: 10
- Data difficulty: Medium (`medium`)
- Claim amount: 2200 EUR
- Evidence count: 4
- Claimant portrait: `people/khariton.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: Yes; campaign positions 7, 20

### Claimant

**Михаил Тернов, 69 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 69 лет
- Город: Нижний Новгород
- Клиент с: 2008 г.
- Полис: Имущество · ИМ-22267340-X8
- Документ: Паспорт 2207-69 №212562391-05

### Claim text (RU, verbatim)

> С болью извещаю о ночном погроме. Неизвестные взломали моё додзё, изрезали татами и сорвали со стены церемониальную катану — реликвию школы. Полагаю это нападением конкурентов и прошу возместить ущерб и стоимость похищенной катаны согласно полису.

### Evidence

#### 1. Запись камеры додзё

- ID: `ev-cctv`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **No**
- Visual/service metadata: cameraId: CAM-DJ1 | cameraModel: WatchCam WC-8 · 2K · H.265

Evidence text (RU, verbatim):

- 02:12:30 · Двое взрослых в чёрных костюмах с серебряным логотипом «СЕВЕРНЫЙ ДВОР» вскрывают замок
- 02:14:05 · Они снимают со стены катану и режут татами
- 02:15:20 · Уносят реликвию к чёрному фургону; цветных бандан ни на ком нет

Status explanation (RU, verbatim): Запись прямо показывает взрослых из «СЕВЕРНЫЙ ДВОР», а не учеников — это подтверждает заявление.

#### 2. Сертификат турнира

- ID: `ev-tournament`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

- Региональная федерация карате · сертификат участника
- Леонид (ученик спортклуба «Факел») — 1 место, ката
- Время выступления: 21:00–23:30, г. Дальногорск (200 км от додзё)
- Подтверждено судейской коллегией и видеотрансляцией

Status explanation (RU, verbatim): Леонид в ночь погрома брал золото за 200 км — у учеников железное алиби.

#### 3. Фото места погрома

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Visual/service metadata: filename: IMG_20260622_021712.jpg | imageUrl: evidence/case-022-ev-photo.jpg

Evidence text (RU, verbatim):

Интерьер додзё: порезанные татами, пустое крепление для катаны на стене, а на полу — обронённая клубная карта-пропуск «СЕВЕРНЫЙ ДВОР».

Status explanation (RU, verbatim): Карта-пропуск «СЕВЕРНЫЙ ДВОР» на месте прямо указывает на людей Арсенова.

#### 4. Показания соседа

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

«Около 02:30 от додзё отъехал чёрный фургон с надписью СЕВЕРНЫЙ ДВОР. За рулём — крупный мужчина в костюме, точно не подросток».

Status explanation (RU, verbatim): Независимый свидетель видел взрослого на фургоне «СЕВЕРНЫЙ ДВОР» — согласуется с делом.

### Final explanation shown to player (RU, verbatim)

- Камеры и найденный пропуск указывают на взрослых налётчиков.
- Погром устроил «СЕВЕРНЫЙ ДВОР» Арсенова: камера сняла взрослых в чёрном с серебряным логотипом, на полу — их карта-пропуск, сосед видел фургон.
- Ученики ни при чём: Леонид в это время брал золото на турнире за 200 км. Противоречий нет — заявление подлинное, одобряем.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## Ready-to-use AI review prompt

```text
Answer in Russian. You are a senior narrative designer and retention specialist for detective casual games aimed at players aged 30-60.
Review campaign positions 11-20 below as a sequence, not as isolated pitches. All localized source text is Russian and all solutions are intentionally visible.

For every case, score from 1 to 10: opening hook, curiosity through the last evidence, fairness of deduction, emotional payoff, humor/memorability, clarity for ages 30-60, and urge to start the next case. Identify redundant evidence, premature reveals, weak logic, tonal repetition, reading overload, fan-service dependence, and missed opportunities for recurring-character arcs. Then identify the most likely churn point in this ten-case block. Recommend precise edits to claims, evidence order/content, final explanations, and case order. Tie every recommendation to an expected retention effect. Preserve the restrained paper-folder insurance-investigation tone; no neon, casino, sci-fi, or cartoon treatment.
```
