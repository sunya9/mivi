import { ReactNode } from "react";

import { getNoteFlashModeOptions } from "@/components/app/renderer-options";
import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SelectRow } from "@/components/common/select-row";
import { SliderRow } from "@/components/common/slider-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMessages } from "@/lib/locale/use-messages";
import { NoteEffectsConfig } from "@/lib/renderers/renderer-config";

interface Props {
  config: NoteEffectsConfig;
  onChange: (partial: Partial<NoteEffectsConfig>) => void;
  afterRipple?: ReactNode;
}

export function NoteEffectsConfigFields({ config, onChange, afterRipple }: Props) {
  const m = useMessages();
  const noteFlashModeOptions = getNoteFlashModeOptions();
  return (
    <>
      <FormRow
        label={<span>{m.ripple_effect()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showRippleEffect}
            onCheckedChange={(checked) => onChange({ showRippleEffect: checked })}
          />
        )}
      />
      {config.showRippleEffect && (
        <>
          <FormRow
            label={<span>{m.ripple_use_custom_color()}</span>}
            controller={({ id }) => (
              <Switch
                id={id}
                checked={config.useCustomRippleColor}
                onCheckedChange={(checked) => onChange({ useCustomRippleColor: checked })}
              />
            )}
          />
          {config.useCustomRippleColor && (
            <FormRow
              label={<span>{m.ripple_color()}</span>}
              controller={({ id }) => (
                <ColorPickerInput
                  id={id}
                  value={config.rippleColor}
                  onChange={(value) => onChange({ rippleColor: value })}
                />
              )}
            />
          )}
          <SliderRow
            label={<span>{m.ripple_duration({ value: config.rippleDuration })}</span>}
            value={[config.rippleDuration]}
            min={0.1}
            max={2}
            step={0.1}
            onValueChange={([value]) => onChange({ rippleDuration: value })}
          />
          <SliderRow
            label={<span>{m.ripple_radius({ value: config.rippleRadius })}</span>}
            value={[config.rippleRadius]}
            min={10}
            max={100}
            step={1}
            onValueChange={([value]) => onChange({ rippleRadius: value })}
          />
        </>
      )}
      {afterRipple && (
        <>
          <Separator />
          {afterRipple}
        </>
      )}
      <Separator />
      <FormRow
        label={<span>{m.note_flash_effect()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showNoteFlash}
            onCheckedChange={(checked) => onChange({ showNoteFlash: checked })}
          />
        )}
      />
      {config.showNoteFlash && (
        <>
          <SliderRow
            label={<span>{m.note_flash_intensity({ value: config.noteFlashIntensity })}</span>}
            value={[config.noteFlashIntensity]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]) => onChange({ noteFlashIntensity: value })}
          />
          <SliderRow
            label={
              <span>
                {m.note_flash_fade_out_duration({ value: config.noteFlashFadeOutDuration })}
              </span>
            }
            value={[config.noteFlashFadeOutDuration]}
            min={0.1}
            max={1}
            step={0.1}
            onValueChange={([value]) => onChange({ noteFlashFadeOutDuration: value })}
          />
          <SelectRow
            label={<span>{m.note_flash_mode()}</span>}
            value={config.noteFlashMode}
            onValueChange={(value) => {
              if (!value) return;
              onChange({ noteFlashMode: value });
            }}
            items={noteFlashModeOptions}
            placeholder={m.note_flash_mode_placeholder()}
          >
            <SelectContent align="end">
              {noteFlashModeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRow>
          {config.noteFlashMode === "duration" && (
            <SliderRow
              label={<span>{m.note_flash_duration({ value: config.noteFlashDuration })}</span>}
              value={[config.noteFlashDuration]}
              min={0.1}
              max={2}
              step={0.1}
              onValueChange={([value]) => onChange({ noteFlashDuration: value })}
            />
          )}
        </>
      )}
      <Separator />
      <FormRow
        label={<span>{m.rough_edge()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showRoughEdge}
            onCheckedChange={(checked) => onChange({ showRoughEdge: checked })}
          />
        )}
      />
      {config.showRoughEdge && (
        <>
          <SliderRow
            label={<span>{m.rough_edge_intensity({ value: config.roughEdgeIntensity })}</span>}
            value={[config.roughEdgeIntensity]}
            min={0.1}
            max={5}
            step={0.1}
            onValueChange={([value]) => onChange({ roughEdgeIntensity: value })}
          />
          <SliderRow
            label={<span>{m.rough_edge_segment({ value: config.roughEdgeSegmentLength })}</span>}
            value={[config.roughEdgeSegmentLength]}
            min={2}
            max={16}
            step={1}
            onValueChange={([value]) => onChange({ roughEdgeSegmentLength: value })}
          />
        </>
      )}
      <Separator />
      <FormRow
        label={<span>{m.noise_texture()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showNoiseTexture}
            onCheckedChange={(checked) => onChange({ showNoiseTexture: checked })}
          />
        )}
      />
      {config.showNoiseTexture && (
        <>
          <SliderRow
            label={
              <span>{m.noise_intensity({ value: Math.round(config.noiseIntensity * 100) })}</span>
            }
            value={[config.noiseIntensity]}
            min={0.01}
            max={0.5}
            step={0.01}
            onValueChange={([value]) => onChange({ noiseIntensity: value })}
          />
          <SliderRow
            label={<span>{m.noise_grain_size({ value: config.noiseGrainSize })}</span>}
            value={[config.noiseGrainSize]}
            min={1}
            max={16}
            step={1}
            onValueChange={([value]) => onChange({ noiseGrainSize: value })}
          />
          <SliderRow
            label={<span>{m.noise_color_variance({ value: config.noiseColorVariance })}</span>}
            value={[config.noiseColorVariance]}
            min={1}
            max={100}
            step={1}
            onValueChange={([value]) => onChange({ noiseColorVariance: value })}
          />
        </>
      )}
    </>
  );
}
