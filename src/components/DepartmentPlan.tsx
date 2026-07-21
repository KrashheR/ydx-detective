import { motion } from 'framer-motion';
import { GAME_CONFIG } from '../config/gameConfig';
import { t } from '../i18n/ui';
import type React from 'react';
import type { DepartmentId, Language } from '../types';

interface Props {
  lang: Language;
  balance: number;
  departmentLevels: Record<DepartmentId, number>;
  onUpgradeDepartment: (department: DepartmentId) => boolean;
}

const DEPARTMENTS: Array<{
  id: DepartmentId;
  label: 'departmentArchive' | 'departmentField' | 'departmentLab';
  service: 'serviceArchive' | 'serviceClearance' | 'serviceExpert';
}> = [
  { id: 'archive', label: 'departmentArchive', service: 'serviceArchive' },
  { id: 'field', label: 'departmentField', service: 'serviceClearance' },
  { id: 'lab', label: 'departmentLab', service: 'serviceExpert' },
];

const nextEffectKey = (level: number) => {
  if (level <= 0) return 'departmentEffectUnlock' as const;
  if (level === 1) return 'departmentEffectDiscount' as const;
  if (level === 2) return 'departmentEffectFree' as const;
  return 'departmentMaxed' as const;
};

export function DepartmentPlan({
  lang,
  balance,
  departmentLevels,
  onUpgradeDepartment,
}: Props) {
  const fmt = (n: number) => n.toLocaleString('ru-RU');

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-[1px] text-text-dim">
          {t('departmentPlan', lang)}
        </div>
        <div className="rotate-[-4deg] border border-success px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-success">
          {t('approvedStamp', lang)}
        </div>
      </div>

      <div className="space-y-2">
        {DEPARTMENTS.map((department) => {
          const level = departmentLevels[department.id];
          const cost = GAME_CONFIG.departments[department.id][level];
          const maxed = cost == null;
          const affordable = cost != null && balance >= cost;

          return (
            <div
              key={department.id}
              className="rounded-[7px] border border-border bg-surface-2 p-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-text-light">
                    {t(department.label, lang)}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-snug text-text-dim">
                    {t(department.service, lang)} · {t(nextEffectKey(level), lang)}
                  </div>
                </div>
                <div className="shrink-0 font-mono text-[11px] font-bold text-accent">
                  {t('levelShort', lang)} {level}/3
                </div>
              </div>

              <motion.button
                type="button"
                disabled={maxed || !affordable}
                onClick={() => onUpgradeDepartment(department.id)}
                whileTap={!maxed && affordable ? { scale: 0.96 } : undefined}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                className={`mt-2 h-9 w-full rounded-[7px] text-[12px] font-bold transition-colors ${
                  maxed
                    ? 'cursor-default bg-surface text-text-dim'
                    : affordable
                      ? 'bg-accent text-white hover:brightness-110'
                      : 'cursor-not-allowed bg-surface text-text-dim'
                }`}
              >
                {maxed
                  ? t('departmentMaxed', lang)
                  : `${t('upgradeDepartment', lang)} · $ ${fmt(cost)}`}
              </motion.button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-border bg-paper p-3.5">
      {children}
    </div>
  );
}
