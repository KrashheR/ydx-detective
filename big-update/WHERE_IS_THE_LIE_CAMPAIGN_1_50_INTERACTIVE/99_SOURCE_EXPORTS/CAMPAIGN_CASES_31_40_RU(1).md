# Campaign cases 31-40 - complete Russian source text

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
| 31 | `case-033` | 16 | Рука в прессе | Геннадий Орлов, 49 лет | Hard | 11000 EUR | Valid claim / Approve | 6 | 0 | 4 | Standalone claimant |
| 32 | `case-034` | 16 | Большой пожар на складе | Харитон Велижанин, 55 лет | Hard | 30000 EUR | Fraud / Reject | 6 | 4 | - | Standalone claimant |
| 33 | `case-035` | 16 | Инспекторы необычного ущерба | Аркадий Егоров, 52 года | Hard | 12500 EUR | Fraud / Reject | 6 | 5 | 4 | Standalone claimant |
| 34 | `case-036` | 16 | Гроза у подстанции | Максим Ярцев, 41 год | Hard | 9800 EUR | Valid claim / Approve | 6 | 0 | 4 | Standalone claimant |
| 35 | `case-037` | 16 | Кража хромированных манекенов | Денис Корин, 55 лет | Hard | 15000 EUR | Fraud / Reject | 6 | 5 | 4 | Standalone claimant |
| 36 | `case-038` | 16 | Лаборатория № 394 | Антон Ланской, 46 лет | Hard | 11200 EUR | Valid claim / Approve | 6 | 0 | 4 | Standalone claimant |
| 37 | `case-039` | 16 | Ночной демонтаж панелей | Никита Воронов, 38 лет | Hard | 18400 EUR | Fraud / Reject | 6 | 4 | 4 | Standalone claimant |
| 38 | `case-040` | 16 | Сгоревший груз на лунной ферме | Мирон Вейл, 52 года | Hard | 22100 EUR | Fraud / Reject | 6 | 5 | 4 | Standalone claimant |
| 39 | `case-041` | 16 | Потерянный перехватчик в ледяном каньоне | Элиан Корд, 27 лет | Hard | 31600 EUR | Fraud / Reject | 6 | 5 | 4 | Standalone claimant |
| 40 | `case-042` | 16 | Пропавший церемониальный клинок | Селена Орвик, 34 года | Hard | 42800 EUR | Fraud / Reject | 6 | 5 | 4 | Standalone claimant |

Range totals: **7 fraud**, **3 valid**, **60 evidence cards**, **9 budget-limited cases**.

## Complete case cards

## 31. Рука в прессе (`case-033`)

- Campaign position: 31
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 11000 EUR
- Evidence count: 6
- Claimant portrait: `people/gennady.webp`
- Investigation budget: 4
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Геннадий Орлов, 49 лет**

Role (RU): Заявитель · физ. лицо

- Возраст: 49 лет
- Город: Самара
- Клиент с: 2016 г.
- Полис: НС · НС-33388451-X1
- Документ: Паспорт 6314-80 №333884512-02

### Claim text (RU, verbatim)

> Я работаю оператором штамповочного пресса. 3 марта пресс сработал раньше времени и зажал мне правую кисть. Меня увезли в травмпункт, наложили гипс. Прошу выплату за производственную травму и потерю трудоспособности.

### Evidence

#### 1. Заключение приёмного отделения

- ID: `ev-medical`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

3 марта, 14:38 — пациент Орлов Г. доставлен бригадой скорой с производства. Диагноз: закрытый перелом II и III пястных костей правой кисти, обширная гематома, ушиб мягких тканей. Наложена гипсовая лонгета. Механизм травмы — сдавление прессом.

Status explanation (RU, verbatim): Медицинское заключение фиксирует травму, время и механизм, полностью совпадающие с рассказом заявителя.

#### 2. Фото пресса

- ID: `ev-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: filename: IMG_20260303_145503.jpg | imageUrl: evidence/case-033-ev-photo.webp

Evidence text (RU, verbatim):

Снимок штамповочного пресса в цеху, сделанный 3 марта. На рабочей зоне видны следы крови и согнутая защитная решётка, аварийная кнопка нажата.

Status explanation (RU, verbatim): Фото подтверждает место и характер происшествия и согласуется с заявлением.

#### 3. Лог пресса (PLC)

- ID: `ev-machine`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: logPrompt: plc@assembly:~$ tail -f /var/log/press.log

Evidence text (RU, verbatim):

- 14:31:02 — Цикл #4471 завершён штатно
- 14:33:50 — Оператор: смена детали, рука в зоне штампа
- 14:33:51 — ОШИБКА E07: ложное срабатывание датчика педали
- 14:33:51 — Ход ползуна инициирован БЕЗ команды оператора
- 14:33:52 — Защитная блокировка НЕ сработала (реле залипло)
- 14:33:55 — Аварийный стоп нажат вручную
- 14:34:10 — Линия остановлена, вызвана бригада

Status explanation (RU, verbatim): Лог PLC показывает ложное срабатывание и несработавшую блокировку ровно в момент травмы — техника подтверждает несчастный случай.

#### 4. Показания напарника

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`

