import { expect, test, vi, beforeEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { ColorPickerButton } from "@/components/common/color-picker-button";
import { customRender } from "tests/util";
import { ComponentProps } from "react";

const mockOnChange = vi.fn();

beforeEach(() => {
  mockOnChange.mockClear();
});

function renderColorPickerButton(
  props: Partial<ComponentProps<typeof ColorPickerButton>> = {},
) {
  return customRender(
    <ColorPickerButton
      value="#ff0000"
      onChange={mockOnChange}
      aria-label="Color picker"
      {...props}
    />,
  );
}

test("should render with the specified background color", () => {
  renderColorPickerButton({ value: "#00ff00" });
  const input = screen.getByLabelText("Color picker");
  expect(input.parentElement).toHaveStyle({ backgroundColor: "#00ff00" });
});

test("should call onChange when color is changed", () => {
  renderColorPickerButton();
  const input = screen.getByLabelText("Color picker");
  fireEvent.input(input, { target: { value: "#0000ff" } });
  expect(mockOnChange).toHaveBeenCalledWith("#0000ff");
});

test("should apply aria-label to the input", () => {
  renderColorPickerButton({ "aria-label": "Pick a color" });
  expect(screen.getByLabelText("Pick a color")).toBeInTheDocument();
});

test("should apply custom className to the container", () => {
  renderColorPickerButton({ className: "custom-class" });
  const input = screen.getByLabelText("Color picker");
  expect(input.parentElement).toHaveClass("custom-class");
});
