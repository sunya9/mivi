import { startTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CircleXIcon, Info } from "lucide-react";
import { midiAtom, midiFileAtom } from "@/atoms/midiAtom";
import { audioFileAtom, audioInfoAtom } from "@/atoms/playerAtom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { rendererConfigAtom } from "@/atoms/rendererConfigAtom";
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
} from "@/types/renderer";
import { CollapsibleCardPane } from "@/components/CollapsibleCardPane";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export function CommonConfigPane() {
  const midi = useAtomValue(midiFileAtom);
  const setMidi = useSetAtom(midiAtom);
  const audio = useAtomValue(audioFileAtom);
  const setAudio = useSetAtom(audioInfoAtom);
  const midiInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [rendererConfig, setRendererConfig] = useAtom(rendererConfigAtom);

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CollapsibleCardPane header={<h2>MIDI / Audio Settings</h2>}>
        <CardContent className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center">
              {midi && (
                <>
                  <Button
                    variant="icon"
                    size="icon"
                    onClick={() =>
                      startTransition(async () => {
                        await setMidi(undefined);
                      })
                    }
                  >
                    <CircleXIcon />
                  </Button>
                  {midi.name}
                </>
              )}
            </span>
            <input
              type="file"
              accept=".mid,.midi"
              onChange={async (e) => {
                e.preventDefault();
                const file = e.target.files?.[0];
                if (!file) return;
                startTransition(async () => {
                  await setMidi(file);
                });
                e.currentTarget.value = "";
              }}
              ref={midiInputRef}
              className="hidden"
            />
            <Button
              size="default"
              variant="default"
              onClick={() => midiInputRef.current?.click()}
            >
              Open MIDI file
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center">
              {audio && (
                <>
                  <Button
                    variant="icon"
                    size="icon"
                    onClick={() =>
                      startTransition(async () => {
                        await setAudio(undefined);
                      })
                    }
                  >
                    <CircleXIcon />
                  </Button>
                  {audio.name}
                </>
              )}
            </span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                e.preventDefault();
                const file = e.target.files?.[0];
                if (!file) return;
                startTransition(async () => {
                  await setAudio(file);
                });
                e.currentTarget.value = "";
              }}
              className="hidden"
              ref={audioInputRef}
            />
            <Button
              size="default"
              variant="default"
              onClick={() => audioInputRef.current?.click()}
            >
              Open Audio file
            </Button>
          </div>
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
                  setRendererConfig({ backgroundColor: e.target.value })
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
                    setRendererConfig({ resolution });
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
                  setRendererConfig({ fps });
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
                  setRendererConfig({ format: value })
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
      <CardFooter className="text-muted-foreground mt-4 gap-2 text-sm">
        <p>
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
      </CardFooter>
    </Card>
  );
}
