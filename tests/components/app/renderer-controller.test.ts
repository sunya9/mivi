import { RendererController } from "@/components/app/renderer-controller";
import { getRendererFromConfig } from "@/lib/renderers/get-renderer";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer";
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

let ctx: CanvasRenderingContext2D;
let mockGetRendererFromConfig: Mock;

beforeEach(() => {
  const canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d")!;
  mockGetRendererFromConfig = getRendererFromConfig as Mock;
  mockGetRendererFromConfig.mockClear();
  mockSetConfig.mockClear();
  mockSetBackgroundImageBitmap.mockClear();
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
