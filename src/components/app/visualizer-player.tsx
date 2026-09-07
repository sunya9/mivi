import { Maximize, Minimize } from "lucide-react";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { Canvas } from "@/components/app/canvas";
import { PlayIcon } from "@/components/app/play-icon";
import {
  FpsIndicator,
  MuteButton,
  PlaybackTime,
  PlayPauseButton,
  SeekSlider,
  VolumeSlider,
} from "@/components/app/player-controls";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/app-context";
import { usePanelVisibility } from "@/hooks/use-panel-visibility";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

// ARIA widget roles where Space has a native interaction (activate, toggle, type, etc.).
// "slider" is intentionally excluded so Space toggles playback even when a slider is focused.
const INTERACTIVE_ROLES = new Set([
  "button",
  "checkbox",
  "combobox",
  "link",
  "listbox",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "searchbox",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
  "treeitem",
]);

interface Props {
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function VisualizerPlayer({ expanded, onToggleExpanded }: Props) {
  const { audioPlaybackStore: store, visualizerEngine: engine } = useAppContext();
  // Only the playing flag drives this component; position updates every frame and is consumed
  // by the small controls below so the canvas host does not re-render per frame
  const isPlaying = useStore(store, (snapshot) => snapshot.status === "playing");
  const { togglePlay, toggleMute } = store;

  const {
    panelVisible,
    startInteraction,
    endInteraction,
    showPanel,
    handleMouseMove,
    handlePointerLeave,
    handleTouchReveal,
  } = usePanelVisibility({ isPlaying });
  const handleContainerClick = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const pointerType = e.pointerType;
      // Touch on mobile: reveal/hide UI without toggling play
      if (pointerType === "touch") {
        const consumed = handleTouchReveal();
        if (consumed) {
          return;
        }
      }
      // Mouse click: toggle play
      togglePlay();
    },
    [handleTouchReveal, togglePlay],
  );

  const handleContainerPointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Touch pointers "leave" right after every tap, which would undo handleTouchReveal
      if (e.pointerType === "touch") return;
      handlePointerLeave();
    },
    [handlePointerLeave],
  );

  // Space: Play/Pause (blocked on interactive widgets except sliders)
  useHotkeys(
    "space",
    (e) => {
      if (e.repeat) return;
      e.preventDefault();
      togglePlay();
    },
    {
      enableOnFormTags: ["input"],
      ignoreEventWhen: (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return true;
        // Native interactive elements (implicit roles are not reflected in target.role)
        if (target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement) return true;
        if (target instanceof HTMLInputElement && target.type !== "range") return true;
        // Custom widgets with explicit ARIA roles (e.g., base-ui div[role="button"])
        return INTERACTIVE_ROLES.has(target.role ?? "");
      },
    },
    [togglePlay],
  );

  // M: Mute/Unmute (disabled in form inputs)
  useHotkeys(
    "m",
    (e) => {
      if (e.repeat) return;
      e.preventDefault();
      toggleMute();
      showPanel();
    },
    [toggleMute, showPanel],
  );

  const isInteractiveWidgetFocused = useCallback((e: KeyboardEvent) => {
    const target = e.target;
    return (
      !(target instanceof HTMLElement) ||
      target.role === "separator" ||
      (target instanceof HTMLInputElement && target.type === "range")
    );
  }, []);

  const seekBy = useCallback(
    (offset: number) => {
      const { duration, position } = store.getSnapshot();
      store.seek(Math.max(0, Math.min(duration, position + offset)));
      showPanel();
    },
    [store, showPanel],
  );

  // Arrow left/right: Seek ±0.1s (skip when interactive widget is focused)
  useHotkeys(
    "left,right",
    (e) => seekBy(e.key === "ArrowLeft" ? -0.1 : 0.1),
    { ignoreEventWhen: isInteractiveWidgetFocused },
    [seekBy],
  );

  // J/L: Seek ±10s
  useHotkeys(
    "j,l",
    (e) => {
      if (e.repeat) return;
      seekBy(e.key === "j" || e.key === "J" ? -10 : 10);
    },
    [seekBy],
  );

  // Arrow up/down: Volume ±1% (skip when interactive widget is focused)
  useHotkeys(
    "up,down",
    (e) => {
      const delta = e.key === "ArrowUp" ? 0.01 : -0.01;
      const { volume } = store.getSnapshot();
      store.setVolume(Math.max(0, Math.min(1, volume + delta)));
      showPanel();
    },
    { ignoreEventWhen: isInteractiveWidgetFocused },
    [store, showPanel],
  );

  // Home/0: Jump to beginning
  useHotkeys(
    "home,0",
    () => {
      store.seek(0);
      showPanel();
    },
    { ignoreEventWhen: isInteractiveWidgetFocused },
    [store, showPanel],
  );

  // End: Jump to end
  useHotkeys(
    "end",
    () => {
      store.seek(store.getSnapshot().duration);
      showPanel();
    },
    { preventDefault: true, ignoreEventWhen: isInteractiveWidgetFocused },
    [store, showPanel],
  );

  return (
    <div
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      onPointerLeave={handleContainerPointerLeave}
      className="relative h-full w-full overflow-hidden [html:active-view-transition-type(canvas-expand)_&]:[view-transition-name:visualizer-container]"
    >
      <Canvas />
      <PlayIcon />
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 overflow-hidden [html:active-view-transition-type(canvas-expand)_&]:[view-transition-name:visualizer-controls]">
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex flex-col",
            "bg-linear-to-t from-black/50 to-black/0 transition-all duration-500",
            "hover:translate-y-0",
            "focus-within:pointer-events-auto focus-within:translate-y-0",
            {
              "pointer-events-auto translate-y-0": panelVisible,
              "translate-y-full": !panelVisible,
            },
            "light",
          )}
          role="group"
          aria-label="Midi Visualizer Controls"
        >
          <SeekSlider onInteractionStart={startInteraction} onInteractionEnd={endInteraction} />
          <div className="flex items-center gap-2 p-1">
            <PlayPauseButton />
            <MuteButton />
            <VolumeSlider onInteractionStart={startInteraction} onInteractionEnd={endInteraction} />
            <PlaybackTime />
            {isPlaying && <FpsIndicator counter={engine.fpsCounter} />}
            <Button
              variant="ghost-secondary"
              onClick={onToggleExpanded}
              className="hidden md:inline-flex"
              aria-haspopup="dialog"
              aria-expanded={expanded}
              size="icon-lg"
              aria-label={expanded ? "Minimize" : "Maximize"}
            >
              {expanded ? <Minimize /> : <Maximize />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
