import { getGradientCoords } from "@/lib/renderers/audio-visualizer/gradient-utils";
import { GradientDirection } from "@/lib/renderers/renderer";
import { expect, test } from "vitest";

const width = 100;
const height = 200;

test.each<{
  direction: GradientDirection;
  expected: [number, number, number, number];
}>([
  { direction: "to-right", expected: [0, 100, 100, 100] },
  { direction: "to-bottom-right", expected: [0, 0, 100, 200] },
  { direction: "to-bottom", expected: [50, 0, 50, 200] },
  { direction: "to-bottom-left", expected: [100, 0, 0, 200] },
  { direction: "to-left", expected: [100, 100, 0, 100] },
  { direction: "to-top-left", expected: [100, 200, 0, 0] },
  { direction: "to-top", expected: [50, 200, 50, 0] },
  { direction: "to-top-right", expected: [0, 200, 100, 0] },
])(
  "getGradientCoords should return correct coords for $direction",
  ({ direction, expected }) => {
    const result = getGradientCoords(direction, width, height);
    expect(result).toEqual(expected);
  },
);

test("getGradientCoords with square canvas", () => {
  const size = 100;
  expect(getGradientCoords("to-right", size, size)).toEqual([0, 50, 100, 50]);
  expect(getGradientCoords("to-bottom", size, size)).toEqual([50, 0, 50, 100]);
});
