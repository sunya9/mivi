import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSelect } from "@/components/app/theme-select";
import { AboutDialog } from "@/components/app/about-dialog";
import { cn } from "@/lib/utils";
import { AboutContent } from "./about-content";

interface AboutPanelProps {
  className?: string;
}

export const AboutPanel = memo(function AboutPanel({
  ...props
}: AboutPanelProps) {
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
          <AboutDialog className="hidden md:inline-flex">
            <AboutContent />
          </AboutDialog>
          <AboutContent className="md:hidden" />
          <ThemeSelect className="md:ml-auto" />
        </CardContent>
      </Card>
    </footer>
  );
});
