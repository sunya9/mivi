import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resetConfig } from "@/lib/utils";
import { FallbackProps } from "react-error-boundary";

export function Fallback(props: FallbackProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <Card className="max-w-xl flex-none">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            If you are seeing this, please try resetting the configuration. If
            the problem persists, please contact the developer.
          </p>
          <pre className="bg-muted mt-3 max-h-96 overflow-auto px-2 py-4">
            {props.error instanceof Error
              ? props.error.message
              : JSON.stringify(props.error, null, 2)}
          </pre>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={resetConfig}>
            Reset configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
