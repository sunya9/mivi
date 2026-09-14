import { useEffect } from "react";
import { useHotkeysContext } from "react-hotkeys-hook";

const suspenders = new Map<string, number>();

export function useSuspendHotkeysScope(scope: string) {
  const { enableScope, disableScope } = useHotkeysContext();
  useEffect(() => {
    suspenders.set(scope, (suspenders.get(scope) ?? 0) + 1);
    disableScope(scope);
    return () => {
      const remaining = (suspenders.get(scope) ?? 1) - 1;
      suspenders.set(scope, remaining);
      if (remaining === 0) enableScope(scope);
    };
  }, [scope, enableScope, disableScope]);
}
