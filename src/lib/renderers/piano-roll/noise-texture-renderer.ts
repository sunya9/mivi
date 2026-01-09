import { RendererContext } from "../renderer";
import { seededRandom } from "./seeded-random";

export interface NoiseTextureConfig {
  intensity: number;
  grainSize: number;
  colorVariance: number;
}

export class NoiseTextureRenderer {
  private patternLight: CanvasPattern | null = null;
  private patternDark: CanvasPattern | null = null;
  private cachedIntensity: number = 0;
  private cachedGrainSize: number = 0;
  private cachedColorVariance: number = 0;

  constructor(private ctx: RendererContext) {}

  updatePatterns(config: NoiseTextureConfig): void {
    const { intensity, grainSize, colorVariance } = config;

    if (
      this.cachedIntensity !== intensity ||
      this.cachedGrainSize !== grainSize ||
      this.cachedColorVariance !== colorVariance ||
      this.patternLight === null ||
      this.patternDark === null
    ) {
      this.patternLight = this.generatePattern(
        intensity,
        grainSize,
        colorVariance,
        false,
      );
      this.patternDark = this.generatePattern(
        intensity,
        grainSize,
        colorVariance,
        true,
      );
      this.cachedIntensity = intensity;
      this.cachedGrainSize = grainSize;
      this.cachedColorVariance = colorVariance;
    }
  }

  clearPatterns(): void {
    this.patternLight = null;
    this.patternDark = null;
    this.cachedIntensity = 0;
    this.cachedGrainSize = 0;
    this.cachedColorVariance = 0;
  }

  apply(
    noteColor: string,
    noteX: number,
    noteY: number,
    noteSeed: number,
  ): void {
    const luminance = this.getColorLuminance(noteColor);
    const pattern = luminance > 0.5 ? this.patternDark : this.patternLight;

    if (!pattern) return;

    this.ctx.save();
    this.ctx.globalCompositeOperation = "source-atop";

    const uniqueOffsetX = seededRandom(noteSeed) * 256;
    const uniqueOffsetY = seededRandom(noteSeed + 12345) * 256;

    pattern.setTransform(
      new DOMMatrix().translate(noteX + uniqueOffsetX, noteY + uniqueOffsetY),
    );
    this.ctx.fillStyle = pattern;
    this.ctx.fill();
    this.ctx.restore();
  }

  private generatePattern(
    intensity: number,
    grainSize: number,
    colorVariance: number,
    dark: boolean,
  ): CanvasPattern | null {
    const size = 256;
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    const colorValue = dark ? 0 : 255;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const grainX = Math.floor(x / grainSize);
        const grainY = Math.floor(y / grainSize);
        const grainIndex = grainY * Math.ceil(size / grainSize) + grainX;

        const noiseAlpha = seededRandom(grainIndex) * intensity * colorVariance;

        const i = (y * size + x) * 4;
        data[i] = colorValue;
        data[i + 1] = colorValue;
        data[i + 2] = colorValue;
        data[i + 3] = Math.floor(noiseAlpha);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return this.ctx.createPattern(canvas, "repeat");
  }

  private getColorLuminance(hexColor: string): number {
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
}
