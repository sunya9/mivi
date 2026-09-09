import { cn } from "cn";

import { ExportButton } from "@/components/app/export-button";

interface Props {
  className?: string;
}

export function AppHeader({ className }: Props) {
  return (
    <header className={cn("relative border-b", className)}>
      <div className="mx-auto flex max-w-384 items-center justify-between gap-2 px-4 py-2 md:flex-row md:items-end md:p-6">
        <div className="inline-flex items-baseline gap-2">
          <h1 className="text-2xl font-bold tracking-tighter md:text-7xl">MiVi</h1>
          <p className="text-sm font-medium tracking-tighter text-muted-foreground md:text-xl">
            <span className="text-accent-foreground">MI</span>DI{" "}
            <span className="text-accent-foreground">Vi</span>sualizer
          </p>
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <ExportButton />
        </div>
      </div>
    </header>
  );
}
