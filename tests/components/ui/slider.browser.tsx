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
