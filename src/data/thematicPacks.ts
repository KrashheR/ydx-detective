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
}

const l = (
  ru: string,
  en: string,
  tr: string,
  ar: string,
  kk: string,
): LocalizedString => ({ ru, en, tr, ar, kk });

const ARCHIVE_CASE_IDS: Readonly<Record<string, readonly string[]>> = {
  "frontier-sector": ["case-040", "case-041", "case-042", "case-043"],
  "closed-collegium": ["case-044", "case-045", "case-046", "case-047"],
  "underground-department": ["case-048", "case-049", "case-050", "case-051"],
};

export const THEMATIC_PACKS: readonly ThematicPack[] = [
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

export function getThematicPackCaseIds(pack: ThematicPack): readonly string[] {
  return ARCHIVE_CASE_IDS[pack.id] ?? [];
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
