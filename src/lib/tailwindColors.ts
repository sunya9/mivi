import {
  red,
  orange,
  amber,
  yellow,
  lime,
  green,
  emerald,
  teal,
  cyan,
  sky,
  blue,
  indigo,
  violet,
  purple,
  fuchsia,
  pink,
  rose,
} from "tailwindcss/colors";

const colorsPerPalette = [
  red,
  orange,
  amber,
  yellow,
  lime,
  green,
  emerald,
  teal,
  cyan,
  sky,
  blue,
  indigo,
  violet,
  purple,
  fuchsia,
  pink,
  rose,
] as const;

const tailwindColors = colorsPerPalette.map((map) => Object.values(map)).flat();

export const getRandomTailwindColor = () => {
  return tailwindColors[Math.floor(Math.random() * tailwindColors.length)];
};

export const getRandomTailwindColorPalette = () => {
  const palette =
    colorsPerPalette[Math.floor(Math.random() * colorsPerPalette.length)];
  let counter = 0;
  return () => {
    const color =
      Object.values(palette)[(counter + 4) % Object.keys(palette).length];
    counter += 2;
    return color;
  };
};
