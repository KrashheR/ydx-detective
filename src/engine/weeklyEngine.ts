import { GAME_CONFIG } from '../config/gameConfig';
import type { Case, MasteryLevel, WeeklyProgress, WeeklyTaskId } from '../types';

export function makeWeeklyProgress(serverWeek: number): WeeklyProgress {
  return {
    serverWeek,
    countedCaseIds: [],
    correctCount: 0,
    perfectCount: 0,
    noHintsCount: 0,
    efficientCount: 0,
    difficulties: [],
    completedTaskIds: [],
    rewardClaimed: false,
  };
}

export function updateWeeklyProgress(args: {
  current: WeeklyProgress | null;
  serverMs: number;
  caseData: Case;
  mastery: MasteryLevel;
  verdictCorrect: boolean;
  hintsUsed: number;
  opensUsed: number;
}): WeeklyProgress {
  const week = Math.floor(args.serverMs / GAME_CONFIG.weekly.msPerWeek);
  const base = args.current?.serverWeek === week ? args.current : makeWeeklyProgress(week);
  if (base.countedCaseIds.includes(args.caseData.id)) return base;

  const next: WeeklyProgress = {
    ...base,
    countedCaseIds: [...base.countedCaseIds, args.caseData.id],
    correctCount: base.correctCount + (args.verdictCorrect ? 1 : 0),
    perfectCount: base.perfectCount + (args.mastery === 'silver' || args.mastery === 'gold' ? 1 : 0),
    noHintsCount: base.noHintsCount + (args.hintsUsed === 0 ? 1 : 0),
    efficientCount: base.efficientCount +
      (args.caseData.investigationBudget != null && args.opensUsed < args.caseData.investigationBudget ? 1 : 0),
    difficulties: base.difficulties.includes(args.caseData.difficulty)
      ? base.difficulties
      : [...base.difficulties, args.caseData.difficulty],
  };
  const completed: WeeklyTaskId[] = [];
  if (next.correctCount >= 3) completed.push('correct_3');
  if (next.perfectCount >= 2) completed.push('perfect_2');
  if (next.noHintsCount >= 2) completed.push('no_hints_2');
  if (next.efficientCount >= 1) completed.push('efficient_1');
  if (next.difficulties.length >= 3) completed.push('variety_3');
  return { ...next, completedTaskIds: completed };
}
