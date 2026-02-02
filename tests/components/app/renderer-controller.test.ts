import { RendererController } from "@/components/app/renderer-controller";
import { getRendererFromConfig } from "@/lib/renderers/get-renderer";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer";
import { BackgroundRenderer } from "@/lib/renderers/background-renderer";
import { AudioVisualizerOverlay } from "@/lib/renderers/audio-visualizer-overlay";
import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { test, expect, vi, beforeEach, Mock } from "vitest";

const mockSetConfig = vi.fn();
const mockSetBackgroundImageBitmap = vi.fn();

vi.mock("@/lib/renderers/get-renderer", () => ({
  getRendererFromConfig: vi.fn(() => ({
    render: vi.fn(),
    setConfig: mockSetConfig,
    setBackgroundImageBitmap: mockSetBackgroundImageBitmap,
  })),
}));

const mockBackgroundRendererRender = vi.fn();
const mockBackgroundRendererSetConfig = vi.fn();
const mockBackgroundRendererSetBackgroundImageBitmap = vi.fn();

vi.mock("@/lib/renderers/background-renderer", () => {
  return {
    BackgroundRenderer: vi.fn(function (this: unknown) {
      (this as Record<string, unknown>).render = mockBackgroundRendererRender;
      (this as Record<string, unknown>).setConfig =
        mockBackgroundRendererSetConfig;
      (this as Record<string, unknown>).setBackgroundImageBitmap =
        mockBackgroundRendererSetBackgroundImageBitmap;
    }),
  };
});

const mockAudioVisualizerOverlayRender = vi.fn();
const mockAudioVisualizerOverlaySetConfig = vi.fn();

vi.mock("@/lib/renderers/audio-visualizer-overlay", () => {
  return {
    AudioVisualizerOverlay: vi.fn(function (this: unknown) {
      (this as Record<string, unknown>).render =
        mockAudioVisualizerOverlayRender;
      (this as Record<string, unknown>).setConfig =
        mockAudioVisualizerOverlaySetConfig;
    }),
  };
});

let ctx: CanvasRenderingContext2D;
let mockGetRendererFromConfig: Mock;

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
  mockGetRendererFromConfig = getRendererFromConfig as Mock;
  mockGetRendererFromConfig.mockReset();
  mockGetRendererFromConfig.mockReturnValue({
    render: vi.fn(),
    setConfig: mockSetConfig,
    setBackgroundImageBitmap: mockSetBackgroundImageBitmap,
  });
  mockSetConfig.mockClear();
  mockSetBackgroundImageBitmap.mockClear();
  mockBackgroundRendererRender.mockClear();
  mockBackgroundRendererSetConfig.mockClear();
  mockBackgroundRendererSetBackgroundImageBitmap.mockClear();
  mockAudioVisualizerOverlayRender.mockClear();
  mockAudioVisualizerOverlaySetConfig.mockClear();
  (BackgroundRenderer as Mock).mockClear();
  (AudioVisualizerOverlay as Mock).mockClear();
});

test("should accept context in constructor", () => {
  const controller = new RendererController(ctx);
  expect(controller).toBeDefined();
});

test("should not create renderer initially", () => {
  new RendererController(ctx);
  expect(mockGetRendererFromConfig).not.toHaveBeenCalled();
});

test("should create renderer when config is set", () => {
  const controller = new RendererController(ctx);
  const config = getDefaultRendererConfig();
  controller.setRendererConfig(config);

  expect(mockGetRendererFromConfig).toHaveBeenCalledWith(
    ctx,
    config,
    undefined,
  );
});

test("should recreate renderer when renderer type changes", () => {
  const controller = new RendererController(ctx);
  const config1 = getDefaultRendererConfig();
  const config2 = { ...getDefaultRendererConfig(), type: "comet" as const };

  controller.setRendererConfig(config1);
  controller.setRendererConfig(config2);

  expect(mockGetRendererFromConfig).toHaveBeenCalledTimes(2);
  expect(mockGetRendererFromConfig).toHaveBeenLastCalledWith(
    ctx,
    config2,
    undefined,
  );
});

