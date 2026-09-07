import { expect, test } from "vitest";

import { H264_MAX_MACROBLOCKS, countMacroblocks, getH264CodecString } from "@/lib/muxer/h264-level";

test("countMacroblocks rounds partial 16px blocks up", () => {
  expect(countMacroblocks({ width: 1920, height: 1080 })).toBe(120 * 68);
  expect(countMacroblocks({ width: 16, height: 16 })).toBe(1);
  expect(countMacroblocks({ width: 17, height: 17 })).toBe(4);
});

test("presets up to 1080p keep the existing level 4.1 codec string", () => {
  expect(getH264CodecString({ width: 1920, height: 1080 })).toBe("avc1.42E029");
  expect(getH264CodecString({ width: 1080, height: 1920 })).toBe("avc1.42E029");
  expect(getH264CodecString({ width: 4096, height: 512 })).toBe("avc1.42E029");
  expect(getH264CodecString({ width: 16, height: 16 })).toBe("avc1.42E029");
});

test("frame sizes above level 4.1 step up to the smallest fitting level", () => {
  expect(getH264CodecString({ width: 2048, height: 1080 })).toBe("avc1.42E02A");
  expect(getH264CodecString({ width: 2560, height: 1440 })).toBe("avc1.42E032");
  expect(getH264CodecString({ width: 3840, height: 2160 })).toBe("avc1.42E033");
  expect(getH264CodecString({ width: 4096, height: 2304 })).toBe("avc1.42E033");
});

test("H264_MAX_MACROBLOCKS is the level 5.1 frame size limit", () => {
  expect(H264_MAX_MACROBLOCKS).toBe(36864);
  expect(countMacroblocks({ width: 4096, height: 2304 })).toBe(H264_MAX_MACROBLOCKS);
});

test("frame sizes beyond the highest supported level throw", () => {
  expect(() => getH264CodecString({ width: 4096, height: 4096 })).toThrow(
    "exceeds H.264 level 5.1",
  );
});
