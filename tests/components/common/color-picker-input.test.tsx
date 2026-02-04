import { expect, test, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ColorPickerInput } from "@/components/common/color-picker-input";
import { customRender } from "tests/util";
import { ComponentProps } from "react";

const mockOnChange = vi.fn();

beforeEach(() => {
  mockOnChange.mockClear();
});

function renderColorPickerInput(
  props: Partial<ComponentProps<typeof ColorPickerInput>> = {},
) {
  return customRender(
    <ColorPickerInput
      value="#ff0000"
      onChange={mockOnChange}
      aria-label="Color picker"
      {...props}
    />,
  );
}

// Basic rendering tests
test("should render with the specified color in the text input", () => {
  renderColorPickerInput({ value: "#00ff00" });
  const input = screen.getByRole("textbox");
  expect(input).toHaveValue("#00ff00");
});

test("should render color preview with correct background color", () => {
  renderColorPickerInput({ value: "#0000ff" });
  const nativePicker = screen.getByLabelText("Color picker picker");
  expect(nativePicker.parentElement).toHaveStyle({
    backgroundColor: "#0000ff",
  });
});

test("should apply aria-label to the text input", () => {
  renderColorPickerInput({ "aria-label": "Pick a color" });
  expect(screen.getByLabelText("Pick a color")).toBeInTheDocument();
});

test("should apply custom className to the container", () => {
  renderColorPickerInput({ className: "custom-class" });
  const nativePicker = screen.getByLabelText("Color picker picker");
  const group = nativePicker.closest("[data-slot='input-group']");
  expect(group).toHaveClass("custom-class");
});

// Color picker tests
test("should call onChange when native color picker value changes", () => {
  renderColorPickerInput();
  const nativePicker = screen.getByLabelText("Color picker picker");
  fireEvent.input(nativePicker, { target: { value: "#00ff00" } });
  expect(mockOnChange).toHaveBeenCalledWith("#00ff00");
});

test("should update text input when native color picker changes", () => {
  renderColorPickerInput();
  const nativePicker = screen.getByLabelText("Color picker picker");
  fireEvent.input(nativePicker, { target: { value: "#00ff00" } });
  const textInput = screen.getByRole("textbox");
  expect(textInput).toHaveValue("#00ff00");
});

// Text input tests
test("should not call onChange while typing", () => {
  renderColorPickerInput();
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "#00ff" } });
  expect(mockOnChange).not.toHaveBeenCalled();
});

test("should call onChange with normalized value on blur", () => {
  renderColorPickerInput();
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "00ff00" } });
  fireEvent.blur(input);
  expect(mockOnChange).toHaveBeenCalledWith("#00ff00");
});

test("should call onChange with normalized value on Enter key", () => {
  renderColorPickerInput();
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "00ff00" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(mockOnChange).toHaveBeenCalledWith("#00ff00");
});

// Validation tests
test("should normalize color without hash prefix", () => {
  renderColorPickerInput();
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "00ff00" } });
  fireEvent.blur(input);
  expect(mockOnChange).toHaveBeenCalledWith("#00ff00");
});

test("should expand 3-digit hex to 6-digit", () => {
  renderColorPickerInput();
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "#0f0" } });
  fireEvent.blur(input);
  expect(mockOnChange).toHaveBeenCalledWith("#00ff00");
});

test("should convert uppercase to lowercase", () => {
  renderColorPickerInput();
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "#FF00FF" } });
  fireEvent.blur(input);
  expect(mockOnChange).toHaveBeenCalledWith("#ff00ff");
});

test("should revert to original value on invalid input", () => {
  renderColorPickerInput({ value: "#ff0000" });
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "#xyz" } });
  fireEvent.blur(input);
  expect(mockOnChange).not.toHaveBeenCalled();
  expect(input).toHaveValue("#ff0000");
});

test("should set aria-invalid=true during invalid input", () => {
  renderColorPickerInput({ value: "#ff0000" });
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "#xyz" } });
  expect(input).toHaveAttribute("aria-invalid", "true");
});

test("should not set aria-invalid for valid input", () => {
  renderColorPickerInput({ value: "#ff0000" });
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "#00ff00" } });
  expect(input).not.toHaveAttribute("aria-invalid", "true");
});

// Sync with external value changes
test("should sync input value when external value changes", () => {
  const { rerender } = render(
    <ColorPickerInput
      value="#ff0000"
      onChange={mockOnChange}
      aria-label="Color picker"
    />,
  );
  const input = screen.getByRole("textbox");
  expect(input).toHaveValue("#ff0000");

  rerender(
    <ColorPickerInput
      value="#00ff00"
      onChange={mockOnChange}
      aria-label="Color picker"
    />,
  );
  expect(screen.getByRole("textbox")).toHaveValue("#00ff00");
});

// Hash preservation tests
test("should always keep # at the beginning", () => {
  renderColorPickerInput({ value: "#ff0000" });
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "" } });
  expect(input).toHaveValue("#");
});

test("should restore # if user tries to delete it", () => {
  renderColorPickerInput({ value: "#ff0000" });
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "abc" } });
  expect(input).toHaveValue("#abc");
});

// Character limit tests
test("should limit input to 7 characters", () => {
  renderColorPickerInput({ value: "#ff0000" });
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "#ff0000abc" } });
  expect(input).toHaveValue("#ff0000");
});

// Live preview tests
test("should update preview color while typing valid color", () => {
  renderColorPickerInput({ value: "#ff0000" });
  const input = screen.getByRole("textbox");
  const nativePicker = screen.getByLabelText("Color picker picker");

  fireEvent.change(input, { target: { value: "#00ff00" } });
  expect(nativePicker.parentElement).toHaveStyle({
    backgroundColor: "#00ff00",
  });
});

test("should show fallback preview color for invalid input", () => {
  renderColorPickerInput({ value: "#ff0000" });
  const input = screen.getByRole("textbox");
  const nativePicker = screen.getByLabelText("Color picker picker");

  fireEvent.change(input, { target: { value: "#xyz" } });
  // Should fallback to committed value
  expect(nativePicker.parentElement).toHaveStyle({
    backgroundColor: "#ff0000",
  });
});

// Disabled state
test("should disable both inputs when disabled prop is true", () => {
  renderColorPickerInput({ disabled: true });
  const textInput = screen.getByRole("textbox");
  const nativePicker = screen.getByLabelText("Color picker picker");
  expect(textInput).toBeDisabled();
  expect(nativePicker).toBeDisabled();
});
