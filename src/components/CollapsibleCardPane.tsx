import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type Props = {
  header: React.ReactNode;
  children: React.ReactNode;
};

export const CollapsibleCardPane = (props: Props) => {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible defaultOpen={true} onOpenChange={setOpen}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {props.header}

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <span className="md:sr-only">{open ? "Close" : "Open"}</span>
              {open ? (
                <ChevronsDownUp className="size-4" />
              ) : (
                <ChevronsUpDown className="size-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardTitle>
      </CardHeader>
      <CollapsibleContent>{props.children}</CollapsibleContent>
    </Collapsible>
  );
};
