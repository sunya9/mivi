import { memo } from "react";
import { Download, InfoIcon, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsMenu } from "@/components/app/settings-menu";
import { cn } from "@/lib/utils";
import { AboutContent } from "./about-content";
import { usePwaContext } from "@/lib/pwa/use-pwa-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AboutPanelProps {
  className?: string;
}

export const AboutPanel = memo(function AboutPanel({
  ...props
}: AboutPanelProps) {
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
        <CardHeader className="md:hidden">
          <CardTitle>
            <h2>About</h2>
          </CardTitle>
        </CardHeader>
        <CardContent
          className={cn(
            "text-muted-foreground space-y-4",
            "md:mx-auto md:flex md:flex-row md:items-center md:justify-center md:gap-4 md:space-y-0 md:px-0 md:py-1 md:text-sm",
          )}
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex"
              >
                <InfoIcon />
                About this app
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About MiVi</DialogTitle>
                <DialogDescription>MIDI Visualizer</DialogDescription>
              </DialogHeader>
              <AboutContent />
            </DialogContent>
          </Dialog>
          <AboutContent className="md:hidden" />

          {needRefresh && (
            <>
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
              <Item variant="outline" className="md:hidden">
                <ItemMedia variant="icon">
                  <RefreshCw className="group-hover:animate-spin" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Update available</ItemTitle>
                  <ItemDescription>
                    Update the app to the latest version
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateServiceWorker()}
                  >
                    Update
                  </Button>
                </ItemActions>
              </Item>
            </>
          )}
          {canInstall && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={installPwa}
                className="hidden md:inline-flex"
              >
                <Download />
                Install app
              </Button>
              <Item variant="default" className="md:hidden">
                <ItemMedia variant="icon">
                  <Download />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Install app</ItemTitle>
                  <ItemDescription>
                    You can install this app as a PWA.
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant="outline" size="sm" onClick={installPwa}>
                    Install
                  </Button>
                </ItemActions>
              </Item>
            </>
          )}
          <SettingsMenu className="md:ml-auto" />
        </CardContent>
      </Card>
    </footer>
  );
});
