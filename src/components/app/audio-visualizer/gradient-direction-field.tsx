import { gradientDirectionOptions } from "@/components/app/renderer-options";
import { SelectRow } from "@/components/common/select-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { LinearSpectrumConfig } from "@/lib/renderers/renderer-config";

import { ConfigFieldsProps } from "./types";

type GradientDirectionConfig = Pick<LinearSpectrumConfig, "gradientDirection">;

export function GradientDirectionField({
  config,
  onChange,
}: ConfigFieldsProps<GradientDirectionConfig>) {
  return (
    <SelectRow
      label={<span>Gradient Direction</span>}
      value={config.gradientDirection}
      onValueChange={(value) => {
        if (value == null) return;
        onChange({ gradientDirection: value });
      }}
      items={gradientDirectionOptions}
      placeholder="Select direction"
    >
      <SelectContent align="end">
        {gradientDirectionOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRow>
  );
}
