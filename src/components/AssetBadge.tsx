import type { Balance } from "@/lib/client";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils";

const PALETTE = [
  { bg: "bg-success-dim-strong", text: "text-green" },                      // 0: USDT (hash % 10 = 0)
  { bg: "bg-[rgba(20,184,166,0.12)]", text: "text-teal" },                  // 1: XLM (hash % 10 = 1)
  { bg: "bg-error-dim", text: "text-red" },                                  // 2: Red
  { bg: "bg-[rgba(86,69,212,0.12)]", text: "text-brand" },                  // 3: USDC (hash % 10 = 3)
  { bg: "bg-[rgba(236,72,153,0.12)]", text: "text-[rgb(236,72,153)]" },      // 4: Pink
  { bg: "bg-[rgba(168,85,247,0.12)]", text: "text-purple" },                 // 5: ETH / WAVEX (hash % 10 = 5)
  { bg: "bg-[rgba(6,182,212,0.12)]", text: "text-[rgb(6,182,212)]" },        // 6: Cyan
  { bg: "bg-[rgba(249,115,22,0.12)]", text: "text-orange" },                 // 7: BTC (hash % 10 = 7)
  { bg: "bg-[rgba(234,179,8,0.12)]", text: "text-[rgb(234,179,8)]" },        // 8: Yellow
  { bg: "bg-[rgba(99,102,241,0.12)]", text: "text-[rgb(99,102,241)]" },      // 9: Indigo
];

function getAssetColor(code: string) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 10;
  return PALETTE[index];
}

interface AssetBadgeProps {
  balance: Balance;
  showIssuer?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AssetBadge({
  balance,
  showIssuer = true,
  size = "md",
  className,
}: AssetBadgeProps) {
  const code =
    balance.assetType === "native"
      ? "XLM"
      : (balance.assetCode ?? balance.asset);
  const { bg, text } = getAssetColor(code);

  const iconSize =
    size === "sm"
      ? "w-6 h-6 text-[9px]"
      : size === "lg"
        ? "w-10 h-10 text-[13px]"
        : "w-8 h-8 text-[11px]";
  const labelSize =
    size === "sm"
      ? "text-[11px]"
      : size === "lg"
        ? "text-[14px]"
        : "text-[13px]";
  const subSize = size === "sm" ? "text-[10px]" : "text-[11px]";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold shrink-0",
          iconSize,
          "text-center leading-none",
          bg,
          text,
        )}
      >
        {code.slice(0, 2)}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className={cn("font-medium text-ink leading-none", labelSize)}>
          {code}
        </span>
        {showIssuer &&
          (balance.assetType === "native" ? (
            <span className={cn("text-ink-3", subSize)}>Stellar Lumens</span>
          ) : balance.assetIssuer ? (
            <span data-address className={subSize}>
              {truncateAddress(balance.assetIssuer, 6, 4)}
            </span>
          ) : null)}
      </div>
    </div>
  );
}

/** Inline pill version — just the code with colored dot */
export function AssetPill({
  assetCode,
  className,
}: {
  assetCode: string;
  className?: string;
}) {
  const { bg, text } = getAssetColor(assetCode);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border border-line-2",
        bg,
        text,
        className,
      )}
    >
      {assetCode}
    </span>
  );
}
