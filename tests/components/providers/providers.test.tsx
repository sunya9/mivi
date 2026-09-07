import { act, render, screen } from "@testing-library/react";
import { AudioContext } from "standardized-audio-context-mock";
import { expect, test } from "vitest";

import { Providers } from "@/components/providers/providers";
import { createAppContext, useAppContext } from "@/contexts/app-context";

function Probe() {
  const { audioContext } = useAppContext();
  return <span>{audioContext.sampleRate}</span>;
}

test("publishes the given app context to its children", async () => {
  const appContextValue = createAppContext(new AudioContext());

  await act(async () => {
    render(
      <Providers appContextValue={appContextValue}>
        <Probe />
      </Providers>,
    );
    await appContextValue.fileStore.preload();
  });

  expect(screen.getByText(String(appContextValue.audioContext.sampleRate))).toBeInTheDocument();
});
