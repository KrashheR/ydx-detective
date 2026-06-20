/**
 * Static achievement catalog — content, not logic. Each entry is i18n-complete
 * (the `LocalizedString` type forces an entry for every supported language at
 * compile time, mirroring the case-content rule). The *conditions* that unlock
 * each achievement are pure predicates in `src/engine/achievementsEngine.ts`,
 * keyed by `id`; this file holds only the displayable metadata + reward.
 */
import type { LocalizedString } from '../types';

export interface Achievement {
  readonly id: string;
  /** A restrained iconographic emoji (no cartoon/neon — see design red lines). */
  readonly icon: string;
  readonly title: LocalizedString;
  readonly description: LocalizedString;
  /** One-time career XP granted on unlock. */
  readonly xpBonus: number;
  /** One-time currency granted on unlock. */
  readonly rubBonus: number;
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first-fraud',
    icon: '🕵️',
    title: {
      ru: 'Первое разоблачение',
      en: 'First Exposure',
      tr: 'İlk İfşa',
      ar: 'أول كشف',
      kk: 'Алғашқы әшкерелеу',
    },
    description: {
      ru: 'Разоблачите своё первое мошенничество.',
      en: 'Expose your first fraud.',
      tr: 'İlk dolandırıcılığınızı ifşa edin.',
      ar: 'اكشف أول عملية احتيال.',
      kk: 'Алғашқы алаяқтығыңызды әшкерелеңіз.',
    },
    xpBonus: 15,
    rubBonus: 200,
  },
  {
    id: 'solved-10',
    icon: '📁',
    title: {
      ru: 'Опытный следователь',
      en: 'Seasoned Investigator',
      tr: 'Deneyimli Müfettiş',
      ar: 'محقق متمرس',
      kk: 'Тәжірибелі тергеуші',
    },
    description: {
      ru: 'Раскройте 10 дел.',
      en: 'Solve 10 cases.',
      tr: '10 dosya çözün.',
      ar: 'حل 10 قضايا.',
      kk: '10 істі шешіңіз.',
    },
    xpBonus: 50,
    rubBonus: 500,
  },
  {
    id: 'perfect-proof-hard',
    icon: '🎯',
    title: {
      ru: 'Безупречная доказуха',
      en: 'Flawless Proof',
      tr: 'Kusursuz Kanıt',
      ar: 'إثبات لا تشوبه شائبة',
      kk: 'Мінсіз дәлел',
    },
    description: {
      ru: '100% точность доказательств на сложном деле.',
      en: '100% proof accuracy on a hard case.',
      tr: 'Zor bir dosyada %100 kanıt doğruluğu.',
      ar: 'دقة إثبات 100% في قضية صعبة.',
      kk: 'Күрделі істе 100% дәлел дәлдігі.',
    },
    xpBonus: 40,
    rubBonus: 400,
  },
  {
    id: 'streak-5',
    icon: '🔥',
    title: {
      ru: 'На потоке',
      en: 'On a Roll',
      tr: 'Üst Üste',
      ar: 'في تتابع',
      kk: 'Топ-түрінде',
    },
    description: {
      ru: 'Достигните серии в 5 дней.',
      en: 'Reach a 5-day streak.',
      tr: '5 günlük seriye ulaşın.',
      ar: 'حقق سلسلة من 5 أيام.',
      kk: '5 күндік серияға жетіңіз.',
    },
    xpBonus: 30,
    rubBonus: 300,
  },
  {
    id: 'clean-hands-10',
    icon: '✋',
    title: {
      ru: 'Чистые руки',
      en: 'Clean Hands',
      tr: 'Temiz Eller',
      ar: 'أيادٍ نظيفة',
      kk: 'Таза қол',
    },
    description: {
      ru: 'Закройте 10 дел без единого ложного штампа.',
      en: 'Close 10 cases with zero false stamps.',
      tr: '10 dosyayı yanlış damga olmadan kapatın.',
      ar: 'أغلق 10 قضايا دون أي ختم خاطئ.',
      kk: '10 істі бір де бір қате мөрсіз жабыңыз.',
    },
    xpBonus: 40,
    rubBonus: 400,
  },
];

/** Quick id → achievement lookup for result/panel rendering. */
export const ACHIEVEMENTS_BY_ID: ReadonlyMap<string, Achievement> = new Map(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
