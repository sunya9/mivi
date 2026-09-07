import { ReactNode } from "react";

import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SelectRow } from "@/components/common/select-row";
import { SliderRow } from "@/components/common/slider-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { NoteEffectsConfigValues, noteFlashModeOptions } from "@/lib/renderers/renderer";

interface Props {
  config: NoteEffectsConfigValues;
  onChange: (partial: Partial<NoteEffectsConfigValues>) => void;
  afterRipple?: ReactNode;
}

export function NoteEffectsConfigFields({ config, onChange, afterRipple }: Props) {
  return (
    <>
      <FormRow
        label={<span>Ripple Effect</span>}
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
            label={<span>Use Custom Ripple Color</span>}
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
              label={<span>Ripple Color</span>}
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
            label={<span>Ripple Duration: {config.rippleDuration}sec</span>}
            value={[config.rippleDuration]}
            min={0.1}
            max={2}
            step={0.1}
            onValueChange={([value]) => onChange({ rippleDuration: value })}
          />
          <SliderRow
            label={<span>Ripple Radius: {config.rippleRadius}px</span>}
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
        label={<span>Note Flash Effect</span>}
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
            label={<span>Flash Intensity: {config.noteFlashIntensity}</span>}
            value={[config.noteFlashIntensity]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]) => onChange({ noteFlashIntensity: value })}
          />
          <SliderRow
            label={<span>Fade Out Duration: {config.noteFlashFadeOutDuration}sec</span>}
            value={[config.noteFlashFadeOutDuration]}
            min={0.1}
            max={1}
            step={0.1}
            onValueChange={([value]) => onChange({ noteFlashFadeOutDuration: value })}
          />
          <SelectRow
            label={<span>Flash Mode</span>}
            value={config.noteFlashMode}
            onValueChange={(value) => {
              if (!value) return;
              onChange({ noteFlashMode: value });
            }}
            items={noteFlashModeOptions}
            placeholder="Select flash mode"
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
              label={<span>Flash Duration: {config.noteFlashDuration}sec</span>}
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
        label={<span>Rough Edge</span>}
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
            label={<span>Rough Edge Intensity: {config.roughEdgeIntensity}px</span>}
            value={[config.roughEdgeIntensity]}
            min={0.1}
            max={5}
            step={0.1}
            onValueChange={([value]) => onChange({ roughEdgeIntensity: value })}
          />
          <SliderRow
            label={<span>Rough Edge Segment: {config.roughEdgeSegmentLength}px</span>}
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
        label={<span>Noise Texture</span>}
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
            label={<span>Noise Intensity: {Math.round(config.noiseIntensity * 100)}%</span>}
            value={[config.noiseIntensity]}
            min={0.01}
            max={0.5}
            step={0.01}
            onValueChange={([value]) => onChange({ noiseIntensity: value })}
          />
          <SliderRow
            label={<span>Noise Grain Size: {config.noiseGrainSize}px</span>}
            value={[config.noiseGrainSize]}
            min={1}
            max={16}
            step={1}
            onValueChange={([value]) => onChange({ noiseGrainSize: value })}
          />
          <SliderRow
            label={<span>Noise Color Variance: {config.noiseColorVariance}</span>}
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
