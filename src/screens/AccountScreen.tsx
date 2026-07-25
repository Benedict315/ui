import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

import { AccountCard } from "@/components/AccountCard";
import { BalanceList } from "@/components/BalanceList";
import { ClaimableBalanceCard } from "@/components/ClaimableBalanceCard";
import { Button } from "@/components/ui/Button";
import { useSorokit } from "@/context/useSorokit";

export function AccountScreen() {
  const { isConnected, isLoadingAccount, refreshAccount } = useSorokit();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    if (!lastRefreshed) return;
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  const handleRefresh = async () => {
    await refreshAccount();
    setLastRefreshed(new Date());
    setNow(new Date());
  };

  const getRelativeTime = (date: Date) => {
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "just now";
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min ago`;
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[18px] font-semibold text-ink">Account</h2>
      <p className="text-[13px] text-ink-3 -mt-3">Balances and account details</p>
      {isConnected && (
        <div className="flex flex-col items-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            loading={isLoadingAccount}
            onClick={handleRefresh}
            aria-label="Refresh account data"
          >
            <HugeiconsIcon icon={Refresh01Icon} size={14} strokeWidth={1.5} />
            Refresh
          </Button>
          {lastRefreshed && (
            <span className="text-[11px] text-ink-3 pr-1">
              Last updated: {getRelativeTime(lastRefreshed)}
            </span>
          )}
        </div>
      )}
      <AccountCard />
      <BalanceList />
      <ClaimableBalanceCard />
    </div>
  );
}
