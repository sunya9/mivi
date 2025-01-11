import { resetDb } from "@/lib/FileStorage";
import { useCallback } from "react";

export const useResetConfig = () => {
  return useCallback(async () => {
    await resetDb();
    window.location.reload();
  }, []);
};
