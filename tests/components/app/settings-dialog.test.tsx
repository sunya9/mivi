import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SettingsDialog,
  SettingsContent,
} from "@/components/app/settings-dialog";

test("SettingsDialog renders when open is true", () => {
  render(<SettingsDialog open={true} tab="general" onTabChange={vi.fn()} />);

  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("SettingsDialog does not render content when open is false", () => {
  render(<SettingsDialog open={false} tab="general" onTabChange={vi.fn()} />);

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("SettingsDialog shows General content when tab is general", () => {
  render(<SettingsDialog open={true} tab="general" onTabChange={vi.fn()} />);

  // Theme heading should be visible in General tab
  expect(screen.getByText("Theme")).toBeInTheDocument();
});

test("SettingsDialog shows About content when tab is about", () => {
  render(<SettingsDialog open={true} tab="about" onTabChange={vi.fn()} />);

  // About content should be visible
  expect(screen.getByText(/MiVi is a web application/)).toBeInTheDocument();
});

test("SettingsDialog shows Shortcuts content when tab is shortcuts", () => {
  render(<SettingsDialog open={true} tab="shortcuts" onTabChange={vi.fn()} />);

  expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
  expect(screen.getByText("Play / Pause")).toBeInTheDocument();
});

test("SettingsDialog calls onTabChange with undefined when dialog closes", async () => {
  const user = userEvent.setup();
  const onTabChange = vi.fn();

  render(
    <SettingsDialog open={true} tab="general" onTabChange={onTabChange} />,
  );

  const closeButton = screen.getByRole("button", { name: /close/i });
  await user.click(closeButton);

  expect(onTabChange).toHaveBeenCalledWith(undefined);
});

test("SettingsDialog renders sidebar navigation items", () => {
  render(<SettingsDialog open={true} tab="general" onTabChange={vi.fn()} />);

  // Sidebar should have navigation buttons
  const sidebar = document.querySelector('[data-slot="sidebar"]');
  expect(sidebar).toBeInTheDocument();

  // Check navigation items exist
  expect(screen.getByRole("button", { name: /general/i })).toBeInTheDocument();
});

test("SettingsDialog has accessible title and description", () => {
  render(<SettingsDialog open={true} tab="general" onTabChange={vi.fn()} />);

  expect(screen.getByText("Settings")).toBeInTheDocument();
  expect(
    screen.getByText("Application settings and information"),
  ).toBeInTheDocument();
});

// SettingsContent tests (for mobile inline settings)

test("SettingsContent renders General and About tabs", () => {
  render(<SettingsContent />);

  expect(screen.getByRole("tab", { name: "General" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "About" })).toBeInTheDocument();
});

test("SettingsContent does not render Shortcuts tab", () => {
  render(<SettingsContent />);

  expect(
    screen.queryByRole("tab", { name: "Shortcuts" }),
  ).not.toBeInTheDocument();
});

test("SettingsContent shows General content by default", () => {
  render(<SettingsContent />);

  expect(screen.getByText("Theme")).toBeInTheDocument();
});

test("SettingsContent switches to About tab when clicked", async () => {
  const user = userEvent.setup();
  render(<SettingsContent />);

  const aboutTab = screen.getByRole("tab", { name: "About" });
  await user.click(aboutTab);

  expect(screen.getByText(/MiVi is a web application/)).toBeInTheDocument();
});

test("SettingsContent respects defaultTab prop", () => {
  render(<SettingsContent defaultTab="about" />);

  const aboutTab = screen.getByRole("tab", { name: "About" });
  expect(aboutTab).toHaveAttribute("data-state", "active");
});

test("SettingsContent applies custom className", () => {
  const { container } = render(<SettingsContent className="custom-class" />);

  const tabsElement = container.firstChild;
  expect(tabsElement).toHaveClass("custom-class");
});

// Keyboard shortcut tests

const slashKeyMap = [{ code: "Slash", key: "/" }];

test("SettingsDialog opens with shortcuts tab when Shift+/ is pressed", async () => {
  const onTabChange = vi.fn();

  render(
    <SettingsDialog open={false} tab={undefined} onTabChange={onTabChange} />,
  );

  await userEvent.keyboard("{Shift>}/{/Shift}", { keyboardMap: slashKeyMap });

  expect(onTabChange).toHaveBeenCalledWith("shortcuts");
});

test("SettingsDialog keyboard shortcut works when dialog is already open", async () => {
  const onTabChange = vi.fn();

  render(
    <SettingsDialog open={true} tab="general" onTabChange={onTabChange} />,
  );

  await userEvent.keyboard("{Shift>}/{/Shift}", { keyboardMap: slashKeyMap });

  expect(onTabChange).toHaveBeenCalledWith("shortcuts");
});
