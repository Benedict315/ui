import { cn } from "@/lib/utils";
import { LabelledValue } from "./LabelledValue";

interface InfoCellProps {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  className?: string;
}

export function InfoCell({ className, ...rest }: InfoCellProps) {
  return <LabelledValue className={cn("px-6 py-4", className)} {...rest} />;
}
