import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Kbd } from "../ui/kbd";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface ShortcutItem {
  key: string;
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { key: "Space", description: "Play / Pause" },
  { key: "Esc", description: "Exit expanded view" },
  { key: "M", description: "Mute / Unmute" },
  { key: "?", description: "Show shortcuts" },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);
  useHotkeys("shift+slash", () => setOpen(true));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Available keyboard shortcuts for controlling the visualizer
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{shortcut.description}</span>
              <Kbd>{shortcut.key}</Kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
