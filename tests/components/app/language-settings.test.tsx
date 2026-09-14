import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioContext } from "standardized-audio-context-mock";
import { customRender } from "tests/util";
import { expect, test } from "vitest";

import { LanguageSettings } from "@/components/app/language-settings";
import { createAppContext } from "@/contexts/app-context";

test("shows the language select with a description", async () => {
  await customRender(<LanguageSettings />);
  const select = screen.getByRole("combobox", { name: "Language" });
  expect(select).toHaveTextContent("System");
  expect(select).toHaveAccessibleDescription("Select the display language for the application.");
});

test("switches the app language when another option is chosen", async () => {
  const appContextValue = createAppContext(new AudioContext());
  await customRender(<LanguageSettings />, { appContextValue });
  await userEvent.click(screen.getByRole("combobox", { name: "Language" }));
  await userEvent.click(screen.getByRole("option", { name: "日本語" }));

  expect(appContextValue.localeStore.getSnapshot()).toEqual({ preference: "ja", locale: "ja" });
  expect(screen.getByRole("combobox", { name: "言語" })).toHaveTextContent("日本語");
  expect(localStorage.getItem("locale")).toBe("ja");
});
