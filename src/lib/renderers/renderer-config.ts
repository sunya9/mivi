import { DEFAULT_SPECTRUM_ENVELOPE } from "@/lib/audio/spectrum-envelope";
import { Resolution, resolutions } from "@/lib/renderers/resolution";

export interface NoteEffectsConfigValues {
  showRippleEffect: boolean;
  rippleDuration: number;
  rippleRadius: number;
  useCustomRippleColor: boolean;
  rippleColor: string;
  showNoteFlash: boolean;
  noteFlashDuration: number;
  noteFlashMode: "on" | "duration";
  noteFlashIntensity: number;
  noteFlashFadeOutDuration: number;
  showRoughEdge: boolean;
  roughEdgeIntensity: number;
  roughEdgeSegmentLength: number;
  showNoiseTexture: boolean;
  noiseIntensity: number;
  noiseGrainSize: number;
  noiseColorVariance: number;
}

export interface PianoRollConfig extends NoteEffectsConfigValues {
  noteMargin: number;
  noteVerticalMargin: number;
  gridColor: string;
  showPlayhead: boolean;
  playheadPosition: number;
  playheadColor: string;
  playheadOpacity: number;
  playheadWidth: number;
  noteHeight: number;
  noteCornerRadius: number;
  timeWindow: number;
  viewRangeTop: number;
  viewRangeBottom: number;
  showNotePressEffect: boolean;
  notePressDepth: number;
  pressAnimationDuration: number;
}

export interface VerticalPianoRollConfig extends NoteEffectsConfigValues {
  timeWindow: number;
  viewRangeTop: number;
  viewRangeBottom: number;
  keyboardHeight: number;
  whiteKeyColor: string;
  blackKeyColor: string;
  showKeyPressHighlight: boolean;
  keyPressOpacity: number;
  showOctaveLabels: boolean;
  showKeyLines: boolean;
  keyLineColor: string;
  keyLineOpacity: number;
  showOctaveLines: boolean;
  octaveLineColor: string;
  octaveLineOpacity: number;
  noteMargin: number;
  noteVerticalMargin: number;
  noteCornerRadius: number;
  darkenBlackKeyNotes: boolean;
  blackKeyNoteDarkness: number;
  showHitLine: boolean;
  hitLineColor: string;
  hitLineWidth: number;
  hitLineOpacity: number;
}

export interface CometConfig {
  fallAngle: number;
  fallDistancePercent: number;
  fallDuration: number;
  fadeOutDuration: number;
  cometSize: number;
  trailLength: number;
  trailWidth: number;
  trailOpacity: number;
  viewRangeTop: number;
  viewRangeBottom: number;
  spacingMargin: number;
  spacingRandomness: number;
  startPositionX: number;
  startPositionY: number;
  angleRandomness: number;
  reverseStacking: boolean;
}
export type RendererType = "none" | "pianoRoll" | "verticalPianoRoll" | "comet";

// Audio Visualizer Types
type AudioVisualizerFFTSize = 512 | 1024 | 2048 | 4096;
type AudioVisualizerPosition = "bottom" | "top" | "center";
type AudioVisualizerBarStyle = "rounded" | "sharp";
export type AudioVisualizerStyle = "none" | "bars" | "lineSpectrum" | "circular";
export type GradientDirection =
  | "to-right"
  | "to-bottom-right"
  | "to-bottom"
  | "to-bottom-left"
  | "to-left"
  | "to-top-left"
  | "to-top"
  | "to-top-right";

export const audioVisualizerStyleOptions = [
  { value: "none", label: "None" },
  { value: "bars", label: "Bars" },
  { value: "lineSpectrum", label: "Line Spectrum" },
  { value: "circular", label: "Circular" },
] as const satisfies readonly { value: AudioVisualizerStyle; label: string }[];

export const audioVisualizerPositionOptions = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
] as const satisfies readonly {
  value: AudioVisualizerPosition;
  label: string;
}[];

export const audioVisualizerBarStyleOptions = [
  { value: "rounded", label: "Rounded" },
  { value: "sharp", label: "Sharp" },
] as const satisfies readonly {
  value: AudioVisualizerBarStyle;
  label: string;
}[];

