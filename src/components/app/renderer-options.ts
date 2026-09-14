import type { FPS, VideoFormat } from "@/lib/muxer/video-format";
import type {
  BackgroundImageFit,
  BackgroundImagePosition,
  BackgroundImageRepeat,
} from "@/lib/renderers/background";
import {
  type AudioVisualizerBarStyle,
  type AudioVisualizerLayer,
  type AudioVisualizerPosition,
  type AudioVisualizerStyle,
  type GradientDirection,
  type PianoRollConfig,
} from "@/lib/renderers/renderer-config";
import { m } from "@/paraglide/messages";

interface Option<T> {
  value: T;
  label: string;
}

export const getAudioVisualizerStyleOptions = () =>
  [
    { value: "none", label: m.common_none() },
    { value: "bars", label: m.av_style_bars() },
    { value: "lineSpectrum", label: m.av_style_line_spectrum() },
    { value: "circular", label: m.av_style_circular() },
  ] as const satisfies readonly Option<AudioVisualizerStyle>[];

export const getAudioVisualizerPositionOptions = () =>
  [
    { value: "top", label: m.position_top() },
    { value: "center", label: m.position_center() },
    { value: "bottom", label: m.position_bottom() },
  ] as const satisfies readonly Option<AudioVisualizerPosition>[];

export const getAudioVisualizerBarStyleOptions = () =>
  [
    { value: "rounded", label: m.av_bar_style_rounded() },
    { value: "sharp", label: m.av_bar_style_sharp() },
  ] as const satisfies readonly Option<AudioVisualizerBarStyle>[];

export const getGradientDirectionOptions = () =>
  [
    { value: "to-right", label: m.gradient_to_right() },
    { value: "to-bottom-right", label: m.gradient_to_bottom_right() },
    { value: "to-bottom", label: m.gradient_to_bottom() },
    { value: "to-bottom-left", label: m.gradient_to_bottom_left() },
    { value: "to-left", label: m.gradient_to_left() },
    { value: "to-top-left", label: m.gradient_to_top_left() },
    { value: "to-top", label: m.gradient_to_top() },
    { value: "to-top-right", label: m.gradient_to_top_right() },
  ] as const satisfies readonly Option<GradientDirection>[];

export const getAudioVisualizerLayerOptions = () =>
  [
    { value: "front", label: m.audio_visualizer_layer_front() },
    { value: "back", label: m.audio_visualizer_layer_back() },
  ] as const satisfies readonly Option<AudioVisualizerLayer>[];

export const getNoteFlashModeOptions = () =>
  [
    { value: "on", label: m.note_flash_mode_on() },
    { value: "duration", label: m.note_flash_mode_duration() },
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

export const getBackgroundImageFitOptions = () =>
  [
    { value: "auto", label: m.image_fit_auto() },
    { value: "cover", label: m.image_fit_cover() },
    { value: "contain", label: m.image_fit_contain() },
  ] as const satisfies readonly Option<BackgroundImageFit>[];

export const getBackgroundImagePositionOptions = () =>
  [
    { value: "top-left", label: m.position_top_left() },
    { value: "top", label: m.position_top() },
    { value: "top-right", label: m.position_top_right() },
    { value: "left", label: m.position_left() },
    { value: "center", label: m.position_center() },
    { value: "right", label: m.position_right() },
    { value: "bottom-left", label: m.position_bottom_left() },
    { value: "bottom", label: m.position_bottom() },
    { value: "bottom-right", label: m.position_bottom_right() },
  ] as const satisfies readonly Option<BackgroundImagePosition>[];

export const getBackgroundImageRepeatOptions = () =>
  [
    { value: "repeat", label: m.image_repeat_repeat() },
    { value: "no-repeat", label: m.image_repeat_none() },
    { value: "repeat-x", label: m.image_repeat_x() },
    { value: "repeat-y", label: m.image_repeat_y() },
  ] as const satisfies readonly Option<BackgroundImageRepeat>[];
