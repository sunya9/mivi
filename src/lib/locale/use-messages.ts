import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";
import { m } from "@/paraglide/messages";

export function useMessages() {
  const { localeStore } = useAppContext();
  return useStore(localeStore, () => ({ ...m }));
}
