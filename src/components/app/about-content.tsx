import { cn } from "cn";
import { CircleCheck, CircleX, Info } from "lucide-react";
import { useMemo } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { checkBrowserApis } from "@/lib/browser-compat/browser-compat";
import { useMessages } from "@/lib/locale/use-messages";

interface Props {
  className?: string;
}

const buildDatetime = import.meta.env.VITE_BUILD_DATETIME || "unknown";
const appVersion = import.meta.env.VITE_APP_VERSION || "unknown";

export function AboutContent({ className }: Props) {
  const m = useMessages();
  const apiStatuses = useMemo(() => checkBrowserApis(), []);

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="hidden text-lg font-semibold md:block">{m.about_heading()}</h2>
      <p>{m.about_description()}</p>
      <Alert role="note">
        <Info />
        <AlertTitle>{m.about_browser_api_title()}</AlertTitle>
        <AlertDescription>
          <p>{m.about_browser_api_description()}</p>
          <ul>
            {apiStatuses.map((api) => (
              <li key={api.name} className={cn("flex items-center gap-2 text-sm")}>
                {api.supported ? (
                  <CircleCheck
                    role="img"
                    aria-label={m.common_supported()}
                    className="size-4 text-emerald-600"
                  />
                ) : (
                  <CircleX
                    role="img"
                    aria-label={m.common_not_supported()}
                    className="size-4 text-orange-600"
                  />
                )}
                {api.name}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
      <p>
        {m.about_created_by_prefix()}
        <a href="https://x.com/ephemeralMocha">@ephemeralMocha</a>
        {m.about_created_by_suffix()}
      </p>

      <dl className="grid grid-cols-[auto_1fr] gap-x-2 text-xs text-muted-foreground">
        <dt>{m.about_built_at()}</dt>
        <dd>{buildDatetime}</dd>
        <dt>{m.about_app_version()}</dt>
        <dd>{appVersion}</dd>
      </dl>

      <p>
        <a href="https://github.com/sunya9/mivi">{m.about_github_repository()}</a>
      </p>
    </div>
  );
}
