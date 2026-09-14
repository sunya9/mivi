import { act, screen } from "@testing-library/react";
import { AudioContext } from "standardized-audio-context-mock";
import { customRender } from "tests/util";
import { expect, test } from "vitest";

import { createAppContext } from "@/contexts/app-context";
import { useMessages } from "@/lib/locale/use-messages";

function Greeting() {
  const m = useMessages();
  return <p>{m.settings_language_label()}</p>;
}

test("re-renders with the new locale when the preference changes", async () => {
  const appContextValue = createAppContext(new AudioContext());
  await customRender(<Greeting />, { appContextValue });
  expect(screen.getByText("Language")).toBeInTheDocument();

  act(() => appContextValue.localeStore.setPreference("ja"));

  expect(screen.getByText("言語")).toBeInTheDocument();
});
