import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { VerticalPianoRollConfig } from "@/lib/renderers/renderer-config";

import { NoteEffectsConfigFields } from "./note-effects-config-fields";

interface Props {
  config: VerticalPianoRollConfig;
  onChange: (partial: Partial<VerticalPianoRollConfig>) => void;
  minNote?: number;
  maxNote?: number;
}

export function VerticalPianoRollConfigPanel({ config, onChange, minNote, maxNote }: Props) {
  return (
    <>
      <SliderRow
        label={<span>Time Window: {config.timeWindow}s</span>}
        value={[config.timeWindow]}
        min={0.5}
        max={10}
        step={0.1}
        onValueChange={([value]) => onChange({ timeWindow: value })}
      />
      <SliderRow
        label={<span>Keyboard Height: {config.keyboardHeight}%</span>}
        value={[config.keyboardHeight]}
        min={5}
        max={40}
        step={1}
        onValueChange={([value]) => onChange({ keyboardHeight: value })}
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
        onValueChange={([bottom, top]) => onChange({ viewRangeBottom: bottom, viewRangeTop: top })}
      />
      <SliderRow
        label={<span>Note Margin: {config.noteMargin}px</span>}
        value={[config.noteMargin]}
        min={0}
        max={5}
        step={0.5}
        onValueChange={([value]) => onChange({ noteMargin: value })}
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
        label={<span>Note Corner Radius: {config.noteCornerRadius}px</span>}
        value={[config.noteCornerRadius]}
        min={0}
        max={10}
        step={0.5}
        onValueChange={([value]) => onChange({ noteCornerRadius: value })}
      />
      <FormRow
        label={<span>Darken Black Key Notes</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.darkenBlackKeyNotes}
            onCheckedChange={(checked) => onChange({ darkenBlackKeyNotes: checked })}
          />
        )}
      />
      {config.darkenBlackKeyNotes && (
        <SliderRow
          label={
            <span>Black Key Note Darkness: {Math.round(config.blackKeyNoteDarkness * 100)}%</span>
          }
          value={[config.blackKeyNoteDarkness]}
          min={0.05}
          max={0.6}
          step={0.05}
          onValueChange={([value]) => onChange({ blackKeyNoteDarkness: value })}
        />
      )}
      <Separator />
      <FormRow
        label={<span>White Key Color</span>}
        controller={({ id }) => (
          <ColorPickerInput
            id={id}
            value={config.whiteKeyColor}
            onChange={(value) => onChange({ whiteKeyColor: value })}
          />
        )}
      />
      <FormRow
        label={<span>Black Key Color</span>}
        controller={({ id }) => (
          <ColorPickerInput
            id={id}
            value={config.blackKeyColor}
            onChange={(value) => onChange({ blackKeyColor: value })}
          />
        )}
      />
      <FormRow
        label={<span>Key Press Highlight</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showKeyPressHighlight}
            onCheckedChange={(checked) => onChange({ showKeyPressHighlight: checked })}
          />
        )}
      />
      {config.showKeyPressHighlight && (
        <SliderRow
          label={<span>Key Press Opacity: {Math.round(config.keyPressOpacity * 100)}%</span>}
          value={[config.keyPressOpacity]}
          min={0.1}
          max={1}
          step={0.05}
          onValueChange={([value]) => onChange({ keyPressOpacity: value })}
        />
      )}
      <FormRow
        label={<span>Octave Labels</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showOctaveLabels}
            onCheckedChange={(checked) => onChange({ showOctaveLabels: checked })}
          />
        )}
      />
      <FormRow
        label={<span>Key Lines</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showKeyLines}
            onCheckedChange={(checked) => onChange({ showKeyLines: checked })}
          />
        )}
      />
      {config.showKeyLines && (
        <FormRow
          label={<span>Key Line Color</span>}
          controller={({ id }) => (
            <ColorPickerInput
              id={id}
              value={config.keyLineColor}
              onChange={(value) => onChange({ keyLineColor: value })}
            />
          )}
        />
      )}
      {config.showKeyLines && (
        <SliderRow
          label={<span>Key Line Opacity: {Math.round(config.keyLineOpacity * 100)}%</span>}
          value={[config.keyLineOpacity]}
          min={0}
          max={0.3}
          step={0.01}
          onValueChange={([value]) => onChange({ keyLineOpacity: value })}
        />
      )}
      <FormRow
        label={<span>Octave Lines</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showOctaveLines}
            onCheckedChange={(checked) => onChange({ showOctaveLines: checked })}
          />
        )}
      />
      {config.showOctaveLines && (
        <FormRow
          label={<span>Octave Line Color</span>}
          controller={({ id }) => (
            <ColorPickerInput
              id={id}
              value={config.octaveLineColor}
              onChange={(value) => onChange({ octaveLineColor: value })}
            />
          )}
        />
      )}
      {config.showOctaveLines && (
        <SliderRow
          label={<span>Octave Line Opacity: {Math.round(config.octaveLineOpacity * 100)}%</span>}
          value={[config.octaveLineOpacity]}
          min={0}
          max={0.5}
          step={0.01}
          onValueChange={([value]) => onChange({ octaveLineOpacity: value })}
        />
      )}
      <Separator />
      <FormRow
        label={<span>Hit Line</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.showHitLine}
            onCheckedChange={(checked) => onChange({ showHitLine: checked })}
          />
        )}
      />
      {config.showHitLine && (
        <>
          <FormRow
            label={<span>Hit Line Color</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                value={config.hitLineColor}
                onChange={(value) => onChange({ hitLineColor: value })}
              />
            )}
          />
          <SliderRow
            label={<span>Hit Line Width: {config.hitLineWidth}px</span>}
            value={[config.hitLineWidth]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => onChange({ hitLineWidth: value })}
          />
          <SliderRow
            label={<span>Hit Line Opacity: {Math.round(config.hitLineOpacity * 100)}%</span>}
            value={[config.hitLineOpacity]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([value]) => onChange({ hitLineOpacity: value })}
          />
        </>
      )}
      <Separator />
      <NoteEffectsConfigFields config={config} onChange={onChange} />
    </>
  );
}
