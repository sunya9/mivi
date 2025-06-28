import { screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { CometConfigPanel } from "@/lib/renderers/comet/comet-config-panel";
import { customRender } from "../../../util";
import { expectedMidiTracks, rendererConfig } from "tests/fixtures";
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
      midiTracks={expectedMidiTracks}
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
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    cometConfig: {
      fallAngle: 130,
    },
  });
});
