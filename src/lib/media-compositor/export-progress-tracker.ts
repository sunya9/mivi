import { throttle } from "es-toolkit";

interface PhaseConfig<T extends string> {
  name: T;
  total: number;
  /** Return actual completed count (may differ from reported count due to async queues) */
  getCompleted?: () => number;
}

interface PhaseTimer {
  start: number;
  /** Completed count when the timer started; ETA is derived from progress made since then */
  baseline: number;
}

export interface ActivePhase {
  name: string;
  eta: string;
}

/**
 * Tracks export progress across multiple phases with per-phase ETA.
 */
export class ExportProgressTracker<T extends string> {
  #phases: PhaseConfig<T>[] = [];
  #counts = new Map<T, number>();
  #timers = new Map<T, PhaseTimer>();
  #onProgress: (progress: number, activePhase?: ActivePhase) => void;

  constructor(onProgress: (progress: number, activePhase?: ActivePhase) => void) {
    this.#onProgress = onProgress;
  }

  addPhase(phase: PhaseConfig<T>) {
    this.#phases.push(phase);
    this.#counts.set(phase.name, 0);
  }

  /** Increment progress for a phase by 1 */
  increment(phaseName: T) {
    this.#autoStartTimer(phaseName);
    const current = this.#counts.get(phaseName) ?? 0;
    this.#counts.set(phaseName, current + 1);
    this.#report();
  }

  /** Set absolute progress for a phase */
  set(phaseName: T, value: number) {
    this.#autoStartTimer(phaseName);
    this.#counts.set(phaseName, value);
    this.#report();
  }

  /** Mark a phase as complete (set to total) */
  complete(phaseName: T) {
    const phase = this.#phases.find((p) => p.name === phaseName);
    if (phase) {
      this.#counts.set(phaseName, phase.total);
      this.#report();
    }
  }

  /** Trigger a report (e.g., from external dequeue events) */
  notify() {
    this.#report();
  }

  #autoStartTimer(phaseName: T) {
    if (this.#timers.has(phaseName)) return;
    const phase = this.#phases.find((p) => p.name === phaseName);
    if (!phase) return;
    this.#timers.set(phaseName, {
      start: performance.now(),
      baseline: this.#getPhaseCompleted(phase),
    });
  }

  get #totalWork() {
    return this.#phases.reduce((sum, p) => sum + p.total, 0);
  }

  #getPhaseCompleted(phase: PhaseConfig<T>): number {
    if (phase.getCompleted) return phase.getCompleted();
    return this.#counts.get(phase.name) ?? 0;
  }

  #report = () => {
    for (const phase of this.#phases) {
      if (!this.#timers.has(phase.name) && this.#getPhaseCompleted(phase) > 0) {
        this.#autoStartTimer(phase.name);
      }
    }
    const totalDone = this.#phases.reduce((sum, p) => sum + this.#getPhaseCompleted(p), 0);
    const progress = this.#totalWork > 0 ? totalDone / this.#totalWork : 0;
    this.#throttledReport(progress);
  };

  #throttledReport = throttle((progress: number) => {
    const active = this.#phases.filter((p) => {
      const done = this.#getPhaseCompleted(p);
      return done > 0 && done < p.total;
    });

    const lastActive = active.at(-1);
    const activePhase: ActivePhase | undefined = lastActive
      ? {
          name: lastActive.name,
          eta: this.#getEta(lastActive.name, this.#getPhaseCompleted(lastActive), lastActive.total),
        }
      : undefined;

    this.#onProgress(progress, activePhase);
  }, 500);

  #getEta(phaseName: T, done: number, total: number): string {
    if (total === 0 || done === 0) return "--";
    const timer = this.#timers.get(phaseName);
    if (timer === undefined) return "--";
    const elapsed = (performance.now() - timer.start) / 1000;
    const progressed = done - timer.baseline;
    if (progressed <= 0 || elapsed <= 0) return "--";
    const eta = (total - done) / (progressed / elapsed);
    // Ceil so the countdown never shows 0s while work remains
    const totalSec = Math.ceil(eta);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min === 0) return `${sec}s`;
    return `${min}m${sec.toString().padStart(2, "0")}s`;
  }
}
