import { MidiNote, MidiTrack } from "@/lib/midi/midi";
import { RendererContext, RendererFactory } from "@/lib/renderers/renderer";
import { CometConfig } from "@/lib/renderers/renderer-config";
import { findFirstNoteIndexFrom } from "@/lib/renderers/shared/find-first-note-from";

interface Comet {
  startX: number;
  startY: number;
  angleRad: number;
  maxDistance: number;
  color: string;
  radius: number;
}

interface Point {
  x: number;
  y: number;
}

function alphaHex(alpha: number): string {
  return Math.floor(alpha * 255)
    .toString(16)
    .padStart(2, "0");
}

// Every property of a comet follows from its note, so it never needs to be stored between frames
function computeComet(
  note: MidiNote,
  track: MidiTrack,
  cfg: CometConfig,
  width: number,
  height: number,
): Comet {
  const pseudoRandomAngle = ((note.time * 54321 + note.midi * 98765) % 1000) / 1000 - 0.5;
  const angleOffset = pseudoRandomAngle * 2 * cfg.angleRandomness;
  const angleRad = ((cfg.fallAngle + angleOffset) * Math.PI) / 180;

  // High notes start near the top
  const noteRange = cfg.viewRangeTop - cfg.viewRangeBottom;
  const normalizedMidi = 1 - (note.midi - cfg.viewRangeBottom) / noteRange;

  const baseStartX = width * (cfg.startPositionX / 100);
  const baseStartY = height * (cfg.startPositionY / 100);

  // Spread parallel trajectories apart along the perpendicular of the fall direction
  const noteHash = (note.time * 1000 + note.midi) % 100;
  const spacingSign = cfg.reverseStacking ? -1 : 1;
  const spacingDistance = spacingSign * noteHash * cfg.spacingMargin * 0.1;
  const pseudoRandom = ((note.time * 12345 + note.midi * 67890) % 1000) / 1000 - 0.5;
  const randomOffset = pseudoRandom * cfg.spacingRandomness;
  const perpendicularAngle = angleRad + Math.PI / 2;
  const sideways = spacingDistance + randomOffset;

  const screenDiagonal = Math.sqrt(width * width + height * height);

  return {
    startX: baseStartX + Math.cos(perpendicularAngle) * sideways,
    startY: baseStartY + normalizedMidi * height * 0.2 + Math.sin(perpendicularAngle) * sideways,
    angleRad,
    maxDistance: screenDiagonal * (cfg.fallDistancePercent / 100),
    color: track.config.color,
    radius: cfg.cometSize * (note.velocity / 127) * track.config.scale,
  };
}

function positionAt(comet: Comet, progress: number): Point {
  const distance = progress * comet.maxDistance;
  return {
    x: comet.startX + Math.cos(comet.angleRad) * distance,
    y: comet.startY + Math.sin(comet.angleRad) * distance,
  };
}

function drawTrail(
  ctx: RendererContext,
  cfg: CometConfig,
  comet: Comet,
  elapsed: number,
  alpha: number,
): void {
  const trailPoints = Math.max(2, Math.floor(cfg.trailLength * 60));
  const positions: Point[] = [];
  for (let i = 0; i < trailPoints; i++) {
    const trailElapsed = elapsed - (cfg.trailLength / (trailPoints - 1)) * i;
    if (trailElapsed < 0) break;
    positions.unshift(positionAt(comet, trailElapsed / cfg.fallDuration));
  }
  if (positions.length < 2) return;

  ctx.save();
  ctx.lineWidth = cfg.trailWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(positions[0].x, positions[0].y);
  for (let i = 1; i < positions.length; i++) {
    ctx.lineTo(positions[i].x, positions[i].y);
  }

  const tail = positions[0];
  const head = positions[positions.length - 1];
  const gradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
  const baseAlpha = alpha * cfg.trailOpacity;
  gradient.addColorStop(0, `${comet.color}00`);
  gradient.addColorStop(0.5, `${comet.color}${alphaHex(baseAlpha * 0.3)}`);
  gradient.addColorStop(0.8, `${comet.color}${alphaHex(baseAlpha * 0.7)}`);
  gradient.addColorStop(1, `${comet.color}${alphaHex(baseAlpha)}`);

  ctx.strokeStyle = gradient;
  ctx.stroke();
  ctx.restore();
}

function drawHead(ctx: RendererContext, comet: Comet, at: Point, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = comet.color;
  ctx.beginPath();
  ctx.arc(at.x, at.y, comet.radius, 0, Math.PI * 2);
  ctx.fill();

  const glowRadius = comet.radius * 2;
  const glow = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, glowRadius);
  glow.addColorStop(
    0,
    `${comet.color}${Math.floor(alpha * 128)
      .toString(16)
      .padStart(2, "0")}`,
  );
  glow.addColorStop(1, `${comet.color}00`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(at.x, at.y, glowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export const createCometRenderer: RendererFactory = (ctx) => (tracks, currentTime, config) => {
  const { width, height } = config.resolution;
  const cfg = config.cometConfig;
  const lifetime = cfg.fallDuration + cfg.fadeOutDuration;

  const isNoteInViewRange = (midi: number) =>
    midi <= cfg.viewRangeTop && midi >= cfg.viewRangeBottom;

  for (const track of tracks) {
    if (!track.config.visible) continue;

    const startIdx = findFirstNoteIndexFrom(track.notes, currentTime - lifetime);
    for (let ni = startIdx; ni < track.notes.length; ni++) {
      const note = track.notes[ni];
      if (note.time > currentTime) break;
      if (!isNoteInViewRange(note.midi)) continue;

      const elapsed = currentTime - note.time;
      const fadeProgress = (elapsed - cfg.fallDuration) / cfg.fadeOutDuration;
      if (fadeProgress >= 1) continue;
      const alpha = fadeProgress > 0 ? 1 - fadeProgress : 1;
      const progress = Math.min(1, elapsed / cfg.fallDuration);

      const comet = computeComet(note, track, cfg, width, height);
      drawTrail(ctx, cfg, comet, elapsed, alpha);
      drawHead(ctx, comet, positionAt(comet, progress), alpha);
    }
  }
};