test("should call setConfig instead of recreating when renderer type is same", () => {
  const controller = new RendererController(ctx);
  const config1 = getDefaultRendererConfig();
  const config2 = {
    ...getDefaultRendererConfig(),
    backgroundColor: "#ffffff",
  };

  controller.setRendererConfig(config1);
  mockGetRendererFromConfig.mockClear();
  controller.setRendererConfig(config2);

  expect(mockGetRendererFromConfig).not.toHaveBeenCalled();
  expect(mockSetConfig).toHaveBeenCalledWith(config2);
});

test("should not create renderer when setting bitmap without config", () => {
  const controller = new RendererController(ctx);
  const mockBitmap = {} as ImageBitmap;

  controller.setBackgroundImageBitmap(mockBitmap);

  expect(mockGetRendererFromConfig).not.toHaveBeenCalled();
});

test("should call renderer.setBackgroundImageBitmap instead of recreating", () => {
  const controller = new RendererController(ctx);
  const config = getDefaultRendererConfig();
  const mockBitmap = {} as ImageBitmap;

  controller.setRendererConfig(config);
  mockGetRendererFromConfig.mockClear();
  controller.setBackgroundImageBitmap(mockBitmap);

  expect(mockGetRendererFromConfig).not.toHaveBeenCalled();
  expect(mockSetBackgroundImageBitmap).toHaveBeenCalledWith(mockBitmap);
});

test("should pass bitmap to new renderer when config is set after bitmap", () => {
  const controller = new RendererController(ctx);
  const config = getDefaultRendererConfig();
  const mockBitmap = {} as ImageBitmap;

  controller.setBackgroundImageBitmap(mockBitmap);
  controller.setRendererConfig(config);

  expect(mockGetRendererFromConfig).toHaveBeenCalledWith(
    ctx,
    config,
    mockBitmap,
  );
});

test("should call renderer.render when renderer exists", () => {
  const mockRender = vi.fn();
  mockGetRendererFromConfig.mockReturnValue({ render: mockRender });

  const controller = new RendererController(ctx);
  controller.setRendererConfig(getDefaultRendererConfig());
  controller.render([], 0);

  expect(mockRender).toHaveBeenCalledWith([], 0);
});

test("should not throw when calling render without renderer", () => {
  const controller = new RendererController(ctx);

  expect(() => controller.render([], 0)).not.toThrow();
});

test("should create BackgroundRenderer when config is set", () => {
  const controller = new RendererController(ctx);
  const config = getDefaultRendererConfig();
  controller.setRendererConfig(config);

  expect(BackgroundRenderer).toHaveBeenCalledWith(ctx, config, undefined);
});

test("should create AudioVisualizerOverlay when config is set", () => {
  const controller = new RendererController(ctx);
  const config = getDefaultRendererConfig();
  controller.setRendererConfig(config);

  expect(AudioVisualizerOverlay).toHaveBeenCalledWith(
    ctx,
    config.audioVisualizerConfig,
  );
});

test("should call backgroundRenderer.render on render", () => {
  const controller = new RendererController(ctx);
  controller.setRendererConfig(getDefaultRendererConfig());
  controller.render([], 0);

  expect(mockBackgroundRendererRender).toHaveBeenCalled();
});

test("should call audioVisualizerOverlay.render when layer is front and frequencyData exists", () => {
  const controller = new RendererController(ctx);
  const config = {
    ...getDefaultRendererConfig(),
    audioVisualizerLayer: "front" as const,
  };
  controller.setRendererConfig(config);

  const frequencyData = createMockFrequencyData();
  controller.render([], 0, frequencyData);

  expect(mockAudioVisualizerOverlayRender).toHaveBeenCalledWith(frequencyData);
});

test("should call audioVisualizerOverlay.render when layer is back and frequencyData exists", () => {
  const controller = new RendererController(ctx);
  const config = {
    ...getDefaultRendererConfig(),
    audioVisualizerLayer: "back" as const,
  };
  controller.setRendererConfig(config);

  const frequencyData = createMockFrequencyData();
  controller.render([], 0, frequencyData);

  expect(mockAudioVisualizerOverlayRender).toHaveBeenCalledWith(frequencyData);
});

