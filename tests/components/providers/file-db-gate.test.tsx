import { act, fireEvent, render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { expect, test, vi } from "vitest";

import { FileDbGate } from "@/components/providers/file-db-gate";
import * as fileDb from "@/lib/file-db/file-db";
import { FileDbStore, FileDbStoreContext } from "@/lib/file-db/file-db-store";

function renderGate(store = new FileDbStore()) {
  return act(async () => {
    render(
      <FileDbStoreContext value={store}>
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => (
            <button onClick={resetErrorBoundary}>retry</button>
          )}
          onReset={store.reset}
        >
          <Suspense fallback={<p>loading</p>}>
            <FileDbGate>
              <p>ready</p>
            </FileDbGate>
          </Suspense>
        </ErrorBoundary>
      </FileDbStoreContext>,
    );
  });
}

test("shows fallback until the file db is loaded, then children", async () => {
  let resolve!: (value: undefined) => void;
  const promise = new Promise<undefined>((r) => (resolve = r));
  vi.spyOn(fileDb, "fetchValue").mockReturnValue(promise);
  await renderGate();

  expect(screen.getByText("loading")).toBeInTheDocument();
  expect(screen.queryByText("ready")).toBeNull();

  await act(async () => resolve(undefined));

  expect(screen.getByText("ready")).toBeInTheDocument();
  expect(screen.queryByText("loading")).toBeNull();
});

test("surfaces a load failure to the error boundary and retries on reset", async () => {
  const fetchValue = vi.spyOn(fileDb, "fetchValue").mockRejectedValue(new Error("boom"));
  vi.spyOn(console, "error").mockImplementation(() => {});
  const store = new FileDbStore();
  await renderGate(store);

  const retry = await screen.findByRole("button", { name: "retry" });

  fetchValue.mockRestore();
  await act(async () => {
    fireEvent.click(retry);
    await store.preload();
  });

  expect(screen.getByText("ready")).toBeInTheDocument();
});
