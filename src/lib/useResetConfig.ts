import { reset } from "@/atoms/reset";
import { useCallback } from "react";

export const useResetConfig = () => {
  return useCallback(async () => {
    await reset();
  }, []);
};
