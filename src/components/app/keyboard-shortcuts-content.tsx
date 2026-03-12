import { Kbd } from "../ui/kbd";

interface ShortcutItem {
  key: string;
  description: string;
}

interface ShortcutGroup {
  label: string;
  shortcuts: ShortcutItem[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    label: "Playback",
    shortcuts: [
      { key: "Space", description: "Play / Pause" },
      { key: "M", description: "Mute / Unmute" },
    ],
  },
  {
    label: "Seeking",
    shortcuts: [
      { key: "←", description: "Seek backward 5s" },
      { key: "→", description: "Seek forward 5s" },
      { key: "J", description: "Seek backward 10s" },
      { key: "L", description: "Seek forward 10s" },
      { key: "Home / 0", description: "Jump to beginning" },
      { key: "End", description: "Jump to end" },
    ],
  },
  {
    label: "Volume",
    shortcuts: [
      { key: "↑", description: "Volume up" },
      { key: "↓", description: "Volume down" },
    ],
  },
  {
    label: "View",
    shortcuts: [
      { key: "F", description: "Toggle expand / collapse" },
      { key: "Esc", description: "Exit expanded view" },
      { key: "?", description: "Show shortcuts" },
    ],
  },
];

export function KeyboardShortcutsContent() {
  return (
    <div className="space-y-4">
      <h2 className="hidden text-lg font-semibold md:block">
        Keyboard Shortcuts
      </h2>
      {shortcutGroups.map((group) => (
        <div key={group.label} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {group.label}
          </h3>
          {group.shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{shortcut.description}</span>
              <Kbd>{shortcut.key}</Kbd>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
