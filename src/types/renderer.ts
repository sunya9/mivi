interface PianoRollConfigValues {
  noteMargin: number;
  noteVerticalMargin: number;
  gridColor: string;
  showRippleEffect: boolean;
  showPlayhead: boolean;
  playheadPosition: number;
  playheadColor: string;
  playheadOpacity: number;
  playheadWidth: number;
  noteHeight: number;
  noteCornerRadius: number;
  timeWindow: number;
  showNoteFlash: boolean;
  noteFlashDuration: number;
  noteFlashIntensity: number;
  viewRangeTop: number;
  viewRangeBottom: number;
  showNotePressEffect: boolean;
  notePressDepth: number;
}

interface WaveformConfigValues {
  lineColor: string;
  lineWidth: number;
}

interface ParticlesConfigValues {
  particleSize: number;
  particleColor: string;
}

export type Resolution = {
  width: number;
  height: number;
  label: string;
};

export const resolutions: Resolution[] = [
  { width: 1920, height: 1080, label: "1920×1080 (16:9)" },
  { width: 1280, height: 720, label: "1280×720 (16:9)" },
  { width: 854, height: 480, label: "854×480 (16:9)" },
  { width: 1440, height: 1080, label: "1440×1080 (4:3)" },
  { width: 1024, height: 768, label: "1024×768 (4:3)" },
  { width: 1080, height: 1080, label: "1080×1080 (1:1)" },
  { width: 720, height: 720, label: "720×720 (1:1)" },
];

export type RendererType = "pianoRoll" | "waveform" | "particles";

export const fpsOptions = [
  { value: 24, label: "24 fps" },
  { value: 30, label: "30 fps" },
  { value: 60, label: "60 fps" },
] as const;

export const formatOptions = [
  { value: "webm", label: "WebM (VP9)" },
  { value: "mp4", label: "MP4 (H.264)" },
] as const;

export type FPS = (typeof fpsOptions)[number]["value"];
export type VideoFormat = (typeof formatOptions)[number]["value"];

export interface RendererConfig {
  type: RendererType;
  backgroundColor: string;
  resolution: Resolution;
  fps: FPS;
  format: VideoFormat;
  pianoRollConfig: PianoRollConfigValues;
  waveformConfig: WaveformConfigValues;
  particlesConfig: ParticlesConfigValues;
}

export type RendererContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export const getDefaultRendererConfig = (): RendererConfig => ({
  type: "pianoRoll",
  backgroundColor: "#1a1a1a",
  resolution: resolutions[1],
  fps: 30,
  format: "webm",
  pianoRollConfig: {
    noteMargin: 2,
    noteVerticalMargin: 1,
    gridColor: "#ffffff",
    showRippleEffect: true,
    showPlayhead: true,
    playheadPosition: 20,
    playheadColor: "#ff4081",
    playheadOpacity: 1,
    playheadWidth: 2,
    noteHeight: 4,
    noteCornerRadius: 2,
    timeWindow: 5,
    showNoteFlash: true,
    noteFlashDuration: 1,
    noteFlashIntensity: 0.5,
    viewRangeTop: 0,
    viewRangeBottom: 0,
    showNotePressEffect: true,
    notePressDepth: 4,
  },
  waveformConfig: {
    lineColor: "#4a9eff",
    lineWidth: 2,
  },
  particlesConfig: {
    particleSize: 3,
    particleColor: "#4a9eff",
  },
});
