import { hexLuminance } from "@/lib/colors/hex";
import { RendererContext } from "@/lib/renderers/renderer";
import { seededRandom } from "@/lib/seeded-random";

export interface NoiseTextureConfig {
  showNoiseTexture: boolean;
  noiseIntensity: number;
  noiseGrainSize: number;
  noiseColorVariance: number;
}

const PATTERN_SIZE = 256;

function generatePattern(
  ctx: RendererContext,
  cfg: NoiseTextureConfig,
  dark: boolean,
): CanvasPattern | null {
  const canvas = new OffscreenCanvas(PATTERN_SIZE, PATTERN_SIZE);
  const patternCtx = canvas.getContext("2d");
  if (!patternCtx) return null;

  const imageData = patternCtx.createImageData(PATTERN_SIZE, PATTERN_SIZE);
  const data = imageData.data;
  const colorValue = dark ? 0 : 255;
  const grainsPerRow = Math.ceil(PATTERN_SIZE / cfg.noiseGrainSize);

  for (let y = 0; y < PATTERN_SIZE; y++) {
    for (let x = 0; x < PATTERN_SIZE; x++) {
      const grainX = Math.floor(x / cfg.noiseGrainSize);
      const grainY = Math.floor(y / cfg.noiseGrainSize);
      const grainIndex = grainY * grainsPerRow + grainX;
      const noiseAlpha = seededRandom(grainIndex) * cfg.noiseIntensity * cfg.noiseColorVariance;

      const i = (y * PATTERN_SIZE + x) * 4;
      data[i] = colorValue;
      data[i + 1] = colorValue;
      data[i + 2] = colorValue;
      data[i + 3] = Math.floor(noiseAlpha);
    }
  }

  patternCtx.putImageData(imageData, 0, 0);
  return ctx.createPattern(canvas, "repeat");
}

// The two patterns are expensive to build, so they are cached until the noise settings change
export function createNoiseTexture(ctx: RendererContext) {
  let light: CanvasPattern | null = null;
  let dark: CanvasPattern | null = null;
  let cacheKey = "";

  return {
    apply(cfg: NoiseTextureConfig, noteColor: string, x: number, y: number, seed: number): void {
      if (!cfg.showNoiseTexture) {
        light = null;
        dark = null;
        cacheKey = "";
        return;
      }

      const key = `${cfg.noiseIntensity}:${cfg.noiseGrainSize}:${cfg.noiseColorVariance}`;
      if (key !== cacheKey || !light || !dark) {
        light = generatePattern(ctx, cfg, false);
        dark = generatePattern(ctx, cfg, true);
        cacheKey = key;
      }

      const pattern = hexLuminance(noteColor) > 0.5 ? dark : light;
      if (!pattern) return;

      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      const offsetX = seededRandom(seed) * PATTERN_SIZE;
      const offsetY = seededRandom(seed + 12345) * PATTERN_SIZE;
      pattern.setTransform(new DOMMatrix().translate(x + offsetX, y + offsetY));
      ctx.fillStyle = pattern;
      ctx.fill();
      ctx.restore();
    },
  };
}
