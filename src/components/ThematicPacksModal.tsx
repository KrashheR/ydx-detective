import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  THEMATIC_PACKS,
  getThematicPackCaseIds,
  getThematicPackCases,
  type ThematicPack,
} from "../data/thematicPacks";
import { RTL_LANGUAGES, loc, t } from "../i18n/ui";
import type { CaseUnlockInfo } from "../engine/caseUnlockEngine";
import type { Case, Language, PlayerStats } from "../types";
import { getServerTimeMs, type PaymentsProduct } from "../services/yandexSDK";

interface Props {
  lang: Language;
  stats: PlayerStats;
  caseUnlocks?: readonly CaseUnlockInfo[];
  paymentsAvailable: boolean;
  catalogByProductId: Record<string, PaymentsProduct>;
  onSelectCase: (caseData: Case) => void;
  onPurchasePack: (pack: ThematicPack) => Promise<boolean>;
  onRestorePurchases: () => Promise<number>;
  onUnlockCaseWithAd: (packId: string, caseId: string) => boolean;
  onClose: () => void;
}

const PACK_ACCENTS: Record<
  ThematicPack["accent"],
  {
    cover: string;
    spine: string;
    stamp: string;
    tabDot: string;
  }
> = {
  archive: {
    cover: "bg-folder border-folder-edge",
    spine: "bg-folder-edge",
    stamp: "bg-stamp border-stamp text-paper",
    tabDot: "bg-folder",
  },
  polar: {
    cover: "bg-success/35 border-success",
    spine: "bg-success",
    stamp: "bg-success border-success text-paper",
    tabDot: "bg-success",
  },
  cliff: {
    cover: "bg-surface-2 border-accent",
    spine: "bg-accent",
    stamp: "bg-accent border-accent text-paper",
    tabDot: "bg-accent",
  },
};

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  ru: "ru-RU",
  en: "en-US",
  tr: "tr-TR",
  ar: "ar-EG",
  kk: "kk-KZ",
};

type ArchiveCaseStatus = "completed" | "available" | "locked";

type UnlockByCaseId = ReadonlyMap<string, CaseUnlockInfo>;

