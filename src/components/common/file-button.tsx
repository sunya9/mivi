import { useCallback, useRef } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { CircleXIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  filename: string | undefined;
  setFile: (file: File | undefined) => void;
  accept: string;
  placeholder: string;
  cancelLabel: string;
  loading?: boolean;
  onCancel?: () => void;
}

export function FileButton({
  filename,
  setFile,
  accept,
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
  const handleClick = useCallback(() => {
    fileRef.current?.click();
  }, []);
  if (loading) {
    return (
      <InputGroup>
        <InputGroupInput readOnly value="Loading..." disabled />
        <InputGroupAddon>
          <Spinner />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onCancel}>Cancel</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  } else {
    return (
      <InputGroup>
        <input
          aria-label={placeholder}
          ref={fileRef}
          type="file"
          accept={accept}
          onChange={onChangeFile}
          className="hidden"
        />
        <InputGroupInput readOnly value={filename || placeholder} />
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
    );
  }
}
