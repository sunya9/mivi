import { expect, beforeEach, vi, test } from "vitest";
import { errorLogWithToast } from "@/lib/error-toast";
import { toast } from "@/components/ui/toast";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

test("calls console.error and error toast with message", () => {
  const message = "Test error message";
  errorLogWithToast(message);

  expect(console.error).toHaveBeenCalledExactlyOnceWith(message);
  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: message,
    description: undefined,
    type: "error",
  });
});

test("calls console.error and error toast with message and error object", () => {
  const message = "Test error message";
  const error = new Error("Test error");
  errorLogWithToast(message, error);

  expect(console.error).toHaveBeenCalledExactlyOnceWith(message, error);
  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: message,
    description: error.message,
    type: "error",
  });
});

test("handles undefined error object", () => {
  const message = "Test error message";
  errorLogWithToast(message, undefined);

  expect(console.error).toHaveBeenCalledExactlyOnceWith(message);
  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: message,
    description: undefined,
    type: "error",
  });
});
