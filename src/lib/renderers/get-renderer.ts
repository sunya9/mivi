import { CometRenderer } from "./comet/comet-renderer";
import { NoneRenderer } from "./none-renderer";
import { PianoRollRenderer } from "./piano-roll/piano-roll-renderer";
import { RendererContext, RendererConfig, Renderer, RendererType } from "./renderer";

type RendererConstructor = new (ctx: RendererContext, config: RendererConfig) => Renderer;

const rendererClasses: Record<RendererType, RendererConstructor> = {
  none: NoneRenderer,
  pianoRoll: PianoRollRenderer,
  comet: CometRenderer,
};

export function getRendererFromConfig(ctx: RendererContext, config: RendererConfig): Renderer {
  return new rendererClasses[config.type](ctx, config);
}
