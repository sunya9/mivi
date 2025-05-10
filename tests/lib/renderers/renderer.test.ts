import {
  getDefaultRendererConfig,
  Renderer,
  RendererConfig,
  RendererContext,
  BackgroundImageFit,
  BackgroundImagePosition,
  BackgroundImageRepeat,
} from "@/lib/renderers/renderer";
import { expect, test, vi } from "vitest";

class TestRenderer extends Renderer {
  constructor(
    ctx: RendererContext,
    config: RendererConfig,
    backgroundImageBitmap?: ImageBitmap,
  ) {
    super(ctx, config, backgroundImageBitmap);
  }

  render() {
    super.renderCommonVisual();
  }
}

function prepareImage(width: number, height: number) {
  return window.createImageBitmap(
    new Blob([], { type: "image/png" }),
    0,
    0,
    width,
    height,
  );
}

function prepareTestRenderer(options?: {
  canvasSize?: {
    width: number;
    height: number;
  };
  backgroundImageBitmap?: ImageBitmap;
  rendererConfig?: RendererConfig;
}) {
  const config = options?.rendererConfig ?? getDefaultRendererConfig();
  const canvas = document.createElement("canvas");
  if (options?.canvasSize) {
    canvas.width = options.canvasSize.width;
    canvas.height = options.canvasSize.height;
  }
  const context = canvas.getContext("2d")!;
  const renderer = new TestRenderer(
    context,
    config,
    options?.backgroundImageBitmap,
  );

  return { context, renderer };
}

test("should render", () => {
  const { context, renderer } = prepareTestRenderer({
    rendererConfig: {
      ...getDefaultRendererConfig(),
      backgroundColor: "#00ff00",
    },
  });

  context.clearRect = vi.fn();
  context.drawImage = vi.fn();
  context.fillStyle = "";
  context.fillRect = vi.fn();
  renderer.render();
  expect(context.clearRect).toHaveBeenCalledWith(0, 0, 300, 150);
  expect(context.fillStyle).toBe("#00ff00");
  expect(context.fillRect).toHaveBeenCalledWith(0, 0, 300, 150);
  expect(context.drawImage).not.toHaveBeenCalled();
});

test.each([
  {
    fit: "cover" as const,
    expected: {
      drawWidth: 200,
      drawHeight: 100,
      offsetX: -50,
      offsetY: 0,
    },
  },
  {
    fit: "contain" as const,
    expected: {
      drawWidth: 100,
      drawHeight: 50,
      offsetX: 0,
      offsetY: 25,
    },
  },
])("should render with fit: $fit", async ({ fit, expected }) => {
  const imageBitmap = await prepareImage(200, 100);
  const { context, renderer } = prepareTestRenderer({
    backgroundImageBitmap: imageBitmap,
    canvasSize: { width: 100, height: 100 },
    rendererConfig: {
      ...getDefaultRendererConfig(),
      backgroundImageFit: fit,
    },
  });

  context.drawImage = vi.fn();
  renderer.render();

  expect(context.drawImage).toHaveBeenCalledWith(
    imageBitmap,
    expected.offsetX,
    expected.offsetY,
    expected.drawWidth,
    expected.drawHeight,
  );
});

test.each([
  {
    position: "top-left" as const,
    expected: { x: 0, y: 0 },
  },
  {
    position: "top" as const,
    expected: { x: 0, y: 0 },
  },
  {
    position: "top-right" as const,
    expected: { x: 0, y: 0 },
  },
  {
    position: "left" as const,
    expected: { x: 0, y: -75 },
  },
  {
    position: "center" as const,
    expected: { x: 0, y: -75 },
  },
  {
    position: "right" as const,
    expected: { x: 0, y: -75 },
  },
  {
    position: "bottom-left" as const,
    expected: { x: 0, y: -150 },
  },
  {
    position: "bottom" as const,
    expected: { x: 0, y: -150 },
  },
  {
    position: "bottom-right" as const,
    expected: { x: 0, y: -150 },
  },
])("should render with position: $position", async ({ position, expected }) => {
  const imageBitmap = await prepareImage(150, 150);
  const { context, renderer } = prepareTestRenderer({
    backgroundImageBitmap: imageBitmap,
    rendererConfig: {
      ...getDefaultRendererConfig(),
      backgroundImagePosition: position,
    },
  });

  context.drawImage = vi.fn();
  renderer.render();

  expect(context.drawImage).toHaveBeenCalledWith(
    imageBitmap,
    expected.x,
    expected.y,
    300,
    300,
  );
});

const noRepeatParameters = {
  repeat: "no-repeat" as const,
  expected: {
    x: 0,
    y: -75,
    width: 300,
    height: 300,
  },
};

const patternParameters: {
  repeat: BackgroundImageRepeat;
  pattern: string;
}[] = [
  {
    repeat: "repeat",
    pattern: "repeat",
  },
  {
    repeat: "repeat-x",
    pattern: "repeat-x",
  },
  {
    repeat: "repeat-y",
    pattern: "repeat-y",
  },
];

test("should render with no-repeat", async () => {
  const imageBitmap = await prepareImage(150, 150);
  const { context, renderer } = prepareTestRenderer({
    backgroundImageBitmap: imageBitmap,
    rendererConfig: {
      ...getDefaultRendererConfig(),
      backgroundImageRepeat: noRepeatParameters.repeat,
    },
  });

  context.drawImage = vi.fn();
  renderer.render();

  expect(context.drawImage).toHaveBeenCalledWith(
    imageBitmap,
    noRepeatParameters.expected.x,
    noRepeatParameters.expected.y,
    noRepeatParameters.expected.width,
    noRepeatParameters.expected.height,
  );
});

