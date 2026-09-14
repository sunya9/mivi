import { Fieldset } from "@base-ui/react/fieldset";
import { memo, useRef } from "react";

import { CustomResolutionFields } from "@/components/app/custom-resolution-fields";
import {
  fpsOptions,
  formatOptions,
  getBackgroundImagePositionOptions,
  getBackgroundImageRepeatOptions,
  getBackgroundImageFitOptions,
  getAudioVisualizerLayerOptions,
} from "@/components/app/renderer-options";
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
import { useRendererConfig, useUpdateRendererConfig } from "@/hooks/use-renderer-config";
import { useAudio } from "@/lib/audio/use-audio";
import { useBackgroundImage } from "@/lib/background-image/use-background-image";
import { useMessages } from "@/lib/locale/use-messages";
import {
  createCustomResolution,
  CUSTOM_RESOLUTION_LABEL,
  isCustomResolution,
  type ResolutionGroup,
  resolutionGroups,
  resolutions,
} from "@/lib/muxer/resolution";
import type { FPS } from "@/lib/muxer/video-format";
import { RendererConfig } from "@/lib/renderers/renderer-config";
import { shallowEqual } from "@/lib/store/observable-store";

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
  const m = useMessages();
  const rendererConfig = useRendererConfig(selectCommonConfig, shallowEqual);
  const backgroundImageFitOptions = getBackgroundImageFitOptions();
  const backgroundImagePositions = getBackgroundImagePositionOptions();
  const backgroundImageRepeats = getBackgroundImageRepeatOptions();
  const audioVisualizerLayerOptions = getAudioVisualizerLayerOptions();
  const resolutionGroupLabels: Record<ResolutionGroup["key"], string> = {
    landscape: m.resolution_group_landscape(),
    portrait: m.resolution_group_portrait(),
    square: m.resolution_group_square(),
  };
  const resolutionItems = [
    ...resolutions.map(({ label }) => ({ value: label, label })),
    { value: CUSTOM_RESOLUTION_LABEL, label: m.resolution_custom() },
  ];
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
          <h2>{m.audio_settings_heading()}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2">
        <div className="relative">
          <FileButton
            filename={audioFile?.name}
            setFile={setAudioFile}
            accept="audio/*"
            label={m.audio_file_label()}
            placeholder={m.audio_file_choose()}
            cancelLabel={m.audio_file_cancel()}
            loading={isDecoding}
            onCancel={cancelDecode}
          />
        </div>
      </CardContent>

      <CardHeader>
        <CardTitle>
          <h2>{m.common_settings_heading()}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormRow
          label={<span>{m.background_color()}</span>}
          controller={({ id }) => (
            <ColorPickerInput
              id={id}
              value={rendererConfig.backgroundColor}
              onChange={(value) => onUpdateRendererConfig({ backgroundColor: value })}
            />
          )}
        />
        <FormRow
          label={<span>{m.show_background_image()}</span>}
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
            label={m.background_image_label()}
            placeholder={m.background_image_choose()}
            cancelLabel={m.background_image_cancel()}
          />
        )}
        {rendererConfig.backgroundImageEnabled && backgroundImageFilename && (
          <>
            <SelectRow
              label={<span>{m.image_fit()}</span>}
              value={rendererConfig.backgroundImageFit}
              onValueChange={(value) =>
                onUpdateRendererConfig({
                  backgroundImageFit: value ?? undefined,
                })
              }
              items={backgroundImageFitOptions}
              placeholder={m.image_fit_placeholder()}
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
              label={<span>{m.image_position()}</span>}
              value={rendererConfig.backgroundImagePosition}
              onValueChange={(value) =>
                onUpdateRendererConfig({
                  backgroundImagePosition: value ?? undefined,
                })
              }
              items={backgroundImagePositions}
              placeholder={m.image_position_placeholder()}
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
              label={<span>{m.image_repeat()}</span>}
              value={rendererConfig.backgroundImageRepeat}
              onValueChange={(value) =>
                onUpdateRendererConfig({
                  backgroundImageRepeat: value ?? undefined,
                })
              }
              items={backgroundImageRepeats}
              placeholder={m.image_repeat_placeholder()}
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
              label={
                <span>{m.image_opacity({ value: rendererConfig.backgroundImageOpacity })}</span>
              }
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
          label={m.resolution()}
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
          placeholder={m.resolution_placeholder()}
        >
          <SelectContent finalFocus={focusAfterResolutionClose}>
            {resolutionGroups.map((group) => (
              <SelectGroup key={group.key}>
                <SelectLabel>{resolutionGroupLabels[group.key]}</SelectLabel>
                {group.resolutions.map((resolution) => (
                  <SelectItem key={resolution.label} value={resolution.label}>
                    {resolution.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
            <SelectSeparator />
            <SelectGroup>
              <SelectItem value={CUSTOM_RESOLUTION_LABEL}>{m.resolution_custom()}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectRow>
        {isCustomResolution(rendererConfig.resolution) && (
          <Fieldset.Root className="flex items-center justify-between">
            <Fieldset.Legend className="flex-1">{m.resolution_custom_size()}</Fieldset.Legend>
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
          label={<span>{m.fps()}</span>}
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
          placeholder={m.fps_placeholder()}
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
          label={<span>{m.video_format()}</span>}
          value={rendererConfig.format}
          onValueChange={(value) => onUpdateRendererConfig({ format: value ?? undefined })}
          items={formatOptions}
          placeholder={m.video_format_placeholder()}
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
          label={<span>{m.audio_visualizer_layer()}</span>}
          value={rendererConfig.audioVisualizerLayer}
          onValueChange={(value) =>
            onUpdateRendererConfig({
              audioVisualizerLayer: value ?? undefined,
            })
          }
          items={audioVisualizerLayerOptions}
          placeholder={m.audio_visualizer_layer_placeholder()}
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
