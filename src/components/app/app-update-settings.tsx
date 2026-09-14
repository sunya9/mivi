import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { useMessages } from "@/lib/locale/use-messages";
import { usePwaContext } from "@/lib/pwa/use-pwa-context";

export function AppUpdateSettings() {
  const m = useMessages();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = usePwaContext();

  if (!needRefresh) return null;

  return (
    <Item>
      <ItemContent>
        <ItemTitle>
          {m.app_update_title()}
          <span aria-hidden className="inline-flex size-2.5 rounded-full bg-primary" />
        </ItemTitle>
        <ItemDescription>{m.app_update_available()}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" onClick={() => updateServiceWorker()}>
          <RefreshCw />
          {m.app_update_now()}
        </Button>
      </ItemActions>
    </Item>
  );
}
