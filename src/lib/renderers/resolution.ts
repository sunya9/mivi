import { H264_MAX_MACROBLOCKS } from "@/lib/muxer/h264-level";

export type Resolution = {
  width: number;
  height: number;
  label: string;
};

export type ResolutionGroup = {
  label: string;
  resolutions: Resolution[];
};

export const resolutionGroups: ResolutionGroup[] = [
  {
    label: "Landscape",
    resolutions: [
      { width: 1920, height: 1080, label: "1920×1080 (16:9)" },
      { width: 1280, height: 720, label: "1280×720 (16:9)" },
      { width: 854, height: 480, label: "854×480 (16:9)" },
      { width: 1440, height: 1080, label: "1440×1080 (4:3)" },
      { width: 1024, height: 768, label: "1024×768 (4:3)" },
    ],
  },
  {
    label: "Portrait",
    resolutions: [
      { width: 1080, height: 1920, label: "1080×1920 (9:16)" },
      { width: 720, height: 1280, label: "720×1280 (9:16)" },
      { width: 480, height: 854, label: "480×854 (9:16)" },
      { width: 1080, height: 1440, label: "1080×1440 (3:4)" },
      { width: 768, height: 1024, label: "768×1024 (3:4)" },
    ],
  },
  {
    label: "Square",
    resolutions: [
      { width: 1080, height: 1080, label: "1080×1080 (1:1)" },
      { width: 720, height: 720, label: "720×720 (1:1)" },
    ],
  },
];

export const resolutions: Resolution[] = resolutionGroups.flatMap((group) => group.resolutions);

export const CUSTOM_RESOLUTION_LABEL = "Custom";
export const MIN_RESOLUTION_SIZE = 16;
export const MAX_RESOLUTION_SIZE = 4096;

export const isCustomResolution = (resolution: Resolution): boolean =>
  resolution.label === CUSTOM_RESOLUTION_LABEL;

// H.264 4:2:0 output needs even dimensions, so odd input is rounded up
const normalizeResolutionSize = (size: number): number => {
  if (Number.isNaN(size)) return MIN_RESOLUTION_SIZE;
  const even = Math.ceil(size / 2) * 2;
  return Math.min(MAX_RESOLUTION_SIZE, Math.max(MIN_RESOLUTION_SIZE, even));
};

const MACROBLOCK_SIZE = 16;

// The side being edited gives way, so the other side keeps what the user already had
const fitResolutionSize = (size: number, otherSize: number): number => {
  const otherMacroblocks = Math.ceil(otherSize / MACROBLOCK_SIZE);
  const maxSize = Math.floor(H264_MAX_MACROBLOCKS / otherMacroblocks) * MACROBLOCK_SIZE;
  return Math.min(size, maxSize);
};

export const createCustomResolution = (
  width: number,
  height: number,
  adjust: "width" | "height" = "width",
): Resolution => {
  const normalizedWidth = normalizeResolutionSize(width);
  const normalizedHeight = normalizeResolutionSize(height);
  return {
    width:
      adjust === "width" ? fitResolutionSize(normalizedWidth, normalizedHeight) : normalizedWidth,
    height:
      adjust === "height" ? fitResolutionSize(normalizedHeight, normalizedWidth) : normalizedHeight,
    label: CUSTOM_RESOLUTION_LABEL,
  };
};
