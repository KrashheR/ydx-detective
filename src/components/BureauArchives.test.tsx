import { describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { BureauArchiveDetail } from "./BureauArchives";
import { THEMATIC_PACKS, getThematicPackCases } from "../data/thematicPacks";
import { loc, t } from "../i18n/ui";
import { makeStats } from "../test/fixtures";
import type { PlayerStats } from "../types";

/**
 * The sealed tile is the archive page's main commercial surface: it used to be
 * inert, and the redesign made it the entry point of the purchase dialog. These
 * tests pin that path — what the tile does, what the dialog offers, and that the
 * dialog itself never charges anything, it only calls back out.
 */
const pack = THEMATIC_PACKS[0]!;
const cases = getThematicPackCases(pack);

function renderDetail(
  overrides: {
    stats?: Partial<PlayerStats>;
    onSelectCase?: () => void;
    onPurchase?: () => void;
    onUnlockWithAd?: (caseData: { id: string }) => void;
    rewardedSpentToday?: boolean;
  } = {},
) {
  const props = {
    onSelectCase: vi.fn(overrides.onSelectCase),
    onPurchase: vi.fn(overrides.onPurchase),
    onUnlockWithAd: vi.fn(overrides.onUnlockWithAd),
  };
  render(
    <BureauArchiveDetail
      pack={pack}
      packIndex={0}
      lang="ru"
      stats={makeStats(overrides.stats)}
      unlockByCaseId={new Map()}
      priceLabel={() => "99 ₽"}
      purchaseBusy={false}
      paymentsAvailable
      rewardedSpentToday={overrides.rewardedSpentToday ?? false}
      onBack={vi.fn()}
      onSelectCase={props.onSelectCase}
      onPurchase={props.onPurchase}
      onUnlockWithAd={props.onUnlockWithAd}
    />,
  );
  return props;
}

/** The tile of a still-sealed file — case 02, never the free sample. */
function lockedTile() {
  return screen.getByRole("button", {
    name: new RegExp(escapeRe(loc(cases[1]!.title, "ru"))),
  });
}

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("archive page — sealed file", () => {
  it("opens the purchase dialog instead of doing nothing", () => {
    renderDetail();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(lockedTile());

    const dialog = screen.getByRole("dialog");
    // The dialog must say which file was pressed *and* that the offer is the
    // whole archive — that is the whole point of confirming before payment.
    expect(dialog).toHaveTextContent(loc(cases[1]!.title, "ru"));
    expect(dialog).toHaveTextContent(
      t("archiveModalTitle", "ru").replace("{price}", "99 ₽"),
    );
  });

  it("plays an already open file rather than selling it", () => {
    const { onSelectCase, onPurchase } = renderDetail();
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(escapeRe(loc(cases[0]!.title, "ru"))),
      }),
    );
    expect(onSelectCase).toHaveBeenCalledTimes(1);
    expect(onPurchase).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hands the purchase to the platform and closes itself", async () => {
    const { onPurchase } = renderDetail();
    fireEvent.click(lockedTile());
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: new RegExp(escapeRe(t("archiveModalCta", "ru").split("{")[0]!)),
      }),
    );
    expect(onPurchase).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("offers the pressed case for a rewarded ad — not the next one in order", () => {
    const unlocked: string[] = [];
    const { onUnlockWithAd } = renderDetail({
      onUnlockWithAd: (caseData) => unlocked.push(caseData.id),
    });
    // Press the *third* file: the free path must open that one, even though the
    // page's own rewarded button would have opened case 02.
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(escapeRe(loc(cases[2]!.title, "ru"))),
      }),
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: t("archiveModalUnlockThisWithAd", "ru"),
      }),
    );
    expect(onUnlockWithAd).toHaveBeenCalledTimes(1);
    expect(unlocked).toEqual([cases[2]!.id]);
  });

  it("says the daily unlock is spent instead of pretending it is free", () => {
    renderDetail({ rewardedSpentToday: true });
    fireEvent.click(lockedTile());
    const spent = within(screen.getByRole("dialog")).getByRole("button", {
      name: t("nextUnlockTomorrow", "ru"),
    });
    expect(spent).toBeDisabled();
  });

  it("closes on Escape", async () => {
    renderDetail();
    fireEvent.click(lockedTile());
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("sells nothing once the archive is owned — every file is a tile you play", () => {
    const { onSelectCase } = renderDetail({
      stats: { archivePurchasedPackIds: [pack.id] },
    });
    fireEvent.click(lockedTile());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onSelectCase).toHaveBeenCalledTimes(1);
  });
});
