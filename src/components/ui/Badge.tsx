import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "primary"
  | "teal"
  | "purple";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[#1c1c1c] text-[#999999] border border-[#3d3d3d]",
  success:
    "bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]",
  warning:
    "bg-[rgba(249,115,22,0.1)] text-[#f97316] border border-[rgba(249,115,22,0.2)]",
  error:
    "bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]",
  primary:
    "bg-[rgba(86,69,212,0.15)] text-[#5645d4] border border-[rgba(86,69,212,0.25)]",
  teal: "bg-[rgba(20,184,166,0.1)] text-[#14b8a6] border border-[rgba(20,184,166,0.2)]",
  purple:
    "bg-[rgba(168,85,247,0.1)] text-[#a855f7] border border-[rgba(168,85,247,0.2)]",
};

const dots: Record<BadgeVariant, string> = {
  default: "bg-[#555555]",
  success: "bg-[#22c55e]",
  warning: "bg-[#f97316]",
  error: "bg-[#ef4444]",
  primary: "bg-[#5645d4]",
  teal: "bg-[#14b8a6]",
  purple: "bg-[#a855f7]",
};

export function Badge({
  variant = "default",
  dot,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dots[variant])}
        />
      )}
      {children}
    </span>
  );
}
