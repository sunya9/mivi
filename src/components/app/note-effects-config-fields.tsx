import { ReactNode } from "react";

import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
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
          <FormRow
            label={<span>Ripple Duration: {config.rippleDuration}sec</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[config.rippleDuration]}
                className="w-full max-w-48 min-w-24"
                min={0.1}
                max={2}
                step={0.1}
                onValueChange={([value]) => onChange({ rippleDuration: value })}
              />
            )}
          />
          <FormRow
            label={<span>Ripple Radius: {config.rippleRadius}px</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[config.rippleRadius]}
                className="w-full max-w-48 min-w-24"
                min={10}
                max={100}
                step={1}
                onValueChange={([value]) => onChange({ rippleRadius: value })}
              />
            )}
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
          <FormRow
            label={<span>Flash Intensity: {config.noteFlashIntensity}</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[config.noteFlashIntensity]}
                className="w-full max-w-48 min-w-24"
                min={0}
                max={1}
                step={0.1}
                onValueChange={([value]) => onChange({ noteFlashIntensity: value })}
              />
            )}
          />
          <FormRow
            label={<span>Fade Out Duration: {config.noteFlashFadeOutDuration}sec</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[config.noteFlashFadeOutDuration]}
                className="w-full max-w-48 min-w-24"
                min={0.1}
                max={1}
                step={0.1}
                onValueChange={([value]) => onChange({ noteFlashFadeOutDuration: value })}
              />
            )}
          />
          <FormRow
            label={<span>Flash Mode</span>}
            controller={({ id, labelId }) => (
              <Select
                value={config.noteFlashMode}
                onValueChange={(value) => {
                  if (!value) return;
                  onChange({ noteFlashMode: value });
                }}
                items={noteFlashModeOptions}
              >
                <SelectTrigger id={id} aria-labelledby={labelId}>
                  <SelectValue placeholder="Select flash mode" />
                </SelectTrigger>
                <SelectContent align="end">
                  {noteFlashModeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {config.noteFlashMode === "duration" && (
            <FormRow
              label={<span>Flash Duration: {config.noteFlashDuration}sec</span>}
              customControl
              controller={({ id, labelId, ref }) => (
                <Slider
                  ref={ref}
                  id={id}
                  aria-labelledby={labelId}
                  value={[config.noteFlashDuration]}
                  className="w-full max-w-48 min-w-24"
                  min={0.1}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) => onChange({ noteFlashDuration: value })}
                />
              )}
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
          <FormRow
            label={<span>Rough Edge Intensity: {config.roughEdgeIntensity}px</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[config.roughEdgeIntensity]}
                className="w-full max-w-48 min-w-24"
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={([value]) => onChange({ roughEdgeIntensity: value })}
              />
            )}
          />
          <FormRow
            label={<span>Rough Edge Segment: {config.roughEdgeSegmentLength}px</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[config.roughEdgeSegmentLength]}
                className="w-full max-w-48 min-w-24"
                min={2}
                max={16}
                step={1}
                onValueChange={([value]) => onChange({ roughEdgeSegmentLength: value })}
              />
            )}
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
          <FormRow
            label={<span>Noise Intensity: {Math.round(config.noiseIntensity * 100)}%</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[config.noiseIntensity]}
                className="w-full max-w-48 min-w-24"
                min={0.01}
                max={0.5}
                step={0.01}
                onValueChange={([value]) => onChange({ noiseIntensity: value })}
              />
            )}
          />
          <FormRow
            label={<span>Noise Grain Size: {config.noiseGrainSize}px</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[config.noiseGrainSize]}
                className="w-full max-w-48 min-w-24"
                min={1}
                max={16}
                step={1}
                onValueChange={([value]) => onChange({ noiseGrainSize: value })}
              />
            )}
          />
          <FormRow
            label={<span>Noise Color Variance: {config.noiseColorVariance}</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[config.noiseColorVariance]}
                className="w-full max-w-48 min-w-24"
                min={1}
                max={100}
                step={1}
                onValueChange={([value]) => onChange({ noiseColorVariance: value })}
              />
            )}
          />
        </>
      )}
    </>
  );
}