function formatCurrency(value: number, lang: Language): string {
  return new Intl.NumberFormat(LOCALE_BY_LANGUAGE[lang], {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function isPackPurchased(stats: PlayerStats, packId: string): boolean {
  return stats.archivePurchasedPackIds.includes(packId);
}

function isCaseUnlockedByArchive(
  stats: PlayerStats,
  pack: ThematicPack,
  caseId: string,
  index: number,
): boolean {
  return (
    isPackPurchased(stats, pack.id) ||
    index === 0 ||
    stats.archiveUnlockedCaseIds.includes(caseId)
  );
}

function getArchiveCaseStatus(
  stats: PlayerStats,
  pack: ThematicPack,
  caseId: string,
  index: number,
  unlockByCaseId: UnlockByCaseId,
): ArchiveCaseStatus {
  const unlock = unlockByCaseId.get(caseId);
  if (unlock) {
    if (unlock.status === "completed") return "completed";
    if (unlock.status === "available") return "available";
  }

  return isCaseUnlockedByArchive(stats, pack, caseId, index)
    ? "available"
    : "locked";
}

function countAccessibleArchiveCases(
  stats: PlayerStats,
  pack: ThematicPack,
  unlockByCaseId: UnlockByCaseId,
): number {
  return getThematicPackCases(pack).filter(
    (caseData, index) =>
      getArchiveCaseStatus(stats, pack, caseData.id, index, unlockByCaseId) !==
      "locked",
  ).length;
}

function getNextRewardedCase(
  stats: PlayerStats,
  pack: ThematicPack,
  unlockByCaseId: UnlockByCaseId,
): Case | null {
  return (
    getThematicPackCases(pack).find(
      (caseData, index) =>
        getArchiveCaseStatus(
          stats,
          pack,
          caseData.id,
          index,
          unlockByCaseId,
        ) === "locked",
    ) ?? null
  );
}

function getPackStatusLabel(
  stats: PlayerStats,
  pack: ThematicPack,
  lang: Language,
): string {
  if (isPackPurchased(stats, pack.id)) return t("purchased", lang);
  return pack.status === "preview"
    ? t("newArchive", lang)
    : t("firstCaseFree", lang);
}

function getPackPriceLabel(
  pack: ThematicPack,
  catalogByProductId: Record<string, PaymentsProduct>,
  lang: Language,
): string {
  const product = catalogByProductId[pack.productId];
  return product?.price ?? formatCurrency(pack.fallbackPriceRub, lang);
}

function PackSpine({
  pack,
  className = "",
}: {
  pack: ThematicPack;
  className?: string;
}) {
  const accent = PACK_ACCENTS[pack.accent];
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[3px] border shadow-card ${accent.cover} ${className}`}
      aria-hidden
    >
      <span
        className={`absolute inset-y-0 w-[22%] ${accent.spine}`}
        style={{ insetInlineStart: 0 }}
      />
      <span className="absolute inset-x-[34%] top-[18%] h-[2px] rounded bg-folder-ink-soft/40" />
      <span className="absolute inset-x-[34%] top-[28%] h-[2px] rounded bg-folder-ink-soft/25" />
    </div>
  );
}

function SelectedPackHeader({
  pack,
  lang,
}: {
  pack: ThematicPack;
  lang: Language;
}) {
  const accent = PACK_ACCENTS[pack.accent];
  return (
    <section className="border-b border-border px-4 py-3.5 md:px-5 md:py-4">
      <div className="flex items-start gap-3.5">
        <PackSpine pack={pack} className="h-14 w-11" />
        <div className="min-w-0">
          <div className="truncate font-serif text-[19px] font-bold leading-tight text-ink md:text-[20px]">
            {loc(pack.title, lang)}
          </div>
          <p className="mt-1.5 max-w-[520px] text-[12.5px] leading-[1.5] text-text-light md:text-[13px]">
            {loc(pack.hook, lang)}
          </p>
          <div
            className={`mt-2 inline-flex rounded-[4px] border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[.1em] ${accent.stamp}`}
          >
            {loc(pack.stampTitle, lang)}
          </div>
        </div>
      </div>
    </section>
  );
}

function PackListItem({
  pack,
  lang,
  stats,
  unlockByCaseId,
  selected,
  onSelect,
}: {
  pack: ThematicPack;
  lang: Language;
  stats: PlayerStats;
  unlockByCaseId: UnlockByCaseId;
  selected: boolean;
  onSelect: () => void;
}) {
  const openedCases = countAccessibleArchiveCases(stats, pack, unlockByCaseId);
  const totalCases = getThematicPackCaseIds(pack).length;
  const accent = PACK_ACCENTS[pack.accent];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full min-h-[54px] overflow-hidden rounded-[7px] border text-start transition-colors ${
        selected
          ? "border-[1.5px] border-accent bg-paper"
          : "border-border bg-transparent hover:border-accent/60 hover:bg-paper/45"
      }`}
    >
      <span className={`w-2 shrink-0 ${accent.spine}`} aria-hidden />
      <span className="min-w-0 flex-1 px-3 py-2.5">
        <span className="block truncate font-serif text-[13px] font-bold leading-tight text-ink">
          {loc(pack.title, lang)}
        </span>
        <span className="mt-1 flex items-center justify-between gap-2">
          <span className="font-mono text-[9px] font-semibold text-text-muted">
            {t("openedCases", lang)
              .replace("{opened}", String(openedCases))
              .replace("{total}", String(totalCases))}
          </span>
          <span
            className={`rounded-[3px] border px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[.06em] ${
              selected
                ? "border-accent text-accent"
                : "border-border text-text-muted"
            }`}
          >
            {getPackStatusLabel(stats, pack, lang)}
          </span>
        </span>
      </span>
    </button>
  );
}

function PackMobileTab({
  pack,
  lang,
  selected,
  onSelect,
}: {
  pack: ThematicPack;
  lang: Language;
  selected: boolean;
  onSelect: () => void;
}) {
  const accent = PACK_ACCENTS[pack.accent];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
        selected
          ? "border-paper/55 bg-paper/20 text-paper"
          : "border-paper/20 text-paper/80 opacity-80"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${accent.tabDot}`} />
      <span className="max-w-[132px] truncate text-[11px] font-semibold">
        {loc(pack.title, lang)}
      </span>
    </button>
  );
}

function CaseStateIcon({
  index,
  status,
}: {
  index: number;
  status: ArchiveCaseStatus;
}) {
  if (status === "completed") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-success bg-success/10 font-mono text-[11px] font-bold text-success">
        OK
      </span>
    );
  }

  if (status === "available") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-accent bg-accent/10 font-mono text-[11px] font-bold text-accent">
        {index + 1}
      </span>
    );
  }

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border bg-surface-2 font-mono text-[11px] font-bold text-text-dim">
      {index + 1}
    </span>
  );
}

function getArchiveCaseStatusLabel(
  status: ArchiveCaseStatus,
  lang: Language,
): string {
  if (status === "completed") return t("completedCase", lang);
  if (status === "available") return t("availableStatus", lang);
  return t("lockedStatus", lang);
}

function getArchiveCaseStatusTone(status: ArchiveCaseStatus): string {
  if (status === "completed") return "text-success";
  if (status === "available") return "text-accent";
  return "text-text-dim";
}

function ArchiveCaseRow({
  caseData,
  index,
  status,
  lang,
  onSelect,
}: {
  caseData: Case;
  index: number;
  status: ArchiveCaseStatus;
  lang: Language;
  onSelect: () => void;
}) {
  const canOpen = status !== "locked";
  return (
    <button
      type="button"
      disabled={!canOpen}
      onClick={() => canOpen && onSelect()}
      className={`flex min-h-[50px] w-full items-center gap-3 rounded-[8px] border px-3 py-2.5 text-start transition-colors md:px-3.5 ${
        status === "completed"
          ? "border-success bg-paper"
          : status === "available"
            ? "border-[1.5px] border-accent bg-paper hover:bg-accent/10"
            : "border-border bg-surface-2/60 opacity-75"
      } ${!canOpen ? "cursor-default" : ""}`}
    >
      <CaseStateIcon index={index} status={status} />
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate font-serif text-[13px] font-semibold ${
            canOpen ? "text-ink" : "text-text-muted"
          }`}
        >
          {loc(caseData.title, lang)}
        </span>
        <span
          className={`mt-0.5 block truncate font-mono text-[9px] font-semibold uppercase tracking-[.04em] ${getArchiveCaseStatusTone(status)}`}
        >
          {index + 1} - {getArchiveCaseStatusLabel(status, lang)} -{" "}
          {formatCurrency(caseData.claimAmount, lang)}
        </span>
      </span>
      {canOpen ? (
        <span
          className={`shrink-0 rounded-[6px] px-3 py-2 text-[11px] font-bold text-paper ${
            status === "completed" ? "bg-success" : "bg-accent"
          }`}
        >
          {t("openCaseAction", lang)}
        </span>
      ) : (
        <span className="shrink-0 font-mono text-[13px] text-text-dim" aria-hidden>
          #
        </span>
      )}
    </button>
  );
}

