import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import { PlayIcon } from "@/components/app/play-icon";

test("does not render animation on initial mount", () => {
  const { container } = render(<PlayIcon isPlaying={false} />);
  expect(container.firstElementChild).not.toBeVisible();
});

test("renders animation when isPlaying changes", () => {
  const { container, rerender } = render(<PlayIcon isPlaying={false} />);
  rerender(<PlayIcon isPlaying={true} />);
  expect(container.firstElementChild).toBeInTheDocument();
});

test("remounts on each change to retrigger CSS animation", () => {
  const { container, rerender } = render(<PlayIcon isPlaying={false} />);

  rerender(<PlayIcon isPlaying={true} />);
  const firstEl = container.firstElementChild;

  rerender(<PlayIcon isPlaying={false} />);
  const secondEl = container.firstElementChild;

  expect(firstEl).not.toBe(secondEl);
});
