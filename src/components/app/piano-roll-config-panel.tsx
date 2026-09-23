import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PianoRollConfig } from "@/lib/renderers/renderer-config";

import { NoteEffectsConfigFields } from "./note-effects-config-fields";

interface Props {
  config: PianoRollConfig;
  onChange: (partial: Partial<PianoRollConfig>) => void;
  minNote?: number;
  maxNote?: number;
}
export function PianoRollConfigPanel({ config, onChange, minNote, maxNote }: Props) {
  return (
    <>
      <SliderRow
        label={<span>Time Window: {config.timeWindow}s</span>}
        value={[config.timeWindow]}
        min={0.1}
        max={20}
        step={0.1}
        onValueChange={([value]) => onChange({ timeWindow: value })}
      />
      <SliderRow
        label={<span>Note Height: {config.noteHeight}px</span>}
        value={[config.noteHeight]}
        min={1}
        max={40}
        step={1}
        onValueChange={([value]) => onChange({ noteHeight: value })}
      />
      <SliderRow
        label={<span>Note Corner Radius: {config.noteCornerRadius}px</span>}
        value={[config.noteCornerRadius]}
        min={0}
        max={10}
        step={0.5}
        onValueChange={([value]) => onChange({ noteCornerRadius: value })}
      />
      <SliderRow
        label={<span>Note Margin: {config.noteMargin}px</span>}
        value={[config.noteMargin]}
        min={0}
        max={5}
        step={0.5}
        onValueChange={([value]) => onChange({ noteMargin: +value })}
      />
      <SliderRow
        label={<span>Note Vertical Margin: {config.noteVerticalMargin}px</span>}
        value={[config.noteVerticalMargin]}
        min={0}
        max={10}
        step={0.5}
        onValueChange={([value]) => onChange({ noteVerticalMargin: value })}
      />
      <SliderRow
        label={
          <span className="flex flex-wrap gap-x-2">
            <span>
              View Range: {config.viewRangeBottom} - {config.viewRangeTop}
            </span>
            {minNote !== undefined && maxNote !== undefined && (
              <span className="text-muted-foreground">
                (Detected range: {minNote} - {maxNote})
              </span>
            )}
          </span>
        }
        value={[config.viewRangeBottom, config.viewRangeTop]}
        min={0}
        max={127}
        step={1}
        defaultValue={[
          Math.min(0, minNote ? minNote - 10 : 0),
          Math.max(127, maxNote ? maxNote + 10 : 127),
        ]}
        onValueChange={([bottom, top]) =>
          onChange({
            viewRangeBottom: bottom,
            viewRangeTop: top,
          })
        }
      />
      <Separator />
      <SliderRow
        label={<span>Playhead Position: {config.playheadPosition}%</span>}
        value={[config.playheadPosition]}
        min={0}
        max={75}
        step={1}
        onValueChange={([value]) => onChange({ playheadPosition: value })}
      />
      <FormRow
        label={<span>Playhead Border</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showPlayhead}
            onCheckedChange={(checked) => onChange({ showPlayhead: checked })}
          />
        )}
      />
      {config.showPlayhead && (
        <>
          <FormRow
            label={<span>Playhead Border Color</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                value={config.playheadColor}
                onChange={(value) => onChange({ playheadColor: value })}
              />
            )}
          />
          <SliderRow
            label={<span>Playhead Border Width: {config.playheadWidth}px</span>}
            value={[config.playheadWidth]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => onChange({ playheadWidth: value })}
          />
          <SliderRow
            label={
              <span>Playhead Border Opacity: {Math.round(config.playheadOpacity * 100)}%</span>
            }
            value={[config.playheadOpacity]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([value]) => onChange({ playheadOpacity: value })}
          />
        </>
      )}
      <Separator />
      <NoteEffectsConfigFields
        config={config}
        onChange={onChange}
        afterRipple={
          <>
            <FormRow
              label={<span>Note Press Effect</span>}
              controller={({ id }) => (
                <Switch
                  id={id}
                  checked={config.showNotePressEffect}
                  onCheckedChange={(checked) => {
                    onChange({ showNotePressEffect: checked });
                  }}
                />
              )}
            />
            {config.showNotePressEffect && (
              <>
                <SliderRow
                  label={<span>Press Depth: {config.notePressDepth}px</span>}
                  value={[config.notePressDepth]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) => {
                    onChange({ notePressDepth: value });
                  }}
                />
                <SliderRow
                  label={<span>Press Animation Duration: {config.pressAnimationDuration}sec</span>}
                  value={[config.pressAnimationDuration]}
                  min={0.05}
                  max={1}
                  step={0.05}
                  onValueChange={([value]) => {
                    onChange({ pressAnimationDuration: value });
                  }}
                />
              </>
            )}
          </>
        }
      />
    </>
  );
}
