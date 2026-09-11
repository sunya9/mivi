import { MidiTrack } from "@/lib/midi/midi";
import { RendererConfig } from "@/lib/renderers/renderer-config";

export type RendererContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export type Renderer = (tracks: MidiTrack[], currentTime: number, config: RendererConfig) => void;

export type RendererFactory = (ctx: RendererContext) => Renderer;
