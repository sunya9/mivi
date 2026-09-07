import { CircleXIcon } from "lucide-react";
import { useCallback, useId, useRef } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface Props {
  filename: string | undefined;
  setFile: (file: File | undefined) => void;
  accept: string;
  label: string;
  placeholder: string;
  cancelLabel: string;
  loading?: boolean;
  onCancel?: () => void;
}

export function FileButton({
  filename,
  setFile,
  accept,
  label,
  placeholder,
  cancelLabel,
  loading,
  onCancel,
}: Props) {
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
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const handleClick = useCallback(() => {
    fileRef.current?.click();
  }, []);
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={loading ? undefined : id} className="flex-1">
        {label}
      </label>
      {loading ? (
        <InputGroup className="w-64">
          <InputGroupText className="min-w-0 flex-1 truncate pl-2.5">Loading...</InputGroupText>
          <InputGroupAddon>
            <Spinner />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={onCancel}>Cancel</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <InputGroup className="w-64">
          <input
            aria-label={placeholder}
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={onChangeFile}
            className="hidden"
            id={id}
          />
          <InputGroupText
            className={cn("min-w-0 flex-1 truncate pl-2.5", filename && "text-foreground")}
          >
            {filename || placeholder}
          </InputGroupText>
          <InputGroupAddon align="inline-end">
            {filename && (
              <InputGroupButton
                onClick={() => setFile(undefined)}
                size="icon-xs"
                aria-label={cancelLabel}
              >
                <CircleXIcon />
              </InputGroupButton>
            )}
            <InputGroupButton onClick={handleClick}>Open</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      )}
    </div>
  );
}
