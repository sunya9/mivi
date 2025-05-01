import { RendererContext, RendererConfig, Renderer } from "./renderer";
import { PianoRollRenderer } from "./piano-roll-renderer";

export function getRendererFromConfig(
  ctx: RendererContext,
  config: RendererConfig,
  backgroundImageBitmap?: ImageBitmap,
): Renderer {
  switch (config.type) {
    case "pianoRoll":
      return new PianoRollRenderer(ctx, config, backgroundImageBitmap);
    default: {
      const configType = config.type satisfies never;
      throw new Error(`Unknown renderer type: ${String(configType)}`);
    }
  }
}
