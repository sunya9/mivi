import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SettingsDialog,
  SettingsContent,
} from "@/components/app/settings-dialog";

test("SettingsDialog renders when open is true", () => {
  render(<SettingsDialog tab="general" onTabChange={vi.fn()} />);

  expect(screen.getByRole("dialog")).toBeVisible();
});

test("SettingsDialog does not render content when tab is undefined", () => {
  render(<SettingsDialog tab={undefined} onTabChange={vi.fn()} />);

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("SettingsDialog shows General content when tab is general", () => {
  render(<SettingsDialog tab="general" onTabChange={vi.fn()} />);

  // Theme heading should be visible in General tab
  expect(screen.getByText("Theme")).toBeVisible();
});

test("SettingsDialog shows About content when tab is about", () => {
  render(<SettingsDialog tab="about" onTabChange={vi.fn()} />);

  // About content should be visible
  expect(screen.getByText(/MiVi is a web application/)).toBeVisible();
});

test("SettingsDialog shows Shortcuts content when tab is shortcuts", () => {
  render(<SettingsDialog tab="shortcuts" onTabChange={vi.fn()} />);

  expect(screen.getByText("Keyboard Shortcuts")).toBeVisible();
  expect(screen.getByText("Play / Pause")).toBeVisible();
});

test("SettingsDialog calls onTabChange with undefined when dialog closes", async () => {
  const user = userEvent.setup();
  const onTabChange = vi.fn();

  render(<SettingsDialog tab="general" onTabChange={onTabChange} />);

  const closeButton = screen.getByRole("button", { name: /close/i });
  await user.click(closeButton);

  expect(onTabChange).toHaveBeenCalledWith(undefined);
});

test("SettingsDialog renders sidebar navigation items", () => {
  render(<SettingsDialog tab="general" onTabChange={vi.fn()} />);

  // Sidebar should have navigation buttons
  const sidebar = document.querySelector('[data-slot="sidebar"]');
  expect(sidebar).toBeVisible();

  // Check navigation items exist
  expect(screen.getByRole("button", { name: /general/i })).toBeVisible();
});

test("SettingsDialog switches to About content when About sidebar item is clicked", async () => {
  const user = userEvent.setup();
  const onTabChange = vi.fn();

  const { rerender } = render(
    <SettingsDialog tab="general" onTabChange={onTabChange} />,
  );

  // Verify initial General content is shown
  expect(screen.getByText("Theme")).toBeVisible();

  // Click About button in sidebar
  const aboutButton = screen.getByRole("button", { name: /about/i });
  await user.click(aboutButton);

  expect(onTabChange).toHaveBeenCalledWith("about");

  // Simulate parent updating the tab prop
  rerender(<SettingsDialog tab="about" onTabChange={onTabChange} />);

  // Verify About content is now shown
  expect(screen.getByText(/MiVi is a web application/)).toBeVisible();
});

test("SettingsDialog switches to Shortcuts content when Shortcuts sidebar item is clicked", async () => {
  const user = userEvent.setup();
  const onTabChange = vi.fn();

  const { rerender } = render(
    <SettingsDialog tab="general" onTabChange={onTabChange} />,
  );

  // Verify initial General content is shown
  expect(screen.getByText("Theme")).toBeVisible();

  // Click Shortcuts button in sidebar
  const shortcutsButton = screen.getByRole("button", { name: /shortcuts/i });
  await user.click(shortcutsButton);

  expect(onTabChange).toHaveBeenCalledWith("shortcuts");

  // Simulate parent updating the tab prop
  rerender(<SettingsDialog tab="shortcuts" onTabChange={onTabChange} />);

  // Verify Shortcuts content is now shown
  expect(screen.getByText("Keyboard Shortcuts")).toBeVisible();
  expect(screen.getByText("Play / Pause")).toBeVisible();
});

test("SettingsDialog has accessible title and description", () => {
  render(<SettingsDialog tab="general" onTabChange={vi.fn()} />);

  expect(screen.getByText("Settings")).toBeVisible();
  expect(
    screen.getByText("Application settings and information"),
  ).toBeVisible();
});

// SettingsContent tests (for mobile inline settings)

test("SettingsContent renders General and About tabs", () => {
  render(<SettingsContent />);

  expect(screen.getByRole("tab", { name: "General" })).toBeVisible();
  expect(screen.getByRole("tab", { name: "About" })).toBeVisible();
});

test("SettingsContent does not render Shortcuts tab", () => {
  render(<SettingsContent />);

  expect(
    screen.queryByRole("tab", { name: "Shortcuts" }),
  ).not.toBeInTheDocument();
});

test("SettingsContent shows General content by default", () => {
  render(<SettingsContent />);

  expect(screen.getByText("Theme")).toBeVisible();
});

test("SettingsContent switches to About tab when clicked", async () => {
  const user = userEvent.setup();
  render(<SettingsContent />);

  const aboutTab = screen.getByRole("tab", { name: "About" });
  await user.click(aboutTab);

  expect(screen.getByText(/MiVi is a web application/)).toBeVisible();
});

// Keyboard shortcut tests

const slashKeyMap = [{ code: "Slash", key: "/" }];

test("SettingsDialog opens with shortcuts tab when Shift+/ is pressed", async () => {
  const onTabChange = vi.fn();

  render(<SettingsDialog tab={undefined} onTabChange={onTabChange} />);

  await userEvent.keyboard("{Shift>}/{/Shift}", { keyboardMap: slashKeyMap });

  expect(onTabChange).toHaveBeenCalledWith("shortcuts");
});

test("SettingsDialog keyboard shortcut works when dialog is already open", async () => {
  const onTabChange = vi.fn();

  render(<SettingsDialog tab="general" onTabChange={onTabChange} />);

  await userEvent.keyboard("{Shift>}/{/Shift}", { keyboardMap: slashKeyMap });

  expect(onTabChange).toHaveBeenCalledWith("shortcuts");
});
