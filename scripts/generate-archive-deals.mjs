import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const casesDir = join(root, 'src', 'data', 'cases');
const coversDir = join(root, 'public', 'covers');

mkdirSync(casesDir, { recursive: true });
mkdirSync(coversDir, { recursive: true });

const cyrillic = /[А-Яа-яЁё]/;
function cleanNonCyrillic(value, fallback = 'Archive file detail') {
  if (Array.isArray(value)) {
    return value.map((line, index) => cleanNonCyrillic(line, `${fallback} ${index + 1}`));
  }
  return cyrillic.test(value) ? fallback : value;
}

const L = (ru, en, tr = en, ar = en, kk = ru) => ({
  ru,
  en: cleanNonCyrillic(en),
  tr: cleanNonCyrillic(tr, cleanNonCyrillic(en)),
  ar: cleanNonCyrillic(ar, cleanNonCyrillic(en)),
  kk,
});
const lines = (ru, en, tr = en, ar = en, kk = ru) => L(ru, en, tr, ar, kk);

const thesis = [
  {
    id: 'incident',
    text: L(
      'Заявленное событие произошло именно при описанных обстоятельствах.',
      'The reported incident happened under the described circumstances.',
      'Bildirilen olay anlatıldığı koşullarda gerçekleşti.',
      'وقع الحادث المبلغ عنه في الظروف الموصوفة.',
      'Мәлімделген оқиға дәл сипатталған жағдайда болды.',
    ),
  },
  {
    id: 'damage',
    text: L(
      'Заявленный ущерб возник из-за этого события и подтверждён документами.',
      'The claimed damage resulted from that incident and is documented.',
      'Talep edilen zarar bu olaydan kaynaklandı ve belgelenmiştir.',
      'نتج الضرر المطالب به عن ذلك الحادث وهو موثق.',
      'Мәлімделген залал сол оқиғадан туындап, құжатпен расталған.',
    ),
  },
];

function localizedArray(ru, en, tr = en, ar = en, kk = ru) {
  return {
    ru,
    en: cleanNonCyrillic(en),
    tr: cleanNonCyrillic(tr, cleanNonCyrillic(en)),
    ar: cleanNonCyrillic(ar, cleanNonCyrillic(en)),
    kk,
  };
}

function evidence({ id, type, title, content, contradiction, explanation, meta, thesisId, relation }) {
  return {
    id,
    type,
    title: L(title.ru, title.en),
    content: Array.isArray(content.ru)
      ? localizedArray(content.ru, content.en ?? content.ru)
      : L(content.ru, content.en ?? content.ru),
    isContradiction: contradiction,
    contradictionExplanation: L(explanation.ru, explanation.en ?? explanation.ru),
    ...(meta ? { meta } : {}),
    ...(thesisId ? { thesisId } : {}),
    ...(relation ? { relation } : {}),
  };
}

const neutral = {
  ru: 'Материал важен для хронологии, но сам по себе не опровергает заявление.',
  en: 'The material matters for the timeline but does not by itself disprove the claim.',
};

