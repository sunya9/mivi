import type {
  AudioVisualizerBarStyle,
  AudioVisualizerLayer,
  AudioVisualizerPosition,
  AudioVisualizerStyle,
  BackgroundImageFit,
  BackgroundImagePosition,
  BackgroundImageRepeat,
  FPS,
  GradientDirection,
  PianoRollConfig,
  VideoFormat,
} from "@/lib/renderers/renderer-config";

interface Option<T> {
  value: T;
  label: string;
}

export const audioVisualizerStyleOptions = [
  { value: "none", label: "None" },
  { value: "bars", label: "Bars" },
  { value: "lineSpectrum", label: "Line Spectrum" },
  { value: "circular", label: "Circular" },
] as const satisfies readonly Option<AudioVisualizerStyle>[];

export const audioVisualizerPositionOptions = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
] as const satisfies readonly Option<AudioVisualizerPosition>[];

export const audioVisualizerBarStyleOptions = [
  { value: "rounded", label: "Rounded" },
  { value: "sharp", label: "Sharp" },
] as const satisfies readonly Option<AudioVisualizerBarStyle>[];

export const gradientDirectionOptions = [
  { value: "to-right", label: "→ Right" },
  { value: "to-bottom-right", label: "↘ Bottom Right" },
  { value: "to-bottom", label: "↓ Bottom" },
  { value: "to-bottom-left", label: "↙ Bottom Left" },
  { value: "to-left", label: "← Left" },
  { value: "to-top-left", label: "↖ Top Left" },
  { value: "to-top", label: "↑ Top" },
  { value: "to-top-right", label: "↗ Top Right" },
] as const satisfies readonly Option<GradientDirection>[];

export const audioVisualizerLayerOptions = [
  { value: "front", label: "Front (over MIDI)" },
  { value: "back", label: "Back (under MIDI)" },
] as const satisfies readonly Option<AudioVisualizerLayer>[];

export const noteFlashModeOptions = [
  { value: "on", label: "On" },
  { value: "duration", label: "Duration" },
] as const satisfies readonly Option<PianoRollConfig["noteFlashMode"]>[];

export const fpsOptions = [
  { value: 24, label: "24 fps" },
  { value: 30, label: "30 fps" },
  { value: 60, label: "60 fps" },
] as const satisfies readonly Option<FPS>[];

export const formatOptions = [
  { value: "webm", label: "WebM (VP9)" },
  { value: "mp4", label: "MP4 (H.264)" },
] as const satisfies readonly Option<VideoFormat>[];

export const backgroundImageFitOptions = [
  { value: "auto", label: "Auto" },
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
] as const satisfies readonly Option<BackgroundImageFit>[];

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
] as const satisfies readonly Option<BackgroundImagePosition>[];

export const backgroundImageRepeats = [
  { value: "repeat", label: "Repeat" },
  { value: "no-repeat", label: "No Repeat" },
  { value: "repeat-x", label: "Repeat X" },
  { value: "repeat-y", label: "Repeat Y" },
] as const satisfies readonly Option<BackgroundImageRepeat>[];
