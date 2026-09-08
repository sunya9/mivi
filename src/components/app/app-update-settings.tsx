import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { usePwaContext } from "@/lib/pwa/use-pwa-context";

export function AppUpdateSettings() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = usePwaContext();

  if (!needRefresh) return null;

  return (
    <Item>
      <ItemContent>
        <ItemTitle>
          App updates
          <span aria-hidden className="inline-flex size-2.5 rounded-full bg-primary" />
        </ItemTitle>
        <ItemDescription>A new version is available.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" onClick={() => updateServiceWorker()}>
          <RefreshCw />
          Update now
        </Button>
      </ItemActions>
    </Item>
  );
}
