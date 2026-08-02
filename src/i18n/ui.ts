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
  | "markedCount"
  | "viewedCount"
  | "statementPeek"
  | "cancel"
  | "previousEvidence"
  | "nextEvidence"
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
  | "lowBalanceTitle"
  | "lowBalanceDesc"
  | "language"
  | "rank"
  | "xpGained"
  | "promotion"
  | "bonus"
  | "streak"
  | "streakDays"
  | "perfectStreak"
  | "hints"
  | "hintNote"
  | "hintCanvass"
  | "revealedContradiction"
  | "revealedClean"
  | "watchAd"
  | "allRevealed"
  | "hintTargetPrompt"
  | "hintTargetCancel"
  | "achievements"
  | "achievementUnlocked"
  | "gameTitle"
  | "specialArchives"
  | "specialArchivesSubtitle"
  | "firstCaseFree"
  | "openedCases"
  | "buyArchive"
  | "unlockNextWithAd"
  | "unlockForeverHint"
  | "nextUnlockTomorrow"
  | "adUnavailableTryLater"
  | "purchaseRestored"
  | "tryDeskSkin"
  | "availableUntilEndOfDay"
  | "purchasedArchivesNoForcedAds"
  | "newArchive"
  | "purchased"
  | "wholeArchiveComingSoon"
  | "platformUnavailable"
  | "close"
  | "includedCases"
  | "includedSkins"
  | "collectibleStamp"
  | "stampShop"
  | "stampShopSubtitle"
  | "stampShopNote"
  | "stampClassicName"
  | "stampInkPreview"
  | "stampEquip"
  | "stampLockedInPack"
  | "stampOpenPack"
  | "stampEquipped"
  | "stampPurchaseUnavailable"
  | "stampPurchaseFailed"
  | "restorePurchases"
  | "department"
  | "casesInWork"
  | "analytics"
  | "clientStatement"
  | "formCt1"
  | "circumstances"
  | "caseMaterials"
  | "documents"
  | "openCaseAction"
  | "openDossier"
  | "viewedDossier"
  | "confidential"
  | "selectCasePrompt"
  | "truthOfCase"
  | "rewardRevealed"
  | "fee"
  | "companyBalance"
  | "mastery"
  | "masteryBronze"
  | "masterySilver"
  | "masteryGold"
  | "claimValue"
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
  | "completePreviousCase"
  | "completedCase"
  | "unlockedCases"
  | "lockedStatus"
  | "availableStatus"
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
  | "interactiveNormal"
  | "interactiveUv"
  | "interactiveBacklight"
  | "interactiveSideLight"
  | "interactiveContrast"
  | "interactiveThermal"
  | "interactiveReset"
  | "interactiveHint"
  | "interactiveCompare"
  | "interactiveRotateLeft"
  | "interactiveRotateRight"
  | "interactiveClaimedTime"
  | "interactiveComplete"
  | "interactiveContradiction"
  | "interactiveSupported"
  | "interactiveCleanSurface"
  | "interactiveTraceFound"
  | "interactiveProgress"
  | "interactiveStampLocked"
  | "finalSynthesisSkip"
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
    | "ratingDoneBody"
    | "yourFee"
    | "budgetSaved"
    | "companyLoss"
    | "accuracyBreakdown"
    | "whatYouMissed"
    | "howItWas"
    | "replayCase"
    | "bonusIdealCase"
    | "xpLabel"
    | "fraudMissed"
    | "verdictItem"
    | "dailyRewardBadge"
    | "dailyDifficultyBadge"
    | "serviceOrder"
    | "preInvestigation"
    | "serviceArchive"
    | "serviceArchiveEffect"
    | "serviceClearance"
    | "serviceClearanceEffect"
    | "serviceExpert"
    | "serviceExpertEffect"
    | "departmentArchive"
    | "departmentField"
    | "departmentLab"
    | "serviceSelected"
    | "serviceLocked"
    | "serviceNotApplicable"
    | "serviceUnaffordable"
    | "serviceFreeDailyHint"
    | "serviceDiscountHint"
    | "serviceAvailable"
    | "serviceUnavailableToast"
    | "departmentPlan"
    | "approvedStamp"
    | "departmentEffectUnlock"
    | "departmentEffectDiscount"
    | "departmentEffectFree"
    | "departmentMaxed"
    | "upgradeDepartment"
    | "departmentUpgradeUnavailable"
    | "resolutionWhy"
    | "resolutionChainTitle"
    | "resolutionContinue"
    | "resolutionVeraLabel"
    | "resolutionArchiveEntry"
    | "resolutionStampApproved"
    | "resolutionStampRejected"
    | "chainLabelTruth"
    | "chainLabelCrack"
    | "chainLabelVerdict"
    // --- Bureau of Special Cases (topbar + commercial shelf) ---
    | "brandTitle"
    | "brandShort"
    | "brandTagline"
    | "navInvestigation"
    | "navBureau"
    | "settings"
    | "region"
    | "bureauEyebrow"
    | "bureauHeroTitle"
    | "bureauHeroLead"
    | "bureauBackToCase"
    | "bureauBackToArchives"
    | "bureauTabArchives"
    | "bureauTabStamps"
    | "bureauTabBundles"
    | "bureauTabBundlesBadge"
    | "archiveCardEyebrow"
    | "archiveCardMore"
    | "archiveOneCaseFree"
    | "archiveDetailFeatureCases"
    | "archiveDetailFeatureEvidence"
    | "archiveDetailFeatureStamp"
    | "archiveDetailPlayFree"
    | "archiveDetailOpenWhole"
    | "archiveDetailContinue"
    | "archiveIncludedTitle"
    | "archiveIncludedDuration"
    | "archiveIncludedEvidence"
    | "archiveIncludedEvidenceNote"
    | "archiveIncludedHeroes"
    | "archiveIncludedHeroesNote"
    | "archiveIncludedBonus"
    | "archiveContentsEyebrow"
    | "archiveContentsTitle"
    | "archiveCaseFreeLabel"
    | "archiveCaseInArchiveLabel"
    | "archiveCasePlay"
    | "workshopEyebrow"
    | "workshopTitle"
    | "workshopLead"
    | "workshopFittingRoom"
    | "workshopCatalogTab"
    | "workshopPreviewLabel"
    | "workshopPreviewNote"
    | "workshopPaperNumber"
    | "workshopPaperTitle"
    | "workshopPaperBody"
    | "workshopPaperSignature"
    | "workshopInkColor"
    | "workshopInkRed"
    | "workshopInkBlue"
    | "workshopInkGreen"
    | "buyAction"
    | "archiveIncludedHeroesKicker"
    | "workshopCollection"
    | "workshopChooseStamp"
    | "workshopStampInUse"
    | "workshopStampFitting"
    | "bundleStampsEyebrow"
    | "bundleStampsTitle"
    | "bundleBuy"
    | "bundleHeroEyebrow"
    | "bundleHeroTitle"
    | "bundleHeroLead"
    | "bundleHeroCta"
    | "bundleSavings"
    | "bundleOwned"
    | "backToCampaign"
    | "archiveCaseNumber"
    | "archiveCaseLocked"
    | "archiveCaseLockedToast"
    | "bundleArchivesTitle"
    | "bundleArchivesLead"
    | "bundleArchivesCta"
    | "offerBadge"
    | "noAdsTitle"
    | "noAdsLead"
    | "noAdsCta"
    | "noAdsOwned"
    | "purchaseNotCompleted";

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
  markedCount: {
    ru: "Отмечено", en: "Marked", tr: "İşaretli", ar: "مُعلَّم", kk: "Белгіленді",
  },
  viewedCount: {
    ru: "Просмотрено", en: "Reviewed", tr: "İncelendi", ar: "تمت المراجعة", kk: "Қаралды",
  },
  statementPeek: {
    ru: "Заявление", en: "Statement", tr: "Beyan", ar: "الإفادة", kk: "Өтініш",
  },
  cancel: {
    ru: "Отмена", en: "Cancel", tr: "İptal", ar: "إلغاء", kk: "Бас тарту",
  },
  previousEvidence: {
    ru: "Предыдущая улика", en: "Previous evidence", tr: "Önceki kanıt", ar: "الدليل السابق", kk: "Алдыңғы дәлел",
  },
  nextEvidence: {
    ru: "Следующая улика", en: "Next evidence", tr: "Sonraki kanıt", ar: "الدليل التالي", kk: "Келесі дәлел",
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
  lowBalanceTitle: {
    ru: "Касса пуста?",
    en: "Out of funds?",
    tr: "Kasa boş mu?",
    ar: "نفدت الأموال؟",
    kk: "Қаражат таусылды ма?",
  },
  lowBalanceDesc: {
    ru: "Премия от управления: посмотрите ролик — баланс пополнится. Играть можно и без этого.",
    en: "A bonus from headquarters: watch a short ad to top up your balance. Playing on without it is fine too.",
    tr: "Merkezden prim: kısa bir reklam izleyin, bakiyeniz dolsun. Reklamsız da oynamaya devam edebilirsiniz.",
    ar: "مكافأة من الإدارة: شاهد إعلانًا قصيرًا لتعبئة رصيدك. يمكنك مواصلة اللعب بدونها أيضًا.",
    kk: "Басқарманың сыйақысы: қысқа роликті көріңіз — баланс толады. Онсыз да ойнай беруге болады.",
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
  perfectStreak: {
    ru: "100% серия",
    en: "100% streak",
    tr: "%100 seri",
    ar: "سلسلة 100٪",
    kk: "100% серия",
  },
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
  hintTargetPrompt: {
    ru: "Выберите улику для проверки",
    en: "Choose which evidence to check",
    tr: "Kontrol edilecek kanıtı seçin",
    ar: "اختر الدليل الذي تريد فحصه",
    kk: "Тексеретін дәлелді таңдаңыз",
  },
  hintTargetCancel: {
    ru: "Esc или клик мимо — отмена",
    en: "Esc or click outside to cancel",
    tr: "İptal için Esc veya dışına tıklayın",
    ar: "Esc أو انقر خارجًا للإلغاء",
    kk: "Болдырмау үшін Esc немесе сыртына басыңыз",
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
    ru: "Найди ложь! Детективные дела",
    en: "Spot the Lie! Detective Puzzles",
    tr: "Yalan Nerede? Dedektif Simülatörü",
    ar: "أين الكذبة؟ محاكي المحقق",
    kk: "Өтірік қайда? Тіміскі симуляторы",
  },
  specialArchives: {
    ru: "Особые архивы",
    en: "Special Archives",
    tr: "Özel Arşivler",
    ar: "الأرشيفات الخاصة",
    kk: "Арнайы архивтер",
  },
  specialArchivesSubtitle: {
    ru: "Новые расследования и оформление стола",
    en: "New investigations and desk styling",
    tr: "Yeni soruşturmalar ve masa düzeni",
    ar: "تحقيقات جديدة وتنسيق للمكتب",
    kk: "Жаңа тергеулер және үстел безендіруі",
  },
  firstCaseFree: {
    ru: "Первое дело бесплатно",
    en: "First case free",
    tr: "İlk dosya ücretsiz",
    ar: "القضية الأولى مجانية",
    kk: "Бірінші іс тегін",
  },
  openedCases: {
    ru: "Открыто {opened} из {total}",
    en: "Opened {opened} of {total}",
    tr: "{total} dosyadan {opened} açık",
    ar: "مفتوح {opened} من {total}",
    kk: "{total} істің {opened} ашылды",
  },
  buyArchive: {
    ru: "Купить архив целиком",
    en: "Buy full archive",
    tr: "Arşivin tamamını satın al",
    ar: "شراء الأرشيف كاملًا",
    kk: "Архивті толық сатып алу",
  },
  unlockNextWithAd: {
    ru: "Открыть следующее дело за рекламу",
    en: "Unlock next case with an ad",
    tr: "Sonraki dosyayı reklamla aç",
    ar: "فتح القضية التالية بإعلان",
    kk: "Келесі істі жарнамамен ашу",
  },
  unlockForeverHint: {
    ru: "Дело останется открытым навсегда.",
    en: "The case stays unlocked permanently.",
    tr: "Dosya kalıcı olarak açık kalır.",
    ar: "ستبقى القضية مفتوحة دائمًا.",
    kk: "Іс тұрақты ашық қалады.",
  },
  nextUnlockTomorrow: {
    ru: "Следующее открытие — завтра",
    en: "Next unlock tomorrow",
    tr: "Sonraki açılış yarın",
    ar: "الفتح التالي غدًا",
    kk: "Келесі ашу ертең",
  },
  adUnavailableTryLater: {
    ru: "Реклама сейчас недоступна. Попробуйте позже.",
    en: "Ads are unavailable now. Try again later.",
    tr: "Reklam şu anda yok. Daha sonra deneyin.",
    ar: "الإعلانات غير متاحة الآن. حاول لاحقًا.",
    kk: "Жарнама қазір қолжетімсіз. Кейін көріңіз.",
  },
  purchaseRestored: {
    ru: "Покупка восстановлена",
    en: "Purchase restored",
    tr: "Satın alma geri yüklendi",
    ar: "تمت استعادة الشراء",
    kk: "Сатып алу қалпына келді",
  },
  tryDeskSkin: {
    ru: "Примерить оформление",
    en: "Try desk style",
    tr: "Masa stilini dene",
    ar: "تجربة تنسيق المكتب",
    kk: "Үстел стилін көру",
  },
  availableUntilEndOfDay: {
    ru: "Доступно до конца дня",
    en: "Available until end of day",
    tr: "Gün sonuna kadar geçerli",
    ar: "متاح حتى نهاية اليوم",
    kk: "Күн соңына дейін қолжетімді",
  },
  purchasedArchivesNoForcedAds: {
    ru: "В купленных архивах нет обязательной рекламы",
    en: "Purchased archives have no forced ads",
    tr: "Satın alınan arşivlerde zorunlu reklam yok",
    ar: "لا توجد إعلانات إجبارية في الأرشيفات المشتراة",
    kk: "Сатып алынған архивтерде міндетті жарнама жоқ",
  },
  newArchive: {
    ru: "Новое",
    en: "New",
    tr: "Yeni",
    ar: "جديد",
    kk: "Жаңа",
  },
  purchased: {
    ru: "Куплено",
    en: "Purchased",
    tr: "Satın alındı",
    ar: "تم الشراء",
    kk: "Сатып алынды",
  },
  wholeArchiveComingSoon: {
    ru: "Покупки и рекламная разблокировка будут включены после product ids и финальных паков.",
    en: "Purchases and ad unlocks will be enabled after product ids and final packs are ready.",
    tr: "Satın alma ve reklamla açma, product id ve son paketler hazır olduğunda açılacak.",
    ar: "سيتم تفعيل الشراء والفتح بالإعلانات بعد جاهزية معرفات المنتجات والحزم النهائية.",
    kk: "Сатып алу және жарнамамен ашу product id мен соңғы пактер дайын болғанда қосылады.",
  },
  platformUnavailable: {
    ru: "Витрина подготовлена как прототип: платежи и постоянные права доступа пока не подключены.",
    en: "This shelf is a prototype: payments and permanent access rights are not connected yet.",
    tr: "Bu vitrin prototiptir: ödemeler ve kalıcı erişim hakları henüz bağlı değil.",
    ar: "هذه الواجهة نموذج أولي: لم يتم ربط المدفوعات وحقوق الوصول الدائمة بعد.",
    kk: "Бұл витрина прототип: төлемдер мен тұрақты қолжетімділік әлі қосылмаған.",
  },
  close: {
    ru: "Закрыть",
    en: "Close",
    tr: "Kapat",
    ar: "إغلاق",
    kk: "Жабу",
  },
  includedCases: {
    ru: "Состав дел",
    en: "Included cases",
    tr: "Dahil dosyalar",
    ar: "القضايا المضمنة",
    kk: "Істер құрамы",
  },
  includedSkins: {
    ru: "Оформление",
    en: "Desk styling",
    tr: "Masa düzeni",
    ar: "تنسيق المكتب",
    kk: "Безендіру",
  },
  collectibleStamp: {
    ru: "Коллекционный штамп",
    en: "Collectible stamp",
    tr: "Koleksiyon damgası",
    ar: "ختم قابل للجمع",
    kk: "Коллекциялық мөр",
  },
  stampShop: {
    ru: "Мастерская штампов",
    en: "Stamp workshop",
    tr: "Damga atölyesi",
    ar: "ورشة الأختام",
    kk: "Мөр шеберханасы",
  },
  stampShopSubtitle: {
    ru: "Формулировка на печати противоречия",
    en: "The wording on your contradiction stamp",
    tr: "Çelişki damganızdaki ifade",
    ar: "الصياغة على ختم التناقض",
    kk: "Қайшылық мөріндегі тұжырым",
  },
  stampShopNote: {
    ru: "Только оформление: на награду и точность не влияет.",
    en: "Cosmetic only: it changes no reward and no scoring.",
    tr: "Yalnızca görsel: ödülü ve puanlamayı etkilemez.",
    ar: "شكلي فقط: لا يؤثر على المكافأة ولا على الدقة.",
    kk: "Тек безендіру: сыйақыға да, дәлдікке де әсер етпейді.",
  },
  stampClassicName: {
    ru: "Классический",
    en: "Classic",
    tr: "Klasik",
    ar: "كلاسيكي",
    kk: "Классикалық",
  },
  stampInkPreview: {
    ru: "Оттиск",
    en: "Ink preview",
    tr: "Mürekkep önizleme",
    ar: "معاينة الختم",
    kk: "Мөр таңбасы",
  },
  stampEquip: {
    ru: "Поставить на печать",
    en: "Ink this one",
    tr: "Bunu kullan",
    ar: "استخدم هذا",
    kk: "Мөрге қою",
  },
  stampLockedInPack: {
    ru: "Только в наборе «{pack}»",
    en: "Only in the “{pack}” archive",
    tr: "Yalnızca «{pack}» arşivinde",
    ar: "متاح فقط في أرشيف «{pack}»",
    kk: "Тек «{pack}» жинағында",
  },
  stampOpenPack: {
    ru: "Открыть набор",
    en: "Open the archive",
    tr: "Arşivi aç",
    ar: "افتح الأرشيف",
    kk: "Жинақты ашу",
  },
  stampEquipped: {
    ru: "На печати",
    en: "In use",
    tr: "Kullanımda",
    ar: "قيد الاستخدام",
    kk: "Қолданыста",
  },
  stampPurchaseUnavailable: {
    ru: "Покупки сейчас недоступны",
    en: "Purchases are unavailable right now",
    tr: "Satın alma şu anda kullanılamıyor",
    ar: "الشراء غير متاح حاليًا",
    kk: "Сатып алу қазір қолжетімсіз",
  },
  stampPurchaseFailed: {
    ru: "Покупка не завершена",
    en: "Purchase not completed",
    tr: "Satın alma tamamlanmadı",
    ar: "لم تكتمل عملية الشراء",
    kk: "Сатып алу аяқталмады",
  },
  restorePurchases: {
    ru: "Восстановить покупки",
    en: "Restore purchases",
    tr: "Satın almaları geri yükle",
    ar: "استعادة المشتريات",
    kk: "Сатып алуларды қалпына келтіру",
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
  mastery: { ru: "Мастерство", en: "Mastery", tr: "Ustalık", ar: "الإتقان", kk: "Шеберлік" },
  masteryBronze: { ru: "Бронза", en: "Bronze", tr: "Bronz", ar: "برونزي", kk: "Қола" },
  masterySilver: { ru: "Серебро", en: "Silver", tr: "Gümüş", ar: "فضي", kk: "Күміс" },
  masteryGold: { ru: "Золото", en: "Gold", tr: "Altın", ar: "ذهبي", kk: "Алтын" },
  claimValue: {
    ru: "Сумма иска",
    en: "Claim amount",
    tr: "Talep tutarı",
    ar: "مبلغ المطالبة",
    kk: "Талап сомасы",
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
  availableStatus: {
    ru: "ДОСТУПНО",
    en: "AVAILABLE",
    tr: "AÇIK",
    ar: "متاح",
    kk: "АШЫҚ",
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
  interactiveNormal: { ru: "Обычный вид", en: "Normal view", tr: "Normal görünüm", ar: "العرض العادي", kk: "Қалыпты көрініс" },
  interactiveUv: { ru: "УФ-свет", en: "UV light", tr: "UV ışığı", ar: "الأشعة فوق البنفسجية", kk: "УК жарық" },
  interactiveBacklight: { ru: "На просвет", en: "Backlight", tr: "Arka ışık", ar: "إضاءة خلفية", kk: "Артқы жарық" },
  interactiveSideLight: { ru: "Боковой свет", en: "Side light", tr: "Yanal ışık", ar: "إضاءة جانبية", kk: "Бүйір жарық" },
  interactiveContrast: { ru: "Контраст", en: "Contrast", tr: "Kontrast", ar: "التباين", kk: "Контраст" },
  interactiveThermal: { ru: "Тепловизор", en: "Thermal view", tr: "Termal görünüm", ar: "العرض الحراري", kk: "Жылу көрінісі" },
  interactiveReset: { ru: "Сбросить", en: "Reset", tr: "Sıfırla", ar: "إعادة الضبط", kk: "Қалпына келтіру" },
  interactiveHint: { ru: "Подсказка", en: "Hint", tr: "İpucu", ar: "تلميح", kk: "Кеңес" },
  interactiveCompare: { ru: "Сравнить", en: "Compare", tr: "Karşılaştır", ar: "مقارنة", kk: "Салыстыру" },
  interactiveRotateLeft: { ru: "Повернуть влево", en: "Rotate left", tr: "Sola döndür", ar: "تدوير لليسار", kk: "Солға бұру" },
  interactiveRotateRight: { ru: "Повернуть вправо", en: "Rotate right", tr: "Sağa döndür", ar: "تدوير لليمين", kk: "Оңға бұру" },
  interactiveClaimedTime: { ru: "Заявленное время", en: "Claimed time", tr: "Beyan edilen saat", ar: "الوقت المذكور", kk: "Мәлімделген уақыт" },
  interactiveComplete: { ru: "Анализ завершён", en: "Analysis complete", tr: "Analiz tamamlandı", ar: "اكتمل التحليل", kk: "Талдау аяқталды" },
  interactiveContradiction: { ru: "Обнаружено противоречие", en: "Contradiction found", tr: "Çelişki bulundu", ar: "تم اكتشاف تناقض", kk: "Қайшылық табылды" },
  interactiveSupported: { ru: "Заявление подтверждается", en: "Statement supported", tr: "Beyan doğrulandı", ar: "تم تأكيد الإفادة", kk: "Мәлімдеме расталды" },
  interactiveCleanSurface: { ru: "Очистите поверхность", en: "Clean the surface", tr: "Yüzeyi temizleyin", ar: "نظّف السطح", kk: "Бетті тазалаңыз" },
  interactiveTraceFound: { ru: "След обнаружен", en: "Trace discovered", tr: "İz bulundu", ar: "تم العثور على أثر", kk: "Із табылды" },
  interactiveProgress: { ru: "Область проявляется", en: "Revealing area", tr: "Alan ortaya çıkıyor", ar: "يتم إظهار المنطقة", kk: "Аймақ айқындалуда" },
  interactiveStampLocked: { ru: "Сначала завершите анализ", en: "Complete the analysis first", tr: "Önce analizi tamamlayın", ar: "أكمل التحليل أولاً", kk: "Алдымен талдауды аяқтаңыз" },
  finalSynthesisSkip: { ru: "Пропустить синтез", en: "Skip synthesis", tr: "Sentezi geç", ar: "تخطي الاستنتاج", kk: "Синтезді өткізу" },
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
    ru: "Нажмите, чтобы посмотреть рекламу и открыть следующее дело прямо сейчас.",
    en: "Tap to watch an ad and unlock the next case right now.",
    tr: "Reklam izlemek ve sonraki dosyayı hemen açmak için dokunun.",
    ar: "اضغط لمشاهدة إعلان وفتح القضية التالية الآن.",
    kk: "Жарнама көру және келесі істі қазір ашу үшін басыңыз.",
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

  /* ── Result sheet v2 ──────────────────────────────────────────────────── */
  yourFee: {
    ru: "ВАШ ГОНОРАР",
    en: "YOUR FEE",
    tr: "ÜCRETİNİZ",
    ar: "أتعابك",
    kk: "СІЗДІҢ ГОНОРАРЫҢЫЗ",
  },
  budgetSaved: {
    ru: "Бюджету спасено",
    en: "Budget saved",
    tr: "Bütçeye kurtarılan",
    ar: "وُفِّر من الميزانية",
    kk: "Бюджетке сақталды",
  },
  companyLoss: {
    ru: "УЩЕРБ БЮДЖЕТУ КОМПАНИИ",
    en: "COMPANY BUDGET LOSS",
    tr: "ŞİRKET BÜTÇE ZARARI",
    ar: "خسارة ميزانية الشركة",
    kk: "КОМПАНИЯ БЮДЖЕТІНЕ ЗИЯН",
  },
  accuracyBreakdown: {
    ru: "Точность раскрытия",
    en: "Detection accuracy",
    tr: "Tespit doğruluğu",
    ar: "دقة الكشف",
    kk: "Анықтау дәлдігі",
  },
  whatYouMissed: {
    ru: "ЧТО ВЫ УПУСТИЛИ",
    en: "WHAT YOU MISSED",
    tr: "GÖZDEn KAÇIRDIKLARINız",
    ar: "ما فاتك",
    kk: "СІЗ ЖІБЕРІП АЛҒАНДАР",
  },
  howItWas: {
    ru: "КАК БЫЛО НА САМОМ ДЕЛЕ",
    en: "HOW IT ACTUALLY WAS",
    tr: "GERÇEKTE NE OLDU",
    ar: "كيف كان الأمر فعلاً",
    kk: "ІСКЕ ШЫН МӘН",
  },
  replayCase: {
    ru: "↺ Расследовать заново",
    en: "↺ Reinvestigate",
    tr: "↺ Yeniden soruştur",
    ar: "↺ أعد التحقيق",
    kk: "↺ Қайта тергеу",
  },
  bonusIdealCase: {
    ru: "Бонус за идеальное дело",
    en: "Perfect case bonus",
    tr: "Mükemmel dava bonusu",
    ar: "مكافأة القضية المثالية",
    kk: "Мінсіз іс үшін бонус",
  },
  xpLabel: {
    ru: "Опыт",
    en: "XP",
    tr: "XP",
    ar: "نقاط خبرة",
    kk: "Тәжірибе",
  },
  fraudMissed: {
    ru: "ВЫ УПУСТИЛИ МОШЕННИКА",
    en: "FRAUDSTER ESCAPED",
    tr: "DOLANDIRICI KAÇTI",
    ar: "أفلت المحتال",
    kk: "АЛАЯҚ ҚАШЫП КЕТТІ",
  },
  verdictItem: {
    ru: "Верный вердикт",
    en: "Correct verdict",
    tr: "Doğru karar",
    ar: "الحكم الصحيح",
    kk: "Дұрыс шешім",
  },
  dailyRewardBadge: {
    ru: "Награда ×5",
    en: "Reward ×5",
    tr: "Ödül ×5",
    ar: "المكافأة ×5",
    kk: "Сыйақы ×5",
  },
  dailyDifficultyBadge: {
    ru: "Сложность ×2",
    en: "Difficulty ×2",
    tr: "Zorluk ×2",
    ar: "الصعوبة ×2",
    kk: "Күрделілік ×2",
  },
  serviceOrder: {
    ru: "Распоряжение на расследование",
    en: "Investigation order",
    tr: "Soruşturma emri",
    ar: "أمر التحقيق",
    kk: "Тергеу тапсырмасы",
  },
  preInvestigation: {
    ru: "До улик",
    en: "Before evidence",
    tr: "Kanıttan önce",
    ar: "قبل الأدلة",
    kk: "Айғаққа дейін",
  },
  serviceArchive: {
    ru: "Архивная справка",
    en: "Archive check",
    tr: "Arşiv kontrolü",
    ar: "فحص الأرشيف",
    kk: "Архив анықтамасы",
  },
  serviceArchiveEffect: {
    ru: "Показывает число настоящих противоречий.",
    en: "Shows the number of real contradictions.",
    tr: "Gerçek çelişki sayısını gösterir.",
    ar: "يعرض عدد التناقضات الحقيقية.",
    kk: "Нақты қайшылық санын көрсетеді.",
  },
  serviceClearance: {
    ru: "Дополнительное разрешение",
    en: "Extra clearance",
    tr: "Ek yetki",
    ar: "تصريح إضافي",
    kk: "Қосымша рұқсат",
  },
  serviceClearanceEffect: {
    ru: "+1 открытие в бюджетном деле.",
    en: "+1 opening in a budgeted case.",
    tr: "Bütçeli dosyada +1 açılış.",
    ar: "+1 فتح في قضية محدودة.",
    kk: "Бюджетті істе +1 ашу.",
  },
  serviceExpert: {
    ru: "Экспертное заключение",
    en: "Expert opinion",
    tr: "Uzman görüşü",
    ar: "رأي خبير",
    kk: "Сарапшы қорытындысы",
  },
  serviceExpertEffect: {
    ru: "Раскрывает статус первой выбранной улики.",
    en: "Reveals the first selected evidence status.",
    tr: "İlk seçilen kanıtın durumunu açar.",
    ar: "يكشف حالة أول دليل تختاره.",
    kk: "Алғаш таңдалған айғақ мәртебесін ашады.",
  },
  departmentArchive: {
    ru: "Архив",
    en: "Archive",
    tr: "Arşiv",
    ar: "الأرشيف",
    kk: "Архив",
  },
  departmentField: {
    ru: "Выездная группа",
    en: "Field team",
    tr: "Saha ekibi",
    ar: "الفريق الميداني",
    kk: "Далалық топ",
  },
  departmentLab: {
    ru: "Лаборатория",
    en: "Laboratory",
    tr: "Laboratuvar",
    ar: "المختبر",
    kk: "Зертхана",
  },
  serviceSelected: {
    ru: "Выбрано",
    en: "Selected",
    tr: "Seçildi",
    ar: "محدد",
    kk: "Таңдалды",
  },
  serviceLocked: {
    ru: "Отдел ур. 0",
    en: "Dept. level 0",
    tr: "Birim sv. 0",
    ar: "القسم مستوى 0",
    kk: "Бөлім 0-деңг.",
  },
  serviceNotApplicable: {
    ru: "Не нужно",
    en: "Not applicable",
    tr: "Uygun değil",
    ar: "غير مناسب",
    kk: "Қолданылмайды",
  },
  serviceUnaffordable: {
    ru: "Не хватает бюджета",
    en: "Insufficient budget",
    tr: "Bütçe yetersiz",
    ar: "الميزانية غير كافية",
    kk: "Бюджет жетпейді",
  },
  serviceFreeDailyHint: {
    ru: "1 раз в день бесплатно",
    en: "1 free use today",
    tr: "Bugün 1 ücretsiz",
    ar: "استخدام مجاني اليوم",
    kk: "Бүгін 1 тегін",
  },
  serviceDiscountHint: {
    ru: "Скидка 20%",
    en: "20% discount",
    tr: "%20 indirim",
    ar: "خصم 20%",
    kk: "20% жеңілдік",
  },
  serviceAvailable: {
    ru: "Доступно",
    en: "Available",
    tr: "Mevcut",
    ar: "متاح",
    kk: "Қолжетімді",
  },
  serviceUnavailableToast: {
    ru: "Услугу нельзя выбрать для этого расследования.",
    en: "This service cannot be selected for this investigation.",
    tr: "Bu hizmet bu soruşturma için seçilemez.",
    ar: "لا يمكن اختيار هذه الخدمة لهذا التحقيق.",
    kk: "Бұл тергеуге қызмет таңдалмайды.",
  },
  departmentPlan: {
    ru: "План отдела",
    en: "Department plan",
    tr: "Birim planı",
    ar: "خطة القسم",
    kk: "Бөлім жоспары",
  },
  approvedStamp: {
    ru: "Согласовано",
    en: "Approved",
    tr: "Onaylandı",
    ar: "معتمد",
    kk: "Келісілді",
  },
  departmentEffectUnlock: {
    ru: "Открывает услугу",
    en: "Unlocks service",
    tr: "Hizmeti açar",
    ar: "يفتح الخدمة",
    kk: "Қызметті ашады",
  },
  departmentEffectDiscount: {
    ru: "Следом скидка 20%",
    en: "Next: 20% discount",
    tr: "Sırada %20 indirim",
    ar: "التالي: خصم 20%",
    kk: "Келесі: 20% жеңілдік",
  },
  departmentEffectFree: {
    ru: "Следом бесплатный вызов",
    en: "Next: free daily use",
    tr: "Sırada ücretsiz çağrı",
    ar: "التالي: استخدام مجاني",
    kk: "Келесі: тегін шақыру",
  },
  departmentMaxed: {
    ru: "Уровень максимальный",
    en: "Max level",
    tr: "Azami seviye",
    ar: "المستوى الأقصى",
    kk: "Ең жоғары деңгей",
  },
  upgradeDepartment: {
    ru: "Улучшить",
    en: "Upgrade",
    tr: "Yükselt",
    ar: "ترقية",
    kk: "Жақсарту",
  },
  departmentUpgradeUnavailable: {
    ru: "Улучшение отдела сейчас недоступно.",
    en: "Department upgrade is not available now.",
    tr: "Birim yükseltmesi şu anda yok.",
    ar: "ترقية القسم غير متاحة الآن.",
    kk: "Бөлімді жақсарту қазір қолжетімсіз.",
  },
  resolutionWhy: {
    ru: "Почему такое решение?",
    en: "Why this decision?",
    tr: "Neden bu karar?",
    ar: "لماذا هذا القرار؟",
    kk: "Неге бұлай шешілді?",
  },
  resolutionChainTitle: {
    ru: "Логика расследования",
    en: "Investigation Logic",
    tr: "Soruşturmanın Mantığı",
    ar: "منطق التحقيق",
    kk: "Тергеу логикасы",
  },
  resolutionContinue: {
    ru: "Продолжить",
    en: "Continue",
    tr: "Devam",
    ar: "متابعة",
    kk: "Жалғастыру",
  },
  resolutionVeraLabel: {
    ru: "В. Лебедева",
    en: "V. Lebedeva",
    tr: "V. Lebedeva",
    ar: "ف. ليبيديفا",
    kk: "В. Лебедева",
  },
  resolutionArchiveEntry: {
    ru: "Новая запись в Архиве №17",
    en: "New Entry in Archive No. 17",
    tr: "17 No'lu Arşivde Yeni Kayıt",
    ar: "قيد جديد في الأرشيف رقم 17",
    kk: "№17 мұрағаттағы жаңа жазба",
  },
  resolutionStampApproved: {
    ru: "ОДОБРЕНО",
    en: "APPROVED",
    tr: "ONAYLANDI",
    ar: "تمت الموافقة",
    kk: "МАҚҰЛДАНДЫ",
  },
  resolutionStampRejected: {
    ru: "ОТКАЗАНО",
    en: "REJECTED",
    tr: "REDDEDİLDİ",
    ar: "مرفوض",
    kk: "БАС ТАРТЫЛДЫ",
  },
  chainLabelTruth: {
    ru: "Что было правдой",
    en: "What was true",
    tr: "Doğru olan ne",
    ar: "ما كان صحيحًا",
    kk: "Не рас болды",
  },
  chainLabelCrack: {
    ru: "Что не совпало",
    en: "What did not match",
    tr: "Ne uyuşmadı",
    ar: "ما لم يتطابق",
    kk: "Не сәйкес келмеді",
  },
  chainLabelVerdict: {
    ru: "Почему этого достаточно",
    en: "Why that is enough",
    tr: "Bu neden yeterli",
    ar: "لماذا هذا يكفي",
    kk: "Неге бұл жеткілікті",
  },

  /* ---------------- Bureau of Special Cases (topbar + shelf) --------------- */

  brandTitle: {
    ru: "Найди ложь",
    en: "Spot the Lie",
    tr: "Yalan Nerede",
    ar: "أين الكذبة",
    kk: "Өтірік қайда",
  },
  brandShort: { ru: "НЛ", en: "SL", tr: "YN", ar: "أك", kk: "ӨҚ" },
  brandTagline: {
    ru: "Детективные дела",
    en: "Detective puzzles",
    tr: "Dedektif dosyaları",
    ar: "قضايا بوليسية",
    kk: "Детектив істері",
  },
  navInvestigation: {
    ru: "Расследование",
    en: "Investigation",
    tr: "Soruşturma",
    ar: "التحقيق",
    kk: "Тергеу",
  },
  navBureau: {
    ru: "Бюро особых дел",
    en: "Bureau of Special Cases",
    tr: "Özel Dosyalar Bürosu",
    ar: "مكتب القضايا الخاصة",
    kk: "Ерекше істер бюросы",
  },
  settings: {
    ru: "Настройки",
    en: "Settings",
    tr: "Ayarlar",
    ar: "الإعدادات",
    kk: "Баптаулар",
  },
  region: { ru: "Регион", en: "Region", tr: "Bölge", ar: "المنطقة", kk: "Аймақ" },
  bureauEyebrow: {
    ru: "Бюро особых дел · закрытый отдел",
    en: "Bureau of Special Cases · restricted unit",
    tr: "Özel Dosyalar Bürosu · kapalı birim",
    ar: "مكتب القضايا الخاصة · قسم مغلق",
    kk: "Ерекше істер бюросы · жабық бөлім",
  },
  bureauHeroTitle: {
    ru: "Истории, которые не попали в обычные сводки",
    en: "The stories that never made the official reports",
    tr: "Resmî raporlara girmeyen hikâyeler",
    ar: "قصص لم تدخل التقارير الرسمية",
    kk: "Ресми есептерге кірмеген оқиғалар",
  },
  bureauHeroLead: {
    ru: "Три тематических архива. Тридцать самостоятельных расследований с новыми героями, уликами и финальными развязками.",
    en: "Three themed archives. Thirty standalone investigations with new characters, evidence and endings.",
    tr: "Üç temalı arşiv. Yeni karakterler, deliller ve finallerle otuz bağımsız soruşturma.",
    ar: "ثلاثة أرشيفات موضوعية. ثلاثون تحقيقًا مستقلًا بشخصيات وأدلة ونهايات جديدة.",
    kk: "Үш тақырыптық архив. Жаңа кейіпкерлері, дәлелдері мен шешімдері бар отыз дербес тергеу.",
  },
  bureauBackToCase: {
    ru: "← Вернуться к делу",
    en: "← Back to the case",
    tr: "← Dosyaya dön",
    ar: "← العودة إلى القضية",
    kk: "← Іске оралу",
  },
  bureauBackToArchives: {
    ru: "← Все архивы",
    en: "← All archives",
    tr: "← Tüm arşivler",
    ar: "← كل الأرشيفات",
    kk: "← Барлық архивтер",
  },
  bureauTabArchives: {
    ru: "Архивы",
    en: "Archives",
    tr: "Arşivler",
    ar: "الأرشيفات",
    kk: "Архивтер",
  },
  bureauTabStamps: {
    ru: "Штампы",
    en: "Stamps",
    tr: "Damgalar",
    ar: "الأختام",
    kk: "Мөрлер",
  },
  bureauTabBundles: {
    ru: "Наборы",
    en: "Bundles",
    tr: "Paketler",
    ar: "الحزم",
    kk: "Жинақтар",
  },
  bureauTabBundlesBadge: {
    ru: "до −{percent}%",
    en: "up to −{percent}%",
    tr: "−{percent}%'e varan",
    ar: "حتى −{percent}%",
    kk: "−{percent}%-ға дейін",
  },
  archiveCardEyebrow: {
    ru: "Архив №{number} · {total} дел",
    en: "Archive No. {number} · {total} cases",
    tr: "Arşiv No. {number} · {total} dosya",
    ar: "الأرشيف رقم {number} · {total} قضية",
    kk: "№{number} архив · {total} іс",
  },
  archiveCardMore: {
    ru: "Подробнее",
    en: "Details",
    tr: "Ayrıntılar",
    ar: "التفاصيل",
    kk: "Толығырақ",
  },
  archiveOneCaseFree: {
    ru: "1 дело бесплатно",
    en: "1 case free",
    tr: "1 dosya ücretsiz",
    ar: "قضية واحدة مجانًا",
    kk: "1 іс тегін",
  },
  archiveDetailFeatureCases: {
    ru: "новых дел",
    en: "new cases",
    tr: "yeni dosya",
    ar: "قضايا جديدة",
    kk: "жаңа іс",
  },
  archiveDetailFeatureEvidence: {
    ru: "улик",
    en: "clues",
    tr: "delil",
    ar: "دليلًا",
    kk: "дәлел",
  },
  archiveDetailFeatureStamp: {
    ru: "особый штамп",
    en: "special stamp",
    tr: "özel damga",
    ar: "ختم خاص",
    kk: "ерекше мөр",
  },
  archiveDetailPlayFree: {
    ru: "Играть первое дело бесплатно",
    en: "Play the first case free",
    tr: "İlk dosyayı ücretsiz oyna",
    ar: "العب القضية الأولى مجانًا",
    kk: "Бірінші істі тегін ойнау",
  },
  archiveDetailOpenWhole: {
    ru: "Открыть весь архив",
    en: "Unlock the whole archive",
    tr: "Arşivin tamamını aç",
    ar: "افتح الأرشيف كاملًا",
    kk: "Бүкіл архивті ашу",
  },
  archiveDetailContinue: {
    ru: "Продолжить расследование",
    en: "Continue the investigation",
    tr: "Soruşturmaya devam et",
    ar: "متابعة التحقيق",
    kk: "Тергеуді жалғастыру",
  },
  archiveIncludedTitle: {
    ru: "В архив входит",
    en: "The archive includes",
    tr: "Arşive dahil",
    ar: "يشمل الأرشيف",
    kk: "Архивке кіреді",
  },
  archiveIncludedDuration: {
    ru: "≈ 2–3 часа расследований",
    en: "≈ 2–3 hours of investigation",
    tr: "≈ 2–3 saatlik soruşturma",
    ar: "≈ 2–3 ساعات من التحقيق",
    kk: "≈ 2–3 сағат тергеу",
  },
  archiveIncludedEvidence: {
    ru: "{count}+ новых улик",
    en: "{count}+ new clues",
    tr: "{count}+ yeni delil",
    ar: "{count}+ دليل جديد",
    kk: "{count}+ жаңа дәлел",
  },
  archiveIncludedEvidenceNote: {
    ru: "Документы, снимки и показания",
    en: "Documents, photos and statements",
    tr: "Belgeler, fotoğraflar ve ifadeler",
    ar: "مستندات وصور وإفادات",
    kk: "Құжаттар, суреттер және айғақтар",
  },
  archiveIncludedHeroes: {
    ru: "Новые герои",
    en: "New characters",
    tr: "Yeni karakterler",
    ar: "شخصيات جديدة",
    kk: "Жаңа кейіпкерлер",
  },
  archiveIncludedHeroesNote: {
    ru: "Соседи, свидетели и заявители",
    en: "Neighbours, witnesses and claimants",
    tr: "Komşular, tanıklar ve başvuranlar",
    ar: "جيران وشهود ومطالبون",
    kk: "Көршілер, куәгерлер және өтініш берушілер",
  },
  archiveIncludedBonus: {
    ru: "Бонус",
    en: "Bonus",
    tr: "Bonus",
    ar: "مكافأة",
    kk: "Бонус",
  },
  archiveContentsEyebrow: {
    ru: "Состав архива",
    en: "Archive contents",
    tr: "Arşiv içeriği",
    ar: "محتويات الأرشيف",
    kk: "Архив құрамы",
  },
  archiveContentsTitle: {
    ru: "Дела архива",
    en: "Cases in the archive",
    tr: "Arşivdeki dosyalar",
    ar: "قضايا الأرشيف",
    kk: "Архив істері",
  },
  archiveCaseFreeLabel: {
    ru: "Доступно бесплатно",
    en: "Free to play",
    tr: "Ücretsiz erişim",
    ar: "متاح مجانًا",
    kk: "Тегін қолжетімді",
  },
  archiveCaseInArchiveLabel: {
    ru: "В составе архива",
    en: "Part of the archive",
    tr: "Arşive dahil",
    ar: "ضمن الأرشيف",
    kk: "Архив құрамында",
  },
  archiveCasePlay: {
    ru: "Играть →",
    en: "Play →",
    tr: "Oyna →",
    ar: "العب →",
    kk: "Ойнау →",
  },
  workshopEyebrow: {
    ru: "Бюро особых дел · мастерская",
    en: "Bureau of Special Cases · workshop",
    tr: "Özel Dosyalar Bürosu · atölye",
    ar: "مكتب القضايا الخاصة · الورشة",
    kk: "Ерекше істер бюросы · шеберхана",
  },
  workshopTitle: {
    ru: "Штамп с вашим характером",
    en: "A stamp with your own character",
    tr: "Karakterinizi taşıyan bir damga",
    ar: "ختم يحمل شخصيتك",
    kk: "Мінезіңізге сай мөр",
  },
  workshopLead: {
    ru: "Примерьте вердикт на настоящем документе. Штамп меняет подачу, но не правила и награду.",
    en: "Try a verdict on a real document. The stamp changes the delivery, never the rules or the reward.",
    tr: "Kararı gerçek bir belge üzerinde deneyin. Damga sunumu değiştirir; kuralları ve ödülü değil.",
    ar: "جرّب الحكم على مستند حقيقي. الختم يغيّر الأسلوب، لا القواعد ولا المكافأة.",
    kk: "Шешімді нақты құжатта байқап көріңіз. Мөр стильді өзгертеді, ережені мен сыйақыны емес.",
  },
  workshopFittingRoom: {
    ru: "Примерочная",
    en: "Fitting room",
    tr: "Deneme odası",
    ar: "غرفة القياس",
    kk: "Байқау бөлмесі",
  },
  workshopCatalogTab: {
    ru: "Каталог мастерской",
    en: "Workshop catalogue",
    tr: "Atölye kataloğu",
    ar: "كتالوج الورشة",
    kk: "Шеберхана каталогы",
  },
  workshopPreviewLabel: {
    ru: "Предпросмотр в деле",
    en: "Preview on a case",
    tr: "Dosya üzerinde önizleme",
    ar: "معاينة داخل القضية",
    kk: "Іс ішінде алдын ала қарау",
  },
  workshopPreviewNote: {
    ru: "можно менять в любой момент",
    en: "can be changed at any time",
    tr: "istediğiniz zaman değiştirilebilir",
    ar: "يمكن تغييره في أي وقت",
    kk: "кез келген уақытта өзгертуге болады",
  },
  workshopPaperNumber: {
    ru: "Страховое заявление № 2718",
    en: "Insurance claim No. 2718",
    tr: "Sigorta başvurusu No. 2718",
    ar: "مطالبة تأمين رقم 2718",
    kk: "№2718 сақтандыру өтініші",
  },
  workshopPaperTitle: {
    ru: "Обстоятельства происшествия",
    en: "Circumstances of the incident",
    tr: "Olayın koşulları",
    ar: "ملابسات الحادث",
    kk: "Оқиға мән-жайы",
  },
  workshopPaperBody: {
    ru: "По словам заявителя, сейф самостоятельно покинул помещение через окно второго этажа. Свидетели утверждают, что до этого у сейфа выросли колёса.",
    en: "According to the claimant, the safe left the room by itself through a second-floor window. Witnesses claim it had grown wheels beforehand.",
    tr: "Başvurana göre kasa ikinci kattaki pencereden kendi başına çıkmış. Tanıklar kasanın öncesinde tekerlek çıkardığını söylüyor.",
    ar: "يقول المطالِب إن الخزنة غادرت الغرفة بنفسها عبر نافذة الطابق الثاني. ويؤكد الشهود أنها أنبتت عجلات قبل ذلك.",
    kk: "Өтініш берушінің айтуынша, сейф екінші қабаттың терезесі арқылы өз бетінше шығып кеткен. Куәгерлер оған дейін сейфте дөңгелек өскенін айтады.",
  },
  workshopPaperSignature: {
    ru: "Инспектор ___________",
    en: "Inspector ___________",
    tr: "Müfettiş ___________",
    ar: "المفتش ___________",
    kk: "Инспектор ___________",
  },
  workshopInkColor: {
    ru: "Цвет чернил",
    en: "Ink colour",
    tr: "Mürekkep rengi",
    ar: "لون الحبر",
    kk: "Сия түсі",
  },
  workshopInkRed: {
    ru: "Красные чернила",
    en: "Red ink",
    tr: "Kırmızı mürekkep",
    ar: "حبر أحمر",
    kk: "Қызыл сия",
  },
  workshopInkBlue: {
    ru: "Синие чернила",
    en: "Blue ink",
    tr: "Mavi mürekkep",
    ar: "حبر أزرق",
    kk: "Көк сия",
  },
  workshopInkGreen: {
    ru: "Зелёные чернила",
    en: "Green ink",
    tr: "Yeşil mürekkep",
    ar: "حبر أخضر",
    kk: "Жасыл сия",
  },
  buyAction: {
    ru: "Купить",
    en: "Buy",
    tr: "Satın al",
    ar: "شراء",
    kk: "Сатып алу",
  },
  archiveIncludedHeroesKicker: {
    ru: "Досье",
    en: "Dossier",
    tr: "Dosya",
    ar: "ملف",
    kk: "Досье",
  },
  workshopCollection: {
    ru: "Коллекция",
    en: "Collection",
    tr: "Koleksiyon",
    ar: "المجموعة",
    kk: "Топтама",
  },
  workshopChooseStamp: {
    ru: "Выберите штамп",
    en: "Choose a stamp",
    tr: "Bir damga seçin",
    ar: "اختر ختمًا",
    kk: "Мөрді таңдаңыз",
  },
  workshopStampInUse: {
    ru: "Используется",
    en: "In use",
    tr: "Kullanımda",
    ar: "قيد الاستخدام",
    kk: "Қолданылуда",
  },
  workshopStampFitting: {
    ru: "Примерка",
    en: "Trying on",
    tr: "Deneme",
    ar: "قيد القياس",
    kk: "Байқау",
  },
  bundleStampsEyebrow: {
    ru: "Набор следователя · −{percent}%",
    en: "Investigator's set · −{percent}%",
    tr: "Müfettiş seti · −{percent}%",
    ar: "طقم المحقق · −{percent}%",
    kk: "Тергеуші жинағы · −{percent}%",
  },
  bundleStampsTitle: {
    ru: "Все шуточные штампы",
    en: "Every novelty stamp",
    tr: "Tüm esprili damgalar",
    ar: "كل الأختام الطريفة",
    kk: "Барлық әзіл мөрлер",
  },
  bundleBuy: {
    ru: "Купить набор",
    en: "Buy the bundle",
    tr: "Paketi satın al",
    ar: "شراء الحزمة",
    kk: "Жинақты сатып алу",
  },
  bundleHeroEyebrow: {
    ru: "Лучшее предложение Бюро",
    en: "The Bureau's best offer",
    tr: "Büronun en iyi teklifi",
    ar: "أفضل عرض من المكتب",
    kk: "Бюроның үздік ұсынысы",
  },
  bundleHeroTitle: {
    ru: "Полное собрание дел",
    en: "The complete case collection",
    tr: "Dosyaların tam koleksiyonu",
    ar: "المجموعة الكاملة للقضايا",
    kk: "Істердің толық жинағы",
  },
  bundleHeroLead: {
    ru: "Все три архива и коллекция шуточных штампов.",
    en: "All three archives plus the full novelty-stamp collection.",
    tr: "Üç arşivin tamamı ve esprili damga koleksiyonu.",
    ar: "الأرشيفات الثلاثة كاملة مع مجموعة الأختام الطريفة.",
    kk: "Үш архивтің барлығы және әзіл мөрлер топтамасы.",
  },
  bundleHeroCta: {
    ru: "Получить полное собрание",
    en: "Get the complete collection",
    tr: "Tam koleksiyonu al",
    ar: "احصل على المجموعة الكاملة",
    kk: "Толық жинақты алу",
  },
  bundleSavings: {
    ru: "экономия {amount}",
    en: "you save {amount}",
    tr: "{amount} tasarruf",
    ar: "توفير {amount}",
    kk: "{amount} үнемдейсіз",
  },
  purchaseNotCompleted: {
    ru: "Покупка не завершена",
    en: "Purchase not completed",
    tr: "Satın alma tamamlanmadı",
    ar: "لم تكتمل عملية الشراء",
    kk: "Сатып алу аяқталмады",
  },
  bundleOwned: {
    ru: "Всё уже открыто",
    en: "Everything is already unlocked",
    tr: "Her şey zaten açık",
    ar: "كل شيء مفتوح بالفعل",
    kk: "Бәрі ашылған",
  },
  backToCampaign: {
    ru: "К обычным делам",
    en: "Back to regular cases",
    tr: "Normal dosyalara dön",
    ar: "العودة إلى القضايا العادية",
    kk: "Қарапайым істерге оралу",
  },
  archiveCaseNumber: {
    ru: "Дело {n}",
    en: "File {n}",
    tr: "Dosya {n}",
    ar: "الملف {n}",
    kk: "{n}-іс",
  },
  archiveCaseLockedToast: {
    ru: "Дело закрыто — откройте архив в Бюро",
    en: "This file is sealed — open the archive in the Bureau",
    tr: "Bu dosya kapalı — arşivi Büro'da açın",
    ar: "هذا الملف مغلق — افتح الأرشيف في المكتب",
    kk: "Іс жабық — архивті Бюрода ашыңыз",
  },
  archiveCaseLocked: {
    ru: "Закрыто",
    en: "Sealed",
    tr: "Kapalı",
    ar: "مغلق",
    kk: "Жабық",
  },
  bundleArchivesTitle: {
    ru: "Три расследования",
    en: "Three investigations",
    tr: "Üç soruşturma",
    ar: "ثلاثة تحقيقات",
    kk: "Үш тергеу",
  },
  bundleArchivesLead: {
    ru: "Все три архива Бюро — тридцать дел без единой блокировки.",
    en: "All three Bureau archives — thirty files with nothing locked.",
    tr: "Büronun üç arşivi de — kilitsiz otuz dosya.",
    ar: "أرشيفات المكتب الثلاثة — ثلاثون ملفًا بلا أي قفل.",
    kk: "Бюроның үш архиві — құлыпсыз отыз іс.",
  },
  bundleArchivesCta: {
    ru: "Взять три архива",
    en: "Take all three archives",
    tr: "Üç arşivi de al",
    ar: "خذ الأرشيفات الثلاثة",
    kk: "Үш архивті алу",
  },
  offerBadge: {
    ru: "Спецпредложение",
    en: "Special offer",
    tr: "Özel teklif",
    ar: "عرض خاص",
    kk: "Арнайы ұсыныс",
  },
  noAdsTitle: {
    ru: "Отключение обязательной рекламы",
    en: "Turn off forced ads",
    tr: "Zorunlu reklamları kapat",
    ar: "إيقاف الإعلانات الإجبارية",
    kk: "Міндетті жарнаманы өшіру",
  },
  noAdsLead: {
    ru: "Полноэкранная реклама между делами больше не появится. Ролики за награду остаются — их вы включаете сами.",
    en: "No more fullscreen ads between cases. Rewarded videos stay — those you start yourself.",
    tr: "Dosyalar arasında tam ekran reklam yok. Ödüllü videolar kalır — onları siz başlatırsınız.",
    ar: "لا مزيد من الإعلانات بملء الشاشة بين القضايا. تبقى الفيديوهات المكافِئة — وأنت من يشغّلها.",
    kk: "Істер арасында толық экранды жарнама болмайды. Сыйақылы роликтер қалады — оларды өзіңіз қосасыз.",
  },
  noAdsCta: {
    ru: "Отключить рекламу",
    en: "Turn off ads",
    tr: "Reklamları kapat",
    ar: "إيقاف الإعلانات",
    kk: "Жарнаманы өшіру",
  },
  noAdsOwned: {
    ru: "Реклама отключена",
    en: "Ads are off",
    tr: "Reklamlar kapalı",
    ar: "الإعلانات موقوفة",
    kk: "Жарнама өшірілген",
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
