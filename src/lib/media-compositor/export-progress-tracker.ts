import { throttle } from "throttle-debounce";

interface PhaseConfig<T extends string> {
  name: T;
  total: number;
  /** Return actual completed count (may differ from reported count due to async queues) */
  getCompleted?: () => number;
  /** If true, timer won't auto-start on increment/set. Call startTimer() explicitly. */
  deferTimer?: boolean;
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
  #phaseStartTimes = new Map<T, number>();
  #onProgress: (progress: number, activePhase?: ActivePhase) => void;

  constructor(onProgress: (progress: number, activePhase?: ActivePhase) => void) {
    this.#onProgress = onProgress;
  }

  addPhase(phase: PhaseConfig<T>) {
    this.#phases.push(phase);
    this.#counts.set(phase.name, 0);
  }

  /** Explicitly start the timer for a phase (for deferred phases) */
  startTimer(phaseName: T) {
    this.#phaseStartTimes.set(phaseName, performance.now());
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
    if (this.#phaseStartTimes.has(phaseName)) return;
    const phase = this.#phases.find((p) => p.name === phaseName);
    if (phase?.deferTimer) return;
    this.#phaseStartTimes.set(phaseName, performance.now());
  }

  get #totalWork() {
    return this.#phases.reduce((sum, p) => sum + p.total, 0);
  }

  #getPhaseCompleted(phase: PhaseConfig<T>): number {
    if (phase.getCompleted) return phase.getCompleted();
    return this.#counts.get(phase.name) ?? 0;
  }

  #report = () => {
    const totalDone = this.#phases.reduce((sum, p) => sum + this.#getPhaseCompleted(p), 0);
    const progress = this.#totalWork > 0 ? totalDone / this.#totalWork : 0;
    this.#throttledLog(progress);
  };

  #throttledLog = throttle(500, (progress: number) => {
    const active = this.#phases.filter((p) => {
      const done = this.#getPhaseCompleted(p);
      return done > 0 && done < p.total;
    });

    const details = active
      .map((p) => {
        const done = this.#getPhaseCompleted(p);
        const pct = ((done / p.total) * 100).toFixed(1);
        const eta = this.#getEta(p.name, done, p.total);
        return `${p.name}: ${pct}% (ETA ${eta})`;
      })
      .join(" | ");

    // Pick the most relevant active phase (last one = furthest in pipeline)
    const lastActive = active.at(-1);
    const activePhase: ActivePhase | undefined = lastActive
      ? {
          name: lastActive.name,
          eta: this.#getEta(lastActive.name, this.#getPhaseCompleted(lastActive), lastActive.total),
        }
      : undefined;

    console.log(
      `Export ${(progress * 100).toFixed(1)}%`,
      details ? `[${details}]` : "[Finalizing]",
    );
    this.#onProgress(progress, activePhase);
  });

  #getEta(phaseName: T, done: number, total: number): string {
    if (total === 0 || done === 0) return "--";
    const startTime = this.#phaseStartTimes.get(phaseName);
    if (startTime === undefined) return "--";
    const elapsed = (performance.now() - startTime) / 1000;
    const ratio = done / total;
    const eta = (elapsed / ratio) * (1 - ratio);
    const min = Math.floor(eta / 60);
    const sec = Math.floor(eta % 60);
    return `${min}m${sec.toString().padStart(2, "0")}s`;
  }
}
