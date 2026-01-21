import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  resolutions,
  FPS,
  fpsOptions,
  formatOptions,
  VideoFormat,
  RendererConfig,
  BackgroundImagePosition,
  backgroundImagePositions,
  BackgroundImageRepeat,
  backgroundImageRepeats,
  BackgroundImageFit,
  backgroundImageFitOptions,
} from "@/lib/renderers/renderer";
import { ColorPickerButton } from "@/components/common/color-picker-button";
import { FormRow } from "@/components/common/form-row";
import { InfoTooltip } from "@/components/common/info-tooltip";
import { DeepPartial } from "@/lib/type-utils";
import { Slider } from "@/components/ui/slider";
import { FileButton } from "@/components/common/file-button";
import { Switch } from "@/components/ui/switch";

interface Props {
  rendererConfig: RendererConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  audioFilename?: string;
  onChangeAudioFile: (file: File | undefined) => void;
  isAudioDecoding?: boolean;
  onCancelAudioDecode?: () => void;
  backgroundImageFilename?: string;
  onChangeBackgroundImage: (file: File | undefined) => void;
}

export const CommonConfigPane = memo(function CommonConfigPane({
  rendererConfig,
  onUpdateRendererConfig,
  audioFilename,
  onChangeAudioFile,
  isAudioDecoding,
  onCancelAudioDecode,
  backgroundImageFilename,
  onChangeBackgroundImage,
}: Props) {
  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>
          <h2>Audio Settings</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2">
        <div className="relative">
          <FileButton
            filename={audioFilename}
            setFile={onChangeAudioFile}
            accept="audio/*"
            placeholder="Choose Audio file"
            cancelLabel="Cancel audio file"
            loading={isAudioDecoding}
            onCancel={onCancelAudioDecode}
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
            <ColorPickerButton
              id={id}
              value={rendererConfig.backgroundColor}
              onChange={(value) =>
                onUpdateRendererConfig({ backgroundColor: value })
              }
            />
          )}
        />
        <FileButton
          filename={backgroundImageFilename}
          setFile={onChangeBackgroundImage}
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
                  onValueChange={(value: BackgroundImageFit) =>
                    onUpdateRendererConfig({ backgroundImageFit: value })
                  }
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
                  onValueChange={(
                    backgroundImagePosition: BackgroundImagePosition,
                  ) => onUpdateRendererConfig({ backgroundImagePosition })}
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
                  onValueChange={(value: BackgroundImageRepeat) =>
                    onUpdateRendererConfig({ backgroundImageRepeat: value })
                  }
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
              label={
                <span>
                  Image Opacity: {rendererConfig.backgroundImageOpacity}
                </span>
              }
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
          label={
            <span className="inline-flex items-center gap-2">
              Resolution
              <InfoTooltip>
                <p>Only aspect ratio is reflected in preview</p>
              </InfoTooltip>
            </span>
          }
          controller={({ id }) => (
            <Select
              value={rendererConfig.resolution.label}
              onValueChange={(value) => {
                const resolution = resolutions.find((r) => r.label === value);
                onUpdateRendererConfig({ resolution });
              }}
            >
              <SelectTrigger id={id} className="w-48">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                {resolutions.map((resolution) => (
                  <SelectItem key={resolution.label} value={resolution.label}>
                    {resolution.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormRow
          label={
            <span className="inline-flex items-center gap-2">
              FPS
              <InfoTooltip>
                <p>Not reflected in preview</p>
              </InfoTooltip>
            </span>
          }
          controller={({ id }) => (
            <Select
              value={rendererConfig.fps.toString()}
              onValueChange={(value) => {
                const fps = +value as FPS;
                onUpdateRendererConfig({ fps });
              }}
            >
              <SelectTrigger id={id} className="w-48">
                <SelectValue placeholder="Select frame rate" />
              </SelectTrigger>
              <SelectContent>
                {fpsOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
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
              onValueChange={(value: VideoFormat) =>
                onUpdateRendererConfig({ format: value })
              }
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
      </CardContent>
    </Card>
  );
});
