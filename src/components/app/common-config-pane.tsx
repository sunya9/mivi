import { memo, useRef } from "react";

import { CustomResolutionFields } from "@/components/app/custom-resolution-fields";
import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FileButton } from "@/components/common/file-button";
import { FormRow } from "@/components/common/form-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAudio } from "@/lib/audio/use-audio";
import { useBackgroundImage } from "@/lib/background-image/use-background-image";
import {
  createCustomResolution,
  CUSTOM_RESOLUTION_LABEL,
  isCustomResolution,
  resolutionGroups,
  resolutions,
  FPS,
  fpsOptions,
  formatOptions,
  backgroundImagePositions,
  backgroundImageRepeats,
  backgroundImageFitOptions,
  audioVisualizerLayerOptions,
  RendererConfig,
} from "@/lib/renderers/renderer";
import { useRendererConfig, useUpdateRendererConfig } from "@/lib/renderers/use-renderer-config";
import { shallowEqual } from "@/lib/store/observable-store";

const resolutionItems = [...resolutions, { label: CUSTOM_RESOLUTION_LABEL }].map(({ label }) => ({
  value: label,
  label,
}));

const selectCommonConfig = ({
  backgroundColor,
  backgroundImageEnabled,
  backgroundImageFit,
  backgroundImagePosition,
  backgroundImageRepeat,
  backgroundImageOpacity,
  resolution,
  customResolution,
  fps,
  format,
  audioVisualizerLayer,
}: RendererConfig) => ({
  backgroundColor,
  backgroundImageEnabled,
  backgroundImageFit,
  backgroundImagePosition,
  backgroundImageRepeat,
  backgroundImageOpacity,
  resolution,
  customResolution,
  fps,
  format,
  audioVisualizerLayer,
});

