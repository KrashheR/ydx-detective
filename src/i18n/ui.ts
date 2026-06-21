/**
 * UI chrome strings (buttons, prompts) — separate from case content, but same
 * data-driven principle: add a language by adding a column. The case-content
 * translations live inside each case JSON; this file covers only the shell.
 */
import type { Difficulty, Language } from "../types";

export type UIKey =
  | "approve"
  | "reject"
  | "markContradiction"
  | "unmarkContradiction"
  | "rejectNeedsProof"
  | "caseClosed"
  | "fraudExposed"
  | "investigatorError"
  | "dailyCase"
  | "restoreFunds"
  | "balance"
  | "cases"
  | "progress"
  | "solved"
  | "accuracy"
  | "leaderboard"
  | "statement"
  | "evidence"
  | "claimLabel"
  | "reviewAllFirst"
  | "urgent"
  | "returnsIn"
  | "nextCase"
  | "backToDesk"
  | "verdictReward"
  | "proofReward"
  | "penalty"
  | "penaltyFalseStamps"
  | "penaltyFalseStampsHint"
  | "rewardEarned"
  | "bankruptTitle"
  | "bankruptDesc"
  | "language"
  | "rank"
  | "xpGained"
  | "promotion"
  | "bonus"
  | "streak"
  | "streakDays"
  | "hints"
  | "hintNote"
  | "hintCanvass"
  | "revealedContradiction"
  | "revealedClean"
  | "watchAd"
  | "allRevealed"
  | "achievements"
  | "achievementUnlocked"
  | "gameTitle"
  | "department"
  | "casesInWork"
  | "analytics"
  | "clientStatement"
  | "formCt1"
  | "circumstances"
  | "caseMaterials"
  | "documents"
  | "marked"
  | "openCaseAction"
  | "openDossier"
  | "viewedDossier"
  | "confidential"
  | "selectCasePrompt"
  | "truthOfCase"
  | "rewardRevealed"
  | "fee"
  | "companyBalance"
  | "investigationAccuracy"
  | "leaderboardWeek"
  | "verdictPrompt"
  | "rejectPayout"
  | "approvePayout"
  | "investigator"
  | "levelShort"
  | "xpToPromote"
  | "active"
  | "caseLocked"
  | "requiresLevel"
  | "completePreviousCase"
  | "completedCase"
  | "unlockedCases"
  | "lockedStatus"
  | "lockedCaseToast"
  | "markAsContradiction"
  | "contradictionMarked"
  | "contradiction"
  | "tag_photo"
  | "tag_gps"
  | "tag_document"
  | "tag_witness"
  | "tag_camera"
  | "tag_log"
  | "tag_xray"
  | "tag_bank"
  | "tag_phone"
  | "tag_social"
  | "casesWord"
  | "errorsWord"
  | "resultWinSub"
  | "resultLoseSub"
  | "caseNumber"
  | "difficulty_easy"
  | "difficulty_medium"
  | "difficulty_hard"
  | "efficiencyReward"
  | "budgetChecks"
  | "budgetHint"
  | "budgetExhausted"
  | "sealedDossier"
  | "tipApproveBudget"
  | "tipNoteUnaffordable"
  | "tipSealedCard"
  | "tipDailyLocked"
  | "tipCaseLockedLevel"
    | "difficulty_hard"
    | "doubleReward"
    | "rewardDoubled"
    | "ratingEyebrow"
    | "ratingRefNo"
    | "ratingTitle"
    | "ratingBody"
    | "ratingCta"
    | "ratingLater"
    | "ratingNever"
    | "ratingSubmitting"
    | "ratingDoneTitle"
    | "ratingDoneBody";

