import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { customRender } from "tests/util";
import { expect, test, vi } from "vitest";

import { FileButton } from "@/components/common/file-button";

const mockSetFile = vi.fn<(file: File | undefined) => void>();

async function renderFileButton(props: Partial<ComponentProps<typeof FileButton>> = {}) {
  return await customRender(
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

test("should render placeholder when no file is selected", async () => {
  await renderFileButton();
  expect(screen.getByDisplayValue("No file selected")).toBeInTheDocument();
  expect(screen.getByText("Open")).toBeInTheDocument();
});

test("should render filename when file is selected", async () => {
  await renderFileButton({ filename: "test.mp3" });
  expect(screen.getByDisplayValue("test.mp3")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cancel file" })).toBeInTheDocument();
});

test("should call setFile when file is selected", async () => {
  await renderFileButton();
  const fileInput = screen.getByLabelText("No file selected");
  const file = new File(["test"], "test.mp3", { type: "audio/mpeg" });
  fireEvent.change(fileInput, { target: { files: [file] } });
  expect(mockSetFile).toHaveBeenCalledExactlyOnceWith(file);
});

test("should not call setFile when no file is selected", async () => {
  await renderFileButton();
  const fileInput = screen.getByLabelText("No file selected");
  fireEvent.change(fileInput, { target: { files: [] } });
  expect(mockSetFile).not.toHaveBeenCalled();
});

test("should call setFile with undefined when cancel button is clicked", async () => {
  await renderFileButton({ filename: "test.mp3" });
  const cancelButton = screen.getByRole("button", { name: "Cancel file" });
  await userEvent.click(cancelButton);
  expect(mockSetFile).toHaveBeenCalledExactlyOnceWith(undefined);
});

test("should show loading state when loading is true", async () => {
  await renderFileButton({ loading: true });
  expect(screen.getByDisplayValue("Loading...")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  expect(screen.queryByText("Open")).not.toBeInTheDocument();
});

test("should call onCancel when cancel button is clicked during loading", async () => {
  const mockOnCancel = vi.fn<() => void>();
  await renderFileButton({ loading: true, onCancel: mockOnCancel });
  const cancelButton = screen.getByRole("button", { name: "Cancel" });
  await userEvent.click(cancelButton);
  expect(mockOnCancel).toHaveBeenCalledOnce();
});
