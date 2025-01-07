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

const tailwindColors = [
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
]
  .map((map) => Object.values(map))
  .flat();

export const getRandomTailwindColor = () => {
  return tailwindColors[Math.floor(Math.random() * tailwindColors.length)];
};
