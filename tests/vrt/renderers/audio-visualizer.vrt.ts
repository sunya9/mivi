import { expect, test, onTestFinished } from "vitest";
import { page } from "vitest/browser";
import { AudioVisualizerOverlay } from "@/lib/renderers/audio-visualizer-overlay";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer";
import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type { AudioVisualizerConfig } from "@/lib/renderers/renderer";

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

function fillBackground(
  ctx: CanvasRenderingContext2D,
  color: string = "#1a1a1a",
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

/**
 * Create deterministic frequency data for consistent VRT snapshots.
 * Simulates a typical audio spectrum with bass emphasis.
 */
function createTestFrequencyData(fftSize: number = 2048): FrequencyData {
  const frequencyBinCount = fftSize / 2;
  const frequencyData = new Uint8Array(frequencyBinCount);
  const timeDomainData = new Uint8Array(frequencyBinCount);

  // Generate a realistic-looking frequency spectrum
  // Bass frequencies (low indices) have higher values
  for (let i = 0; i < frequencyBinCount; i++) {
    const normalizedIndex = i / frequencyBinCount;

    // Bass emphasis with decay towards higher frequencies
    const bassEmphasis = Math.exp(-normalizedIndex * 3) * 200;

    // Add some "peaks" at certain frequencies for visual interest
    const peak1 = Math.exp(-Math.pow((normalizedIndex - 0.1) * 10, 2)) * 100;
    const peak2 = Math.exp(-Math.pow((normalizedIndex - 0.25) * 8, 2)) * 80;
    const peak3 = Math.exp(-Math.pow((normalizedIndex - 0.5) * 6, 2)) * 60;

    // Combine and clamp to 0-255
    const value = Math.min(
      255,
      Math.max(0, bassEmphasis + peak1 + peak2 + peak3),
    );
    frequencyData[i] = Math.round(value);

    // Time domain: simple sine-like waveform centered at 128
    timeDomainData[i] = Math.round(
      128 + 50 * Math.sin((i / frequencyBinCount) * Math.PI * 8),
    );
  }

  return {
    frequencyBinCount,
    frequencyData,
    timeDomainData,
    nyquistFrequency: 22050,
  };
}

function getDefaultAudioConfig(): AudioVisualizerConfig {
  return getDefaultRendererConfig().audioVisualizerConfig;
}

// ============================================
// Bars Style Tests
// ============================================

test("bars style - bottom position", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  fillBackground(ctx);

  const config: AudioVisualizerConfig = {
    ...getDefaultAudioConfig(),
    style: "bars",
    position: "bottom",
    mirror: false,
    useGradient: true,
    height: 30,
  };

  const overlay = new AudioVisualizerOverlay(ctx, config);
  const frequencyData = createTestFrequencyData();
  overlay.render(frequencyData);

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot("audio-visualizer-bars-bottom");
});

test("bars style - top position with mirror", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  fillBackground(ctx);

  const config: AudioVisualizerConfig = {
    ...getDefaultAudioConfig(),
    style: "bars",
    position: "top",
    mirror: true,
    mirrorOpacity: 0.5,
    useGradient: true,
    height: 30,
  };

  const overlay = new AudioVisualizerOverlay(ctx, config);
  const frequencyData = createTestFrequencyData();
  overlay.render(frequencyData);

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot("audio-visualizer-bars-top-mirror");
});

test("bars style - center position single color", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  fillBackground(ctx);

  const config: AudioVisualizerConfig = {
    ...getDefaultAudioConfig(),
    style: "bars",
    position: "center",
    mirror: false,
    useGradient: false,
    singleColor: "#22c55e",
    height: 40,
  };

  const overlay = new AudioVisualizerOverlay(ctx, config);
  const frequencyData = createTestFrequencyData();
  overlay.render(frequencyData);

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot(
    "audio-visualizer-bars-center-single-color",
  );
});

// ============================================
// Line Spectrum Style Tests
// ============================================

test("lineSpectrum style - stroke only", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  fillBackground(ctx);

  const config: AudioVisualizerConfig = {
    ...getDefaultAudioConfig(),
    style: "lineSpectrum",
    position: "bottom",
    height: 30,
    lineSpectrumConfig: {
      lineWidth: 2,
      tension: 0.4,
      stroke: true,
      strokeColor: "#ffffff",
      strokeOpacity: 1,
      fill: false,
      fillOpacity: 0.3,
    },
  };

  const overlay = new AudioVisualizerOverlay(ctx, config);
  const frequencyData = createTestFrequencyData();
  overlay.render(frequencyData);

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot("audio-visualizer-line-stroke");
});

test("lineSpectrum style - fill with stroke", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  fillBackground(ctx);

  const config: AudioVisualizerConfig = {
    ...getDefaultAudioConfig(),
    style: "lineSpectrum",
    position: "bottom",
    height: 40,
    useGradient: true,
    lineSpectrumConfig: {
      lineWidth: 2,
      tension: 0.3,
      stroke: true,
      strokeColor: "#ffffff",
      strokeOpacity: 0.8,
      fill: true,
      fillOpacity: 0.5,
    },
  };

  const overlay = new AudioVisualizerOverlay(ctx, config);
  const frequencyData = createTestFrequencyData();
  overlay.render(frequencyData);

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot("audio-visualizer-line-fill-stroke");
});

test("lineSpectrum style - high tension", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  fillBackground(ctx);

  const config: AudioVisualizerConfig = {
    ...getDefaultAudioConfig(),
    style: "lineSpectrum",
    position: "center",
    height: 50,
    lineSpectrumConfig: {
      lineWidth: 3,
      tension: 0.8,
      stroke: true,
      strokeColor: "#f97316",
      strokeOpacity: 1,
      fill: false,
      fillOpacity: 0.3,
    },
  };

  const overlay = new AudioVisualizerOverlay(ctx, config);
  const frequencyData = createTestFrequencyData();
  overlay.render(frequencyData);

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot("audio-visualizer-line-high-tension");
});

// ============================================
// Circular Style Tests
// ============================================

test("circular style - default", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  fillBackground(ctx);

  const config: AudioVisualizerConfig = {
    ...getDefaultAudioConfig(),
    style: "circular",
    barCount: 64,
    useGradient: true,
  };

  const overlay = new AudioVisualizerOverlay(ctx, config);
  const frequencyData = createTestFrequencyData();
  overlay.render(frequencyData);

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot("audio-visualizer-circular-default");
});

test("circular style - high bar count", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  fillBackground(ctx);

  const config: AudioVisualizerConfig = {
    ...getDefaultAudioConfig(),
    style: "circular",
    barCount: 128,
    useGradient: false,
    singleColor: "#ec4899",
  };

  const overlay = new AudioVisualizerOverlay(ctx, config);
  const frequencyData = createTestFrequencyData();
  overlay.render(frequencyData);

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot(
    "audio-visualizer-circular-high-bars",
  );
});

test("circular style - low bar count", async () => {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());

  const ctx = canvas.getContext("2d")!;
  fillBackground(ctx);

  const config: AudioVisualizerConfig = {
    ...getDefaultAudioConfig(),
    style: "circular",
    barCount: 32,
    useGradient: true,
    gradientStartColor: "#06b6d4",
    gradientEndColor: "#8b5cf6",
  };

  const overlay = new AudioVisualizerOverlay(ctx, config);
  const frequencyData = createTestFrequencyData();
  overlay.render(frequencyData);

  const element = page.getByTestId("vrt-canvas");
  await expect(element).toMatchScreenshot("audio-visualizer-circular-low-bars");
});
