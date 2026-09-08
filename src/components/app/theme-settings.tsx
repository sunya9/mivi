import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { type Theme } from "@/lib/theme/theme-store";
import { useTheme } from "@/lib/theme/use-theme";

const themes: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Item>
      <ItemContent>
        <ItemTitle>Theme</ItemTitle>
        <ItemDescription>Select the color theme for the application.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Select value={theme} onValueChange={(value) => value && setTheme(value)} items={themes}>
          <SelectTrigger>
            <SelectValue placeholder="Select theme" />
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
    </Item>
  );
}
