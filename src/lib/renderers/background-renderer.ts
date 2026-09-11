import {
  BackgroundImageFit,
  BackgroundImagePosition,
  RendererConfig,
  RendererContext,
} from "./renderer";

function calculateImageDimensions(
  fit: BackgroundImageFit,
  img: ImageBitmap,
  imgRatio: number,
  canvasRatio: number,
  width: number,
  height: number,
) {
  switch (fit) {
    case "auto":
      return {
        drawWidth: img.width,
        drawHeight: img.height,
        offsetX: (width - img.width) / 2,
        offsetY: (height - img.height) / 2,
      };
    case "cover":
      if (imgRatio > canvasRatio) {
        return {
          drawWidth: height * imgRatio,
          drawHeight: height,
          offsetX: (width - height * imgRatio) / 2,
          offsetY: 0,
        };
      } else {
        return {
          drawWidth: width,
          drawHeight: width / imgRatio,
          offsetX: 0,
          offsetY: (height - width / imgRatio) / 2,
        };
      }
    case "contain":
      if (imgRatio > canvasRatio) {
        return {
          drawWidth: width,
          drawHeight: width / imgRatio,
          offsetX: 0,
          offsetY: (height - width / imgRatio) / 2,
        };
      } else {
        return {
          drawWidth: height * imgRatio,
          drawHeight: height,
          offsetX: (width - height * imgRatio) / 2,
          offsetY: 0,
        };
      }
    default: {
      const _exhaustiveCheck: never = fit;
      throw new Error(`Unknown background image fit: ${String(_exhaustiveCheck)}`);
    }
  }
}

function adjustImagePosition(
  position: BackgroundImagePosition,
  width: number,
  height: number,
  drawWidth: number,
  drawHeight: number,
  offsetX: number,
  offsetY: number,
) {
  switch (position) {
    case "top":
      return { offsetX, offsetY: 0 };
    case "bottom":
      return { offsetX, offsetY: height - drawHeight };
    case "left":
      return { offsetX: 0, offsetY };
    case "right":
      return { offsetX: width - drawWidth, offsetY };
    case "top-left":
      return { offsetX: 0, offsetY: 0 };
    case "top-right":
      return { offsetX: width - drawWidth, offsetY: 0 };
    case "bottom-left":
      return { offsetX: 0, offsetY: height - drawHeight };
    case "bottom-right":
      return { offsetX: width - drawWidth, offsetY: height - drawHeight };
    case "center":
      return { offsetX, offsetY };
    default: {
      const _exhaustiveCheck: never = position;
      throw new Error(`Unknown background image position: ${String(_exhaustiveCheck)}`);
    }
  }
}

// Always the first layer of a frame: clears the canvas, then paints the color and image
export function drawBackground(
  ctx: RendererContext,
  config: RendererConfig,
  backgroundImageBitmap?: ImageBitmap,
): void {
  const { width, height } = config.resolution;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  if (!backgroundImageBitmap || !config.backgroundImageEnabled) return;

  ctx.save();
  ctx.globalAlpha = config.backgroundImageOpacity;

  const { backgroundImageFit, backgroundImagePosition, backgroundImageRepeat } = config;
  const img = backgroundImageBitmap;
  const imgRatio = img.width / img.height;
  const canvasRatio = width / height;

  const {
    drawWidth,
    drawHeight,
    offsetX: baseOffsetX,
    offsetY: baseOffsetY,
  } = calculateImageDimensions(backgroundImageFit, img, imgRatio, canvasRatio, width, height);

  const { offsetX, offsetY } = adjustImagePosition(
    backgroundImagePosition,
    width,
    height,
    drawWidth,
    drawHeight,
    baseOffsetX,
    baseOffsetY,
  );

  if (backgroundImageRepeat === "no-repeat") {
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  } else {
    const pattern = ctx.createPattern(img, backgroundImageRepeat);
    if (pattern) {
      // Shift the pattern origin by the position offset,
      // matching CSS background-position behavior with repeat
      pattern.setTransform(new DOMMatrix().translateSelf(offsetX, offsetY));
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  }

  ctx.restore();
}
