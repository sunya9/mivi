import { screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { CometConfigPanel } from "@/components/app/comet-config-panel";
import { customRender } from "tests/util";
import { testMidiTracks, rendererConfig } from "tests/fixtures";
import { ComponentProps } from "react";
import userEvent from "@testing-library/user-event";
type Props = ComponentProps<typeof CometConfigPanel>;
const onUpdateRendererConfig: Props["onUpdateRendererConfig"] = vi.fn();
const cometConfig = rendererConfig.cometConfig;
function renderPane(overrideProps?: Props) {
  customRender(
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
  renderPane();
  const fallAngleSlider = screen.getByRole("slider", {
    name: /Fall Angle/,
  });
  expect(fallAngleSlider).toBeInTheDocument();
  await userEvent.click(fallAngleSlider);
  await userEvent.keyboard("{arrowleft}");
  expect(onUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
    cometConfig: {
      fallAngle: 130,
    },
  });
});
