import {
  RendererContext,
  RendererConfig,
  getDefaultRendererConfig,
  getRendererFromConfig,
  PianoRollRenderer,
} from "@/lib/renderers";
import { test, expect } from "vitest";

const canvas = document.createElement("canvas");
const mockContext: RendererContext = canvas.getContext("2d")!;

const mockConfig: RendererConfig = getDefaultRendererConfig();

test("should return PianoRollRenderer for pianoRoll type", () => {
  const config: RendererConfig = { ...mockConfig, type: "pianoRoll" };
  const renderer = getRendererFromConfig(mockContext, config);
  expect(renderer).toBeInstanceOf(PianoRollRenderer);
});

test("should throw error for unknown renderer type", () => {
  const config = {
    ...mockConfig,
    type: "unknown",
  } as unknown as RendererConfig;
  expect(() => getRendererFromConfig(mockContext, config)).toThrow(
    "Unknown renderer type",
  );
});
