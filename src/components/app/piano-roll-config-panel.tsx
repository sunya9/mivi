import { useCallback } from "react";

import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RendererConfig, PianoRollConfig } from "@/lib/renderers/renderer-config";
import { DeepPartial } from "@/lib/type-utils";

import { NoteEffectsConfigFields } from "./note-effects-config-fields";

interface Props {
  pianoRollConfig: PianoRollConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  minNote?: number;
  maxNote?: number;
}
export function PianoRollConfigPanel({
  pianoRollConfig,
  onUpdateRendererConfig,
  minNote,
  maxNote,
}: Props) {
  const setPianoRollConfig = useCallback(
    (pianoRollConfig: DeepPartial<PianoRollConfig>) => onUpdateRendererConfig({ pianoRollConfig }),
    [onUpdateRendererConfig],
  );
  return (
    <>
      <SliderRow
        label={<span>Time Window: {pianoRollConfig.timeWindow}s</span>}
        value={[pianoRollConfig.timeWindow]}
        min={0.1}
        max={20}
        step={0.1}
        onValueChange={([value]) => setPianoRollConfig({ timeWindow: value })}
      />
      <SliderRow
        label={<span>Note Height: {pianoRollConfig.noteHeight}px</span>}
        value={[pianoRollConfig.noteHeight]}
        min={1}
        max={40}
        step={1}
        onValueChange={([value]) => setPianoRollConfig({ noteHeight: value })}
      />
      <SliderRow
        label={<span>Note Corner Radius: {pianoRollConfig.noteCornerRadius}px</span>}
        value={[pianoRollConfig.noteCornerRadius]}
        min={0}
        max={10}
        step={0.5}
        onValueChange={([value]) => setPianoRollConfig({ noteCornerRadius: value })}
      />
      <SliderRow
        label={<span>Note Margin: {pianoRollConfig.noteMargin}px</span>}
        value={[pianoRollConfig.noteMargin]}
        min={0}
        max={5}
        step={0.5}
        onValueChange={([value]) => setPianoRollConfig({ noteMargin: +value })}
      />
      <SliderRow
        label={<span>Note Vertical Margin: {pianoRollConfig.noteVerticalMargin}px</span>}
        value={[pianoRollConfig.noteVerticalMargin]}
        min={0}
        max={10}
        step={0.5}
        onValueChange={([value]) => setPianoRollConfig({ noteVerticalMargin: value })}
      />
      <SliderRow
        label={
          <span className="flex flex-wrap gap-x-2">
            <span>
              View Range: {pianoRollConfig.viewRangeBottom} - {pianoRollConfig.viewRangeTop}
            </span>
            {minNote !== undefined && maxNote !== undefined && (
              <span className="text-muted-foreground">
                (Detected range: {minNote} - {maxNote})
              </span>
            )}
          </span>
        }
        value={[pianoRollConfig.viewRangeBottom, pianoRollConfig.viewRangeTop]}
        min={0}
        max={127}
        step={1}
        defaultValue={[
          Math.min(0, minNote ? minNote - 10 : 0),
          Math.max(127, maxNote ? maxNote + 10 : 127),
        ]}
        onValueChange={([bottom, top]) =>
          setPianoRollConfig({
            viewRangeBottom: bottom,
            viewRangeTop: top,
          })
        }
      />
      <Separator />
      <SliderRow
        label={<span>Playhead Position: {pianoRollConfig.playheadPosition}%</span>}
        value={[pianoRollConfig.playheadPosition]}
        min={0}
        max={75}
        step={1}
        onValueChange={([value]) => setPianoRollConfig({ playheadPosition: value })}
      />
      <FormRow
        label={<span>Playhead Border</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={pianoRollConfig.showPlayhead}
            onCheckedChange={(checked) => setPianoRollConfig({ showPlayhead: checked })}
          />
        )}
      />
      {pianoRollConfig.showPlayhead && (
        <>
          <FormRow
            label={<span>Playhead Border Color</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                value={pianoRollConfig.playheadColor}
                onChange={(value) => setPianoRollConfig({ playheadColor: value })}
              />
            )}
          />
          <SliderRow
            label={<span>Playhead Border Width: {pianoRollConfig.playheadWidth}px</span>}
            value={[pianoRollConfig.playheadWidth]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => setPianoRollConfig({ playheadWidth: value })}
          />
          <SliderRow
            label={
              <span>
                Playhead Border Opacity: {Math.round(pianoRollConfig.playheadOpacity * 100)}%
              </span>
            }
            value={[pianoRollConfig.playheadOpacity]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([value]) => setPianoRollConfig({ playheadOpacity: value })}
          />
        </>
      )}
      <Separator />
      <NoteEffectsConfigFields
        config={pianoRollConfig}
        onChange={setPianoRollConfig}
        afterRipple={
          <>
            <FormRow
              label={<span>Note Press Effect</span>}
              controller={({ id }) => (
                <Switch
                  id={id}
                  checked={pianoRollConfig.showNotePressEffect}
                  onCheckedChange={(checked) => {
                    setPianoRollConfig({ showNotePressEffect: checked });
                  }}
                />
              )}
            />
            {pianoRollConfig.showNotePressEffect && (
              <>
                <SliderRow
                  label={<span>Press Depth: {pianoRollConfig.notePressDepth}px</span>}
                  value={[pianoRollConfig.notePressDepth]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) => {
                    setPianoRollConfig({ notePressDepth: value });
                  }}
                />
                <SliderRow
                  label={
                    <span>
                      Press Animation Duration: {pianoRollConfig.pressAnimationDuration}sec
                    </span>
                  }
                  value={[pianoRollConfig.pressAnimationDuration]}
                  min={0.05}
                  max={1}
                  step={0.05}
                  onValueChange={([value]) => {
                    setPianoRollConfig({ pressAnimationDuration: value });
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
