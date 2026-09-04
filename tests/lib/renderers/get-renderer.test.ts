import { test, expect } from "vitest";

import { getRendererFromConfig } from "@/lib/renderers/get-renderer";
import { NoneRenderer } from "@/lib/renderers/none-renderer";
import { PianoRollRenderer } from "@/lib/renderers/piano-roll/piano-roll-renderer";
import {
  RendererContext,
  RendererConfig,
  getDefaultRendererConfig,
} from "@/lib/renderers/renderer";
import { VerticalPianoRollRenderer } from "@/lib/renderers/vertical-piano-roll/vertical-piano-roll-renderer";

const canvas = document.createElement("canvas");
const mockContext: RendererContext = canvas.getContext("2d")!;

const mockConfig: RendererConfig = getDefaultRendererConfig();

test("should return NoneRenderer for none type", () => {
  const config: RendererConfig = { ...mockConfig, type: "none" };
  const renderer = getRendererFromConfig(mockContext, config);
  expect(renderer).toBeInstanceOf(NoneRenderer);
});

test("should return PianoRollRenderer for pianoRoll type", () => {
  const config: RendererConfig = { ...mockConfig, type: "pianoRoll" };
  const renderer = getRendererFromConfig(mockContext, config);
  expect(renderer).toBeInstanceOf(PianoRollRenderer);
});

test("should return VerticalPianoRollRenderer for verticalPianoRoll type", () => {
  const config: RendererConfig = { ...mockConfig, type: "verticalPianoRoll" };
  const renderer = getRendererFromConfig(mockContext, config);
  expect(renderer).toBeInstanceOf(VerticalPianoRollRenderer);
});
