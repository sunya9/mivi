import { Slider } from "@/components/ui/slider";

type Props = Omit<React.ComponentProps<typeof Slider>, "className" | "labelClassName"> & {
  label: React.ReactNode;
};

export function SliderRow({ controlClassName = "w-24", ...props }: Props) {
  return (
    <Slider
      className="flex items-center justify-between"
      labelClassName="flex-1"
      controlClassName={controlClassName}
      {...props}
    />
  );
}
