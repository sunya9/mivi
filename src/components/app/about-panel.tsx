import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleTheme } from "@/components/app/toggle-theme";
import { cn } from "@/lib/utils";

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
          <p>
            Created by{" "}
            <Button variant="linkSmall" size="link" asChild>
              <a href="https://x.com/ephemeralMocha">@ephemeralMocha</a>
            </Button>
            .
          </p>
          <p>
            <Button variant="linkSmall" size="link" asChild>
              <a href="https://github.com/sunya9/mivi">GitHub Repository</a>
            </Button>
          </p>
          <p className="md:ml-auto">
            <ToggleTheme />
          </p>
        </CardContent>
      </Card>
    </footer>
  );
});
