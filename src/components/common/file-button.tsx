import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CircleXIcon } from "lucide-react";

interface FileButtonProps {
  filename: string | undefined;
  setFile: (file: File | undefined) => void;
  accept: string;
  children: React.ReactNode;
  placeholder: string;
  cancelLabel: string;
}

export function FileButton({
  filename,
  setFile,
  accept,
  children,
  placeholder,
  cancelLabel,
}: FileButtonProps) {
  const onChangeFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const file = e.target.files?.[0];
      if (!file) return;
      setFile(file);
      e.currentTarget.value = "";
    },
    [setFile],
  );
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center overflow-hidden">
        {filename ? (
          <>
            <Button
              variant="icon"
              size="icon"
              onClick={() => setFile(undefined)}
              className="mr-2 w-auto justify-start p-1"
            >
              <CircleXIcon />
              <span className="sr-only">{cancelLabel}</span>
            </Button>
            <span className="flex-1 truncate">{filename}</span>
          </>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </span>

      <Button
        size="default"
        variant="default"
        className="flex-none cursor-pointer"
        asChild
      >
        <label>
          <input
            type="file"
            accept={accept}
            onChange={onChangeFile}
            className="hidden"
          />
          {children}
        </label>
      </Button>
    </div>
  );
}