export const gradientDirectionOptions = [
  { value: "to-right", label: "→ Right" },
  { value: "to-bottom-right", label: "↘ Bottom Right" },
  { value: "to-bottom", label: "↓ Bottom" },
  { value: "to-bottom-left", label: "↙ Bottom Left" },
  { value: "to-left", label: "← Left" },
  { value: "to-top-left", label: "↖ Top Left" },
  { value: "to-top", label: "↑ Top" },
  { value: "to-top-right", label: "↗ Top Right" },
] as const satisfies readonly { value: GradientDirection; label: string }[];

export const audioVisualizerLayerOptions = [
  { value: "front", label: "Front (over MIDI)" },
  { value: "back", label: "Back (under MIDI)" },
] as const satisfies readonly { value: AudioVisualizerLayer; label: string }[];

export const noteFlashModeOptions = [
  { value: "on", label: "On" },
  { value: "duration", label: "Duration" },
] as const satisfies readonly {
  value: PianoRollConfig["noteFlashMode"];
  label: string;
}[];

interface LineSpectrumConfig {
  lineWidth: number;
  tension: number;
  stroke: boolean;
  strokeColor: string;
  strokeOpacity: number;
  fill: boolean;
  fillOpacity: number;
}

export interface AudioVisualizerConfig {
  style: AudioVisualizerStyle;
  fftSize: AudioVisualizerFFTSize;
  attackTime: number;
  releaseTime: number;
  minFrequency: number;
  maxFrequency: number;
  barCount: number;
  barGap: number;
  barPadding: number;
  barMinHeight: number;
  barStyle: AudioVisualizerBarStyle;
  useGradient: boolean;
  gradientDirection: GradientDirection;
  gradientStartColor: string;
  gradientEndColor: string;
  singleColor: string;
  barOpacity: number;
  position: AudioVisualizerPosition;
  height: number;
  mirror: boolean;
  mirrorOpacity: number;
  lineSpectrumConfig: LineSpectrumConfig;
}

type AudioVisualizerLayer = "front" | "back";

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

export const backgroundImageFitOptions = [
  { value: "auto", label: "Auto" },
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
] as const;
export type BackgroundImageFit = (typeof backgroundImageFitOptions)[number]["value"];

export const backgroundImagePositions = [
  { value: "top-left", label: "Top Left" },
  { value: "top", label: "Top" },
  { value: "top-right", label: "Top Right" },
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom", label: "Bottom" },
  { value: "bottom-right", label: "Bottom Right" },
] as const;
export type BackgroundImagePosition = (typeof backgroundImagePositions)[number]["value"];

export const backgroundImageRepeats = [
  { value: "repeat", label: "Repeat" },
  { value: "no-repeat", label: "No Repeat" },
  { value: "repeat-x", label: "Repeat X" },
  { value: "repeat-y", label: "Repeat Y" },
] as const;
export type BackgroundImageRepeat = (typeof backgroundImageRepeats)[number]["value"];

export interface RendererConfig {
  type: RendererType;
  backgroundColor: string;
  backgroundImageEnabled: boolean;
  backgroundImageUrl: string;
  backgroundImageFit: BackgroundImageFit;
  backgroundImagePosition: BackgroundImagePosition;
  backgroundImageRepeat: BackgroundImageRepeat;
  backgroundImageOpacity: number;
  resolution: Resolution;
  // Last size entered for Custom, restored when Custom is picked again
  customResolution?: Resolution;
  fps: FPS;
  format: VideoFormat;
  pianoRollConfig: PianoRollConfig;
  verticalPianoRollConfig: VerticalPianoRollConfig;
  cometConfig: CometConfig;
  audioVisualizerConfig: AudioVisualizerConfig;
  audioVisualizerLayer: AudioVisualizerLayer;
}

