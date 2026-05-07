import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-medium text-[#999999]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-8 w-full rounded-md border bg-[#1c1c1c] px-3",
            "text-[12px] text-[#ebebeb] placeholder:text-[#555555]",
            "outline-none transition-colors",
            error
              ? "border-[rgba(239,68,68,0.5)] focus:border-[#ef4444] focus:ring-1 focus:ring-[rgba(239,68,68,0.2)]"
              : "border-[#2a2a2a] focus:border-[#3d3d3d] focus:ring-1 focus:ring-[rgba(86,69,212,0.3)]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />
        {error && <p className="text-[10px] text-[#ef4444]">{error}</p>}
        {hint && !error && <p className="text-[10px] text-[#555555]">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