test("should not call audioVisualizerOverlay.render when frequencyData is null", () => {
  const controller = new RendererController(ctx);
  const config = {
    ...getDefaultRendererConfig(),
    audioVisualizerLayer: "front" as const,
  };
  controller.setRendererConfig(config);
  controller.render([], 0, null);

  expect(mockAudioVisualizerOverlayRender).not.toHaveBeenCalled();
});

test("should not call audioVisualizerOverlay.render when frequencyData is undefined", () => {
  const controller = new RendererController(ctx);
  const config = {
    ...getDefaultRendererConfig(),
    audioVisualizerLayer: "front" as const,
  };
  controller.setRendererConfig(config);
  controller.render([], 0, undefined);

  expect(mockAudioVisualizerOverlayRender).not.toHaveBeenCalled();
});

test("should render in correct order: background -> back visualizer -> midi -> front visualizer", () => {
  const callOrder: string[] = [];

  mockBackgroundRendererRender.mockImplementation(() => {
    callOrder.push("background");
  });
  mockAudioVisualizerOverlayRender.mockImplementation(() => {
    callOrder.push("audioVisualizer");
  });
  const mockMidiRender = vi.fn(() => {
    callOrder.push("midi");
  });
  mockGetRendererFromConfig.mockReturnValue({ render: mockMidiRender });

  const controller = new RendererController(ctx);
  const config = {
    ...getDefaultRendererConfig(),
    audioVisualizerLayer: "back" as const,
  };
  controller.setRendererConfig(config);

  const frequencyData = createMockFrequencyData();
  controller.render([], 0, frequencyData);

  expect(callOrder).toEqual(["background", "audioVisualizer", "midi"]);
});

test("should render in correct order: background -> midi -> front visualizer", () => {
  const callOrder: string[] = [];

  mockBackgroundRendererRender.mockImplementation(() => {
    callOrder.push("background");
  });
  mockAudioVisualizerOverlayRender.mockImplementation(() => {
    callOrder.push("audioVisualizer");
  });
  const mockMidiRender = vi.fn(() => {
    callOrder.push("midi");
  });
  mockGetRendererFromConfig.mockReturnValue({ render: mockMidiRender });

  const controller = new RendererController(ctx);
  const config = {
    ...getDefaultRendererConfig(),
    audioVisualizerLayer: "front" as const,
  };
  controller.setRendererConfig(config);

  const frequencyData = createMockFrequencyData();
  controller.render([], 0, frequencyData);

  expect(callOrder).toEqual(["background", "midi", "audioVisualizer"]);
});

test("should update backgroundRenderer config instead of recreating", () => {
  const controller = new RendererController(ctx);
  const config1 = getDefaultRendererConfig();
  const config2 = { ...getDefaultRendererConfig(), backgroundColor: "#ffffff" };

  controller.setRendererConfig(config1);
  (BackgroundRenderer as Mock).mockClear();
  controller.setRendererConfig(config2);

  expect(BackgroundRenderer).not.toHaveBeenCalled();
  expect(mockBackgroundRendererSetConfig).toHaveBeenCalledWith(config2);
});

test("should update audioVisualizerOverlay config instead of recreating", () => {
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
  (AudioVisualizerOverlay as Mock).mockClear();
  controller.setRendererConfig(config2);

  expect(AudioVisualizerOverlay).not.toHaveBeenCalled();
  expect(mockAudioVisualizerOverlaySetConfig).toHaveBeenCalledWith(
    config2.audioVisualizerConfig,
  );
});

test("should call backgroundRenderer.setBackgroundImageBitmap when bitmap is set", () => {
  const controller = new RendererController(ctx);
  const config = getDefaultRendererConfig();
  const mockBitmap = {} as ImageBitmap;

  controller.setRendererConfig(config);
  controller.setBackgroundImageBitmap(mockBitmap);

  expect(mockBackgroundRendererSetBackgroundImageBitmap).toHaveBeenCalledWith(
    mockBitmap,
  );
});