export const UI_STRINGS: Record<UIKey, Record<Language, string>> = {
  approve: {
    ru: "Одобрить",
    en: "Approve",
    tr: "Onayla",
    ar: "الموافقة",
    kk: "Мақұлдау",
  },
  reject: {
    ru: "Отклонить",
    en: "Reject",
    tr: "Reddet",
    ar: "رفض",
    kk: "Қабылдамау",
  },
  markContradiction: {
    ru: "Отметить противоречие",
    en: "Mark as Contradiction",
    tr: "Çelişki Olarak İşaretle",
    ar: "وضع علامة تناقض",
    kk: "Қайшылықты белгілеу",
  },
  unmarkContradiction: {
    ru: "Снять отметку",
    en: "Remove Mark",
    tr: "İşareti Kaldır",
    ar: "إزالة العلامة",
    kk: "Белгіні алу",
  },
  rejectNeedsProof: {
    ru: "Отказ должен быть обоснован. Укажите хотя бы одно противоречие в документах.",
    en: "Rejection must be justified. Specify at least one contradiction in the documents.",
    tr: "Ret gerekçelendirilmelidir. Belgelerde en az bir çelişki belirtin.",
    ar: "يجب تبرير الرفض. حدد تناقضًا واحدًا على الأقل في المستندات.",
    kk: "Бас тарту негізделуі керек. Құжаттардан кемінде бір қайшылық көрсетіңіз.",
  },
  caseClosed: {
    ru: "ДЕЛО ЗАКРЫТО",
    en: "CASE CLOSED",
    tr: "DOSYA KAPANDI",
    ar: "أُغلقت القضية",
    kk: "ІС ЖАБЫЛДЫ",
  },
  fraudExposed: {
    ru: "МОШЕННИК РАЗОБЛАЧЁН",
    en: "FRAUD EXPOSED",
    tr: "DOLANDIRICILIK ORTAYA ÇIKTI",
    ar: "كُشف الاحتيال",
    kk: "АЛАЯҚ ӘШКЕРЕЛЕНДІ",
  },
  investigatorError: {
    ru: "ОШИБКА СЛЕДОВАТЕЛЯ",
    en: "INVESTIGATOR ERROR",
    tr: "MÜFETTİŞ HATASI",
    ar: "خطأ المحقق",
    kk: "ТЕРГЕУШІ ҚАТЕСІ",
  },
  dailyCase: {
    ru: "Дело дня",
    en: "Daily Case",
    tr: "Günün Dosyası",
    ar: "قضية اليوم",
    kk: "Күн ісі",
  },
  restoreFunds: {
    ru: "Восстановить средства",
    en: "Restore Funds",
    tr: "Fonları Geri Yükle",
    ar: "استعادة الأموال",
    kk: "Қаражатты қалпына келтіру",
  },
  balance: {
    ru: "Баланс",
    en: "Balance",
    tr: "Bakiye",
    ar: "الرصيد",
    kk: "Баланс",
  },
  cases: {
    ru: "Дела",
    en: "Cases",
    tr: "Dosyalar",
    ar: "القضايا",
    kk: "Істер",
  },
  progress: {
    ru: "Прогресс",
    en: "Progress",
    tr: "İlerleme",
    ar: "التقدم",
    kk: "Прогресс",
  },
  solved: {
    ru: "раскрыто",
    en: "solved",
    tr: "çözüldü",
    ar: "محلولة",
    kk: "шешілді",
  },
  accuracy: {
    ru: "Точность",
    en: "Accuracy",
    tr: "Doğruluk",
    ar: "الدقة",
    kk: "Дәлдік",
  },
  leaderboard: {
    ru: "Рейтинг",
    en: "Leaderboard",
    tr: "Lider Tablosu",
    ar: "المتصدرون",
    kk: "Рейтинг",
  },
  statement: {
    ru: "Заявление",
    en: "Statement",
    tr: "Beyan",
    ar: "البيان",
    kk: "Өтініш",
  },
  evidence: {
    ru: "Улики",
    en: "Evidence",
    tr: "Kanıtlar",
    ar: "الأدلة",
    kk: "Дәлелдер",
  },
  claimLabel: {
    ru: "Сумма иска",
    en: "Claim",
    tr: "Talep",
    ar: "المطالبة",
    kk: "Талап",
  },
  reviewAllFirst: {
    ru: "Сначала изучите все улики",
    en: "Review all evidence first",
    tr: "Önce tüm kanıtları inceleyin",
    ar: "راجع كل الأدلة أولاً",
    kk: "Алдымен барлық дәлелдерді қараңыз",
  },
  urgent: { ru: "СРОЧНО", en: "URGENT", tr: "ACİL", ar: "عاجل", kk: "ШҰҒЫЛ" },
  returnsIn: {
    ru: "Доступно через",
    en: "Returns in",
    tr: "Şu süre sonra",
    ar: "يعود خلال",
    kk: "Қолжетімді болады",
  },
  nextCase: {
    ru: "Следующее дело",
    en: "Next Case",
    tr: "Sonraki Dosya",
    ar: "القضية التالية",
    kk: "Келесі іс",
  },
  backToDesk: {
    ru: "К столу",
    en: "Back to Desk",
    tr: "Masaya Dön",
    ar: "العودة للمكتب",
    kk: "Үстелге",
  },
  verdictReward: {
    ru: "За вердикт",
    en: "Verdict",
    tr: "Karar",
    ar: "الحكم",
    kk: "Шешім үшін",
  },
  proofReward: {
    ru: "За доказательства",
    en: "Proof",
    tr: "Kanıt",
    ar: "الإثبات",
    kk: "Дәлел үшін",
  },
  penalty: {
    ru: "Штраф",
    en: "Penalty",
    tr: "Ceza",
    ar: "غرامة",
    kk: "Айыппұл",
  },
  penaltyFalseStamps: {
    ru: "Штраф за ложные штампы",
    en: "False-stamp penalty",
    tr: "Yanlış damga cezası",
    ar: "غرامة الأختام الخاطئة",
    kk: "Жалған мөртабан айыппұлы",
  },
  penaltyFalseStampsHint: {
    ru: "Вы пометили чистые улики как противоречия — за каждую снимают часть гонорара.",
    en: "You stamped clean evidence as a contradiction — each one costs part of your fee.",
    tr: "Temiz kanıtları çelişki olarak damgaladınız — her biri ücretinizden kesinti yapar.",
    ar: "لقد ختمت أدلة سليمة كتناقض — كل واحدة تقتطع جزءًا من أتعابك.",
    kk: "Сіз таза дәлелдерді қайшылық деп белгіледіңіз — әрқайсысы гонорардың бір бөлігін алады.",
  },
  rewardEarned: {
    ru: "Итого",
    en: "Earned",
    tr: "Toplam",
    ar: "الإجمالي",
    kk: "Барлығы",
  },
  bankruptTitle: {
    ru: "Средства закончились",
    en: "Out of Funds",
    tr: "Fonlar Bitti",
    ar: "نفدت الأموال",
    kk: "Қаражат таусылды",
  },
  bankruptDesc: {
    ru: "Посмотрите рекламу, чтобы восстановить баланс и продолжить расследование.",
    en: "Watch an ad to restore your balance and continue investigating.",
    tr: "Bakiyeni geri yüklemek için bir reklam izle ve soruşturmaya devam et.",
    ar: "شاهد إعلانًا لاستعادة رصيدك ومواصلة التحقيق.",
    kk: "Балансты қалпына келтіру үшін жарнаманы көріңіз.",
  },
  language: { ru: "Язык", en: "Language", tr: "Dil", ar: "اللغة", kk: "Тіл" },
  rank: { ru: "Ранг", en: "Rank", tr: "Rütbe", ar: "الرتبة", kk: "Дәреже" },
  xpGained: { ru: "Опыт", en: "XP", tr: "Tecrübe", ar: "خبرة", kk: "Тәжірибе" },
  promotion: {
    ru: "ПОВЫШЕНИЕ",
    en: "PROMOTION",
    tr: "TERFİ",
    ar: "ترقية",
    kk: "ЖОҒАРЫЛАТУ",
  },
  bonus: { ru: "Бонус", en: "Bonus", tr: "Bonus", ar: "مكافأة", kk: "Бонус" },
  streak: { ru: "Серия", en: "Streak", tr: "Seri", ar: "سلسلة", kk: "Серия" },
  streakDays: { ru: "дн.", en: "days", tr: "gün", ar: "يوم", kk: "күн" },
  hints: {
    ru: "Подсказки",
    en: "Hints",
    tr: "İpuçları",
    ar: "تلميحات",
    kk: "Кеңестер",
  },
  hintNote: {
    ru: "Заметка инспектора",
    en: "Inspector Note",
    tr: "Müfettiş Notu",
    ar: "ملاحظة المفتش",
    kk: "Инспектор жазбасы",
  },
  hintCanvass: {
    ru: "Опрос свидетелей",
    en: "Witness Canvass",
    tr: "Tanık Görüşmesi",
    ar: "استجواب الشهود",
    kk: "Куәларды сұрау",
  },
  revealedContradiction: {
    ru: "Противоречие",
    en: "Contradiction",
    tr: "Çelişki",
    ar: "تناقض",
    kk: "Қайшылық",
  },
  revealedClean: {
    ru: "Без противоречий",
    en: "No contradiction",
    tr: "Çelişki yok",
    ar: "لا يوجد تناقض",
    kk: "Қайшылық жоқ",
  },
  watchAd: {
    ru: "Реклама",
    en: "Watch ad",
    tr: "Reklam izle",
    ar: "مشاهدة إعلان",
    kk: "Жарнама",
  },
  allRevealed: {
    ru: "Все улики раскрыты",
    en: "All evidence revealed",
    tr: "Tüm kanıtlar açıldı",
    ar: "تم كشف كل الأدلة",
    kk: "Барлық дәлел ашылды",
  },
  achievements: {
    ru: "Достижения",
    en: "Achievements",
    tr: "Başarılar",
    ar: "الإنجازات",
    kk: "Жетістіктер",
  },
  achievementUnlocked: {
    ru: "Достижение получено",
    en: "Achievement unlocked",
    tr: "Başarı kazanıldı",
    ar: "تم فتح إنجاز",
    kk: "Жетістік ашылды",
  },
  gameTitle: {
    ru: "Где ложь? Симулятор детектива",
    en: "Where is the Lie? Detective Simulator",
    tr: "Yalan Nerede? Dedektif Simülatörü",
    ar: "أين الكذبة؟ محاكي المحقق",
    kk: "Өтірік қайда? Тіміскі симуляторы",
  },
  department: {
    ru: "ОТДЕЛ РАССЛЕДОВАНИЙ",
    en: "INVESTIGATIONS DEPT",
    tr: "SORUŞTURMA BİRİMİ",
    ar: "قسم التحقيقات",
    kk: "ТЕРГЕУ БӨЛІМІ",
  },
  casesInWork: {
    ru: "ДЕЛА В РАБОТЕ",
    en: "CASES IN PROGRESS",
    tr: "AÇIK DOSYALAR",
    ar: "قضايا قيد العمل",
    kk: "ЖҰМЫСТАҒЫ ІСТЕР",
  },
  analytics: {
    ru: "АНАЛИТИКА",
    en: "ANALYTICS",
    tr: "ANALİTİK",
    ar: "التحليلات",
    kk: "АНАЛИТИКА",
  },
  clientStatement: {
    ru: "ЗАЯВЛЕНИЕ КЛИЕНТА",
    en: "CLIENT STATEMENT",
    tr: "MÜŞTERİ BEYANI",
    ar: "بيان العميل",
    kk: "КЛИЕНТ ӨТІНІШІ",
  },
  formCt1: {
    ru: "Форма СТ-1",
    en: "Form CT-1",
    tr: "Form CT-1",
    ar: "نموذج CT-1",
    kk: "СТ-1 нысаны",
  },
  circumstances: {
    ru: "ИЗЛОЖЕНИЕ ОБСТОЯТЕЛЬСТВ",
    en: "STATEMENT OF FACTS",
    tr: "OLAYLARIN ANLATIMI",
    ar: "عرض الوقائع",
    kk: "МӘН-ЖАЙДЫ БАЯНДАУ",
  },
  caseMaterials: {
    ru: "МАТЕРИАЛЫ ДЕЛА",
    en: "CASE MATERIALS",
    tr: "DOSYA BELGELERİ",
    ar: "مواد القضية",
    kk: "ІС МАТЕРИАЛДАРЫ",
  },
  documents: {
    ru: "документов",
    en: "documents",
    tr: "belge",
    ar: "مستندات",
    kk: "құжат",
  },
  marked: {
    ru: "отмечено",
    en: "marked",
    tr: "işaretli",
    ar: "موسوم",
    kk: "белгіленді",
  },
  openCaseAction: {
    ru: "Открыть дело",
    en: "Open case",
    tr: "Dosyayı aç",
    ar: "فتح القضية",
    kk: "Істі ашу",
  },
  openDossier: {
    ru: "Открыть досье",
    en: "Open file",
    tr: "Dosyayı aç",
    ar: "فتح الملف",
    kk: "Іс қағазын ашу",
  },
  viewedDossier: {
    ru: "Просмотрено",
    en: "Reviewed",
    tr: "İncelendi",
    ar: "تمت المراجعة",
    kk: "Қаралды",
  },
  confidential: {
    ru: "КОНФИДЕНЦИАЛЬНО",
    en: "CONFIDENTIAL",
    tr: "GİZLİ",
    ar: "سري",
    kk: "ҚҰПИЯ",
  },
  selectCasePrompt: {
    ru: "ВЫБЕРИТЕ ДЕЛО ДЛЯ РАССЛЕДОВАНИЯ",
    en: "SELECT A CASE TO INVESTIGATE",
    tr: "SORUŞTURULACAK DOSYAYI SEÇİN",
    ar: "اختر قضية للتحقيق",
    kk: "ТЕРГЕУГЕ ІС ТАҢДАҢЫЗ",
  },
  truthOfCase: {
    ru: "ИСТИНА ПО ДЕЛУ",
    en: "THE TRUTH OF THE CASE",
    tr: "DOSYANIN GERÇEĞİ",
    ar: "حقيقة القضية",
    kk: "ІС БОЙЫНША АҚИҚАТ",
  },
  rewardRevealed: {
    ru: "Раскрыто вознаграждения",
    en: "Reward unlocked",
    tr: "Açılan ödül",
    ar: "المكافأة المكشوفة",
    kk: "Ашылған сыйақы",
  },
  fee: { ru: "Гонорар", en: "Fee", tr: "Ücret", ar: "الأتعاب", kk: "Гонорар" },
  companyBalance: {
    ru: "Баланс компании",
    en: "Company balance",
    tr: "Şirket bakiyesi",
    ar: "رصيد الشركة",
    kk: "Компания балансы",
  },
  investigationAccuracy: {
    ru: "Точность следствия",
    en: "Investigation accuracy",
    tr: "Soruşturma doğruluğu",
    ar: "دقة التحقيق",
    kk: "Тергеу дәлдігі",
  },
  leaderboardWeek: {
    ru: "ЛИДЕРБОРД · НЕДЕЛЯ",
    en: "LEADERBOARD · WEEK",
    tr: "LİDER TABLOSU · HAFTA",
    ar: "المتصدرون · الأسبوع",
    kk: "РЕЙТИНГ · АПТА",
  },
  verdictPrompt: {
    ru: "Вынесите вердикт. Отклонение требует обоснования уликами.",
    en: "Render your verdict. A rejection must be justified by evidence.",
    tr: "Kararınızı verin. Ret, kanıtla gerekçelendirilmelidir.",
    ar: "أصدر حكمك. يجب تبرير الرفض بالأدلة.",
    kk: "Шешім шығарыңыз. Бас тарту дәлелмен негізделуі тиіс.",
  },
  rejectPayout: {
    ru: "ОТКЛОНИТЬ ВЫПЛАТУ",
    en: "REJECT PAYOUT",
    tr: "ÖDEMEYİ REDDET",
    ar: "رفض الدفع",
    kk: "ТӨЛЕМДІ ҚАБЫЛДАМАУ",
  },
  approvePayout: {
    ru: "ОДОБРИТЬ ВЫПЛАТУ",
    en: "APPROVE PAYOUT",
    tr: "ÖDEMEYİ ONAYLA",
    ar: "الموافقة على الدفع",
    kk: "ТӨЛЕМДІ МАҚҰЛДАУ",
  },
  investigator: {
    ru: "Детектив",
    en: "Detective",
    tr: "Dedektif",
    ar: "الديتيكتيف",
    kk: "Детектив",
  },
  levelShort: { ru: "ур.", en: "lvl", tr: "sv.", ar: "مست.", kk: "дең." },
  xpToPromote: {
    ru: "XP до повышения",
    en: "XP to promotion",
    tr: "terfiye XP",
    ar: "خبرة للترقية",
    kk: "жоғарылауға XP",
  },
  active: {
    ru: "активно",
    en: "active",
    tr: "aktif",
    ar: "نشط",
    kk: "белсенді",
  },
  caseLocked: {
    ru: "Дело закрыто архивом",
    en: "Case locked",
    tr: "Dosya kilitli",
    ar: "القضية مقفلة",
    kk: "Іс құлыпталған",
  },
  requiresLevel: {
    ru: "Откроется на ур. {level}",
    en: "Unlocks at lvl {level}",
    tr: "{level}. sv. açılır",
    ar: "يفتح عند المستوى {level}",
    kk: "{level}-дең. ашылады",
  },
  completePreviousCase: {
    ru: "Закройте предыдущее дело",
    en: "Close the previous case",
    tr: "Önceki dosyayı kapatın",
    ar: "أغلق القضية السابقة",
    kk: "Алдыңғы істі жабыңыз",
  },
  completedCase: {
    ru: "ЗАКРЫТО",
    en: "CLOSED",
    tr: "KAPANDI",
    ar: "مغلقة",
    kk: "ЖАБЫЛДЫ",
  },
  unlockedCases: {
    ru: "Открыто дел: {unlocked}/{total}",
    en: "Cases unlocked: {unlocked}/{total}",
    tr: "Açılan dosyalar: {unlocked}/{total}",
    ar: "القضايا المفتوحة: {unlocked}/{total}",
    kk: "Ашылған істер: {unlocked}/{total}",
  },
  lockedStatus: {
    ru: "заблокировано",
    en: "locked",
    tr: "kilitli",
    ar: "مقفل",
    kk: "құлыпталған",
  },
  lockedCaseToast: {
    ru: "Дело откроется на следующем уровне следователя.",
    en: "This case unlocks at the next investigator level.",
    tr: "Bu dosya bir sonraki müfettiş seviyesinde açılır.",
    ar: "تُفتح هذه القضية في مستوى المحقق التالي.",
    kk: "Бұл іс келесі тергеуші деңгейінде ашылады.",
  },
  markAsContradiction: {
    ru: "ОТМЕТИТЬ КАК ПРОТИВОРЕЧИЕ",
    en: "MARK AS CONTRADICTION",
    tr: "ÇELİŞKİ OLARAK İŞARETLE",
    ar: "وضع علامة تناقض",
    kk: "ҚАЙШЫЛЫҚ ДЕП БЕЛГІЛЕУ",
  },
  contradictionMarked: {
    ru: "ПРОТИВОРЕЧИЕ ОТМЕЧЕНО ✓ · убрать",
    en: "CONTRADICTION MARKED ✓ · remove",
    tr: "ÇELİŞKİ İŞARETLENDİ ✓ · kaldır",
    ar: "تم وسم التناقض ✓ · إزالة",
    kk: "ҚАЙШЫЛЫҚ БЕЛГІЛЕНДІ ✓ · алу",
  },
  contradiction: {
    ru: "ПРОТИВОРЕЧИЕ",
    en: "CONTRADICTION",
    tr: "ÇELİŞKİ",
    ar: "تناقض",
    kk: "ҚАЙШЫЛЫҚ",
  },
  tag_photo: { ru: "ФОТО", en: "PHOTO", tr: "FOTO", ar: "صورة", kk: "ФОТО" },
  tag_gps: { ru: "GPS", en: "GPS", tr: "GPS", ar: "GPS", kk: "GPS" },
  tag_document: { ru: "ДОК", en: "DOC", tr: "BELGE", ar: "مستند", kk: "ҚҰЖ" },
  tag_witness: {
    ru: "ПОКАЗАНИЯ",
    en: "WITNESS",
    tr: "TANIK",
    ar: "شهادة",
    kk: "КУӘЛІК",
  },
  tag_camera: {
    ru: "ВИДЕО",
    en: "VIDEO",
    tr: "VİDEO",
    ar: "فيديو",
    kk: "ВИДЕО",
  },
  tag_log: { ru: "ЛОГ", en: "LOG", tr: "KAYIT", ar: "سجل", kk: "ЛОГ" },
  tag_xray: { ru: "РЕНТГЕН", en: "X-RAY", tr: "RÖNTGEN", ar: "أشعة", kk: "РЕНТГЕН" },
  tag_bank: { ru: "БАНК", en: "BANK", tr: "BANKA", ar: "بنك", kk: "БАНК" },
  tag_phone: { ru: "ЗВОНКИ", en: "CALLS", tr: "ARAMALAR", ar: "مكالمات", kk: "ҚОҢЫРАУЛАР" },
  tag_social: { ru: "СОЦСЕТЬ", en: "SOCIAL", tr: "SOSYAL", ar: "اجتماعي", kk: "ӘЛЕУМ." },
  casesWord: { ru: "дел", en: "cases", tr: "dosya", ar: "قضايا", kk: "іс" },
  errorsWord: {
    ru: "ошибок",
    en: "errors",
    tr: "hata",
    ar: "أخطاء",
    kk: "қате",
  },
  resultWinSub: {
    ru: "Дело закрыто · выплата обоснованно отклонена",
    en: "Case closed · payout justifiably rejected",
    tr: "Dosya kapandı · ödeme haklı olarak reddedildi",
    ar: "أُغلقت القضية · رُفض الدفع بشكل مبرر",
    kk: "Іс жабылды · төлем негізді түрде қабылданбады",
  },
  resultLoseSub: {
    ru: "Выплата одобрена мошеннику",
    en: "Payout approved to a fraudster",
    tr: "Ödeme bir dolandırıcıya onaylandı",
    ar: "تمت الموافقة على الدفع لمحتال",
    kk: "Төлем алаяққа мақұлданды",
  },
  caseNumber: {
    ru: "Дело {n}",
    en: "Case {n}",
    tr: "Dosya {n}",
    ar: "قضية {n}",
    kk: "Іс {n}",
  },
  difficulty_easy: {
    ru: "Лёгкое",
    en: "Easy",
    tr: "Kolay",
    ar: "سهل",
    kk: "Оңай",
  },
  difficulty_medium: {
    ru: "Среднее",
    en: "Medium",
    tr: "Orta",
    ar: "متوسط",
    kk: "Орта",
  },
  difficulty_hard: {
    ru: "Сложное",
    en: "Hard",
    tr: "Zor",
    ar: "صعب",
    kk: "Қиын",
  },
  efficiencyReward: {
    ru: "Эффективность",
    en: "Efficiency",
    tr: "Verimlilik",
    ar: "الكفاءة",
    kk: "Тиімділік",
  },
  budgetChecks: {
    ru: "проверок",
    en: "checks",
    tr: "kontrol",
    ar: "فحوصات",
    kk: "тексеру",
  },
  budgetHint: {
    ru: "Лимит проверок улик в этом деле. Чем меньше потратите при верном вердикте — тем выше бонус за эффективность.",
    en: "Limit of evidence checks for this case. Spend fewer with a correct verdict to earn a bigger efficiency bonus.",
    tr: "Bu dosya için delil kontrolü sınırı. Doğru kararda daha az harcarsanız verimlilik bonusu artar.",
    ar: "حد فحوصات الأدلة لهذه القضية. أنفق أقل مع حكم صحيح لتحصل على مكافأة كفاءة أكبر.",
    kk: "Осы істегі дәлелдемелерді тексеру шегі. Дұрыс үкімде азырақ жұмсасаңыз — тиімділік бонусы жоғары.",
  },
  budgetExhausted: {
    ru: "Лимит проверок исчерпан — выносите вердикт.",
    en: "Check limit reached — render your verdict.",
    tr: "Kontrol sınırına ulaşıldı — kararınızı verin.",
    ar: "تم بلوغ حد الفحص — أصدر حكمك.",
    kk: "Тексеру шегі бітті — үкім шығарыңыз.",
  },
  sealedDossier: {
    ru: "Опечатано",
    en: "Sealed",
    tr: "Mühürlü",
    ar: "مختوم",
    kk: "Мөрленген",
  },
  tipApproveBudget: {
    ru: "Откройте хотя бы одну улику, чтобы вынести вердикт.",
    en: "Open at least one piece of evidence to render a verdict.",
    tr: "Karar verebilmek için en az bir kanıt açın.",
    ar: "افتح دليلاً واحدًا على الأقل لإصدار الحكم.",
    kk: "Шешім шығару үшін кемінде бір дәлелді ашыңыз.",
  },
  tipNoteUnaffordable: {
    ru: "Недостаточно средств: нужно ₽{amount}. Закрывайте дела, чтобы пополнить баланс.",
    en: "Not enough funds: ₽{amount} needed. Close cases to top up your balance.",
    tr: "Yetersiz bakiye: ₽{amount} gerekli. Bakiyeni artırmak için dosyaları kapat.",
    ar: "رصيد غير كافٍ: مطلوب ₽{amount}. أغلق القضايا لزيادة رصيدك.",
    kk: "Қаражат жеткіліксіз: ₽{amount} қажет. Балансты толтыру үшін істерді жабыңыз.",
  },
  tipSealedCard: {
    ru: "Лимит проверок исчерпан — улику уже не открыть. Выносите вердикт по собранным данным.",
    en: "Check limit reached — this evidence can't be opened. Decide with what you have.",
    tr: "Kontrol sınırına ulaşıldı — bu kanıt açılamaz. Eldeki bilgiyle karar ver.",
    ar: "تم بلوغ حد الفحص — لا يمكن فتح هذا الدليل. احكم بما لديك.",
    kk: "Тексеру шегі бітті — бұл дәлелді ашу мүмкін емес. Бар деректермен шешім шығарыңыз.",
  },
  tipDailyLocked: {
    ru: "Дело дня на сегодня раскрыто. Новое откроется через 24 часа.",
    en: "Today's daily case is done. A new one unlocks in 24 hours.",
    tr: "Bugünün günlük dosyası tamamlandı. Yenisi 24 saat içinde açılır.",
    ar: "قضية اليوم اكتملت. تُفتح قضية جديدة خلال 24 ساعة.",
    kk: "Бүгінгі күн ісі шешілді. Жаңасы 24 сағаттан кейін ашылады.",
  },
  tipCaseLockedLevel: {
    ru: "Откроется на {level}-м уровне следователя. Закрывайте дела и набирайте опыт.",
    en: "Unlocks at investigator level {level}. Close cases to earn XP.",
    tr: "Müfettiş seviyesi {level}'te açılır. XP kazanmak için dosyaları kapat.",
    ar: "يُفتح عند مستوى المحقق {level}. أغلق القضايا لكسب الخبرة.",
    kk: "Тергеуші {level}-деңгейінде ашылады. Тәжірибе жинау үшін істерді жабыңыз.",
  },
  doubleReward: {
    ru: "▶ Удвоить вознаграждение",
    en: "▶ Double Reward",
    tr: "▶ Ödülü İkiye Katla",
    ar: "▶ مضاعفة المكافأة",
    kk: "▶ Сыйақыны екі еселеу",
  },
  rewardDoubled: {
    ru: "Вознаграждение удвоено ✓",
    en: "Reward doubled ✓",
    tr: "Ödül iki katına çıktı ✓",
    ar: "تضاعفت المكافأة ✓",
    kk: "Сыйақы екі еселенді ✓",
  },

  /* ── Rating modal ─────────────────────────────────────────────────────── */
  ratingEyebrow: {
    ru: "ДЕПАРТАМЕНТ РАССЛЕДОВАНИЙ",
    en: "INVESTIGATIONS DEPT",
    tr: "SORUŞTURMA BİRİMİ",
    ar: "إدارة التحقيقات",
    kk: "ТЕРГЕУ ДЕПАРТАМЕНТІ",
  },
  ratingRefNo: {
    ru: "Форма ОС-5 · обратная связь",
    en: "Form OS-5 · Feedback",
    tr: "Form OS-5 · Geri Bildirim",
    ar: "نموذج الملاحظات OS-5",
    kk: "ОС-5 нысаны · кері байланыс",
  },
  ratingTitle: {
    ru: "Дело раскрыто. Отличная работа, детектив.",
    en: "Case solved. Excellent work, detective.",
    tr: "Dava çözüldü. Harika iş, dedektif.",
    ar: "القضية محلولة. عمل ممتاز أيها المحقق.",
    kk: "Іс шешілді. Тамаша жұмыс, детектив.",
  },
  ratingBody: {
    ru: "Ваша внимательность помогает разоблачать мошенников. Понравилась игра? Оцените её — это поможет другим найти это расследование.",
    en: "Your attention helps expose fraudsters. Enjoying the game? Rate it — this helps others discover this investigation.",
    tr: "Dikkatiniz dolandırıcıları ifşa etmeye yardımcı oluyor. Oyundan memnun musunuz? Değerlendirin — bu diğerlerinin bu soruşturmayı keşfetmesine yardımcı olur.",
    ar: "انتباهك يساعد في كشف المحتالين. هل تستمتع باللعبة؟ قيّمها — فهذا يساعد الآخرين على اكتشاف هذا التحقيق.",
    kk: "Сіздің зейінділігіңіз алаяқтарды әшкерелеуге көмектеседі. Ойын ұнады ма? Бағалаңыз — бұл басқаларға осы тергеуді табуға көмектеседі.",
  },
  ratingCta: {
    ru: "Оценить",
    en: "Rate game",
    tr: "Oyunu değerlendir",
    ar: "قيّم اللعبة",
    kk: "Бағалау",
  },
  ratingLater: {
    ru: "Не сейчас",
    en: "Not now",
    tr: "Şimdi değil",
    ar: "ليس الآن",
    kk: "Қазір емес",
  },
  ratingNever: {
    ru: "Больше не предлагать",
    en: "Don't ask again",
    tr: "Bir daha sorma",
    ar: "لا تسأل مرة أخرى",
    kk: "Бұдан әрі сұрама",
  },
  ratingSubmitting: {
    ru: "Открываем оценку Яндекса…",
    en: "Opening Yandex rating…",
    tr: "Yandex değerlendirmesi açılıyor…",
    ar: "جارٍ فتح تقييم Яндекс…",
    kk: "Яндекс бағасы ашылуда…",
  },
  ratingDoneTitle: {
    ru: "Спасибо за отзыв",
    en: "Thanks for your review",
    tr: "Yorumunuz için teşekkürler",
    ar: "شكرًا على ملاحظاتك",
    kk: "Пікіріңіз үшін рақмет",
  },
  ratingDoneBody: {
    ru: "Это помогает другим найти игру.",
    en: "This helps others find the game.",
    tr: "Bu, başkalarının oyunu bulmasına yardımcı olur.",
    ar: "هذا يساعد الآخرين في العثور على اللعبة.",
    kk: "Бұл басқаларға ойынды табуға көмектеседі.",
  },
};

