import { forwardRef, useState, useEffect, useRef } from "react";
import { forwardRef, cloneElement, isValidElement } from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  loading?: boolean;
  /** Makes the button square with no horizontal padding — use for icon-only buttons */
  iconOnly?: boolean;
  /** Requires a second click to confirm — renders confirmLabel on first click */
  requireConfirm?: boolean;
  /** Label shown on the first click when requireConfirm is true. Defaults to "Are you sure?" */
  confirmLabel?: string;
  requireConfirm?: boolean;
  confirmLabel?: string;
  confirmTimeout?: number;
}

// Hoisted outside the component so the objects are never recreated on render
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
      requireConfirm = false,
      confirmLabel,
      confirmTimeout = 3000,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const [isConfirming, setIsConfirming] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const [pendingConfirm, setPendingConfirm] = useState(false);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        if (requireConfirm && !pendingConfirm) {
          setPendingConfirm(true);
          return;
        }

        // Reset confirmation state and fire the real handler
        setPendingConfirm(false);
        onClick?.(e);
      },
      [disabled, loading, requireConfirm, pendingConfirm, onClick],
    );

    // Reset confirm state if the button loses focus while waiting for confirmation
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLButtonElement>) => {
        if (pendingConfirm) setPendingConfirm(false);
        props.onBlur?.(e);
      },
      [pendingConfirm, props],
    );

    const sizeClass = iconOnly ? iconOnlySizes[size] : sizes[size];
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (requireConfirm) {
        if (isConfirming) {
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setIsConfirming(false);
          onClick?.(e);
        } else {
          setIsConfirming(true);
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = window.setTimeout(() => {
            setIsConfirming(false);
          }, confirmTimeout);
        }
      } else {
        onClick?.(e);
      }
    };

    const displayLabel =
      requireConfirm && isConfirming && confirmLabel ? confirmLabel : children;
    if (asChild && isValidElement(children)) {
      const child = children as React.ReactElement;
      const childOnClick = child.props.onClick;
      const wrappedChildren = cloneElement(child, {
        onClick: (e: React.MouseEvent) => {
          if (disabled || loading) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          childOnClick?.(e);
        },
      });

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
            sizes[size],
            className,
          )}
          onClick={handleClick}
          {...props}
        >
          {wrappedChildren}
        </Comp>
      );
    }

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
          sizeClass,
          className,
        )}
        onClick={handleClick}
        onBlur={handleBlur}
        {...props}
      >
        {asChild ? (
          displayLabel
        ) : (
          <>
            {loading && (
              <>
                <span
                  aria-hidden="true"
                  className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin shrink-0"
                />
                <span className="sr-only">Loading</span>
              </>
            )}
            {displayLabel}
          </>
        {loading && (
          <span
            className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin shrink-0"
          >
            <span className="sr-only">Loading</span>
          </span>
        )}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";
