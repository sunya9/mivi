import { expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Fallback } from "@/components/providers/fallback";
import { resetConfig } from "@/lib/utils";

vi.mock(import("@/lib/utils"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    resetConfig: vi.fn(),
  };
});

test("renders error message when error is an Error instance", () => {
  const error = new Error("Test error message");
  render(<Fallback error={error} resetErrorBoundary={() => {}} />);

  expect(screen.getByText("Error")).toBeInTheDocument();
  expect(screen.getByText("Test error message")).toBeInTheDocument();
  expect(screen.getByText("Reset configuration")).toBeInTheDocument();
});

test("renders stringified error when error is not an Error instance", () => {
  const error = { message: "Custom error object" };
  render(<Fallback error={error} resetErrorBoundary={() => {}} />);

  expect(screen.getByText("Error")).toBeInTheDocument();
  expect(screen.getByText(new RegExp(error.message, "i"))).toBeInTheDocument();
});

test("calls resetConfig when reset button is clicked", () => {
  render(
    <Fallback error={new Error("Test error")} resetErrorBoundary={() => {}} />,
  );

  const resetButton = screen.getByText("Reset configuration");
  fireEvent.click(resetButton);
  expect(resetConfig).toHaveBeenCalledTimes(1);
});
