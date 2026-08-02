import { getCaseSummaryById } from "./caseLoader";
import type { CaseSummary, LocalizedString } from "../types";

export type ThematicPackStatus = "preview" | "free_available" | "ad_available";

export interface ThematicPack {
  readonly id: string;
  readonly productId: string;
  readonly fallbackPriceRub: number;
  readonly title: LocalizedString;
  readonly hook: LocalizedString;
  readonly caseTitles: readonly LocalizedString[];
  readonly skins: readonly LocalizedString[];
  readonly stampTitle: LocalizedString;
  readonly totalCases: number;
  readonly openedCases: number;
  readonly status: ThematicPackStatus;
  readonly accent: "archive" | "polar" | "cliff";
  /**
   * Shelf artwork for the Bureau, relative to `public/`. Optional because the
   * retired expert-file packs in `RETIRED_THEMATIC_PACKS` were never given
   * cover art — the shelf falls back to the folder-spine look for those.
   */
  readonly coverImage?: string;
  /** Period line above the title on the archive page ("Лето 1998"). */
  readonly era?: LocalizedString;
  /** One-line epigraph quoted on the archive page. */
  readonly epigraph?: LocalizedString;
  /** Approximate number of new evidence cards — advertised as "{n}+ улик". */
  readonly evidenceCount?: number;
}

const l = (
  ru: string,
  en: string,
  tr: string,
  ar: string,
  kk: string,
): LocalizedString => ({ ru, en, tr, ar, kk });

const packCaseIds = (packId: string, count: number): readonly string[] =>
  Array.from({ length: count }, (_, index) => `${packId}-${String(index + 1).padStart(2, "0")}`);

const ARCHIVE_CASE_IDS: Readonly<Record<string, readonly string[]>> = {
  // Story packs currently on the archives shelf.
  "dacha-romashka": packCaseIds("dacha-romashka", 10),
  "night-train": packCaseIds("night-train", 10),
  "sanatorium-priboy": packCaseIds("sanatorium-priboy", 10),
  // Retired expert files — their case JSON still ships as campaign cases 39–50.
  "frontier-sector": ["case-040", "case-041", "case-042", "case-043"],
  "closed-collegium": ["case-044", "case-045", "case-046", "case-047"],
  "underground-department": ["case-048", "case-049", "case-050", "case-051"],
};

/**
 * The premium story packs the archives screen lists, in shelf order.
 *
 * Only these are offered to the player. The three expert-file packs below in
 * `RETIRED_THEMATIC_PACKS` stay in the codebase (and their cases stay in the
 * standard campaign) so they can be brought back without re-authoring them.
 */
