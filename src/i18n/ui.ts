/**
 * UI chrome strings (buttons, prompts) — separate from case content, but same
 * data-driven principle: add a language by adding a column. The case-content
 * translations live inside each case JSON; this file covers only the shell.
 */
import type { Language } from '../types';

export type UIKey =
  | 'approve'
  | 'reject'
  | 'markContradiction'
  | 'unmarkContradiction'
  | 'rejectNeedsProof'
  | 'caseClosed'
  | 'fraudExposed'
  | 'investigatorError'
  | 'dailyCase'
  | 'restoreFunds'
  | 'balance'
  | 'cases'
  | 'progress'
  | 'solved'
  | 'accuracy'
  | 'leaderboard'
  | 'statement'
  | 'evidence'
  | 'claimLabel'
  | 'reviewAllFirst'
  | 'urgent'
  | 'returnsIn'
  | 'nextCase'
  | 'backToDesk'
  | 'verdictReward'
  | 'proofReward'
  | 'penalty'
  | 'rewardEarned'
  | 'bankruptTitle'
  | 'bankruptDesc'
  | 'language'
  | 'rank'
  | 'xpGained'
  | 'promotion'
  | 'bonus'
  | 'streak'
  | 'streakDays'
  | 'hints'
  | 'hintNote'
  | 'hintCanvass'
  | 'revealedContradiction'
  | 'revealedClean'
  | 'watchAd'
  | 'allRevealed'
  | 'achievements'
  | 'achievementUnlocked'
  | 'department'
  | 'casesInWork'
  | 'analytics'
  | 'clientStatement'
  | 'formCt1'
  | 'circumstances'
  | 'caseMaterials'
  | 'documents'
  | 'marked'
  | 'openCaseAction'
  | 'openDossier'
  | 'viewedDossier'
  | 'confidential'
  | 'selectCasePrompt'
  | 'truthOfCase'
  | 'rewardRevealed'
  | 'fee'
  | 'companyBalance'
  | 'investigationAccuracy'
  | 'leaderboardWeek'
  | 'verdictPrompt'
  | 'rejectPayout'
  | 'approvePayout'
  | 'investigator'
  | 'levelShort'
  | 'xpToPromote'
  | 'active'
  | 'lockedStatus'
  | 'lockedCaseToast'
  | 'markAsContradiction'
  | 'contradictionMarked'
  | 'contradiction'
  | 'tag_photo'
  | 'tag_gps'
  | 'tag_document'
  | 'tag_witness'
  | 'tag_camera'
  | 'tag_log'
  | 'casesWord'
  | 'errorsWord'
  | 'resultWinSub'
  | 'resultLoseSub'
  | 'rank_trainee'
  | 'rank_junior'
  | 'rank_inspector'
  | 'rank_senior'
  | 'rank_lead'
  | 'rank_chief';