Evidence text (RU, verbatim):

«Я стоял у соседнего станка. Пресс лязгнул сам, без нажатия педали, я только услышал крик Гены. Кинулся, ударил по аварийной кнопке. Решётка была погнута, рука зажата. Всё произошло за секунду.»

Status explanation (RU, verbatim): Очевидец независимо подтверждает самопроизвольное срабатывание пресса и травму — согласуется с логом и заявлением.

#### 5. Рентгеновский снимок кисти

- ID: `ev-xray`
- Type: X-ray (`xray`)
- Contradiction to stamp: **No**
- Authoring relation: `supports`
- Visual/service metadata: clinicName: ООО «ТравмаЦентр» · Рентген-диагностика | imageUrl: evidence/case-033-ev-xray.webp

Evidence text (RU, verbatim):

Рентгенограмма правой кисти от 3 марта: чёткие линии перелома II и III пястных костей со смещением, без признаков застарелых травм. Сопоставимо со свежим сдавлением.

Status explanation (RU, verbatim): Снимок показывает свежий перелом нужных костей без старых повреждений — травма реальна и недавняя.

#### 6. Акт проверки охраны труда

- ID: `ev-safety`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

Комиссия по охране труда от 5 марта: подтверждён отказ защитной блокировки пресса (залипшее реле), зафиксировано ложное срабатывание датчика педали. Вины оператора нет; рекомендована замена узла. Случай признан производственным.

Status explanation (RU, verbatim): Официальный акт признаёт неисправность оборудования и отсутствие вины оператора — травма признана производственной.

### Final explanation shown to player (RU, verbatim)

- Медзаключение и рентген фиксируют свежий перелом от сдавления прессом.
- Лог PLC и акт охраны труда подтверждают неисправность блокировки, а очевидец — самопроизвольное срабатывание.
- Случай подлинный и страховое возмещение следует одобрить.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 32. Большой пожар на складе (`case-034`)

- Campaign position: 32
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 30000 EUR
- Evidence count: 6
- Claimant portrait: `people/khariton.webp`
- Investigation budget: None; all evidence can be opened
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Харитон Велижанин, 55 лет**

Role (RU): Заявитель · ИП

- Возраст: 55 лет
- Город: Пермь
- Клиент с: 2011 г.
- Полис: Коммерч. имущество · КИ-34399562-X4
- Документ: Паспорт 5709-26 №343995623-13

### Claim text (RU, verbatim)

> В ночь на 20 мая мой торговый склад полностью выгорел. Сгорел весь товар — электроника и бытовая техника на тридцать тысяч евро. Это был несчастный случай, проводка. Прошу выплату по полису в полном объёме.

### Evidence

#### 1. Запись камеры склада

- ID: `ev-cam`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: cameraId: CAM-F1 | cameraModel: UniCam UC-3614 · 4K · H.265

Evidence text (RU, verbatim):

19 мая, 22:10–23:40 — на записи видно, как двое сотрудников под руководством Харитона грузят коробки с телевизорами и техникой в фургон и вывозят их со склада. К утру стеллажи в кадре стоят почти пустыми, ещё до пожара.

Status explanation (RU, verbatim): Накануне пожара ценный товар вывезли со склада — гореть «на тридцать тысяч» было уже нечему.

#### 2. Лог пожарной панели

- ID: `ev-panel`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: logPrompt: scada@plant:~$ tail -f /var/log/fire-panel.log

Evidence text (RU, verbatim):

- 19.05 21:58 — Вход в меню обслуживания (код администратора)
- 19.05 22:01 — Зона 1–6: детекторы дыма ПЕРЕВЕДЕНЫ В РУЧНОЕ ОТКЛЮЧЕНИЕ
- 19.05 22:02 — Звуковое оповещение и автонабор 101 ОТКЛЮЧЕНЫ
- 19.05 22:03 — Выход из меню обслуживания
- 20.05 02:14 — Зона 4: тепловой порог превышен (детектор заглушен, тревоги нет)
- 20.05 02:41 — Зона 2: тепловой порог превышен (тревоги нет)
- 20.05 03:05 — Внешний вызов 101 с улицы (прохожий)

Status explanation (RU, verbatim): За четыре часа до пожара пожарные датчики и автодозвон были вручную отключены под кодом администратора — пожар не мог быть случайным.

#### 3. Банковская выписка

- ID: `ev-bank`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: bankName: Расчётный отдел № 34 | accountMask: •••• •••• •••• 1129

Evidence text (RU, verbatim):

- 01.05 — Остаток по счёту: −1 250 000 ₽ (овердрафт)
- 05.05 — Просрочен платёж по кредиту, начислена пеня
- 12.05 — Списание: арендная плата за склад НЕ ПРОШЛА (недостаточно средств)
- 17.05 — УВЕДОМЛЕНИЕ БАНКА: дефолт по кредиту, требование о погашении
- 18.05 — Заблокирована кредитная линия предприятия

