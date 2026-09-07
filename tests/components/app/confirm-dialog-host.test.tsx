import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioContext } from "standardized-audio-context-mock";
import { customRender } from "tests/util";
import { expect, test } from "vitest";

import { ConfirmDialogHost } from "@/components/app/confirm-dialog-host";
import { createAppContext } from "@/contexts/app-context";

async function renderHost() {
  const appContextValue = createAppContext(new AudioContext());
  await customRender(<ConfirmDialogHost />, { appContextValue });
  return appContextValue.confirmStore;
}

test("stays hidden until something asks for confirmation", async () => {
  await renderHost();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("shows the pending confirmation and resolves true on confirm", async () => {
  const store = await renderHost();
  let pending!: Promise<boolean>;
  act(() => {
    pending = store.confirm({
      title: "Same file detected",
      description: "Overwrite?",
      confirmLabel: "Overwrite",
      cancelLabel: "Keep",
    });
  });

  expect(await screen.findByRole("dialog")).toHaveTextContent("Same file detected");
  await userEvent.click(screen.getByRole("button", { name: "Overwrite" }));

  await expect(pending).resolves.toBe(true);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});

test("resolves false on cancel", async () => {
  const store = await renderHost();
  let pending!: Promise<boolean>;
  act(() => {
    pending = store.confirm({ title: "T", description: "D" });
  });

  await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));

  await expect(pending).resolves.toBe(false);
});
