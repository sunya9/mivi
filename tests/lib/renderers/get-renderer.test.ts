import {
  RendererContext,
  RendererConfig,
  getDefaultRendererConfig,
} from "@/lib/renderers/renderer";
import { getRendererFromConfig } from "@/lib/renderers/get-renderer";
import { PianoRollRenderer } from "@/lib/renderers/piano-roll/piano-roll-renderer";
import { test, expect } from "vitest";

const canvas = document.createElement("canvas");
const mockContext: RendererContext = canvas.getContext("2d")!;

const mockConfig: RendererConfig = getDefaultRendererConfig();

test("should return PianoRollRenderer for pianoRoll type", () => {
  const config: RendererConfig = { ...mockConfig, type: "pianoRoll" };
  const renderer = getRendererFromConfig(mockContext, config);
  expect(renderer).toBeInstanceOf(PianoRollRenderer);
});