/** Native names + flags for the language selector (data-driven). */
export const LANGUAGE_LABELS: Record<
  Language,
  { native: string; flag: string }
> = {
  ru: { native: "Русский", flag: "🇷🇺" },
  en: { native: "English", flag: "🇬🇧" },
  tr: { native: "Türkçe", flag: "🇹🇷" },
  ar: { native: "العربية", flag: "🇸🇦" },
  kk: { native: "Қазақша", flag: "🇰🇿" },
};

/** Languages that render right-to-left. */
export const RTL_LANGUAGES: ReadonlySet<Language> = new Set<Language>(["ar"]);

/** Convenience translator bound to the active language. */
export function t(key: UIKey, lang: Language): string {
  return UI_STRINGS[key][lang];
}

/** Localized "Case 1" / "Дело 1" label for the standard-case list order. */
export function formatCaseNumber(n: number, lang: Language): string {
  return UI_STRINGS.caseNumber[lang].replace("{n}", String(n));
}

/**
 * Unique title for each investigator rank — keyed by rank id from gameConfig.
 * All 30 levels are covered; the map is a simple lookup, not a UIKey, to keep
 * the UIKey union lean.
 */
export const RANK_TITLES: Record<string, Record<Language, string>> = {
  /* ── Tier 1: Новичок (1–4) ─────────────────────────────────────────────── */
  level_01: { ru: 'Стажёр',                en: 'Trainee',                   tr: 'Stajyer',                 ar: 'متدرب',                  kk: 'Тағылымдамашы'         },
  level_02: { ru: 'Помощник',              en: 'Assistant',                 tr: 'Yardımcı',                ar: 'مساعد',                  kk: 'Көмекші'               },
  level_03: { ru: 'Инспектор',             en: 'Inspector',                 tr: 'Müfettiş',                ar: 'مفتش',                   kk: 'Инспектор'             },
  level_04: { ru: 'Дознаватель',           en: 'Inquirer',                  tr: 'Sorgucu',                 ar: 'محقق مبتدئ',             kk: 'Тергеуші'              },
  /* ── Tier 2: Следователь (5–9) ─────────────────────────────────────────── */
  level_05: { ru: 'Следователь',           en: 'Investigator',              tr: 'Araştırmacı',             ar: 'محقق',                   kk: 'Тексеруші'             },
  level_06: { ru: 'Старший следователь',   en: 'Senior Investigator',       tr: 'Kıdemli Araştırmacı',    ar: 'محقق أول',               kk: 'Аға тексеруші'         },
  level_07: { ru: 'Аналитик',              en: 'Analyst',                   tr: 'Analist',                 ar: 'محلل',                   kk: 'Талдаушы'              },
  level_08: { ru: 'Детектив',              en: 'Detective',                 tr: 'Dedektif',                ar: 'محقق خاص',               kk: 'Детектив'              },
  level_09: { ru: 'Старший детектив',      en: 'Senior Detective',          tr: 'Kıdemli Dedektif',        ar: 'محقق خاص أول',           kk: 'Аға детектив'          },
  /* ── Tier 3: Агент (10–14) ─────────────────────────────────────────────── */
  level_10: { ru: 'Агент',                 en: 'Agent',                     tr: 'Ajan',                    ar: 'عميل',                   kk: 'Агент'                 },
  level_11: { ru: 'Специалист',            en: 'Specialist',                tr: 'Uzman',                   ar: 'متخصص',                  kk: 'Маман'                 },
  level_12: { ru: 'Эксперт',               en: 'Expert',                    tr: 'Uzman Dedektif',          ar: 'خبير',                   kk: 'Сарапшы'               },
  level_13: { ru: 'Главный эксперт',       en: 'Chief Expert',              tr: 'Baş Uzman',               ar: 'خبير رئيسي',             kk: 'Бас сарапшы'           },
  level_14: { ru: 'Профессионал',          en: 'Professional',              tr: 'Profesyonel',             ar: 'محترف',                  kk: 'Кәсіпқой'             },
  /* ── Tier 4: Мастер (15–19) ────────────────────────────────────────────── */
  level_15: { ru: 'Мастер',                en: 'Master',                    tr: 'Usta',                    ar: 'أستاذ',                  kk: 'Шебер'                 },
  level_16: { ru: 'Мастер-инспектор',      en: 'Master Inspector',          tr: 'Usta Müfettiş',           ar: 'مفتش متمرس',             kk: 'Шебер инспектор'       },
  level_17: { ru: 'Комиссар',              en: 'Commissioner',              tr: 'Komiser',                 ar: 'مفوض',                   kk: 'Комиссар'              },
  level_18: { ru: 'Главный инспектор',     en: 'Chief Inspector',           tr: 'Baş Müfettiş',            ar: 'المفتش الرئيسي',         kk: 'Бас инспектор'         },
  level_19: { ru: 'Советник',              en: 'Advisor',                   tr: 'Danışman',                ar: 'مستشار',                 kk: 'Кеңесші'               },
  /* ── Tier 5: Директор (20–24) ──────────────────────────────────────────── */
  level_20: { ru: 'Директор',              en: 'Director',                  tr: 'Direktör',                ar: 'مدير',                   kk: 'Директор'              },
  level_21: { ru: 'Суперинтендент',        en: 'Superintendent',            tr: 'Süperintandan',           ar: 'مشرف عام',               kk: 'Суперинтендент'        },
  level_22: { ru: 'Следственный советник', en: 'Investigative Advisor',     tr: 'Soruşturma Danışmanı',    ar: 'مستشار التحقيق',         kk: 'Тергеу кеңесшісі'      },
  level_23: { ru: 'Следственный комиссар', en: 'Investigative Commissioner',tr: 'Soruşturma Komiseri',     ar: 'مفوض التحقيق',           kk: 'Тергеу комиссары'      },
  level_24: { ru: 'Гранд-мастер',          en: 'Grand Master',              tr: 'Büyük Usta',              ar: 'الأستاذ الكبير',         kk: 'Гранд-шебер'           },
  /* ── Tier 6: Легенда (25–30) ───────────────────────────────────────────── */
  level_25: { ru: 'Верховный инспектор',   en: 'Supreme Inspector',         tr: 'Yüksek Müfettiş',         ar: 'المفتش الأعلى',          kk: 'Жоғары инспектор'      },
  level_26: { ru: 'Следственный маршал',   en: 'Marshal of Investigation',  tr: 'Soruşturma Mareşali',     ar: 'مارشال التحقيق',         kk: 'Тергеу маршалы'        },
  level_27: { ru: 'Гранд-инспектор',       en: 'Grand Inspector',           tr: 'Büyük Müfettiş',          ar: 'المفتش الكبير',          kk: 'Гранд-инспектор'       },
  level_28: { ru: 'Мастер разоблачений',   en: 'Master of Exposés',         tr: 'İfşaat Ustası',           ar: 'أستاذ الكشف',            kk: 'Әшкерелеу шебері'      },
  level_29: { ru: 'Легенда сыска',         en: 'Legend of Detection',       tr: 'Dedektiflik Efsanesi',    ar: 'أسطورة التحقيق',         kk: 'Тергеу легендасы'      },
  level_30: { ru: 'Верховный следователь', en: 'Supreme Investigator',      tr: 'Yüksek Araştırmacı',      ar: 'المحقق الأعلى',          kk: 'Жоғары тексеруші'      },
};

/** Localized title for a given rank id (e.g. `"level_05"`). */
export function tRankTitle(rankId: string, lang: Language): string {
  return RANK_TITLES[rankId]?.[lang] ?? rankId;
}

/**
 * Localized level label: unique rank title + level number.
 * Level is derived from the 1-based integer; rankId is derived deterministically.
 */
export function formatInvestigatorLevel(level: number, lang: Language): string {
  const rankId = `level_${String(level).padStart(2, '0')}`;
  return `${tRankTitle(rankId, lang)} · ${t("levelShort", lang)} ${level}`;
}

/** Localized difficulty tier (easy / medium / hard). */
export function tDifficulty(difficulty: Difficulty, lang: Language): string {
  return t(`difficulty_${difficulty}` as UIKey, lang);
}

/** Resolve a `LocalizedString`/`LocalizedContent` field with a safe fallback. */
export function loc<T extends Partial<Record<Language, unknown>>>(
  field: T,
  lang: Language,
): T[Language] {
  return (field[lang] ?? field.ru) as T[Language];
}
