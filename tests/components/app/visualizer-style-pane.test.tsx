import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioContext } from "standardized-audio-context-mock";
import { testMidiTracks } from "tests/fixtures";
import { customRender } from "tests/util";
import { expect, test } from "vitest";

import { VisualizerStylePane } from "@/components/app/visualizer-style-pane";
import { createAppContext } from "@/contexts/app-context";

test("renders both style tabs and writes the selected style to the store", async () => {
  const { appContextValue } = await renderPanel();
  expect(screen.getByText("MIDI Style")).toBeInTheDocument();
  expect(screen.getByText("Audio Style")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("combobox", { name: "Style" }));
  await userEvent.click(screen.getByRole("option", { name: "Comet" }));

  expect(appContextValue.rendererConfigStore.getSnapshot().type).toBe("comet");
});

test("selecting Vertical Piano Roll shows its config panel", async () => {
  await renderPanel();

  await userEvent.click(screen.getByRole("combobox", { name: "Style" }));
  await userEvent.click(screen.getByRole("option", { name: "Vertical Piano Roll" }));

  expect(screen.getByText("Keyboard Height: 15%")).toBeInTheDocument();
});

test("shows the detected note range from the MIDI store", async () => {
  const { appContextValue } = await renderPanel();
  act(() => appContextValue.midiTracksStore.set(testMidiTracks));

  expect(screen.getByText("(Detected range: 60 - 72)")).toBeInTheDocument();
});

async function renderPanel() {
  const appContextValue = createAppContext(new AudioContext());
  const view = await customRender(<VisualizerStylePane />, { appContextValue });
  return { ...view, appContextValue };
}
