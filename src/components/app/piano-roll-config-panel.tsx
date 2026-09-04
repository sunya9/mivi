import { useCallback } from "react";

import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RendererConfig } from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";

import { NoteEffectsConfigFields } from "./note-effects-config-fields";

interface Props {
  pianoRollConfig: RendererConfig["pianoRollConfig"];
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
    (pianoRollConfig: DeepPartial<RendererConfig["pianoRollConfig"]>) =>
      onUpdateRendererConfig({ pianoRollConfig }),
    [onUpdateRendererConfig],
  );
  return (
    <>
      <FormRow
        label={<span>Time Window: {pianoRollConfig.timeWindow}s</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.timeWindow]}
            min={0.1}
            max={20}
            step={0.1}
            onValueChange={([value]) => setPianoRollConfig({ timeWindow: value })}
          />
        )}
      />
      <FormRow
        label={<span>Note Height: {pianoRollConfig.noteHeight}px</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.noteHeight]}
            min={1}
            max={40}
            step={1}
            onValueChange={([value]) => setPianoRollConfig({ noteHeight: value })}
          />
        )}
      />
      <FormRow
        label={<span>Note Corner Radius: {pianoRollConfig.noteCornerRadius}px</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.noteCornerRadius]}
            min={0}
            max={10}
            step={0.5}
            onValueChange={([value]) => setPianoRollConfig({ noteCornerRadius: value })}
          />
        )}
      />
      <FormRow
        label={<span>Note Margin: {pianoRollConfig.noteMargin}px</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.noteMargin]}
            min={0}
            max={5}
            step={0.5}
            onValueChange={([value]) => setPianoRollConfig({ noteMargin: +value })}
          />
        )}
      />
      <FormRow
        label={<span>Note Vertical Margin: {pianoRollConfig.noteVerticalMargin}px</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.noteVerticalMargin]}
            min={0}
            max={10}
            step={0.5}
            onValueChange={([value]) => setPianoRollConfig({ noteVerticalMargin: value })}
          />
        )}
      />
      <FormRow
        label={
          <span className="flex flex-wrap gap-x-2">
            <span>
              View Range: {pianoRollConfig.viewRangeBottom} - {pianoRollConfig.viewRangeTop}
            </span>
            {minNote && maxNote && (
              <span className="text-muted-foreground">
                (Detected range: {minNote} - {maxNote})
              </span>
            )}
          </span>
        }
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
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
        )}
      />
      <Separator />
      <FormRow
        label={<span>Playhead Position: {pianoRollConfig.playheadPosition}%</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.playheadPosition]}
            min={0}
            max={75}
            step={1}
            onValueChange={([value]) => setPianoRollConfig({ playheadPosition: value })}
          />
        )}
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
          <FormRow
            label={<span>Playhead Border Width: {pianoRollConfig.playheadWidth}px</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                className="w-full max-w-48 min-w-24"
                value={[pianoRollConfig.playheadWidth]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => setPianoRollConfig({ playheadWidth: value })}
              />
            )}
          />
          <FormRow
            label={
              <span>
                Playhead Border Opacity: {Math.round(pianoRollConfig.playheadOpacity * 100)}%
              </span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                className="w-full max-w-48 min-w-24"
                value={[pianoRollConfig.playheadOpacity]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={([value]) => setPianoRollConfig({ playheadOpacity: value })}
              />
            )}
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
                <FormRow
                  label={<span>Press Depth: {pianoRollConfig.notePressDepth}px</span>}
                  customControl
                  controller={({ labelId, ref }) => (
                    <Slider
                      ref={ref}
                      aria-labelledby={labelId}
                      value={[pianoRollConfig.notePressDepth]}
                      className="w-full max-w-48 min-w-24"
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={([value]) => {
                        setPianoRollConfig({ notePressDepth: value });
                      }}
                    />
                  )}
                />
                <FormRow
                  label={
                    <span>
                      Press Animation Duration: {pianoRollConfig.pressAnimationDuration}sec
                    </span>
                  }
                  customControl
                  controller={({ labelId, ref }) => (
                    <Slider
                      ref={ref}
                      aria-labelledby={labelId}
                      value={[pianoRollConfig.pressAnimationDuration]}
                      className="w-full max-w-48 min-w-24"
                      min={0.05}
                      max={1}
                      step={0.05}
                      onValueChange={([value]) => {
                        setPianoRollConfig({ pressAnimationDuration: value });
                      }}
                    />
                  )}
                />
              </>
            )}
          </>
        }
      />
    </>
  );
}