export const THEMATIC_PACKS: readonly ThematicPack[] = [
  {
    id: "dacha-romashka",
    productId: "archive.dacha-romashka",
    fallbackPriceRub: 299,
    title: l(
      "СНТ «Ромашка». Тайна тринадцатого участка",
      "Romashka Gardens: The Secret of Plot 13",
      "Romashka Bahçeleri: 13. Parselin Sırrı",
      "بساتين روماشكا: سر القطعة 13",
      "«Ромашка» серіктестігі: он үшінші учаскенің құпиясы",
    ),
    hook: l(
      "Десять летних дел в дачном посёлке: разбитая теплица, украденный улей, сгоревшая баня и участок №13, у которого никогда не было хозяина.",
      "Ten summer files in a garden association: a shattered greenhouse, a stolen hive, a burnt bathhouse — and plot No. 13, which never had an owner.",
      "Bir bahçe kooperatifinde on yaz dosyası: kırılan sera, çalınan kovan, yanan hamam ve hiç sahibi olmamış 13 No.lu parsel.",
      "عشرة ملفات صيفية في جمعية بساتين: دفيئة محطمة وخلية مسروقة وحمّام محترق، وقطعة رقم 13 التي لم يكن لها مالك قط.",
      "Бақ серіктестігіндегі он жазғы іс: қираған жылыжай, ұрланған ұя, өртенген монша және иесі болмаған №13 учаске.",
    ),
    caseTitles: [],
    skins: [
      l("Папка с ромашковым корешком", "Daisy-spined folder", "Papatya sırtlı dosya", "ملف بكعب أقحواني", "Түймедақ түпті папка"),
      l("Штамп правления СНТ", "Garden board stamp", "Kooperatif yönetim damgası", "ختم مجلس الجمعية", "Серіктестік басқармасының мөрі"),
    ],
    stampTitle: l(
      "Штамп общего сада",
      "Common Orchard Stamp",
      "Ortak Bahçe Damgası",
      "ختم البستان المشترك",
      "Ортақ бақ мөрі",
    ),
    totalCases: 10,
    openedCases: 1,
    status: "ad_available",
    accent: "polar",
    coverImage: "covers/packs/dacha-romashka-archive.webp",
    era: l("Лето 1998", "Summer 1998", "1998 Yazı", "صيف 1998", "1998 жылғы жаз"),
    epigraph: l(
      "«На даче все всё знают. Просто рассказывают в неправильном порядке»",
      "\"On the allotments everybody knows everything. They just tell it in the wrong order.\"",
      "«Bahçelerde herkes her şeyi bilir. Sadece yanlış sırayla anlatır.»",
      "«في البساتين يعرف الجميع كل شيء، لكنهم يروونه بترتيب خاطئ»",
      "«Бақшада бәрі бәрін біледі. Тек дұрыс емес ретпен айтады»",
    ),
    evidenceCount: 30,
  },
  {
    id: "night-train",
    productId: "archive.night-train",
    fallbackPriceRub: 299,
    title: l(
      "Поезд №13. Билет до станции Тихая",
      "Train No. 13: Ticket to Tikhaya",
      "13 No.lu Tren: Tihaya’ya Bilet",
      "القطار رقم 13: تذكرة إلى تيخايا",
      "№13 пойыз: Тихая станциясына билет",
    ),
    hook: l(
      "Десять дел за одну ночь в последнем рейсе «Северной звезды»: пропавший чемодан, разбитые часы, архивный ящик и билет до станции, закрытой в 1996 году.",
      "Ten files in a single night aboard the Northern Star's last run: a missing suitcase, a broken watch, an archive crate and a ticket to a station closed in 1996.",
      "«Kuzey Yıldızı»nın son seferinde tek gecede on dosya: kayıp bir bavul, kırık bir saat, bir arşiv sandığı ve 1996’da kapanan bir istasyona bilet.",
      "عشرة ملفات في ليلة واحدة على متن آخر رحلة لـ«النجم الشمالي»: حقيبة مفقودة وساعة محطمة وصندوق أرشيف وتذكرة إلى محطة أُغلقت عام 1996.",
      "«Солтүстік жұлдыздың» соңғы рейсіндегі бір түндегі он іс: жоғалған чемодан, сынған сағат, архив жәшігі және 1996 жылы жабылған станцияға дейінгі билет.",
    ),
    caseTitles: [],
    skins: [
      l("Папка с тёмно-синим корешком", "Night-blue folder spine", "Gece mavisi dosya sırtı", "كعب ملف أزرق ليلي", "Түнгі көк түпті папка"),
      l("Служебный бланк поездной бригады", "Train crew service form", "Tren ekibi hizmet formu", "نموذج خدمة طاقم القطار", "Пойыз бригадасының қызметтік бланкі"),
    ],
    stampTitle: l(
      "Штамп поездной бригады",
      "Train Crew Stamp",
      "Tren Ekibi Damgası",
      "ختم طاقم القطار",
      "Пойыз бригадасының мөрі",
    ),
    totalCases: 10,
    openedCases: 1,
    status: "ad_available",
    accent: "cliff",
    coverImage: "covers/packs/night-train-archive.webp",
    era: l("Ночь на 12 марта", "The night of 12 March", "12 Mart gecesi", "ليلة 12 مارس", "12 наурызға қараған түн"),
    epigraph: l(
      "«Ночной состав идёт без остановок. Но один пассажир точно не доедет до конечной»",
      "\"The night train runs without stops. But one passenger will not reach the last station.\"",
      "«Gece treni duraksız gider. Ama bir yolcu son durağa varmayacak.»",
      "«قطار الليل يسير بلا توقف. لكن راكبًا واحدًا لن يصل إلى المحطة الأخيرة»",
      "«Түнгі құрам аялдамасыз жүреді. Бірақ бір жолаушы соңғы аялдамаға жетпейді»",
    ),
    evidenceCount: 30,
  },
  {
    id: "sanatorium-priboy",
    productId: "archive.sanatorium-priboy",
    fallbackPriceRub: 299,
    title: l(
      "Санаторий «Прибой». Последняя смена",
      "The Priboy Sanatorium: The Last Shift",
      "«Priboy» Sanatoryumu: Son Vardiya",
      "مصحة «بريبوي»: الوردية الأخيرة",
      "«Прибой» санаторийі: соңғы ауысым",
    ),
    hook: l(
      "Старый приморский санаторий продают под снос. Десять дел за последнюю смену: инсценированная кража, фиктивная поставка, замурованный номер 404 — и фотография 1998 года, с которой аккуратно вырезан один человек.",
      "An old seaside sanatorium is being sold for demolition. Ten files in one last shift: a staged theft, a phantom delivery, the bricked-up room 404 — and a 1998 photograph with one person carefully cut out of it.",
      "Eski bir deniz kenarı sanatoryumu yıkım için satılıyor. Son vardiyada on dosya: sahnelenmiş bir hırsızlık, hayali bir teslimat, örülmüş 404 numaralı oda ve içinden bir kişinin özenle kesildiği 1998 fotoğrafı.",
      "مصحة قديمة على البحر تُباع للهدم. عشرة ملفات في وردية أخيرة: سرقة ممثَّلة وتوريد وهمي والغرفة 404 المسدودة، وصورة من 1998 قُصّ منها شخص بعناية.",
      "Ескі теңіз жағасындағы санаторий бұзуға сатылып жатыр. Соңғы ауысымдағы он іс: қойылған ұрлық, жалған жеткізілім, бітелген 404 нөмір — және бір адам ұқыпты қиып алынған 1998 жылғы фотосурет.",
    ),
    caseTitles: [],
    skins: [
      l("Папка с морским корешком", "Sea-green folder spine", "Deniz yeşili dosya sırtı", "كعب ملف بلون البحر", "Теңіз түсті түпті папка"),
      l("Санаторно-курортная книжка", "Sanatorium record book", "Sanatoryum kayıt defteri", "دفتر المصحة", "Санаторий-курорт кітапшасы"),
    ],
    stampTitle: l(
      "Штамп «Дело не смоет»",
      "The \"Tide Won't Wash It\" Stamp",
      "«Dalga Silemez» Damgası",
      "ختم «الموج لا يمحوه»",
      "«Толқын шайып кетпейді» мөрі",
    ),
    totalCases: 10,
    openedCases: 1,
    status: "ad_available",
    accent: "archive",
    coverImage: "covers/packs/sanatorium-priboy-archive.webp",
    era: l("Октябрь, последняя смена", "October, the last shift", "Ekim, son vardiya", "أكتوبر، الوردية الأخيرة", "Қазан, соңғы ауысым"),
    epigraph: l(
      "«Закрытый курорт, штормовая ночь и постояльцы, которым есть что скрывать»",
      "\"A closed resort, a stormy night, and guests with something to hide.\"",
      "«Kapalı bir tatil yeri, fırtınalı bir gece ve saklayacak şeyi olan misafirler.»",
      "«منتجع مغلق وليلة عاصفة ونزلاء لديهم ما يخفونه»",
      "«Жабық курорт, дауылды түн және жасыратыны бар қонақтар»",
    ),
    evidenceCount: 30,
  },
];

