import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#5645d4] text-white hover:bg-[#4534b3]",
  secondary:
    "bg-transparent text-[#ebebeb] border border-[#3d3d3d] hover:bg-[#1c1c1c]",
  ghost:
    "bg-transparent text-[#999999] hover:bg-[#1c1c1c] hover:text-[#ebebeb]",
  destructive:
    "bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)]",
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-3 text-[11px] gap-1.5",
  md: "h-8 px-3.5 text-[12px] gap-2",
  lg: "h-9 px-4 text-[13px] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      asChild,
      loading,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-md transition-colors cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5645d4]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";
