import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";

import { SliderRow } from "@/components/common/slider-row";

test("renders a labelled slider laid out as a form row", () => {
  render(<SliderRow label={<span>Time Window: 5s</span>} value={[5]} min={0} max={20} />);

  const group = screen.getByRole("group", { name: "Time Window: 5s" });
  expect(group).toHaveClass("flex", "items-center", "justify-between");
  expect(within(group).getByRole("slider", { hidden: true })).toBeInTheDocument();
  expect(screen.getByText("Time Window: 5s").parentElement).toHaveClass("flex-1");
});

test("sizes the control for the row unless overridden", () => {
  const { unmount } = render(<SliderRow label="Default" value={[1]} />);
  expect(screen.getByText("Default").nextElementSibling).toHaveClass("w-24");
  unmount();

  render(<SliderRow label="Wide" controlClassName="w-48" value={[1]} />);
  const control = screen.getByText("Wide").nextElementSibling;
  expect(control).toHaveClass("w-48");
  expect(control).not.toHaveClass("w-24");
});
