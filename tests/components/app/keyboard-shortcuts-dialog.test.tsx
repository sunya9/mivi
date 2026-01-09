import { expect, test } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KeyboardShortcutsDialog } from "@/components/app/keyboard-shortcuts-dialog";
import { customRender } from "tests/util";

const slashKeyMap = [{ code: "Slash", key: "/" }];

test("should show dialog when shortcut is pressed", async () => {
  customRender(<KeyboardShortcutsDialog />);

  await userEvent.keyboard("{Shift>}/{/Shift}", { keyboardMap: slashKeyMap });

  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("should not render content when closed", () => {
  customRender(<KeyboardShortcutsDialog />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
