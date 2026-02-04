import { Kbd } from "../ui/kbd";

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

export function KeyboardShortcutsContent() {
  return (
    <div className="space-y-4">
      <h2 className="hidden text-lg font-semibold md:block">
        Keyboard Shortcuts
      </h2>
      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.key} className="flex items-center justify-between">
            <span className="text-sm">{shortcut.description}</span>
            <Kbd>{shortcut.key}</Kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
