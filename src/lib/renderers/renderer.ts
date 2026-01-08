import { MidiTrack } from "../midi/midi";

interface PianoRollConfigValues {
  noteMargin: number;
  noteVerticalMargin: number;
  gridColor: string;
  showRippleEffect: boolean;
  rippleDuration: number;
  rippleRadius: number;
  useCustomRippleColor: boolean;
  rippleColor: string;
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
  noteFlashMode: "on" | "duration";
  noteFlashIntensity: number;
  noteFlashFadeOutDuration: number;
  viewRangeTop: number;
  viewRangeBottom: number;
  showNotePressEffect: boolean;
  notePressDepth: number;
  pressAnimationDuration: number;
}

interface CometConfigValues {
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

export type RendererType = "pianoRoll" | "comet";

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
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
] as const;
export type BackgroundImageFit =
  (typeof backgroundImageFitOptions)[number]["value"];

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
export type BackgroundImagePosition =
  (typeof backgroundImagePositions)[number]["value"];

export const backgroundImageRepeats = [
  { value: "repeat", label: "Repeat" },
  { value: "no-repeat", label: "No Repeat" },
  { value: "repeat-x", label: "Repeat X" },
  { value: "repeat-y", label: "Repeat Y" },
] as const;
export type BackgroundImageRepeat =
  (typeof backgroundImageRepeats)[number]["value"];

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
  fps: FPS;
  format: VideoFormat;
  pianoRollConfig: PianoRollConfigValues;
  cometConfig: CometConfigValues;
}

export type RendererContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

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
  format: "webm",
  pianoRollConfig: {
    noteMargin: 2,
    noteVerticalMargin: 1,
    gridColor: "#ffffff",
    showRippleEffect: true,
    rippleDuration: 0.5,
    rippleRadius: 50,
    useCustomRippleColor: false,
    rippleColor: "#ffffff",
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
    noteFlashMode: "duration",
    noteFlashIntensity: 0.5,
    noteFlashFadeOutDuration: 0.2,
    viewRangeTop: 127,
    viewRangeBottom: 0,
    showNotePressEffect: true,
    notePressDepth: 4,
    pressAnimationDuration: 0.1,
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
});

export abstract class Renderer {
  constructor(
    protected readonly ctx:
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D,
    protected config: RendererConfig,
    protected backgroundImageBitmap?: ImageBitmap,
  ) {}

  setConfig(config: RendererConfig): void {
    this.config = config;
  }

  setBackgroundImageBitmap(backgroundImageBitmap?: ImageBitmap): void {
    this.backgroundImageBitmap = backgroundImageBitmap;
  }

  private calculateImageDimensions(
    imgRatio: number,
    canvasRatio: number,
    width: number,
    height: number,
  ) {
    const { backgroundImageFit } = this.config;
    switch (backgroundImageFit) {
      case "cover":
        if (imgRatio > canvasRatio) {
          return {
            drawWidth: height * imgRatio,
            drawHeight: height,
            offsetX: (width - height * imgRatio) / 2,
            offsetY: 0,
          };
        } else {
          return {
            drawWidth: width,
            drawHeight: width / imgRatio,
            offsetX: 0,
            offsetY: (height - width / imgRatio) / 2,
          };
        }
      case "contain":
        if (imgRatio > canvasRatio) {
          return {
            drawWidth: width,
            drawHeight: width / imgRatio,
            offsetX: 0,
            offsetY: (height - width / imgRatio) / 2,
          };
        } else {
          return {
            drawWidth: height * imgRatio,
            drawHeight: height,
            offsetX: (width - height * imgRatio) / 2,
            offsetY: 0,
          };
        }
      default: {
        const _exhaustiveCheck: never = backgroundImageFit;
        throw new Error(
          `Unknown background image fit: ${String(_exhaustiveCheck)}`,
        );
      }
    }
  }

  private adjustImagePosition(
    position: BackgroundImagePosition,
    width: number,
    height: number,
    drawWidth: number,
    drawHeight: number,
    offsetX: number,
    offsetY: number,
  ) {
    switch (position) {
      case "top":
        return { offsetX, offsetY: 0 };
      case "bottom":
        return { offsetX, offsetY: height - drawHeight };
      case "left":
        return { offsetX: 0, offsetY };
      case "right":
        return { offsetX: width - drawWidth, offsetY };
      case "top-left":
        return { offsetX: 0, offsetY: 0 };
      case "top-right":
        return { offsetX: width - drawWidth, offsetY: 0 };
      case "bottom-left":
        return { offsetX: 0, offsetY: height - drawHeight };
      case "bottom-right":
        return { offsetX: width - drawWidth, offsetY: height - drawHeight };
      case "center":
        return { offsetX, offsetY };
      default: {
        const _exhaustiveCheck: never = position;
        throw new Error(
          `Unknown background image position: ${String(_exhaustiveCheck)}`,
        );
      }
    }
  }

  renderCommonVisual() {
    const {
      canvas: { width, height },
    } = this.ctx;
    this.ctx.clearRect(0, 0, width, height);

    // 背景色を描画
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    // 背景画像を描画
    if (this.backgroundImageBitmap && this.config.backgroundImageEnabled) {
      this.ctx.save();
      this.ctx.globalAlpha = this.config.backgroundImageOpacity;

      const { backgroundImagePosition, backgroundImageRepeat } = this.config;
      const img = this.backgroundImageBitmap;
      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;

      const {
        drawWidth,
        drawHeight,
        offsetX: baseOffsetX,
        offsetY: baseOffsetY,
      } = this.calculateImageDimensions(imgRatio, canvasRatio, width, height);

      const { offsetX, offsetY } = this.adjustImagePosition(
        backgroundImagePosition,
        width,
        height,
        drawWidth,
        drawHeight,
        baseOffsetX,
        baseOffsetY,
      );

      // 繰り返しの設定
      if (backgroundImageRepeat === "no-repeat") {
        this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        const pattern = this.ctx.createPattern(img, backgroundImageRepeat);
        if (pattern) {
          this.ctx.fillStyle = pattern;
          this.ctx.fillRect(0, 0, width, height);
        }
      }

      this.ctx.restore();
    }
  }

  abstract render(tracks: MidiTrack[], currentTime: number): void;
}
