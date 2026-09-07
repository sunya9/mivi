import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";

export function useTheme() {
  const { themeStore } = useAppContext();
  const theme = useStore(themeStore, (snapshot) => snapshot.theme);
  return { theme, setTheme: themeStore.setTheme };
}
