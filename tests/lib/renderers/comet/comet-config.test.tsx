import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { testMidiTracks, rendererConfig } from "tests/fixtures";
import { customRender, nudgeSlider } from "tests/util";
import { expect, test, vi } from "vitest";

import { CometConfigPanel } from "@/components/app/comet-config-panel";
type Props = ComponentProps<typeof CometConfigPanel>;
const onUpdateRendererConfig: Props["onUpdateRendererConfig"] =
  vi.fn<Props["onUpdateRendererConfig"]>();
const cometConfig = rendererConfig.cometConfig;
async function renderPane(overrideProps?: Props) {
  await customRender(
    <CometConfigPanel
      onUpdateRendererConfig={onUpdateRendererConfig}
      cometConfig={cometConfig}
      minNote={testMidiTracks.minNote}
      maxNote={testMidiTracks.maxNote}
      {...overrideProps}
    />,
  );
}

test("should render Comet component", async () => {
  await renderPane();
  const fallAngleSlider = within(screen.getByRole("group", { name: /Fall Angle/ })).getByRole(
    "slider",
    { hidden: true },
  );
  expect(fallAngleSlider).toBeInTheDocument();
  await userEvent.click(fallAngleSlider);
  await userEvent.keyboard("{arrowleft}");
  expect(onUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
    cometConfig: {
      fallAngle: 130,
    },
  });
});

test.each([
  [/^Angle Randomness/, "angleRandomness"],
  [/^Fall Distance/, "fallDistancePercent"],
  [/^Fall Duration/, "fallDuration"],
  [/^Fade Out Duration/, "fadeOutDuration"],
  [/^Comet Size/, "cometSize"],
  [/^Start Position X/, "startPositionX"],
  [/^Start Position Y/, "startPositionY"],
  [/^Trail Length/, "trailLength"],
  [/^Trail Width/, "trailWidth"],
  [/^Trail Opacity/, "trailOpacity"],
  [/^Note Spacing/, "spacingMargin"],
  [/^Spacing Randomness/, "spacingRandomness"],
  [/^View Range/, "viewRangeBottom"],
])("%s slider updates %s", async (label, key) => {
  await renderPane();
  await nudgeSlider(label);
  expect(onUpdateRendererConfig).toHaveBeenLastCalledWith({
    cometConfig: expect.objectContaining({ [key]: expect.any(Number) }),
  });
});

test("reverse stacking switch updates reverseStacking", async () => {
  await renderPane();
  await userEvent.click(screen.getByRole("switch", { name: "Reverse Stacking" }));
  expect(onUpdateRendererConfig).toHaveBeenLastCalledWith({
    cometConfig: { reverseStacking: !cometConfig.reverseStacking },
  });
});