export const CommonConfigPane = memo(function CommonConfigPane() {
  const rendererConfig = useRendererConfig(selectCommonConfig, shallowEqual);
  const onUpdateRendererConfig = useUpdateRendererConfig();
  const { audioFile, setAudioFile, isDecoding, cancelDecode } = useAudio();
  const { backgroundImageFile, setBackgroundImageFile } = useBackgroundImage();
  const backgroundImageFilename = backgroundImageFile?.name;
  const customWidthInputRef = useRef<HTMLInputElement>(null);
  return (
    <Card variant="transparent">
      <CardHeader>
        <CardTitle>
          <h2>Audio Settings</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2">
        <div className="relative">
          <FileButton
            filename={audioFile?.name}
            setFile={setAudioFile}
            accept="audio/*"
            placeholder="Choose Audio file"
            cancelLabel="Cancel audio file"
            loading={isDecoding}
            onCancel={cancelDecode}
          />
        </div>
      </CardContent>

      <CardHeader>
        <CardTitle>
          <h2>Common settings</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormRow
          label={<span>Background Color</span>}
          controller={({ id }) => (
            <ColorPickerInput
              id={id}
              value={rendererConfig.backgroundColor}
              onChange={(value) => onUpdateRendererConfig({ backgroundColor: value })}
            />
          )}
        />
        <FileButton
          filename={backgroundImageFilename}
          setFile={setBackgroundImageFile}
          accept="image/*"
          placeholder="Choose Background Image"
          cancelLabel="Cancel background image"
        />
        {backgroundImageFilename && (
          <>
            <FormRow
              label={<span>Show Background Image</span>}
              controller={({ id }) => (
                <Switch
                  id={id}
                  checked={rendererConfig.backgroundImageEnabled}
                  onCheckedChange={(checked) =>
                    onUpdateRendererConfig({ backgroundImageEnabled: checked })
                  }
                />
              )}
            />
            <FormRow
              label={<span>Image Fit</span>}
              controller={({ id }) => (
                <Select
                  value={rendererConfig.backgroundImageFit}
                  onValueChange={(value) =>
                    onUpdateRendererConfig({
                      backgroundImageFit: value ?? undefined,
                    })
                  }
                  items={backgroundImageFitOptions}
                >
                  <SelectTrigger id={id} className="w-48">
                    <SelectValue placeholder="Select image fit" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundImageFitOptions.map((fit) => (
                      <SelectItem key={fit.value} value={fit.value}>
                        {fit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormRow
              label={<span>Image Position</span>}
              controller={({ id }) => (
                <Select
                  value={rendererConfig.backgroundImagePosition}
                  onValueChange={(value) =>
                    onUpdateRendererConfig({
                      backgroundImagePosition: value ?? undefined,
                    })
                  }
                  items={backgroundImagePositions}
                >
                  <SelectTrigger id={id} className="w-48">
                    <SelectValue placeholder="Select image position" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundImagePositions.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormRow
              label={<span>Image Repeat</span>}
              controller={({ id }) => (
                <Select
                  value={rendererConfig.backgroundImageRepeat}
                  onValueChange={(value) =>
                    onUpdateRendererConfig({
                      backgroundImageRepeat: value ?? undefined,
                    })
                  }
                  items={backgroundImageRepeats}
                >
                  <SelectTrigger id={id} className="w-48">
                    <SelectValue placeholder="Select image repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundImageRepeats.map((repeat) => (
                      <SelectItem key={repeat.value} value={repeat.value}>
                        {repeat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormRow
              label={<span>Image Opacity: {rendererConfig.backgroundImageOpacity}</span>}
              customControl
              controller={({ labelId, ref }) => (
                <Slider
                  ref={ref}
                  className="w-full min-w-24"
                  min={0}
                  max={1}
                  step={0.01}
                  aria-labelledby={labelId}
                  value={[rendererConfig.backgroundImageOpacity]}
                  onValueChange={([value]) =>
                    onUpdateRendererConfig({
                      backgroundImageOpacity: value,
                    })
                  }
                />
              )}
            />
          </>
        )}
        <FormRow
          label="Resolution"
          controller={({ id }) => (
            <Select
              value={rendererConfig.resolution.label}
              onValueChange={(value) => {
                if (value == null) return;
                if (value !== CUSTOM_RESOLUTION_LABEL) {
                  onUpdateRendererConfig({
                    resolution: resolutions.find((r) => r.label === value),
                  });
                  return;
                }
                const { resolution: current, customResolution } = rendererConfig;
                const resolution =
                  customResolution ?? createCustomResolution(current.width, current.height);
                onUpdateRendererConfig({ resolution, customResolution: resolution });
              }}
              items={resolutionItems}
            >
              <SelectTrigger id={id} className="w-48">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent finalFocus={() => customWidthInputRef.current ?? true}>
                {resolutionGroups.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.resolutions.map((resolution) => (
                      <SelectItem key={resolution.label} value={resolution.label}>
                        {resolution.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
                <SelectSeparator />
                <SelectGroup>
                  <SelectItem value={CUSTOM_RESOLUTION_LABEL}>{CUSTOM_RESOLUTION_LABEL}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {isCustomResolution(rendererConfig.resolution) && (
          <FormRow
            label={<span>Custom Size</span>}
            customControl
            controller={() => (
              <CustomResolutionFields
                widthInputRef={customWidthInputRef}
                resolution={rendererConfig.resolution}
                onChange={(resolution) =>
                  onUpdateRendererConfig({ resolution, customResolution: resolution })
                }
              />
            )}
          />
        )}
        <FormRow
          label={<span>FPS</span>}
          controller={({ id }) => (
            <Select
              value={rendererConfig.fps.toString()}
              onValueChange={(value) => {
                if (value == null) return;
                const fps = +value as FPS;
                onUpdateRendererConfig({ fps });
              }}
              items={fpsOptions.map((o) => ({
                value: o.value.toString(),
                label: o.label,
              }))}
            >
              <SelectTrigger id={id} className="w-48">
                <SelectValue placeholder="Select frame rate" />
              </SelectTrigger>
              <SelectContent>
                {fpsOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormRow
          label={<span>Format</span>}
          controller={({ id }) => (
            <Select
              value={rendererConfig.format}
              onValueChange={(value) => onUpdateRendererConfig({ format: value ?? undefined })}
              items={formatOptions}
            >
              <SelectTrigger id={id}>
                <SelectValue placeholder="Select video format" />
              </SelectTrigger>
              <SelectContent align="end">
                {formatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormRow
          label={<span>Audio Visualizer Layer</span>}
          controller={({ id }) => (
            <Select
              value={rendererConfig.audioVisualizerLayer}
              onValueChange={(value) =>
                onUpdateRendererConfig({
                  audioVisualizerLayer: value ?? undefined,
                })
              }
              items={audioVisualizerLayerOptions}
            >
              <SelectTrigger id={id}>
                <SelectValue placeholder="Select layer" />
              </SelectTrigger>
              <SelectContent align="end">
                {audioVisualizerLayerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </CardContent>
    </Card>
  );
});
