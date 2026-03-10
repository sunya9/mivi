import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";

export function InfoTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger delay={0} render={<Info className="size-4" />} />
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
