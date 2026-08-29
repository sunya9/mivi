import { toast } from "@/components/ui/toast";

export function errorLogWithToast(message: string, error?: unknown) {
  console.error(...[message, error].filter(Boolean));
  const description = error instanceof Error ? error.message : undefined;
  toast.add({ title: message, description, type: "error" });
}
