import { memo } from "react";
import { Download, RefreshCw, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePwaContext } from "@/lib/pwa/use-pwa-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  className?: string;
  onOpenSettings?: () => void;
}

export const FooterPanel = memo(function FooterPanel({
  onOpenSettings,
  ...props
}: Props) {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
    canInstall,
    installPwa,
  } = usePwaContext();
  return (
    <footer {...props}>
      <Card
        className={cn(
          "border-0 bg-transparent shadow-none md:mx-auto md:block md:max-w-384 md:px-6 md:py-0",
        )}
      >
        <CardContent
          className={cn(
            "text-muted-foreground space-y-4",
            "md:mx-auto md:flex md:flex-row md:items-center md:justify-center md:gap-4 md:space-y-0 md:px-0 md:py-1 md:text-sm",
          )}
        >
          {canInstall && (
            <Button
              variant="ghost"
              size="sm"
              onClick={installPwa}
              className="hidden md:inline-flex"
            >
              <Download />
              Install app
            </Button>
          )}
          {needRefresh && (
            <Badge
              variant="default"
              asChild
              className="group hidden md:inline-flex"
            >
              <button onClick={() => updateServiceWorker()}>
                <RefreshCw className="group-hover:animate-spin" />
                Update available
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            onClick={onOpenSettings}
            size="sm"
            className="md:ml-auto"
          >
            <Settings />
            Settings
          </Button>
        </CardContent>
      </Card>
    </footer>
  );
});
