import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { HSL_PRESETS, HSLPresetBase, hslToHex } from "@/lib/colors/hsl";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (saturation: number, lightness: number) => void;
}

interface HueRandomizeSL {
  s: number;
  l: number;
}

export function HueRandomizeDialog({ open, onOpenChange, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Content onOpenChange={onOpenChange} onConfirm={onConfirm} />
      </DialogContent>
    </Dialog>
  );
}

function Content({
  onOpenChange,
  onConfirm,
}: {
  onOpenChange: (open: boolean) => void;
  onConfirm: (saturation: number, lightness: number) => void;
}) {
  const [savedSL, setSavedSL] = useLocalStorage<HueRandomizeSL>(
    "mivi:hue-randomize-sl",
  );
  const [saturation, setSaturation] = useState(savedSL?.s ?? 100);
  const [lightness, setLightness] = useState(savedSL?.l ?? 50);

  const handleConfirm = useCallback(() => {
    onConfirm(saturation, lightness);
    setSavedSL({ s: saturation, l: lightness });
    onOpenChange(false);
  }, [onConfirm, saturation, lightness, setSavedSL, onOpenChange]);

  const previewColors = useMemo(() => {
    const hues = [0, 45, 90, 135, 180, 225, 270, 315];
    return hues.map((h) => hslToHex(h, saturation, lightness));
  }, [saturation, lightness]);

  const handlePresetClick = useCallback((preset: HSLPresetBase) => {
    setSaturation(preset.s);
    setLightness(preset.l);
  }, []);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Randomize Hue</DialogTitle>
        <DialogDescription>
          Set saturation and lightness for random hue colors
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Preview swatches */}
        <div className="flex justify-center gap-2">
          {previewColors.map((color, i) => (
            <div
              key={i}
              className="border-input size-10 rounded-md border shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Saturation slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label id="saturation-label">Saturation</label>
            <span className="text-muted-foreground">{saturation}%</span>
          </div>
          <Slider
            value={[saturation]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => setSaturation(value)}
            aria-labelledby="saturation-label"
          />
        </div>

        {/* Lightness slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label id="lightness-label">Lightness</label>
            <span className="text-muted-foreground">{lightness}%</span>
          </div>
          <Slider
            value={[lightness]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => setLightness(value)}
            aria-labelledby="lightness-label"
          />
        </div>

        {/* Preset buttons */}
        <div className="space-y-2">
          <div className="text-sm">Presets</div>
          <div className="inline-flex">
            {HSL_PRESETS.map((preset, index) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className={`capitalize ${
                  index === 0
                    ? "rounded-r-none"
                    : index === HSL_PRESETS.length - 1
                      ? "rounded-l-none border-l-0"
                      : "rounded-none border-l-0"
                }`}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleConfirm}>Apply</Button>
      </DialogFooter>
    </>
  );
}
