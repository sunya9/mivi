import { expect, test } from "vitest";

import { ConfirmStore } from "@/lib/confirm/confirm-store";

test("confirm opens the dialog with defaults filled in", () => {
  const store = new ConfirmStore();
  void store.confirm({ title: "Title", description: "Desc" });

  expect(store.getSnapshot()).toEqual({
    open: true,
    title: "Title",
    description: "Desc",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    variant: "default",
  });
});

test("resolve closes the dialog and settles the pending promise", async () => {
  const store = new ConfirmStore();
  const pending = store.confirm({ title: "T", description: "D", confirmLabel: "Yes" });

  store.resolve(true);

  await expect(pending).resolves.toBe(true);
  expect(store.getSnapshot().open).toBe(false);
});

test("a new confirm cancels the one still pending", async () => {
  const store = new ConfirmStore();
  const first = store.confirm({ title: "1", description: "" });
  const second = store.confirm({ title: "2", description: "" });

  await expect(first).resolves.toBe(false);
  store.resolve(true);
  await expect(second).resolves.toBe(true);
});

test("resolve without a pending confirm is a no-op", () => {
  const store = new ConfirmStore();
  store.resolve(true);
  expect(store.getSnapshot().open).toBe(false);
});
