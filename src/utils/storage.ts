/**
 * Lightweight persistence for lab progress.
 *
 * Completed scenarios lived in React state only, so a refresh wiped every
 * experiment the player had solved. Versioned so a future shape change discards
 * old payloads rather than half-restoring them.
 */

const STORAGE_KEY = 'mind-model:progress';
const STORAGE_VERSION = 1;

export interface ProgressState {
  completedScenarioIds: string[];
  lastScenarioId: string | null;
}

export function loadProgress(): ProgressState | null {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== STORAGE_VERSION) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.data as ProgressState;
  } catch {
    return null; // storage disabled, private mode, or corrupt payload
  }
}

export function saveProgress(data: ProgressState): void {
  try {
    window.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, savedAt: new Date().toISOString(), data })
    );
  } catch {
    /* quota or storage unavailable — the lab still works, it just won't persist */
  }
}

export function clearProgress(): void {
  try { window.localStorage?.removeItem(STORAGE_KEY); } catch { /* no-op */ }
}
