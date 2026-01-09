import { expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KeyboardShortcutsDialog } from "@/components/app/keyboard-shortcuts-dialog";
import { customRender } from "tests/util";

test("should render all shortcuts when open", () => {
  customRender(<KeyboardShortcutsDialog open={true} onOpenChange={() => {}} />);

  expect(screen.getByText("Space")).toBeInTheDocument();
  expect(screen.getByText("Esc")).toBeInTheDocument();
  expect(screen.getByText("M")).toBeInTheDocument();
  expect(screen.getByText("?")).toBeInTheDocument();
});

test("should render shortcut descriptions", () => {
  customRender(<KeyboardShortcutsDialog open={true} onOpenChange={() => {}} />);

  expect(screen.getByText("Play / Pause")).toBeInTheDocument();
  expect(screen.getByText("Exit expanded view")).toBeInTheDocument();
  expect(screen.getByText("Mute / Unmute")).toBeInTheDocument();
  expect(screen.getByText("Show shortcuts")).toBeInTheDocument();
});

test("should call onOpenChange when dialog is closed", async () => {
  const onOpenChange = vi.fn();
  customRender(
    <KeyboardShortcutsDialog open={true} onOpenChange={onOpenChange} />,
  );

  // Close dialog by clicking the close button
  const closeButton = screen.getByRole("button", { name: /close/i });
  await userEvent.click(closeButton);

  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("should not render content when closed", () => {
  customRender(
    <KeyboardShortcutsDialog open={false} onOpenChange={() => {}} />,
  );

  expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
});
