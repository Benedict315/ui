import { forwardRef, useEffect,useId, useState } from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
  showToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, multiline, showToggle, ...props }, ref) => {
    const generatedId = useId();
    // Dev-mode warning for conflicting controlled/uncontrolled props
    if (import.meta.env.DEV) {
      if (Object.prototype.hasOwnProperty.call(props, "defaultValue") && Object.prototype.hasOwnProperty.call(props, "value")) {
        console.error(
          "[Input] Both `defaultValue` and `value` props were provided. Use either controlled (`value`) or uncontrolled (`defaultValue`) mode, not both."
        );
      }
    }
    const inputId = id ?? `${generatedId}-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = props.type === "password";
    const showToggleEnabled = showToggle ?? isPassword;
    const inputType = isPassword && showToggleEnabled ? (showPassword ? "text" : "password") : props.type;

    const [lastError, setLastError] = useState<string | undefined>(error);
    const [lastHint, setLastHint] = useState<string | undefined>(hint);

    useEffect(() => {
      if (error) {
        setLastError(error);
      }
    }, [error]);

    useEffect(() => {
      if (hint) {
        setLastHint(hint);
      }
    }, [hint]);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12px] font-medium text-ink-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {multiline ? (
            <textarea
              ref={ref as any}
              id={inputId}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
              }
              className={cn(
                "h-24 w-full rounded-lg border bg-surface-2 p-3",
                "text-[13px] text-ink placeholder:text-ink-4",
                "outline-none transition-colors",
                error
                  ? "border-error-dim-input focus:border-red focus:ring-1 ring-error-dim"
                  : "border-line focus:border-line-2 focus:ring-1 focus:ring-brand-dim",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                className,
              )}
              {...(props as any)}
            />
          ) : (
            <input
              ref={ref}
              id={inputId}
              type={inputType}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
              }
              className={cn(
                "h-9 w-full rounded-lg border bg-surface-2 px-3.5",
                "text-[13px] text-ink placeholder:text-ink-4",
                "outline-none transition-colors",
                error
                  ? "border-error-dim-input focus:border-red focus:ring-1 ring-error-dim"
                  : "border-line focus:border-line-2 focus:ring-1 focus:ring-brand-dim",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                className,
              )}
              {...props}
            />
          )}
          {showToggleEnabled && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-6"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        <div className="min-h-[18px] relative">
          <p
            id={`${inputId}-error`}
            className={cn(
              "absolute inset-x-0 top-0 text-[11px] text-red transition-opacity duration-150",
              error ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            {error || lastError || ""}
          </p>
          <p
            id={`${inputId}-hint`}
            className={cn(
              "absolute inset-x-0 top-0 text-[11px] text-ink-3 transition-opacity duration-150",
              !error && hint ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            {!error && hint ? hint : lastHint || ""}
          </p>
        </div>
      </div>
    );
  },
);
Input.displayName = "Input";
