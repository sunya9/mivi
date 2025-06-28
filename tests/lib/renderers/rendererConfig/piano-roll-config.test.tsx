import { screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { PianoRollConfigPanel } from "@/lib/renderers/piano-roll/piano-roll-config-panel";
import { customRender } from "tests/util";
import { expectedMidiTracks, rendererConfig } from "tests/fixtures";
import { ComponentProps } from "react";
import userEvent from "@testing-library/user-event";
type Props = ComponentProps<typeof PianoRollConfigPanel>;
const onUpdateRendererConfig: Props["onUpdateRendererConfig"] = vi.fn();
const pianoRollConfig = rendererConfig.pianoRollConfig;
function renderPane(overrideProps?: Props) {
  customRender(
    <PianoRollConfigPanel
      onUpdateRendererConfig={onUpdateRendererConfig}
      pianoRollConfig={pianoRollConfig}
      midiTracks={expectedMidiTracks}
      {...overrideProps}
    />,
  );
}

test("should render PianoRoll component", async () => {
  renderPane();
  const switchPlayheadBorder = screen.getByRole("switch", {
    name: "Show Playhead Border",
  });
  expect(switchPlayheadBorder).toBeInTheDocument();
  await userEvent.click(switchPlayheadBorder);
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: {
      showPlayhead: false,
    },
  });
});
