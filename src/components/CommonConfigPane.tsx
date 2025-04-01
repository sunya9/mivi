import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CircleXIcon, Info } from "lucide-react";
import { FormRow } from "@/components/FormRow";
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
} from "@/types/renderer";
import { CollapsibleCardPane } from "@/components/CollapsibleCardPane";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { DeepPartial } from "@/types/util";
import { ToggleTheme } from "@/components/ToggleTheme";

interface Props {
  rendererConfig: RendererConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  midiFilename?: string;
  onChangeMidiFile: (file: File | undefined) => void;
  audioFilename?: string;
  onChangeAudioFile: (file: File | undefined) => void;
}

export const CommonConfigPane = React.memo(
  ({
    rendererConfig,
    onUpdateRendererConfig,
    midiFilename,
    onChangeMidiFile,
    audioFilename,
    onChangeAudioFile,
  }: Props) => {
    return (
      <Card className="border-0 bg-transparent shadow-none">
        <CollapsibleCardPane header={<h2>MIDI / Audio Settings</h2>}>
          <CardContent className="grid grid-cols-1 gap-2">
            <FileButton
              filename={midiFilename}
              setFile={onChangeMidiFile}
              accept=".mid,.midi"
            >
              Open MIDI file
            </FileButton>
            <FileButton
              filename={audioFilename}
              setFile={onChangeAudioFile}
              accept="audio/*"
            >
              Open Audio file
            </FileButton>
          </CardContent>
        </CollapsibleCardPane>

        <CollapsibleCardPane header={<h2>Common settings</h2>}>
          <CardContent className="space-y-4">
            <FormRow
              Label={() => <>Background Color</>}
              Controller={() => (
                <input
                  type="color"
                  value={rendererConfig.backgroundColor}
                  className="cursor-pointer bg-transparent"
                  onChange={(e) =>
                    onUpdateRendererConfig({ backgroundColor: e.target.value })
                  }
                />
              )}
            />
            <FormRow
              Label={() => (
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
              )}
              Controller={() => (
                <Select
                  value={`${rendererConfig.resolution.width}x${rendererConfig.resolution.height}`}
                  onValueChange={(value) => {
                    const [width, height] = value.split("x").map(Number);
                    const resolution = resolutions.find(
                      (r) => r.width === width && r.height === height,
                    );
                    if (resolution) {
                      onUpdateRendererConfig({ resolution });
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    {resolutions.map((resolution) => (
                      <SelectItem
                        key={resolution.label}
                        value={`${resolution.width}x${resolution.height}`}
                      >
                        {resolution.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormRow
              Label={() => (
                <span className="inline-flex items-center gap-2">
                  Frame Rate
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Not reflected in preview</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
              )}
              Controller={() => (
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
              )}
            />
            <FormRow
              Label={() => <>Export Format</>}
              Controller={() => (
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
              )}
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
  },
);

const FileButton = ({
  filename,
  setFile,
  accept,
  children,
}: {
  filename: string | undefined;
  setFile: (file: File | undefined) => void;
  accept: string;
  children: React.ReactNode;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center overflow-hidden">
        {filename && (
          <>
            <Button
              variant="icon"
              size="icon"
              onClick={() => setFile(undefined)}
            >
              <CircleXIcon />
            </Button>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {filename}
            </span>
          </>
        )}
      </span>
      <input
        type="file"
        accept={accept}
        onChange={async (e) => {
          e.preventDefault();
          const file = e.target.files?.[0];
          if (!file) return;
          setFile(file);
          e.currentTarget.value = "";
        }}
        ref={inputRef}
        className="hidden"
      />
      <Button
        size="default"
        variant="default"
        className="flex-none"
        onClick={() => inputRef.current?.click()}
      >
        {children}
      </Button>
    </div>
  );
};
