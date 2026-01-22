import { createContext } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export interface PwaState extends ReturnType<typeof useRegisterSW> {
  canInstall: boolean;
  installPwa: () => Promise<boolean>;
}

export const PwaContext = createContext<PwaState | null>(null);
