import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { AccountCard } from "@/components/AccountCard";
import { BalanceList } from "@/components/BalanceList";
import { ClaimableBalanceCard } from "@/components/ClaimableBalanceCard";
import { Button } from "@/components/ui/Button";
import { useSorokit } from "@/context/useSorokit";

export function AccountScreen() {
  const { isConnected, isLoadingAccount, refreshAccount } = useSorokit();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function handleRefresh() {
    await refreshAccount();
    setLastUpdated(new Date());
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[18px] font-semibold text-ink">Account</h2>
      <p className="text-[13px] text-ink-3 -mt-3">Balances and account details</p>
      {isConnected && (
        <div className="flex items-center justify-end gap-3">
          {lastUpdated && (
            <span className="text-[12px] text-ink-3">
              Last updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
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
        </div>
      )}
      <AccountCard />
      <BalanceList />
      <ClaimableBalanceCard />
    </div>
  );
}
