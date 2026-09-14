import { Field } from "@base-ui/react/field";

import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useMessages } from "@/lib/locale/use-messages";
import { type Theme } from "@/lib/theme/theme-store";
import { useTheme } from "@/lib/theme/use-theme";

export function ThemeSettings() {
  const m = useMessages();
  const { theme, setTheme } = useTheme();
  const themes: { value: Theme; label: string }[] = [
    { value: "light", label: m.theme_light() },
    { value: "dark", label: m.theme_dark() },
    { value: "system", label: m.theme_system() },
  ];

  return (
    <Field.Root render={<Item />}>
      <ItemContent>
        <Field.Label nativeLabel={false} render={<ItemTitle />}>
          {m.settings_theme_label()}
        </Field.Label>
        <Field.Description render={<ItemDescription />}>
          {m.settings_theme_description()}
        </Field.Description>
      </ItemContent>
      <ItemActions>
        <Select value={theme} onValueChange={(value) => value && setTheme(value)} items={themes}>
          <SelectTrigger>
            <SelectValue placeholder={m.settings_theme_placeholder()} />
          </SelectTrigger>
          <SelectContent align="end">
            {themes.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ItemActions>
    </Field.Root>
  );
}
