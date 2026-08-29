import { useState } from "react";

import { FileDbStore, FileDbStoreContext } from "@/lib/file-db/file-db-store";

export function FileDbStoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new FileDbStore());
  return <FileDbStoreContext value={store}>{children}</FileDbStoreContext>;
}
