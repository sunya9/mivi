import type {
  AudioBuffer,
  AudioBufferSourceNode,
  AudioContext,
  GainNode,
} from "standardized-audio-context";

import { AudioAnalyzer, type FFTSize, type FrequencyData } from "@/lib/audio/audio-analyzer";
import { ObservableStore, shallowEqual } from "@/lib/store/observable-store";
import { PersistedStore } from "@/lib/store/persisted-store";

/**
 * "initial" lasts until the first play toggle of the current buffer. Scrubbing pauses the audio
 * graph; the suffix names the state a scrub returns to at endScrub ("scrubbingPlaying" resumes).
 */
export type PlaybackStatus =
  | "initial"
  | "paused"
  | "playing"
  | "scrubbingPaused"
  | "scrubbingPlaying";

/** Immutable snapshot of playback state */
export interface PlaybackSnapshot {
  readonly status: PlaybackStatus;
  /**
   * performance.now() of the latest play/pause toggle while its feedback is still showing,
   * 0 otherwise. Expires after PLAY_FEEDBACK_MS.
   */
  readonly playFeedbackAt: number;
  readonly position: number;
  readonly duration: number;
  readonly volume: number;
  readonly muted: boolean;
}

/** What the user perceives as "playing": a scrub pause that will resume still counts */
export function isEffectivelyPlaying(snapshot: PlaybackSnapshot): boolean {
  return snapshot.status === "playing" || snapshot.status === "scrubbingPlaying";
}

export interface AudioPlaybackStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => PlaybackSnapshot;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  /** Moves the position while preserving the current playing/paused state */
  seek: (time: number) => void;
  beginScrub: () => void;
  scrub: (time: number) => void;
  endScrub: (time: number) => void;
  syncFromAudioContext: () => void;
  setAudioBuffer: (audioBuffer: AudioBuffer | undefined) => void;
  getFrequencyData: () => FrequencyData | null;
  configureAnalyser: (options: AnalyserOptions) => void;
}

export interface AnalyserOptions {
  fftSize: FFTSize;
  smoothingTimeConstant: number;
}

const STORAGE_KEY_VOLUME = "mivi:volume";
const STORAGE_KEY_MUTED = "mivi:muted";

export const PLAY_FEEDBACK_MS = 500;

const SEEK_SNAP_THRESHOLD_SEC = 1;

