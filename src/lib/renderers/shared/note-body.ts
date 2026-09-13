import { brightenHexColor } from "@/lib/colors/hex";
import { MidiNote } from "@/lib/midi/midi";
import { RendererContext } from "@/lib/renderers/renderer";
import { NoteEffectsConfig } from "@/lib/renderers/renderer-config";
import { NoiseTexture } from "@/lib/renderers/shared/noise-texture";
import { drawRoughRect } from "@/lib/renderers/shared/rough-rect";

export interface NoteBody {
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: number;
  baseColor: string;
  flashIntensity: number;
  opacity: number;
  velocity: number;
  seed: number;
}

type NoteBodyConfig = Pick<
  NoteEffectsConfig,
  | "showRoughEdge"
  | "roughEdgeIntensity"
  | "roughEdgeSegmentLength"
  | "showNoiseTexture"
  | "noiseIntensity"
  | "noiseGrainSize"
  | "noiseColorVariance"
>;

// Rough edges and noise are seeded per note so they stay put from frame to frame
export function noteSeed(note: Pick<MidiNote, "time" | "midi">): number {
  return note.time * 1000 + note.midi;
}

const VELOCITY_OVERLAY_ALPHA = 0.3;

export function drawNoteBody(
  ctx: RendererContext,
  noiseTexture: Pick<NoiseTexture, "apply">,
  cfg: NoteBodyConfig,
  body: NoteBody,
): void {
  const { x, y, width, height, cornerRadius, baseColor, flashIntensity, opacity, velocity, seed } =
    body;

  ctx.fillStyle = flashIntensity > 0 ? brightenHexColor(baseColor, flashIntensity) : baseColor;
  ctx.globalAlpha = opacity;

  if (cfg.showRoughEdge) {
    drawRoughRect(
      ctx,
      x,
      y,
      width,
      height,
      cornerRadius,
      cfg.roughEdgeIntensity,
      cfg.roughEdgeSegmentLength,
      seed,
    );
  } else {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, cornerRadius);
  }
  ctx.fill();

  noiseTexture.apply(cfg, baseColor, x, y, seed);

  ctx.fillStyle = `rgba(255, 255, 255, ${velocity * VELOCITY_OVERLAY_ALPHA})`;
  ctx.fill();
}
