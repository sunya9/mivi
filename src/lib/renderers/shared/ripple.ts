import { RendererContext } from "@/lib/renderers/renderer";

export interface PendingRipple {
  x: number;
  y: number;
  progress: number;
  color: string;
  opacity: number;
}

const RIPPLE_PEAK_ALPHA = 0.4;

export function drawRipple(
  ctx: RendererContext,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number,
): void {
  if (alpha <= 0 || radius < 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = alpha;
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

// Ripples are queued while notes are drawn and painted afterwards so they sit above every note
export function drawPendingRipples(
  ctx: RendererContext,
  ripples: readonly PendingRipple[],
  rippleRadius: number,
): void {
  for (const ripple of ripples) {
    drawRipple(
      ctx,
      ripple.x,
      ripple.y,
      rippleRadius * ripple.progress,
      ripple.color,
      RIPPLE_PEAK_ALPHA * (1 - ripple.progress) * ripple.opacity,
    );
  }
}
