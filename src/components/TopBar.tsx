import { WalletConnectButton } from "@/components/WalletConnectButton";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { useSorokit } from "@/context/SorokitProvider";
import type { NavSection } from "@/components/Sidebar";

const LABELS: Record<NavSection, string> = {
  wallet: "Wallet",
  account: "Account",
  transactions: "Transactions",
  soroban: "Soroban",
  network: "Network",
};

export function TopBar({ active }: { active: NavSection }) {
  const { error, clearError } = useSorokit();

  return (
    <div className="shrink-0">
      {error && (
        <div className="flex items-center justify-between gap-3 px-5 py-2 bg-[rgba(239,68,68,0.1)] border-b border-[rgba(239,68,68,0.2)]">
          <p className="text-[11px] text-[#ef4444]">{error}</p>
          <button
            onClick={clearError}
            className="text-[#ef4444] opacity-60 hover:opacity-100 shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
      <header className="h-12 flex items-center justify-between px-5 border-b border-[#2a2a2a] bg-[#141414] shrink-0">
        <span className="text-[12px] font-semibold text-[#ebebeb]">
          {LABELS[active]}
        </span>
        <div className="flex items-center gap-2">
          <NetworkSwitcher />
          <WalletConnectButton />
        </div>
      </header>
    </div>
  );
}
