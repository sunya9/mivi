import { FormRow } from "@/components/FormRow";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RendererConfig } from "@/types/renderer";
import { DeepPartial } from "@/types/util";
import { useCallback } from "react";
import { MidiTracks } from "@/types/midi";
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
        Label={() => <>Time Window: {pianoRollConfig.timeWindow}s</>}
        Controller={() => (
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
        )}
      />
      <FormRow
        Label={() => <>Note Height: {pianoRollConfig.noteHeight}px</>}
        Controller={() => (
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
        )}
      />
      <FormRow
        Label={() => (
          <>Note Corner Radius: {pianoRollConfig.noteCornerRadius}px</>
        )}
        Controller={() => (
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
        )}
      />
      <FormRow
        Label={() => <>Note Margin: {pianoRollConfig.noteMargin}px</>}
        Controller={() => (
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
        )}
      />
      <FormRow
        Label={() => (
          <>Note Vertical Margin: {pianoRollConfig.noteVerticalMargin}px</>
        )}
        Controller={() => (
          <Slider
            className="w-full max-w-48 min-w-24"
            value={[pianoRollConfig.noteVerticalMargin]}
            min={0}
            max={10}
            step={0.5}
            onValueChange={([value]) =>
              setPianoRollConfig({ noteVerticalMargin: +value })
            }
          />
        )}
      />
      <FormRow
        Label={() => (
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
        )}
        Controller={() => (
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
        )}
      />
      <Separator />
      <FormRow
        Label={() => (
          <>Playhead Position: {pianoRollConfig.playheadPosition}%</>
        )}
        Controller={() => (
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
        )}
      />
      <FormRow
        Label={() => <>Show Playhead Border</>}
        Controller={() => (
          <Switch
            checked={pianoRollConfig.showPlayhead}
            onCheckedChange={(checked) =>
              setPianoRollConfig({ showPlayhead: checked })
            }
          />
        )}
      />
      {pianoRollConfig.showPlayhead && (
        <>
          <FormRow
            Label={() => <>Playhead Border Color</>}
            Controller={() => (
              <input
                type="color"
                value={pianoRollConfig.playheadColor}
                onChange={(e) =>
                  setPianoRollConfig({ playheadColor: e.target.value })
                }
              />
            )}
          />
          <FormRow
            Label={() => (
              <>Playhead Border Width: {pianoRollConfig.playheadWidth}px</>
            )}
            Controller={() => (
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
            )}
          />
          <FormRow
            Label={() => (
              <>
                Playhead Border Opacity:{" "}
                {Math.round(pianoRollConfig.playheadOpacity * 100)}%
              </>
            )}
            Controller={() => (
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
            )}
          />
        </>
      )}
      <Separator />
      <FormRow
        Label={() => <>Show Ripple Effect</>}
        Controller={() => (
          <Switch
            checked={pianoRollConfig.showRippleEffect}
            onCheckedChange={(checked) =>
              setPianoRollConfig({ showRippleEffect: checked })
            }
          />
        )}
      />
      <Separator />
      <FormRow
        Label={() => <>Note Press Effect</>}
        Controller={() => (
          <div className="flex items-center gap-2">
            <Switch
              checked={pianoRollConfig.showNotePressEffect}
              onCheckedChange={(checked) => {
                setPianoRollConfig({ showNotePressEffect: checked });
              }}
            />
          </div>
        )}
      />
      {pianoRollConfig.showNotePressEffect && (
        <FormRow
          Label={() => <>Press Depth: {pianoRollConfig.notePressDepth}px</>}
          Controller={() => (
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
          )}
        />
      )}
      <Separator />
      <FormRow
        Label={() => <>Note Flash Effect</>}
        Controller={() => (
          <div className="flex items-center gap-2">
            <Switch
              checked={pianoRollConfig.showNoteFlash}
              onCheckedChange={(checked) => {
                setPianoRollConfig({ showNoteFlash: checked });
              }}
            />
          </div>
        )}
      />
      {pianoRollConfig.showNoteFlash && (
        <>
          <FormRow
            Label={() => (
              <>Flash Duration: {pianoRollConfig.noteFlashDuration}sec</>
            )}
            Controller={() => (
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
            )}
          />
          <FormRow
            Label={() => <>Flash Intensity</>}
            Controller={() => (
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
            )}
          />
        </>
      )}
    </>
  );
}
