import { test, expect, vi, beforeEach, Mock } from "vitest";

import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { createRenderer } from "@/lib/renderers/create-renderer";
import { drawFrame } from "@/lib/renderers/draw-frame";
import { type Renderer } from "@/lib/renderers/renderer";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer-config";
import { RendererController } from "@/lib/renderers/renderer-controller";

vi.mock("@/lib/renderers/create-renderer", () => ({
  createRenderer: vi.fn<() => Renderer>(() => vi.fn<Renderer>()),
}));

vi.mock("@/lib/renderers/draw-frame", () => ({
  drawFrame: vi.fn<() => void>(),
}));

let ctx: CanvasRenderingContext2D;
let mockCreateRenderer: Mock<typeof createRenderer>;
let mockRender: Mock<Renderer>;
const mockDrawFrame = vi.mocked(drawFrame);

function createMockFrequencyData(): FrequencyData {
  return {
    frequencyBinCount: 1024,
    frequencyData: new Uint8Array(1024),
    timeDomainData: new Uint8Array(1024),
    nyquistFrequency: 22050,
  };
}

beforeEach(() => {
  const canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d")!;
  mockRender = vi.fn<Renderer>();
  mockCreateRenderer = vi.mocked(createRenderer);
  mockCreateRenderer.mockReset();
  mockCreateRenderer.mockReturnValue(mockRender);
  mockDrawFrame.mockReset();
});

test("should not create renderer initially", () => {
  new RendererController(ctx);
  expect(mockCreateRenderer).not.toHaveBeenCalled();
});

test("should create renderer for the configured type when config is set", () => {
  const controller = new RendererController(ctx);
  const config = getDefaultRendererConfig();
  controller.setRendererConfig(config);

  expect(mockCreateRenderer).toHaveBeenCalledWith(config.type, ctx);
});

test("should recreate renderer when renderer type changes", () => {
  const controller = new RendererController(ctx);
  controller.setRendererConfig(getDefaultRendererConfig());
  controller.setRendererConfig({ ...getDefaultRendererConfig(), type: "comet" });

  expect(mockCreateRenderer).toHaveBeenCalledTimes(2);
  expect(mockCreateRenderer).toHaveBeenLastCalledWith("comet", ctx);
});

test("should keep the renderer when renderer type is same", () => {
  const controller = new RendererController(ctx);
  controller.setRendererConfig(getDefaultRendererConfig());
  controller.setRendererConfig({ ...getDefaultRendererConfig(), backgroundColor: "#ffffff" });

  expect(mockCreateRenderer).toHaveBeenCalledTimes(1);
});

test("should not create renderer when setting bitmap without config", () => {
  const controller = new RendererController(ctx);
  controller.setBackgroundImageBitmap({} as ImageBitmap);

  expect(mockCreateRenderer).not.toHaveBeenCalled();
});

test("should draw nothing without config", () => {
  const controller = new RendererController(ctx);

  expect(() => controller.render([], 0)).not.toThrow();
  expect(mockDrawFrame).not.toHaveBeenCalled();
});

test("should draw a frame with the latest config, the renderer and the frequency data", () => {
  const controller = new RendererController(ctx);
  const config1 = getDefaultRendererConfig();
  const config2 = { ...getDefaultRendererConfig(), backgroundColor: "#ffffff" };
  const frequencyData = createMockFrequencyData();

  controller.setRendererConfig(config1);
  controller.setRendererConfig(config2);
  controller.render([], 1.5, frequencyData);

  expect(mockDrawFrame).toHaveBeenCalledExactlyOnceWith(ctx, {
    config: config2,
    renderer: mockRender,
    tracks: [],
    currentTime: 1.5,
    frequencyData,
    backgroundImageBitmap: undefined,
  });
});

test.each(["before", "after"] as const)(
  "should draw the background bitmap set %s the config",
  (when) => {
    const controller = new RendererController(ctx);
    const config = getDefaultRendererConfig();
    const bitmap = {} as ImageBitmap;

    if (when === "before") controller.setBackgroundImageBitmap(bitmap);
    controller.setRendererConfig(config);
    if (when === "after") controller.setBackgroundImageBitmap(bitmap);
    controller.render([], 0);

    expect(mockDrawFrame).toHaveBeenCalledExactlyOnceWith(
      ctx,
      expect.objectContaining({ config, backgroundImageBitmap: bitmap }),
    );
  },
);

test("should scale the canvas to the configured resolution around the frame", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const scaledCtx = canvas.getContext("2d")!;
  const controller = new RendererController(scaledCtx);
  controller.setRendererConfig({
    ...getDefaultRendererConfig(),
    resolution: { width: 800, height: 600, label: "800×600" },
  });
  controller.render([], 0);

  expect(scaledCtx.setTransform).toHaveBeenCalledWith(0.5, 0, 0, 0.5, 0, 0);
  expect(scaledCtx.save).toHaveBeenCalledOnce();
  expect(scaledCtx.restore).toHaveBeenCalledOnce();
});
