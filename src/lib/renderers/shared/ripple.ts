import { RendererContext } from "@/lib/renderers/renderer";

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
