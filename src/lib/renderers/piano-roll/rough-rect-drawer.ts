import { RendererContext } from "../renderer";
import { seededRandom } from "@/lib/seeded-random";

export class RoughRectDrawer {
  constructor(private ctx: RendererContext) {}

  draw(
    x: number,
    y: number,
    width: number,
    height: number,
    cornerRadius: number,
    intensity: number,
    segmentLength: number,
    seed: number,
  ): void {
    const cr = Math.min(cornerRadius, width / 2, height / 2);

    this.ctx.beginPath();

    // Top edge (left to right)
    this.ctx.moveTo(x + cr, y + this.getOffset(seed, 0, intensity));
    const topSegments = Math.ceil((width - cr * 2) / segmentLength);
    for (let i = 1; i <= topSegments; i++) {
      const px = x + cr + ((width - cr * 2) * i) / topSegments;
      const py = y + this.getOffset(seed, i, intensity);
      this.ctx.lineTo(px, py);
    }

    // Top-right corner (no offset on arcTo control points)
    this.ctx.arcTo(x + width, y, x + width, y + cr, cr);

    // Right edge (top to bottom)
    const rightSegments = Math.ceil((height - cr * 2) / segmentLength);
    for (let i = 1; i <= rightSegments; i++) {
      const px = x + width + this.getOffset(seed, 200 + i, intensity);
      const py = y + cr + ((height - cr * 2) * i) / rightSegments;
      this.ctx.lineTo(px, py);
    }

    // Bottom-right corner
    this.ctx.arcTo(x + width, y + height, x + width - cr, y + height, cr);

    // Bottom edge (right to left)
    const bottomSegments = Math.ceil((width - cr * 2) / segmentLength);
    for (let i = 1; i <= bottomSegments; i++) {
      const px = x + width - cr - ((width - cr * 2) * i) / bottomSegments;
      const py = y + height + this.getOffset(seed, 400 + i, intensity);
      this.ctx.lineTo(px, py);
    }

    // Bottom-left corner
    this.ctx.arcTo(x, y + height, x, y + height - cr, cr);

    // Left edge (bottom to top)
    const leftSegments = Math.ceil((height - cr * 2) / segmentLength);
    for (let i = 1; i <= leftSegments; i++) {
      const px = x + this.getOffset(seed, 600 + i, intensity);
      const py = y + height - cr - ((height - cr * 2) * i) / leftSegments;
      this.ctx.lineTo(px, py);
    }

    // Top-left corner
    this.ctx.arcTo(x, y, x + cr, y, cr);

    this.ctx.closePath();
  }

  private getOffset(seed: number, index: number, intensity: number): number {
    return (seededRandom(seed + index * 7) - 0.5) * 2 * intensity;
  }
}
