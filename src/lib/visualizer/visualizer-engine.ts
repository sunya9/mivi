import { SerializedAudio } from "@/lib/audio/audio";
import { computeFFTAtTime } from "@/lib/audio/fft-precompute";
import { MidiTracks } from "@/lib/midi/midi";
import type { AudioPlaybackStore } from "@/lib/player/audio-playback-store";
import { RendererConfig } from "@/lib/renderers/renderer";
import type { ReadableStore } from "@/lib/store/observable-store";
import { cn } from "@/lib/utils";
import { FpsCounter } from "@/lib/visualizer/fps-counter";
import { RendererController } from "@/lib/visualizer/renderer-controller";

const CANVAS_CLASS_NAME = cn(
  "max-h-full max-w-full [html:active-view-transition-type(canvas-expand)_&]:[view-transition-name:visualizer-canvas]",
);

export interface VisualizerSources {
  rendererConfig: ReadableStore<RendererConfig>;
  midiTracks: ReadableStore<MidiTracks | undefined>;
  backgroundImage: ReadableStore<ImageBitmap | undefined>;
  serializedAudio: ReadableStore<SerializedAudio | undefined>;
}
export class VisualizerEngine {
  readonly canvas: HTMLCanvasElement;
  readonly fpsCounter = new FpsCounter();
  readonly #store: AudioPlaybackStore;
  readonly #sources: VisualizerSources;
  readonly #controller: RendererController;
  readonly #unsubscribes: (() => void)[];
  #rendererConfig: RendererConfig;
  #containerSize: { width: number; height: number } | null = null;
  #frame: number | null = null;
  #lastPosition: number;

  constructor(store: AudioPlaybackStore, sources: VisualizerSources) {
    this.#store = store;
    this.#sources = sources;
    this.#lastPosition = store.getSnapshot().position;
    this.canvas = document.createElement("canvas");
    this.canvas.className = CANVAS_CLASS_NAME;
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute("aria-label", "Visualized Midi");
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Failed to get canvas context");
    this.#controller = new RendererController(context);

    this.#rendererConfig = sources.rendererConfig.getSnapshot();
    this.#controller.setRendererConfig(this.#rendererConfig);
    this.#applyAspectRatio();
    this.#controller.setBackgroundImageBitmap(sources.backgroundImage.getSnapshot());
    this.#repaint(true);

    this.#unsubscribes = [
      store.subscribe(this.#handleStoreChange),
      sources.rendererConfig.subscribe(this.#handleRendererConfigChange),
      sources.midiTracks.subscribe(this.invalidate),
      sources.backgroundImage.subscribe(this.#handleBackgroundImageChange),
      sources.serializedAudio.subscribe(this.invalidate),
    ];
    this.#syncLoop();
  }

  /** Detaches from the stores and halts the loop; the canvas element is left as is */
  dispose(): void {
    this.#unsubscribes.splice(0).forEach((unsubscribe) => unsubscribe());
    this.#stopLoop();
  }

  mountCanvas = (container: HTMLElement): (() => void) => {
    container.appendChild(this.canvas);
    return () => this.canvas.remove();
  };

  fitCanvas = (containerWidth: number, containerHeight: number): void => {
    this.#containerSize = { width: containerWidth, height: containerHeight };
    if (!containerWidth || !containerHeight) return;
    const { width, height } = this.#rendererConfig.resolution;
    const aspectRatio = width / height;
    const heightFromWidth = containerWidth / aspectRatio;
    const size =
      heightFromWidth <= containerHeight
        ? { width: containerWidth, height: heightFromWidth }
        : { width: containerHeight * aspectRatio, height: containerHeight };
    this.canvas.width = size.width * window.devicePixelRatio;
    this.canvas.height = size.height * window.devicePixelRatio;
    this.#repaint(true);
  };

  invalidate = (): void => {
    this.#repaint(true);
  };

  #handleRendererConfigChange = (): void => {
    const previous = this.#rendererConfig;
    const config = this.#sources.rendererConfig.getSnapshot();
    this.#rendererConfig = config;
    this.#controller.setRendererConfig(config);
    if (previous.resolution !== config.resolution) {
      this.#applyAspectRatio();
      if (this.#containerSize) {
        this.fitCanvas(this.#containerSize.width, this.#containerSize.height);
      }
    }
    if (this.#frame !== null && previous.fps !== config.fps) {
      this.#stopLoop();
      this.#startLoop();
    }
    this.#repaint(true);
  };

  #handleBackgroundImageChange = (): void => {
    this.#controller.setBackgroundImageBitmap(this.#sources.backgroundImage.getSnapshot());
    this.#repaint(true);
  };

  #applyAspectRatio(): void {
    const { width, height } = this.#rendererConfig.resolution;
    this.canvas.style.aspectRatio = `${width} / ${height}`;
  }

  #handleStoreChange = (): void => {
    const { position, status } = this.#store.getSnapshot();
    this.#syncLoop();
    if (position === this.#lastPosition) return;
    this.#lastPosition = position;
    // While playing the frame loop paints; otherwise a seek/scrub must be reflected right away
    if (status !== "playing") this.#repaint(true);
  };

  #syncLoop(): void {
    const playing = this.#store.getSnapshot().status === "playing";
    if (playing && this.#frame === null) {
      this.#startLoop();
    } else if (!playing && this.#frame !== null) {
      this.#stopLoop();
      this.fpsCounter.reset();
    }
  }

  #startLoop(): void {
    const fps = this.#rendererConfig.fps;
    const frameInterval = fps ? 1000 / fps : 0;
    let nextFireTime = 0;
    const loop = (timestamp: number) => {
      if (frameInterval > 0 && nextFireTime > 0 && timestamp + 1 < nextFireTime) {
        this.#frame = requestAnimationFrame(loop);
        return;
      }
      // Advance by the exact interval so fractional frame times accumulate instead of drifting
      nextFireTime = (nextFireTime || timestamp) + frameInterval;
      this.#paintFrame();
      this.#frame = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", this.#handleVisibilityChange);
    this.#frame = requestAnimationFrame(loop);
  }

  #stopLoop(): void {
    document.removeEventListener("visibilitychange", this.#handleVisibilityChange);
    if (this.#frame !== null) {
      cancelAnimationFrame(this.#frame);
      this.#frame = null;
    }
  }

  /** Background tabs get no frames, so catch up as soon as the tab is visible again */
  #handleVisibilityChange = (): void => {
    if (!document.hidden) this.#paintFrame();
  };

  #paintFrame(): void {
    this.#store.syncFromAudioContext();
    this.#repaint(false);
    this.fpsCounter.tick();
  }

  #repaint(usePrecomputedFft: boolean): void {
    const { position } = this.#store.getSnapshot();
    const midiTracks = this.#sources.midiTracks.getSnapshot();
    const serializedAudio = this.#sources.serializedAudio.getSnapshot();
    // The analyser only has data during playback; a paused preview falls back to precomputed FFT
    let frequencyData = this.#store.getFrequencyData();
    if (!frequencyData && usePrecomputedFft && serializedAudio) {
      frequencyData = computeFFTAtTime(serializedAudio, position, {
        fftSize: this.#rendererConfig.audioVisualizerConfig.fftSize,
        smoothingTimeConstant: this.#rendererConfig.audioVisualizerConfig.smoothingTimeConstant,
      });
    }
    this.#controller.render(
      midiTracks?.tracks ?? [],
      position + (midiTracks?.midiOffset ?? 0),
      frequencyData,
    );
  }
}
