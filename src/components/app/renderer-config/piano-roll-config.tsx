import { FormRow } from "@/components/common/form-row";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RendererConfig } from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";
import { useCallback } from "react";
import { MidiTracks } from "@/lib/midi/midi";
interface Props {
  pianoRollConfig: RendererConfig["pianoRollConfig"];
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  midiTracks?: MidiTracks;
}
export function PianoRollConfigPanel({
  pianoRollConfig,
  onUpdateRendererConfig,
  midiTracks,
}: Props) {
  const setPianoRollConfig = useCallback(
    (pianoRollConfig: DeepPartial<RendererConfig["pianoRollConfig"]>) =>
      onUpdateRendererConfig({ pianoRollConfig }),
    [onUpdateRendererConfig],
  );
  const { minNote, maxNote } = midiTracks || {};
  return (
    <>
      <FormRow
        label={<span>Time Window: {pianoRollConfig.timeWindow}s</span>}
        controller={
          <Slider
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.timeWindow]}
            min={0.1}
            max={20}
            step={0.1}
            onValueChange={([value]) =>
              setPianoRollConfig({ timeWindow: value })
            }
          />
        }
      />
      <FormRow
        label={<span>Note Height: {pianoRollConfig.noteHeight}px</span>}
        controller={
          <Slider
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.noteHeight]}
            min={1}
            max={40}
            step={1}
            onValueChange={([value]) =>
              setPianoRollConfig({ noteHeight: value })
            }
          />
        }
      />
      <FormRow
        label={
          <span>Note Corner Radius: {pianoRollConfig.noteCornerRadius}px</span>
        }
        controller={
          <Slider
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.noteCornerRadius]}
            min={0}
            max={10}
            step={0.5}
            onValueChange={([value]) =>
              setPianoRollConfig({ noteCornerRadius: value })
            }
          />
        }
      />
      <FormRow
        label={<span>Note Margin: {pianoRollConfig.noteMargin}px</span>}
        controller={
          <Slider
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.noteMargin]}
            min={0}
            max={5}
            step={0.5}
            onValueChange={([value]) =>
              setPianoRollConfig({ noteMargin: +value })
            }
          />
        }
      />
      <FormRow
        label={
          <span>
            Note Vertical Margin: {pianoRollConfig.noteVerticalMargin}px
          </span>
        }
        controller={
          <Slider
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.noteVerticalMargin]}
            min={0}
            max={10}
            step={0.5}
            onValueChange={([value]) =>
              setPianoRollConfig({ noteVerticalMargin: value })
            }
          />
        }
      />
      <FormRow
        label={
          <span className="flex flex-wrap gap-x-2">
            <span>
              View Range: {pianoRollConfig.viewRangeBottom} -{" "}
              {pianoRollConfig.viewRangeTop}
            </span>
            {midiTracks && (
              <span className="text-muted-foreground">
                (Detected range: {minNote} - {maxNote})
              </span>
            )}
          </span>
        }
        controller={
          <Slider
            className="w-full max-w-48 min-w-24"
            value={[
              pianoRollConfig.viewRangeBottom,
              pianoRollConfig.viewRangeTop,
            ]}
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
        }
      />
      <Separator />
      <FormRow
        label={
          <span>Playhead Position: {pianoRollConfig.playheadPosition}%</span>
        }
        controller={
          <Slider
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.playheadPosition]}
            min={0}
            max={75}
            step={1}
            onValueChange={([value]) =>
              setPianoRollConfig({ playheadPosition: value })
            }
          />
        }
      />
      <FormRow
        label={<span>Show Playhead Border</span>}
        controller={
          <Switch
            checked={pianoRollConfig.showPlayhead}
            onCheckedChange={(checked) =>
              setPianoRollConfig({ showPlayhead: checked })
            }
          />
        }
      />
      {pianoRollConfig.showPlayhead && (
        <>
          <FormRow
            label={<span>Playhead Border Color</span>}
            controller={
              <input
                type="color"
                value={pianoRollConfig.playheadColor}
                onChange={(e) =>
                  setPianoRollConfig({ playheadColor: e.target.value })
                }
              />
            }
          />
          <FormRow
            label={
              <span>
                Playhead Border Width: {pianoRollConfig.playheadWidth}px
              </span>
            }
            controller={
              <Slider
                className="w-full max-w-48 min-w-24"
                value={[pianoRollConfig.playheadWidth]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) =>
                  setPianoRollConfig({ playheadWidth: value })
                }
              />
            }
          />
          <FormRow
            label={
              <span>
                Playhead Border Opacity:{" "}
                {Math.round(pianoRollConfig.playheadOpacity * 100)}%
              </span>
            }
            controller={
              <Slider
                className="w-full max-w-48 min-w-24"
                value={[pianoRollConfig.playheadOpacity]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={([value]) =>
                  setPianoRollConfig({ playheadOpacity: value })
                }
              />
            }
          />
        </>
      )}
      <Separator />
      <FormRow
        label={<span>Show Ripple Effect</span>}
        controller={
          <Switch
            checked={pianoRollConfig.showRippleEffect}
            onCheckedChange={(checked) => {
              setPianoRollConfig({ showRippleEffect: checked });
            }}
          />
        }
      />
      {pianoRollConfig.showRippleEffect && (
        <>
          <FormRow
            label={<span>Use Custom Ripple Color</span>}
            controller={
              <Switch
                checked={pianoRollConfig.useCustomRippleColor}
                onCheckedChange={(checked) => {
                  setPianoRollConfig({ useCustomRippleColor: checked });
                }}
              />
            }
          />
          {pianoRollConfig.useCustomRippleColor && (
            <FormRow
              label={<span>Ripple Color</span>}
              controller={
                <input
                  type="color"
                  value={pianoRollConfig.rippleColor}
                  onChange={(e) => {
                    setPianoRollConfig({ rippleColor: e.target.value });
                  }}
                />
              }
            />
          )}
          <FormRow
            label={
              <span>Ripple Duration: {pianoRollConfig.rippleDuration}sec</span>
            }
            controller={
              <Slider
                value={[pianoRollConfig.rippleDuration]}
                className="w-full max-w-48 min-w-24"
                min={0.1}
                max={2}
                step={0.1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ rippleDuration: value });
                }}
              />
            }
          />
          <FormRow
            label={<span>Ripple Radius: {pianoRollConfig.rippleRadius}px</span>}
            controller={
              <Slider
                value={[pianoRollConfig.rippleRadius]}
                className="w-full max-w-48 min-w-24"
                min={10}
                max={100}
                step={1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ rippleRadius: value });
                }}
              />
            }
          />
        </>
      )}
      <Separator />
      <FormRow
        label={<span>Note Press Effect</span>}
        controller={
          <div className="flex items-center gap-2">
            <Switch
              checked={pianoRollConfig.showNotePressEffect}
              onCheckedChange={(checked) => {
                setPianoRollConfig({ showNotePressEffect: checked });
              }}
            />
          </div>
        }
      />
      {pianoRollConfig.showNotePressEffect && (
        <>
          <FormRow
            label={<span>Press Depth: {pianoRollConfig.notePressDepth}px</span>}
            controller={
              <Slider
                value={[pianoRollConfig.notePressDepth]}
                className="w-full max-w-48 min-w-24"
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ notePressDepth: value });
                }}
              />
            }
          />
          <FormRow
            label={
              <span>
                Press Animation Duration:{" "}
                {pianoRollConfig.pressAnimationDuration}sec
              </span>
            }
            controller={
              <Slider
                value={[pianoRollConfig.pressAnimationDuration]}
                className="w-full max-w-48 min-w-24"
                min={0.05}
                max={1}
                step={0.05}
                onValueChange={([value]) => {
                  setPianoRollConfig({ pressAnimationDuration: value });
                }}
              />
            }
          />
        </>
      )}
      <Separator />
      <FormRow
        label={<span>Note Flash Effect</span>}
        controller={
          <div className="flex items-center gap-2">
            <Switch
              checked={pianoRollConfig.showNoteFlash}
              onCheckedChange={(checked) => {
                setPianoRollConfig({ showNoteFlash: checked });
              }}
            />
          </div>
        }
      />
      {pianoRollConfig.showNoteFlash && (
        <>
          <FormRow
            label={
              <span>Flash Intensity: {pianoRollConfig.noteFlashIntensity}</span>
            }
            controller={
              <Slider
                value={[pianoRollConfig.noteFlashIntensity]}
                className="w-full max-w-48 min-w-24"
                min={0}
                max={1}
                step={0.1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ noteFlashIntensity: value });
                }}
              />
            }
          />

          <FormRow
            label={
              <span>
                Fade Out Duration: {pianoRollConfig.noteFlashFadeOutDuration}sec
              </span>
            }
            controller={
              <Slider
                value={[pianoRollConfig.noteFlashFadeOutDuration]}
                className="w-full max-w-48 min-w-24"
                min={0.1}
                max={1}
                step={0.1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ noteFlashFadeOutDuration: value });
                }}
              />
            }
          />
          <FormRow
            label={<span>Flash Mode</span>}
            controller={
              <select
                value={pianoRollConfig.noteFlashMode}
                onChange={(e) => {
                  setPianoRollConfig({
                    noteFlashMode: e.target.value as "on" | "duration",
                  });
                }}
                className="border-input bg-background w-full max-w-48 min-w-24 rounded-md border px-3 py-2"
              >
                <option value="on">On</option>
                <option value="duration">Duration</option>
              </select>
            }
          />
          {pianoRollConfig.noteFlashMode === "duration" && (
            <FormRow
              label={
                <span>
                  Flash Duration: {pianoRollConfig.noteFlashDuration}sec
                </span>
              }
              controller={
                <Slider
                  value={[pianoRollConfig.noteFlashDuration]}
                  className="w-full max-w-48 min-w-24"
                  min={0.1}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) => {
                    setPianoRollConfig({ noteFlashDuration: value });
                  }}
                />
              }
            />
          )}
        </>
      )}
    </>
  );
}
