import { expect, test } from "vitest";

import {
  createCustomResolution,
  CUSTOM_RESOLUTION_LABEL,
  isCustomResolution,
  MAX_RESOLUTION_SIZE,
  MIN_RESOLUTION_SIZE,
  resolutionGroups,
  resolutions,
} from "@/lib/renderers/renderer";

const groupOf = (label: string) => resolutionGroups.find((g) => g.label === label)!.resolutions;

test("every landscape preset has a rotated portrait counterpart", () => {
  const landscape = groupOf("Landscape");
  const portrait = groupOf("Portrait");
  expect(portrait.map(({ width, height }) => ({ width, height }))).toEqual(
    landscape.map(({ width, height }) => ({ width: height, height: width })),
  );
});

test("portrait labels flip the aspect ratio", () => {
  expect(groupOf("Portrait").map((r) => r.label)).toEqual([
    "1080×1920 (9:16)",
    "720×1280 (9:16)",
    "480×854 (9:16)",
    "1080×1440 (3:4)",
    "768×1024 (3:4)",
  ]);
});

test("flat resolutions list contains every grouped preset and keeps the 720p default second", () => {
  expect(resolutions).toEqual(resolutionGroups.flatMap((g) => g.resolutions));
  expect(resolutions[1]).toMatchObject({ width: 1280, height: 720 });
});

test("preset labels are unique and never collide with the custom label", () => {
  const labels = resolutions.map((r) => r.label);
  expect(new Set(labels).size).toBe(labels.length);
  expect(labels).not.toContain(CUSTOM_RESOLUTION_LABEL);
});

test("createCustomResolution keeps valid even sizes as is", () => {
  expect(createCustomResolution(1000, 600)).toEqual({
    width: 1000,
    height: 600,
    label: CUSTOM_RESOLUTION_LABEL,
  });
});

test("createCustomResolution rounds odd sizes to even", () => {
  expect(createCustomResolution(1001, 599)).toMatchObject({ width: 1002, height: 600 });
});

test("createCustomResolution clamps sizes into the supported range", () => {
  expect(createCustomResolution(1, 100_000)).toMatchObject({
    width: MIN_RESOLUTION_SIZE,
    height: MAX_RESOLUTION_SIZE,
  });
});

test("createCustomResolution falls back to the minimum for non-finite input", () => {
  expect(createCustomResolution(Number.NaN, Number.POSITIVE_INFINITY)).toMatchObject({
    width: MIN_RESOLUTION_SIZE,
    height: MAX_RESOLUTION_SIZE,
  });
});

test("createCustomResolution shrinks the adjusted side to stay within the H.264 frame size limit", () => {
  expect(createCustomResolution(4096, 4096, "width")).toMatchObject({
    width: 2304,
    height: 4096,
  });
  expect(createCustomResolution(4096, 4096, "height")).toMatchObject({
    width: 4096,
    height: 2304,
  });
  expect(createCustomResolution(4096, 4096)).toMatchObject({ width: 2304, height: 4096 });
});

test("createCustomResolution leaves sizes within the frame size limit untouched", () => {
  expect(createCustomResolution(3840, 2160, "height")).toMatchObject({ width: 3840, height: 2160 });
});

test("isCustomResolution only matches the custom label", () => {
  expect(isCustomResolution(createCustomResolution(640, 360))).toBe(true);
  expect(isCustomResolution(resolutions[0])).toBe(false);
});
