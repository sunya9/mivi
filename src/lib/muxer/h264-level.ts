interface FrameSize {
  width: number;
  height: number;
}

const H264_LEVELS: { hex: string; maxMacroblocks: number; maxMacroblocksPerSecond: number }[] = [
  { hex: "29", maxMacroblocks: 8192, maxMacroblocksPerSecond: 245_760 },
  { hex: "2A", maxMacroblocks: 8704, maxMacroblocksPerSecond: 522_240 },
  { hex: "32", maxMacroblocks: 22080, maxMacroblocksPerSecond: 589_824 },
  { hex: "33", maxMacroblocks: 36864, maxMacroblocksPerSecond: 983_040 },
  { hex: "34", maxMacroblocks: 36864, maxMacroblocksPerSecond: 2_073_600 },
  { hex: "3C", maxMacroblocks: 139264, maxMacroblocksPerSecond: 4_177_920 },
];

// Chromium's H.264 encoder rejects larger frames whatever level is declared
export const H264_MAX_MACROBLOCKS = 36864;

export const countMacroblocks = ({ width, height }: FrameSize): number =>
  Math.ceil(width / 16) * Math.ceil(height / 16);

export function getH264CodecString(frameSize: FrameSize, frameRate: number): string {
  const macroblocks = countMacroblocks(frameSize);
  if (macroblocks > H264_MAX_MACROBLOCKS) {
    throw new Error(
      `Frame size ${frameSize.width}x${frameSize.height} exceeds the H.264 encoder limit`,
    );
  }
  const macroblocksPerSecond = macroblocks * frameRate;
  const level = H264_LEVELS.find(
    (l) => macroblocks <= l.maxMacroblocks && macroblocksPerSecond <= l.maxMacroblocksPerSecond,
  );
  if (!level) {
    throw new Error(`${frameSize.width}x${frameSize.height}@${frameRate} exceeds H.264 level 6.0`);
  }
  return `avc1.42E0${level.hex}`;
}
