import { useCallback } from "react";

import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMessages } from "@/lib/locale/use-messages";
import { RendererConfig, VerticalPianoRollConfig } from "@/lib/renderers/renderer-config";
import { DeepPartial } from "@/lib/type-utils";

import { NoteEffectsConfigFields } from "./note-effects-config-fields";

interface Props {
  verticalPianoRollConfig: VerticalPianoRollConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  minNote?: number;
  maxNote?: number;
}

export function VerticalPianoRollConfigPanel({
  verticalPianoRollConfig: config,
  onUpdateRendererConfig,
  minNote,
  maxNote,
}: Props) {
  const m = useMessages();
  const setConfig = useCallback(
    (verticalPianoRollConfig: DeepPartial<VerticalPianoRollConfig>) =>
      onUpdateRendererConfig({ verticalPianoRollConfig }),
    [onUpdateRendererConfig],
  );
  return (
    <>
      <SliderRow
        label={<span>{m.time_window({ value: config.timeWindow })}</span>}
        value={[config.timeWindow]}
        min={0.5}
        max={10}
        step={0.1}
        onValueChange={([value]) => setConfig({ timeWindow: value })}
      />
      <SliderRow
        label={<span>{m.keyboard_height({ value: config.keyboardHeight })}</span>}
        value={[config.keyboardHeight]}
        min={5}
        max={40}
        step={1}
        onValueChange={([value]) => setConfig({ keyboardHeight: value })}
      />
      <SliderRow
        label={
          <span className="flex flex-wrap gap-x-2">
            <span>
              {m.view_range({ bottom: config.viewRangeBottom, top: config.viewRangeTop })}
            </span>
            {minNote !== undefined && maxNote !== undefined && (
              <span className="text-muted-foreground">
                {m.detected_range({ min: minNote, max: maxNote })}
              </span>
            )}
          </span>
        }
        value={[config.viewRangeBottom, config.viewRangeTop]}
        min={0}
        max={127}
        step={1}
        onValueChange={([bottom, top]) => setConfig({ viewRangeBottom: bottom, viewRangeTop: top })}
      />
      <SliderRow
        label={<span>{m.note_margin({ value: config.noteMargin })}</span>}
        value={[config.noteMargin]}
        min={0}
        max={5}
        step={0.5}
        onValueChange={([value]) => setConfig({ noteMargin: value })}
      />
      <SliderRow
        label={<span>{m.note_vertical_margin({ value: config.noteVerticalMargin })}</span>}
        value={[config.noteVerticalMargin]}
        min={0}
        max={10}
        step={0.5}
        onValueChange={([value]) => setConfig({ noteVerticalMargin: value })}
      />
      <SliderRow
        label={<span>{m.note_corner_radius({ value: config.noteCornerRadius })}</span>}
        value={[config.noteCornerRadius]}
        min={0}
        max={10}
        step={0.5}
        onValueChange={([value]) => setConfig({ noteCornerRadius: value })}
      />
      <FormRow
        label={<span>{m.darken_black_key_notes()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.darkenBlackKeyNotes}
            onCheckedChange={(checked) => setConfig({ darkenBlackKeyNotes: checked })}
          />
        )}
      />
      {config.darkenBlackKeyNotes && (
        <SliderRow
          label={
            <span>
              {m.black_key_note_darkness({ value: Math.round(config.blackKeyNoteDarkness * 100) })}
            </span>
          }
          value={[config.blackKeyNoteDarkness]}
          min={0.05}
          max={0.6}
          step={0.05}
          onValueChange={([value]) => setConfig({ blackKeyNoteDarkness: value })}
        />
      )}
      <Separator />
      <FormRow
        label={<span>{m.white_key_color()}</span>}
        controller={({ id }) => (
          <ColorPickerInput
            id={id}
            value={config.whiteKeyColor}
            onChange={(value) => setConfig({ whiteKeyColor: value })}
          />
        )}
      />
      <FormRow
        label={<span>{m.black_key_color()}</span>}
        controller={({ id }) => (
          <ColorPickerInput
            id={id}
            value={config.blackKeyColor}
            onChange={(value) => setConfig({ blackKeyColor: value })}
          />
        )}
      />
      <FormRow
        label={<span>{m.key_press_highlight()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showKeyPressHighlight}
            onCheckedChange={(checked) => setConfig({ showKeyPressHighlight: checked })}
          />
        )}
      />
      {config.showKeyPressHighlight && (
        <SliderRow
          label={
            <span>{m.key_press_opacity({ value: Math.round(config.keyPressOpacity * 100) })}</span>
          }
          value={[config.keyPressOpacity]}
          min={0.1}
          max={1}
          step={0.05}
          onValueChange={([value]) => setConfig({ keyPressOpacity: value })}
        />
      )}
      <FormRow
        label={<span>{m.octave_labels()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showOctaveLabels}
            onCheckedChange={(checked) => setConfig({ showOctaveLabels: checked })}
          />
        )}
      />
      <FormRow
        label={<span>{m.key_lines()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showKeyLines}
            onCheckedChange={(checked) => setConfig({ showKeyLines: checked })}
          />
        )}
      />
      {config.showKeyLines && (
        <FormRow
          label={<span>{m.key_line_color()}</span>}
          controller={({ id }) => (
            <ColorPickerInput
              id={id}
              value={config.keyLineColor}
              onChange={(value) => setConfig({ keyLineColor: value })}
            />
          )}
        />
      )}
      {config.showKeyLines && (
        <SliderRow
          label={
            <span>{m.key_line_opacity({ value: Math.round(config.keyLineOpacity * 100) })}</span>
          }
          value={[config.keyLineOpacity]}
          min={0}
          max={0.3}
          step={0.01}
          onValueChange={([value]) => setConfig({ keyLineOpacity: value })}
        />
      )}
      <FormRow
        label={<span>{m.octave_lines()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showOctaveLines}
            onCheckedChange={(checked) => setConfig({ showOctaveLines: checked })}
          />
        )}
      />
      {config.showOctaveLines && (
        <FormRow
          label={<span>{m.octave_line_color()}</span>}
          controller={({ id }) => (
            <ColorPickerInput
              id={id}
              value={config.octaveLineColor}
              onChange={(value) => setConfig({ octaveLineColor: value })}
            />
          )}
        />
      )}
      {config.showOctaveLines && (
        <SliderRow
          label={
            <span>
              {m.octave_line_opacity({ value: Math.round(config.octaveLineOpacity * 100) })}
            </span>
          }
          value={[config.octaveLineOpacity]}
          min={0}
          max={0.5}
          step={0.01}
          onValueChange={([value]) => setConfig({ octaveLineOpacity: value })}
        />
      )}
      <Separator />
      <FormRow
        label={<span>{m.hit_line()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showHitLine}
            onCheckedChange={(checked) => setConfig({ showHitLine: checked })}
          />
        )}
      />
      {config.showHitLine && (
        <>
          <FormRow
            label={<span>{m.hit_line_color()}</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                value={config.hitLineColor}
                onChange={(value) => setConfig({ hitLineColor: value })}
              />
            )}
          />
          <SliderRow
            label={<span>{m.hit_line_width({ value: config.hitLineWidth })}</span>}
            value={[config.hitLineWidth]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => setConfig({ hitLineWidth: value })}
          />
          <SliderRow
            label={
              <span>{m.hit_line_opacity({ value: Math.round(config.hitLineOpacity * 100) })}</span>
            }
            value={[config.hitLineOpacity]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([value]) => setConfig({ hitLineOpacity: value })}
          />
        </>
      )}
      <Separator />
      <NoteEffectsConfigFields config={config} onChange={setConfig} />
    </>
  );
}
