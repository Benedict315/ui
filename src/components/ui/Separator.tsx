export function Separator({ className }: { className?: string }) {
  return <div className={`h-px bg-[#2a2a2a] w-full ${className ?? ""}`} />;
}
