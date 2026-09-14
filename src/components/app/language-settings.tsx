import { Field } from "@base-ui/react/field";

import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLocale } from "@/lib/locale/use-locale";
import { useMessages } from "@/lib/locale/use-messages";

export function LanguageSettings() {
  const m = useMessages();
  const { preference, setPreference } = useLocale();
  const options = [
    { value: "system", label: m.settings_language_system() },
    { value: "en", label: "English" },
    { value: "ja", label: "日本語" },
  ] as const;

  return (
    <Field.Root render={<Item />}>
      <ItemContent>
        <Field.Label nativeLabel={false} render={<ItemTitle />}>
          {m.settings_language_label()}
        </Field.Label>
        <Field.Description render={<ItemDescription />}>
          {m.settings_language_description()}
        </Field.Description>
      </ItemContent>
      <ItemActions>
        <Select
          value={preference}
          onValueChange={(value) => value && setPreference(value)}
          items={options}
        >
          <SelectTrigger>
            <SelectValue placeholder={m.settings_language_label()} />
          </SelectTrigger>
          <SelectContent align="end">
            {options.map((option) => (
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
