import Color from "colorjs.io";

const colorNames = [
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

const regex = /oklch\((\d+\.?\d*) (\d+\.?\d*) (\d+\.?\d*)\)/;

const toHex = (value: number) => {
  const percent = Math.min(Math.max(value, 0), 1);
  return Math.round(percent * 255)
    .toString(16)
    .padStart(2, "0");
};

const getTailwindColors = () => {
  const styles = getComputedStyle(document.documentElement);
  const getPropertyValue = (colorName: string, brightness: number) => {
    const oklchColor = styles.getPropertyValue(
      `--color-${colorName}-${brightness}`,
    );
    const match = oklchColor.match(regex);
    if (!match) throw new Error("Invalid color format");
    const [, l, c, h] = match;
    const lightness = parseFloat(l);
    const chroma = parseFloat(c);
    const hue = parseFloat(h);
    const [r, g, b] = new Color("oklch", [lightness, chroma, hue], 1).srgb;
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return hex;
  };
  return colorNames.map((color) => ({
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
};

const getColorsPerPalette = getTailwindColors();
console.log({ getColorsPerPalette });

const tailwindColors = getColorsPerPalette
  .map((map) => Object.values(map))
  .flat();

export const getRandomTailwindColor = () => {
  const oklchColor =
    tailwindColors[Math.floor(Math.random() * tailwindColors.length)];
  return oklchColor;
};

export const getRandomTailwindColorPalette = () => {
  const palette =
    getColorsPerPalette[Math.floor(Math.random() * getColorsPerPalette.length)];
  let counter = 0;
  return () => {
    const oklchColor =
      Object.values(palette)[(counter + 4) % Object.keys(palette).length];
    counter += 2;
    return oklchColor;
  };
};
