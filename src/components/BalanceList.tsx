import { useState } from "react";
import { AssetBadge } from "@/components/AssetBadge";
import { Badge } from "@/components/ui/Badge";
import { AssetRowSkeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { useSorokit } from "@/context/useSorokit";
import type { Balance } from "@/lib/client";
import { cn } from "@/lib/utils";

type SortMode = "default" | "balance-desc" | "alpha";

function getAssetCode(balance: Balance) {
  return balance.assetType === "native" ? "XLM" : balance.assetCode ?? balance.asset;
}

function compareBalances(a: Balance, b: Balance) {
  const aIsXlm = a.assetType === "native";
  const bIsXlm = b.assetType === "native";
  if (aIsXlm !== bIsXlm) {
    return aIsXlm ? -1 : 1;
  }

  const aZero = Number(a.balance) === 0;
  const bZero = Number(b.balance) === 0;
  if (aZero !== bZero) {
    return aZero ? 1 : -1;
  }

  return getAssetCode(a).localeCompare(getAssetCode(b));
}

function sortBalances(balances: Balance[], mode: SortMode) {
  if (mode === "balance-desc") {
    return [...balances].sort((a, b) => Number(b.balance) - Number(a.balance));
  }
  if (mode === "alpha") {
    return [...balances].sort((a, b) =>
      getAssetCode(a).localeCompare(getAssetCode(b)),
    );
  }
  return [...balances].sort(compareBalances);
}

const sortLabels: Record<SortMode, string> = {
  default: "Default",
  "balance-desc": "Balance",
  alpha: "A-Z",
};

function AssetRow({
  b,
  onClick,
}: {
  b: Balance;
  onClick?: () => void;
}) {
  const isZeroBalance = Number(b.balance) === 0;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "flex items-center justify-between px-5 py-4 border-b border-line last:border-0",
        isZeroBalance && "opacity-50",
        onClick && "cursor-pointer hover:bg-surface-2 transition-colors",
      )}
    >
      <AssetBadge balance={b} />
      <div className="flex flex-col items-end gap-0.5">
        <span
          className={cn(
            "text-[14px] font-semibold tabular-nums",
            isZeroBalance ? "text-ink-3" : "text-ink",
          )}
        >
          {parseFloat(b.balance).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}
        </span>
        {isZeroBalance && (
          <span className="text-[12px] text-ink-3">No balance</span>
        )}
      </div>
    </div>
  );
}

export interface BalanceListProps {
  onAssetClick?: (balance: Balance) => void;
  detailRef?: React.RefObject<HTMLElement | null>;
}

export function BalanceList({ onAssetClick, detailRef }: BalanceListProps) {
  const { balances, isLoadingAccount, isConnected, network } = useSorokit();
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const isTestnet = network?.name === "testnet";
  const showFriendbot = isTestnet && isConnected && !isLoadingAccount && balances.length === 0;

  const skeletonCount = balances.length > 0 ? balances.length : 3;

  const filtered = search
    ? balances.filter((b) =>
        getAssetCode(b).toLowerCase().includes(search.toLowerCase()),
      )
    : balances;

  const sorted = sortBalances(filtered, sortMode);

  const cycleSort = () => {
    setSortMode((m) =>
      m === "default" ? "balance-desc" : m === "balance-desc" ? "alpha" : "default",
    );
  };

  const handleAssetClick = (b: Balance) => {
    onAssetClick?.(b);
    // Move focus to the detail view if a ref is provided
    requestAnimationFrame(() => {
      detailRef?.current?.focus();
    });
  };

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <h3 className="text-[14px] font-semibold text-ink">Assets</h3>
          <p className="text-[12px] text-ink-3 mt-0.5">Token balances</p>
        </div>
        {isConnected && !isLoadingAccount && (
          <div className="flex items-center gap-2">
            <button
              onClick={cycleSort}
              className="text-[11px] text-ink-3 hover:text-ink-2 transition-colors px-2 py-1 rounded-md hover:bg-surface-2"
              title={`Sort: ${sortLabels[sortMode]}`}
            >
              ↕ {sortLabels[sortMode]}
            </button>
            <Badge variant="default">{balances.length} assets</Badge>
          </div>
        )}
      </div>

      {isConnected && !isLoadingAccount && balances.length > 0 && (
        <div className="px-4 py-2 border-b border-line">
          <Input
            placeholder="Search assets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[12px]"
          />
        </div>
      )}

      {!isConnected ? (
        <p className="text-[13px] text-ink-3 text-center py-10">
          Connect your wallet to view assets
        </p>
      ) : isLoadingAccount ? (
        <div>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <AssetRowSkeleton key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <p className="text-[13px] text-ink-3">
            {search ? "No matching assets" : "No assets found"}
          </p>
          {showFriendbot && !search && (
            <a
              href="https://friendbot.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-brand hover:underline"
            >
              Fund with Friendbot →
            </a>
          )}
        </div>
      ) : (
        <div>
          {sorted.map((b) => (
            <AssetRow
              key={b.asset}
              b={b}
              onClick={onAssetClick ? () => handleAssetClick(b) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
