import type { ReactNode } from "react";

import { useMessages } from "@/lib/locale/use-messages";

import { LanguageSettings } from "./language-settings";
import { ThemeSettings } from "./theme-settings";

interface GeneralSettingsContentProps {
  children?: ReactNode;
}

export function GeneralSettingsContent({ children }: GeneralSettingsContentProps) {
  const m = useMessages();
  return (
    <div className="space-y-4">
      <h2 className="hidden text-lg font-semibold md:block">{m.settings_nav_general()}</h2>
      <ThemeSettings />
      <LanguageSettings />
      {children}
    </div>
  );
}
