import { AssetBadge } from "@/components/AssetBadge";
import { Badge } from "@/components/ui/Badge";
import { AssetRowSkeleton } from "@/components/ui/Skeleton";
import { useSorokit } from "@/context/useSorokit";
import type { Balance } from "@/lib/client";
import { cn } from "@/lib/utils";

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

function AssetRow({ b }: { b: Balance }) {
  const isZeroBalance = Number(b.balance) === 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-4 border-b border-line last:border-0",
        isZeroBalance && "opacity-50",
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

export function BalanceList() {
  const { balances, isLoadingAccount, isConnected, network } = useSorokit();

  const isTestnet = network?.name === "testnet";
  const showFriendbot = isTestnet && isConnected && !isLoadingAccount && balances.length === 0;

  // Use balance count for skeleton rows so the loading state matches the real list
  const skeletonCount = balances.length > 0 ? balances.length : 3;
  const sorted = [...balances].sort(compareBalances);

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <h3 className="text-[14px] font-semibold text-ink">Assets</h3>
          <p className="text-[12px] text-ink-3 mt-0.5">Token balances</p>
        </div>
        {isConnected && !isLoadingAccount && (
          <Badge variant="default">{balances.length} assets</Badge>
        )}
      </div>

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
      ) : balances.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <p className="text-[13px] text-ink-3">
            No assets found
          </p>
          {showFriendbot && (
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
            <AssetRow key={b.asset} b={b} />
          ))}
        </div>
      )}
    </div>
  );
}
