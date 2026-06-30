import { AccountCard } from "@/components/AccountCard";
import { BalanceList } from "@/components/BalanceList";
import { ClaimableBalanceCard } from "@/components/ClaimableBalanceCard";
import { Button } from "@/components/ui/Button";
import { useSorokit } from "@/context/useSorokit";
import { SCREEN_LABELS } from "@/lib/nav-labels";

function RefreshIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

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
            <RefreshIcon />
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
