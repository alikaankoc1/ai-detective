export type { InvestigationStore } from "./store";
export {
  investigationStore,
  getOrCreateInvestigationState,
} from "./store";
export {
  getInvestigationState,
  discoverEvidence,
  markSuspectInterrogated,
  discoverContradiction,
  resetInvestigationState,
} from "./service";
export { DEFAULT_PLAYER_ID } from "./types";
