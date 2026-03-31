import * as React from "react";
import { Popover as RadixPopover, PopoverContent as RadixPopoverContent, PopoverTrigger as RadixPopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";

const Popover = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof RadixPopover>) => {
  return (
    <RadixPopover {...props}>
      {children}
    </RadixPopover>
  );
};

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof RadixPopoverTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixPopoverTrigger>
>(({ className, ...props }, ref) => (
  <RadixPopoverTrigger
    ref={ref}
    className={cn("focus:outline-none", className)}
    {...props}
  />
));

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof RadixPopoverContent>,
  React.ComponentPropsWithoutRef<typeof RadixPopoverContent>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <RadixPopoverContent
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md",
      "animate-in fade-in-0 zoom-in-95 slide-in-from-top-10",
      className
    )}
    {...props}
  />
));

export { Popover, PopoverTrigger, PopoverContent };