/**
 * Expert-file packs taken off the archives shelf. Kept — with their case ids —
 * so they can return later; nothing here is rendered while it is not in
 * `THEMATIC_PACKS`.
 */
export const RETIRED_THEMATIC_PACKS: readonly ThematicPack[] = [
  {
    id: "frontier-sector",
    productId: "  ",
    fallbackPriceRub: 299,
    title: l(
      "Архив Пограничного Сектора",
      "Frontier Sector Archive",
      "Sınır Sektörü Arşivi",
      "أرشيف القطاع الحدودي",
      "Шекара секторы архиві",
    ),
    hook: l(
      "Космоопера через страховые расследования: фермы на лунах, ледяные каньоны, семейные реликвии и академические пропажи без прямых франшизных маркеров.",
      "Space-opera insurance files where the GC-17 mark slowly exposes the Grey Convoy behind moon farms, ice canyons, relics, and academy disappearances.",
      "Uzay operası tadında sigorta dosyaları: ay çiftlikleri, buz kanyonları, aile yadigarları ve akademi kayıpları.",
      "ملفات تأمين بطابع أوبرا فضائية: مزارع قمرية وأودية جليدية وذخائر عائلية واختفاءات أكاديمية.",
      "Ғарыш операсы реңкіндегі сақтандыру істері: ай фермалары, мұз шатқалдары, отбасылық жәдігерлер және академиядағы жоғалулар.",
    ),
    caseTitles: [
      l("Сгоревший груз на лунной ферме", "Burned Cargo on the Moon Farm", "Ay Çiftliğinde Yanan Yük", "حمولة محترقة في مزرعة قمرية", "Ай фермасындағы өртенген жүк"),
      l("Потерянный перехватчик в ледяном каньоне", "Lost Interceptor in the Ice Canyon", "Buz Kanyonunda Kayıp Önleyici", "اعتراض مفقود في الوادي الجليدي", "Мұз шатқалындағы жоғалған тосқауылшы"),
      l("Пропавший церемониальный клинок", "Missing Ceremonial Blade", "Kayıp Tören Kılıcı", "النصل الاحتفالي المفقود", "Жоғалған салтанатты жүз"),
      l("Исчезнувший ученик навигатора", "Missing Navigator Student", "Kayıp Seyrüsefer Öğrencisi", "طالب الملاحة المفقود", "Жоғалған навигатор шәкірті"),
    ],
    skins: [
      l("Папка с серо-стальным корешком", "Grey steel folder spine", "Gri çelik dosya sırtı", "كعب ملف فولاذي رمادي", "Сұр болат түпті папка"),
      l("Лист маршрута с навигационной сеткой", "Route sheet with nav grid", "Seyir ızgaralı rota sayfası", "ورقة مسار بشبكة ملاحة", "Навигациялық торы бар бағыт парағы"),
    ],
    stampTitle: l("Штамп пограничного архива", "Frontier Archive Stamp", "Sınır Arşivi Damgası", "ختم أرشيف الحدود", "Шекара архивінің мөрі"),
    totalCases: 4,
    openedCases: 4,
    status: "free_available",
    accent: "polar",
  },
  {
    id: "closed-collegium",
    productId: "archive.closed-collegium",
    fallbackPriceRub: 299,
    title: l(
      "Архив Закрытого Коллегиума",
      "Closed Collegium Archive",
      "Kapalı Kolej Arşivi",
      "أرشيف الكلية المغلقة",
      "Жабық коллегиум архиві",
    ),
    hook: l(
      "Бюрократия чудес вместо фан-арта: теплицы, кубки, учебные башни и общежития в формате строгих страховых досье.",
      "Bureaucracy of wonders where gray-ribbon copycats hide one real threat across greenhouses, trophies, training towers, and dormitories.",
      "Fan-art yerine mucizeler bürokrasisi: seralar, kupalar, eğitim kuleleri ve yatakhaneler.",
      "بيروقراطية العجائب بدلاً من فن المعجبين: دفيئات وكؤوس وأبراج تدريب ومهاجع في ملفات تأمين صارمة.",
      "Фан-арт емес, ғажайыптар бюрократиясы: жылыжайлар, кубоктар, оқу мұнаралары және жатақханалар.",
    ),
    caseTitles: [
      l("Пожар в теплице редких мандрагор", "Greenhouse Fire of Rare Mandragoras", "Nadir Mandragora Serasında Yangın", "حريق دفيئة الماندراجورا النادرة", "Сирек мандрагора жылыжайындағы өрт"),
      l("Пропавший экзаменационный кубок", "Missing Examination Cup", "Kayıp Sınav Kupası", "كأس الامتحان المفقود", "Жоғалған емтихан кубогы"),
      l("Падение с учебной башни", "Fall from the Training Tower", "Eğitim Kulesinden Düşüş", "سقوط من برج التدريب", "Оқу мұнарасынан құлау"),
      l("Ночной побег из общежития", "Night Escape from the Dormitory", "Yatakhane Gece Kaçışı", "هروب ليلي من المهجع", "Жатақханадан түнгі қашу"),
    ],
    skins: [
      l("Папка с сургучной лентой", "Wax-banded folder", "Mum şeritli dosya", "ملف بشريط شمعي", "Сүргіш ленталы папка"),
      l("Латунная настольная лампа", "Brass desk lamp", "Pirinç masa lambası", "مصباح مكتب نحاسي", "Жез үстел шамы"),
    ],
    stampTitle: l("Штамп редкого архива", "Rare Archive Stamp", "Nadir Arşiv Damgası", "ختم الأرشيف النادر", "Сирек архив мөрі"),
    totalCases: 4,
    openedCases: 1,
    status: "ad_available",
    accent: "archive",
  },
  {
    id: "underground-department",
    productId: "archive.underground-department",
    fallbackPriceRub: 299,
    title: l(
      "Архив Подземного Отдела",
      "Underground Department Archive",
      "Yeraltı Dairesi Arşivi",
      "أرشيف القسم الجوفي",
      "Жерасты бөлімінің архиві",
    ),
    hook: l(
      "Городской нео-нуар про тоннели, лаборатории, додзё и ночные доставки: отсылка считывается, но дела остаются оригинальными страховыми расследованиями.",
      "Urban neo-noir where East Yard turns tunnels, labs, dojos, and night deliveries into one resale-and-insurance chain.",
      "Tüneller, laboratuvarlar, dojolar ve gece teslimatları hakkında kentsel neo-noir sigorta dosyaları.",
      "نوار حضري عن الأنفاق والمختبرات والدوجو والتوصيلات الليلية، مع تحقيقات تأمين أصلية.",
      "Тоннельдер, зертханалар, додзё және түнгі жеткізілімдер туралы қалалық нео-нуар сақтандыру істері.",
    ),
    caseTitles: [
      l("Разгром пиццерии после ночной драки", "Pizza Shop Damage after a Night Brawl", "Gece Kavgasından Sonra Pizzacı Hasarı", "تخريب مطعم بيتزا بعد شجار ليلي", "Түнгі төбелестен кейінгі пиццерия шығыны"),
      l("Кража лабораторного мутагена", "Laboratory Mutagen Theft", "Laboratuvar Mutajeni Hırsızlığı", "سرقة مطفر مختبري", "Зертханалық мутаген ұрлығы"),
      l("Пожар в антикварном додзё", "Fire in the Antique Dojo", "Antika Dojoda Yangın", "حريق في دوجو أثري", "Антикварлық додзёдағы өрт"),
      l("Угон фургона с уличной электроникой", "Van Hijack with Street Electronics", "Sokak Elektroniği Minibüsü Kaçırma", "اختطاف شاحنة إلكترونيات", "Көше электроникасы бар фургонды айдап әкету"),
    ],
    skins: [
      l("Тёмная архивная папка", "Dark archive folder", "Koyu arşiv dosyası", "ملف أرشيف داكن", "Қара архив папкасы"),
      l("Служебная карточка тоннельного отдела", "Tunnel desk service card", "Tünel birimi hizmet kartı", "بطاقة خدمة قسم الأنفاق", "Тоннель бөлімі қызмет картасы"),
    ],
    stampTitle: l("Штамп подземного отдела", "Underground Department Stamp", "Yeraltı Dairesi Damgası", "ختم القسم الجوفي", "Жерасты бөлімінің мөрі"),
    totalCases: 4,
    openedCases: 0,
    status: "preview",
    accent: "cliff",
  },
];

