import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { FormRow } from "@/components/common/form-row";
import { InfoTooltip } from "@/components/common/info-tooltip";
import { Separator } from "@/components/ui/separator";
import { DeepPartial } from "@/lib/type-utils";
import { ToggleTheme } from "@/components/app/toggle-theme";
import { Slider } from "@/components/ui/slider";
import { FileButton } from "@/components/common/file-button";
import { Switch } from "@/components/ui/switch";

interface Props {
  rendererConfig: RendererConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  audioFilename?: string;
  onChangeAudioFile: (file: File | undefined) => void;
  backgroundImageFilename?: string;
  onChangeBackgroundImage: (file: File | undefined) => void;
}

export const CommonConfigPane = memo(function CommonConfigPane({
  rendererConfig,
  onUpdateRendererConfig,
  audioFilename,
  onChangeAudioFile,
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
        <FileButton
          filename={audioFilename}
          setFile={onChangeAudioFile}
          accept="audio/*"
          placeholder="Choose Audio file"
          cancelLabel="Cancel audio file"
        />
      </CardContent>

      <CardHeader>
        <CardTitle>
          <h2>Common settings</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormRow
          label={<span>Background Color</span>}
          controller={
            <input
              type="color"
              value={rendererConfig.backgroundColor}
              className="cursor-pointer bg-transparent"
              onChange={(e) =>
                onUpdateRendererConfig({ backgroundColor: e.target.value })
              }
            />
          }
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
              controller={
                <Select
                  value={rendererConfig.backgroundImageFit}
                  onValueChange={(value: BackgroundImageFit) =>
                    onUpdateRendererConfig({ backgroundImageFit: value })
                  }
                >
                  <SelectTrigger className="w-48">
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
              }
            />
            <FormRow
              label={<span>Image Position</span>}
              controller={
                <Select
                  value={rendererConfig.backgroundImagePosition}
                  onValueChange={(
                    backgroundImagePosition: BackgroundImagePosition,
                  ) => onUpdateRendererConfig({ backgroundImagePosition })}
                >
                  <SelectTrigger className="w-48">
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
              }
            />
            <FormRow
              label={<span>Image Repeat</span>}
              controller={
                <Select
                  value={rendererConfig.backgroundImageRepeat}
                  onValueChange={(value: BackgroundImageRepeat) =>
                    onUpdateRendererConfig({ backgroundImageRepeat: value })
                  }
                >
                  <SelectTrigger className="w-48">
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
              }
            />
            <FormRow
              label={
                <span>
                  Image Opacity: {rendererConfig.backgroundImageOpacity}
                </span>
              }
              controller={({ id }) => (
                <Slider
                  className="w-full min-w-24"
                  min={0}
                  max={1}
                  step={0.01}
                  aria-labelledby={id}
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
          controller={
            <Select
              value={rendererConfig.resolution.label}
              onValueChange={(value) => {
                const resolution = resolutions.find((r) => r.label === value);
                onUpdateRendererConfig({ resolution });
              }}
            >
              <SelectTrigger className="w-48">
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
          }
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
          controller={
            <Select
              value={rendererConfig.fps.toString()}
              onValueChange={(value) => {
                const fps = +value as FPS;
                onUpdateRendererConfig({ fps });
              }}
            >
              <SelectTrigger className="w-48">
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
          }
        />
        <FormRow
          label={<span>Format</span>}
          controller={
            <Select
              value={rendererConfig.format}
              onValueChange={(value: VideoFormat) =>
                onUpdateRendererConfig({ format: value })
              }
            >
              <SelectTrigger>
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
          }
        />
      </CardContent>
      <Separator />
      <CardFooter className="text-muted-foreground mt-4 flex-wrap gap-2 text-sm">
        <p className="flex-none">
          Created by{" "}
          <Button variant="linkSmall" size="link" asChild>
            <a href="https://x.com/ephemeralMocha">@ephemeralMocha</a>
          </Button>
          .
        </p>
        <p>
          <Button variant="linkSmall" size="link" asChild>
            <a href="https://github.com/sunya9/mivi">Repository</a>
          </Button>
        </p>
        <p>
          <ToggleTheme />
        </p>
      </CardFooter>
    </Card>
  );
});