test.each(patternParameters)(
  "should render with pattern: $repeat",
  async ({ repeat, pattern }) => {
    const imageBitmap = await prepareImage(150, 150);
    const { context, renderer } = prepareTestRenderer({
      backgroundImageBitmap: imageBitmap,
      rendererConfig: {
        ...getDefaultRendererConfig(),
        backgroundImageRepeat: repeat,
      },
    });

    context.createPattern = vi.fn().mockReturnValue({});
    context.fillRect = vi.fn();
    renderer.render();

    expect(context.createPattern).toHaveBeenCalledWith(imageBitmap, pattern);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 300, 150);
  },
);

test("should render with opacity", async () => {
  const imageBitmap = await prepareImage(150, 150);
  const config = getDefaultRendererConfig();
  config.backgroundImageOpacity = 0.5;
  const { context, renderer } = prepareTestRenderer({
    backgroundImageBitmap: imageBitmap,
    rendererConfig: config,
  });

  context.drawImage = vi.fn();
  context.save = vi.fn();
  context.restore = vi.fn();
  context.globalAlpha = 1;

  renderer.render();

  expect(context.save).toHaveBeenCalled();
  expect(context.globalAlpha).toBe(0.5);
  expect(context.restore).toHaveBeenCalled();
  expect(context.drawImage).toHaveBeenCalledWith(imageBitmap, 0, -75, 300, 300);
});

test("should render with cover when imgRatio > canvasRatio (no fraction)", async () => {
  // 画像: 200x100 (アスペクト比2.0)、キャンバス: 100x100 (アスペクト比1.0)
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d")!;
  const imageBitmap = await window.createImageBitmap(
    new Blob([], { type: "image/png" }),
    0,
    0,
    200,
    100,
  );
  const config = getDefaultRendererConfig();
  config.backgroundImageFit = "cover";
  const renderer = new TestRenderer(ctx, config, imageBitmap);

  ctx.clearRect = vi.fn();
  ctx.drawImage = vi.fn();
  renderer.render();

  // cover: 高さに合わせて描画、幅は100*2=200, xオフセットは(100-200)/2=-50
  expect(ctx.drawImage).toHaveBeenCalledWith(imageBitmap, -50, 0, 200, 100);
});

test("should render with contain when imgRatio > canvasRatio (no fraction)", async () => {
  // 画像: 200x100 (アスペクト比2.0)、キャンバス: 100x100 (アスペクト比1.0)
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d")!;
  const imageBitmap = await window.createImageBitmap(
    new Blob([], { type: "image/png" }),
    0,
    0,
    200,
    100,
  );
  const config = getDefaultRendererConfig();
  config.backgroundImageFit = "contain";
  const renderer = new TestRenderer(ctx, config, imageBitmap);

  ctx.clearRect = vi.fn();
  ctx.drawImage = vi.fn();
  renderer.render();

  // contain: 幅に合わせて描画、幅100, 高さ100/2=50, yオフセットは(100-50)/2=25
  expect(ctx.drawImage).toHaveBeenCalledWith(imageBitmap, 0, 25, 100, 50);
});

test("should render with contain when canvasRatio > imgRatio (no fraction)", async () => {
  // 画像: 100x200 (アスペクト比0.5)、キャンバス: 200x100 (アスペクト比2.0)
  const imageBitmap = await prepareImage(100, 200);
  const { context, renderer } = prepareTestRenderer({
    canvasSize: { width: 200, height: 100 },
    backgroundImageBitmap: imageBitmap,
    rendererConfig: {
      ...getDefaultRendererConfig(),
      backgroundImageFit: "contain",
    },
  });

  context.drawImage = vi.fn();
  renderer.render();

  // contain: 高さに合わせて描画、高さ100, 幅100*0.5=50, xオフセットは(200-50)/2=75
  expect(context.drawImage).toHaveBeenCalledWith(imageBitmap, 75, 0, 50, 100);
});

test("throw error when unknown background image fit", async () => {
  const config = getDefaultRendererConfig();
  config.backgroundImageFit = "unknown" as BackgroundImageFit;
  const imageBitmap = await prepareImage(150, 150);
  const { renderer } = prepareTestRenderer({
    rendererConfig: config,
    backgroundImageBitmap: imageBitmap,
  });
  expect(() => renderer.render()).toThrow(
    "Unknown background image fit: unknown",
  );
});

test("throw error when unknown background image position", async () => {
  const config = getDefaultRendererConfig();
  config.backgroundImagePosition = "unknown" as BackgroundImagePosition;
  const imageBitmap = await prepareImage(150, 150);
  const { renderer } = prepareTestRenderer({
    rendererConfig: config,
    backgroundImageBitmap: imageBitmap,
  });
  expect(() => renderer.render()).toThrow(
    "Unknown background image position: unknown",
  );
});

test("should handle null pattern", async () => {
  const imageBitmap = await prepareImage(150, 150);
  const { context, renderer } = prepareTestRenderer({
    backgroundImageBitmap: imageBitmap,
    rendererConfig: {
      ...getDefaultRendererConfig(),
      backgroundImageRepeat: "repeat",
    },
  });

  context.createPattern = vi.fn().mockReturnValue(null);
  context.fillRect = vi.fn();
  renderer.render();

  expect(context.createPattern).toHaveBeenCalledWith(imageBitmap, "repeat");
  // fillRect is called once with background color only
  expect(context.fillRect).toHaveBeenCalledExactlyOnceWith(0, 0, 300, 150);
});
