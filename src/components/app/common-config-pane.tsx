import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CircleXIcon, Info } from "lucide-react";
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
} from "@/lib/renderers";
import { CollapsibleCardPane, FormRow } from "@/components/common";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { DeepPartial } from "@/lib/type-utils";
import { ToggleTheme } from "@/components/app";
import { Slider } from "@/components/ui/slider";

interface Props {
  rendererConfig: RendererConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  midiFilename?: string;
  onChangeMidiFile: (file: File | undefined) => void;
  audioFilename?: string;
  onChangeAudioFile: (file: File | undefined) => void;
  backgroundImageFilename?: string;
  onChangeBackgroundImage: (file: File | undefined) => void;
}

export const CommonConfigPane = memo(function CommonConfigPane({
  rendererConfig,
  onUpdateRendererConfig,
  midiFilename,
  onChangeMidiFile,
  audioFilename,
  onChangeAudioFile,
  backgroundImageFilename,
  onChangeBackgroundImage,
}: Props) {
  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CollapsibleCardPane header={<h2>MIDI / Audio Settings</h2>}>
        <CardContent className="grid grid-cols-1 gap-2">
          <FileButton
            filename={midiFilename}
            setFile={onChangeMidiFile}
            accept=".mid,.midi"
            placeholder="Choose MIDI file"
          >
            Open MIDI file
          </FileButton>
          <FileButton
            filename={audioFilename}
            setFile={onChangeAudioFile}
            accept="audio/*"
            placeholder="Choose audio file"
          >
            Open Audio file
          </FileButton>
        </CardContent>
      </CollapsibleCardPane>

      <CollapsibleCardPane header={<h2>Common settings</h2>}>
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
            placeholder="Can set background image"
          >
            Open Background Image
          </FileButton>
          {backgroundImageFilename && (
            <>
              <FormRow
                label={<span>Image Fit</span>}
                controller={
                  <Select
                    value={rendererConfig.backgroundImageFit}
                    onValueChange={(value: "cover" | "contain") =>
                      onUpdateRendererConfig({ backgroundImageFit: value })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select image fit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="contain">Contain</SelectItem>
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
                      value:
                        | "top-left"
                        | "top"
                        | "top-right"
                        | "left"
                        | "center"
                        | "right"
                        | "bottom-left"
                        | "bottom"
                        | "bottom-right",
                    ) =>
                      onUpdateRendererConfig({ backgroundImagePosition: value })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select image position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
              <FormRow
                label={<span>Image Repeat</span>}
                controller={
                  <Select
                    value={rendererConfig.backgroundImageRepeat}
                    onValueChange={(
                      value: "repeat" | "no-repeat" | "repeat-x" | "repeat-y",
                    ) =>
                      onUpdateRendererConfig({ backgroundImageRepeat: value })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select image repeat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-repeat">No Repeat</SelectItem>
                      <SelectItem value="repeat">Repeat</SelectItem>
                      <SelectItem value="repeat-x">Repeat X</SelectItem>
                      <SelectItem value="repeat-y">Repeat Y</SelectItem>
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
                controller={
                  <Slider
                    className="w-full min-w-24"
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
                }
              />
            </>
          )}
          <FormRow
            label={
              <span className="inline-flex items-center gap-2">
                Resolution
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Only aspect ratio is reflected in preview</p>
                  </TooltipContent>
                </Tooltip>
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
            label={<span>FPS</span>}
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
      </CollapsibleCardPane>
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

function FileButton({
  filename,
  setFile,
  accept,
  children,
  placeholder = "Select file",
}: {
  filename: string | undefined;
  setFile: (file: File | undefined) => void;
  accept: string;
  children: React.ReactNode;
  placeholder?: string;
}) {
  const onChangeFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const file = e.target.files?.[0];
      if (!file) return;
      setFile(file);
      e.currentTarget.value = "";
    },
    [setFile],
  );
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center overflow-hidden">
        {filename ? (
          <>
            <Button
              variant="icon"
              size="icon"
              onClick={() => setFile(undefined)}
              aria-label="Cancel"
              className="mr-2 w-auto justify-start p-1"
            >
              <CircleXIcon />
            </Button>
            <span className="flex-1 truncate">{filename}</span>
          </>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </span>

      <Button
        size="default"
        variant="default"
        className="flex-none cursor-pointer"
        asChild
      >
        <label>
          <input
            type="file"
            accept={accept}
            onChange={onChangeFile}
            className="hidden"
          />
          {children}
        </label>
      </Button>
    </div>
  );
}