export class AudioPlaybackStoreImpl
  extends ObservableStore<PlaybackSnapshot>
  implements AudioPlaybackStore
{
  readonly #audioContext: AudioContext;
  readonly #gainNode: GainNode<AudioContext>;
  readonly #analyser: AudioAnalyzer;
  readonly #volumeStore: PersistedStore<number>;
  readonly #mutedStore: PersistedStore<boolean>;
  #audioBuffer: AudioBuffer | undefined = undefined;
  #source: AudioBufferSourceNode<AudioContext> | null = null;
  #startedAt: number = 0;
  #position: number = 0;
  /** Set while a scrub is in progress; `resume` records what the scrub interrupted */
  #scrub: { resume: boolean } | null = null;
  #hasToggled: boolean = false;
  #playFeedbackAt: number = 0;
  #playFeedbackTimer: ReturnType<typeof setTimeout> | null = null;
  #volume: number;
  #muted: boolean;

  constructor(audioContext: AudioContext) {
    const volumeStore = new PersistedStore<number>(STORAGE_KEY_VOLUME, (persisted) =>
      typeof persisted === "number" ? persisted : 1,
    );
    const mutedStore = new PersistedStore<boolean>(STORAGE_KEY_MUTED, (persisted) =>
      typeof persisted === "boolean" ? persisted : false,
    );
    const volume = volumeStore.getSnapshot();
    const muted = mutedStore.getSnapshot();
    super(
      { status: "initial", playFeedbackAt: 0, position: 0, duration: 0, volume, muted },
      shallowEqual,
    );
    this.#volumeStore = volumeStore;
    this.#mutedStore = mutedStore;
    this.#audioContext = audioContext;
    this.#gainNode = audioContext.createGain();
    this.#analyser = new AudioAnalyzer(audioContext);
    // Connect analyser -> gainNode -> destination
    this.#analyser.node.connect(this.#gainNode);
    this.#gainNode.connect(audioContext.destination);
    this.#volume = volume;
    this.#muted = muted;
    this.#applyGain();
  }

  // ============================================================
  // Private snapshot helpers
  // ============================================================

  // Derived from the audio graph rather than stored, so an "ended" source cannot leave a stale status
  #status(): PlaybackStatus {
    if (this.#source) return "playing";
    if (this.#scrub) return this.#scrub.resume ? "scrubbingPlaying" : "scrubbingPaused";
    return this.#hasToggled ? "paused" : "initial";
  }

  #createSnapshot(): PlaybackSnapshot {
    return {
      status: this.#status(),
      playFeedbackAt: this.#playFeedbackAt,
      position: this.#position,
      duration: this.#audioBuffer?.duration ?? 0,
      volume: this.#volume,
      muted: this.#muted,
    };
  }

  #notifyIfChanged(): void {
    this.setSnapshot(this.#createSnapshot());
  }

  #applyGain(): void {
    const now = this.#audioContext.currentTime;
    this.#gainNode.gain.cancelScheduledValues(now);
    const effectiveVolume = this.#muted ? 0 : Math.max(0, Math.min(1, this.#volume));
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

  /** Sets the volume and persists to storage */
  setVolume = (volume: number): void => {
    this.#volume = volume;
    this.#volumeStore.set(volume);
    this.#applyGain();
    this.#notifyIfChanged();
  };

  /** Toggles mute state and persists to storage */
  toggleMute = (): void => {
    this.#muted = !this.#muted;
    this.#mutedStore.set(this.#muted);
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
    this.#hasToggled = false;
    this.#clearPlayFeedback();
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
        this.#raisePlayFeedback();
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
  #clearPlayFeedback(): void {
    if (this.#playFeedbackTimer !== null) {
      clearTimeout(this.#playFeedbackTimer);
      this.#playFeedbackTimer = null;
    }
    this.#playFeedbackAt = 0;
  }

  #raisePlayFeedback(): void {
    this.#clearPlayFeedback();
    this.#hasToggled = true;
    this.#playFeedbackAt = performance.now();
    this.#playFeedbackTimer = setTimeout(() => {
      this.#playFeedbackTimer = null;
      this.#playFeedbackAt = 0;
      this.#notifyIfChanged();
    }, PLAY_FEEDBACK_MS);
  }

  togglePlay = (): void => {
    if (!this.#audioBuffer) return;
    this.#raisePlayFeedback();
    if (this.#source) {
      this.stop();
    } else {
      this.play();
    }
  };

  pause = (): void => {
    if (!this.#source) return;
    this.syncFromAudioContext();
    this.stop();
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

  /** Users expect a scrub near the beginning to land exactly on the start */
  #snapToStart(time: number): number {
    return time < SEEK_SNAP_THRESHOLD_SEC ? 0 : time;
  }

  /** Moves the position while preserving the current playing/paused state */
  seek = (time: number): void => {
    const wasPlaying = this.#source !== null;
    this.#stopSource();
    this.#position = this.#snapToStart(time);
    if (wasPlaying) {
      this.play();
    } else {
      this.#notifyIfChanged();
    }
  };

  /** Pauses for a pointer scrub and remembers whether to resume at endScrub */
  beginScrub = (): void => {
    if (this.#scrub) return;
    this.#scrub = { resume: this.#source !== null };
    this.#stopSource();
    this.#notifyIfChanged();
  };

  /** Moves the position during a scrub without resuming playback */
  scrub = (time: number): void => {
    this.#position = this.#snapToStart(time);
    this.#notifyIfChanged();
  };

  /** Commits the scrub position and resumes playback if it was running before */
  endScrub = (time: number): void => {
    this.#position = this.#snapToStart(time);
    const resume = this.#scrub?.resume ?? false;
    this.#scrub = null;
    if (resume) {
      this.play();
    } else {
      this.#notifyIfChanged();
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

  configureAnalyser = ({ fftSize, smoothingTimeConstant }: AnalyserOptions): void => {
    this.#analyser.fftSize = fftSize;
    this.#analyser.smoothingTimeConstant = smoothingTimeConstant;
  };
}
