import { tailwindDefaultColors } from "@/lib/colors/tailwind-default-colors";
import Color from "colorjs.io";

const colorKeys = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

type ColorKey = (typeof colorKeys)[number];
type Brightness =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;

function toHex(value: number) {
  const percent = Math.min(Math.max(value, 0), 1);
  return Math.round(percent * 255)
    .toString(16)
    .padStart(2, "0");
}

function getTailwindColors() {
  const getPropertyValue = (colorKey: ColorKey, brightness: Brightness) => {
    const key = `--color-${colorKey}-${brightness}` as const;
    const oklch = tailwindDefaultColors[key];
    const [r, g, b] = new Color(oklch).srgb;
    const hex = `#${toHex(r ?? 0)}${toHex(g ?? 0)}${toHex(b ?? 0)}` as const;
    return hex;
  };
  return colorKeys.map((color) => ({
    50: getPropertyValue(color, 50),
    100: getPropertyValue(color, 100),
    200: getPropertyValue(color, 200),
    300: getPropertyValue(color, 300),
    400: getPropertyValue(color, 400),
    500: getPropertyValue(color, 500),
    600: getPropertyValue(color, 600),
    700: getPropertyValue(color, 700),
    800: getPropertyValue(color, 800),
    900: getPropertyValue(color, 900),
    950: getPropertyValue(color, 950),
  }));
}

const getColorsPerPalette = getTailwindColors();

const tailwindColors = getColorsPerPalette
  .map((map) => Object.values(map))
  .flat();

export function getRandomTailwindColor() {
  const oklchColor =
    tailwindColors[Math.floor(Math.random() * tailwindColors.length)];
  return oklchColor;
}

export function getRandomTailwindColorPalette() {
  const palette =
    getColorsPerPalette[Math.floor(Math.random() * getColorsPerPalette.length)];
  let counter = 0;
  return () => {
    const oklchColor =
      Object.values(palette)[(counter + 4) % Object.keys(palette).length];
    counter += 2;
    return oklchColor;
  };
}
