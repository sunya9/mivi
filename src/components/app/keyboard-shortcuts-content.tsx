import { Kbd } from "@/components/ui/kbd";
import { useMessages } from "@/lib/locale/use-messages";

export function KeyboardShortcutsContent() {
  const m = useMessages();
  const shortcutGroups = [
    {
      label: m.shortcuts_group_playback(),
      shortcuts: [
        { key: "Space", description: m.shortcut_play_pause() },
        { key: "M", description: m.shortcut_mute_unmute() },
      ],
    },
    {
      label: m.shortcuts_group_seeking(),
      shortcuts: [
        { key: "←", description: m.shortcut_seek_backward_short() },
        { key: "→", description: m.shortcut_seek_forward_short() },
        { key: "J", description: m.shortcut_seek_backward_long() },
        { key: "L", description: m.shortcut_seek_forward_long() },
        { key: "Home / 0", description: m.shortcut_jump_to_beginning() },
        { key: "End", description: m.shortcut_jump_to_end() },
      ],
    },
    {
      label: m.shortcuts_group_volume(),
      shortcuts: [
        { key: "↑", description: m.shortcut_volume_up() },
        { key: "↓", description: m.shortcut_volume_down() },
      ],
    },
    {
      label: m.shortcuts_group_view(),
      shortcuts: [
        { key: "F", description: m.shortcut_toggle_expand() },
        { key: "Esc", description: m.shortcut_exit_expanded() },
        { key: "?", description: m.shortcut_show_shortcuts() },
      ],
    },
  ];
  return (
    <div className="space-y-4">
      <h2 className="hidden text-lg font-semibold md:block">{m.shortcuts_heading()}</h2>
      {shortcutGroups.map((group) => (
        <div key={group.label} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">{group.label}</h3>
          {group.shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between">
              <span className="text-sm">{shortcut.description}</span>
              <Kbd>{shortcut.key}</Kbd>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