Status explanation (RU, verbatim): За три дня до пожара бизнес был в дефолте по кредиту с миллионным долгом — налицо финансовый мотив поджога.

#### 4. Детализация звонков

- ID: `ev-phone`
- Type: Phone records (`phone_records`)
- Contradiction to stamp: **No**
- Visual/service metadata: carrierName: Оператор связи № 34 | phoneMask: +7 (9••) •••-••-•4

Evidence text (RU, verbatim):

- 19.05 19:20 — Исходящий, поставщик, 5 мин
- 20.05 03:10 — Исходящий, 101 (пожарные), 4 мин
- 20.05 07:45 — Входящий, страховая, 8 мин
- 20.05 12:30 — Исходящий, бухгалтер, 6 мин

Status explanation (RU, verbatim): Звонки обычные — поставщик, пожарные, страховая, бухгалтер. Сами по себе они ничего не выдают.

#### 5. Заключение дознавателя

- ID: `ev-fire`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Акт пожарно-технической экспертизы от 22 мая: очаг возгорания — в торговом зале, в нескольких независимых точках. Обнаружены следы интенсификатора горения (нефтепродукт). Версия о неисправности проводки не подтверждена. Конкретные лица в акте не названы.

Status explanation (RU, verbatim): Эксперт фиксирует следы поджога, но не называет виновника — сам по себе документ не уличает заявителя.

#### 6. Удалённый пост в соцсети

