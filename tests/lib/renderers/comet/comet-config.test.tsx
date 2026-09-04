import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { testMidiTracks, rendererConfig } from "tests/fixtures";
import { customRender } from "tests/util";
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
