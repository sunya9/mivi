import { use } from "react";

import { useAppContext } from "@/contexts/app-context";

export function FileStoreGate({ children }: { children: React.ReactNode }) {
  const { fileStore } = useAppContext();
  use(fileStore.preload());
  return children;
}
