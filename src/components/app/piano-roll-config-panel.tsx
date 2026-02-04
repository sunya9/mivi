import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RendererConfig } from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";
import { useCallback } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
            onValueChange={([value]) =>
              setPianoRollConfig({ timeWindow: value })
            }
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
            onValueChange={([value]) =>
              setPianoRollConfig({ noteHeight: value })
            }
          />
        )}
      />
      <FormRow
        label={
          <span>Note Corner Radius: {pianoRollConfig.noteCornerRadius}px</span>
        }
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
            onValueChange={([value]) =>
              setPianoRollConfig({ noteCornerRadius: value })
            }
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
            onValueChange={([value]) =>
              setPianoRollConfig({ noteMargin: +value })
            }
          />
        )}
      />
      <FormRow
        label={
          <span>
            Note Vertical Margin: {pianoRollConfig.noteVerticalMargin}px
          </span>
        }
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
            onValueChange={([value]) =>
              setPianoRollConfig({ noteVerticalMargin: value })
            }
          />
        )}
      />
      <FormRow
        label={
          <span className="flex flex-wrap gap-x-2">
            <span>
              View Range: {pianoRollConfig.viewRangeBottom} -{" "}
              {pianoRollConfig.viewRangeTop}
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
        label={
          <span>Playhead Position: {pianoRollConfig.playheadPosition}%</span>
        }
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
            onValueChange={([value]) =>
              setPianoRollConfig({ playheadPosition: value })
            }
          />
        )}
      />
      <FormRow
        label={<span>Playhead Border</span>}
        controller={({ id }) => (
          <Switch
            id={id}
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
            label={<span>Playhead Border Color</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                value={pianoRollConfig.playheadColor}
                onChange={(value) =>
                  setPianoRollConfig({ playheadColor: value })
                }
              />
            )}
          />
          <FormRow
            label={
              <span>
                Playhead Border Width: {pianoRollConfig.playheadWidth}px
              </span>
            }
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
                onValueChange={([value]) =>
                  setPianoRollConfig({ playheadWidth: value })
                }
              />
            )}
          />
          <FormRow
            label={
              <span>
                Playhead Border Opacity:{" "}
                {Math.round(pianoRollConfig.playheadOpacity * 100)}%
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
        label={<span>Ripple Effect</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={pianoRollConfig.showRippleEffect}
            onCheckedChange={(checked) => {
              setPianoRollConfig({ showRippleEffect: checked });
            }}
          />
        )}
      />
      {pianoRollConfig.showRippleEffect && (
        <>
          <FormRow
            label={<span>Use Custom Ripple Color</span>}
            controller={({ id }) => (
              <Switch
                id={id}
                checked={pianoRollConfig.useCustomRippleColor}
                onCheckedChange={(checked) => {
                  setPianoRollConfig({ useCustomRippleColor: checked });
                }}
              />
            )}
          />
          {pianoRollConfig.useCustomRippleColor && (
            <FormRow
              label={<span>Ripple Color</span>}
              controller={({ id }) => (
                <ColorPickerInput
                  id={id}
                  value={pianoRollConfig.rippleColor}
                  onChange={(value) => {
                    setPianoRollConfig({ rippleColor: value });
                  }}
                />
              )}
            />
          )}
          <FormRow
            label={
              <span>Ripple Duration: {pianoRollConfig.rippleDuration}sec</span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[pianoRollConfig.rippleDuration]}
                className="w-full max-w-48 min-w-24"
                min={0.1}
                max={2}
                step={0.1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ rippleDuration: value });
                }}
              />
            )}
          />
          <FormRow
            label={<span>Ripple Radius: {pianoRollConfig.rippleRadius}px</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[pianoRollConfig.rippleRadius]}
                className="w-full max-w-48 min-w-24"
                min={10}
                max={100}
                step={1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ rippleRadius: value });
                }}
              />
            )}
          />
        </>
      )}
      <Separator />
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
                Press Animation Duration:{" "}
                {pianoRollConfig.pressAnimationDuration}sec
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
      <Separator />
      <FormRow
        label={<span>Note Flash Effect</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={pianoRollConfig.showNoteFlash}
            onCheckedChange={(checked) => {
              setPianoRollConfig({ showNoteFlash: checked });
            }}
          />
        )}
      />
      {pianoRollConfig.showNoteFlash && (
        <>
          <FormRow
            label={
              <span>Flash Intensity: {pianoRollConfig.noteFlashIntensity}</span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
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

          <FormRow
            label={
              <span>
                Fade Out Duration: {pianoRollConfig.noteFlashFadeOutDuration}sec
              </span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[pianoRollConfig.noteFlashFadeOutDuration]}
                className="w-full max-w-48 min-w-24"
                min={0.1}
                max={1}
                step={0.1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ noteFlashFadeOutDuration: value });
                }}
              />
            )}
          />
          <FormRow
            label={<span>Flash Mode</span>}
            controller={({ id, labelId }) => (
              <Select
                value={pianoRollConfig.noteFlashMode}
                onValueChange={(value) => {
                  setPianoRollConfig({
                    noteFlashMode: value as "on" | "duration",
                  });
                }}
              >
                <SelectTrigger id={id} aria-labelledby={labelId}>
                  <SelectValue placeholder="Select flash mode" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="on">On</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {pianoRollConfig.noteFlashMode === "duration" && (
            <FormRow
              label={
                <span>
                  Flash Duration: {pianoRollConfig.noteFlashDuration}sec
                </span>
              }
              customControl
              controller={({ id, labelId, ref }) => (
                <Slider
                  ref={ref}
                  id={id}
                  aria-labelledby={labelId}
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
          )}
        </>
      )}
      <Separator />
      <FormRow
        label={<span>Rough Edge</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={pianoRollConfig.showRoughEdge}
            onCheckedChange={(checked) => {
              setPianoRollConfig({ showRoughEdge: checked });
            }}
          />
        )}
      />
      {pianoRollConfig.showRoughEdge && (
        <>
          <FormRow
            label={
              <span>
                Rough Edge Intensity: {pianoRollConfig.roughEdgeIntensity}px
              </span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[pianoRollConfig.roughEdgeIntensity]}
                className="w-full max-w-48 min-w-24"
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ roughEdgeIntensity: value });
                }}
              />
            )}
          />
          <FormRow
            label={
              <span>
                Rough Edge Segment: {pianoRollConfig.roughEdgeSegmentLength}px
              </span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[pianoRollConfig.roughEdgeSegmentLength]}
                className="w-full max-w-48 min-w-24"
                min={2}
                max={16}
                step={1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ roughEdgeSegmentLength: value });
                }}
              />
            )}
          />
        </>
      )}
      <Separator />
      <FormRow
        label={<span>Noise Texture</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={pianoRollConfig.showNoiseTexture}
            onCheckedChange={(checked) => {
              setPianoRollConfig({ showNoiseTexture: checked });
            }}
          />
        )}
      />
      {pianoRollConfig.showNoiseTexture && (
        <>
          <FormRow
            label={
              <span>
                Noise Intensity:{" "}
                {Math.round(pianoRollConfig.noiseIntensity * 100)}%
              </span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[pianoRollConfig.noiseIntensity]}
                className="w-full max-w-48 min-w-24"
                min={0.01}
                max={0.5}
                step={0.01}
                onValueChange={([value]) => {
                  setPianoRollConfig({ noiseIntensity: value });
                }}
              />
            )}
          />
          <FormRow
            label={
              <span>Noise Grain Size: {pianoRollConfig.noiseGrainSize}px</span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[pianoRollConfig.noiseGrainSize]}
                className="w-full max-w-48 min-w-24"
                min={1}
                max={16}
                step={1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ noiseGrainSize: value });
                }}
              />
            )}
          />
          <FormRow
            label={
              <span>
                Noise Color Variance: {pianoRollConfig.noiseColorVariance}
              </span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                value={[pianoRollConfig.noiseColorVariance]}
                className="w-full max-w-48 min-w-24"
                min={1}
                max={100}
                step={1}
                onValueChange={([value]) => {
                  setPianoRollConfig({ noiseColorVariance: value });
                }}
              />
            )}
          />
        </>
      )}
    </>
  );
}
