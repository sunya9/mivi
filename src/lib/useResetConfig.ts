import { useCallback } from "react";

export const useResetConfig = () => {
  return useCallback(async () => {
    // TODO: remove configuration, service worker, etc...
    window.location.reload();
  }, []);
};
