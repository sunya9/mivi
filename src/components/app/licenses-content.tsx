import { useEffect, useState } from "react";
import type { LicenseNotice } from "virtual:license-notices";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function LicensesContent({ className }: Props) {
  const [notices, setNotices] = useState<LicenseNotice[] | Error>();

  // Effects stay paused while the tab is hidden, so the chunk loads only once it is shown
  useEffect(() => {
    let cancelled = false;
    import("virtual:license-notices").then(
      (mod) => {
        if (!cancelled) setNotices(mod.default);
      },
      (error: unknown) => {
        if (!cancelled) setNotices(error instanceof Error ? error : new Error(String(error)));
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="hidden text-lg font-semibold md:block">Licenses</h2>
      <p>
        MiVi is released under the{" "}
        <a href="https://github.com/sunya9/mivi/blob/main/LICENSE">MIT License</a> and bundles the
        following open source packages.
      </p>
      {notices === undefined ? (
        <Spinner />
      ) : notices instanceof Error ? (
        <p role="alert" className="text-sm text-destructive">
          Failed to load the license list. Please check your connection and try again.
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {notices.map((notice) => (
            <li key={`${notice.name}@${notice.version}`}>
              {notice.text ? (
                <details>
                  <summary className="cursor-pointer">
                    <NoticeHeading notice={notice} />
                  </summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap text-muted-foreground">
                    {notice.text}
                  </pre>
                </details>
              ) : (
                <NoticeHeading notice={notice} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NoticeHeading({ notice }: { notice: LicenseNotice }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <a href={`https://www.npmjs.com/package/${notice.name}/v/${notice.version}`}>{notice.name}</a>
      <span className="text-muted-foreground">{notice.version}</span>
      {notice.license && <Badge variant="outline">{notice.license}</Badge>}
    </span>
  );
}
