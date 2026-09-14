import { cn } from "cn";
import { useState, useCallback, useMemo, type DragEvent } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSetAudioFile } from "@/lib/audio/use-audio";
import { useSetBackgroundImageFile } from "@/lib/background-image/use-background-image";
import { errorLogWithToast } from "@/lib/error-toast";
import { useMessages } from "@/lib/locale/use-messages";
import { useSetMidiFile } from "@/lib/midi/use-midi";

export function useDnd() {
  const m = useMessages();
  const setMidiFile = useSetMidiFile();
  const setAudioFile = useSetAudioFile();
  const setBackgroundImageFile = useSetBackgroundImageFile();
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      await Promise.all(
        files.map(async (file) => {
          const fileType = file.type;
          try {
            if (fileType === "audio/midi" || fileType === "audio/x-midi") {
              await setMidiFile(file);
            } else if (fileType.startsWith("audio/")) {
              await setAudioFile(file);
            } else if (fileType.startsWith("image/")) {
              await setBackgroundImageFile(file);
            } else {
              errorLogWithToast(m.dnd_unsupported_file_type({ type: fileType }));
            }
          } catch (error) {
            errorLogWithToast(m.dnd_error_processing(), error);
          }
        }),
      );
    },
    [m, setMidiFile, setAudioFile, setBackgroundImageFile],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const DragDropOverlay = useMemo(
    () =>
      isDragging && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
          )}
        >
          <Card>
            <CardHeader>
              <CardTitle>{m.dnd_drop_title()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{m.dnd_supported_formats()}</p>
              <ul className="mt-2 list-disc pl-4">
                <li>{m.dnd_midi_files()}</li>
                <li>{m.dnd_audio_files()}</li>
                <li>{m.dnd_image_files()}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ),
    [isDragging, m],
  );

  return { dropZoneProps: { onDrop, onDragOver, onDragLeave }, DragDropOverlay } as const;
}
