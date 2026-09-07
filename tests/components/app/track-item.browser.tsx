import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createTestMidiTracks } from "tests/fixtures/browser-fixtures";
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import { TrackItem } from "@/components/app/track-item";

import "@/index.css";

async function renderAt(width: number) {
  const track = createTestMidiTracks().tracks[0];
  await page.render(
    <div className="@container" style={{ width }}>
      <DndContext>
        <SortableContext items={[track.id]}>
          <TrackItem track={track} index={0} onUpdateTrackConfig={() => {}} />
        </SortableContext>
      </DndContext>
    </div>,
  );
  const top = (element: Element) => element.getBoundingClientRect().top;
  const [opacityLabel, scaleLabel] = document.querySelectorAll('[data-slot="slider-label"]');
  return {
    color: top(document.querySelector('input[type="color"]')!),
    staccato: top(document.querySelector('[role="checkbox"]')!),
    opacity: top(opacityLabel),
    scale: top(scaleLabel),
    labelAlign: getComputedStyle(opacityLabel).textAlign,
  };
}

const sameRow = (a: number, b: number) => Math.abs(a - b) < 8;
const rowBelow = (a: number, b: number) => a - b > 16;

test("wide panel keeps the colour picker and opacity slider on one row", async () => {
  const rows = await renderAt(400);
  expect(sameRow(rows.opacity, rows.color)).toBe(true);
  expect(rowBelow(rows.staccato, rows.color)).toBe(true);
  expect(sameRow(rows.scale, rows.staccato)).toBe(true);
  expect(rows.labelAlign).toBe("end");
});

test("narrow panel puts staccato beside the colour picker and stacks the sliders", async () => {
  const rows = await renderAt(300);
  expect(sameRow(rows.staccato, rows.color)).toBe(true);
  expect(rowBelow(rows.opacity, rows.color)).toBe(true);
  expect(rowBelow(rows.scale, rows.opacity)).toBe(true);
  expect(rows.labelAlign).toBe("start");
});

test("very narrow panel gives staccato its own row as well", async () => {
  const rows = await renderAt(240);
  expect(rowBelow(rows.staccato, rows.color)).toBe(true);
  expect(rowBelow(rows.opacity, rows.staccato)).toBe(true);
  expect(rowBelow(rows.scale, rows.opacity)).toBe(true);
  expect(rows.labelAlign).toBe("start");
});
