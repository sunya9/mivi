import { Fieldset } from "@base-ui/react/fieldset";
import { memo, useRef } from "react";

import { CustomResolutionFields } from "@/components/app/custom-resolution-fields";
import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FileButton } from "@/components/common/file-button";
import { FormRow } from "@/components/common/form-row";
import { SelectRow } from "@/components/common/select-row";
import { SliderRow } from "@/components/common/slider-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAudio } from "@/lib/audio/use-audio";
import { useBackgroundImage } from "@/lib/background-image/use-background-image";
import {
  FPS,
  fpsOptions,
  formatOptions,
  backgroundImagePositions,
  backgroundImageRepeats,
  backgroundImageFitOptions,
  audioVisualizerLayerOptions,
  RendererConfig,
} from "@/lib/renderers/renderer-config";
import {
  createCustomResolution,
  CUSTOM_RESOLUTION_LABEL,
  isCustomResolution,
  resolutionGroups,
  resolutions,
} from "@/lib/renderers/resolution";
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
  const focusCustomOnCloseRef = useRef(false);
  const focusAfterResolutionClose = () => {
    if (!focusCustomOnCloseRef.current) return true;
    focusCustomOnCloseRef.current = false;
    return customWidthInputRef.current ?? true;
  };
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
            label="Audio file"
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
        {rendererConfig.backgroundImageEnabled && (
          <FileButton
            filename={backgroundImageFilename}
            setFile={setBackgroundImageFile}
            accept="image/*"
            label="Background image"
            placeholder="Choose Background Image"
            cancelLabel="Cancel background image"
          />
        )}
        {rendererConfig.backgroundImageEnabled && backgroundImageFilename && (
          <>
            <SelectRow
              label={<span>Image Fit</span>}
              value={rendererConfig.backgroundImageFit}
              onValueChange={(value) =>
                onUpdateRendererConfig({
                  backgroundImageFit: value ?? undefined,
                })
              }
              items={backgroundImageFitOptions}
              placeholder="Select image fit"
            >
              <SelectContent>
                {backgroundImageFitOptions.map((fit) => (
                  <SelectItem key={fit.value} value={fit.value}>
                    {fit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRow>
            <SelectRow
              label={<span>Image Position</span>}
              value={rendererConfig.backgroundImagePosition}
              onValueChange={(value) =>
                onUpdateRendererConfig({
                  backgroundImagePosition: value ?? undefined,
                })
              }
              items={backgroundImagePositions}
              placeholder="Select image position"
            >
              <SelectContent>
                {backgroundImagePositions.map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRow>
            <SelectRow
              label={<span>Image Repeat</span>}
              value={rendererConfig.backgroundImageRepeat}
              onValueChange={(value) =>
                onUpdateRendererConfig({
                  backgroundImageRepeat: value ?? undefined,
                })
              }
              items={backgroundImageRepeats}
              placeholder="Select image repeat"
            >
              <SelectContent>
                {backgroundImageRepeats.map((repeat) => (
                  <SelectItem key={repeat.value} value={repeat.value}>
                    {repeat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRow>
            <SliderRow
              label={<span>Image Opacity: {rendererConfig.backgroundImageOpacity}</span>}
              min={0}
              max={1}
              step={0.01}
              value={[rendererConfig.backgroundImageOpacity]}
              onValueChange={([value]) =>
                onUpdateRendererConfig({
                  backgroundImageOpacity: value,
                })
              }
            />
          </>
        )}
        <SelectRow
          label="Resolution"
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
            focusCustomOnCloseRef.current = true;
          }}
          items={resolutionItems}
          placeholder="Select resolution"
        >
          <SelectContent finalFocus={focusAfterResolutionClose}>
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
        </SelectRow>
        {isCustomResolution(rendererConfig.resolution) && (
          <Fieldset.Root className="flex items-center justify-between">
            <Fieldset.Legend className="flex-1">Custom Size</Fieldset.Legend>
            <CustomResolutionFields
              widthInputRef={customWidthInputRef}
              resolution={rendererConfig.resolution}
              onChange={(resolution) =>
                onUpdateRendererConfig({ resolution, customResolution: resolution })
              }
            />
          </Fieldset.Root>
        )}
        <SelectRow
          label={<span>FPS</span>}
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
          placeholder="Select frame rate"
        >
          <SelectContent>
            {fpsOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRow>
        <SelectRow
          label={<span>Format</span>}
          value={rendererConfig.format}
          onValueChange={(value) => onUpdateRendererConfig({ format: value ?? undefined })}
          items={formatOptions}
          placeholder="Select video format"
        >
          <SelectContent align="end">
            {formatOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRow>
        <SelectRow
          label={<span>Audio Visualizer Layer</span>}
          value={rendererConfig.audioVisualizerLayer}
          onValueChange={(value) =>
            onUpdateRendererConfig({
              audioVisualizerLayer: value ?? undefined,
            })
          }
          items={audioVisualizerLayerOptions}
          placeholder="Select layer"
        >
          <SelectContent align="end">
            {audioVisualizerLayerOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRow>
      </CardContent>
    </Card>
  );
});
