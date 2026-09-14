import type { SolveAttemptRecord } from "./types";
import { DEFAULT_PLAYER_ID } from "../investigation/types";

function key(caseId: string, playerId: string): string {
  return `${playerId}::${caseId}`;
}

/**
 * Memory store for solve attempts.
 * Supabase'e geçerken aynı arayüz korunabilir.
 */
class MemorySolveStore {
  private readonly latest = new Map<string, SolveAttemptRecord>();
  private readonly history: SolveAttemptRecord[] = [];

  save(record: SolveAttemptRecord): void {
    this.latest.set(key(record.caseId, record.playerId), record);
    this.history.push(record);
  }

  getLatest(
    caseId: string,
    playerId: string = DEFAULT_PLAYER_ID
  ): SolveAttemptRecord | null {
    return this.latest.get(key(caseId, playerId)) ?? null;
  }
}

export const solveStore = new MemorySolveStore();
