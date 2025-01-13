import { cn } from "@/lib/utils";
import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

const Toolbar = React.forwardRef<
  React.ComponentRef<typeof ToolbarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Root
    className={cn(
      "flex w-full min-w-max rounded-md bg-toolbar p-2.5 text-toolbar-foreground",
      className,
    )}
    ref={ref}
    {...props}
  />
));

Toolbar.displayName = ToolbarPrimitive.Root.displayName;

const toolbarButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      size: {
        default: "h-10 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ToolbarButtonProps
  extends React.ComponentProps<typeof ToolbarPrimitive.Button>,
    VariantProps<typeof toolbarButtonVariants> {}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <ToolbarPrimitive.Button
      className={cn(toolbarButtonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);

ToolbarButton.displayName = ToolbarPrimitive.Button.displayName;

const ToolbarSeparator = React.forwardRef<
  React.ComponentRef<typeof ToolbarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Separator
    ref={ref}
    className={cn("bg-mauve6 mx-2.5 w-px", className)}
    {...props}
  />
));

ToolbarSeparator.displayName = ToolbarPrimitive.Separator.displayName;

export { Toolbar, ToolbarButton, ToolbarSeparator };
