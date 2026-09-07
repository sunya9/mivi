import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";

export function ConfirmDialogHost() {
  const { confirmStore } = useAppContext();
  const state = useStore(confirmStore, (snapshot) => snapshot);
  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && confirmStore.resolve(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
          <DialogDescription>{state.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => confirmStore.resolve(false)}>
            {state.cancelLabel}
          </Button>
          <Button variant={state.variant} onClick={() => confirmStore.resolve(true)} autoFocus>
            {state.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
