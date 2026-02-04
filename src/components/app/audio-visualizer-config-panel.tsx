import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AudioVisualizerConfig,
  AudioVisualizerBarStyle,
  AudioVisualizerPosition,
  AudioVisualizerStyle,
  GradientDirection,
  RendererConfig,
} from "@/lib/renderers/renderer";
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
  audioVisualizerConfig: AudioVisualizerConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
}

const positionOptions: { value: AudioVisualizerPosition; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
];

const barStyleOptions: { value: AudioVisualizerBarStyle; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "sharp", label: "Sharp" },
];

const styleOptions: { value: AudioVisualizerStyle; label: string }[] = [
  { value: "none", label: "None" },
  { value: "bars", label: "Bars" },
  { value: "lineSpectrum", label: "Line Spectrum" },
  { value: "circular", label: "Circular" },
];

const gradientDirectionOptions: { value: GradientDirection; label: string }[] =
  [
    { value: "to-right", label: "→ Right" },
    { value: "to-bottom-right", label: "↘ Bottom Right" },
    { value: "to-bottom", label: "↓ Bottom" },
    { value: "to-bottom-left", label: "↙ Bottom Left" },
    { value: "to-left", label: "← Left" },
    { value: "to-top-left", label: "↖ Top Left" },
    { value: "to-top", label: "↑ Top" },
    { value: "to-top-right", label: "↗ Top Right" },
  ];

