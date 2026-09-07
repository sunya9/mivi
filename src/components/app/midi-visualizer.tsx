import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { VisualizerPlayer } from "@/components/app/visualizer-player";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogPortal } from "@/components/ui/dialog";
import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";
import { startViewTransition } from "@/lib/utils";

const PLAYER_LABEL = "Midi Visualizer Player";

interface Props {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function MidiVisualizer({ containerRef }: Props) {
  const { rendererConfigStore } = useAppContext();
  const { width, height } = useStore(rendererConfigStore, (config) => config.resolution);
  const regionRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const setExpandedAnimation = useCallback((expanded: React.SetStateAction<boolean>) => {
    startViewTransition(() => setExpanded(expanded), { types: ["canvas-expand"] });
  }, []);
  const toggleExpanded = useCallback(() => {
    setExpandedAnimation((prev) => !prev);
  }, [setExpandedAnimation]);

  const setRegionRef = useCallback(
    (element: HTMLDivElement | null) => {
      regionRef.current = element;
      if (containerRef) containerRef.current = element;
    },
    [containerRef],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setExpandedAnimation(false);
    },
    [setExpandedAnimation],
  );

  const closeExpanded = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.currentTarget === e.target) {
        setExpandedAnimation(false);
      }
    },
    [setExpandedAnimation],
  );

  // Base UI's finalFocus would land on the first tabbable child of the region (the seek slider),
  // which steals the arrow keys from the document-level hotkeys; focus the region itself instead
  const prevExpandedRef = useRef(expanded);
  useEffect(() => {
    if (prevExpandedRef.current && !expanded) regionRef.current?.focus();
    prevExpandedRef.current = expanded;
  }, [expanded]);

  // F: Toggle expand/collapse canvas
  useHotkeys(
    "f",
    (e) => {
      if (e.repeat) return;
      e.preventDefault();
      setExpandedAnimation((prev) => !prev);
    },
    [setExpandedAnimation],
  );

  const player = <VisualizerPlayer expanded={expanded} onToggleExpanded={toggleExpanded} />;

  return (
    <div className="relative h-full w-full bg-gray-50 bg-[linear-gradient(45deg,var(--canvas)_25%,transparent_25%,transparent_75%,var(--canvas)_75%,var(--canvas)),linear-gradient(45deg,var(--canvas)_25%,transparent_25%,transparent_75%,var(--canvas)_75%,var(--canvas))] bg-size-[16px_16px] bg-position-[0_0,8px_8px] dark:bg-gray-600">
      <div
        ref={setRegionRef}
        tabIndex={-1}
        className="flex h-full w-full items-center justify-center outline-none"
        aria-label={PLAYER_LABEL}
        role="region"
      >
        {!expanded && player}
      </div>
      {expanded && (
        <Dialog open onOpenChange={handleOpenChange}>
          <DialogPortal>
            <DialogPrimitive.Backdrop className="fixed inset-0 z-30 bg-background/50 backdrop-blur-sm" />
            <DialogPrimitive.Popup
              ref={popupRef}
              initialFocus={popupRef}
              finalFocus={false}
              onClick={closeExpanded}
              aria-label={PLAYER_LABEL}
              aria-modal
              className="fixed inset-0 z-30 flex items-center justify-center outline-none"
            >
              <DialogClose
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 z-50 size-12 rounded-full p-2 sm:top-10 sm:right-10 sm:size-16"
                    aria-label="Close"
                  />
                }
              >
                <X strokeWidth={1} className="size-full" />
              </DialogClose>
              <div
                style={{
                  width: `min(${width}px, 100dvw - 5rem, (100dvh - 5rem) * ${width / height})`,
                  aspectRatio: `${width} / ${height}`,
                }}
              >
                {player}
              </div>
            </DialogPrimitive.Popup>
          </DialogPortal>
        </Dialog>
      )}
    </div>
  );
}
