import { throttle } from "es-toolkit";

interface Phase<T extends string> {
  name: T;
  total: number;
}

interface PhaseTimer {
  start: number;
  /** Completed count when the timer started; ETA is derived from progress made since then */
  baseline: number;
}

export interface ActivePhase<T extends string = string> {
  name: T;
  etaSeconds: number | undefined;
}

/**
 * Tracks export progress across multiple phases with per-phase ETA.
 */
export class ExportProgressTracker<T extends string> {
  readonly #phases: readonly Phase<T>[];
  #counts = new Map<T, number>();
  #timers = new Map<T, PhaseTimer>();
  #onProgress: (progress: number, activePhase?: ActivePhase<T>) => void;

  constructor(
    phases: readonly Phase<T>[],
    onProgress: (progress: number, activePhase?: ActivePhase<T>) => void,
  ) {
    this.#phases = phases;
    this.#onProgress = onProgress;
  }

  /** Record the absolute completed count of a phase */
  set(phaseName: T, completed: number) {
    if (completed > 0 && !this.#timers.has(phaseName)) {
      this.#timers.set(phaseName, { start: performance.now(), baseline: completed });
    }
    this.#counts.set(phaseName, completed);
    this.#report();
  }

  get #totalWork() {
    return this.#phases.reduce((sum, p) => sum + p.total, 0);
  }

  #completed(phaseName: T) {
    return this.#counts.get(phaseName) ?? 0;
  }

  #report() {
    const totalDone = this.#phases.reduce((sum, p) => sum + this.#completed(p.name), 0);
    const progress = this.#totalWork > 0 ? totalDone / this.#totalWork : 0;
    this.#throttledReport(progress);
  }

  #throttledReport = throttle((progress: number) => {
    const active = this.#phases.filter((p) => {
      const done = this.#completed(p.name);
      return done > 0 && done < p.total;
    });

    const lastActive = active.at(-1);
    const activePhase: ActivePhase<T> | undefined = lastActive
      ? {
          name: lastActive.name,
          etaSeconds: this.#getEtaSeconds(
            lastActive.name,
            this.#completed(lastActive.name),
            lastActive.total,
          ),
        }
      : undefined;

    this.#onProgress(progress, activePhase);
  }, 500);

  #getEtaSeconds(phaseName: T, done: number, total: number): number | undefined {
    const timer = this.#timers.get(phaseName);
    if (timer === undefined) return undefined;
    const elapsed = (performance.now() - timer.start) / 1000;
    const progressed = done - timer.baseline;
    if (progressed <= 0 || elapsed <= 0) return undefined;
    return (total - done) / (progressed / elapsed);
  }
}
