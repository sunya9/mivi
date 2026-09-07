interface FrameSize {
  width: number;
  height: number;
}

const H264_LEVELS: { hex: string; maxMacroblocks: number }[] = [
  { hex: "29", maxMacroblocks: 8192 },
  { hex: "2A", maxMacroblocks: 8704 },
  { hex: "32", maxMacroblocks: 22080 },
  { hex: "33", maxMacroblocks: 36864 },
];

export const H264_MAX_MACROBLOCKS = H264_LEVELS[H264_LEVELS.length - 1].maxMacroblocks;

export const countMacroblocks = ({ width, height }: FrameSize): number =>
  Math.ceil(width / 16) * Math.ceil(height / 16);

export function getH264CodecString(frameSize: FrameSize): string {
  const macroblocks = countMacroblocks(frameSize);
  const level = H264_LEVELS.find((l) => macroblocks <= l.maxMacroblocks);
  if (!level) {
    throw new Error(`Frame size ${frameSize.width}x${frameSize.height} exceeds H.264 level 5.1`);
  }
  return `avc1.42E0${level.hex}`;
}
