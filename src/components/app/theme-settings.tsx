import { Field } from "@base-ui/react/field";

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
    <div className="space-y-4">
      <h2 className="hidden text-lg font-semibold md:block">General</h2>
      <Field.Root render={<Item />}>
        <ItemContent>
          <Field.Label nativeLabel={false} render={<ItemTitle />}>
            Theme
          </Field.Label>
          <Field.Description render={<ItemDescription />}>
            Select the color theme for the application.
          </Field.Description>
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
      </Field.Root>
    </div>
  );
}
