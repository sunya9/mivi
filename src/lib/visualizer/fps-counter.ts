import { ObservableStore } from "@/lib/store/observable-store";

/**
 * Tracks rendered frames per second outside React so per-frame ticks never touch component
 * state. The value refreshes about once per second and notifies subscribers only when it changes.
 */
export class FpsCounter extends ObservableStore<number> {
  #frameCount = 0;
  #windowStart = 0;

  constructor() {
    super(0);
  }

  /** Call once per rendered frame */
  tick = (): void => {
    const now = performance.now();
    if (this.#windowStart === 0) {
      this.#windowStart = now;
    }
    this.#frameCount++;
    const elapsed = now - this.#windowStart;
    if (elapsed >= 1000) {
      this.setSnapshot(Math.round((this.#frameCount * 1000) / elapsed));
      this.#frameCount = 0;
      this.#windowStart = now;
    }
  };

  reset = (): void => {
    this.#frameCount = 0;
    this.#windowStart = 0;
    this.setSnapshot(0);
  };
}
