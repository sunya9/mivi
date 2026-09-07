import { expect, test } from "vitest";
import { page } from "vitest/browser";

import { Slider } from "@/components/ui/slider";

import "@/index.css";

function thumbState() {
  const thumb = document.querySelector<HTMLElement>('[data-slot="slider-thumb"]')!;
  const control = thumb.parentElement!;
  const c = control.getBoundingClientRect();
  const t = thumb.getBoundingClientRect();
  const expected = c.left + t.width / 2 + (c.width - t.width) * 0.5;
  return {
    visibility: getComputedStyle(thumb).visibility,
    offset: Math.round(t.left + t.width / 2 - expected),
  };
}

test("a slider mounted inside a hidden container positions its thumb once shown", async () => {
  await page.render(
    <div hidden data-testid="container" style={{ width: 200 }}>
      <Slider value={[50]} min={0} max={100} aria-label="volume" />
    </div>,
  );
  expect(thumbState().visibility).toBe("hidden");

  document.querySelector<HTMLElement>('[data-testid="container"]')!.hidden = false;

  await expect.poll(thumbState).toEqual({ visibility: "visible", offset: 0 });
});

test("aria-label names the range input", async () => {
  const screen = await page.render(
    <Slider value={[1]} min={0} max={1} step={0.01} aria-label="Volume" />,
  );
  await expect.element(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
});

test("clicking the label focuses the range input with a visible focus ring", async () => {
  const screen = await page.render(<Slider label="Amount" value={[5]} min={0} max={10} />);

  await screen.getByText("Amount").click();

  const input = document.querySelector<HTMLInputElement>('input[type="range"]')!;
  expect(document.activeElement).toBe(input);
  expect(input.matches(":focus-visible")).toBe(true);
});

test("aria-label names every thumb of a range slider", async () => {
  const screen = await page.render(
    <Slider value={[10, 20]} min={0} max={100} aria-label="View Range" />,
  );
  await expect
    .poll(() => screen.getByRole("slider", { name: "View Range" }).elements().length)
    .toBe(2);
});
