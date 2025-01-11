import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resetDb } from "@/lib/FileStorage";
import { FallbackProps } from "react-error-boundary";

export const Fallback = (props: FallbackProps) => {
  const resetConfig = async () => {
    await resetDb();
    window.location.reload();
  };
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <Card className="max-w-xl flex-none">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-4">
            If you are seeing this, please try resetting the configuration. If
            the problem persists, please contact the developer.
          </p>
          <pre className="mt-3 max-h-96 overflow-auto bg-muted px-2 py-4">
            {JSON.stringify(props.error, null, 2)}
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
};
