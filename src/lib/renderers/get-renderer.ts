import {
  RendererContext,
  RendererConfig,
  Renderer,
  RendererType,
} from "./renderer";
import { NoneRenderer } from "./none-renderer";
import { PianoRollRenderer } from "./piano-roll/piano-roll-renderer";
import { CometRenderer } from "./comet/comet-renderer";

type RendererConstructor = new (
  ctx: RendererContext,
  config: RendererConfig,
  backgroundImageBitmap?: ImageBitmap,
) => Renderer;

const rendererClasses: Record<RendererType, RendererConstructor> = {
  none: NoneRenderer,
  pianoRoll: PianoRollRenderer,
  comet: CometRenderer,
};

export function getRendererFromConfig(
  ctx: RendererContext,
  config: RendererConfig,
  backgroundImageBitmap?: ImageBitmap,
): Renderer {
  return new rendererClasses[config.type](ctx, config, backgroundImageBitmap);
}