export function ThematicPacksModal({
  lang,
  stats,
  caseUnlocks = [],
  paymentsAvailable,
  catalogByProductId,
  onSelectCase,
  onPurchasePack,
  onRestorePurchases,
  onUnlockCaseWithAd,
  onClose,
}: Props) {
  const [selectedId, setSelectedId] = useState(THEMATIC_PACKS[0]?.id ?? "");
  const [busyAction, setBusyAction] = useState<
    "purchase" | "restore" | "unlock" | null
  >(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = useMemo(
    () =>
      THEMATIC_PACKS.find((pack) => pack.id === selectedId) ??
      THEMATIC_PACKS[0],
    [selectedId],
  );
  const unlockByCaseId = useMemo(
    () => new Map(caseUnlocks.map((info) => [info.caseData.id, info])),
    [caseUnlocks],
  );
  const selectedCases = useMemo(
    () => (selected ? getThematicPackCases(selected) : []),
    [selected],
  );
  const selectedOpenedCases = selected
    ? countAccessibleArchiveCases(stats, selected, unlockByCaseId)
    : 0;
  const selectedTotalCases = selectedCases.length;
  const nextRewardedCase = selected
    ? getNextRewardedCase(stats, selected, unlockByCaseId)
    : null;
  const isRTL = RTL_LANGUAGES.has(lang);
  const purchased = selected ? isPackPurchased(stats, selected.id) : false;
  const today = Math.floor(getServerTimeMs() / (24 * 60 * 60 * 1000));
  const rewardedSpentToday = selected
    ? stats.archiveAdUnlockServerDayByPack[selected.id] === today
    : false;

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  if (!selected) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/75 p-0 md:flex md:items-center md:justify-center md:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex h-full w-full flex-col overflow-hidden border-border bg-surface shadow-modal md:h-auto md:max-h-[min(92vh,820px)] md:max-w-[820px] md:rounded-[12px] md:border"
        initial={{ y: 18, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.2, 0.9, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="special-archives-title"
      >
        <div className="bg-folder-edge px-4 py-3.5 text-paper md:px-5 md:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-folder-edge bg-folder text-[13px] font-bold text-folder-ink">
                AR
              </div>
              <div className="min-w-0">
                <h2
                  id="special-archives-title"
                  className="truncate font-serif text-[18px] font-bold leading-tight md:text-[17px]"
                >
                  {t("specialArchives", lang)}
                </h2>
                <p className="mt-1 truncate font-mono text-[8px] font-semibold uppercase tracking-[.14em] text-paper/70 md:text-[9px]">
                  {t("specialArchivesSubtitle", lang)}
                </p>
              </div>
            </div>
            <div className="hidden shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[.06em] text-paper/75 sm:block">
              {t("openedCases", lang)
                .replace("{opened}", String(selectedOpenedCases))
                .replace("{total}", String(selectedTotalCases))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-paper/25 bg-paper/10 text-[18px] text-paper transition-colors hover:bg-paper/20"
              aria-label={t("close", lang)}
            >
              x
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 md:hidden">
            {THEMATIC_PACKS.map((pack) => (
              <PackMobileTab
                key={pack.id}
                pack={pack}
                lang={lang}
                selected={pack.id === selected.id}
                onSelect={() => setSelectedId(pack.id)}
              />
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:min-h-[480px] md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="hidden min-h-0 flex-col border-r border-border bg-surface-2 px-3 py-3.5 md:flex">
            <div className="mb-2 px-1 font-mono text-[9px] font-semibold uppercase tracking-[.16em] text-text-muted">
              {t("specialArchives", lang)}
            </div>
            <div className="flex min-h-0 flex-col gap-1.5 overflow-y-auto pb-3">
              {THEMATIC_PACKS.map((pack) => (
                <PackListItem
                  key={pack.id}
                  pack={pack}
                  lang={lang}
                  stats={stats}
                  unlockByCaseId={unlockByCaseId}
                  selected={pack.id === selected.id}
                  onSelect={() => setSelectedId(pack.id)}
                />
              ))}
            </div>
            <div className="mt-auto border-t border-border pt-3">
              <div className="rounded-[7px] border border-accent px-3 py-2 text-center text-[11px] font-semibold text-accent">
                {t("purchasedArchivesNoForcedAds", lang)}
              </div>
              <div className="mt-1.5 text-center font-mono text-[9px] text-text-muted">
                {t("restorePurchases", lang)}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-surface">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SelectedPackHeader pack={selected} lang={lang} />

              {notice && (
                <div className="mx-4 mt-3 rounded-[8px] border border-accent/35 bg-accent/10 px-3 py-2 text-[12px] leading-snug text-ink md:mx-5">
                  {notice}
                </div>
              )}

              <section className="px-4 py-3.5 md:px-5">
                <div className="mb-2.5 flex items-baseline gap-2">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[.16em] text-text-muted">
                    {t("includedCases", lang)}
                  </span>
                  <span className="font-mono text-[9px] font-semibold text-accent">
                    {selectedOpenedCases} / {selectedTotalCases}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {selectedCases.map((caseData, index) => {
                    const status = getArchiveCaseStatus(
                      stats,
                      selected,
                      caseData.id,
                      index,
                      unlockByCaseId,
                    );
                    return (
                      <ArchiveCaseRow
                        key={caseData.id}
                        caseData={caseData}
                        index={index}
                        status={status}
                        lang={lang}
                        onSelect={() => onSelectCase(caseData)}
                      />
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="shrink-0 border-t border-border bg-surface-2 px-4 py-3 md:px-5 md:py-3.5">
                <div
                  className={`flex flex-col gap-2 md:flex-row ${
                    isRTL ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <button
                    type="button"
                    disabled={
                      busyAction !== null || purchased || !paymentsAvailable
                    }
                    onClick={async () => {
                      setBusyAction("purchase");
                      const ok = await onPurchasePack(selected);
                      setBusyAction(null);
                      setNotice(
                        ok
                          ? t("purchased", lang)
                          : t("platformUnavailable", lang),
                      );
                    }}
                    className="min-h-[48px] flex-1 rounded-[8px] bg-accent px-4 text-[14px] font-bold text-paper disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {purchased
                      ? t("purchased", lang)
                      : `${t("buyArchive", lang)} - ${getPackPriceLabel(selected, catalogByProductId, lang)}`}
                  </button>
                  <button
                    type="button"
                    disabled={
                      busyAction !== null ||
                      purchased ||
                      nextRewardedCase == null ||
                      rewardedSpentToday
                    }
                    onClick={() => {
                      if (!nextRewardedCase) return;
                      setBusyAction("unlock");
                      const started = onUnlockCaseWithAd(
                        selected.id,
                        nextRewardedCase.id,
                      );
                      setBusyAction(null);
                      if (!started) setNotice(t("adUnavailableTryLater", lang));
                    }}
                    className="min-h-[48px] flex-1 rounded-[8px] border-[1.5px] border-accent bg-transparent px-4 text-[13px] font-bold text-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {rewardedSpentToday
                      ? t("nextUnlockTomorrow", lang)
                      : t("unlockNextWithAd", lang)}
                  </button>
                </div>
                <div className="mt-2.5 flex flex-col gap-2 font-mono text-[10px] leading-snug text-text-muted md:flex-row md:items-center md:justify-between">
                  <span>
                    {purchased || nextRewardedCase == null
                      ? t("unlockForeverHint", lang)
                      : `${t("unlockForeverHint", lang)} ${loc(nextRewardedCase.title, lang)}.`}
                  </span>
                  <button
                    type="button"
                    disabled={busyAction !== null || !paymentsAvailable}
                    onClick={async () => {
                      setBusyAction("restore");
                      const restored = await onRestorePurchases();
                      setBusyAction(null);
                      setNotice(
                        restored > 0
                          ? t("purchaseRestored", lang)
                          : t("platformUnavailable", lang),
                      );
                    }}
                    className="p-0 text-start text-[11px] font-semibold text-accent underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t("restorePurchases", lang)}
                  </button>
                </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
