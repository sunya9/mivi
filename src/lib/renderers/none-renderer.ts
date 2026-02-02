import { Renderer } from "./renderer";

/**
 * A renderer that renders nothing.
 * Used for audio-only exports where only the background and audio visualizer are shown.
 */
export class NoneRenderer extends Renderer {
  render(): void {
    // No MIDI visualization to render
  }
}
