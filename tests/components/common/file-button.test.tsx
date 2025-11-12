import { expect, test, vi, beforeEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { FileButton } from "@/components/common/file-button";
import { customRender } from "tests/util";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";

const mockSetFile = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

function renderFileButton(
  props: Partial<ComponentProps<typeof FileButton>> = {},
) {
  return customRender(
    <FileButton
      filename={undefined}
      setFile={mockSetFile}
      accept="audio/*"
      placeholder="No file selected"
      cancelLabel="Cancel file"
      {...props}
    />,
  );
}

test("should render placeholder when no file is selected", () => {
  renderFileButton();
  expect(screen.getByDisplayValue("No file selected")).toBeInTheDocument();
  expect(screen.getByText("Open")).toBeInTheDocument();
});

test("should render filename when file is selected", () => {
  renderFileButton({ filename: "test.mp3" });
  expect(screen.getByDisplayValue("test.mp3")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Cancel file" }),
  ).toBeInTheDocument();
});

test("should call setFile when file is selected", () => {
  renderFileButton();
  const fileInput = screen.getByLabelText("No file selected");
  const file = new File(["test"], "test.mp3", { type: "audio/mpeg" });
  fireEvent.change(fileInput, { target: { files: [file] } });
  expect(mockSetFile).toHaveBeenCalledExactlyOnceWith(file);
});

test("should not call setFile when no file is selected", () => {
  renderFileButton();
  const fileInput = screen.getByLabelText("No file selected");
  fireEvent.change(fileInput, { target: { files: [] } });
  expect(mockSetFile).not.toHaveBeenCalled();
});

test("should call setFile with undefined when cancel button is clicked", async () => {
  renderFileButton({ filename: "test.mp3" });
  const cancelButton = screen.getByRole("button", { name: "Cancel file" });
  await userEvent.click(cancelButton);
  expect(mockSetFile).toHaveBeenCalledExactlyOnceWith(undefined);
});
