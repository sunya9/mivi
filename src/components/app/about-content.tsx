import { CheckIcon, Info, XIcon } from "lucide-react";
import { useMemo } from "react";
import { checkBrowserApis } from "@/lib/browser-compat/browser-compat";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  className?: string;
}

export function AboutContent({ className }: Props) {
  const apiStatuses = useMemo(() => checkBrowserApis(), []);

  return (
    <div className={cn("space-y-4", className)}>
      <p>
        MiVi is a web application that visualizes MIDI files with synchronized
        audio playback and video export capabilities.
      </p>
      <Alert>
        <Info />
        <AlertTitle>Browser API Support</AlertTitle>
        <AlertDescription>
          <p>
            This app uses modern browser APIs. For the best experience, please
            use the latest version of Chrome, Firefox, Edge, or Safari.
          </p>
          <ul>
            {apiStatuses.map((api) => (
              <li
                key={api.name}
                className={cn("flex items-center gap-2 text-sm")}
              >
                {api.supported ? (
                  <CheckIcon className="size-4 text-emerald-500" />
                ) : (
                  <XIcon className="size-4 text-orange-600" />
                )}
                {api.name}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
      <p>
        Created by{" "}
        <Button variant="link" size="link" asChild>
          <a href="https://x.com/ephemeralMocha">@ephemeralMocha</a>
        </Button>
        .
      </p>
      <p>
        <Button variant="link" size="link" asChild>
          <a href="https://github.com/sunya9/mivi">GitHub Repository</a>
        </Button>
      </p>
    </div>
  );
}