export function AudioVisualizerConfigPanel({
  audioVisualizerConfig,
  onUpdateRendererConfig,
}: Props) {
  const setConfig = useCallback(
    (config: DeepPartial<AudioVisualizerConfig>) =>
      onUpdateRendererConfig({ audioVisualizerConfig: config }),
    [onUpdateRendererConfig],
  );

  const isEnabled = audioVisualizerConfig.style !== "none";
  const isCircular = audioVisualizerConfig.style === "circular";
  const showBarSettings =
    audioVisualizerConfig.style === "bars" ||
    audioVisualizerConfig.style === "lineSpectrum" ||
    isCircular;
  const showLineSpectrumSettings =
    audioVisualizerConfig.style === "lineSpectrum";

  return (
    <>
      <FormRow
        label={<span>Style</span>}
        controller={({ id }) => (
          <Select
            value={audioVisualizerConfig.style}
            onValueChange={(value: AudioVisualizerStyle) =>
              setConfig({ style: value })
            }
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent align="end">
              {styleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {isEnabled && (
        <>
          <Separator />
          {/* Position Settings */}
          {!isCircular && (
            <FormRow
              label={<span>Position</span>}
              controller={({ id }) => (
                <Select
                  value={audioVisualizerConfig.position}
                  onValueChange={(value: AudioVisualizerPosition) =>
                    setConfig({ position: value })
                  }
                >
                  <SelectTrigger id={id}>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {positionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          <FormRow
            label={
              <span>
                {isCircular ? "Size" : "Height"}: {audioVisualizerConfig.height}
                %
              </span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                className="w-full max-w-48 min-w-24"
                value={[audioVisualizerConfig.height]}
                min={10}
                max={80}
                step={5}
                onValueChange={([value]) => setConfig({ height: value })}
              />
            )}
          />
          <FormRow
            label={<span>Mirror</span>}
            controller={({ id }) => (
              <Switch
                id={id}
                checked={audioVisualizerConfig.mirror}
                onCheckedChange={(checked) => setConfig({ mirror: checked })}
              />
            )}
          />
          {audioVisualizerConfig.mirror && (
            <FormRow
              label={
                <span>
                  Mirror Opacity:{" "}
                  {Math.round(audioVisualizerConfig.mirrorOpacity * 100)}%
                </span>
              }
              customControl
              controller={({ labelId, ref }) => (
                <Slider
                  ref={ref}
                  aria-labelledby={labelId}
                  className="w-full max-w-48 min-w-24"
                  value={[audioVisualizerConfig.mirrorOpacity]}
                  min={0.1}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) =>
                    setConfig({ mirrorOpacity: value })
                  }
                />
              )}
            />
          )}
          {showBarSettings && (
            <>
              <Separator />
              {/* Bar Settings */}
              <FormRow
                label={<span>Bar Count: {audioVisualizerConfig.barCount}</span>}
                customControl
                controller={({ labelId, ref }) => (
                  <Slider
                    ref={ref}
                    aria-labelledby={labelId}
                    className="w-full max-w-48 min-w-24"
                    value={[audioVisualizerConfig.barCount]}
                    min={16}
                    max={256}
                    step={8}
                    onValueChange={([value]) => setConfig({ barCount: value })}
                  />
                )}
              />
              {audioVisualizerConfig.style === "bars" && (
                <>
                  <FormRow
                    label={<span>Gap: {audioVisualizerConfig.barGap}%</span>}
                    customControl
                    controller={({ labelId, ref }) => (
                      <Slider
                        ref={ref}
                        aria-labelledby={labelId}
                        className="w-full max-w-48 min-w-24"
                        value={[audioVisualizerConfig.barGap]}
                        min={0}
                        max={80}
                        step={5}
                        onValueChange={([value]) =>
                          setConfig({ barGap: value })
                        }
                      />
                    )}
                  />
                  <FormRow
                    label={
                      <span>Padding: {audioVisualizerConfig.barPadding}%</span>
                    }
                    customControl
                    controller={({ labelId, ref }) => (
                      <Slider
                        ref={ref}
                        aria-labelledby={labelId}
                        className="w-full max-w-48 min-w-24"
                        value={[audioVisualizerConfig.barPadding]}
                        min={0}
                        max={40}
                        step={1}
                        onValueChange={([value]) =>
                          setConfig({ barPadding: value })
                        }
                      />
                    )}
                  />
                </>
              )}
              {(audioVisualizerConfig.style === "bars" ||
                audioVisualizerConfig.style === "circular") && (
                <>
                  <FormRow
                    label={<span>Bar Style</span>}
                    controller={({ id }) => (
                      <Select
                        value={audioVisualizerConfig.barStyle}
                        onValueChange={(value: AudioVisualizerBarStyle) =>
                          setConfig({ barStyle: value })
                        }
                      >
                        <SelectTrigger id={id}>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          {barStyleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormRow
                    label={
                      <span>
                        Min Height: {audioVisualizerConfig.barMinHeight}px
                      </span>
                    }
                    customControl
                    controller={({ labelId, ref }) => (
                      <Slider
                        ref={ref}
                        aria-labelledby={labelId}
                        className="w-full max-w-48 min-w-24"
                        value={[audioVisualizerConfig.barMinHeight]}
                        min={0}
                        max={10}
                        step={1}
                        onValueChange={([value]) =>
                          setConfig({ barMinHeight: value })
                        }
                      />
                    )}
                  />
                </>
              )}
            </>
          )}
          {showLineSpectrumSettings && (
            <>
              <Separator />
              {/* Line Spectrum Settings */}
              <FormRow
                label={
                  <span>
                    Smoothness:{" "}
                    {Math.round(
                      audioVisualizerConfig.lineSpectrumConfig.tension * 100,
                    )}
                    %
                  </span>
                }
                customControl
                controller={({ labelId, ref }) => (
                  <Slider
                    ref={ref}
                    aria-labelledby={labelId}
                    className="w-full max-w-48 min-w-24"
                    value={[audioVisualizerConfig.lineSpectrumConfig.tension]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={([value]) =>
                      setConfig({ lineSpectrumConfig: { tension: value } })
                    }
                  />
                )}
              />
              <FormRow
                label={<span>Stroke</span>}
                controller={({ id }) => (
                  <Switch
                    id={id}
                    checked={audioVisualizerConfig.lineSpectrumConfig.stroke}
                    onCheckedChange={(checked) =>
                      setConfig({ lineSpectrumConfig: { stroke: checked } })
                    }
                  />
                )}
              />
              {audioVisualizerConfig.lineSpectrumConfig.stroke && (
                <>
                  <FormRow
                    label={<span>Stroke Color</span>}
                    controller={({ id }) => (
                      <ColorPickerInput
                        id={id}
                        aria-label="Stroke Color"
                        value={
                          audioVisualizerConfig.lineSpectrumConfig.strokeColor
                        }
                        onChange={(value) =>
                          setConfig({
                            lineSpectrumConfig: { strokeColor: value },
                          })
                        }
                      />
                    )}
                  />
                  <FormRow
                    label={
                      <span>
                        Line Width:{" "}
                        {audioVisualizerConfig.lineSpectrumConfig.lineWidth}px
                      </span>
                    }
                    customControl
                    controller={({ labelId, ref }) => (
                      <Slider
                        ref={ref}
                        aria-labelledby={labelId}
                        className="w-full max-w-48 min-w-24"
                        value={[
                          audioVisualizerConfig.lineSpectrumConfig.lineWidth,
                        ]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={([value]) =>
                          setConfig({
                            lineSpectrumConfig: { lineWidth: value },
                          })
                        }
                      />
                    )}
                  />
                  <FormRow
                    label={
                      <span>
                        Stroke Opacity:{" "}
                        {Math.round(
                          audioVisualizerConfig.lineSpectrumConfig
                            .strokeOpacity * 100,
                        )}
                        %
                      </span>
                    }
                    customControl
                    controller={({ labelId, ref }) => (
                      <Slider
                        ref={ref}
                        aria-labelledby={labelId}
                        className="w-full max-w-48 min-w-24"
                        value={[
                          audioVisualizerConfig.lineSpectrumConfig
                            .strokeOpacity,
                        ]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={([value]) =>
                          setConfig({
                            lineSpectrumConfig: { strokeOpacity: value },
                          })
                        }
                      />
                    )}
                  />
                </>
              )}
              <FormRow
                label={<span>Fill</span>}
                controller={({ id }) => (
                  <Switch
                    id={id}
                    checked={audioVisualizerConfig.lineSpectrumConfig.fill}
                    onCheckedChange={(checked) =>
                      setConfig({ lineSpectrumConfig: { fill: checked } })
                    }
                  />
                )}
              />
              {audioVisualizerConfig.lineSpectrumConfig.fill && (
                <FormRow
                  label={
                    <span>
                      Fill Opacity:{" "}
                      {Math.round(
                        audioVisualizerConfig.lineSpectrumConfig.fillOpacity *
                          100,
                      )}
                      %
                    </span>
                  }
                  customControl
                  controller={({ labelId, ref }) => (
                    <Slider
                      ref={ref}
                      aria-labelledby={labelId}
                      className="w-full max-w-48 min-w-24"
                      value={[
                        audioVisualizerConfig.lineSpectrumConfig.fillOpacity,
                      ]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={([value]) =>
                        setConfig({
                          lineSpectrumConfig: { fillOpacity: value },
                        })
                      }
                    />
                  )}
                />
              )}
            </>
          )}
          <Separator />
          {/* Color Settings */}
          <FormRow
            label={<span>Use Gradient</span>}
            controller={({ id }) => (
              <Switch
                id={id}
                checked={audioVisualizerConfig.useGradient}
                onCheckedChange={(checked) =>
                  setConfig({ useGradient: checked })
                }
              />
            )}
          />
          {audioVisualizerConfig.useGradient ? (
            <>
              {!isCircular && (
                <FormRow
                  label={<span>Gradient Direction</span>}
                  controller={({ id }) => (
                    <Select
                      value={audioVisualizerConfig.gradientDirection}
                      onValueChange={(value: GradientDirection) =>
                        setConfig({ gradientDirection: value })
                      }
                    >
                      <SelectTrigger id={id}>
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {gradientDirectionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              <FormRow
                label={<span>Gradient Start Color</span>}
                controller={({ id }) => (
                  <ColorPickerInput
                    id={id}
                    aria-label="Gradient Start Color"
                    value={audioVisualizerConfig.gradientStartColor}
                    onChange={(value) =>
                      setConfig({ gradientStartColor: value })
                    }
                  />
                )}
              />
              <FormRow
                label={<span>Gradient End Color</span>}
                controller={({ id }) => (
                  <ColorPickerInput
                    id={id}
                    aria-label="Gradient End Color"
                    value={audioVisualizerConfig.gradientEndColor}
                    onChange={(value) => setConfig({ gradientEndColor: value })}
                  />
                )}
              />
            </>
          ) : (
            <FormRow
              label={<span>Color</span>}
              controller={({ id }) => (
                <ColorPickerInput
                  id={id}
                  aria-label="Color"
                  value={audioVisualizerConfig.singleColor}
                  onChange={(value) => setConfig({ singleColor: value })}
                />
              )}
            />
          )}
          <FormRow
            label={
              <span>
                Opacity: {Math.round(audioVisualizerConfig.barOpacity * 100)}%
              </span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                className="w-full max-w-48 min-w-24"
                value={[audioVisualizerConfig.barOpacity]}
                min={0.1}
                max={1}
                step={0.05}
                onValueChange={([value]) => setConfig({ barOpacity: value })}
              />
            )}
          />
          <Separator />
          {/* Analyzer Settings */}
          <FormRow
            label={
              <span>
                Frequency Range: {audioVisualizerConfig.minFrequency}Hz -{" "}
                {audioVisualizerConfig.maxFrequency}Hz
              </span>
            }
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                className="w-full max-w-48 min-w-24"
                value={[
                  audioVisualizerConfig.minFrequency,
                  audioVisualizerConfig.maxFrequency,
                ]}
                min={20}
                max={20000}
                step={100}
                onValueChange={([min, max]) =>
                  setConfig({ minFrequency: min, maxFrequency: max })
                }
              />
            )}
          />
        </>
      )}
    </>
  );
}
