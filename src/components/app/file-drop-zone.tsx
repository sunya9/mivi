import { useDnd } from "@/hooks/use-dnd";

export function FileDropZone({ children }: { children: React.ReactNode }) {
  const { dropZoneProps, DragDropOverlay } = useDnd();
  return (
    <div className="contents" {...dropZoneProps}>
      {children}
      {DragDropOverlay}
    </div>
  );
}
