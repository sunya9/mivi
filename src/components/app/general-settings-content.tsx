import type { ReactNode } from "react";

import { ThemeSettings } from "./theme-settings";

interface GeneralSettingsContentProps {
  children?: ReactNode;
}

export function GeneralSettingsContent({ children }: GeneralSettingsContentProps) {
  return (
    <div className="space-y-4">
      <h2 className="hidden text-lg font-semibold md:block">General</h2>
      <ThemeSettings />
      {children}
    </div>
  );
}
