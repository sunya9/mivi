import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { customRender } from "tests/util";
import { expect, test, vi } from "vitest";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PLAYER_HOTKEYS_SCOPE } from "@/lib/hotkeys";

function PlayerHotkeyProbe({ onKey }: { onKey: () => void }) {
  useHotkeys("m", onKey, { scopes: [PLAYER_HOTKEYS_SCOPE] });
  return null;
}

function ModalDialog({ title, defaultOpen = true }: { title: string; defaultOpen?: boolean }) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
      </DialogContent>
    </Dialog>
  );
}

test("player hotkeys fire while no dialog is open", async () => {
  const onKey = vi.fn<() => void>();
  await customRender(
    <>
      <PlayerHotkeyProbe onKey={onKey} />
      <ModalDialog title="Closed" defaultOpen={false} />
    </>,
  );

  await userEvent.keyboard("m");

  expect(onKey).toHaveBeenCalledOnce();
});

test("player hotkeys are suspended while a dialog is open and resume after it closes", async () => {
  const onKey = vi.fn<() => void>();
  await customRender(
    <>
      <PlayerHotkeyProbe onKey={onKey} />
      <ModalDialog title="Settings" />
    </>,
  );

  await userEvent.keyboard("m");
  expect(onKey).not.toHaveBeenCalled();

  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

  await userEvent.keyboard("m");
  expect(onKey).toHaveBeenCalledOnce();
});

function StackedDialogs() {
  const [innerOpen, setInnerOpen] = useState(true);
  return (
    <>
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Outer</DialogTitle>
        </DialogContent>
      </Dialog>
      <Dialog open={innerOpen} onOpenChange={setInnerOpen}>
        <DialogContent>
          <DialogTitle>Inner</DialogTitle>
          <button type="button" onClick={() => setInnerOpen(false)}>
            Close inner
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

test("player hotkeys stay suspended until every open dialog has closed", async () => {
  const onKey = vi.fn<() => void>();
  await customRender(
    <>
      <PlayerHotkeyProbe onKey={onKey} />
      <StackedDialogs />
    </>,
  );

  await userEvent.click(screen.getByRole("button", { name: "Close inner", hidden: true }));
  await waitFor(() => expect(screen.queryByText("Inner")).not.toBeInTheDocument());

  await userEvent.keyboard("m");
  expect(onKey).not.toHaveBeenCalled();
});