/**
 * Every pack the game knows about, listed or retired. Purchase restore and
 * ad-free checks must keep working for a pack that has left the shelf, so they
 * resolve against this list rather than `THEMATIC_PACKS`.
 */
export const ALL_THEMATIC_PACKS: readonly ThematicPack[] = [
  ...THEMATIC_PACKS,
  ...RETIRED_THEMATIC_PACKS,
];

export function getThematicPackCaseIds(pack: ThematicPack): readonly string[] {
  return ARCHIVE_CASE_IDS[pack.id] ?? [];
}

/** The pack a product id belongs to, or null when it is not an archive product. */
export function getThematicPackIdByProductId(productId: string): string | null {
  const id = productId.trim();
  if (!id) return null; // a pack with a blank productId is not on sale yet
  return ALL_THEMATIC_PACKS.find((pack) => pack.productId.trim() === id)?.id ?? null;
}

/**
 * True when the case sits inside an archive pack the player bought — buying a
 * pack removes forced ads inside it (the promise made in the packs modal).
 */
export function isPurchasedArchiveCase(
  caseId: string,
  purchasedPackIds: readonly string[],
): boolean {
  return ALL_THEMATIC_PACKS.some(
    (pack) => purchasedPackIds.includes(pack.id) && getThematicPackCaseIds(pack).includes(caseId),
  );
}

export function getThematicPackCases(pack: ThematicPack): readonly CaseSummary[] {
  return getThematicPackCaseIds(pack)
    .map((caseId) => getCaseSummaryById(caseId))
    .filter((caseData): caseData is CaseSummary => caseData !== undefined);
}

export function getThematicPackTotalCases(pack: ThematicPack): number {
  return getThematicPackCases(pack).length;
}

export function getThematicPackOpenedCases(pack: ThematicPack): number {
  return Math.min(pack.openedCases, getThematicPackTotalCases(pack));
}
