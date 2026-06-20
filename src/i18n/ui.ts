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
  | 'language';

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