const getDefaultNoteEffectsConfig = (): NoteEffectsConfigValues => ({
  showRippleEffect: true,
  rippleDuration: 0.5,
  rippleRadius: 50,
  useCustomRippleColor: false,
  rippleColor: "#ffffff",
  showNoteFlash: true,
  noteFlashDuration: 1,
  noteFlashMode: "duration",
  noteFlashIntensity: 0.5,
  noteFlashFadeOutDuration: 0.2,
  showRoughEdge: false,
  roughEdgeIntensity: 1.5,
  roughEdgeSegmentLength: 4,
  showNoiseTexture: false,
  noiseIntensity: 0.15,
  noiseGrainSize: 4,
  noiseColorVariance: 30,
});

export const getDefaultRendererConfig = (): RendererConfig => ({
  type: "pianoRoll",
  backgroundColor: "#1a1a1a",
  backgroundImageEnabled: true,
  backgroundImageUrl: "",
  backgroundImageFit: "cover",
  backgroundImagePosition: "center",
  backgroundImageRepeat: "no-repeat",
  backgroundImageOpacity: 1,
  resolution: resolutions[1],
  fps: 30,
  format: "mp4",
  pianoRollConfig: {
    ...getDefaultNoteEffectsConfig(),
    noteMargin: 2,
    noteVerticalMargin: 1,
    gridColor: "#ffffff",
    showPlayhead: true,
    playheadPosition: 50,
    playheadColor: "#ffffff",
    playheadOpacity: 0.8,
    playheadWidth: 2,
    noteHeight: 4,
    noteCornerRadius: 2,
    timeWindow: 5,
    viewRangeTop: 127,
    viewRangeBottom: 0,
    showNotePressEffect: true,
    notePressDepth: 4,
    pressAnimationDuration: 0.1,
  },
  verticalPianoRollConfig: {
    ...getDefaultNoteEffectsConfig(),
    timeWindow: 3,
    viewRangeTop: 108,
    viewRangeBottom: 21,
    keyboardHeight: 15,
    whiteKeyColor: "#f5f5f5",
    blackKeyColor: "#1a1a1a",
    showKeyPressHighlight: true,
    keyPressOpacity: 0.9,
    showOctaveLabels: true,
    showKeyLines: true,
    keyLineColor: "#ffffff",
    keyLineOpacity: 0.08,
    showOctaveLines: true,
    octaveLineColor: "#ffffff",
    octaveLineOpacity: 0.1,
    noteMargin: 1,
    noteVerticalMargin: 2,
    noteCornerRadius: 2,
    darkenBlackKeyNotes: true,
    blackKeyNoteDarkness: 0.25,
    showHitLine: true,
    hitLineColor: "#ffffff",
    hitLineWidth: 2,
    hitLineOpacity: 0.8,
  },
  cometConfig: {
    fallAngle: 135,
    fallDistancePercent: 80,
    fallDuration: 2.0,
    fadeOutDuration: 0.5,
    cometSize: 8,
    trailLength: 1.0,
    trailWidth: 3,
    trailOpacity: 0.7,
    viewRangeTop: 127,
    viewRangeBottom: 0,
    spacingMargin: 20,
    spacingRandomness: 15,
    startPositionX: 100,
    startPositionY: 10,
    angleRandomness: 15,
    reverseStacking: false,
  },
  audioVisualizerConfig: {
    style: "none",
    fftSize: 2048,
    ...DEFAULT_SPECTRUM_ENVELOPE,
    minFrequency: 20,
    maxFrequency: 20000,
    barCount: 64,
    barGap: 20,
    barPadding: 5,
    barMinHeight: 2,
    barStyle: "rounded",
    useGradient: true,
    gradientDirection: "to-top",
    gradientStartColor: "#3b82f6",
    gradientEndColor: "#8b5cf6",
    singleColor: "#3b82f6",
    barOpacity: 0.8,
    position: "bottom",
    height: 30,
    mirror: false,
    mirrorOpacity: 0.5,
    lineSpectrumConfig: {
      lineWidth: 2,
      tension: 0.4,
      stroke: true,
      strokeColor: "#ffffff",
      strokeOpacity: 1,
      fill: false,
      fillOpacity: 0.3,
    },
  },
  audioVisualizerLayer: "back",
});