- ID: `ev-social`
- Type: Social media (`social_media`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: socialPlatform: cityfeed.local

Evidence text (RU, verbatim):

Сохранённый скриншот поста Харитона от 13 мая (позже удалён): «Со складом столько головной боли… ну ничего, скоро страховая всё починит 🔥😉». Под постом — реакции знакомых.

Status explanation (RU, verbatim): За неделю до пожара Харитон публично шутит, что «страховая всё починит» — это указывает на заранее задуманный поджог.

### Final explanation shown to player (RU, verbatim)

- Накануне пожара со склада вывезли весь ценный товар, а пожарные датчики вручную отключили.
- Банк показывает дефолт и миллионный долг — мотив, а удалённый пост раскрывает умысел.
- Это спланированный поджог ради страховки — в выплате отказать.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 33. Инспекторы необычного ущерба (`case-035`)

- Campaign position: 33
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 12500 EUR
- Evidence count: 6
- Claimant portrait: `none`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Аркадий Егоров, 52 года**

Role (RU): Владелец службы очистки

- Город: Москва
- Полис: Бизнес · БИ-035-GH
- Компания: АРВ-4

### Claim text (RU, verbatim)

> Ночью в отеле «Янтарь» неизвестный разгромил банкетный зал и уничтожил оборудование моей службы промышленной очистки. Прошу оплатить ремонт фургона и четырёх электростатических распылителей.

### Evidence

#### 1. Камера погрузочной зоны

- ID: `ev-camera`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: cameraId: CAM-AMBER-04 | cameraModel: DomeGuard DG-8000 · 4K · H.265

Evidence text (RU, verbatim):

01:42 · Егоров сам таранит декорации фургоном; посторонних нет.

Status explanation (RU, verbatim): Разгром устроил сам заявитель, а не неизвестный нарушитель.

#### 2. Трек фургона АРВ-4

- ID: `ev-gps`
- Type: GPS track (`gps`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: company: Навигационная служба № 35 | department: Корпоративный контроль | requestId: ST-035-441 | gpsFooter: Спутниковые точки подтверждены

Evidence text (RU, verbatim):

- 00:55 · склад
- 01:39 · отель «Янтарь»
- 02:18 · ломбард

Status explanation (RU, verbatim): После «атаки» фургон поехал не в сервис, а в ломбард.

#### 3. Счёт компании

- ID: `ev-bank`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: bankName: ГородКапитал | accountMask: •• 0351

Evidence text (RU, verbatim):

- Накануне · перевод от ломбарда: 18 000 €
- Назначение: 4 промышленных распылителя

Status explanation (RU, verbatim): Заявленное уничтоженным оборудование было продано заранее.

#### 4. Показания администратора

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Слышал гул, хлопок и крик: «Отключите оборудование!»

Status explanation (RU, verbatim): Шум подтверждает инцидент, но не его мистическую причину.

#### 5. Акт осмотра зала

- ID: `ev-document`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**

Evidence text (RU, verbatim):

Следы шин совпадают с протектором фургона АРВ-4; следов внешнего воздействия нет.

Status explanation (RU, verbatim): Физические следы указывают на обычный наезд фургона.

#### 6. Удалённый пост

- ID: `ev-social`
- Type: Social media (`social_media`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: socialPlatform: nightlog.local

Evidence text (RU, verbatim):

«Если страховщик поверит в историю о ночном нарушителе — долги закрыты.»

Status explanation (RU, verbatim): Пост прямо раскрывает мотив и план инсценировки.

### Final explanation shown to player (RU, verbatim)

- Следы шин и переписка доказывают инсценировку ущерба.
- Камера, шины и GPS доказывают, что зал разгромил сам Егоров.
- Распылители были проданы до аварии, а удалённый пост раскрывает страховую схему.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 34. Гроза у подстанции (`case-036`)

- Campaign position: 34
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 9800 EUR
- Evidence count: 6
- Claimant portrait: `none`
- Investigation budget: 4
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Максим Ярцев, 41 год**

Role (RU): Реставратор автомобилей

- Город: Нортбридж
- Полис: Каско · VE-41
- Авто: VE-4 · 1985

### Claim text (RU, verbatim)

> Во время грозы молния ударила в городскую подстанцию и по подключённому кабелю ушла в моё экспериментальное электрокупе. Машина загорелась, а журнал скорости зафиксировал аномальный скачок. Прошу оплатить восстановление.

### Evidence

#### 1. Метеосводка

- ID: `ev-weather`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

22:17:03 · прямой разряд в городскую подстанцию.

Status explanation (RU, verbatim): Разряд подтверждён независимой службой.

#### 2. Камера площади

- ID: `ev-camera`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **No**
- Visual/service metadata: cameraId: CAM-CLOCK-01 | cameraModel: NightGuard NG-9081 · 4K · H.265

Evidence text (RU, verbatim):

22:17 · вспышка на подстанции; купе стоит у подключённого кабеля; водитель в стороне.

Status explanation (RU, verbatim): Камера исключает поджог владельцем.

#### 3. Журнал накопителя

- ID: `ev-log`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Visual/service metadata: logPrompt: diagnostic@vehicle:~$ tail -f /var/log/traction-battery.log

Evidence text (RU, verbatim):

- 22:04:03 INPUT 640GW
- 22:04:04 SPEED_SAMPLE 137KMH
- 22:04:04 SAFETY_SHUTDOWN

Status explanation (RU, verbatim): Телеметрия совпадает со временем молнии.

#### 4. Маршрут купе

- ID: `ev-gps`
- Type: GPS track (`gps`)
- Contradiction to stamp: **No**
- Visual/service metadata: company: ХроноНав | department: Телематика | requestId: CN-036-121 | gpsFooter: Архив защищён от редактирования

Evidence text (RU, verbatim):

- 21:48 · мастерская
- 21:59 · часовая площадь
- 22:06 · сигнал потерян

Status explanation (RU, verbatim): Маршрут соответствует заявлению.

#### 5. Показания часовщика

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Ярцев кричал, чтобы все отошли, и сам держался вдали от машины.

Status explanation (RU, verbatim): Очевидец не видел инсценировки.

#### 6. Экспертиза оплавления

- ID: `ev-document`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Вход повреждения идёт от внешнего кабеля к батарее; следов горючей смеси нет.

Status explanation (RU, verbatim): Экспертиза подтверждает электрическую причину.

### Final explanation shown to player (RU, verbatim)

- Телеметрия показывает, что пожар начался до удара молнии.
- Молния, камера и телеметрия независимо совпадают по секундам.
- Следов поджога нет: это редкий, но покрываемый страховой случай.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 35. Кража хромированных манекенов (`case-037`)

- Campaign position: 35
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 15000 EUR
- Evidence count: 6
- Claimant portrait: `none`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Денис Корин, 55 лет**

Role (RU): Владелец мотомастерской

- Город: Красноярск
- Полис: Бизнес · T800-037
- Объект: МотоТерминал

### Claim text (RU, verbatim)

> Ночью неизвестный проник в мою мотомастерскую, забрал три дорогих хромированных манекена и уехал на моём мотоцикле. Камеры перед кражей якобы перестали работать из-за скачка напряжения. Требую полную выплату.

### Evidence

#### 1. Резервная камера

- ID: `ev-camera`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: cameraId: CAM-MOTO-B | cameraModel: SecureDome SD-5A · 5MP · H.265

Evidence text (RU, verbatim):

03:12 · Корин грузит манекены и мотоцикл в свой фургон.

Status explanation (RU, verbatim): Заявитель сам вывез имущество.

#### 2. Рентген груза на границе

- ID: `ev-xray`
- Type: X-ray (`xray`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: clinicName: Таможенный комплекс «СканЛайн»

Evidence text (RU, verbatim):

В фургоне видны три стальных каркаса и мотоцикл; водитель — Корин.

Status explanation (RU, verbatim): «Украденные» предметы пересекли границу с владельцем.

#### 3. Предоплата коллекционера

- ID: `ev-bank`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: bankName: СтальИнвест Банк | accountMask: •• 0800

Evidence text (RU, verbatim):

- За 2 дня · +22 000 €
- Назначение: три металлокаркас манекена и мотоцикл

Status explanation (RU, verbatim): Имущество было продано до заявленной кражи.

#### 4. Звонок покупателю

- ID: `ev-phone`
- Type: Phone records (`phone_records`)
- Contradiction to stamp: **Yes**
- Visual/service metadata: carrierName: ИмпульсСвязь | phoneMask: +7 ••• ••• 0800

Evidence text (RU, verbatim):

- 02:48 · 04:12
- Фраза в расшифровке: «Буду через час»

Status explanation (RU, verbatim): Звонок координирует заранее согласованную доставку.

#### 5. Осмотр камер

- ID: `ev-document`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**

Evidence text (RU, verbatim):

Основные камеры отключены штатным ключом администратора; следов нагрева нет.

Status explanation (RU, verbatim): История про глазной лазер технически ложна.

#### 6. Свидетель с автомойки

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Видел крупного мужчину в кожаной куртке; лица не разглядел.

Status explanation (RU, verbatim): Описание подходит заявителю и не доказывает взлом.

### Final explanation shown to player (RU, verbatim)

- Камеры и рентген показывают, что владелец сам вывез имущество.
- Камера и таможенный рентген показывают, что имущество вывез сам Корин.
- Предоплата, звонок и штатное отключение камер доказывают инсценировку.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 36. Лаборатория № 394 (`case-038`)

- Campaign position: 36
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 11200 EUR
- Evidence count: 6
- Claimant portrait: `none`
- Investigation budget: 4
- Ground truth: **Valid claim** (`valid`)
- Correct decision: **Approve** (`approve`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Антон Ланской, 46 лет**

Role (RU): Преподаватель химии

- Город: Выборг
- Полис: Школа · LAB-394
- Кабинет: Подвальная лаборатория № 394

### Claim text (RU, verbatim)

> В школьной лаборатории реакционная ёмкость самопроизвольно взорвалась на уроке химии. За минуту до этого курьер доставил токсичный реагент, ошибочно промаркированный как безопасная добавка. Ученики эвакуированы, но лаборатория уничтожена.

### Evidence

#### 1. Камера лаборатории

- ID: `ev-camera`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **No**
- Visual/service metadata: cameraId: CAM-LAB-394 | cameraModel: WatchTower WT-73 · 4K · H.265

Evidence text (RU, verbatim):

10:31 · посылка вскрыта; реагент попадает в реакционную ёмкость; Ланской запускает эвакуацию.

Status explanation (RU, verbatim): Камера подтверждает случайность и быструю реакцию учителя.

#### 2. Накладная курьера кампуса

- ID: `ev-document`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Отправитель: «Косой переулок, лавка 14». Содержимое по накладной: валериана.

Status explanation (RU, verbatim): Учитель получил неверно маркированный товар.

#### 3. Журнал вытяжки

- ID: `ev-log`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **No**
- Visual/service metadata: logPrompt: labtech@chem-lab:~$ tail -f /var/log/reactor-394.log

Evidence text (RU, verbatim):

- 10:30 NORMAL
- 10:31 TOXIC_ALKALOID
- 10:31 AUTO_EVACUATION
- 10:32 OVERPRESSURE

Status explanation (RU, verbatim): Датчики фиксируют химическую реакцию в заявленное время.

#### 4. Показания старосты

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

Ланской не касался посылки: её открыл ученик по инструкции на упаковке.

Status explanation (RU, verbatim): Свидетель исключает умышленную подмену учителем.

#### 5. Звонок в службу спасения

- ID: `ev-phone`
- Type: Phone records (`phone_records`)
- Contradiction to stamp: **No**
- Visual/service metadata: carrierName: ФилинТелеком | phoneMask: +7 ••• ••• 0394

Evidence text (RU, verbatim):

- 10:31:18 · исходящий
- Длительность 06:24 · эвакуация и химический код

Status explanation (RU, verbatim): Немедленный вызов подтверждает добросовестные действия.

#### 6. Ботаническая экспертиза

- ID: `ev-document2`
- Type: Document (`document`)
- Contradiction to stamp: **No**

Evidence text (RU, verbatim):

В упаковке с этикеткой «безопасная добавка» обнаружен токсичный реагент; пломба поставщика не нарушена до урока.

Status explanation (RU, verbatim): Причина — ошибка поставщика, а не действия страхователя.

### Final explanation shown to player (RU, verbatim)

- Запечатанная посылка содержала ошибочно маркированный химический реагент.
- Камера, пломба и ботаническая экспертиза подтверждают ошибку поставщика.
- Ланской вовремя эвакуировал класс; оснований считать взрыв инсценировкой нет.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 37. Ночной демонтаж панелей (`case-039`)

- Campaign position: 37
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 18400 EUR
- Evidence count: 6
- Claimant portrait: `none`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Никита Воронов, 38 лет**

Role (RU): Владелец солнечной фермы

- Регион: Район Сухого Хребта
- Полис: Энергия · SW-039
- Объект: Ферма «Сухой Хребет»

### Claim text (RU, verbatim)

> Ночью неизвестные в белых рабочих комбинезонах проникли на мою солнечную ферму «Сухой Хребет» и промышленным терморезаком уничтожили главный массив панелей. Сервисный робот пропал. Прошу возместить оборудование и потерю выработки.

### Evidence

#### 1. Камера ангара

- ID: `ev-camera`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: cameraId: CAM-HANGAR-S4 | cameraModel: PerimeterCam PC-4 · 4K · H.265

Evidence text (RU, verbatim):

02:16 · Воронов надевает белый защитный костюм и вывозит робота СРВ-4.

Status explanation (RU, verbatim): «Штурмовиком» был сам заявитель; робот не похищен.

#### 2. Журнал сервисного робота

- ID: `ev-log`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: service@dryridge:~$ tail -f /var/log/service-robot.log

Evidence text (RU, verbatim):

- 02:18 OWNER_AUTH OK
- 02:19 CUTTER RED MODE
- 02:23 PANEL_ROW_A DISMANTLED
- 02:31 HIDE_LOCATION cellar

Status explanation (RU, verbatim): Робот разобрал панели по авторизации владельца.

#### 3. Долг фермы

- ID: `ev-bank`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `context`
- Visual/service metadata: bankName: Галактика Кредит | accountMask: •• 1977

Evidence text (RU, verbatim):

- Кредит: просрочка 90 дней
- Ожидаемая страховая выплата закрывает долг полностью

Status explanation (RU, verbatim): Долг даёт мотив, но сам по себе не доказывает мошенничество.

#### 4. Экспертиза резов

- ID: `ev-document`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`

Evidence text (RU, verbatim):

Все панели заранее надпилены с внутренней стороны; резак прошёл по сервисной разметке.

Status explanation (RU, verbatim): Разрушение было подготовлено владельцем заранее.

#### 5. Метка робота

- ID: `ev-gps`
- Type: GPS track (`gps`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: company: ОрбитаМаяк | department: Телематика сервисного робота | requestId: OM-039-S4 | gpsFooter: Координаты подтверждены двумя спутниками

Evidence text (RU, verbatim):

- 02:31 · подвал жилого дома владельца
- 08:00 · положение без изменений

Status explanation (RU, verbatim): Пропавший робот спрятан дома у заявителя.

#### 6. Показания соседа

- ID: `ev-witness`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

Слышал электронный свист и фразу «Да пребудет со мной выплата», но никого не видел.

Status explanation (RU, verbatim): Свидетель подтверждает время, но не личность нарушителя.

### Final explanation shown to player (RU, verbatim)

- Камеры и журнал команд показывают умышленный демонтаж панелей.
- Камера и журнал показывают, что Воронов сам приказал роботу разобрать панели.
- Робот спрятан в его подвале, а предварительные надпилы доказывают страховую инсценировку.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 38. Сгоревший груз на лунной ферме (`case-040`)

- Campaign position: 38
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 22100 EUR
- Evidence count: 6
- Claimant portrait: `people/miron-veil.webp`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Мирон Вейл, 52 года**

Role (RU): Фермер лунного купола

- Архив: Пограничный сектор
- Застрахованный риск: Пожар грузового ангара
- Архивная связка: Повторяющийся след: маркировка GC-17 и серые транспортные жетоны «Серого конвоя».

### Claim text (RU, verbatim)

> Правительственный патруль сжёг мой грузовой ангар и сезонный запас оборудования. Ворота выбиты, часть испарителей уничтожена, семья осталась без дохода. Прошу полное возмещение.

### Evidence

#### 1. Фото ангара

- ID: `photo-hangar`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: IMG_20260412_071430.jpg | imageUrl: evidence/case-040-photo-hangar.webp

Evidence text (RU, verbatim):

Очаг сильнее всего выгорел у внутреннего верстака. Ворота обуглены меньше, чем рабочая зона.

Status explanation (RU, verbatim): Очаг внутри противоречит версии о поджоге снаружи.

#### 2. Сервисный журнал сервисный робота

- ID: `service robot-log`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: farmtech@dryledge:~$ tail -f /var/log/service robot-service.log

Evidence text (RU, verbatim):

- 23:18 — питание боевого блока включено локально
- 23:41 — снят силовой модуль L-9
- 00:07 — перегрев верстака, аварийное отключение

Status explanation (RU, verbatim): сервисный робот разбирали перед пожаром, что указывает на скрытую причину возгорания.

#### 3. Покупка силовых модулей

- ID: `bank-modules`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: bankName: Frontier Credit Union | accountMask: •••• •••• •••• 4091

Evidence text (RU, verbatim):

- 08.04 — -4 900 CR · Редкие силовые модули, рынок Кольца
- 11.04 — -620 CR · Термозащита и резак
- В назначении платежа повторяется код GC-17.

Status explanation (RU, verbatim): Покупки связаны с разборкой, а не с сельхозоборудованием.

#### 4. Показания соседа

- ID: `witness-welding`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`

Evidence text (RU, verbatim):

«До пожара я видел в ангаре ночную сварку. Патрульных машин в ту ночь у фермы не было».

Status explanation (RU, verbatim): Свидетель подтверждает внутренние работы и отсутствие налёта.

#### 5. Опись испарителей

- ID: `inventory`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

Страховая опись подтверждает 11 рабочих испарителей и складской запас фильтров на дату осмотра.

Status explanation (RU, verbatim): Материал важен для хронологии, но сам по себе не опровергает заявление.

#### 6. Маршрут патруля

- ID: `patrol-track`
- Type: GPS track (`gps`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: company: Orbital Track Bureau | department: Отдел маршрутов служебных судов | requestId: ОТВ-2026-0412-С · Тип: патрульный маршрут | gpsFooter: © Orbital Track 2026 · NAV ACC: ±12m

Evidence text (RU, verbatim):

- 22:10 — КПП северного кратера
- 23:30 — сектор каньона, 38 км от фермы
- 00:20 — возврат на базу

Status explanation (RU, verbatim): Маршрут патруля не проходил рядом с фермой во время пожара.

### Final explanation shown to player (RU, verbatim)

- Очаг, журналы и банковская выписка показывают подготовленный пожар.
- Код GC-17 впервые связывает ангар с серой транспортной цепочкой.
- Заявление о внешнем налёте не подтверждено: вердикт — отказ.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 39. Потерянный перехватчик в ледяном каньоне (`case-041`)

- Campaign position: 39
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 31600 EUR
- Evidence count: 6
- Claimant portrait: `people/elian-kord.webp`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Элиан Корд, 27 лет**

Role (RU): Пилот пограничного перехватчика

- Архив: Пограничный сектор
- Застрахованный риск: Крушение корабля
- Архивная связка: Повторяющийся след: маркировка GC-17 и серые транспортные жетоны «Серого конвоя».

### Claim text (RU, verbatim)

> Мой перехватчик сбили пираты во время гуманитарного рейса. Я едва выжил после падения в ледяном каньоне и прошу возместить корабль и медицинские расходы.

### Evidence

#### 1. Фото места крушения

- ID: `crash-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: DJI_20260503_093810.jpg | imageUrl: evidence/case-041-crash-photo.webp

Evidence text (RU, verbatim):

Корпус цел снаружи, повреждение сосредоточено снизу после жёсткой посадки. Следов попаданий нет.

Status explanation (RU, verbatim): Отсутствие обстрела противоречит версии о сбитии.

#### 2. Грузовая ведомость

- ID: `cargo-manifest`
- Type: Document (`document`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`

Evidence text (RU, verbatim):

Заявлено 180 кг медикаментов. Фактическая масса при вылете: 263 кг. Расхождение не объяснено.

Status explanation (RU, verbatim): Лишняя масса указывает на незаявленный груз.

#### 3. Навигационный трек

- ID: `nav-track`
- Type: GPS track (`gps`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: company: CryoNav Relay | department: Архив треков малых судов | requestId: CNR-2026-0503-I · Тип: маршрут перехватчика | gpsFooter: © CryoNav 2026 · NAV ACC: ±9m

Evidence text (RU, verbatim):

- 04:10 — вылет с базы
- 04:58 — отклонение к ущелью Б-12
- 05:21 — посадочный манёвр без сигнала бедствия

Status explanation (RU, verbatim): Пилот сделал незаявленный крюк и не передал сигнал боя.

#### 4. Перевод брокера

- ID: `bank-broker`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: bankName: HelioBank | accountMask: •••• •••• •••• 8720

Evidence text (RU, verbatim):

- 02.05 — +12 000 CR · Северный минерал-брокер
- 03.05 — -1 300 CR · аренда ледового ангара

Status explanation (RU, verbatim): Крупный перевод перед рейсом связан с незаявленным грузом.

#### 5. Запись спасателей

- ID: `rescue-cam`
- Type: Camera recording (`camera_recording`)
- Contradiction to stamp: **No**
- Authoring relation: `context`
- Visual/service metadata: cameraId: ICE-DRONE-4 | cameraModel: AeroSurvey AS-2 · 6K · H.265

Evidence text (RU, verbatim):

Камера спасательного дрона показывает закрытые грузовые контейнеры рядом с кабиной до прибытия комиссии.

Status explanation (RU, verbatim): Материал важен для хронологии, но сам по себе не опровергает заявление.

#### 6. Радиожурнал

- ID: `radio-log`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: comms@icebase:~$ tail -f /var/log/radio-relay.log

Evidence text (RU, verbatim):

- 05:12 — канал чист, помехи не зафиксированы
- 05:20 — ручное отключение маяка
- 05:25 — аварийный сигнал после посадки
- Фраза «серый конвой прошёл» совпадает с кодом из дела лунной фермы.

Status explanation (RU, verbatim): Маяк отключили вручную до аварийного сигнала.

### Final explanation shown to player (RU, verbatim)

- Корпус, маршрут и груз противоречат версии пиратской атаки.
- Радиолог повторяет сигнал «Серого конвоя» из предыдущего архива.
- Боевой фасад инсценирован: вердикт — отказ.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## 40. Пропавший церемониальный клинок (`case-042`)

- Campaign position: 40
- Required level: 16
- Data difficulty: Hard (`hard`)
- Claim amount: 42800 EUR
- Evidence count: 6
- Claimant portrait: `people/selena-orvik.webp`
- Investigation budget: 4
- Ground truth: **Fraud** (`fraud`)
- Correct decision: **Reject** (`reject`)
- Recurring claimant: No exact claimant-name recurrence

### Claimant

**Селена Орвик, 34 года**

Role (RU): Наследница пограничного дома

- Архив: Пограничный сектор
- Застрахованный риск: Кража церемониальной реликвии
- Архивная связка: Повторяющийся след: маркировка GC-17 и серые транспортные жетоны «Серого конвоя».

### Claim text (RU, verbatim)

> Из семейного архива похитили церемониальный энерго-клинок. Это политическое послание радикалов, направленное против нашей семьи. Прошу выплату за реликвию.

### Evidence

#### 1. Фото витрины

- ID: `display-photo`
- Type: Photo (`photo`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: filename: IMG_20260519_114002.jpg | imageUrl: evidence/case-042-display-photo.webp

Evidence text (RU, verbatim):

Стекло целое, замок не повреждён. На бархате виден аккуратный след снятого клинка.

Status explanation (RU, verbatim): Сцена похожа на доступ ключом, а не на нападение.

#### 2. Платёж аукционного дома

- ID: `bank-auction`
- Type: Bank statement (`bank_statement`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: bankName: Regency Trust | accountMask: •••• •••• •••• 1184

Evidence text (RU, verbatim):

- 18.05 — +31 500 CR · Дом закрытых торгов «Арка»
- 18.05 — -9 000 CR · погашение частного долга

Status explanation (RU, verbatim): Выплата совпадает с исчезновением реликвии.

#### 3. Сообщение курьеру

- ID: `social-courier`
- Type: Social media (`social_media`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: socialPlatform: closed-circle.local

Evidence text (RU, verbatim):

Закрытый пост: «Семейный металл заберут через боковой шлюз. Без вопросов, коробка уже оплачена». Курьер ставит на фото серый жетон с тем же GC-17.

Status explanation (RU, verbatim): Фраза описывает добровольную передачу предмета.

#### 4. Показания охраны

- ID: `guard-statement`
- Type: Witness statement (`witness_statement`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`

Evidence text (RU, verbatim):

«Госпожа Орвик сама внесла ночного курьера в список допуска. Тревоги не было».

Status explanation (RU, verbatim): Охрана подтверждает добровольный допуск.

#### 5. Журнал доступа архива

- ID: `archive-access`
- Type: Usage log (`usage_log`)
- Contradiction to stamp: **Yes**
- Authoring relation: `contradicts`
- Visual/service metadata: logPrompt: archive@noble-vault:~$ tail -f /var/log/access.log

Evidence text (RU, verbatim):

- 21:44 — карта S-01, С. Орвик, вход
- 21:49 — витрина 3, штатное открытие
- 21:57 — карта S-01, выход

Status explanation (RU, verbatim): Штатное открытие витрины связано с картой заявительницы.

#### 6. Оценка реликвии

- ID: `valuation`
- Type: Document (`document`)
- Contradiction to stamp: **No**
- Authoring relation: `context`

Evidence text (RU, verbatim):

Независимая оценка подтверждает страховую стоимость предмета при наличии оригинала.

Status explanation (RU, verbatim): Материал важен для хронологии, но сам по себе не опровергает заявление.

### Final explanation shown to player (RU, verbatim)

- Витрина открыта штатно, а банковский след показывает тайную продажу.
- Серый жетон GC-17 выводит к той же транспортной сети.
- Политическая кража не подтверждена: вердикт — отказ.

### Plot-review checklist for this case

- Does the claim create a strong question before evidence is opened?
- Is the solution fair but not obvious from the first card?
- Do supporting/context cards add texture instead of repeating the same fact?
- Does the final explanation deliver a satisfying reveal?
- Are returning characters, organizations, or pop-culture references understandable without prior knowledge?

## Ready-to-use AI review prompt

```text
Answer in Russian. You are a senior narrative designer and retention specialist for detective casual games aimed at players aged 30-60.
Review campaign positions 31-40 below as a sequence, not as isolated pitches. All localized source text is Russian and all solutions are intentionally visible.

For every case, score from 1 to 10: opening hook, curiosity through the last evidence, fairness of deduction, emotional payoff, humor/memorability, clarity for ages 30-60, and urge to start the next case. Identify redundant evidence, premature reveals, weak logic, tonal repetition, reading overload, fan-service dependence, and missed opportunities for recurring-character arcs. Then identify the most likely churn point in this ten-case block. Recommend precise edits to claims, evidence order/content, final explanations, and case order. Tie every recommendation to an expected retention effect. Preserve the restrained paper-folder insurance-investigation tone; no neon, casino, sci-fi, or cartoon treatment.
```
