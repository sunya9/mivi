import { expect, test, onTestFinished } from "vitest";
import { page } from "vitest/browser";
import { BackgroundRenderer } from "@/lib/renderers/background-renderer";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer";

const WIDTH = 800;
const HEIGHT = 600;

function createTestCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.setAttribute("data-testid", "vrt-canvas");
  document.body.appendChild(canvas);
  return canvas;
}

async function createTestImageBitmap(
  width: number,
  height: number,
): Promise<ImageBitmap> {
  const offscreen = new OffscreenCanvas(width, height);
  const ctx = offscreen.getContext("2d")!;

  // Create a gradient pattern for visual distinction
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#3b82f6");
  gradient.addColorStop(0.5, "#8b5cf6");
  gradient.addColorStop(1, "#ec4899");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add some shapes for visual reference
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.beginPath();
  ctx.arc(width / 3, height / 3, Math.min(width, height) / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.arc(
    (width * 2) / 3,
    (height * 2) / 3,
    Math.min(width, height) / 5,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  return createImageBitmap(offscreen);
}

test("solid color background", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  const config = {
    ...getDefaultRendererConfig(),
    backgroundColor: "#1a1a1a",
    backgroundImageEnabled: false,
  };

  const renderer = new BackgroundRenderer(ctx, config);
  renderer.render();

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot("background-solid");
});

test("background image with cover fit", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  const imageBitmap = await createTestImageBitmap(400, 300);

  const config = {
    ...getDefaultRendererConfig(),
    backgroundColor: "#1a1a1a",
    backgroundImageEnabled: true,
    backgroundImageFit: "cover" as const,
    backgroundImagePosition: "center" as const,
    backgroundImageRepeat: "no-repeat" as const,
    backgroundImageOpacity: 1,
  };

  const renderer = new BackgroundRenderer(ctx, config, imageBitmap);
  renderer.render();

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot("background-image-cover");
});

test("background image with contain fit", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  const imageBitmap = await createTestImageBitmap(400, 300);

  const config = {
    ...getDefaultRendererConfig(),
    backgroundColor: "#2d3748",
    backgroundImageEnabled: true,
    backgroundImageFit: "contain" as const,
    backgroundImagePosition: "center" as const,
    backgroundImageRepeat: "no-repeat" as const,
    backgroundImageOpacity: 1,
  };

  const renderer = new BackgroundRenderer(ctx, config, imageBitmap);
  renderer.render();

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot("background-image-contain");
});
