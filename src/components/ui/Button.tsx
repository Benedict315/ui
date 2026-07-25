import { Slot } from "@radix-ui/react-slot";
import { forwardRef, useState } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  loading?: boolean;
  /** Square button with no horizontal padding, sized for a single icon. */
  iconOnly?: boolean;
  /**
   * Require a two-click confirmation before `onClick` fires. The first click
   * swaps the label to `confirmLabel`; the second click (within the same
   * armed state) invokes `onClick`.
   */
  requireConfirm?: boolean;
  /** Label shown while the button is armed for confirmation. */
  confirmLabel?: string;
}

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "bg-transparent text-ink border border-line-2 hover:bg-surface-2",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink",
  destructive:
    "bg-error-dim text-red border border-error-dim-strong hover:bg-error-dim-hover",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-[12px] gap-1.5",
  md: "h-9 px-4 text-[13px] gap-2",
  lg: "h-10 px-5 text-[14px] gap-2",
};

const iconOnlySizes: Record<Size, string> = {
  sm: "h-8 w-8 text-[12px]",
  md: "h-9 w-9 text-[13px]",
  lg: "h-10 w-10 text-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      asChild,
      loading,
      iconOnly,
      requireConfirm,
      confirmLabel = "Are you sure?",
      className,
      disabled,
      children,
      onClick,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const [armed, setArmed] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // Two-step confirmation: first click arms, second click confirms.
      if (requireConfirm && !asChild && !armed) {
        e.preventDefault();
        setArmed(true);
        return;
      }
      setArmed(false);
      onClick?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
      // Reset the confirmation prompt when focus leaves the button.
      if (armed) setArmed(false);
      onBlur?.(e);
    };

    const spinner = (
      <>
        <span
          aria-hidden="true"
          className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin shrink-0"
        />
        <span className="sr-only">Loading</span>
      </>
    );

    const label = requireConfirm && armed ? confirmLabel : children;

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          variants[variant],
          iconOnly ? iconOnlySizes[size] : sizes[size],
          className,
        )}
        onClick={handleClick}
        onBlur={handleBlur}
        {...props}
      >
        {asChild ? (
          children
        ) : iconOnly ? (
          // Icon-only: the spinner replaces the icon entirely.
          loading ? spinner : children
        ) : (
          <>
            {/* Spinner occupies the leading icon slot so the label stays put. */}
            {loading && spinner}
            {label}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
