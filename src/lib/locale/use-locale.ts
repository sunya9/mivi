import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";
import { shallowEqual } from "@/lib/store/observable-store";

export function useLocale() {
  const { localeStore } = useAppContext();
  const snapshot = useStore(localeStore, (snapshot) => snapshot, shallowEqual);
  return { ...snapshot, setPreference: localeStore.setPreference };
}
