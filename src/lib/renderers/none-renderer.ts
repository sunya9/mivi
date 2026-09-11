import { RendererFactory } from "./renderer";

// Audio-only exports still show the background and audio visualizer, just no MIDI layer
export const createNoneRenderer: RendererFactory = () => () => {};
