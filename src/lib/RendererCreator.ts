import { Renderer } from "@/types/renderer";

export class RendererCreator {
  constructor(readonly create: (ctx: CanvasRenderingContext2D) => Renderer) {}
}
