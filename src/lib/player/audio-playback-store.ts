import { type StorageRepository } from "@/lib/storage/storage-repository";

/** Immutable snapshot of playback state */
export interface PlaybackSnapshot {
  readonly audioBuffer: AudioBuffer | undefined;
  readonly isPlaying: boolean;
  readonly position: number;
  readonly duration: number;
  readonly volume: number;
  readonly muted: boolean;
}

/**
 * External store for audio playback state.
 * Encapsulates AudioContext, GainNode, AudioBuffer, and playback state management.
 * Uses the subscriber pattern for integration with useSyncExternalStore.
 */

const volumeKey = "mivi:volume";
const mutedKey = "mivi:muted";
export class AudioPlaybackStore {
  readonly #audioContext: AudioContext;
  readonly #gainNode: GainNode;
  readonly #storage: StorageRepository;
  #audioBuffer: AudioBuffer | undefined = undefined;
  #source: AudioBufferSourceNode | null = null;
  #startedAt: number = 0;
  #position: number = 0;
  #volume: number;
  #muted: boolean;
  #listeners: Set<() => void> = new Set();
  #snapshot: PlaybackSnapshot;

  constructor(audioContext: AudioContext, storage: StorageRepository) {
    this.#audioContext = audioContext;
    this.#gainNode = audioContext.createGain();
    this.#gainNode.connect(audioContext.destination);
    this.#storage = storage;
    // Load initial values from storage
    this.#volume = storage.get(volumeKey, 1);
    this.#muted = storage.get(mutedKey, false);
    this.#snapshot = {
      audioBuffer: undefined,
      isPlaying: false,
      position: 0,
      duration: 0,
      volume: this.#volume,
      muted: this.#muted,
    };
  }

  /** Subscribe to state changes */
  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  /** Get current snapshot (must return same reference if unchanged) */
  getSnapshot = (): PlaybackSnapshot => {
    return this.#snapshot;
  };

  #updateSnapshot(): void {
    const newSnapshot: PlaybackSnapshot = {
      audioBuffer: this.#audioBuffer,
      isPlaying: this.#source !== null,
      position: this.#position,
      duration: this.#audioBuffer?.duration ?? 0,
      volume: this.#volume,
      muted: this.#muted,
    };
    // Only update if changed to maintain referential equality
    if (
      newSnapshot.audioBuffer !== this.#snapshot.audioBuffer ||
      newSnapshot.isPlaying !== this.#snapshot.isPlaying ||
      newSnapshot.position !== this.#snapshot.position ||
      newSnapshot.duration !== this.#snapshot.duration ||
      newSnapshot.volume !== this.#snapshot.volume ||
      newSnapshot.muted !== this.#snapshot.muted
    ) {
      this.#snapshot = newSnapshot;
      this.#listeners.forEach((listener) => listener());
    }
  }

  #applyGain(): void {
    const now = this.#audioContext.currentTime;
    this.#gainNode.gain.cancelScheduledValues(now);
    const calculatedVolume = this.#muted
      ? 0
      : Math.max(0, Math.min(1, this.#volume));
    this.#gainNode.gain.setTargetAtTime(calculatedVolume, now, 0);
  }

  /** Get current position (synchronous access) */
  getPosition = (): number => this.#position;

  /** Sets the volume and persists to storage */
  setVolume = (volume: number): void => {
    this.#volume = volume;
    this.#storage.set(volumeKey, volume);
    this.#applyGain();
    this.#updateSnapshot();
  };

  /** Toggles mute state and persists to storage */
  toggleMute = (): void => {
    this.#muted = !this.#muted;
    this.#storage.set(mutedKey, this.#muted);
    this.#applyGain();
    this.#updateSnapshot();
  };

  /** Sets the audio buffer (triggers snapshot update) */
  setAudioBuffer = (audioBuffer: AudioBuffer | undefined): void => {
    // Reset playback state when audio changes
    if (this.#audioBuffer !== audioBuffer) {
      this.reset();
      this.#audioBuffer = audioBuffer;
      this.#updateSnapshot();
    }
  };

  /** Starts playback with the stored audio buffer */
  play(): void {
    if (!this.#audioBuffer) return;

    // Stop existing source to prevent double playback
    this.stop();

    const audioBuffer = this.#audioBuffer;
    const source = this.#audioContext.createBufferSource();
    source.buffer = audioBuffer;
    this.#applyGain();
    source.connect(this.#gainNode);

    // Handle natural playback end via ended event
    source.addEventListener("ended", () => {
      // Only process if this source is still the active one (not manually stopped)
      if (this.#source === source) {
        this.#source = null;
        this.#position = audioBuffer.duration;
        this.#updateSnapshot();
      }
    });

    source.start(0, this.#position);
    this.#source = source;
    this.#startedAt = this.#audioContext.currentTime - this.#position;
    this.#updateSnapshot();
  }

  /** Stops the current source and cleans up */
  stop(): boolean {
    if (this.#source) {
      this.#source.stop();
      this.#source.disconnect();
      this.#source = null;
      this.#updateSnapshot();
      return true;
    }
    return false;
  }

  /** Sets the playback position */
  setPosition(time: number): void {
    this.#position = time;
    this.#updateSnapshot();
  }

  /** Syncs position from audioContext (for animation frames) or sets from external value */
  syncPosition = (sec?: number): void => {
    if (this.#source) {
      this.#position = this.#audioContext.currentTime - this.#startedAt;
    } else if (sec !== undefined) {
      this.#position = sec;
    } else {
      return;
    }
    this.#updateSnapshot();
  };

  /** Resets all state to initial values */
  reset(): void {
    if (this.#source) {
      this.#source.stop();
      this.#source.disconnect();
      this.#source = null;
    }
    this.#position = 0;
    this.#updateSnapshot();
  }

  /** Toggles play/pause state */
  togglePlay = (): void => {
    if (this.#source) {
      this.stop();
    } else {
      this.play();
    }
  };

  /**
   * Seeks to the specified time.
   * @param time - Target time in seconds
   * @param commit - If true, resume playback if was playing before seek
   * @param seamless - If true, maintain playback without interruption (for keyboard seek)
   */
  seek = (time: number, commit: boolean, seamless: boolean = false): void => {
    const wasPlaying = this.#source !== null;
    const adjustedSeekTime = time < 1 ? 0 : time;

    // Seamless seek: maintain playback without UI state change (for keyboard)
    if (seamless && wasPlaying) {
      this.stop();
      this.setPosition(adjustedSeekTime);
      this.play();
      return;
    }

    // Standard seek: pause during seek, resume on commit (for mouse drag)
    if (wasPlaying) {
      this.stop();
    }

    this.syncPosition(adjustedSeekTime);

    if (!commit) return;
    if (wasPlaying) {
      this.play();
    }
  };
}
