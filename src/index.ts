/** Public engine surface for the React layer. */
export * from './types';
export { GAME_CONFIG } from './config/gameConfig';
export { parseCase, safeParseCases, caseSchema } from './data/caseSchema';
export {
  getAllCases,
  getCaseById,
  getStandardCases,
  getDailyCase,
} from './data/caseLoader';
export {
  evaluateReward,
  evaluateDailyAvailability,
  totalContradictions,
  classifyStamps,
} from './engine/rewardEngine';
export { useGameStore, selectCaseInvestigationGate } from './store/gameStore';
export { t, loc, UI_STRINGS } from './i18n/ui';
export {
  initYandex,
  getServerTimeMs,
  showRewardedAd,
  showFullscreenAd,
  onPauseChange,
} from './services/yandexSDK';
