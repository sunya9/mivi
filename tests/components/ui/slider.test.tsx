import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import { Slider } from "@/components/ui/slider";

test("label prop names the slider and its thumb", () => {
  render(<Slider label="Amount" value={[5]} min={0} max={10} />);

  const group = screen.getByRole("group", { name: "Amount" });
  const input = within(group).getByRole("slider", { hidden: true });
  expect(input).toHaveAttribute("aria-labelledby", screen.getByText("Amount").id);
});

test("clicking the label focuses the range input", async () => {
  render(<Slider label="Amount" value={[5]} min={0} max={10} />);

  await userEvent.click(screen.getByText("Amount"));
  expect(within(screen.getByRole("group")).getByRole("slider", { hidden: true })).toHaveFocus();
});

test("label prop names every thumb of a range slider", () => {
  render(<Slider label="Range" value={[2, 8]} min={0} max={10} />);

  const inputs = within(screen.getByRole("group", { name: "Range" })).getAllByRole("slider", {
    hidden: true,
  });
  expect(inputs).toHaveLength(2);
  for (const input of inputs) {
    expect(input).toHaveAttribute("aria-labelledby", screen.getByText("Range").id);
  }
});

test("labelClassName and controlClassName style the label and control only", () => {
  render(
    <Slider
      label="Amount"
      className="contents"
      labelClassName="text-xs"
      controlClassName="w-16"
      value={[5]}
      min={0}
      max={10}
    />,
  );

  const label = screen.getByText("Amount");
  expect(label).toHaveClass("text-xs");
  expect(label.nextElementSibling).toHaveClass("w-16");
  expect(screen.getByRole("group", { name: "Amount" })).toHaveClass("contents");
});

test("renders no label element without the label prop", () => {
  render(<Slider aria-label="Volume" value={[1]} min={0} max={1} />);

  expect(document.querySelector('[data-slot="slider-label"]')).toBeNull();
});
