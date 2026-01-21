import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn, errorLogWithToast } from "@/lib/utils";
import { useState, useCallback, useMemo } from "react";

interface Props {
  onDropMidi(file: File): Promise<void>;
  onDropAudio(file: File): Promise<void>;
  onDropImage(file: File): Promise<void>;
}

export function useDnd({ onDropMidi, onDropAudio, onDropImage }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        const fileType = file.type;

        try {
          if (fileType === "audio/midi" || fileType === "audio/x-midi") {
            await onDropMidi(file);
          } else if (fileType.startsWith("audio/")) {
            await onDropAudio(file);
          } else if (fileType.startsWith("image/")) {
            await onDropImage(file);
          } else {
            errorLogWithToast(`Unsupported file type: ${fileType}`);
          }
        } catch (error) {
          errorLogWithToast("Error processing dropped file:", error);
        }
      }
    },
    [onDropMidi, onDropAudio, onDropImage],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const DragDropOverlay = useMemo(
    () =>
      isDragging && (
        <div
          className={cn(
            "bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm",
          )}
        >
          <Card>
            <CardHeader>
              <CardTitle>Drop Files Here</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Supported file formats:</p>
              <ul className="mt-2 list-disc pl-4">
                <li>MIDI files (.mid, .midi)</li>
                <li>Audio files (.mp3, .wav, etc.)</li>
                <li>Image files (.png, .jpg, etc.)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ),
    [isDragging],
  );

  return {
    handleDrop,
    handleDragOver,
    handleDragLeave,
    DragDropOverlay,
  } as const;
}
