import { GAME_CONFIG } from '../config/gameConfig';
import { loc, t, type UIKey } from '../i18n/ui';
import type {
  Case,
  DepartmentId,
  InvestigationService,
  Language,
} from '../types';

interface Props {
  caseData: Case;
  lang: Language;
  balance: number;
  selectedService: InvestigationService | null;
  departmentLevels: Record<DepartmentId, number>;
  canChooseService: boolean;
  onSelectService: (service: InvestigationService) => boolean;
}

const SERVICE_META: Record<
  InvestigationService,
  { label: UIKey; effect: UIKey; stamp: UIKey }
> = {
  archive_check: {
    label: 'serviceArchive',
    effect: 'serviceArchiveEffect',
    stamp: 'departmentArchive',
  },
  extra_clearance: {
    label: 'serviceClearance',
    effect: 'serviceClearanceEffect',
    stamp: 'departmentField',
  },
  expert_opinion: {
    label: 'serviceExpert',
    effect: 'serviceExpertEffect',
    stamp: 'departmentLab',
  },
};

const SERVICES: InvestigationService[] = [
  'archive_check',
  'extra_clearance',
  'expert_opinion',
];

export function InvestigationServiceOrder({
  caseData,
  lang,
  balance,
  selectedService,
  departmentLevels,
  canChooseService,
  onSelectService,
}: Props) {
  const fmt = (n: number) => n.toLocaleString('ru-RU');

  return (
    <section className="mb-4 rounded-[8px] border border-border bg-surface p-4 shadow-folder">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-text-dim">
            {t('serviceOrder', lang)}
          </div>
          <h2 className="mt-1 font-serif text-[18px] font-bold text-text-light">
            {loc(caseData.title, lang)}
          </h2>
        </div>
        <div className="shrink-0 rotate-[-3deg] border-2 border-stamp px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-stamp">
          {t('preInvestigation', lang)}
        </div>
      </div>

      <div className="mt-3 grid gap-2.5">
        {SERVICES.map((service) => {
          const config = GAME_CONFIG.services[service];
          const level = departmentLevels[config.department];
          const unavailable =
            level < 1 ||
            (service === 'extra_clearance' && caseData.investigationBudget == null);
          const discount = level >= GAME_CONFIG.services.discountAtLevel
            ? 1 - GAME_CONFIG.services.discountPct / 100
            : 1;
          const base = GAME_CONFIG.reward.baseByDifficulty[caseData.difficulty];
          const cost = Math.round(base * config.pricePct * discount);
          const selected = selectedService === service;
          const unaffordable = balance < cost;
          const disabled = !canChooseService || unavailable || unaffordable || selectedService != null;
          const meta = SERVICE_META[service];
          const status = selected
            ? t('serviceSelected', lang)
            : unavailable
              ? service === 'extra_clearance' && caseData.investigationBudget == null
                ? t('serviceNotApplicable', lang)
                : t('serviceLocked', lang)
              : unaffordable
                ? t('serviceUnaffordable', lang)
                : level >= GAME_CONFIG.services.freeDailyAtLevel
                  ? t('serviceFreeDailyHint', lang)
                  : level >= GAME_CONFIG.services.discountAtLevel
                    ? t('serviceDiscountHint', lang)
                    : t('serviceAvailable', lang);

          return (
            <button
              key={service}
              type="button"
              disabled={disabled}
              onClick={() => onSelectService(service)}
              className={`min-h-[84px] rounded-[7px] border px-3 py-2.5 text-left transition-colors ${
                selected
                  ? 'border-success bg-success/10'
                  : disabled
                    ? 'border-border bg-surface-2/55 opacity-75'
                    : 'border-border bg-paper hover:border-accent'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-[9px] font-bold uppercase tracking-[.12em] text-text-dim">
                    {t(meta.stamp, lang)}
                  </div>
                  <div className="mt-0.5 text-[13px] font-bold text-text-light">
                    {t(meta.label, lang)}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-text-muted">
                    {t(meta.effect, lang)}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-[12px] font-bold text-text-light">
                    $ {fmt(cost)}
                  </div>
                  <div className="mt-1 max-w-[96px] text-[10px] font-semibold leading-tight text-text-dim">
                    {status}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
