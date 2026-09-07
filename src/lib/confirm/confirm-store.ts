import { ObservableStore } from "@/lib/store/observable-store";

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

export type ConfirmSnapshot = Required<ConfirmOptions> & { open: boolean };

const CLOSED: ConfirmSnapshot = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: "default",
};

export class ConfirmStore extends ObservableStore<ConfirmSnapshot> {
  #resolve: ((value: boolean) => void) | undefined;

  constructor() {
    super(CLOSED);
  }

  confirm = (options: ConfirmOptions): Promise<boolean> => {
    this.#resolve?.(false);
    return new Promise((resolve) => {
      this.#resolve = resolve;
      this.setSnapshot({ ...CLOSED, ...options, open: true });
    });
  };

  resolve = (value: boolean): void => {
    const resolve = this.#resolve;
    this.#resolve = undefined;
    this.setSnapshot({ ...this.getSnapshot(), open: false });
    resolve?.(value);
  };
}
