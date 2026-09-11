import { test, expect, vi, beforeEach, Mock } from "vitest";

import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { drawAudioVisualizer } from "@/lib/renderers/audio-visualizer-overlay";
import { drawBackground } from "@/lib/renderers/background-renderer";
import { createRenderer } from "@/lib/renderers/create-renderer";
import { getDefaultRendererConfig, type Renderer } from "@/lib/renderers/renderer";
import { RendererController } from "@/lib/visualizer/renderer-controller";

vi.mock("@/lib/renderers/create-renderer", () => ({
  createRenderer: vi.fn<() => Renderer>(() => vi.fn<Renderer>()),
}));

vi.mock("@/lib/renderers/background-renderer", () => ({
  drawBackground: vi.fn<() => void>(),
}));

vi.mock("@/lib/renderers/audio-visualizer-overlay", () => ({
  drawAudioVisualizer: vi.fn<() => void>(),
}));

let ctx: CanvasRenderingContext2D;
let mockCreateRenderer: Mock<typeof createRenderer>;
let mockRender: Mock<Renderer>;
const mockDrawBackground = vi.mocked(drawBackground);
const mockDrawAudioVisualizer = vi.mocked(drawAudioVisualizer);

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
  mockDrawBackground.mockReset();
  mockDrawAudioVisualizer.mockReset();
});

test("should accept context in constructor", () => {
  const controller = new RendererController(ctx);
  expect(controller).toBeDefined();
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
  const config1 = getDefaultRendererConfig();
  const config2 = { ...getDefaultRendererConfig(), type: "comet" as const };

  controller.setRendererConfig(config1);
  controller.setRendererConfig(config2);

  expect(mockCreateRenderer).toHaveBeenCalledTimes(2);
  expect(mockCreateRenderer).toHaveBeenLastCalledWith("comet", ctx);
});

test("should keep the renderer when renderer type is same", () => {
  const controller = new RendererController(ctx);
  const config1 = getDefaultRendererConfig();
  const config2 = {
    ...getDefaultRendererConfig(),
    backgroundColor: "#ffffff",
  };

  controller.setRendererConfig(config1);
  controller.setRendererConfig(config2);

  expect(mockCreateRenderer).toHaveBeenCalledTimes(1);
});

test("should not create renderer when setting bitmap without config", () => {
  const controller = new RendererController(ctx);
  const mockBitmap = {} as ImageBitmap;

  controller.setBackgroundImageBitmap(mockBitmap);

  expect(mockCreateRenderer).not.toHaveBeenCalled();
});

test("should render with the latest config", () => {
  const controller = new RendererController(ctx);
  const config1 = getDefaultRendererConfig();
  const config2 = { ...getDefaultRendererConfig(), backgroundColor: "#ffffff" };

  controller.setRendererConfig(config1);
  controller.setRendererConfig(config2);
  controller.render([], 0);

  expect(mockRender).toHaveBeenCalledWith([], 0, config2);
});

test("should draw nothing without config", () => {
  const controller = new RendererController(ctx);

  expect(() => controller.render([], 0)).not.toThrow();
  expect(mockRender).not.toHaveBeenCalled();
  expect(mockDrawBackground).not.toHaveBeenCalled();
  expect(mockDrawAudioVisualizer).not.toHaveBeenCalled();
});

test("should draw the background with the latest config and no bitmap by default", () => {
  const controller = new RendererController(ctx);
  const config1 = getDefaultRendererConfig();
  const config2 = { ...getDefaultRendererConfig(), backgroundColor: "#ffffff" };

  controller.setRendererConfig(config1);
  controller.setRendererConfig(config2);
  controller.render([], 0);

  expect(mockDrawBackground).toHaveBeenCalledExactlyOnceWith(ctx, config2, undefined);
});

test("should draw the background with the bitmap set after the config", () => {
  const controller = new RendererController(ctx);
  const config = getDefaultRendererConfig();
  const mockBitmap = {} as ImageBitmap;

  controller.setRendererConfig(config);
  controller.setBackgroundImageBitmap(mockBitmap);
  controller.render([], 0);

  expect(mockDrawBackground).toHaveBeenCalledExactlyOnceWith(ctx, config, mockBitmap);
});

test("should draw the background with the bitmap set before the config", () => {
  const controller = new RendererController(ctx);
  const config = getDefaultRendererConfig();
  const mockBitmap = {} as ImageBitmap;

  controller.setBackgroundImageBitmap(mockBitmap);
  controller.setRendererConfig(config);
  controller.render([], 0);

  expect(mockDrawBackground).toHaveBeenCalledExactlyOnceWith(ctx, config, mockBitmap);
});

test.each(["front", "back"] as const)(
  "should draw the audio visualizer when layer is %s and frequencyData exists",
  (audioVisualizerLayer) => {
    const controller = new RendererController(ctx);
    const config = { ...getDefaultRendererConfig(), audioVisualizerLayer };
    controller.setRendererConfig(config);

    const frequencyData = createMockFrequencyData();
    controller.render([], 0, frequencyData);

    expect(mockDrawAudioVisualizer).toHaveBeenCalledExactlyOnceWith(
      ctx,
      frequencyData,
      config.audioVisualizerConfig,
      config.resolution,
    );
  },
);

test.each([null, undefined])(
  "should not draw the audio visualizer when frequencyData is %s",
  (frequencyData) => {
    const controller = new RendererController(ctx);
    const config = {
      ...getDefaultRendererConfig(),
      audioVisualizerLayer: "front" as const,
    };
    controller.setRendererConfig(config);
    controller.render([], 0, frequencyData);

    expect(mockDrawAudioVisualizer).not.toHaveBeenCalled();
  },
);

test("should draw the audio visualizer with the latest config", () => {
  const controller = new RendererController(ctx);
  const config1 = getDefaultRendererConfig();
  const config2 = {
    ...getDefaultRendererConfig(),
    audioVisualizerConfig: {
      ...getDefaultRendererConfig().audioVisualizerConfig,
      style: "bars" as const,
    },
  };

  controller.setRendererConfig(config1);
  controller.setRendererConfig(config2);
  const frequencyData = createMockFrequencyData();
  controller.render([], 0, frequencyData);

  expect(mockDrawAudioVisualizer).toHaveBeenCalledExactlyOnceWith(
    ctx,
    frequencyData,
    config2.audioVisualizerConfig,
    config2.resolution,
  );
});

test.each([
  { audioVisualizerLayer: "back" as const, order: ["background", "audioVisualizer", "midi"] },
  { audioVisualizerLayer: "front" as const, order: ["background", "midi", "audioVisualizer"] },
])(
  "should render in order $order when layer is $audioVisualizerLayer",
  ({ audioVisualizerLayer, order }) => {
    const callOrder: string[] = [];

    mockDrawBackground.mockImplementation(() => {
      callOrder.push("background");
    });
    mockDrawAudioVisualizer.mockImplementation(() => {
      callOrder.push("audioVisualizer");
    });
    mockRender.mockImplementation(() => {
      callOrder.push("midi");
    });

    const controller = new RendererController(ctx);
    controller.setRendererConfig({ ...getDefaultRendererConfig(), audioVisualizerLayer });
    controller.render([], 0, createMockFrequencyData());

    expect(callOrder).toEqual(order);
  },
);
