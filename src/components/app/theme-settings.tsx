import { Theme, useTheme } from "@/contexts/theme-context";
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const themes: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <h2 className="hidden text-lg font-semibold md:block">General</h2>
      <Item>
        <ItemContent>
          <ItemTitle>Theme</ItemTitle>
          <ItemDescription>Select the color theme for the application.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Select
            value={theme}
            onValueChange={(value: Theme | null) => value && setTheme(value)}
            items={themes}
          >
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
    </div>
  );
}
