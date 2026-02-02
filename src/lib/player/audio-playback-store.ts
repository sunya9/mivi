import { type StorageRepository } from "@/lib/storage/storage-repository";
import { AudioAnalyzer, type FrequencyData } from "@/lib/audio/audio-analyzer";

/** Immutable snapshot of playback state */
export interface PlaybackSnapshot {
  readonly audioBuffer: AudioBuffer | undefined;
  readonly isPlaying: boolean;
  readonly position: number;
  readonly duration: number;
  readonly volume: number;
  readonly muted: boolean;
}

const STORAGE_KEY_VOLUME = "mivi:volume";
const STORAGE_KEY_MUTED = "mivi:muted";

/** Snap to start if seeking within this threshold from the beginning */
const SEEK_SNAP_THRESHOLD_SEC = 1;

/**
 * External store for audio playback state.
 * Encapsulates AudioContext, GainNode, AudioBuffer, and playback state management.
 * Uses the subscriber pattern for integration with useSyncExternalStore.
 *
 * ## Method binding convention
 * - Arrow function properties: Methods that need stable references
 *   (passed as callbacks to React or event listeners)
 * - Regular methods: Internal operations or methods not typically passed as callbacks
 */
export class AudioPlaybackStore {
  readonly #audioContext: AudioContext;
  readonly #gainNode: GainNode;
  readonly #analyser: AudioAnalyzer;
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
    this.#analyser = new AudioAnalyzer(audioContext);
    // Connect analyser -> gainNode -> destination
    this.#analyser.node.connect(this.#gainNode);
    this.#gainNode.connect(audioContext.destination);
    this.#storage = storage;
    this.#volume = storage.get(STORAGE_KEY_VOLUME, 1);
    this.#muted = storage.get(STORAGE_KEY_MUTED, false);
    this.#applyGain();
    this.#snapshot = this.#createSnapshot();
  }

  // ============================================================
  // Subscriber pattern (for useSyncExternalStore)
  // ============================================================

  /** Subscribe to state changes */
  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  /** Get current snapshot (returns same reference if unchanged) */
  getSnapshot = (): PlaybackSnapshot => {
    return this.#snapshot;
  };

  // ============================================================
  // Private snapshot helpers
  // ============================================================

  #createSnapshot(): PlaybackSnapshot {
    return {
      audioBuffer: this.#audioBuffer,
      isPlaying: this.#source !== null,
      position: this.#position,
      duration: this.#audioBuffer?.duration ?? 0,
      volume: this.#volume,
      muted: this.#muted,
    };
  }

  #notifyIfChanged(): void {
    const newSnapshot = this.#createSnapshot();
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
    const effectiveVolume = this.#muted
      ? 0
      : Math.max(0, Math.min(1, this.#volume));
    this.#gainNode.gain.setTargetAtTime(effectiveVolume, now, 0);
  }

  /** Stops source without notifying (for internal use before other operations) */
  #stopSource(): void {
    if (this.#source) {
      this.#source.stop();
      this.#source.disconnect();
      this.#source = null;
    }
  }

  // ============================================================
  // Volume / Mute controls
  // ============================================================

  /** Get current position (synchronous access for non-React consumers) */
  getPosition = (): number => this.#position;

  /** Sets the volume and persists to storage */
  setVolume = (volume: number): void => {
    this.#volume = volume;
    this.#storage.set(STORAGE_KEY_VOLUME, volume);
    this.#applyGain();
    this.#notifyIfChanged();
  };

  /** Toggles mute state and persists to storage */
  toggleMute = (): void => {
    this.#muted = !this.#muted;
    this.#storage.set(STORAGE_KEY_MUTED, this.#muted);
    this.#applyGain();
    this.#notifyIfChanged();
  };

  // ============================================================
  // Audio buffer management
  // ============================================================

  /** Sets the audio buffer and resets playback state */
  setAudioBuffer = (audioBuffer: AudioBuffer | undefined): void => {
    if (this.#audioBuffer === audioBuffer) return;
    this.#stopSource();
    this.#audioBuffer = audioBuffer;
    this.#position = 0;
    this.#notifyIfChanged();
  };

  // ============================================================
  // Playback controls
  // ============================================================

  /** Starts playback with the stored audio buffer */
  play(): void {
    if (!this.#audioBuffer) return;

    this.#stopSource();

    const audioBuffer = this.#audioBuffer;
    const source = this.#audioContext.createBufferSource();
    source.buffer = audioBuffer;
    this.#applyGain();
    // Connect source -> analyser (which is already connected to gainNode -> destination)
    source.connect(this.#analyser.node);

    source.addEventListener("ended", () => {
      if (this.#source === source) {
        this.#source = null;
        this.#position = audioBuffer.duration;
        this.#notifyIfChanged();
      }
    });

    source.start(0, this.#position);
    this.#source = source;
    this.#startedAt = this.#audioContext.currentTime - this.#position;
    this.#notifyIfChanged();
  }

  /** Stops the current source and cleans up */
  stop(): boolean {
    if (this.#source) {
      this.#stopSource();
      this.#notifyIfChanged();
      return true;
    }
    return false;
  }

  /** Toggles play/pause state */
  togglePlay = (): void => {
    if (this.#source) {
      this.stop();
    } else {
      this.play();
    }
  };

  // ============================================================
  // Position management
  // ============================================================

  /** Syncs position from audioContext during playback (for animation frames) */
  syncFromAudioContext = (): void => {
    if (!this.#source) return;
    this.#position = this.#audioContext.currentTime - this.#startedAt;
    this.#notifyIfChanged();
  };

  /**
   * Seeks to the specified time.
   * @param time - Target time in seconds
   * @param commit - If true, resume playback if was playing before seek
   * @param seamless - If true, maintain playback without interruption (for keyboard seek)
   */
  seek = (time: number, commit: boolean, seamless: boolean = false): void => {
    const wasPlaying = this.#source !== null;
    const adjustedSeekTime = time < SEEK_SNAP_THRESHOLD_SEC ? 0 : time;

    if (seamless && wasPlaying) {
      this.#stopSource();
      this.#position = adjustedSeekTime;
      this.play();
      return;
    }

    if (wasPlaying) {
      this.#stopSource();
      this.#notifyIfChanged();
    }

    this.#position = adjustedSeekTime;
    this.#notifyIfChanged();

    if (commit && wasPlaying) {
      this.play();
    }
  };

  // ============================================================
  // Audio analysis
  // ============================================================

  /**
   * Get current frequency data from the audio analyser.
   * Returns meaningful data only during playback.
   */
  getFrequencyData = (): FrequencyData | null => {
    if (!this.#source) return null;
    return this.#analyser.getFrequencyData();
  };
}
