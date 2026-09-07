import { expect, test } from "vitest";

import { H264_MAX_MACROBLOCKS, countMacroblocks, getH264CodecString } from "@/lib/muxer/h264-level";

test("countMacroblocks rounds partial 16px blocks up", () => {
  expect(countMacroblocks({ width: 1920, height: 1080 })).toBe(120 * 68);
  expect(countMacroblocks({ width: 16, height: 16 })).toBe(1);
  expect(countMacroblocks({ width: 17, height: 17 })).toBe(4);
});

test("presets up to 1080p30 keep the existing level 4.1 codec string", () => {
  expect(getH264CodecString({ width: 1920, height: 1080 }, 30)).toBe("avc1.42E029");
  expect(getH264CodecString({ width: 1080, height: 1920 }, 30)).toBe("avc1.42E029");
  expect(getH264CodecString({ width: 4096, height: 512 }, 30)).toBe("avc1.42E029");
  expect(getH264CodecString({ width: 16, height: 16 }, 60)).toBe("avc1.42E029");
});

test("frame sizes above level 4.1 step up to the smallest fitting level", () => {
  expect(getH264CodecString({ width: 2048, height: 1080 }, 30)).toBe("avc1.42E02A");
  expect(getH264CodecString({ width: 2560, height: 1440 }, 30)).toBe("avc1.42E032");
  expect(getH264CodecString({ width: 3840, height: 2160 }, 30)).toBe("avc1.42E033");
  expect(getH264CodecString({ width: 4096, height: 2304 }, 30)).toBe("avc1.42E034");
});

test("macroblock rate above the level limit steps the level up as well", () => {
  expect(getH264CodecString({ width: 1920, height: 1080 }, 60)).toBe("avc1.42E02A");
  expect(getH264CodecString({ width: 2560, height: 1440 }, 60)).toBe("avc1.42E033");
  expect(getH264CodecString({ width: 3840, height: 2160 }, 60)).toBe("avc1.42E034");
  expect(getH264CodecString({ width: 4096, height: 2304 }, 60)).toBe("avc1.42E03C");
});

test("H264_MAX_MACROBLOCKS is the frame size Chromium's encoder still accepts", () => {
  expect(H264_MAX_MACROBLOCKS).toBe(36864);
  expect(countMacroblocks({ width: 4096, height: 2304 })).toBe(H264_MAX_MACROBLOCKS);
});

test("frame sizes beyond the encoder ceiling throw", () => {
  expect(() => getH264CodecString({ width: 4096, height: 4096 }, 30)).toThrow(
    "exceeds the H.264 encoder limit",
  );
});
