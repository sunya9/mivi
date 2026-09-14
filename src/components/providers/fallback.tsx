import { FallbackProps, getErrorMessage } from "react-error-boundary";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/app-context";
import { useMessages } from "@/lib/locale/use-messages";
import { resetConfig } from "@/lib/utils";

export function Fallback(props: FallbackProps) {
  const m = useMessages();
  const { fileStore } = useAppContext();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <Card className="max-w-xl flex-none">
        <CardHeader>
          <CardTitle>{m.error_title()}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{m.error_description()}</p>
          <pre className="mt-3 max-h-96 overflow-auto bg-muted px-2 py-4">
            {getErrorMessage(props.error)}
          </pre>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={props.resetErrorBoundary}>{m.error_reload_app()}</Button>
          <Button variant="outline" onClick={() => resetConfig(fileStore)}>
            {m.error_reset_configuration()}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
