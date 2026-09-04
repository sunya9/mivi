import { use, useState } from "react";

import { FileDbStore, FileDbStoreContext, useFileDbStore } from "@/lib/file-db/file-db-store";

export function FileDbStoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new FileDbStore());
  return <FileDbStoreContext value={store}>{children}</FileDbStoreContext>;
}

export function FileDbGate({ children }: { children: React.ReactNode }) {
  const store = useFileDbStore();
  use(store.preload());
  return children;
}