const packs = [
  {
    id: 'frontier-sector',
    accent: '#7f8fa6',
    cases: [
      {
        n: 40,
        title: ['Сгоревший груз на лунной ферме', 'Burned Cargo on the Moon Farm'],
        person: ['Мирон Вейл, 52 года', 'Miron Vale, 52'],
        role: ['Владелец влаго-добывающей фермы', 'Moisture-farm owner'],
        meta: [['Архив', 'Пограничный сектор'], ['Объект', 'Лунная ферма «Сухой уступ»']],
        amount: 22100,
        story: [
          'Правительственный патруль сжёг мой грузовой ангар и сезонный запас оборудования. Ворота выбиты, часть испарителей уничтожена, семья осталась без дохода. Прошу полное возмещение.',
          'A government patrol burned my cargo hangar and seasonal equipment stock. The gate was forced, evaporators were destroyed, and my family lost its income. I request full compensation.',
        ],
        explanation: [
          ['Очаг пожара находился у рабочего стола внутри ангара, а не у ворот.', 'The fire started at a workbench inside the hangar, not at the gate.'],
          ['Журналы и банковская выписка показывают незаконную разборку дроида.', 'Logs and banking records show an illegal droid teardown.'],
          ['Заявление о внешнем налёте не подтверждено: вердикт — отказ.', 'The external-raid story is unsupported: reject the claim.'],
        ],
        evidences: [
          evidence({ id: 'photo-hangar', type: 'photo', title: { ru: 'Фото ангара', en: 'Hangar Photo' }, content: { ru: 'Очаг сильнее всего выгорел у внутреннего верстака. Ворота обуглены меньше, чем рабочая зона.', en: 'The deepest burn is around the internal workbench. The gate is less charred than the work area.' }, contradiction: true, explanation: { ru: 'Очаг внутри противоречит версии о поджоге снаружи.', en: 'An internal ignition point contradicts an outside attack.' }, meta: { filename: 'IMG_20260412_071430.jpg' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'droid-log', type: 'usage_log', title: { ru: 'Сервисный журнал дроида', en: 'Droid Service Log' }, content: { ru: ['23:18 — питание боевого блока включено локально', '23:41 — снят силовой модуль L-9', '00:07 — перегрев верстака, аварийное отключение'], en: ['23:18 — combat core powered locally', '23:41 — L-9 power module removed', '00:07 — workbench overheating, emergency shutdown'] }, contradiction: true, explanation: { ru: 'Дроид разбирали перед пожаром, что указывает на скрытую причину возгорания.', en: 'The droid was dismantled before the fire, pointing to a concealed cause.' }, meta: { logPrompt: 'farmtech@dryledge:~$ tail -f /var/log/droid-service.log' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'bank-modules', type: 'bank_statement', title: { ru: 'Покупка силовых модулей', en: 'Power Module Purchase' }, content: { ru: ['08.04 — -4 900 CR · Редкие силовые модули, рынок Кольца', '11.04 — -620 CR · Термозащита и резак'], en: ['08 Apr — -4,900 CR · rare power modules, Ring market', '11 Apr — -620 CR · heat shielding and cutter'] }, contradiction: true, explanation: { ru: 'Покупки связаны с разборкой, а не с сельхозоборудованием.', en: 'The purchases fit dismantling work, not farm repairs.' }, meta: { bankName: L('Frontier Credit Union', 'Frontier Credit Union'), accountMask: '•••• •••• •••• 4091' }, thesisId: 'damage', relation: 'contradicts' }),
          evidence({ id: 'witness-welding', type: 'witness_statement', title: { ru: 'Показания соседа', en: 'Neighbor Statement' }, content: { ru: '«До пожара я видел в ангаре ночную сварку. Патрульных машин в ту ночь у фермы не было».', en: '"Before the fire I saw night welding in the hangar. No patrol vehicles were at the farm that night."' }, contradiction: true, explanation: { ru: 'Свидетель подтверждает внутренние работы и отсутствие налёта.', en: 'The witness confirms internal work and no raid.' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'inventory', type: 'document', title: { ru: 'Опись испарителей', en: 'Evaporator Inventory' }, content: { ru: 'Страховая опись подтверждает 11 рабочих испарителей и складской запас фильтров на дату осмотра.', en: 'The insurance inventory confirms 11 working evaporators and filter stock at inspection.' }, contradiction: false, explanation: neutral, thesisId: 'damage', relation: 'context' }),
          evidence({ id: 'patrol-track', type: 'gps', title: { ru: 'Маршрут патруля', en: 'Patrol Route' }, content: { ru: ['22:10 — КПП северного кратера', '23:30 — сектор каньона, 38 км от фермы', '00:20 — возврат на базу'], en: ['22:10 — north crater checkpoint', '23:30 — canyon sector, 38 km from farm', '00:20 — returned to base'] }, contradiction: true, explanation: { ru: 'Маршрут патруля не проходил рядом с фермой во время пожара.', en: 'The patrol route never came near the farm during the fire.' }, meta: { company: L('Orbital Track Bureau', 'Orbital Track Bureau'), department: L('Отдел маршрутов служебных судов', 'Service Vessel Route Desk'), requestId: L('ОТВ-2026-0412-С · Тип: патрульный маршрут', 'OTB-2026-0412-S · Type: patrol route'), gpsFooter: L('© Orbital Track 2026 · NAV ACC: ±12m', '© Orbital Track 2026 · NAV ACC: ±12m') }, thesisId: 'incident', relation: 'contradicts' }),
        ],
      },
      {
        n: 41,
        title: ['Потерянный перехватчик в ледяном каньоне', 'Lost Interceptor in the Ice Canyon'],
        person: ['Элиан Корд, 27 лет', 'Elian Kord, 27'],
        role: ['Пилот курьерской сети', 'Courier network pilot'],
        meta: [['Архив', 'Пограничный сектор'], ['Рейс', 'Гуманитарный коридор 17']],
        amount: 31600,
        story: ['Мой перехватчик сбили пираты во время гуманитарного рейса. Я едва выжил после падения в ледяном каньоне и прошу возместить корабль и медицинские расходы.', 'Pirates shot down my interceptor during a humanitarian run. I barely survived the crash in an ice canyon and request compensation for the craft and medical costs.'],
        explanation: [['На корпусе нет следов внешнего обстрела.', 'The hull has no external weapons scoring.'], ['Маршрут, масса груза и перевод брокера указывают на контрабанду.', 'Route, cargo mass, and broker payment point to smuggling.'], ['Боевой фасад инсценирован: вердикт — отказ.', 'The combat story was staged: reject the claim.']],
        evidences: [
          evidence({ id: 'crash-photo', type: 'photo', title: { ru: 'Фото места крушения', en: 'Crash Site Photo' }, content: { ru: 'Корпус цел снаружи, повреждение сосредоточено снизу после жёсткой посадки. Следов попаданий нет.', en: 'The hull is intact outside, with underside damage from a hard landing. No impact marks are visible.' }, contradiction: true, explanation: { ru: 'Отсутствие обстрела противоречит версии о сбитии.', en: 'No weapons damage contradicts the shootdown claim.' }, meta: { filename: 'DJI_20260503_093810.jpg' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'cargo-manifest', type: 'document', title: { ru: 'Грузовая ведомость', en: 'Cargo Manifest' }, content: { ru: 'Заявлено 180 кг медикаментов. Фактическая масса при вылете: 263 кг. Расхождение не объяснено.', en: 'Declared: 180 kg of medicine. Actual departure mass: 263 kg. The difference is unexplained.' }, contradiction: true, explanation: { ru: 'Лишняя масса указывает на незаявленный груз.', en: 'The extra mass indicates undeclared cargo.' }, thesisId: 'damage', relation: 'contradicts' }),
          evidence({ id: 'nav-track', type: 'gps', title: { ru: 'Навигационный трек', en: 'Navigation Track' }, content: { ru: ['04:10 — вылет с базы', '04:58 — отклонение к ущелью Б-12', '05:21 — посадочный манёвр без сигнала бедствия'], en: ['04:10 — departed base', '04:58 — deviated toward B-12 gorge', '05:21 — landing maneuver without distress signal'] }, contradiction: true, explanation: { ru: 'Пилот сделал незаявленный крюк и не передал сигнал боя.', en: 'The pilot made an undeclared detour and sent no combat distress signal.' }, meta: { company: L('CryoNav Relay', 'CryoNav Relay'), department: L('Архив треков малых судов', 'Small Craft Track Archive'), requestId: L('CNR-2026-0503-I · Тип: маршрут перехватчика', 'CNR-2026-0503-I · Type: interceptor route'), gpsFooter: L('© CryoNav 2026 · NAV ACC: ±9m', '© CryoNav 2026 · NAV ACC: ±9m') }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'bank-broker', type: 'bank_statement', title: { ru: 'Перевод брокера', en: 'Broker Transfer' }, content: { ru: ['02.05 — +12 000 CR · Северный минерал-брокер', '03.05 — -1 300 CR · аренда ледового ангара'], en: ['02 May — +12,000 CR · Northern mineral broker', '03 May — -1,300 CR · ice hangar rental'] }, contradiction: true, explanation: { ru: 'Крупный перевод перед рейсом связан с незаявленным грузом.', en: 'A large preflight transfer fits undeclared cargo.' }, meta: { bankName: L('HelioBank', 'HelioBank'), accountMask: '•••• •••• •••• 8720' }, thesisId: 'damage', relation: 'contradicts' }),
          evidence({ id: 'rescue-cam', type: 'camera_recording', title: { ru: 'Запись спасателей', en: 'Rescue Recording' }, content: { ru: 'Камера спасательного дрона показывает закрытые грузовые контейнеры рядом с кабиной до прибытия комиссии.', en: 'The rescue drone camera shows sealed cargo containers beside the cockpit before the commission arrived.' }, contradiction: false, explanation: neutral, meta: { cameraId: 'ICE-DRONE-4', cameraModel: 'Autel EVO II Enterprise · 6K · H.265' }, thesisId: 'damage', relation: 'context' }),
          evidence({ id: 'radio-log', type: 'usage_log', title: { ru: 'Радиожурнал', en: 'Radio Log' }, content: { ru: ['05:12 — канал чист, помехи не зафиксированы', '05:20 — ручное отключение маяка', '05:25 — аварийный сигнал после посадки'], en: ['05:12 — channel clear, no jamming recorded', '05:20 — beacon manually disabled', '05:25 — emergency signal after landing'] }, contradiction: true, explanation: { ru: 'Маяк отключили вручную до аварийного сигнала.', en: 'The beacon was manually disabled before the emergency call.' }, meta: { logPrompt: 'comms@icebase:~$ tail -f /var/log/radio-relay.log' }, thesisId: 'incident', relation: 'contradicts' }),
        ],
      },
      {
        n: 42,
        title: ['Пропавший церемониальный клинок', 'Missing Ceremonial Blade'],
        person: ['Селена Орвик, 34 года', 'Selena Orvik, 34'],
        role: ['Наследница военного дома', 'Heir of a military house'],
        meta: [['Архив', 'Пограничный сектор'], ['Предмет', 'Семейная реликвия']],
        amount: 42800,
        story: ['Из семейного архива похитили церемониальный энерго-клинок. Это политическое послание радикалов, направленное против нашей семьи. Прошу выплату за реликвию.', 'A ceremonial energy blade was stolen from our family archive. This is a political message from radicals against our house. I request payout for the relic.'],
        explanation: [['Витрина открыта без взлома и с штатным доступом.', 'The display was opened without forced entry and with normal access.'], ['Банковский след и сообщение курьеру показывают тайную продажу.', 'Banking and courier messages show a secret sale.'], ['Политическая кража не подтверждена: вердикт — отказ.', 'The political theft is unsupported: reject the claim.']],
        evidences: [
          evidence({ id: 'display-photo', type: 'photo', title: { ru: 'Фото витрины', en: 'Display Case Photo' }, content: { ru: 'Стекло целое, замок не повреждён. На бархате виден аккуратный след снятого клинка.', en: 'Glass is intact, lock undamaged. The velvet shows a clean indentation where the blade was removed.' }, contradiction: true, explanation: { ru: 'Сцена похожа на доступ ключом, а не на нападение.', en: 'The scene fits key access, not a raid.' }, meta: { filename: 'IMG_20260519_114002.jpg' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'bank-auction', type: 'bank_statement', title: { ru: 'Платёж аукционного дома', en: 'Auction House Payment' }, content: { ru: ['18.05 — +31 500 CR · Дом закрытых торгов «Арка»', '18.05 — -9 000 CR · погашение частного долга'], en: ['18 May — +31,500 CR · Arka private auctions', '18 May — -9,000 CR · private debt repayment'] }, contradiction: true, explanation: { ru: 'Выплата совпадает с исчезновением реликвии.', en: 'The payment matches the relic disappearance.' }, meta: { bankName: L('Regency Trust', 'Regency Trust'), accountMask: '•••• •••• •••• 1184' }, thesisId: 'damage', relation: 'contradicts' }),
          evidence({ id: 'social-courier', type: 'social_media', title: { ru: 'Сообщение курьеру', en: 'Courier Message' }, content: { ru: 'Закрытый пост: «Семейный металл заберут через боковой шлюз. Без вопросов, коробка уже оплачена».', en: 'Private post: "Family metal leaves through the side airlock. No questions, the crate is prepaid."' }, contradiction: true, explanation: { ru: 'Фраза описывает добровольную передачу предмета.', en: 'The wording describes a voluntary handoff.' }, meta: { socialPlatform: 'closed-circle.local' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'guard-statement', type: 'witness_statement', title: { ru: 'Показания охраны', en: 'Guard Statement' }, content: { ru: '«Госпожа Орвик сама внесла ночного курьера в список допуска. Тревоги не было».', en: '"Ms. Orvik personally added the night courier to the access list. There was no alarm."' }, contradiction: true, explanation: { ru: 'Охрана подтверждает добровольный допуск.', en: 'Security confirms voluntary access.' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'archive-access', type: 'usage_log', title: { ru: 'Журнал доступа архива', en: 'Archive Access Log' }, content: { ru: ['21:44 — карта S-01, С. Орвик, вход', '21:49 — витрина 3, штатное открытие', '21:57 — карта S-01, выход'], en: ['21:44 — card S-01, S. Orvik, entry', '21:49 — display 3, normal open', '21:57 — card S-01, exit'] }, contradiction: true, explanation: { ru: 'Штатное открытие витрины связано с картой заявительницы.', en: 'The normal display opening is tied to the claimant card.' }, meta: { logPrompt: 'archive@noble-vault:~$ tail -f /var/log/access.log' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'valuation', type: 'document', title: { ru: 'Оценка реликвии', en: 'Relic Valuation' }, content: { ru: 'Независимая оценка подтверждает страховую стоимость предмета при наличии оригинала.', en: 'Independent valuation confirms the insured value if the original item is present.' }, contradiction: false, explanation: neutral, thesisId: 'damage', relation: 'context' }),
        ],
      },
      {
        n: 43,
        title: ['Исчезнувший ученик навигатора', 'Missing Navigator Student'],
        person: ['Мастер Илар Роун, 61 год', 'Master Ilar Roun, 61'],
        role: ['Наставник навигационной академии', 'Navigation academy mentor'],
        meta: [['Архив', 'Пограничный сектор'], ['Застрахованный риск', 'Пропажа стажёра']],
        amount: 17400,
        story: ['Моего стажёра похитили агенты подполья. Он исчез ночью из закрытого корпуса академии, а вместе с ним пропали учебные материалы. Прошу компенсацию расходов поиска.', 'Underground agents abducted my trainee. He vanished overnight from the academy dormitory, along with study materials. I request compensation for search costs.'],
        explanation: [['Камера и пропуск показывают спокойный добровольный выход.', 'Camera and pass records show a calm voluntary exit.'], ['Тайник и письмо доказывают подготовленный уход.', 'The cache and letter prove a planned departure.'], ['Похищение не подтверждено: вердикт — отказ.', 'Abduction is unsupported: reject the claim.']],
        evidences: [
          evidence({ id: 'corridor-cam', type: 'camera_recording', title: { ru: 'Коридорная камера', en: 'Corridor Camera' }, content: { ru: 'Стажёр идёт один с сумкой, останавливается у терминала и не сопротивляется никому.', en: 'The trainee walks alone with a bag, stops at a terminal, and resists nobody.' }, contradiction: true, explanation: { ru: 'Запись противоречит версии насильственного похищения.', en: 'The footage contradicts a forced abduction.' }, meta: { cameraId: 'NAV-COR-12', cameraModel: 'Axis P3265-LV · 1080p · H.264' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'exit-pass', type: 'usage_log', title: { ru: 'Пропуск выхода', en: 'Exit Pass Log' }, content: { ru: ['01:16 — карта N-318, выход через шлюз B', '01:17 — подтверждение биометрии', '01:18 — дверь закрыта штатно'], en: ['01:16 — card N-318, exit through lock B', '01:17 — biometric confirmation', '01:18 — door closed normally'] }, contradiction: true, explanation: { ru: 'Выход активирован личной картой и биометрией.', en: 'The exit used the trainee card and biometrics.' }, meta: { logPrompt: 'gate@navacademy:~$ tail -f /var/log/exit-pass.log' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'cache-photo', type: 'photo', title: { ru: 'Тайник за скамьёй', en: 'Bench Cache' }, content: { ru: 'За скамьёй найдены дорожный паёк, наличные кредиты и запасная куртка, сложенные заранее.', en: 'A ration pack, cash credits, and spare jacket were found hidden behind a bench.' }, contradiction: true, explanation: { ru: 'Тайник указывает на подготовленный побег.', en: 'The cache points to a planned escape.' }, meta: { filename: 'IMG_20260601_082244.jpg' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'letter', type: 'document', title: { ru: 'Личное письмо', en: 'Personal Letter' }, content: { ru: '«Я ухожу сам. В стенах академии протоколы не вскроют. Если получится, передам копии наружу».', en: '"I am leaving on my own. Inside academy walls the protocols will stay buried. If I can, I will pass copies outside."' }, contradiction: true, explanation: { ru: 'Письмо прямо говорит о добровольном уходе.', en: 'The letter directly states voluntary departure.' }, thesisId: 'incident', relation: 'contradicts' }),
          evidence({ id: 'protocol-draft', type: 'document', title: { ru: 'Черновик экзаменационного протокола', en: 'Exam Protocol Draft' }, content: { ru: 'В черновике отмечены исправленные оценки и подписи, не совпадающие с журналом комиссии.', en: 'The draft shows altered grades and signatures that do not match the commission log.' }, contradiction: false, explanation: neutral, thesisId: 'damage', relation: 'context' }),
          evidence({ id: 'phone-detail', type: 'phone_records', title: { ru: 'Детализация связи', en: 'Call Detail' }, content: { ru: ['31.05 22:40 — исходящее: общественный терминал порта', '01.06 00:58 — короткий вызов: учебный корпус', '01.06 01:24 — входящее: пригородный шлюз'], en: ['31 May 22:40 — outgoing: public port terminal', '01 Jun 00:58 — short call: academy wing', '01 Jun 01:24 — incoming: suburban gate'] }, contradiction: true, explanation: { ru: 'Звонки показывают связь с маршрутом ухода, а не с похитителями.', en: 'The calls track an escape route rather than kidnappers.' }, meta: { carrierName: L('RelayTel Sector', 'RelayTel Sector'), phoneMask: '+0 (7••) •••-••-18' }, thesisId: 'incident', relation: 'contradicts' }),
        ],
      },
    ],
  },
];

// Additional packs are built with compact source data to keep generated JSON uniform.
const moreCases = [
  [44, 'Пожар в теплице редких мандрагор', 'Greenhouse Fire of Rare Mandragoras', 'Эвелина Морн, 49 лет', 'Evelina Morn, 49', 'Заведующая учебной теплицей', 'Training greenhouse curator', 19200, 'Редкие корни вспыхнули сами, уничтожив стекло и инвентарь. Прошу полную компенсацию.', 'Rare roots ignited on their own, destroying glass and equipment. I request full compensation.', ['Фото очага у стола смешивания', 'Складской журнал пропажи горшков', 'Ночной доступ старшекурсников', 'Банковская продажа ингредиентов'], 'Закрытый Коллегиум'],
  [45, 'Пропавший экзаменационный кубок', 'Missing Examination Cup', 'Бруно Стерн, 57 лет', 'Bruno Stern, 57', 'Комендант зала наград', 'Trophy hall steward', 23500, 'Кубок похитили внешние злоумышленники перед церемонией. Требуется выплата за реликвию.', 'Outside intruders stole the cup before the ceremony. Payout for the relic is required.', ['Витрина открыта ключом', 'Акт реставрации с подменой металла', 'Камера сотрудника ночью', 'Опись с похожим свёртком'], 'Закрытый Коллегиум'],
  [46, 'Падение с учебной башни', 'Fall from the Training Tower', 'Ника Рейн, 18 лет', 'Nika Rain, 18', 'Курсант воздушной практики', 'Aerial practice cadet', 16800, 'Защитные чары башни отказали сами по себе, и я получила травму. Прошу оплатить лечение.', 'The tower safety wards failed on their own and I was injured. I request medical compensation.', ['Пломба крепления снята вручную', 'Медосмотр со стимулятором', 'Ветер в допустимых пределах', 'Спор перед тренировкой'], 'Закрытый Коллегиум'],
  [47, 'Ночной побег из общежития', 'Night Escape from the Dormitory', 'Аделия Варн, 16 лет', 'Adelia Varn, 16', 'Ученица пансиона', 'Boarding student', 14200, 'Меня похитили из закрытого общежития, комната разгромлена. Прошу возместить вещи и поисковые расходы.', 'I was abducted from the closed dormitory and the room was wrecked. I request compensation for belongings and search costs.', ['Окно открыто изнутри', 'Сундук собран заранее', 'Камера у калитки', 'Письмо о времени ухода'], 'Закрытый Коллегиум'],
  [48, 'Разгром пиццерии после ночной драки', 'Pizza Shop Damage after a Night Brawl', 'Марко Лин, 44 года', 'Marco Lin, 44', 'Владелец круглосуточной пиццерии', 'All-night pizza shop owner', 12600, 'Банда в масках разгромила кухню и уничтожила новое оборудование. Прошу полную выплату.', 'A masked gang wrecked the kitchen and destroyed new equipment. I request full payout.', ['Печь со старым износом', 'Накладная за неделю до драки', 'Камера с малым числом участников', 'Курьер про старый холодильник'], 'Подземный Отдел'],
  [49, 'Кража лабораторного мутагена', 'Laboratory Mutagen Theft', 'Герман Кросс, 46 лет', 'Herman Cross, 46', 'Руководитель частной лаборатории', 'Private laboratory director', 38800, 'Контейнер с реагентом украли неизвестные из сервисного тоннеля. Прошу возместить препарат.', 'Unknown intruders stole a reagent container through a service tunnel. I request compensation.', ['Взлом изнутри вентиляции', 'Поздний вход директора', 'Перевод от биотех-посредника', 'Неполная инвентаризация'], 'Подземный Отдел'],
  [50, 'Пожар в антикварном додзё', 'Fire in the Antique Dojo', 'Харитон Сэн, 65 лет', 'Khariton Sen, 65', 'Хранитель подпольного додзё-музея', 'Underground dojo-museum keeper', 21400, 'Конкурирующий клан поджёг музей и повредил коллекцию. Прошу выплату.', 'A rival clan burned the museum and damaged the collection. I request payout.', ['Очаг в подсобке с химией', 'Доставка серы и стружки', 'Нет внешнего проникновения', 'Ученик о ночных тренировках'], 'Подземный Отдел'],
  [51, 'Угон фургона с уличной электроникой', 'Van Hijack with Street Electronics', 'Роман Драй, 33 года', 'Roman Dry, 33', 'Водитель грузового фургона', 'Cargo van driver', 19700, 'Организованная банда перехватила фургон с сенсорами. Прошу выплату за груз.', 'An organized gang intercepted my van with sensor cargo. I request payment for the load.', ['GPS без насильственной остановки', 'Камера спокойной разгрузки', 'Переписка с посредником', 'Осмотр без следов борьбы'], 'Подземный Отдел'],
];

function compactCase([n, ruTitle, enTitle, ruPerson, enPerson, ruRole, enRole, amount, ruStory, enStory, clues, archive]) {
  const isVehicle = n === 51;
  const isLab = n === 49;
  const ids = ['photo', 'document', 'camera', 'log', 'bank', isVehicle ? 'gps' : 'witness'];
  const contradictionIds = new Set(['photo', 'log', 'bank', isVehicle ? 'gps' : 'camera']);
  const clueText = clues.join('; ');
  return {
    id: `case-${String(n).padStart(3, '0')}`,
    type: 'standard',
    difficulty: 'hard',
    claimAmount: amount,
    truth: 'fraud',
    investigationBudget: 4,
    title: L(ruTitle, enTitle),
    claimTheses: thesis,
    claim: { person: L(ruPerson, enPerson), story: L(ruStory, enStory) },
    coverImage: `covers/case-${String(n).padStart(3, '0')}.svg`,
    client: {
      role: L(ruRole, enRole),
      meta: [
        { k: L('Архив', 'Archive'), v: L(archive, archive) },
        { k: L('Статус', 'Status'), v: L('Особое архивное дело', 'Special archive file') },
      ],
    },
    evidences: ids.map((kind, i) => {
      const contradiction = contradictionIds.has(kind);
      const common = {
        id: `${kind}-${n}`,
        contradiction,
        thesisId: contradiction ? 'incident' : 'damage',
        relation: contradiction ? 'contradicts' : 'context',
        explanation: contradiction
          ? { ru: `Улика раскрывает несостыковку: ${clues[i % clues.length].toLowerCase()}.`, en: `This evidence exposes the inconsistency: ${clues[i % clues.length].toLowerCase()}.` }
          : neutral,
      };
      if (kind === 'photo') return evidence({ ...common, type: 'photo', title: { ru: clues[0], en: 'Scene photo' }, content: { ru: `${clues[0]}. Детали на снимке не совпадают с заявленной версией происшествия.`, en: `${clues[0]}. The photo details do not match the reported incident.` }, meta: { filename: `IMG_202606${String(n - 39).padStart(2, '0')}_081500.jpg` } });
      if (kind === 'document') return evidence({ ...common, type: 'document', title: { ru: 'Официальная опись', en: 'Official Inventory' }, content: { ru: `В описи зафиксированы исходные позиции дела. Ключевые подсказки: ${clueText}.`, en: `The inventory records the baseline file data. Key notes: ${clueText}.` } });
      if (kind === 'camera') return evidence({ ...common, type: 'camera_recording', title: { ru: 'Запись камеры', en: 'Camera Recording' }, content: { ru: `${clues[2] ?? clues[0]}. На записи нет признаков заявленного нападения.`, en: `${clues[2] ?? clues[0]}. The recording lacks signs of the alleged attack.` }, meta: { cameraId: `ARC-${n}`, cameraModel: 'HIKVISION DS-2CD2143G2-I · 4K · H.265' } });
      if (kind === 'log') return evidence({ ...common, type: 'usage_log', title: { ru: 'Журнал доступа', en: 'Access Log' }, content: { ru: ['22:11 — штатный вход владельца', '22:28 — ручное отключение датчика', '22:46 — событие зафиксировано без тревоги'], en: ['22:11 — normal owner entry', '22:28 — sensor manually disabled', '22:46 — event recorded without alarm'] }, meta: { logPrompt: `archive@case${n}:~$ tail -f /var/log/access.log` } });
      if (kind === 'bank') return evidence({ ...common, type: 'bank_statement', title: { ru: 'Финансовый след', en: 'Financial Trail' }, content: { ru: [`За день до события — платёж, связанный с делом: ${clues[1] ?? clues[0]}`, 'После события — перевод на личный счёт заявителя'], en: [`One day before incident — payment tied to the file: ${clues[1] ?? clues[0]}`, 'After incident — transfer to claimant personal account'] }, meta: { bankName: L(isLab ? 'BioTrust Bank' : 'Municipal Credit', isLab ? 'BioTrust Bank' : 'Municipal Credit'), accountMask: `•••• •••• •••• ${7000 + n}` } });
      if (kind === 'gps') return evidence({ ...common, type: 'gps', title: { ru: 'GPS-трек фургона', en: 'Van GPS Track' }, content: { ru: ['23:10 — штатная остановка у переулка', '23:18 — двигатель не глушился аварийно', '23:32 — спокойный выезд к складу'], en: ['23:10 — normal stop near alley', '23:18 — engine not emergency-stopped', '23:32 — calm departure toward warehouse'] }, meta: { company: L('UrbanRoute Control', 'UrbanRoute Control'), department: L('Отдел мониторинга городского транспорта', 'Urban Vehicle Monitoring Desk'), requestId: L('URC-2026-0612-V · Тип: трек фургона', 'URC-2026-0612-V · Type: van track'), gpsFooter: L('© UrbanRoute 2026 · GPS ACC: ±6m', '© UrbanRoute 2026 · GPS ACC: ±6m') } });
      return evidence({ ...common, type: 'witness_statement', title: { ru: 'Показания свидетеля', en: 'Witness Statement' }, content: { ru: `«Я видел бытовую подготовку, а не внезапное нападение. Особенно запомнилось: ${clues[3] ?? clues[0]}».`, en: `"I saw preparation, not a sudden attack. What stood out was: ${clues[3] ?? clues[0]}."` } });
    }),
    correctDecision: 'reject',
    explanation: lines(
      [
        `Ключевые улики не подтверждают заявленную версию: ${clues[0].toLowerCase()}.`,
        `Финансовые и технические следы показывают подготовленную инсценировку.`,
        'Страховой случай заявлен недостоверно: вердикт — отказ.',
      ],
      [
        `Key evidence does not support the reported version: ${clues[0].toLowerCase()}.`,
        'Financial and technical traces show a staged incident.',
        'The claim is unreliable: reject it.',
      ],
    ),
  };
}

const allCases = [...packs.flatMap((p) => p.cases), ...moreCases.map(compactCase)];

for (const c of allCases) {
  const id = c.id ?? `case-${String(c.n).padStart(3, '0')}`;
  const output = c.id ? c : {
    id,
    type: 'standard',
    difficulty: 'hard',
    claimAmount: c.amount,
    truth: 'fraud',
    investigationBudget: 4,
    title: L(c.title[0], c.title[1]),
    claimTheses: thesis,
    claim: { person: L(c.person[0], c.person[1]), story: L(c.story[0], c.story[1]) },
    coverImage: `covers/${id}.svg`,
    client: {
      role: L(c.role[0], c.role[1]),
      meta: c.meta.map(([k, v]) => ({ k: L(k, k), v: L(v, v) })),
    },
    evidences: c.evidences,
    correctDecision: 'reject',
    explanation: lines(c.explanation.map(([ru]) => ru), c.explanation.map(([, en]) => en)),
  };
  writeFileSync(join(casesDir, `${id}.json`), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  const hue = 30 + ((Number(id.slice(-3)) * 23) % 240);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#d8c39a"/><rect x="38" y="42" width="564" height="316" rx="18" fill="hsl(${hue} 22% 43%)" opacity=".36"/><path d="M70 118h500v202H70z" fill="#efe3c8" opacity=".92"/><path d="M104 92h178l28 34h226v38H104z" fill="#c8a86d"/><path d="M100 178h440M100 220h380M100 262h430" stroke="#6c5a42" stroke-width="10" stroke-linecap="round" opacity=".28"/><circle cx="502" cy="282" r="48" fill="none" stroke="#8f2f24" stroke-width="12" opacity=".55"/><text x="320" y="78" font-family="Georgia,serif" font-size="28" text-anchor="middle" fill="#463522">${id.toUpperCase()}</text></svg>`;
  writeFileSync(join(coversDir, `${id}.svg`), svg, 'utf8');
}
