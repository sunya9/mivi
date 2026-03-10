import { useState, useCallback, useMemo, useId, useRef } from "react";
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
import { HSL_PRESETS, HSLPresetBase, hslToHex } from "@/lib/colors/color";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

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
      <DialogContent className="sm:max-w-md">
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
          {previewColors.map((color) => (
            <div
              key={color}
              className="size-10 rounded-md border border-input shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Preset buttons */}
        <div className="space-y-2">
          <div className="text-sm">Presets</div>
          <ButtonGroup>
            {HSL_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="capitalize"
              >
                {preset.name}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Saturation slider */}
        <ParamSlider
          value={saturation}
          min={0}
          max={100}
          step={1}
          onValueChange={setSaturation}
          label="Saturation"
        />

        {/* Lightness slider */}
        <ParamSlider
          value={lightness}
          min={0}
          max={100}
          step={1}
          onValueChange={setLightness}
          label="Lightness"
        />
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button onClick={handleConfirm}>Apply</Button>
      </DialogFooter>
    </>
  );
}

function ParamSlider({
  value,
  min,
  max,
  step,
  onValueChange,
  label,
  className,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  label: string;
  className?: string;
}) {
  const labelId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const handleClick = useCallback(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <div id={labelId} onClick={handleClick} tabIndex={-1}>
          {label}
        </div>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Slider
        ref={ref}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([value]) => onValueChange(value)}
        aria-labelledby={labelId}
      />
    </div>
  );
}
