import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { AccountCard } from "@/components/AccountCard";
import { BalanceList } from "@/components/BalanceList";
import { ClaimableBalanceCard } from "@/components/ClaimableBalanceCard";
import { Button } from "@/components/ui/Button";
import { useSorokit } from "@/context/useSorokit";
import { SCREEN_LABELS } from "@/lib/nav-labels";

export function AccountScreen() {
  const { isConnected, isLoadingAccount, refreshAccount } = useSorokit();
  const { title, sub } = SCREEN_LABELS.account;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[15px] font-semibold text-ink leading-none">
          {title}
        </h2>
        <p className="text-[11px] text-ink-3 mt-0.5">{sub}</p>
      </div>
      {isConnected && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            loading={isLoadingAccount}
            onClick={refreshAccount}
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
