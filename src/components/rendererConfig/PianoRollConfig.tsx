import { FormRow } from "@/components/FormRow";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RendererConfig } from "@/types/renderer";

interface Props {
  config: RendererConfig["pianoRollConfig"];
  onChange: (config: Partial<RendererConfig["pianoRollConfig"]>) => void;
}

export function PianoRollConfigPanel({ config, onChange }: Props) {
  return (
    <>
      <FormRow
        Label={() => <>Time Window: {config.timeWindow}s</>}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[config.timeWindow]}
            min={1}
            max={20}
            step={0.5}
            onValueChange={([value]) => onChange({ timeWindow: value })}
          />
        )}
      />
      <FormRow
        Label={() => <>Note Height: {config.noteHeight}px</>}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[config.noteHeight]}
            min={1}
            max={20}
            step={1}
            onValueChange={([value]) => onChange({ noteHeight: value })}
          />
        )}
      />
      <FormRow
        Label={() => <>Note Corner Radius: {config.noteCornerRadius}px</>}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[config.noteCornerRadius]}
            min={0}
            max={10}
            step={0.5}
            onValueChange={([value]) => onChange({ noteCornerRadius: value })}
          />
        )}
      />
      <FormRow
        Label={() => <>Note Margin: {config.noteMargin}px</>}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[config.noteMargin]}
            min={0}
            max={5}
            step={0.5}
            onValueChange={([value]) => onChange({ noteMargin: +value })}
          />
        )}
      />
      <FormRow
        Label={() => <>Note Vertical Margin: {config.noteVerticalMargin}px</>}
        Controller={() => (
          <Slider
            className="w-full min-w-24 max-w-48"
            value={[config.noteVerticalMargin]}
            min={0}
            max={5}
            step={0.5}
            onValueChange={([value]) =>
              onChange({ noteVerticalMargin: +value })
            }
          />
        )}
      />
      <FormRow
        Label={() => <>Show Playhead</>}
        Controller={() => (
          <Switch
            checked={config.showPlayhead}
            onCheckedChange={(checked) => onChange({ showPlayhead: checked })}
          />
        )}
      />
      {config.showPlayhead && (
        <>
          <FormRow
            Label={() => <>Playhead Position: {config.playheadPosition}%</>}
            Controller={() => (
              <Slider
                className="w-full min-w-24 max-w-48"
                value={[config.playheadPosition]}
                min={0}
                max={75}
                step={1}
                onValueChange={([value]) =>
                  onChange({ playheadPosition: value })
                }
              />
            )}
          />
          <FormRow
            Label={() => <>Playhead Color</>}
            Controller={() => (
              <input
                type="color"
                value={config.playheadColor}
                onChange={(e) => onChange({ playheadColor: e.target.value })}
              />
            )}
          />
          <FormRow
            Label={() => <>Playhead Width: {config.playheadWidth}px</>}
            Controller={() => (
              <Slider
                className="w-full min-w-24 max-w-48"
                value={[config.playheadWidth]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => onChange({ playheadWidth: value })}
              />
            )}
          />
          <FormRow
            Label={() => (
              <>Playhead Opacity: {Math.round(config.playheadOpacity * 100)}%</>
            )}
            Controller={() => (
              <Slider
                className="w-full min-w-24 max-w-48"
                value={[config.playheadOpacity]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={([value]) =>
                  onChange({ playheadOpacity: value })
                }
              />
            )}
          />
        </>
      )}
      <FormRow
        Label={() => <>Show Ripple Effect</>}
        Controller={() => (
          <Switch
            checked={config.showRippleEffect}
            onCheckedChange={(checked) =>
              onChange({ showRippleEffect: checked })
            }
          />
        )}
      />
      <FormRow
        Label={() => <>Note Flash Effect</>}
        Controller={() => (
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showNoteFlash}
              onCheckedChange={(checked) => {
                onChange({ showNoteFlash: checked });
              }}
            />
            {/* <p>Show flash effect when notes are played</p> */}
          </div>
        )}
      />
      {config.showNoteFlash && (
        <>
          <FormRow
            Label={() => <>Flash Duration: {config.noteFlashDuration}sec</>}
            Controller={() => (
              <Slider
                value={[config.noteFlashDuration]}
                className="w-full min-w-24 max-w-48"
                min={0.1}
                max={2}
                step={0.1}
                onValueChange={([value]) => {
                  onChange({ noteFlashDuration: value });
                }}
              />
            )}
          />
          <FormRow
            Label={() => <>Flash Intensity</>}
            Controller={() => (
              <Slider
                value={[config.noteFlashIntensity]}
                className="w-full min-w-24 max-w-48"
                min={0}
                max={1}
                step={0.1}
                onValueChange={([value]) => {
                  onChange({ noteFlashIntensity: value });
                }}
              />
            )}
          />
        </>
      )}
    </>
  );
}
