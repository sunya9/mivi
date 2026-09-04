import { use } from "react";

import { useFileDbStore } from "@/lib/file-db/file-db-store";

export function FileDbGate({ children }: { children: React.ReactNode }) {
  const store = useFileDbStore();
  use(store.preload());
  return children;
}