export const UI_STRINGS: Record<UIKey, Record<Language, string>> = {
  approve: { ru: 'Одобрить', en: 'Approve', tr: 'Onayla', ar: 'الموافقة', kk: 'Мақұлдау' },
  reject: { ru: 'Отклонить', en: 'Reject', tr: 'Reddet', ar: 'رفض', kk: 'Қабылдамау' },
  markContradiction: {
    ru: 'Отметить противоречие',
    en: 'Mark as Contradiction',
    tr: 'Çelişki Olarak İşaretle',
    ar: 'وضع علامة تناقض',
    kk: 'Қайшылықты белгілеу',
  },
  unmarkContradiction: {
    ru: 'Снять отметку',
    en: 'Remove Mark',
    tr: 'İşareti Kaldır',
    ar: 'إزالة العلامة',
    kk: 'Белгіні алу',
  },
  rejectNeedsProof: {
    ru: 'Отказ должен быть обоснован. Укажите хотя бы одно противоречие в документах.',
    en: 'Rejection must be justified. Specify at least one contradiction in the documents.',
    tr: 'Ret gerekçelendirilmelidir. Belgelerde en az bir çelişki belirtin.',
    ar: 'يجب تبرير الرفض. حدد تناقضًا واحدًا على الأقل في المستندات.',
    kk: 'Бас тарту негізделуі керек. Құжаттардан кемінде бір қайшылық көрсетіңіз.',
  },
  caseClosed: { ru: 'ДЕЛО ЗАКРЫТО', en: 'CASE CLOSED', tr: 'DOSYA KAPANDI', ar: 'أُغلقت القضية', kk: 'ІС ЖАБЫЛДЫ' },
  fraudExposed: { ru: 'МОШЕННИК РАЗОБЛАЧЁН', en: 'FRAUD EXPOSED', tr: 'DOLANDIRICILIK ORTAYA ÇIKTI', ar: 'كُشف الاحتيال', kk: 'АЛАЯҚ ӘШКЕРЕЛЕНДІ' },
  investigatorError: { ru: 'ОШИБКА СЛЕДОВАТЕЛЯ', en: 'INVESTIGATOR ERROR', tr: 'MÜFETTİŞ HATASI', ar: 'خطأ المحقق', kk: 'ТЕРГЕУШІ ҚАТЕСІ' },
  dailyCase: { ru: 'Дело дня', en: 'Daily Case', tr: 'Günün Dosyası', ar: 'قضية اليوم', kk: 'Күн ісі' },
  restoreFunds: { ru: 'Восстановить средства', en: 'Restore Funds', tr: 'Fonları Geri Yükle', ar: 'استعادة الأموال', kk: 'Қаражатты қалпына келтіру' },
  balance: { ru: 'Баланс', en: 'Balance', tr: 'Bakiye', ar: 'الرصيد', kk: 'Баланс' },
  cases: { ru: 'Дела', en: 'Cases', tr: 'Dosyalar', ar: 'القضايا', kk: 'Істер' },
  progress: { ru: 'Прогресс', en: 'Progress', tr: 'İlerleme', ar: 'التقدم', kk: 'Прогресс' },
  solved: { ru: 'раскрыто', en: 'solved', tr: 'çözüldü', ar: 'محلولة', kk: 'шешілді' },
  accuracy: { ru: 'Точность', en: 'Accuracy', tr: 'Doğruluk', ar: 'الدقة', kk: 'Дәлдік' },
  leaderboard: { ru: 'Рейтинг', en: 'Leaderboard', tr: 'Lider Tablosu', ar: 'المتصدرون', kk: 'Рейтинг' },
  statement: { ru: 'Заявление', en: 'Statement', tr: 'Beyan', ar: 'البيان', kk: 'Өтініш' },
  evidence: { ru: 'Улики', en: 'Evidence', tr: 'Kanıtlar', ar: 'الأدلة', kk: 'Дәлелдер' },
  claimLabel: { ru: 'Сумма иска', en: 'Claim', tr: 'Talep', ar: 'المطالبة', kk: 'Талап' },
  reviewAllFirst: {
    ru: 'Сначала изучите все улики',
    en: 'Review all evidence first',
    tr: 'Önce tüm kanıtları inceleyin',
    ar: 'راجع كل الأدلة أولاً',
    kk: 'Алдымен барлық дәлелдерді қараңыз',
  },
  urgent: { ru: 'СРОЧНО', en: 'URGENT', tr: 'ACİL', ar: 'عاجل', kk: 'ШҰҒЫЛ' },
  returnsIn: { ru: 'Доступно через', en: 'Returns in', tr: 'Şu süre sonra', ar: 'يعود خلال', kk: 'Қолжетімді болады' },
  nextCase: { ru: 'Следующее дело', en: 'Next Case', tr: 'Sonraki Dosya', ar: 'القضية التالية', kk: 'Келесі іс' },
  backToDesk: { ru: 'К столу', en: 'Back to Desk', tr: 'Masaya Dön', ar: 'العودة للمكتب', kk: 'Үстелге' },
  verdictReward: { ru: 'За вердикт', en: 'Verdict', tr: 'Karar', ar: 'الحكم', kk: 'Шешім үшін' },
  proofReward: { ru: 'За доказательства', en: 'Proof', tr: 'Kanıt', ar: 'الإثبات', kk: 'Дәлел үшін' },
  penalty: { ru: 'Штраф', en: 'Penalty', tr: 'Ceza', ar: 'غرامة', kk: 'Айыппұл' },
  rewardEarned: { ru: 'Итого', en: 'Earned', tr: 'Toplam', ar: 'الإجمالي', kk: 'Барлығы' },
  bankruptTitle: {
    ru: 'Средства закончились',
    en: 'Out of Funds',
    tr: 'Fonlar Bitti',
    ar: 'نفدت الأموال',
    kk: 'Қаражат таусылды',
  },
  bankruptDesc: {
    ru: 'Посмотрите рекламу, чтобы восстановить баланс и продолжить расследование.',
    en: 'Watch an ad to restore your balance and continue investigating.',
    tr: 'Bakiyeni geri yüklemek için bir reklam izle ve soruşturmaya devam et.',
    ar: 'شاهد إعلانًا لاستعادة رصيدك ومواصلة التحقيق.',
    kk: 'Балансты қалпына келтіру үшін жарнаманы көріңіз.',
  },
  language: { ru: 'Язык', en: 'Language', tr: 'Dil', ar: 'اللغة', kk: 'Тіл' },
  rank: { ru: 'Ранг', en: 'Rank', tr: 'Rütbe', ar: 'الرتبة', kk: 'Дәреже' },
  xpGained: { ru: 'Опыт', en: 'XP', tr: 'Tecrübe', ar: 'خبرة', kk: 'Тәжірибе' },
  promotion: { ru: 'ПОВЫШЕНИЕ', en: 'PROMOTION', tr: 'TERFİ', ar: 'ترقية', kk: 'ЖОҒАРЫЛАТУ' },
  bonus: { ru: 'Бонус', en: 'Bonus', tr: 'Bonus', ar: 'مكافأة', kk: 'Бонус' },
  streak: { ru: 'Серия', en: 'Streak', tr: 'Seri', ar: 'سلسلة', kk: 'Серия' },
  streakDays: { ru: 'дн.', en: 'days', tr: 'gün', ar: 'يوم', kk: 'күн' },
  hints: { ru: 'Подсказки', en: 'Hints', tr: 'İpuçları', ar: 'تلميحات', kk: 'Кеңестер' },
  hintNote: {
    ru: 'Заметка инспектора',
    en: 'Inspector Note',
    tr: 'Müfettiş Notu',
    ar: 'ملاحظة المفتش',
    kk: 'Инспектор жазбасы',
  },
  hintCanvass: {
    ru: 'Опрос свидетелей',
    en: 'Witness Canvass',
    tr: 'Tanık Görüşmesi',
    ar: 'استجواب الشهود',
    kk: 'Куәларды сұрау',
  },
  revealedContradiction: {
    ru: 'Противоречие',
    en: 'Contradiction',
    tr: 'Çelişki',
    ar: 'تناقض',
    kk: 'Қайшылық',
  },
  revealedClean: {
    ru: 'Без противоречий',
    en: 'No contradiction',
    tr: 'Çelişki yok',
    ar: 'لا يوجد تناقض',
    kk: 'Қайшылық жоқ',
  },
  watchAd: { ru: 'Реклама', en: 'Watch ad', tr: 'Reklam izle', ar: 'مشاهدة إعلان', kk: 'Жарнама' },
  allRevealed: {
    ru: 'Все улики раскрыты',
    en: 'All evidence revealed',
    tr: 'Tüm kanıtlar açıldı',
    ar: 'تم كشف كل الأدلة',
    kk: 'Барлық дәлел ашылды',
  },
  achievements: {
    ru: 'Достижения',
    en: 'Achievements',
    tr: 'Başarılar',
    ar: 'الإنجازات',
    kk: 'Жетістіктер',
  },
  achievementUnlocked: {
    ru: 'Достижение получено',
    en: 'Achievement unlocked',
    tr: 'Başarı kazanıldı',
    ar: 'تم فتح إنجاز',
    kk: 'Жетістік ашылды',
  },
  department: {
    ru: 'ОТДЕЛ РАССЛЕДОВАНИЙ',
    en: 'INVESTIGATIONS DEPT',
    tr: 'SORUŞTURMA BİRİMİ',
    ar: 'قسم التحقيقات',
    kk: 'ТЕРГЕУ БӨЛІМІ',
  },
  casesInWork: {
    ru: 'ДЕЛА В РАБОТЕ',
    en: 'CASES IN PROGRESS',
    tr: 'AÇIK DOSYALAR',
    ar: 'قضايا قيد العمل',
    kk: 'ЖҰМЫСТАҒЫ ІСТЕР',
  },
  analytics: { ru: 'АНАЛИТИКА', en: 'ANALYTICS', tr: 'ANALİTİK', ar: 'التحليلات', kk: 'АНАЛИТИКА' },
  clientStatement: {
    ru: 'ЗАЯВЛЕНИЕ КЛИЕНТА',
    en: 'CLIENT STATEMENT',
    tr: 'MÜŞTERİ BEYANI',
    ar: 'بيان العميل',
    kk: 'КЛИЕНТ ӨТІНІШІ',
  },
  formCt1: { ru: 'Форма СТ-1', en: 'Form CT-1', tr: 'Form CT-1', ar: 'نموذج CT-1', kk: 'СТ-1 нысаны' },
  circumstances: {
    ru: 'ИЗЛОЖЕНИЕ ОБСТОЯТЕЛЬСТВ',
    en: 'STATEMENT OF FACTS',
    tr: 'OLAYLARIN ANLATIMI',
    ar: 'عرض الوقائع',
    kk: 'МӘН-ЖАЙДЫ БАЯНДАУ',
  },
  caseMaterials: {
    ru: 'МАТЕРИАЛЫ ДЕЛА',
    en: 'CASE MATERIALS',
    tr: 'DOSYA BELGELERİ',
    ar: 'مواد القضية',
    kk: 'ІС МАТЕРИАЛДАРЫ',
  },
  documents: { ru: 'документов', en: 'documents', tr: 'belge', ar: 'مستندات', kk: 'құжат' },
  marked: { ru: 'отмечено', en: 'marked', tr: 'işaretli', ar: 'موسوم', kk: 'белгіленді' },
  openCaseAction: {
    ru: 'Открыть дело',
    en: 'Open case',
    tr: 'Dosyayı aç',
    ar: 'فتح القضية',
    kk: 'Істі ашу',
  },
  openDossier: {
    ru: 'Открыть досье',
    en: 'Open file',
    tr: 'Dosyayı aç',
    ar: 'فتح الملف',
    kk: 'Іс қағазын ашу',
  },
  viewedDossier: {
    ru: 'Просмотрено',
    en: 'Reviewed',
    tr: 'İncelendi',
    ar: 'تمت المراجعة',
    kk: 'Қаралды',
  },
  confidential: {
    ru: 'КОНФИДЕНЦИАЛЬНО',
    en: 'CONFIDENTIAL',
    tr: 'GİZLİ',
    ar: 'سري',
    kk: 'ҚҰПИЯ',
  },
  selectCasePrompt: {
    ru: 'ВЫБЕРИТЕ ДЕЛО ДЛЯ РАССЛЕДОВАНИЯ',
    en: 'SELECT A CASE TO INVESTIGATE',
    tr: 'SORUŞTURULACAK DOSYAYI SEÇİN',
    ar: 'اختر قضية للتحقيق',
    kk: 'ТЕРГЕУГЕ ІС ТАҢДАҢЫЗ',
  },
  truthOfCase: {
    ru: 'ИСТИНА ПО ДЕЛУ',
    en: 'THE TRUTH OF THE CASE',
    tr: 'DOSYANIN GERÇEĞİ',
    ar: 'حقيقة القضية',
    kk: 'ІС БОЙЫНША АҚИҚАТ',
  },
  rewardRevealed: {
    ru: 'Раскрыто вознаграждения',
    en: 'Reward unlocked',
    tr: 'Açılan ödül',
    ar: 'المكافأة المكشوفة',
    kk: 'Ашылған сыйақы',
  },
  fee: { ru: 'Гонорар', en: 'Fee', tr: 'Ücret', ar: 'الأتعاب', kk: 'Гонорар' },
  companyBalance: {
    ru: 'Баланс компании',
    en: 'Company balance',
    tr: 'Şirket bakiyesi',
    ar: 'رصيد الشركة',
    kk: 'Компания балансы',
  },
  investigationAccuracy: {
    ru: 'Точность следствия',
    en: 'Investigation accuracy',
    tr: 'Soruşturma doğruluğu',
    ar: 'دقة التحقيق',
    kk: 'Тергеу дәлдігі',
  },
  leaderboardWeek: {
    ru: 'ЛИДЕРБОРД · НЕДЕЛЯ',
    en: 'LEADERBOARD · WEEK',
    tr: 'LİDER TABLOSU · HAFTA',
    ar: 'المتصدرون · الأسبوع',
    kk: 'РЕЙТИНГ · АПТА',
  },
  verdictPrompt: {
    ru: 'Вынесите вердикт. Отклонение требует обоснования уликами.',
    en: 'Render your verdict. A rejection must be justified by evidence.',
    tr: 'Kararınızı verin. Ret, kanıtla gerekçelendirilmelidir.',
    ar: 'أصدر حكمك. يجب تبرير الرفض بالأدلة.',
    kk: 'Шешім шығарыңыз. Бас тарту дәлелмен негізделуі тиіс.',
  },
  rejectPayout: {
    ru: 'ОТКЛОНИТЬ ВЫПЛАТУ',
    en: 'REJECT PAYOUT',
    tr: 'ÖDEMEYİ REDDET',
    ar: 'رفض الدفع',
    kk: 'ТӨЛЕМДІ ҚАБЫЛДАМАУ',
  },
  approvePayout: {
    ru: 'ОДОБРИТЬ ВЫПЛАТУ',
    en: 'APPROVE PAYOUT',
    tr: 'ÖDEMEYİ ONAYLA',
    ar: 'الموافقة على الدفع',
    kk: 'ТӨЛЕМДІ МАҚҰЛДАУ',
  },
  investigator: {
    ru: 'Следователь',
    en: 'Investigator',
    tr: 'Müfettiş',
    ar: 'المحقق',
    kk: 'Тергеуші',
  },
  levelShort: { ru: 'ур.', en: 'lvl', tr: 'sv.', ar: 'مست.', kk: 'дең.' },
  xpToPromote: {
    ru: 'XP до повышения',
    en: 'XP to promotion',
    tr: 'terfiye XP',
    ar: 'خبرة للترقية',
    kk: 'жоғарылауға XP',
  },
  active: { ru: 'активно', en: 'active', tr: 'aktif', ar: 'نشط', kk: 'белсенді' },
  lockedStatus: {
    ru: 'заблокировано',
    en: 'locked',
    tr: 'kilitli',
    ar: 'مقفل',
    kk: 'құлыпталған',
  },
  lockedCaseToast: {
    ru: 'Дело откроется на следующем уровне следователя.',
    en: 'This case unlocks at the next investigator level.',
    tr: 'Bu dosya bir sonraki müfettiş seviyesinde açılır.',
    ar: 'تُفتح هذه القضية في مستوى المحقق التالي.',
    kk: 'Бұл іс келесі тергеуші деңгейінде ашылады.',
  },
  markAsContradiction: {
    ru: 'ОТМЕТИТЬ КАК ПРОТИВОРЕЧИЕ',
    en: 'MARK AS CONTRADICTION',
    tr: 'ÇELİŞKİ OLARAK İŞARETLE',
    ar: 'وضع علامة تناقض',
    kk: 'ҚАЙШЫЛЫҚ ДЕП БЕЛГІЛЕУ',
  },
  contradictionMarked: {
    ru: 'ПРОТИВОРЕЧИЕ ОТМЕЧЕНО ✓ · убрать',
    en: 'CONTRADICTION MARKED ✓ · remove',
    tr: 'ÇELİŞKİ İŞARETLENDİ ✓ · kaldır',
    ar: 'تم وسم التناقض ✓ · إزالة',
    kk: 'ҚАЙШЫЛЫҚ БЕЛГІЛЕНДІ ✓ · алу',
  },
  contradiction: {
    ru: 'ПРОТИВОРЕЧИЕ',
    en: 'CONTRADICTION',
    tr: 'ÇELİŞKİ',
    ar: 'تناقض',
    kk: 'ҚАЙШЫЛЫҚ',
  },
  tag_photo: { ru: 'ФОТО', en: 'PHOTO', tr: 'FOTO', ar: 'صورة', kk: 'ФОТО' },
  tag_gps: { ru: 'GPS', en: 'GPS', tr: 'GPS', ar: 'GPS', kk: 'GPS' },
  tag_document: { ru: 'ДОК', en: 'DOC', tr: 'BELGE', ar: 'مستند', kk: 'ҚҰЖ' },
  tag_witness: { ru: 'ПОКАЗАНИЯ', en: 'WITNESS', tr: 'TANIK', ar: 'شهادة', kk: 'КУӘЛІК' },
  tag_camera: { ru: 'ВИДЕО', en: 'VIDEO', tr: 'VİDEO', ar: 'فيديو', kk: 'ВИДЕО' },
  tag_log: { ru: 'ЛОГ', en: 'LOG', tr: 'KAYIT', ar: 'سجل', kk: 'ЛОГ' },
  casesWord: { ru: 'дел', en: 'cases', tr: 'dosya', ar: 'قضايا', kk: 'іс' },
  errorsWord: { ru: 'ошибок', en: 'errors', tr: 'hata', ar: 'أخطاء', kk: 'қате' },
  resultWinSub: {
    ru: 'Дело закрыто · выплата обоснованно отклонена',
    en: 'Case closed · payout justifiably rejected',
    tr: 'Dosya kapandı · ödeme haklı olarak reddedildi',
    ar: 'أُغلقت القضية · رُفض الدفع بشكل مبرر',
    kk: 'Іс жабылды · төлем негізді түрде қабылданбады',
  },
  resultLoseSub: {
    ru: 'Выплата одобрена мошеннику',
    en: 'Payout approved to a fraudster',
    tr: 'Ödeme bir dolandırıcıya onaylandı',
    ar: 'تمت الموافقة على الدفع لمحتال',
    kk: 'Төлем алаяққа мақұлданды',
  },
  rank_trainee: { ru: 'Стажёр', en: 'Trainee', tr: 'Stajyer', ar: 'متدرب', kk: 'Тағылымдамашы' },
  rank_junior: {
    ru: 'Мл. инспектор',
    en: 'Junior Inspector',
    tr: 'Kıdemsiz Müfettiş',
    ar: 'مفتش مبتدئ',
    kk: 'Кіші инспектор',
  },
  rank_inspector: { ru: 'Инспектор', en: 'Inspector', tr: 'Müfettiş', ar: 'مفتش', kk: 'Инспектор' },
  rank_senior: {
    ru: 'Ст. инспектор',
    en: 'Senior Inspector',
    tr: 'Kıdemli Müfettiş',
    ar: 'مفتش أول',
    kk: 'Аға инспектор',
  },
  rank_lead: {
    ru: 'Ведущий следователь',
    en: 'Lead Investigator',
    tr: 'Baş Müfettiş',
    ar: 'محقق رئيسي',
    kk: 'Жетекші тергеуші',
  },
  rank_chief: {
    ru: 'Главный следователь',
    en: 'Chief Investigator',
    tr: 'Şef Müfettiş',
    ar: 'كبير المحققين',
    kk: 'Бас тергеуші',
  },
};

/** Native names + flags for the language selector (data-driven). */
export const LANGUAGE_LABELS: Record<Language, { native: string; flag: string }> =
  {
    ru: { native: 'Русский', flag: '🇷🇺' },
    en: { native: 'English', flag: '🇬🇧' },
    tr: { native: 'Türkçe', flag: '🇹🇷' },
    ar: { native: 'العربية', flag: '🇸🇦' },
    kk: { native: 'Қазақша', flag: '🇰🇿' },
  };

/** Languages that render right-to-left. */
export const RTL_LANGUAGES: ReadonlySet<Language> = new Set<Language>(['ar']);

/** Convenience translator bound to the active language. */
export function t(key: UIKey, lang: Language): string {
  return UI_STRINGS[key][lang];
}

/** Resolve a `LocalizedString`/`LocalizedContent` field with a safe fallback. */
export function loc<T extends Partial<Record<Language, unknown>>>(
  field: T,
  lang: Language,
): T[Language] {
  return (field[lang] ?? field.ru) as T[Language];
}
