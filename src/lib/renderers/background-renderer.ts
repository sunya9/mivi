import {
  BackgroundImagePosition,
  RendererConfig,
  RendererContext,
} from "./renderer";

/**
 * Renders the background (color and image) for the visualization.
 * This is always rendered first, before any other layers.
 */
export class BackgroundRenderer {
  #ctx: RendererContext;
  #config: RendererConfig;
  #backgroundImageBitmap?: ImageBitmap;

  constructor(
    ctx: RendererContext,
    config: RendererConfig,
    backgroundImageBitmap?: ImageBitmap,
  ) {
    this.#ctx = ctx;
    this.#config = config;
    this.#backgroundImageBitmap = backgroundImageBitmap;
  }

  setConfig(config: RendererConfig): void {
    this.#config = config;
  }

  setBackgroundImageBitmap(backgroundImageBitmap?: ImageBitmap): void {
    this.#backgroundImageBitmap = backgroundImageBitmap;
  }

  render(): void {
    const {
      canvas: { width, height },
    } = this.#ctx;
    this.#ctx.clearRect(0, 0, width, height);

    // Draw background color
    this.#ctx.fillStyle = this.#config.backgroundColor;
    this.#ctx.fillRect(0, 0, width, height);

    // Draw background image
    if (this.#backgroundImageBitmap && this.#config.backgroundImageEnabled) {
      this.#ctx.save();
      this.#ctx.globalAlpha = this.#config.backgroundImageOpacity;

      const { backgroundImagePosition, backgroundImageRepeat } = this.#config;
      const img = this.#backgroundImageBitmap;
      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;

      const {
        drawWidth,
        drawHeight,
        offsetX: baseOffsetX,
        offsetY: baseOffsetY,
      } = this.#calculateImageDimensions(imgRatio, canvasRatio, width, height);

      const { offsetX, offsetY } = this.#adjustImagePosition(
        backgroundImagePosition,
        width,
        height,
        drawWidth,
        drawHeight,
        baseOffsetX,
        baseOffsetY,
      );

      if (backgroundImageRepeat === "no-repeat") {
        this.#ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        const pattern = this.#ctx.createPattern(img, backgroundImageRepeat);
        if (pattern) {
          this.#ctx.fillStyle = pattern;
          this.#ctx.fillRect(0, 0, width, height);
        }
      }

      this.#ctx.restore();
    }
  }

  #calculateImageDimensions(
    imgRatio: number,
    canvasRatio: number,
    width: number,
    height: number,
  ) {
    const { backgroundImageFit } = this.#config;
    switch (backgroundImageFit) {
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
        const _exhaustiveCheck: never = backgroundImageFit;
        throw new Error(
          `Unknown background image fit: ${String(_exhaustiveCheck)}`,
        );
      }
    }
  }

  #adjustImagePosition(
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
        throw new Error(
          `Unknown background image position: ${String(_exhaustiveCheck)}`,
        );
      }
    }
  }
}
