import {
  rendererConfigAtom,
  useSetPianoRollConfig,
} from "@/atoms/rendererConfigAtom";
import { midiTracksAtom } from "@/atoms/midiTracksAtom";
import { FormRow } from "@/components/FormRow";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAtomValue } from "jotai";
import { Separator } from "@/components/ui/separator";

export function PianoRollConfigPanel() {
  const rendererConfig = useAtomValue(rendererConfigAtom);
  const setPianoRollConfig = useSetPianoRollConfig();
  const midiTracks = useAtomValue(midiTracksAtom);
  const { minNote, maxNote } = midiTracks || {};
  return (
    <>
      <FormRow
        Label={() => (
          <>Time Window: {rendererConfig.pianoRollConfig.timeWindow}s</>
        )}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[rendererConfig.pianoRollConfig.timeWindow]}
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
        Label={() => (
          <>Note Height: {rendererConfig.pianoRollConfig.noteHeight}px</>
        )}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[rendererConfig.pianoRollConfig.noteHeight]}
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
          <>
            Note Corner Radius:{" "}
            {rendererConfig.pianoRollConfig.noteCornerRadius}px
          </>
        )}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[rendererConfig.pianoRollConfig.noteCornerRadius]}
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
        Label={() => (
          <>Note Margin: {rendererConfig.pianoRollConfig.noteMargin}px</>
        )}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[rendererConfig.pianoRollConfig.noteMargin]}
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
          <>
            Note Vertical Margin:{" "}
            {rendererConfig.pianoRollConfig.noteVerticalMargin}px
          </>
        )}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[rendererConfig.pianoRollConfig.noteVerticalMargin]}
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
              View Range: {rendererConfig.pianoRollConfig.viewRangeBottom} -{" "}
              {rendererConfig.pianoRollConfig.viewRangeTop}
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
            className="w-full min-w-24 max-w-48"
            value={[
              rendererConfig.pianoRollConfig.viewRangeBottom,
              rendererConfig.pianoRollConfig.viewRangeTop,
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
          <>
            Playhead Position: {rendererConfig.pianoRollConfig.playheadPosition}
            %
          </>
        )}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[rendererConfig.pianoRollConfig.playheadPosition]}
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
            checked={rendererConfig.pianoRollConfig.showPlayhead}
            onCheckedChange={(checked) =>
              setPianoRollConfig({ showPlayhead: checked })
            }
          />
        )}
      />
      {rendererConfig.pianoRollConfig.showPlayhead && (
        <>
          <FormRow
            Label={() => <>Playhead Border Color</>}
            Controller={() => (
              <input
                type="color"
                value={rendererConfig.pianoRollConfig.playheadColor}
                onChange={(e) =>
                  setPianoRollConfig({ playheadColor: e.target.value })
                }
              />
            )}
          />
          <FormRow
            Label={() => (
              <>
                Playhead Border Width:{" "}
                {rendererConfig.pianoRollConfig.playheadWidth}px
              </>
            )}
            Controller={() => (
              <Slider
                className="w-full min-w-24 max-w-48"
                value={[rendererConfig.pianoRollConfig.playheadWidth]}
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
                {Math.round(
                  rendererConfig.pianoRollConfig.playheadOpacity * 100,
                )}
                %
              </>
            )}
            Controller={() => (
              <Slider
                className="w-full min-w-24 max-w-48"
                value={[rendererConfig.pianoRollConfig.playheadOpacity]}
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
            checked={rendererConfig.pianoRollConfig.showRippleEffect}
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
              checked={rendererConfig.pianoRollConfig.showNotePressEffect}
              onCheckedChange={(checked) => {
                setPianoRollConfig({ showNotePressEffect: checked });
              }}
            />
          </div>
        )}
      />
      {rendererConfig.pianoRollConfig.showNotePressEffect && (
        <FormRow
          Label={() => (
            <>Press Depth: {rendererConfig.pianoRollConfig.notePressDepth}px</>
          )}
          Controller={() => (
            <Slider
              value={[rendererConfig.pianoRollConfig.notePressDepth]}
              className="w-full min-w-24 max-w-48"
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
              checked={rendererConfig.pianoRollConfig.showNoteFlash}
              onCheckedChange={(checked) => {
                setPianoRollConfig({ showNoteFlash: checked });
              }}
            />
          </div>
        )}
      />
      {rendererConfig.pianoRollConfig.showNoteFlash && (
        <>
          <FormRow
            Label={() => (
              <>
                Flash Duration:{" "}
                {rendererConfig.pianoRollConfig.noteFlashDuration}sec
              </>
            )}
            Controller={() => (
              <Slider
                value={[rendererConfig.pianoRollConfig.noteFlashDuration]}
                className="w-full min-w-24 max-w-48"
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
                value={[rendererConfig.pianoRollConfig.noteFlashIntensity]}
                className="w-full min-w-24 max-w-48"
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
