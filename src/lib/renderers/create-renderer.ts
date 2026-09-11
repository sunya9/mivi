import { createCometRenderer } from "./comet/comet-renderer";
import { createNoneRenderer } from "./none-renderer";
import { createPianoRollRenderer } from "./piano-roll/piano-roll-renderer";
import { Renderer, RendererContext, RendererFactory, RendererType } from "./renderer";
import { createVerticalPianoRollRenderer } from "./vertical-piano-roll/vertical-piano-roll-renderer";

const rendererFactories: Record<RendererType, RendererFactory> = {
  none: createNoneRenderer,
  pianoRoll: createPianoRollRenderer,
  verticalPianoRoll: createVerticalPianoRollRenderer,
  comet: createCometRenderer,
};

export function createRenderer(type: RendererType, ctx: RendererContext): Renderer {
  return rendererFactories[type](ctx);
}
