import { use } from "react";

import { useFileStore } from "@/lib/file-store/use-file-store";

export function FileStoreGate({ children }: { children: React.ReactNode }) {
  const store = useFileStore();
  use(store.preload());
  return children;
}
