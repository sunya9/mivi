import { useCallback } from "react";

import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMessages } from "@/lib/locale/use-messages";
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
  const m = useMessages();
  const setPianoRollConfig = useCallback(
    (pianoRollConfig: DeepPartial<PianoRollConfig>) => onUpdateRendererConfig({ pianoRollConfig }),
    [onUpdateRendererConfig],
  );
  return (
    <>
      <SliderRow
        label={<span>{m.time_window({ value: pianoRollConfig.timeWindow })}</span>}
        value={[pianoRollConfig.timeWindow]}
        min={0.1}
        max={20}
        step={0.1}
        onValueChange={([value]) => setPianoRollConfig({ timeWindow: value })}
      />
      <SliderRow
        label={<span>{m.note_height({ value: pianoRollConfig.noteHeight })}</span>}
        value={[pianoRollConfig.noteHeight]}
        min={1}
        max={40}
        step={1}
        onValueChange={([value]) => setPianoRollConfig({ noteHeight: value })}
      />
      <SliderRow
        label={<span>{m.note_corner_radius({ value: pianoRollConfig.noteCornerRadius })}</span>}
        value={[pianoRollConfig.noteCornerRadius]}
        min={0}
        max={10}
        step={0.5}
        onValueChange={([value]) => setPianoRollConfig({ noteCornerRadius: value })}
      />
      <SliderRow
        label={<span>{m.note_margin({ value: pianoRollConfig.noteMargin })}</span>}
        value={[pianoRollConfig.noteMargin]}
        min={0}
        max={5}
        step={0.5}
        onValueChange={([value]) => setPianoRollConfig({ noteMargin: +value })}
      />
      <SliderRow
        label={<span>{m.note_vertical_margin({ value: pianoRollConfig.noteVerticalMargin })}</span>}
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
              {m.view_range({
                bottom: pianoRollConfig.viewRangeBottom,
                top: pianoRollConfig.viewRangeTop,
              })}
            </span>
            {minNote !== undefined && maxNote !== undefined && (
              <span className="text-muted-foreground">
                {m.detected_range({ min: minNote, max: maxNote })}
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
        label={<span>{m.playhead_position({ value: pianoRollConfig.playheadPosition })}</span>}
        value={[pianoRollConfig.playheadPosition]}
        min={0}
        max={75}
        step={1}
        onValueChange={([value]) => setPianoRollConfig({ playheadPosition: value })}
      />
      <FormRow
        label={<span>{m.playhead_border()}</span>}
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
            label={<span>{m.playhead_border_color()}</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                value={pianoRollConfig.playheadColor}
                onChange={(value) => setPianoRollConfig({ playheadColor: value })}
              />
            )}
          />
          <SliderRow
            label={<span>{m.playhead_border_width({ value: pianoRollConfig.playheadWidth })}</span>}
            value={[pianoRollConfig.playheadWidth]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => setPianoRollConfig({ playheadWidth: value })}
          />
          <SliderRow
            label={
              <span>
                {m.playhead_border_opacity({
                  value: Math.round(pianoRollConfig.playheadOpacity * 100),
                })}
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
              label={<span>{m.note_press_effect()}</span>}
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
                  label={
                    <span>{m.note_press_depth({ value: pianoRollConfig.notePressDepth })}</span>
                  }
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
                      {m.note_press_animation_duration({
                        value: pianoRollConfig.pressAnimationDuration,
                      })}
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
