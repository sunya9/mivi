import { useState, useCallback, useEffect, useRef } from "react";
import type { PwaState } from "@/pwa/pwa-context";
import { useRegisterSW } from "virtual:pwa-register/react";

export function usePwaState(): PwaState {
  const registerSW = useRegisterSW();
  const [canInstall, setCanInstall] = useState(false);
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      installPromptRef.current = e;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      installPromptRef.current = null;
      setCanInstall(false);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPwa = useCallback(async (): Promise<boolean> => {
    const promptEvent = installPromptRef.current;
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;

      if (outcome === "accepted") {
        installPromptRef.current = null;
        setCanInstall(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    ...registerSW,
    canInstall,
    installPwa,
  };
}
