import { expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CollapsibleCardPane } from "@/components/CollapsibleCardPane";
import userEvent from "@testing-library/user-event";

test("should render header and content", () => {
  render(
    <CollapsibleCardPane header={<h2>Test Header</h2>}>
      <div>Test Content</div>
    </CollapsibleCardPane>,
  );

  expect(screen.getByText("Test Header")).toBeInTheDocument();
  expect(screen.getByText("Test Content")).toBeInTheDocument();
});

test("should be open by default", () => {
  render(
    <CollapsibleCardPane header={<h2>Test Header</h2>}>
      <div>Test Content</div>
    </CollapsibleCardPane>,
  );

  const content = screen.getByText("Test Content").closest("[data-state]");
  expect(content).toHaveAttribute("data-state", "open");
  expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
});

test("should toggle content visibility when button is clicked", async () => {
  render(
    <CollapsibleCardPane header={<h2>Test Header</h2>}>
      <div>Test Content</div>
    </CollapsibleCardPane>,
  );

  const button = screen.getByRole("button");
  const content = screen.getByText("Test Content").closest("[data-state]");

  // Initially open
  expect(content).toHaveAttribute("data-state", "open");
  expect(button).toHaveAttribute("aria-expanded", "true");

  // Click to close
  await userEvent.click(button);
  await waitFor(() => {
    expect(content).toHaveAttribute("data-state", "closed");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  // Click to open
  await userEvent.click(button);
  await waitFor(() => {
    expect(content).toHaveAttribute("data-state", "open");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});

test("should change button label and icon when toggled", async () => {
  render(
    <CollapsibleCardPane header={<h2>Test Header</h2>}>
      <div>Test Content</div>
    </CollapsibleCardPane>,
  );

  const button = screen.getByRole("button");

  // Initially shows "Close"
  expect(button).toHaveAttribute("aria-label", "Close");
  expect(screen.getByText("Close")).toBeInTheDocument();

  // Click to show "Open"
  await userEvent.click(button);
  await waitFor(() => {
    expect(button).toHaveAttribute("aria-label", "Open");
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  // Click to show "Close" again
  await userEvent.click(button);
  await waitFor(() => {
    expect(button).toHaveAttribute("aria-label", "Close");
    expect(screen.getByText("Close")).toBeInTheDocument();
  });
});

test("should render header text", () => {
  render(
    <CollapsibleCardPane header="Test Header">
      <div>Test Content</div>
    </CollapsibleCardPane>,
  );
  expect(screen.getByText("Test Header")).toBeInTheDocument();
});

test("should render children content", () => {
  render(
    <CollapsibleCardPane header="Test Header">
      <div>Test Content</div>
    </CollapsibleCardPane>,
  );
  expect(screen.getByText("Test Content")).toBeInTheDocument();
});

test("should toggle content visibility when header button is clicked", async () => {
  render(
    <CollapsibleCardPane header="Test Header">
      <div>Test Content</div>
    </CollapsibleCardPane>,
  );

  const content = screen.getByText("Test Content").closest("[data-state]");
  const button = screen.getByRole("button");

  // 初期状態では開いている
  expect(content).toHaveAttribute("data-state", "open");
  expect(button).toHaveAttribute("aria-expanded", "true");

  // ボタンをクリックして閉じる
  await userEvent.click(button);
  await waitFor(() => {
    expect(content).toHaveAttribute("data-state", "closed");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  // もう一度クリックして開く
  await userEvent.click(button);
  await waitFor(() => {
    expect(content).toHaveAttribute("data-state", "open");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});

test("should render custom header content", () => {
  render(
    <CollapsibleCardPane
      header={
        <div>
          <span>Custom</span>
          <span>Header</span>
        </div>
      }
    >
      <div>Test Content</div>
    </CollapsibleCardPane>,
  );

  expect(screen.getByText("Custom")).toBeInTheDocument();
  expect(screen.getByText("Header")).toBeInTheDocument();
});
